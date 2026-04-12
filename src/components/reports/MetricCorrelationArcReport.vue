<template>
  <div class="highcharts-figure">
    <div class="chart-canvas" ref="chartContainer"></div>

    <div class="insight-grid">
      <div class="insight-card green">
        <span class="insight-label">Сильнейшая связь</span>
        <span class="insight-value">{{ strongestLink.from }} → {{ strongestLink.to }}</span>
        <span class="insight-meta">Коэффициент корреляции {{ strongestLink.weight }}</span>
      </div>

      <div class="insight-card yellow">
        <span class="insight-label">Центральная метрика</span>
        <span class="insight-value">{{ hubMetric.name }}</span>
        <span class="insight-meta">{{ hubMetric.count }} связей с другими метриками</span>
      </div>

      <div class="insight-card redred">
        <span class="insight-label">Слабейшая связь</span>
        <span class="insight-value">{{ weakestLink.from }} → {{ weakestLink.to }}</span>
        <span class="insight-meta">Коэффициент корреляции {{ weakestLink.weight }}</span>
      </div>
    </div>

    <p class="highcharts-description">
      Arc Diagram показывает корреляции между ключевыми HR-метриками на основе
      GetHappyIndexReport и GetMetricsRespondentGroups. Толщина дуги соответствует
      силе корреляции. Размер узла отражает суммарную связанность метрики.
    </p>

    <div v-if="renderError" class="render-error">
      <p>Ошибка при отображении графика</p>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import Highcharts from 'highcharts'

const chartContainer = ref(null)
const renderError = ref(false)
let chartInstance = null
let resizeHandler = null
let intersectionObserver = null
let highchartsModulesReady = false

const initHighchartsModule = (module) => {
  const initializer = typeof module === 'function' ? module : module?.default
  if (typeof initializer === 'function') {
    initializer(Highcharts)
  }
}

const ensureHighchartsModules = async () => {
  if (highchartsModulesReady) return

  if (typeof window !== 'undefined') {
    window.Highcharts = Highcharts
    window._Highcharts = Highcharts
  }

  const [SankeyModule, ArcDiagramModule, AccessibilityModule] = await Promise.all([
    import('highcharts/modules/sankey.js'),
    import('highcharts/modules/arc-diagram.js'),
    import('highcharts/modules/accessibility.js')
  ])

  initHighchartsModule(SankeyModule)
  initHighchartsModule(ArcDiagramModule)
  initHighchartsModule(AccessibilityModule)

  highchartsModulesReady = true
}

// ─── Correlation data ─────────────────────────────────────────────────────────
// [from, to, weight]   weight = сила корреляции × 10 (целое число для linkWeight)
const correlationLinks = [
  // happyIndex ↔ все
  ['Happy Index',      'Вовлечённость',   9],
  ['Happy Index',      'Лояльность',      8],
  ['Happy Index',      'eNPS',            8],
  ['Happy Index',      'Признание',       7],
  ['Happy Index',      'Баланс',          7],
  ['Happy Index',      'Рост и развитие', 6],
  // вовлечённость
  ['Вовлечённость',    'Лояльность',      9],
  ['Вовлечённость',    'eNPS',            7],
  ['Вовлечённость',    'Признание',       8],
  ['Вовлечённость',    'Рост и развитие', 7],
  ['Вовлечённость',    'Управление',      7],
  ['Вовлечённость',    'Баланс',          6],
  // лояльность
  ['Лояльность',       'eNPS',            9],
  ['Лояльность',       'Признание',       7],
  ['Лояльность',       'Управление',      6],
  ['Лояльность',       'Баланс',          5],
  // eNPS
  ['eNPS',             'Признание',       6],
  ['eNPS',             'Рост и развитие', 6],
  ['eNPS',             'Управление',      5],
  // прочие
  ['Признание',        'Рост и развитие', 8],
  ['Признание',        'Управление',      7],
  ['Рост и развитие',  'Управление',      7],
  ['Рост и развитие',  'Баланс',          6],
  ['Управление',       'Баланс',          6],
  ['Управление',       'Психологический климат', 7],
  ['Баланс',           'Психологический климат', 8],
  ['Психологический климат', 'Лояльность', 6],
  ['Психологический климат', 'Вовлечённость', 7]
]

// ─── Insights ────────────────────────────────────────────────────────────────
const strongestLink = computed(() =>
  [...correlationLinks].sort((a, b) => b[2] - a[2])
    .map(([from, to, weight]) => ({ from, to, weight: (weight / 10).toFixed(1) }))[0]
)

const weakestLink = computed(() =>
  [...correlationLinks].sort((a, b) => a[2] - b[2])
    .map(([from, to, weight]) => ({ from, to, weight: (weight / 10).toFixed(1) }))[0]
)

const hubMetric = computed(() => {
  const counts = {}
  for (const [from, to] of correlationLinks) {
    counts[from] = (counts[from] || 0) + 1
    counts[to] = (counts[to] || 0) + 1
  }
  const [name, count] = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]
  return { name, count }
})

const metricNodes = computed(() => {
  const strengthByNode = {}

  for (const [from, to, weight] of correlationLinks) {
    strengthByNode[from] = (strengthByNode[from] || 0) + weight
    strengthByNode[to] = (strengthByNode[to] || 0) + weight
  }

  const strengths = Object.values(strengthByNode)
  const minStrength = Math.min(...strengths)
  const maxStrength = Math.max(...strengths)
  const minRadius = 7
  const maxRadius = 18

  const radiusFromStrength = (strength) => {
    if (maxStrength === minStrength) return minRadius
    const ratio = (strength - minStrength) / (maxStrength - minStrength)
    return Number((minRadius + ratio * (maxRadius - minRadius)).toFixed(1))
  }

  return Object.entries(strengthByNode).map(([id, strength]) => ({
    id,
    marker: {
      radius: radiusFromStrength(strength)
    }
  }))
})

// ─── Chart options ────────────────────────────────────────────────────────────
const chartOptions = computed(() => ({
  chart: {
    height: 640,
    backgroundColor: 'transparent',
    marginBottom: 120
  },
  title: {
    text: 'Корреляции между HR-метриками',
    style: { color: '#000000', fontSize: '18px', fontWeight: '700' }
  },
  subtitle: {
    text: 'Толщина дуги = сила корреляции · Источник: GetHappyIndexReport + GetMetricsRespondentGroups',
    style: { color: '#444444', fontSize: '12px' }
  },
  accessibility: {
    enabled: true,
    description: 'Arc Diagram корреляций HR-метрик.',
    point: {
      valueDescriptionFormat: 'Связь от {point.from} к {point.to}.'
    }
  },
  series: [
    {
      keys: ['from', 'to', 'weight'],
      type: 'arcdiagram',
      name: 'Корреляция',
      linkWeight: 1,
      centeredLinks: true,
      equalNodes: false,
      offset: '65%',
      nodes: metricNodes.value,
      dataLabels: {
        rotation: 90,
        y: 28,
        verticalAlign: 'top',
        color: '#000000',
        padding: 0,
        style: {
          fontSize: '11px',
          fontWeight: '500',
          textOutline: 'none'
        }
      },
      data: correlationLinks.map(([from, to, weight]) => ({
        from,
        to,
        weight,
        linkWeight: 4 + (weight - 5) * 1.2
      }))
    }
  ],
  tooltip: {
    useHTML: true,
    backgroundColor: '#ffffff',
    borderColor: '#d2d2d2',
    style: { color: '#000000' },
    formatter() {
      if (this.point.isNode) {
        const links = correlationLinks.filter(
          ([f, t]) => f === this.point.id || t === this.point.id
        ).length
        return `<b>${this.point.id}</b><br/>Связей: <b>${links}</b>`
      }
      const w = (this.point.weight / 10).toFixed(1)
      return `<b>${this.point.from}</b> → <b>${this.point.to}</b><br/>Корреляция: <b>${w}</b>`
    }
  },
  credits: { enabled: false },
  exporting: { enabled: true }
}))

// ─── Init / lifecycle ─────────────────────────────────────────────────────────
const initChart = async () => {
  await nextTick()

  if (!chartContainer.value || chartContainer.value.offsetWidth === 0) return

  try {
    await ensureHighchartsModules()

    if (chartInstance) {
      chartInstance.destroy()
    }

    chartInstance = Highcharts.chart(chartContainer.value, chartOptions.value)
    requestAnimationFrame(() => {
      chartInstance?.reflow()
    })
    renderError.value = false
  } catch (error) {
    console.error('Error rendering arc diagram chart:', error)
    renderError.value = true
  }
}

onMounted(() => {
  resizeHandler = () => {
    if (chartInstance) {
      chartInstance.reflow()
    }
  }
  window.addEventListener('resize', resizeHandler)

  intersectionObserver = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && !chartInstance) {
        initChart()
      }
    },
    { threshold: 0.15 }
  )

  if (chartContainer.value) {
    intersectionObserver.observe(chartContainer.value)
  }
})

onBeforeUnmount(() => {
  if (intersectionObserver) {
    intersectionObserver.disconnect()
    intersectionObserver = null
  }

  if (resizeHandler) {
    window.removeEventListener('resize', resizeHandler)
    resizeHandler = null
  }

  if (chartInstance) {
    chartInstance.destroy()
    chartInstance = null
  }
})
</script>

<style scoped>
.highcharts-figure {
  width: 100%;
  min-height: 840px;
  padding: 20px;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.chart-canvas {
  width: 100%;
  min-height: 640px;
}

.insight-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-top: 14px;
}

.insight-card {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 14px;
  border-radius: 14px;
  color: #000000;
}

.green   { background-color: #b7d2a5; }
.yellow  { background-color: #fde993; }
.redred  { background-color: #f7a8a1; }

.insight-label {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #555555;
}

.insight-value {
  font-size: 15px;
  font-weight: 700;
}

.insight-meta {
  font-size: 12px;
  color: #444444;
}

.highcharts-description {
  margin: 14px 0 0;
  color: #000000;
  font-size: 13px;
  line-height: 1.45;
}

.render-error {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 80px;
  margin-top: 16px;
  color: #c0392b;
  font-size: 13px;
}
</style>

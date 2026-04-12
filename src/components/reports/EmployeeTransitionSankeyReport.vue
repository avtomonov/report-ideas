<template>
  <div class="highcharts-figure">
    <div class="chart-canvas" ref="chartContainer"></div>

    <div class="kpi-row">
      <div class="kpi-card orange">
        <span class="kpi-label">Лучшая AI-интервенция</span>
        <span class="kpi-value">{{ strongestIntervention.name }}</span>
        <span class="kpi-meta">Переводит {{ strongestIntervention.flow }} сотрудников</span>
      </div>

      <div class="kpi-card light-green">
        <span class="kpi-label">Стабилизируется за 90 дней</span>
        <span class="kpi-value">{{ stabilizedEmployees }}</span>
        <span class="kpi-meta">после персонализированных сценариев</span>
      </div>

      <div class="kpi-card gray">
        <span class="kpi-label">Прогнозируемая конверсия</span>
        <span class="kpi-value">{{ conversionRate }}%</span>
        <span class="kpi-meta">из риска в устойчивое состояние</span>
      </div>
    </div>

    <p class="highcharts-description">
      Логика построена вокруг MetricPrediction.GetFactors, MetricPrediction.GetMetricsPrediction
      и блока Recommendations: отчет показывает, как нейросеть предлагает переводить сотрудников
      из перегретых и нестабильных состояний в устойчивые через конкретные интервенции.
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
let highchartsModulesReady = false

const initHighchartsModule = (module) => {
  const initializer = typeof module === 'function' ? module : module?.default

  if (typeof initializer === 'function') {
    initializer(Highcharts)
  }
}

const ensureHighchartsModules = async () => {
  if (highchartsModulesReady) {
    return
  }

  if (typeof window !== 'undefined') {
    window.Highcharts = Highcharts
    window._Highcharts = Highcharts
  }

  const [
    ExportingModule,
    ExportDataModule,
    AccessibilityModule,
    SankeyModule
  ] = await Promise.all([
    import('highcharts/modules/exporting.js'),
    import('highcharts/modules/export-data.js'),
    import('highcharts/modules/accessibility.js'),
    import('highcharts/modules/sankey.js')
  ])

  initHighchartsModule(ExportingModule)
  initHighchartsModule(ExportDataModule)
  initHighchartsModule(AccessibilityModule)
  initHighchartsModule(SankeyModule)

  highchartsModulesReady = true
}

const sankeyLinks = [
  ['Перегреты', 'Перенастройка нагрузки', 84],
  ['Перегреты', 'Ритуалы обратной связи', 26],
  ['Нестабильны', 'Карьерный маршрут', 59],
  ['Нестабильны', 'Ритуалы обратной связи', 47],
  ['Опора команды', 'Ритуалы признания', 52],
  ['Опора команды', 'Карьерный маршрут', 21],
  ['Перенастройка нагрузки', 'Стабилизируются', 71],
  ['Перенастройка нагрузки', 'Зона наблюдения', 13],
  ['Ритуалы обратной связи', 'Растут в лояльность', 54],
  ['Ритуалы обратной связи', 'Стабилизируются', 19],
  ['Карьерный маршрут', 'Растут в лояльность', 63],
  ['Карьерный маршрут', 'Стабилизируются', 17],
  ['Ритуалы признания', 'Сохраняют устойчивость', 52],
  ['Ритуалы признания', 'Растут в лояльность', 11]
]

const sankeyData = computed(() => {
  return sankeyLinks.map(([from, to, weight]) => ({ from, to, weight }))
})

const nodes = [
  { id: 'Перегреты', name: 'Перегреты', color: '#f7a8a1', column: 0 },
  { id: 'Нестабильны', name: 'Нестабильны', color: '#ffc184', column: 0 },
  { id: 'Опора команды', name: 'Опора команды', color: '#b7d2a5', column: 0 },
  { id: 'Перенастройка нагрузки', name: 'Перенастройка нагрузки', color: '#fde993', column: 1 },
  { id: 'Ритуалы обратной связи', name: 'Ритуалы обратной связи', color: '#d5e88c', column: 1 },
  { id: 'Карьерный маршрут', name: 'Карьерный маршрут', color: '#d2d2d2', column: 1 },
  { id: 'Ритуалы признания', name: 'Ритуалы признания', color: '#b7d2a5', column: 1 },
  { id: 'Стабилизируются', name: 'Стабилизируются', color: '#d5e88c', column: 2 },
  { id: 'Зона наблюдения', name: 'Зона наблюдения', color: '#ffc184', column: 2 },
  { id: 'Растут в лояльность', name: 'Растут в лояльность', color: '#b7d2a5', column: 2 },
  { id: 'Сохраняют устойчивость', name: 'Сохраняют устойчивость', color: '#d2d2d2', column: 2 }
]

const interventionTotals = computed(() => {
  const targets = ['Перенастройка нагрузки', 'Ритуалы обратной связи', 'Карьерный маршрут', 'Ритуалы признания']

  return targets.map((name) => ({
    name,
    flow: sankeyLinks
      .filter((link) => link[1] === name)
      .reduce((sum, link) => sum + link[2], 0)
  }))
})

const strongestIntervention = computed(() => {
  return interventionTotals.value.sort((left, right) => right.flow - left.flow)[0]
})

const stabilizedEmployees = computed(() => {
  return sankeyLinks
    .filter((link) => ['Стабилизируются', 'Растут в лояльность', 'Сохраняют устойчивость'].includes(link[1]))
    .reduce((sum, link) => sum + link[2], 0)
})

const riskPool = computed(() => {
  return sankeyLinks
    .filter((link) => ['Перегреты', 'Нестабильны'].includes(link[0]))
    .reduce((sum, link) => sum + link[2], 0)
})

const conversionRate = computed(() => {
  const converted = sankeyLinks
    .filter((link) => ['Стабилизируются', 'Растут в лояльность'].includes(link[1]))
    .reduce((sum, link) => sum + link[2], 0)

  return Math.round((converted / riskPool.value) * 100)
})

const chartOptions = computed(() => ({
  chart: {
    height: 580,
    backgroundColor: 'transparent',
    spacingLeft: 8,
    spacingRight: 8,
    spacingTop: 24,
    spacingBottom: 12
  },
  title: {
    text: 'Прогноз переходов сотрудников под AI-интервенциями',
    style: { color: '#000000', fontSize: '18px', fontWeight: '700' }
  },
  subtitle: {
    text: 'Поток от текущего состояния к ожидаемому через рекомендованные действия',
    style: { color: '#000000', fontSize: '12px' }
  },
  tooltip: {
    useHTML: true,
    backgroundColor: '#ffffff',
    borderColor: '#d2d2d2',
    style: { color: '#000000' },
    pointFormatter() {
      return `${this.fromNode.name} → <b>${this.toNode.name}</b><br/>Сотрудников: <b>${this.weight}</b>`
    }
  },
  credits: { enabled: false },
  accessibility: {
    enabled: true,
    description: 'Sankey-диаграмма перехода сотрудников между состояниями под влиянием AI-интервенций'
  },
  exporting: { enabled: true },
  series: [
    {
      name: 'Переход сотрудников',
      type: 'sankey',
      data: sankeyData.value,
      nodes,
      dataLabels: {
        enabled: true,
        nodeFormatter() {
          return this.point.name
        },
        style: {
          color: '#000000',
          fontSize: '12px',
          fontWeight: '700',
          textOutline: 'none'
        }
      },
      nodeWidth: 24,
      nodePadding: 18,
      minLinkWidth: 8,
      curveFactor: 0.45,
      linkOpacity: 0.45,
      states: {
        inactive: {
          opacity: 0.2
        }
      }
    }
  ]
}))

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
    console.error('Error rendering chart:', error)
    renderError.value = true
  }
}

const safeInitChart = () => {
  let retries = 0
  const maxRetries = 8

  const attempt = () => {
    if (retries >= maxRetries) {
      renderError.value = true
      return
    }

    if (
      chartContainer.value
      && chartContainer.value.offsetParent !== null
      && chartContainer.value.offsetWidth > 0
      && chartContainer.value.offsetHeight > 0
    ) {
      initChart()
    } else {
      retries += 1
      requestAnimationFrame(attempt)
    }
  }

  attempt()
}

onMounted(() => {
  safeInitChart()

  resizeHandler = () => {
    if (chartInstance) {
      chartInstance.reflow()
    } else {
      safeInitChart()
    }
  }

  window.addEventListener('resize', resizeHandler)
})

onBeforeUnmount(() => {
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
  min-height: 790px;
  padding: 20px;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.chart-canvas {
  width: 100%;
  min-height: 580px;
}

.kpi-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-top: 14px;
}

.kpi-card {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 14px;
  border-radius: 14px;
  color: #000000;
}

.kpi-label {
  font-size: 12px;
}

.kpi-value {
  font-size: 16px;
  font-weight: 700;
}

.kpi-meta {
  font-size: 12px;
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
  width: 100%;
  min-height: 580px;
  background-color: #f5f5f5;
  border-radius: 4px;
  color: #d32f2f;
  font-size: 14px;
}

.orange {
  background-color: #ffc184;
}

.light-green {
  background-color: #d5e88c;
}

.gray {
  background-color: #d2d2d2;
}

@media (max-width: 900px) {
  .kpi-row {
    grid-template-columns: 1fr;
  }
}
</style>
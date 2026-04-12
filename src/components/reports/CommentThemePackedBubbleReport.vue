<template>
  <div class="highcharts-figure">
    <div class="chart-canvas" ref="chartContainer"></div>

    <div class="insight-grid">
      <div class="insight-card redred">
        <span class="insight-label">Самая упоминаемая категория</span>
        <span class="insight-value">{{ hotSeries.name }}</span>
        <span class="insight-meta">{{ hotSeries.total }} упоминаний суммарно</span>
      </div>

      <div class="insight-card yellow">
        <span class="insight-label">Самая горячая тема</span>
        <span class="insight-value">{{ hotBubble.name }}</span>
        <span class="insight-meta">{{ hotBubble.value }} упоминаний · «{{ hotBubble.series }}»</span>
      </div>

      <div class="insight-card green">
        <span class="insight-label">Всего тем зафиксировано</span>
        <span class="insight-value">{{ totalTopics }}</span>
        <span class="insight-meta">в {{ seriesData.length }} категориях</span>
      </div>
    </div>

    <p class="highcharts-description">
      Packed Bubble визуализирует темы из GetCommentsSummarization: каждый пузырь — отдельная тема,
      размер пузыря отражает частоту упоминания, цветовые группы — смысловые категории.
      Пузыри одной категории притягиваются друг к другу.
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

  const [HighchartsMoreModule, ExportingModule, AccessibilityModule] = await Promise.all([
    import('highcharts/highcharts-more.js'),
    import('highcharts/modules/exporting.js'),
    import('highcharts/modules/accessibility.js')
  ])

  initHighchartsModule(HighchartsMoreModule)
  initHighchartsModule(ExportingModule)
  initHighchartsModule(AccessibilityModule)

  highchartsModulesReady = true
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const seriesData = [
  {
    name: 'Условия работы',
    color: '#f7a8a1',
    data: [
      { name: 'Офисная среда',          value: 148 },
      { name: 'Шум и опенспейс',        value: 112 },
      { name: 'Удалённый формат',        value: 203 },
      { name: 'Баланс работа-дом',       value: 186 },
      { name: 'Техника и ПО',            value: 95  },
      { name: 'Зоны отдыха',             value: 67  }
    ]
  },
  {
    name: 'Руководство',
    color: '#ffc184',
    data: [
      { name: 'Микроменеджмент',         value: 241 },
      { name: 'Делегирование',           value: 134 },
      { name: 'Обратная связь',          value: 178 },
      { name: 'Доступность руководителя',value: 109 },
      { name: '1-on-1 встречи',          value: 87  },
      { name: 'Поддержка в кризисах',    value: 76  }
    ]
  },
  {
    name: 'Развитие и карьера',
    color: '#d5e88c',
    data: [
      { name: 'Прозрачность грейдов',    value: 219 },
      { name: 'Внутренние тренинги',     value: 143 },
      { name: 'Внешние курсы',           value: 98  },
      { name: 'Горизонтальный рост',     value: 117 },
      { name: 'Онбординг',              value: 82  },
      { name: 'Признание заслуг',        value: 164 }
    ]
  },
  {
    name: 'Корпоративная культура',
    color: '#b7d2a5',
    data: [
      { name: 'Командный дух',           value: 155 },
      { name: 'Ценности vs реальность',  value: 192 },
      { name: 'Совместные активности',   value: 74  },
      { name: 'Равные возможности',      value: 128 },
      { name: 'Уважение к мнению',       value: 147 }
    ]
  },
  {
    name: 'Процессы и операции',
    color: '#fde993',
    data: [
      { name: 'Бюрократия',              value: 234 },
      { name: 'Согласования',            value: 189 },
      { name: 'Информированность',       value: 143 },
      { name: 'KPI и метрики',           value: 112 },
      { name: 'Кросс-командные связи',   value: 96  }
    ]
  },
  {
    name: 'Благополучие',
    color: '#d2d2d2',
    data: [
      { name: 'Уровень стресса',         value: 271 },
      { name: 'Токсичность',             value: 158 },
      { name: 'ДМС и страховка',         value: 94  },
      { name: 'Спорт и фитнес',          value: 71  },
      { name: 'Питание',                 value: 58  },
      { name: 'Компенсация транспорта',  value: 49  }
    ]
  }
]

// ─── Computed insights ────────────────────────────────────────────────────────
const hotSeries = computed(() => {
  return [...seriesData]
    .map(s => ({ name: s.name, total: s.data.reduce((acc, d) => acc + d.value, 0) }))
    .sort((a, b) => b.total - a.total)[0]
})

const hotBubble = computed(() => {
  let best = null
  for (const s of seriesData) {
    for (const d of s.data) {
      if (!best || d.value > best.value) {
        best = { ...d, series: s.name }
      }
    }
  }
  return best
})

const totalTopics = computed(() =>
  seriesData.reduce((acc, s) => acc + s.data.length, 0)
)

// ─── Chart options ────────────────────────────────────────────────────────────
const chartOptions = computed(() => ({
  chart: {
    type: 'packedbubble',
    height: 620,
    backgroundColor: 'transparent'
  },
  title: {
    text: 'Темы комментариев сотрудников',
    align: 'left',
    style: { color: '#000000', fontSize: '18px', fontWeight: '700' }
  },
  subtitle: {
    text: 'Размер пузыря = частота упоминания · Группы = смысловые категории',
    align: 'left',
    style: { color: '#444444', fontSize: '12px' }
  },
  tooltip: {
    useHTML: true,
    backgroundColor: '#ffffff',
    borderColor: '#d2d2d2',
    style: { color: '#000000' },
    pointFormat: '<b>{point.name}</b><br/>Упоминаний: <b>{point.value}</b>'
  },
  plotOptions: {
    packedbubble: {
      minSize: '15%',
      maxSize: '90%',
      zMin: 0,
      zMax: 300,
      parentNodeOptions: {
        markerOptions: {
          fillOpacity: 0.18,
          lineWidth: 2.5,
          lineColor: 'inherit',
          states: {
            hover: { fillOpacity: 0.28 }
          }
        }
      },
      layoutAlgorithm: {
        gravitationalConstant: 0.05,
        splitSeries: true,
        seriesInteraction: false,
        dragBetweenSeries: false,
        parentNodeLimit: true
      },
      dataLabels: {
        enabled: true,
        format: '{point.name}',
        filter: {
          property: 'value',
          operator: '>',
          value: 130
        },
        style: {
          color: '#000000',
          textOutline: 'none',
          fontWeight: '500',
          fontSize: '11px'
        }
      }
    }
  },
  series: seriesData.map(s => ({
    name: s.name,
    color: s.color,
    data: s.data
  })),
  legend: {
    enabled: true,
    itemStyle: { color: '#000000', fontSize: '12px', fontWeight: '500' }
  },
  credits: { enabled: false },
  exporting: { enabled: true },
  accessibility: {
    enabled: true,
    description: 'Packed Bubble диаграмма тем комментариев сотрудников.'
  }
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
    console.error('Error rendering packed bubble chart:', error)
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
      const entry = entries[0]
      if (entry.isIntersecting && !chartInstance) {
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
  min-height: 800px;
  padding: 20px;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.chart-canvas {
  width: 100%;
  min-height: 620px;
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

.redred  { background-color: #f7a8a1; }
.yellow  { background-color: #fde993; }
.green   { background-color: #b7d2a5; }

.insight-label {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #555555;
}

.insight-value {
  font-size: 16px;
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

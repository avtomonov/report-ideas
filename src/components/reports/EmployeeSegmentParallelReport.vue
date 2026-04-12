<template>
  <div class="highcharts-figure">
    <div class="chart-canvas" ref="chartContainer"></div>

    <div class="insight-grid">
      <div class="insight-card redred">
        <span class="insight-label">Самый напряженный профиль</span>
        <span class="insight-value">{{ highestPressureSegment.name }}</span>
        <span class="insight-meta">{{ highestPressureSegment.commentLoad }} комментариев и {{ highestPressureSegment.openTasks }} задач</span>
      </div>

      <div class="insight-card green">
        <span class="insight-label">Самый устойчивый сегмент</span>
        <span class="insight-value">{{ healthiestSegment.name }}</span>
        <span class="insight-meta">Happy Index {{ healthiestSegment.happyIndex }} и рост {{ healthiestSegment.growthForecast }}</span>
      </div>

      <div class="insight-card yellow">
        <span class="insight-label">Лучший прогноз роста</span>
        <span class="insight-value">{{ strongestGrowthSegment.name }}</span>
        <span class="insight-meta">Прогноз {{ strongestGrowthSegment.growthForecast }} п.п.</span>
      </div>
    </div>

    <p class="highcharts-description">
      Параллельные координаты собирают в один профиль данные из GetHappyIndexReport,
      GetMetricsRespondentGroups, GetCommentsSummarization, GetTasksNumberReport и MetricPrediction.GetMetricsPrediction.
      Каждая линия показывает, как конкретный сегмент сотрудников проходит через удовлетворенность, лояльность,
      давление комментариев и прогноз роста.
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
    ParallelCoordinatesModule,
    ExportingModule,
    AccessibilityModule
  ] = await Promise.all([
    import('highcharts/modules/parallel-coordinates.js'),
    import('highcharts/modules/exporting.js'),
    import('highcharts/modules/accessibility.js')
  ])

  initHighchartsModule(ParallelCoordinatesModule)
  initHighchartsModule(ExportingModule)
  initHighchartsModule(AccessibilityModule)

  highchartsModulesReady = true
}

const segmentProfiles = [
  {
    name: 'Новые сотрудники',
    happyIndex: 67,
    engagement: 71,
    loyalty: 64,
    enps: 18,
    commentLoad: 42,
    openTasks: 14,
    growthForecast: 6,
    color: 'rgba(247, 168, 161, 0.52)'
  },
  {
    name: 'Линейные руководители',
    happyIndex: 72,
    engagement: 76,
    loyalty: 69,
    enps: 24,
    commentLoad: 28,
    openTasks: 19,
    growthForecast: 4,
    color: 'rgba(255, 193, 132, 0.52)'
  },
  {
    name: 'Высокопотенциальные',
    happyIndex: 79,
    engagement: 83,
    loyalty: 78,
    enps: 37,
    commentLoad: 17,
    openTasks: 9,
    growthForecast: 9,
    color: 'rgba(213, 232, 140, 0.58)'
  },
  {
    name: 'Удаленные команды',
    happyIndex: 64,
    engagement: 68,
    loyalty: 62,
    enps: 11,
    commentLoad: 47,
    openTasks: 16,
    growthForecast: 3,
    color: 'rgba(183, 210, 165, 0.56)'
  },
  {
    name: 'Сервисные подразделения',
    happyIndex: 61,
    engagement: 66,
    loyalty: 58,
    enps: 7,
    commentLoad: 53,
    openTasks: 21,
    growthForecast: 2,
    color: 'rgba(253, 233, 147, 0.58)'
  },
  {
    name: 'Офисные эксперты',
    happyIndex: 75,
    engagement: 78,
    loyalty: 74,
    enps: 29,
    commentLoad: 22,
    openTasks: 11,
    growthForecast: 7,
    color: 'rgba(210, 210, 210, 0.72)'
  }
]

const highestPressureSegment = computed(() => {
  return [...segmentProfiles].sort((left, right) => {
    return (right.commentLoad + right.openTasks) - (left.commentLoad + left.openTasks)
  })[0]
})

const healthiestSegment = computed(() => {
  return [...segmentProfiles].sort((left, right) => {
    return (right.happyIndex + right.engagement + right.loyalty) - (left.happyIndex + left.engagement + left.loyalty)
  })[0]
})

const strongestGrowthSegment = computed(() => {
  return [...segmentProfiles].sort((left, right) => right.growthForecast - left.growthForecast)[0]
})

const chartOptions = computed(() => ({
  chart: {
    type: 'spline',
    parallelCoordinates: true,
    parallelAxes: {
      lineWidth: 2,
      labels: {
        style: {
          color: '#000000',
          fontSize: '11px'
        }
      }
    },
    height: 620,
    backgroundColor: 'transparent'
  },
  title: {
    text: 'Параллельные профили сегментов сотрудников',
    style: { color: '#000000', fontSize: '18px', fontWeight: '700' }
  },
  subtitle: {
    text: 'Один профиль = один сегмент, чтобы быстро увидеть пересечение рисков, лояльности и action plan нагрузки',
    style: { color: '#000000', fontSize: '12px' }
  },
  xAxis: {
    categories: [
      'Happy Index',
      'Вовлеченность',
      'Лояльность',
      'eNPS',
      'Комментарии',
      'Открытые задачи',
      'Прогноз роста'
    ],
    offset: 10,
    labels: {
      style: {
        color: '#000000',
        fontSize: '11px',
        fontWeight: '700'
      }
    },
    lineColor: '#000000',
    tickColor: '#000000'
  },
  yAxis: [
    {
      min: 55,
      max: 85,
      title: { text: '' },
      gridLineColor: '#d2d2d2',
      labels: { format: '{value}%', style: { color: '#000000' } }
    },
    {
      min: 60,
      max: 90,
      title: { text: '' },
      gridLineColor: '#d2d2d2',
      labels: { format: '{value}%', style: { color: '#000000' } }
    },
    {
      min: 55,
      max: 85,
      title: { text: '' },
      gridLineColor: '#d2d2d2',
      labels: { format: '{value}%', style: { color: '#000000' } }
    },
    {
      min: 0,
      max: 40,
      title: { text: '' },
      gridLineColor: '#d2d2d2',
      labels: { format: '{value}', style: { color: '#000000' } }
    },
    {
      min: 10,
      max: 60,
      title: { text: '' },
      gridLineColor: '#d2d2d2',
      labels: { format: '{value}', style: { color: '#000000' } }
    },
    {
      min: 5,
      max: 24,
      title: { text: '' },
      gridLineColor: '#d2d2d2',
      labels: { format: '{value}', style: { color: '#000000' } }
    },
    {
      min: 0,
      max: 10,
      title: { text: '' },
      gridLineColor: '#d2d2d2',
      labels: { format: '{value} п.п.', style: { color: '#000000' } }
    }
  ],
  legend: {
    enabled: true,
    align: 'center',
    verticalAlign: 'bottom',
    itemStyle: { color: '#000000', fontWeight: '600' },
    itemHoverStyle: { color: '#000000' }
  },
  lang: {
    accessibility: {
      axis: {
        yAxisDescriptionPlural: 'На графике 7 осей: Happy Index, вовлеченность, лояльность, eNPS, комментарии, открытые задачи и прогноз роста.'
      }
    }
  },
  plotOptions: {
    series: {
      accessibility: {
        enabled: false
      },
      animation: false,
      marker: {
        enabled: false,
        states: {
          hover: {
            enabled: false
          }
        }
      },
      lineWidth: 2.5,
      states: {
        inactive: {
          enabled: false
        },
        hover: {
          lineWidthPlus: 0,
          halo: {
            size: 0
          }
        }
      },
      events: {
        mouseOver: function () {
          this.group.toFront()
        }
      }
    }
  },
  tooltip: {
    followPointer: true,
    useHTML: true,
    backgroundColor: '#ffffff',
    borderColor: '#d2d2d2',
    style: { color: '#000000' },
    pointFormatter() {
      return `<span style="color:${this.color}">●</span> ${this.series.name}: <b>${this.formattedValue}</b><br/>`
    }
  },
  credits: { enabled: false },
  accessibility: {
    enabled: true,
    description: 'Parallel coordinates график профилей сегментов сотрудников.'
  },
  exporting: { enabled: true },
  series: segmentProfiles.map((segment) => ({
    name: segment.name,
    color: segment.color,
    data: [
      segment.happyIndex,
      segment.engagement,
      segment.loyalty,
      segment.enps,
      segment.commentLoad,
      segment.openTasks,
      segment.growthForecast
    ]
  }))
}))

const initChart = async () => {
  await nextTick()

  if (!chartContainer.value || chartContainer.value.offsetWidth === 0) {
    return
  }

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
  min-height: 840px;
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

.insight-label {
  font-size: 12px;
}

.insight-value {
  font-size: 16px;
  font-weight: 700;
}

.insight-meta {
  font-size: 12px;
}

.orange {
  background-color: #ffc184;
}

.redred {
  background-color: #f7a8a1;
}

.light-green {
  background-color: #d5e88c;
}

.green {
  background-color: #b7d2a5;
}

.yellow {
  background-color: #fde993;
}

.gray {
  background-color: #d2d2d2;
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
  border-radius: 8px;
  background: rgba(247, 168, 161, 0.18);
  color: #000000;
  font-weight: 600;
}

@media (max-width: 900px) {
  .highcharts-figure {
    min-height: 980px;
  }

  .insight-grid {
    grid-template-columns: 1fr;
  }
}
</style>
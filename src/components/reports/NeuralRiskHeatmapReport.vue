<template>
  <div class="highcharts-figure">
    <div class="chart-canvas" ref="chartContainer"></div>

    <div class="insight-grid">
      <div class="insight-card orange">
        <span class="insight-label">Сегмент с самым высоким риском</span>
        <span class="insight-value">{{ highestRiskSignal.segment }}</span>
        <span class="insight-meta">{{ highestRiskSignal.risk }}: {{ highestRiskSignal.value }}%</span>
      </div>

      <div class="insight-card redred">
        <span class="insight-label">Ключевой риск модели</span>
        <span class="insight-value">{{ dominantRisk.name }}</span>
        <span class="insight-meta">Средний прогноз: {{ dominantRisk.average }}%</span>
      </div>

      <div class="insight-card light-green">
        <span class="insight-label">Средняя уверенность прогноза</span>
        <span class="insight-value">{{ averageConfidence }}%</span>
        <span class="insight-meta">Основано на MetricPrediction + respondent groups</span>
      </div>
    </div>

    <p class="highcharts-description">
      Нейросетевой слой собирает сигнал из MetricPrediction.GetMetricsPrediction,
      MetricPrediction.IsPredictionPossible и GetMetricsRespondentGroups,
      чтобы заранее показать, где вырастет риск выгорания, ухода и снижения вовлеченности.
    </p>

    <div v-if="renderError" class="render-error">
      <p>Ошибка при отображении графика</p>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import Highcharts from 'highcharts'

const chartContainer = ref(null)
const renderError = ref(false)
let chartInstance = null
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
    HeatmapModule
  ] = await Promise.all([
    import('highcharts/modules/exporting.js'),
    import('highcharts/modules/export-data.js'),
    import('highcharts/modules/accessibility.js'),
    import('highcharts/modules/heatmap.js')
  ])

  initHighchartsModule(ExportingModule)
  initHighchartsModule(ExportDataModule)
  initHighchartsModule(AccessibilityModule)
  initHighchartsModule(HeatmapModule)

  highchartsModulesReady = true
}

const riskCategories = ['Риск выгорания', 'Риск ухода', 'Падение вовлеченности', 'Тихое молчание']

const segments = [
  { name: 'Новые сотрудники', values: [68, 54, 49, 61], confidence: 83 },
  { name: 'Линейные руководители', values: [73, 47, 58, 44], confidence: 79 },
  { name: 'Высокопотенциальные', values: [52, 64, 46, 38], confidence: 86 },
  { name: 'Удаленные команды', values: [61, 42, 67, 72], confidence: 81 },
  { name: 'Сервисные подразделения', values: [77, 51, 63, 57], confidence: 84 },
  { name: 'Офисные эксперты', values: [48, 39, 41, 53], confidence: 76 }
]

const heatmapData = computed(() => segments.flatMap((segment, segmentIndex) => {
  return segment.values.map((value, riskIndex) => ({
    x: riskIndex,
    y: segmentIndex,
    value,
    confidence: segment.confidence,
    segment: segment.name,
    risk: riskCategories[riskIndex]
  }))
}))

const highestRiskSignal = computed(() => {
  return heatmapData.value.reduce((maxSignal, point) => {
    return point.value > maxSignal.value ? point : maxSignal
  }, heatmapData.value[0])
})

const dominantRisk = computed(() => {
  const averages = riskCategories.map((name, index) => {
    const total = segments.reduce((sum, segment) => sum + segment.values[index], 0)
    return {
      name,
      average: Math.round(total / segments.length)
    }
  })

  return averages.sort((left, right) => right.average - left.average)[0]
})

const averageConfidence = computed(() => {
  const total = segments.reduce((sum, segment) => sum + segment.confidence, 0)
  return Math.round(total / segments.length)
})

const chartOptions = computed(() => ({
  chart: {
    type: 'heatmap',
    height: 520,
    backgroundColor: 'transparent',
    plotBorderWidth: 1,
    plotBorderColor: '#d2d2d2'
  },
  title: {
    text: 'ИИ-прогноз рисков по сегментам сотрудников',
    style: { color: '#000000', fontSize: '18px', fontWeight: '700' }
  },
  subtitle: {
    text: 'Модель показывает, где HR-команде нужно вмешаться до падения метрик',
    style: { color: '#000000', fontSize: '12px' }
  },
  xAxis: {
    categories: riskCategories,
    labels: { style: { color: '#000000', fontSize: '11px' } },
    title: {
      text: 'Прогнозируемые типы риска',
      style: { color: '#000000', fontWeight: '700' }
    }
  },
  yAxis: {
    categories: segments.map((segment) => segment.name),
    labels: { style: { color: '#000000', fontSize: '11px' } },
    title: {
      text: 'Сегменты сотрудников',
      style: { color: '#000000', fontWeight: '700' }
    },
    reversed: true
  },
  colorAxis: {
    min: 35,
    max: 80,
    stops: [
      [0, '#d2d2d2'],
      [0.2, '#b7d2a5'],
      [0.45, '#d5e88c'],
      [0.7, '#fde993'],
      [0.85, '#ffc184'],
      [1, '#f7a8a1']
    ]
  },
  legend: {
    align: 'right',
    layout: 'vertical',
    margin: 0,
    verticalAlign: 'top',
    y: 24,
    itemStyle: { color: '#000000' },
    symbolHeight: 220
  },
  tooltip: {
    useHTML: true,
    backgroundColor: '#ffffff',
    borderColor: '#d2d2d2',
    style: { color: '#000000' },
    formatter() {
      return [
        `<b>${this.point.segment}</b>`,
        `${this.point.risk}: <b>${this.point.value}%</b>`,
        `Уверенность модели: <b>${this.point.confidence}%</b>`
      ].join('<br/>')
    }
  },
  credits: { enabled: false },
  accessibility: {
    enabled: true,
    description: 'Тепловая карта прогноза HR-рисков по сегментам сотрудников'
  },
  exporting: { enabled: true },
  series: [
    {
      name: 'Риск',
      borderWidth: 1,
      borderColor: '#ffffff',
      data: heatmapData.value,
      dataLabels: {
        enabled: true,
        format: '{point.value}%',
        style: {
          color: '#000000',
          fontSize: '11px',
          fontWeight: '700',
          textOutline: 'none'
        }
      }
    }
  ]
}))

const initChart = async () => {
  if (!chartContainer.value) return

  try {
    await ensureHighchartsModules()

    if (chartInstance) {
      chartInstance.destroy()
    }

    chartInstance = Highcharts.chart(chartContainer.value, chartOptions.value)
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

    if (chartContainer.value && chartContainer.value.offsetParent !== null) {
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
})

onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.destroy()
    chartInstance = null
  }
})
</script>

<style scoped>
.highcharts-figure {
  width: 100%;
  min-height: 760px;
  padding: 20px;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.chart-canvas {
  width: 100%;
  min-height: 520px;
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
  border-radius: 14px;
  padding: 14px;
}

.insight-label,
.insight-value,
.insight-meta,
.highcharts-description {
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

.highcharts-description {
  margin: 14px 0 0;
  font-size: 13px;
  line-height: 1.45;
}

.render-error {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 520px;
  background-color: #f5f5f5;
  border-radius: 4px;
  color: #d32f2f;
  font-size: 14px;
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

@media (max-width: 900px) {
  .insight-grid {
    grid-template-columns: 1fr;
  }
}
</style>
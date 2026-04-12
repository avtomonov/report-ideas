<template>
  <div class="highcharts-figure">
    <div class="chart-canvas" ref="chartContainer"></div>
    <p class="highcharts-description">
      Рейтинг важности метрик: чем выше позиция и длиннее столбец, тем сильнее влияние
      метрики на пользовательский опыт.
    </p>
    <div v-if="renderError" class="render-error">
      <p>Ошибка при отображении графика</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import Highcharts from 'highcharts'
import 'highcharts/modules/exporting'
import 'highcharts/modules/export-data'
import 'highcharts/modules/accessibility'

const chartContainer = ref(null)
const renderError = ref(false)
let chartInstance = null

const rawMetricImportance = [
  { metric: 'Качество обратной связи', importance: 94 },
  { metric: 'Понятность целей команды', importance: 91 },
  { metric: 'Прозрачность карьерного роста', importance: 88 },
  { metric: 'Баланс нагрузки', importance: 84 },
  { metric: 'Скорость решения блокеров', importance: 79 },
  { metric: 'Признание достижений', importance: 75 },
  { metric: 'Гибкость графика', importance: 71 },
  { metric: 'Качество внутренних коммуникаций', importance: 67 }
]

const sortedMetrics = computed(() => {
  return [...rawMetricImportance].sort((a, b) => b.importance - a.importance)
})

const getColorByImportance = (value) => {
  if (value >= 90) return '#b7d2a5'
  if (value >= 80) return '#d5e88c'
  if (value >= 74) return '#fde993'
  if (value >= 68) return '#ffc184'
  if (value >= 60) return '#d2d2d2'
  return '#f7a8a1'
}

const chartOptions = computed(() => ({
  chart: {
    type: 'bar',
    height: 640,
    backgroundColor: 'transparent',
    plotBorderColor: '#d2d2d2',
    plotBorderWidth: 1
  },
  title: {
    text: 'Важность метрик: X = важность, Y = метрики',
    style: { color: '#000000', fontSize: '18px', fontWeight: '700' }
  },
  subtitle: {
    text: 'Метрики отсортированы по убыванию важности (сверху вниз)',
    style: { color: '#000000', fontSize: '12px' }
  },
  xAxis: {
    type: 'category',
    categories: sortedMetrics.value.map((item, index) => `${index + 1}. ${item.metric}`),
    title: {
      text: 'Метрики',
      style: { color: '#000000', fontWeight: '700' }
    },
    labels: { style: { color: '#000000', fontWeight: '600' } }
  },
  yAxis: {
    type: 'linear',
    min: 0,
    max: 100,
    tickInterval: 10,
    title: {
      text: 'Важность, %',
      style: { color: '#000000', fontWeight: '700' }
    },
    labels: { style: { color: '#000000' } },
    gridLineColor: '#d2d2d2'
  },
  legend: {
    enabled: false
  },
  plotOptions: {
    bar: {
      borderWidth: 0,
      pointPadding: 0.08,
      groupPadding: 0.12,
      dataLabels: {
        enabled: true,
        align: 'right',
        inside: true,
        style: {
          color: '#000000',
          fontSize: '12px',
          fontWeight: '700',
          textOutline: 'none'
        },
        formatter() {
          return `${this.y}%`
        }
      }
    }
  },
  tooltip: {
    pointFormat: 'Важность: <b>{point.y}%</b>'
  },
  credits: { enabled: false },
  accessibility: {
    enabled: true,
    description: 'Ранжированный график важности метрик'
  },
  exporting: { enabled: true },
  series: [
    {
      name: 'Важность',
      colorByPoint: true,
      data: sortedMetrics.value.map((item) => ({
        y: item.importance,
        color: getColorByImportance(item.importance)
      }))
    }
  ]
}))

const initChart = () => {
  if (!chartContainer.value) return

  try {
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
  min-height: 700px;
  padding: 20px;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.chart-canvas {
  width: 100%;
  min-height: 620px;
}

.highcharts-description {
  margin: 10px 0 0;
  color: #000000;
  font-size: 13px;
  line-height: 1.4;
}

.render-error {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 620px;
  background-color: #f5f5f5;
  border-radius: 4px;
  color: #d32f2f;
  font-size: 14px;
}
</style>

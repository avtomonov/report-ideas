<template>
  <div class="highcharts-figure">
    <div class="chart-canvas" ref="chartContainer"></div>
    <p class="highcharts-description">
      Scatter-график показывает оценки пользователей по метрикам: по оси X важность метрики,
      по оси Y оценка удовлетворенности.
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

const seriesData = [
  {
    name: 'Промоутеры',
    marker: { symbol: 'circle', radius: 6 },
    color: 'rgba(183, 210, 165, 0.7)',
    data: [
      [8.7, 9.1],
      [8.2, 8.9],
      [7.9, 8.4],
      [8.5, 8.8],
      [7.8, 8.6]
    ]
  },
  {
    name: 'Нейтральные',
    marker: { symbol: 'triangle', radius: 6 },
    color: 'rgba(253, 233, 147, 0.75)',
    data: [
      [7.3, 7.4],
      [6.9, 7.1],
      [7.1, 6.9],
      [7.5, 7.2],
      [6.7, 6.8]
    ]
  },
  {
    name: 'Критики',
    marker: { symbol: 'square', radius: 6 },
    color: 'rgba(247, 168, 161, 0.75)',
    data: [
      [6.1, 5.8],
      [5.8, 5.6],
      [6.4, 6.0],
      [5.6, 5.2],
      [6.0, 5.5]
    ]
  }
]

const chartOptions = computed(() => ({
  chart: {
    type: 'scatter',
    zooming: { type: 'xy' },
    height: 560,
    backgroundColor: 'transparent',
    plotBorderColor: '#d2d2d2'
  },
  title: {
    text: 'Оценки пользователей по метрикам',
    style: { color: '#000000', fontSize: '18px', fontWeight: '700' }
  },
  subtitle: {
    text: 'Сравнение групп пользователей по важности и удовлетворенности',
    style: { color: '#000000', fontSize: '12px' }
  },
  xAxis: {
    title: {
      text: 'Важность метрики (0-10)',
      style: { color: '#000000', fontWeight: '700' }
    },
    labels: { style: { color: '#000000' } },
    min: 5,
    max: 10,
    tickInterval: 1,
    gridLineColor: '#d2d2d2'
  },
  yAxis: {
    title: {
      text: 'Оценка пользователей (0-10)',
      style: { color: '#000000', fontWeight: '700' }
    },
    labels: { style: { color: '#000000' } },
    min: 5,
    max: 10,
    tickInterval: 1,
    gridLineColor: '#d2d2d2'
  },
  legend: {
    enabled: true,
    itemStyle: { color: '#000000', fontWeight: '600' },
    itemHoverStyle: { color: '#000000' }
  },
  plotOptions: {
    scatter: {
      marker: {
        lineColor: '#000000',
        lineWidth: 1,
        states: {
          hover: {
            enabled: true,
            lineColor: '#000000'
          }
        }
      },
      jitter: {
        x: 0.02,
        y: 0.02
      }
    }
  },
  tooltip: {
    pointFormat: 'Важность: <b>{point.x}</b><br/>Оценка: <b>{point.y}</b>',
    style: { color: '#000000' }
  },
  credits: { enabled: false },
  accessibility: {
    enabled: true,
    description: 'График оценок пользователей по метрикам'
  },
  exporting: { enabled: true },
  series: seriesData
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
  min-height: 640px;
  padding: 20px;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.chart-canvas {
  width: 100%;
  min-height: 560px;
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
  min-height: 560px;
  background-color: #f5f5f5;
  border-radius: 4px;
  color: #d32f2f;
  font-size: 14px;
}
</style>

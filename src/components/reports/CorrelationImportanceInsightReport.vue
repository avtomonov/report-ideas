<template>
  <div class="highcharts-figure">
    <div class="chart-canvas" ref="chartContainer"></div>
    <p class="highcharts-description">
      Карта решений: чем правее метрика, тем выше важность; чем выше точка,
      тем сильнее корреляция с общим счастьем. Размер круга показывает охват ответа.
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

const metricPoints = [
  { name: 'Обратная связь руководителя', x: 9.2, y: 0.78, z: 720, color: '#b7d2a5' },
  { name: 'Понятность целей команды', x: 8.8, y: 0.72, z: 690, color: '#d5e88c' },
  { name: 'Признание достижений', x: 8.3, y: 0.66, z: 610, color: '#fde993' },
  { name: 'Баланс нагрузки', x: 9.0, y: 0.58, z: 760, color: '#ffc184' },
  { name: 'Карьерная прозрачность', x: 8.1, y: 0.49, z: 640, color: '#f7a8a1' },
  { name: 'Комфорт коммуникации', x: 7.4, y: 0.44, z: 520, color: '#d2d2d2' },
  { name: 'Скорость решения блокеров', x: 7.9, y: 0.61, z: 580, color: '#d5e88c' },
  { name: 'Гибкость графика', x: 6.8, y: 0.37, z: 450, color: '#ffc184' }
]

const strategicFrontier = [
  ['Обратная связь руководителя', 9.2, 0.78],
  ['Понятность целей команды', 8.8, 0.72],
  ['Скорость решения блокеров', 7.9, 0.61],
  ['Гибкость графика', 6.8, 0.37]
]

const chartOptions = computed(() => ({
  chart: {
    type: 'bubble',
    plotBorderColor: '#d2d2d2',
    plotBorderWidth: 1,
    height: 620,
    backgroundColor: 'transparent',
    zooming: { type: 'xy' }
  },
  title: {
    text: 'Матрица: Корреляция метрик с их важностью',
    style: { color: '#000000', fontSize: '18px', fontWeight: '700' }
  },
  subtitle: {
    text: 'Квадранты показывают, куда инвестировать усилия в первую очередь',
    style: { color: '#000000', fontSize: '12px' }
  },
  xAxis: {
    min: 6,
    max: 10,
    tickInterval: 0.5,
    title: {
      text: 'Важность метрики (0-10)',
      style: { color: '#000000', fontWeight: '700' }
    },
    labels: { style: { color: '#000000' } },
    plotLines: [{
      value: 8,
      color: '#000000',
      dashStyle: 'ShortDash',
      width: 1.5,
      label: {
        text: 'Порог важности',
        style: { color: '#000000', fontSize: '11px' }
      }
    }],
    gridLineColor: '#d2d2d2'
  },
  yAxis: {
    min: 0.3,
    max: 0.85,
    tickInterval: 0.1,
    title: {
      text: 'Корреляция с Happy Index',
      style: { color: '#000000', fontWeight: '700' }
    },
    labels: { style: { color: '#000000' }, format: '{value:.2f}' },
    plotLines: [{
      value: 0.6,
      color: '#000000',
      dashStyle: 'ShortDash',
      width: 1.5,
      label: {
        text: 'Порог корреляции',
        style: { color: '#000000', fontSize: '11px' }
      }
    }],
    gridLineColor: '#d2d2d2'
  },
  legend: {
    enabled: true,
    itemStyle: { color: '#000000', fontWeight: '600' },
    itemHoverStyle: { color: '#000000' }
  },
  plotOptions: {
    bubble: {
      minSize: 14,
      maxSize: 48,
      dataLabels: {
        enabled: true,
        allowOverlap: false,
        formatter() {
          return this.point.name
        },
        style: {
          color: '#000000',
          fontSize: '11px',
          textOutline: 'none',
          fontWeight: '600'
        }
      },
      marker: {
        lineWidth: 1,
        lineColor: '#000000'
      }
    },
    spline: {
      marker: {
        enabled: false
      }
    }
  },
  tooltip: {
    useHTML: true,
    pointFormat: '<b>{point.name}</b><br/>Важность: <b>{point.x}</b><br/>Корреляция: <b>{point.y:.2f}</b><br/>Охват: <b>{point.z}</b>'
  },
  credits: { enabled: false },
  accessibility: {
    enabled: true,
    description: 'График корреляции и важности метрик для приоритизации инициатив'
  },
  exporting: { enabled: true },
  series: [
    {
      type: 'bubble',
      name: 'Метрики',
      colorByPoint: false,
      data: metricPoints
    },
    {
      type: 'spline',
      name: 'Стратегический маршрут',
      color: '#000000',
      lineWidth: 2,
      dashStyle: 'Dash',
      data: strategicFrontier.map((item) => ({ name: item[0], x: item[1], y: item[2] })),
      tooltip: {
        pointFormat: '<b>{point.name}</b><br/>Маршрут трансформации'
      }
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

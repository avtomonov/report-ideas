<template>
  <figure class="highcharts-figure">
    <div ref="chartRef" class="chart-canvas"></div>

    <div class="kpi-row">
      <div class="kpi-item">
        <div class="kpi-label">Слишком быстрые ответы (&lt; 5 сек)</div>
        <div class="kpi-value danger">{{ tooFastPercent }}%</div>
      </div>
      <div class="kpi-item">
        <div class="kpi-label">Медианная скорость</div>
        <div class="kpi-value">{{ medianSecond }} сек</div>
      </div>
      <div class="kpi-item">
        <div class="kpi-label">Длинные ответы (&gt; 30 сек)</div>
        <div class="kpi-value">{{ slowTailPercent }}%</div>
      </div>
    </div>

    <p class="highcharts-description">
      Отчет оценивает риск прокликивания и потери качества данных опроса по распределению времени ответа.
    </p>
  </figure>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import Highcharts from 'highcharts'

const chartRef = ref(null)
let chart = null

const currentData = [
  { second: 1, percent: 4.2 },
  { second: 2, percent: 6.8 },
  { second: 3, percent: 7.5 },
  { second: 4, percent: 8.1 },
  { second: 5, percent: 7.2 },
  { second: 7, percent: 6.2 },
  { second: 10, percent: 5.6 },
  { second: 15, percent: 4.9 },
  { second: 20, percent: 4.1 },
  { second: 30, percent: 3.0 },
  { second: 45, percent: 2.1 },
  { second: 60, percent: 1.5 }
]

const previousData = [
  { second: 1, percent: 2.9 },
  { second: 2, percent: 4.1 },
  { second: 3, percent: 5.0 },
  { second: 4, percent: 5.9 },
  { second: 5, percent: 6.2 },
  { second: 7, percent: 6.6 },
  { second: 10, percent: 6.4 },
  { second: 15, percent: 5.8 },
  { second: 20, percent: 4.9 },
  { second: 30, percent: 3.8 },
  { second: 45, percent: 2.7 },
  { second: 60, percent: 1.9 }
]

const tooFastPercent = computed(() => {
  return round1(currentData.filter((item) => item.second < 5).reduce((sum, item) => sum + item.percent, 0))
})

const slowTailPercent = computed(() => {
  return round1(currentData.filter((item) => item.second > 30).reduce((sum, item) => sum + item.percent, 0))
})

const medianSecond = computed(() => {
  const sorted = [...currentData].sort((a, b) => a.second - b.second)
  let cumulative = 0

  for (const item of sorted) {
    cumulative += item.percent
    if (cumulative >= 50) {
      return item.second
    }
  }

  return sorted[sorted.length - 1]?.second ?? 0
})

const getColorBySeconds = (seconds) => {
  if (seconds <= 3) return '#f7a8a1' // redred - too fast
  if (seconds <= 7) return '#ffc184' // orange - risky fast
  if (seconds <= 15) return '#fde993' // yellow - acceptable
  if (seconds <= 30) return '#d5e88c' // light-green - normal
  if (seconds <= 45) return '#b7d2a5' // green - acceptable slow
  return '#d2d2d2' // gray - too slow
}

const chartOptions = computed(() => ({
  chart: {
    type: 'column',
    height: 340,
    backgroundColor: 'transparent',
    plotAreaBackground: { color: '#b7d2a5' }
  },
  title: {
    text: 'Скорость ответов по секундам',
    style: {
      color: '#000000'
    }
  },
  subtitle: {
    text: 'Текущий цикл vs предыдущий цикл',
    style: {
      color: '#000000'
    }
  },
  xAxis: {
    categories: currentData.map((item) => `${item.second}`),
    title: {
      text: 'Секунды на вопрос',
      style: {
        color: '#000000'
      }
    },
    labels: {
      style: {
        color: '#000000'
      }
    }
  },
  yAxis: {
    title: {
      text: 'Доля ответов, %',
      style: {
        color: '#000000'
      }
    },
    max: 10,
    gridLineColor: '#ecf0f4',
    labels: {
      style: {
        color: '#000000'
      }
    }
  },
  tooltip: {
    shared: true,
    className: 'white-tooltip',
    style: {
      color: '#ffffff'
    },
    valueSuffix: '%'
  },
  legend: {
    align: 'center',
    verticalAlign: 'bottom',
    itemStyle: {
      color: '#000000'
    },
    itemHoverStyle: {
      color: '#000000'
    }
  },
  credits: { enabled: false },
  series: [
    {
      name: 'Текущий цикл',
      type: 'column',
      data: currentData.map((item) => ({
        y: item.percent,
        color: getColorBySeconds(item.second)
      }))
    },
    {
      name: 'Прошлый цикл',
      type: 'spline',
      color: '#0f766e',
      data: previousData.map((item) => item.percent),
      marker: { radius: 3 }
    }
  ]
}))

const round1 = (value) => Math.round(value * 10) / 10

const renderChart = () => {
  if (!chartRef.value) return

  if (chart) {
    chart.destroy()
  }

  chart = Highcharts.chart(chartRef.value, chartOptions.value)
}

onMounted(renderChart)
watch(chartOptions, renderChart, { deep: true })

onBeforeUnmount(() => {
  if (chart) {
    chart.destroy()
    chart = null
  }
})
</script>

<style scoped lang="scss">
.highcharts-figure {
  margin: 0;
}

:deep(.highcharts-tooltip.white-tooltip),
:deep(.highcharts-tooltip.white-tooltip text),
:deep(.highcharts-tooltip.white-tooltip tspan),
:deep(.highcharts-tooltip.white-tooltip span) {
  color: #ffffff !important;
  fill: #ffffff !important;
}

.chart-canvas {
  width: 100%;
  min-height: 340px;
}

.kpi-row {
  margin-top: 12px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.kpi-item {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 10px;
}

.kpi-label {
  font-size: 11px;
  color: #000000;
  margin-bottom: 6px;
}

.kpi-value {
  font-size: 18px;
  font-weight: 700;
  color: #000000;
}

.kpi-value.danger {
  color: #000000;
}

.highcharts-description {
  margin: 10px 0 0;
  font-size: 12px;
  color: #000000;
}

@media (max-width: 900px) {
  .kpi-row {
    grid-template-columns: 1fr;
  }
}
</style>

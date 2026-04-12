<template>
  <figure class="highcharts-figure">
    <div ref="chartRef" class="chart-canvas"></div>
    <p class="highcharts-description">
      Квартильный коридор рынка показывает волатильность: чем шире коридор, тем выше разброс результатов по компаниям.
    </p>
  </figure>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import Highcharts from 'highcharts'
import 'highcharts/highcharts-more'

const chartRef = ref(null)
let chart = null

const categories = ['2025 Q1', '2025 Q2', '2025 Q3', '2025 Q4', '2026 Q1']

const marketCorridor = [
  [48, 58, 63, 69, 80],
  [46, 56, 62, 68, 81],
  [44, 55, 61, 67, 79],
  [45, 57, 64, 70, 82],
  [47, 59, 65, 71, 83]
]

const companyLine = [60, 61, 59, 63, 66]

const corridorWidth = computed(() => {
  const widths = marketCorridor.map((row) => row[4] - row[0])
  const avg = widths.reduce((sum, value) => sum + value, 0) / widths.length
  return avg.toFixed(1)
})

const options = computed(() => ({
  chart: {
    height: 360,
    backgroundColor: 'transparent',
    plotAreaBackground: { color: '#ffc184' }
  },
  title: {
    text: `Волатильность бенчмарка (средняя ширина: ${corridorWidth.value} п.п.)`
  },
  xAxis: {
    categories
  },
  yAxis: {
    title: { text: 'Значение индекса, %' },
    min: 40,
    max: 85,
    gridLineColor: '#ecf0f4'
  },
  tooltip: {
    shared: true
  },
  credits: { enabled: false },
  series: [
    {
      name: 'Рыночный коридор',
      type: 'boxplot',
      data: marketCorridor,
      color: '#0f766e',
      fillColor: 'rgba(15, 118, 110, 0.15)'
    },
    {
      name: 'Ваша компания',
      type: 'spline',
      data: companyLine,
      color: '#22c55e',
      marker: { radius: 4 }
    }
  ]
}))

const renderChart = () => {
  if (!chartRef.value) return

  if (chart) chart.destroy()
  chart = Highcharts.chart(chartRef.value, options.value)
}

onMounted(renderChart)
watch(options, renderChart, { deep: true })

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

.chart-canvas {
  width: 100%;
  min-height: 360px;
}

.highcharts-description {
  margin: 10px 0 0;
  font-size: 12px;
  color: #64748b;
}
</style>

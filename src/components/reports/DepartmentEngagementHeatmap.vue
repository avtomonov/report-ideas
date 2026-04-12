<template>
  <div class="highcharts-figure">
    <div class="chart-canvas" ref="chartContainer"></div>
    <div v-if="renderError" class="render-error">
      <p>Ошибка при отображении графика</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import Highcharts from 'highcharts'

const chartContainer = ref(null)
const renderError = ref(false)
let chartInstance = null

// Данные по отделам и метрикам
const departmentMetricsData = [
  { dept: 'IT', employees: 245, engagement: 78, loyalty: 72, satisfaction: 75, enps: 35 },
  { dept: 'Sales', employees: 189, engagement: 65, loyalty: 58, satisfaction: 68, enps: 22 },
  { dept: 'Marketing', employees: 156, engagement: 72, loyalty: 68, satisfaction: 71, enps: 28 },
  { dept: 'HR', employees: 78, engagement: 68, loyalty: 70, satisfaction: 72, enps: 31 },
  { dept: 'Finance', employees: 112, engagement: 75, loyalty: 71, satisfaction: 73, enps: 33 },
  { dept: 'Operations', employees: 203, engagement: 70, loyalty: 65, satisfaction: 69, enps: 25 }
]

const metrics = ['engagement', 'loyalty', 'satisfaction', 'enps']
const metricLabels = {
  engagement: 'Вовлеченность',
  loyalty: 'Лояльность',
  satisfaction: 'Удовлетворение',
  enps: 'eNPS'
}

const colorMap = {
  engagement: '#d5e88c',   // light-green
  loyalty: '#b7d2a5',      // green
  satisfaction: '#ffc184', // orange
  enps: '#fde993'          // yellow
}

const heatmapData = computed(() => {
  const data = []
  departmentMetricsData.forEach((dept, deptIdx) => {
    metrics.forEach((metric, metricIdx) => {
      const value = dept[metric]
      // Определяем цвет на основе значения
      let color
      if (value >= 75) color = '#b7d2a5' // green
      else if (value >= 70) color = '#d5e88c' // light-green
      else if (value >= 65) color = '#ffc184' // orange
      else color = '#f7a8a1' // redred
      
      data.push({
        x: metricIdx,
        y: deptIdx,
        value: value,
        color: color
      })
    })
  })
  return data
})

const chartOptions = computed(() => ({
  chart: {
    type: 'heatmap',
    height: 500,
    backgroundColor: 'transparent'
  },
  title: {
    text: 'Тепловая карта вовлеченности по отделам',
    style: { color: '#000000', fontSize: '16px', fontWeight: 'bold' }
  },
  subtitle: {
    text: 'Показано распределение ключевых метрик по отделам компании',
    style: { color: '#666666', fontSize: '12px' }
  },
  xAxis: {
    categories: Object.values(metricLabels),
    title: { text: 'Метрики', style: { color: '#000000', fontWeight: 'bold' } },
    labels: { style: { color: '#000000' } }
  },
  yAxis: {
    categories: departmentMetricsData.map(d => d.dept),
    title: { text: 'Отделы', style: { color: '#000000', fontWeight: 'bold' } },
    labels: { style: { color: '#000000' } }
  },
  colorAxis: {
    min: 0,
    max: 100,
    stops: [
      [0, '#f7a8a1'],      // redred
      [0.35, '#ffc184'],   // orange
      [0.65, '#d5e88c'],   // light-green
      [1, '#b7d2a5']       // green
    ]
  },
  series: [{
    name: 'Значение метрики (%)',
    borderWidth: 1,
    borderColor: '#ffffff',
    data: heatmapData.value,
    dataLabels: {
      enabled: true,
      color: '#000000',
      format: '{point.value}%',
      fontSize: '11px'
    }
  }],
  legend: {
    enabled: true,
    title: { text: 'Значение (%)', style: { color: '#000000' } },
    labels: { style: { color: '#000000' } }
  },
  credits: { enabled: false },
  plotBorderColor: '#cccccc'
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
      retries++
      requestAnimationFrame(attempt)
    }
  }

  attempt()
}

onMounted(() => {
  safeInitChart()
})

watch(chartOptions, () => {
  if (chartInstance) {
    initChart()
  }
}, { deep: true })
</script>

<style scoped>
.highcharts-figure {
  width: 100%;
  min-height: 550px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.chart-canvas {
  width: 100%;
  min-height: 500px;
}

.render-error {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 500px;
  background-color: #f5f5f5;
  border-radius: 4px;
  color: #d32f2f;
  font-size: 14px;
}
</style>

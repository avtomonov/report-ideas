<template>
  <div class="highcharts-figure">
    <div class="chart-canvas" ref="chartContainer"></div>
    <div v-if="renderError" class="render-error">
      <p>Ошибка при отображении графика</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import Highcharts from 'highcharts'

const chartContainer = ref(null)
const renderError = ref(false)
let chartInstance = null

const departmentComparisonData = [
  { dept: 'IT', engagement: 78, loyalty: 72, satisfaction: 75, benchmark: 70 },
  { dept: 'Sales', engagement: 65, loyalty: 58, satisfaction: 62, benchmark: 70 },
  { dept: 'Marketing', engagement: 72, loyalty: 68, satisfaction: 70, benchmark: 70 },
  { dept: 'HR', engagement: 68, loyalty: 70, satisfaction: 69, benchmark: 70 },
  { dept: 'Finance', engagement: 75, loyalty: 71, satisfaction: 73, benchmark: 70 },
  { dept: 'Operations', engagement: 70, loyalty: 65, satisfaction: 67, benchmark: 70 }
]

const benchmarkLine = 70

const chartOptions = computed(() => ({
  chart: {
    type: 'column',
    height: 500,
    backgroundColor: 'transparent',
    plotBorderColor: '#cccccc'
  },
  title: {
    text: 'Сравнение отделов по ключевым метрикам',
    style: { color: '#000000', fontSize: '16px', fontWeight: 'bold' }
  },
  subtitle: {
    text: 'Горизонтальная линия показывает средний бенчмарк компании (70%)',
    style: { color: '#666666', fontSize: '12px' }
  },
  xAxis: {
    categories: departmentComparisonData.map(d => d.dept),
    labels: { style: { color: '#000000' } }
  },
  yAxis: {
    title: { text: 'Значение метрики (%)', style: { color: '#000000', fontWeight: 'bold' } },
    labels: { style: { color: '#000000' } },
    plotLines: [{
      value: benchmarkLine,
      color: '#d2d2d2',
      dashStyle: 'solid',
      width: 2,
      label: {
        text: 'Бенчмарк: 70%',
        align: 'right',
        style: { color: '#000000', fontWeight: 'bold' }
      }
    }],
    min: 55,
    max: 85
  },
  plotOptions: {
    column: {
      dataLabels: {
        enabled: true,
        style: { color: '#000000', fontSize: '10px', fontWeight: 'bold' },
        format: '{y}%'
      }
    }
  },
  series: [
    {
      name: 'Вовлеченность',
      color: '#b7d2a5',
      data: departmentComparisonData.map(d => d.engagement)
    },
    {
      name: 'Лояльность',
      color: '#d5e88c',
      data: departmentComparisonData.map(d => d.loyalty)
    },
    {
      name: 'Удовлетворенность',
      color: '#ffc184',
      data: departmentComparisonData.map(d => d.satisfaction)
    }
  ],
  legend: {
    enabled: true,
    layout: 'horizontal',
    align: 'center',
    verticalAlign: 'bottom',
    labels: { style: { color: '#000000' } }
  },
  credits: { enabled: false },
  tooltip: {
    shared: true,
    headerFormat: '<b>{point.key}</b><br/>',
    pointFormat: '{series.name}: {y}%<br/>'
  }
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
  min-height: 600px;
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

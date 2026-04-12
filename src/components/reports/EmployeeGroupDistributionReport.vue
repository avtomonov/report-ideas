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

const departmentGroupsData = [
  { dept: 'IT', promoters: 182, skeptics: 45, critics: 18 },
  { dept: 'Sales', promoters: 113, skeptics: 57, critics: 19 },
  { dept: 'Marketing', promoters: 109, skeptics: 35, critics: 12 },
  { dept: 'HR', promoters: 55, skeptics: 18, critics: 5 },
  { dept: 'Finance', promoters: 84, skeptics: 22, critics: 6 },
  { dept: 'Operations', promoters: 142, skeptics: 46, critics: 15 }
]

const chartOptions = computed(() => ({
  chart: {
    type: 'bar',
    height: 500,
    backgroundColor: 'transparent',
    plotBorderColor: '#cccccc'
  },
  title: {
    text: 'Распределение сотрудников по группам вовлеченности',
    style: { color: '#000000', fontSize: '16px', fontWeight: 'bold' }
  },
  subtitle: {
    text: 'Деление на Сторонников (Promoters), Скептиков (Skeptics) и Критиков (Critics)',
    style: { color: '#666666', fontSize: '12px' }
  },
  xAxis: {
    categories: departmentGroupsData.map(d => d.dept),
    labels: { style: { color: '#000000' } },
    title: { style: { color: '#000000', fontWeight: 'bold' } }
  },
  yAxis: {
    title: { text: 'Количество сотрудников', style: { color: '#000000', fontWeight: 'bold' } },
    labels: { style: { color: '#000000' } }
  },
  plotOptions: {
    series: {
      stacking: 'normal',
      dataLabels: {
        enabled: true,
        style: { color: '#000000', fontSize: '11px', fontWeight: 'bold' },
        format: '{y}'
      }
    }
  },
  series: [
    {
      name: 'Сторонники (Promoters)',
      color: '#b7d2a5',
      data: departmentGroupsData.map(d => d.promoters)
    },
    {
      name: 'Скептики (Skeptics)',
      color: '#ffc184',
      data: departmentGroupsData.map(d => d.skeptics)
    },
    {
      name: 'Критики (Critics)',
      color: '#f7a8a1',
      data: departmentGroupsData.map(d => d.critics)
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
    pointFormat: '{series.name}: {y} чел.<br/>'
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

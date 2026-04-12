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

const departmentsData = [
  { dept: 'IT', employees: 245, engagement: 78, loyalty: 72 },
  { dept: 'Sales', employees: 189, engagement: 65, loyalty: 58 },
  { dept: 'Marketing', employees: 156, engagement: 72, loyalty: 68 },
  { dept: 'HR', employees: 78, engagement: 68, loyalty: 70 },
  { dept: 'Finance', employees: 112, engagement: 75, loyalty: 71 },
  { dept: 'Operations', employees: 203, engagement: 70, loyalty: 65 }
]

const averageEngagement = Number(
  (departmentsData.reduce((sum, item) => sum + item.engagement, 0) / departmentsData.length).toFixed(1)
)

const averageLoyalty = Number(
  (departmentsData.reduce((sum, item) => sum + item.loyalty, 0) / departmentsData.length).toFixed(1)
)

const maxEmployees = Math.max(...departmentsData.map(item => item.employees))
const minEmployees = Math.min(...departmentsData.map(item => item.employees))

const getPointRadius = (employees) => {
  const minRadius = 8
  const maxRadius = 20
  if (maxEmployees === minEmployees) return minRadius
  const ratio = (employees - minEmployees) / (maxEmployees - minEmployees)
  return Number((minRadius + ratio * (maxRadius - minRadius)).toFixed(1))
}

const getCorrelation = () => {
  const xMean = averageEngagement
  const yMean = averageLoyalty

  const numerator = departmentsData.reduce((sum, item) => {
    return sum + (item.engagement - xMean) * (item.loyalty - yMean)
  }, 0)

  const xDeviation = Math.sqrt(
    departmentsData.reduce((sum, item) => sum + (item.engagement - xMean) ** 2, 0)
  )
  const yDeviation = Math.sqrt(
    departmentsData.reduce((sum, item) => sum + (item.loyalty - yMean) ** 2, 0)
  )

  if (!xDeviation || !yDeviation) return 0
  return Number((numerator / (xDeviation * yDeviation)).toFixed(2))
}

const correlation = getCorrelation()

const toChartPoint = (item, segmentLabel) => ({
  x: item.engagement,
  y: item.loyalty,
  dept: item.dept,
  employees: item.employees,
  segment: segmentLabel,
  marker: { radius: getPointRadius(item.employees) }
})

const chartOptions = computed(() => ({
  chart: {
    type: 'scatter',
    height: 550,
    backgroundColor: 'transparent',
    plotBorderColor: '#cccccc'
  },
  title: {
    text: 'Корреляция метрик: Вовлеченность и Лояльность',
    style: { color: '#000000', fontSize: '16px', fontWeight: 'bold' }
  },
  subtitle: {
    text: `Квадранты показывают зоны приоритета, r = ${correlation}`,
    style: { color: '#666666', fontSize: '12px' }
  },
  xAxis: {
    title: { text: 'Вовлеченность (%)', style: { color: '#000000', fontWeight: 'bold' } },
    labels: { style: { color: '#000000' } },
    gridLineColor: '#e6e6e6',
    gridLineDashStyle: 'ShortDot',
    gridLineWidth: 1,
    min: 60,
    max: 85,
    plotLines: [{
      value: averageEngagement,
      color: '#d2d2d2',
      dashStyle: 'ShortDash',
      width: 2,
      label: {
        text: `Средняя вовлеченность: ${averageEngagement}%`,
        style: { color: '#000000', fontSize: '10px' }
      }
    }]
  },
  yAxis: {
    title: { text: 'Лояльность (%)', style: { color: '#000000', fontWeight: 'bold' } },
    labels: { style: { color: '#000000' } },
    gridLineColor: '#e6e6e6',
    gridLineDashStyle: 'ShortDot',
    gridLineWidth: 1,
    min: 55,
    max: 75,
    plotLines: [{
      value: averageLoyalty,
      color: '#d2d2d2',
      dashStyle: 'ShortDash',
      width: 2,
      label: {
        text: `Средняя лояльность: ${averageLoyalty}%`,
        style: { color: '#000000', fontSize: '10px' }
      }
    }]
  },
  plotOptions: {
    scatter: {
      dataLabels: {
        enabled: true,
        format: '{point.dept}',
        style: { color: '#000000', fontSize: '12px', fontWeight: 'bold' }
      },
      marker: {
        lineColor: '#000000',
        lineWidth: 1
      },
      states: {
        hover: {
          borderColor: '#000000'
        }
      }
    }
  },
  series: [
    {
      name: 'Лидеры (высокие обе метрики)',
      color: '#b7d2a5',
      data: departmentsData
        .filter(item => item.engagement >= averageEngagement && item.loyalty >= averageLoyalty)
        .map(item => toChartPoint(item, 'Лидеры'))
    },
    {
      name: 'Зона роста лояльности',
      color: '#ffc184',
      data: departmentsData
        .filter(item => item.engagement >= averageEngagement && item.loyalty < averageLoyalty)
        .map(item => toChartPoint(item, 'Рост лояльности'))
    },
    {
      name: 'Зона роста вовлеченности',
      color: '#d5e88c',
      data: departmentsData
        .filter(item => item.engagement < averageEngagement && item.loyalty >= averageLoyalty)
        .map(item => toChartPoint(item, 'Рост вовлеченности'))
    },
    {
      name: 'Риск-зона',
      color: '#f7a8a1',
      data: departmentsData
        .filter(item => item.engagement < averageEngagement && item.loyalty < averageLoyalty)
        .map(item => toChartPoint(item, 'Риск-зона'))
    }
  ],
  legend: {
    enabled: true,
    layout: 'vertical',
    align: 'right',
    verticalAlign: 'middle',
    labels: { style: { color: '#000000' } }
  },
  credits: { enabled: false },
  tooltip: {
    headerFormat: '<b>{point.dept}</b><br/>',
    pointFormat: 'Вовлеченность: {point.x}%<br/>Лояльность: {point.y}%<br/>Сотрудников: {point.employees}<br/>Сегмент: {point.segment}'
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
  min-height: 550px;
}

.render-error {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 550px;
  background-color: #f5f5f5;
  border-radius: 4px;
  color: #d32f2f;
  font-size: 14px;
}
</style>

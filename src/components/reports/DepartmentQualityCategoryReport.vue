<template>
  <figure class="highcharts-figure">
    <div v-if="renderError" class="render-error">
      Не удалось отрисовать график. Обновите страницу или попробуйте позже.
    </div>
    <div ref="chartRef" class="chart-canvas"></div>
  </figure>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import Highcharts from 'highcharts'

const chartRef = ref(null)
const renderError = ref(false)
let chart = null
let resizeHandler = null

const departments = [
  { id: 1, name: 'IT', engagement: 82, loyalty: 88, satisfaction: 85, employees: 245, trend: 8 },
  { id: 2, name: 'Продажи', engagement: 76, loyalty: 72, satisfaction: 74, employees: 156, trend: 5 },
  { id: 3, name: 'Маркетинг', engagement: 71, loyalty: 69, satisfaction: 68, employees: 89, trend: 3 },
  { id: 4, name: 'HR', engagement: 58, loyalty: 61, satisfaction: 59, employees: 42, trend: -2 },
  { id: 5, name: 'Финансы', engagement: 68, loyalty: 74, satisfaction: 72, employees: 78, trend: 6 },
  { id: 6, name: 'Операции', engagement: 74, loyalty: 76, satisfaction: 75, employees: 134, trend: 4 }
]

const sortedDepartments = computed(() => [...departments].sort((a, b) => b.employees - a.employees))

const getCategoryDistribution = (dept) => {
  const metrics = [dept.engagement, dept.loyalty, dept.satisfaction]
  
  // 5 групп: очень плохо, плохо, среднее, хорошо, отлично
  const veryPoor = metrics.filter(m => m < 40).length / 3
  const poor = metrics.filter(m => m >= 40 && m < 60).length / 3
  const medium = metrics.filter(m => m >= 60 && m < 75).length / 3
  const good = metrics.filter(m => m >= 75 && m < 85).length / 3
  const excellent = metrics.filter(m => m >= 85).length / 3
  
  // Расчет количества людей в каждой категории
  return {
    veryPoor: Math.round(dept.employees * veryPoor),
    poor: Math.round(dept.employees * poor),
    medium: Math.round(dept.employees * medium),
    good: Math.round(dept.employees * good),
    excellent: Math.round(dept.employees * excellent)
  }
}

const veryPoorData = computed(() => sortedDepartments.value.map(d => getCategoryDistribution(d).veryPoor))
const poorData = computed(() => sortedDepartments.value.map(d => getCategoryDistribution(d).poor))
const mediumData = computed(() => sortedDepartments.value.map(d => getCategoryDistribution(d).medium))
const goodData = computed(() => sortedDepartments.value.map(d => getCategoryDistribution(d).good))
const excellentData = computed(() => sortedDepartments.value.map(d => getCategoryDistribution(d).excellent))

const chartOptions = computed(() => ({
  chart: {
    type: 'column',
    inverted: true,
    polar: true,
    backgroundColor: 'transparent',
    height: 600
  },
  title: {
    text: 'Распределение сотрудников по категориям качества',
    style: {
      color: '#000000',
      fontSize: '16px'
    }
  },
  subtitle: {
    text: 'Показано количество сотрудников в каждом отделе (% определяется по метрикам вовлеченности, лояльности и удовлетворения)',
    style: {
      color: '#333333',
      fontSize: '12px'
    }
  },
  tooltip: {
    outside: true,
    headerFormat: '<b>{point.key}</b><br/>',
    pointFormat: '{series.name}: {point.y} человек<br/>'
  },
  pane: {
    size: '90%',
    innerSize: '20%',
    endAngle: 270
  },
  xAxis: {
    tickInterval: 1,
    labels: {
      align: 'right',
      allowOverlap: true,
      step: 1,
      y: 3,
      style: {
        fontSize: '13px',
        color: '#000000',
        fontWeight: 'bold'
      }
    },
    lineWidth: 0,
    gridLineWidth: 0,
    categories: sortedDepartments.value.map(d => `${d.name}\n(${d.employees})`)
  },
  yAxis: {
    lineWidth: 0,
    tickInterval: 50,
    reversedStacks: false,
    endOnTick: true,
    showLastLabel: true,
    gridLineWidth: 0,
    title: {
      style: {
        color: '#000000',
        fontWeight: 'bold'
      }
    },
    labels: {
      style: {
        color: '#000000'
      }
    }
  },
  plotOptions: {
    column: {
      stacking: 'normal',
      borderWidth: 0,
      pointPadding: 0,
      groupPadding: 0.15,
      borderRadius: {
        radius: '50%',
        where: 'all'
      }
    }
  },
  credits: {
    enabled: false
  },
  series: [
    {
      name: 'Очень плохо (< 40)',
      data: veryPoorData.value,
      color: '#f7a8a1' // redred
    },
    {
      name: 'Плохо (40-60)',
      data: poorData.value,
      color: '#ffc184' // orange
    },
    {
      name: 'Среднее (60-75)',
      data: mediumData.value,
      color: '#fde993' // yellow
    },
    {
      name: 'Хорошо (75-85)',
      data: goodData.value,
      color: '#d5e88c' // light-green
    },
    {
      name: 'Отлично (>= 85)',
      data: excellentData.value,
      color: '#b7d2a5' // green
    }
  ]
}))

const waitForVisibleContainer = async (elementRef, retries = 8) => {
  await nextTick()

  for (let i = 0; i < retries; i += 1) {
    const el = elementRef.value
    if (el && el.offsetWidth > 0 && el.offsetHeight > 0) {
      return true
    }

    await new Promise((resolve) => requestAnimationFrame(resolve))
  }

  return false
}

const renderChart = async () => {
  if (!chartRef.value) return

  const visible = await waitForVisibleContainer(chartRef)
  if (!visible) return

  try {
    if (chart) chart.destroy()
    chart = Highcharts.chart(chartRef.value, chartOptions.value)
    chart.reflow()
    renderError.value = false
  } catch {
    renderError.value = true
  }
}

onMounted(async () => {
  await renderChart()
  resizeHandler = () => {
    if (chart) chart.reflow()
  }
  window.addEventListener('resize', resizeHandler)
})

watch(() => chartOptions.value, renderChart, { deep: true })

onBeforeUnmount(() => {
  if (resizeHandler) window.removeEventListener('resize', resizeHandler)
  if (chart) chart.destroy()
})
</script>

<style scoped lang="scss">
.highcharts-figure {
  position: relative;
  padding: 20px;
}

.chart-canvas {
  min-height: 650px;
  width: 100%;
}

.render-error {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  color: #d32f2f;
  font-size: 16px;
  text-align: center;
  padding: 20px;
  background: #ffebee;
  border-radius: 8px;
}
</style>

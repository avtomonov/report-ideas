<template>
  <figure class="highcharts-figure">
    <div ref="statusChartRef" class="chart-canvas"></div>
    <div ref="deadlineChartRef" class="chart-canvas chart-canvas--small"></div>

    <div class="kpis">
      <div class="kpi kpi--missed">Просрочено: <strong>{{ missedPercent }}%</strong></div>
      <div class="kpi kpi--progress">В работе: <strong>{{ inProgressPercent }}%</strong></div>
      <div class="kpi kpi--met">Выполнено в срок: <strong>{{ metPercent }}%</strong></div>
    </div>
  </figure>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import Highcharts from 'highcharts'

const statusChartRef = ref(null)
const deadlineChartRef = ref(null)
let statusChart = null
let deadlineChart = null

const departments = ['IT', 'Продажи', 'Операции', 'Финансы', 'HR']
const openSeries = [16, 24, 18, 12, 14]
const inProgressSeries = [28, 33, 30, 19, 21]
const completeSeries = [56, 43, 52, 69, 65]

const deadlineStatuses = [
  { name: 'В срок (met)', y: 61, color: '#b7d2a5' },
  { name: 'Предупреждение (alert)', y: 17, color: '#fde993' },
  { name: 'Просрочено (missed)', y: 14, color: '#f7a8a1' },
  { name: 'Без даты', y: 8, color: '#d2d2d2' }
]

const missedPercent = computed(() => deadlineStatuses.find((item) => item.name.includes('missed'))?.y ?? 0)
const metPercent = computed(() => deadlineStatuses.find((item) => item.name.includes('met'))?.y ?? 0)
const inProgressPercent = computed(() => {
  const sum = inProgressSeries.reduce((acc, value) => acc + value, 0)
  return Math.round(sum / inProgressSeries.length)
})

const statusOptions = computed(() => ({
  chart: {
    type: 'column',
    height: 340,
    backgroundColor: 'transparent',
    plotAreaBackground: { color: '#d2d2d2' }
  },
  title: {
    text: 'SLA задач по департаментам',
    style: { color: '#000000', fontSize: '16px', fontWeight: '700' }
  },
  subtitle: {
    text: 'Статусы open / in_progress / complete, %',
    style: { color: '#000000', fontSize: '12px' }
  },
  xAxis: {
    categories: departments,
    labels: { style: { color: '#000000' } }
  },
  yAxis: {
    max: 100,
    title: {
      text: 'Доля задач, %',
      style: { color: '#000000', fontWeight: '700' }
    },
    labels: { style: { color: '#000000' } },
    stackLabels: {
      enabled: true,
      style: { color: '#000000', fontWeight: '700' },
      formatter() {
        return `${this.total}%`
      }
    }
  },
  tooltip: {
    shared: true,
    valueSuffix: '%'
  },
  plotOptions: {
    column: {
      stacking: 'normal',
      borderRadius: 4
    }
  },
  legend: {
    itemStyle: { color: '#000000', fontWeight: '600' },
    itemHoverStyle: { color: '#000000' }
  },
  credits: { enabled: false },
  series: [
    { name: 'Open', color: '#d2d2d2', data: openSeries },
    { name: 'In progress', color: '#ffc184', data: inProgressSeries },
    { name: 'Complete', color: '#b7d2a5', data: completeSeries }
  ]
}))

const deadlineOptions = computed(() => ({
  chart: {
    type: 'pie',
    height: 280,
    backgroundColor: 'transparent',
    plotAreaBackground: { color: '#d2d2d2' }
  },
  title: {
    text: 'Статусы дедлайнов',
    style: { color: '#000000', fontSize: '15px', fontWeight: '700' }
  },
  tooltip: {
    style: { color: '#000000' },
    pointFormat: '<b>{point.y}%</b>'
  },
  plotOptions: {
    pie: {
      innerSize: '55%',
      dataLabels: {
        enabled: true,
        style: { color: '#000000', textOutline: 'none', fontWeight: '600' },
        format: '{point.name}: {point.y}%'
      }
    }
  },
  legend: {
    itemStyle: { color: '#000000', fontWeight: '600' },
    itemHoverStyle: { color: '#000000' }
  },
  credits: { enabled: false },
  series: [
    {
      name: 'Доля',
      data: deadlineStatuses
    }
  ]
}))

const renderStatusChart = () => {
  if (!statusChartRef.value) return
  if (statusChart) statusChart.destroy()
  statusChart = Highcharts.chart(statusChartRef.value, statusOptions.value)
}

const renderDeadlineChart = () => {
  if (!deadlineChartRef.value) return
  if (deadlineChart) deadlineChart.destroy()
  deadlineChart = Highcharts.chart(deadlineChartRef.value, deadlineOptions.value)
}

onMounted(() => {
  renderStatusChart()
  renderDeadlineChart()
})

watch(statusOptions, renderStatusChart, { deep: true })
watch(deadlineOptions, renderDeadlineChart, { deep: true })

onBeforeUnmount(() => {
  if (statusChart) {
    statusChart.destroy()
    statusChart = null
  }
  if (deadlineChart) {
    deadlineChart.destroy()
    deadlineChart = null
  }
})
</script>

<style scoped lang="scss">
.highcharts-figure {
  margin: 0;
}

.chart-canvas {
  width: 100%;
  min-height: 320px;
}

.chart-canvas--small {
  min-height: 260px;
  margin-top: 10px;
}

.kpis {
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.kpi {
  background: #fde993;
  border: 1px solid #d2d2d2;
  border-radius: 10px;
  padding: 8px 10px;
  font-size: 12px;
  color: #000000;
}

.kpi strong {
  color: #000000;
}

.kpi--missed {
  background: #f7a8a1;
  border-color: #f7a8a1;
}

.kpi--progress {
  background: #ffc184;
  border-color: #ffc184;
}

.kpi--met {
  background: #b7d2a5;
  border-color: #b7d2a5;
}
</style>

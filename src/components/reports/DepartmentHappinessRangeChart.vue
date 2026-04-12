<template>
  <figure class="highcharts-figure">
    <div ref="rankingChartRef" class="ranking-chart-canvas"></div>
    <p class="highcharts-description">
      График показывает диапазон оценок сотрудников по метрике «Счастье». По оси значений используется шкала от 0 до 9.
    </p>
  </figure>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import Highcharts from 'highcharts'

import 'highcharts/highcharts-more'
import 'highcharts/modules/exporting'
import 'highcharts/modules/export-data'
import 'highcharts/modules/accessibility'
import 'highcharts/themes/adaptive'

const rankingChartRef = ref(null)
let rankingChart = null

const happinessRatings = computed(() => ([
  { id: 1, name: 'IT', low: 7.3, high: 9.0 },
  { id: 2, name: 'Продажи', low: 6.8, high: 8.4 },
  { id: 6, name: 'Операции', low: 6.6, high: 8.2 },
  { id: 5, name: 'Финансы', low: 6.2, high: 8.0 },
  { id: 3, name: 'Маркетинг', low: 5.9, high: 7.7 },
  { id: 4, name: 'HR', low: 4.8, high: 6.5 }
]))

const chartOptions = computed(() => ({
  chart: {
    type: 'columnrange',
    inverted: true,
    height: 360,
    backgroundColor: 'transparent',
    plotAreaBackground: { color: '#d5e88c' }
  },
  title: {
    text: 'Оценка метрики «Счастье» по департаментам'
  },
  subtitle: {
    text: 'Диапазон оценок сотрудников по шкале от 0 до 9'
  },
  xAxis: {
    categories: happinessRatings.value.map((dept) => dept.name),
    lineColor: '#d9dce3',
    tickColor: '#d9dce3'
  },
  yAxis: {
    min: 0,
    max: 9,
    tickInterval: 1,
    title: {
      text: 'Оценка сотрудников'
    },
    gridLineColor: '#eef1f6'
  },
  tooltip: {
    formatter() {
      return `<b>${this.point.category}</b><br/>Оценка: <b>${this.point.low} - ${this.point.high}</b> из 9`
    }
  },
  plotOptions: {
    columnrange: {
      borderRadius: '50%',
      color: '#43a047',
      borderColor: '#2e7d32',
      dataLabels: {
        enabled: true,
        format: '{point.low} - {point.high}'
      }
    }
  },
  legend: {
    enabled: false
  },
  credits: {
    enabled: false
  },
  series: [
    {
      name: 'Оценка сотрудников',
      data: happinessRatings.value.map((dept) => ({
        low: dept.low,
        high: dept.high,
        color: getChartColor(dept.high)
      }))
    }
  ]
}))

const getChartColor = (value) => {
  if (value >= 8.5) return '#2e7d32'
  if (value >= 7.5) return '#43a047'
  if (value >= 6.5) return '#66bb6a'
  return '#a5d6a7'
}

const renderRankingChart = () => {
  if (!rankingChartRef.value) {
    return
  }

  if (rankingChart) {
    rankingChart.destroy()
  }

  rankingChart = Highcharts.chart(rankingChartRef.value, chartOptions.value)
}

onMounted(() => {
  renderRankingChart()
})

watch(chartOptions, () => {
  renderRankingChart()
}, { deep: true })

onBeforeUnmount(() => {
  if (rankingChart) {
    rankingChart.destroy()
    rankingChart = null
  }
})
</script>

<style scoped lang="scss">
.highcharts-figure {
  margin: 0;
}

.highcharts-description {
  margin: 12px 0 0;
  font-size: 12px;
  line-height: 1.5;
  color: #6b7280;
}

.ranking-chart-canvas {
  width: 100%;
  min-height: 360px;
}
</style>
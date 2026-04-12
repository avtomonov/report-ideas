<template>
  <figure class="highcharts-figure">
    <div ref="factorsChartRef" class="chart-canvas"></div>
    <div ref="impactChartRef" class="chart-canvas chart-canvas--small"></div>

    <div class="insight-row">
      <div class="insight-item">
        <span class="insight-label">Суммарный прогнозный эффект</span>
        <span class="insight-value">+{{ totalUplift.toFixed(1) }} п.п.</span>
      </div>
      <div class="insight-item">
        <span class="insight-label">Самый сильный драйвер</span>
        <span class="insight-value">{{ strongestFactor.name }}</span>
      </div>
    </div>
  </figure>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import Highcharts from 'highcharts'

const factorsChartRef = ref(null)
const impactChartRef = ref(null)

let factorsChart = null
let impactChart = null

const factors = [
  { name: 'Качество обратной связи руководителя', delta: 2.4 },
  { name: 'Понятность целей команды', delta: 1.8 },
  { name: 'Баланс нагрузки', delta: 1.4 },
  { name: 'Прозрачность карьерных шагов', delta: 1.1 },
  { name: 'Скорость решения блокеров', delta: 0.9 }
]

const baseline = {
  happyIndex: 69.2,
  engagement: 71.4,
  loyalty: 67.1,
  satisfaction: 70.6
}

const scenario = {
  happyIndex: 74.0,
  engagement: 76.2,
  loyalty: 71.8,
  satisfaction: 74.3
}

const totalUplift = computed(() => Object.values(scenario).reduce((sum, value, idx) => {
  const base = Object.values(baseline)[idx]
  return sum + (value - base)
}, 0) / Object.keys(baseline).length)

const strongestFactor = computed(() => {
  return [...factors].sort((a, b) => b.delta - a.delta)[0]
})

const scalePalette = ['#ffc184', '#f7a8a1', '#d5e88c', '#b7d2a5', '#fde993']

const factorsOptions = computed(() => ({
  chart: {
    type: 'bar',
    height: 340,
    backgroundColor: 'transparent',
    plotAreaBackground: { color: '#fde993' }
  },
  title: {
    text: 'What-if: факторы роста индекса',
    style: { color: '#000000', fontSize: '16px', fontWeight: '700' }
  },
  subtitle: {
    text: 'Ожидаемый вклад каждого фактора, п.п.',
    style: { color: '#000000', fontSize: '12px' }
  },
  xAxis: {
    categories: factors.map((item) => item.name),
    title: { text: null },
    labels: { style: { color: '#000000', fontSize: '11px' } }
  },
  yAxis: {
    title: {
      text: 'Вклад, п.п.',
      style: { color: '#000000', fontWeight: '700' }
    },
    labels: { style: { color: '#000000' } },
    gridLineColor: '#ecf0f4'
  },
  tooltip: {
    style: { color: '#000000' },
    valueSuffix: ' п.п.'
  },
  legend: { enabled: false },
  credits: { enabled: false },
  series: [
    {
      name: 'Прирост',
      colorByPoint: true,
      data: factors.map((item, index) => ({
        y: item.delta,
        color: scalePalette[index % scalePalette.length]
      }))
    }
  ]
}))

const impactOptions = computed(() => ({
  chart: {
    type: 'column',
    height: 260,
    backgroundColor: 'transparent',
    plotAreaBackground: { color: '#fde993' }
  },
  title: {
    text: 'До и после сценария',
    style: { color: '#000000', fontSize: '15px', fontWeight: '700' }
  },
  xAxis: {
    categories: ['Happy Index', 'Вовлеченность', 'Лояльность', 'Удовлетворенность'],
    labels: { style: { color: '#000000', fontSize: '11px' } }
  },
  yAxis: {
    min: 50,
    max: 85,
    title: {
      text: 'Значение, %',
      style: { color: '#000000', fontWeight: '700' }
    },
    labels: { style: { color: '#000000' } },
    gridLineColor: '#ecf0f4'
  },
  legend: {
    itemStyle: { color: '#000000', fontWeight: '600' },
    itemHoverStyle: { color: '#000000' }
  },
  tooltip: {
    shared: true,
    style: { color: '#000000' },
    valueSuffix: '%'
  },
  credits: { enabled: false },
  series: [
    {
      name: 'База',
      color: '#d2d2d2',
      data: [baseline.happyIndex, baseline.engagement, baseline.loyalty, baseline.satisfaction]
    },
    {
      name: 'Сценарий',
      color: '#b7d2a5',
      data: [scenario.happyIndex, scenario.engagement, scenario.loyalty, scenario.satisfaction]
    }
  ]
}))

const renderFactorsChart = () => {
  if (!factorsChartRef.value) return

  if (factorsChart) factorsChart.destroy()
  factorsChart = Highcharts.chart(factorsChartRef.value, factorsOptions.value)
}

const renderImpactChart = () => {
  if (!impactChartRef.value) return

  if (impactChart) impactChart.destroy()
  impactChart = Highcharts.chart(impactChartRef.value, impactOptions.value)
}

onMounted(() => {
  renderFactorsChart()
  renderImpactChart()
})

watch(factorsOptions, renderFactorsChart, { deep: true })
watch(impactOptions, renderImpactChart, { deep: true })

onBeforeUnmount(() => {
  if (factorsChart) {
    factorsChart.destroy()
    factorsChart = null
  }

  if (impactChart) {
    impactChart.destroy()
    impactChart = null
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
  min-height: 250px;
  margin-top: 10px;
}

.insight-row {
  margin-top: 10px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.insight-item {
  padding: 10px;
  border-radius: 10px;
  border: 1px solid #d5e88c;
  background: #b7d2a5;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.insight-label {
  font-size: 12px;
  color: #000000;
}

.insight-value {
  font-size: 14px;
  font-weight: 700;
  color: #000000;
}

@media (max-width: 900px) {
  .insight-row {
    grid-template-columns: 1fr;
  }
}
</style>

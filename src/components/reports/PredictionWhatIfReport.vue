<template>
  <figure class="highcharts-figure">
    <div class="report-explainer">
      <h6 class="explainer-title q-ma-none">What-if симулятор факторов роста</h6>
      <p class="explainer-text q-ma-none">
        Этот отчет показывает, как управленческие изменения влияют на ключевые HR-метрики.
        Двигайте ползунки факторов ниже: графики и итоговые значения пересчитываются сразу.
      </p>
    </div>

    <div class="simulator-panel">
      <div class="simulator-header">
        <span class="simulator-title">Настройка сценария</span>
        <q-btn dense flat label="Сбросить" color="dark" @click="resetFactors" />
      </div>
      <p class="simulator-help q-ma-none">
        100% — базовая интенсивность инициативы, меньше 100% — ослабление,
        выше 100% — нелинейное усиление эффекта (до 400%).
      </p>

      <div v-for="factor in factors" :key="factor.name" class="simulator-row">
        <div class="simulator-row-head">
          <span class="simulator-name">{{ factor.name }}</span>
          <span class="simulator-value">{{ factor.level }}% | +{{ getAdjustedDelta(factor).toFixed(1) }} п.п.</span>
        </div>
        <q-slider
          v-model="factor.level"
          :min="0"
          :max="400"
          :step="5"
          color="positive"
          track-color="grey-3"
        />
      </div>
    </div>

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
      <div class="insight-item">
        <span class="insight-label">Статус сценария</span>
        <span class="insight-value">{{ scenarioStatus }}</span>
      </div>
    </div>

    <div class="metrics-summary">
      <div class="metrics-summary-title">Сводка по метрикам: что изменилось</div>
      <div class="metrics-table-head metrics-table-row">
        <span>Метрика</span>
        <span>База</span>
        <span>Сценарий</span>
        <span>Изменение</span>
      </div>
      <div v-for="row in metricSummary" :key="row.key" class="metrics-table-row">
        <span>{{ row.label }}</span>
        <span>{{ row.base }}%</span>
        <span>{{ row.scenario }}%</span>
        <span class="metrics-delta">{{ row.deltaSign }}{{ row.delta }} п.п.</span>
      </div>
    </div>

    <div class="report-notes">
      <div class="note-item">
        <span class="note-title">Что показывает верхний график</span>
        <span class="note-text">Вклад каждого фактора в общий прирост, с учетом выбранной интенсивности.</span>
      </div>
      <div class="note-item">
        <span class="note-title">Что показывает нижний график</span>
        <span class="note-text">Сравнение базовых значений метрик с результатом выбранного сценария.</span>
      </div>
      <div class="note-item">
        <span class="note-title">Как интерпретировать результат</span>
        <span class="note-text">Если суммарный эффект высокий, фокусируйтесь на факторах с наибольшим вкладом для приоритизации плана действий.</span>
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
const chartAnimation = { duration: 350 }

const factors = ref([
  {
    name: 'Качество обратной связи руководителя',
    delta: 2.4,
    level: 100,
    impacts: { happyIndex: 0.35, engagement: 0.3, loyalty: 0.2, satisfaction: 0.15 }
  },
  {
    name: 'Понятность целей команды',
    delta: 1.8,
    level: 100,
    impacts: { happyIndex: 0.2, engagement: 0.45, loyalty: 0.15, satisfaction: 0.2 }
  },
  {
    name: 'Баланс нагрузки',
    delta: 1.4,
    level: 100,
    impacts: { happyIndex: 0.25, engagement: 0.15, loyalty: 0.2, satisfaction: 0.4 }
  },
  {
    name: 'Прозрачность карьерных шагов',
    delta: 1.1,
    level: 100,
    impacts: { happyIndex: 0.1, engagement: 0.2, loyalty: 0.5, satisfaction: 0.2 }
  },
  {
    name: 'Скорость решения блокеров',
    delta: 0.9,
    level: 100,
    impacts: { happyIndex: 0.1, engagement: 0.2, loyalty: 0.15, satisfaction: 0.55 }
  }
])

const baseline = {
  happyIndex: 69.2,
  engagement: 71.4,
  loyalty: 67.1,
  satisfaction: 70.6
}

const metricOrder = ['happyIndex', 'engagement', 'loyalty', 'satisfaction']
const metricLabels = {
  happyIndex: 'Happy Index',
  engagement: 'Вовлеченность',
  loyalty: 'Лояльность',
  satisfaction: 'Удовлетворенность'
}

const clamp = (value, min, max) => Math.min(Math.max(value, min), max)

const getGrowthMultiplier = (level) => {
  const intensity = level / 100
  if (intensity <= 1) return intensity

  // Above baseline we use nonlinear acceleration to make slider impact clearly visible in bars.
  return 1 + Math.pow(intensity - 1, 1.5) * 3.6
}

const getAdjustedDelta = (factor) => Number((factor.delta * getGrowthMultiplier(factor.level)).toFixed(2))

const weightedFactors = computed(() => {
  return factors.value.map((factor) => ({
    ...factor,
    adjustedDelta: getAdjustedDelta(factor)
  }))
})

const scenario = computed(() => {
  const result = { ...baseline }

  weightedFactors.value.forEach((factor) => {
    result.happyIndex += factor.adjustedDelta * factor.impacts.happyIndex
    result.engagement += factor.adjustedDelta * factor.impacts.engagement
    result.loyalty += factor.adjustedDelta * factor.impacts.loyalty
    result.satisfaction += factor.adjustedDelta * factor.impacts.satisfaction
  })

  return {
    happyIndex: Number(clamp(result.happyIndex, 0, 100).toFixed(1)),
    engagement: Number(clamp(result.engagement, 0, 100).toFixed(1)),
    loyalty: Number(clamp(result.loyalty, 0, 100).toFixed(1)),
    satisfaction: Number(clamp(result.satisfaction, 0, 100).toFixed(1))
  }
})

const totalUplift = computed(() => Object.values(scenario.value).reduce((sum, value, idx) => {
  const base = Object.values(baseline)[idx]
  return sum + (value - base)
}, 0) / Object.keys(baseline).length)

const metricSummary = computed(() => {
  return metricOrder.map((key) => {
    const base = baseline[key]
    const next = scenario.value[key]
    const delta = Number((next - base).toFixed(1))

    return {
      key,
      label: metricLabels[key],
      base,
      scenario: next,
      delta: Math.abs(delta).toFixed(1),
      deltaSign: delta >= 0 ? '+' : '-'
    }
  })
})

const scenarioStatus = computed(() => {
  if (totalUplift.value >= 3) return 'Сильный рост'
  if (totalUplift.value >= 1.5) return 'Умеренный рост'
  return 'Слабый эффект'
})

const strongestFactor = computed(() => {
  return [...weightedFactors.value].sort((a, b) => b.adjustedDelta - a.adjustedDelta)[0]
})

const resetFactors = () => {
  factors.value.forEach((factor) => {
    factor.level = 100
  })
}

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
    categories: weightedFactors.value.map((item) => item.name),
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
    className: 'black-tooltip',
    useHTML: true,
    backgroundColor: '#000000',
    borderWidth: 0,
    shadow: false,
    style: { color: '#ffffff' },
    formatter() {
      return `<span style="color:#ffffff">${this.x}: <b>${this.y}</b> п.п.</span>`
    },
    valueSuffix: ' п.п.'
  },
  legend: { enabled: false },
  credits: { enabled: false },
  plotOptions: {
    series: {
      animation: chartAnimation
    }
  },
  series: [
    {
      name: 'Прирост',
      color: '#b7d2a5',
      data: weightedFactors.value.map((item) => item.adjustedDelta)
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
  plotOptions: {
    series: {
      animation: chartAnimation
    }
  },
  tooltip: {
    shared: true,
    className: 'black-tooltip',
    useHTML: true,
    backgroundColor: '#000000',
    borderWidth: 0,
    shadow: false,
    style: { color: '#ffffff' },
    formatter() {
      const points = this.points || []
      const rows = points
        .map((point) => `<span style="color:#ffffff">${point.series.name}: <b>${point.y}%</b></span>`)
        .join('<br/>')

      return `<span style="color:#ffffff">${this.x}</span><br/>${rows}`
    },
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
      data: [scenario.value.happyIndex, scenario.value.engagement, scenario.value.loyalty, scenario.value.satisfaction]
    }
  ]
}))

const renderFactorsChart = () => {
  if (!factorsChartRef.value) return

  if (factorsChart) return
  factorsChart = Highcharts.chart(factorsChartRef.value, factorsOptions.value)
}

const renderImpactChart = () => {
  if (!impactChartRef.value) return

  if (impactChart) return
  impactChart = Highcharts.chart(impactChartRef.value, impactOptions.value)
}

const updateFactorsChart = () => {
  if (!factorsChart) return

  const categories = weightedFactors.value.map((item) => item.name)
  const data = weightedFactors.value.map((item) => item.adjustedDelta)

  factorsChart.xAxis[0].setCategories(categories, false)
  factorsChart.series[0].setData(data, false, chartAnimation)
  factorsChart.redraw()
}

const updateImpactChart = () => {
  if (!impactChart) return

  const scenarioData = [
    scenario.value.happyIndex,
    scenario.value.engagement,
    scenario.value.loyalty,
    scenario.value.satisfaction
  ]

  impactChart.series[1].setData(scenarioData, false, chartAnimation)
  impactChart.redraw()
}

onMounted(() => {
  renderFactorsChart()
  renderImpactChart()
})

watch(weightedFactors, () => {
  updateFactorsChart()
  updateImpactChart()
}, { deep: true })

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

.report-explainer {
  margin-bottom: 12px;
  padding: 12px;
  border-radius: 10px;
  background: #f5f9ef;
  border: 1px solid #d5e88c;
}

.explainer-title {
  color: #000000;
  font-size: 16px;
  font-weight: 700;
}

.explainer-text {
  margin-top: 6px;
  color: #000000;
  font-size: 13px;
  line-height: 1.5;
}

.simulator-panel {
  margin-bottom: 12px;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  background: #ffffff;
}

.simulator-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 6px;
}

.simulator-title {
  color: #000000;
  font-size: 14px;
  font-weight: 700;
}

.simulator-help {
  color: #000000;
  font-size: 12px;
  line-height: 1.4;
  margin-bottom: 10px;
}

.simulator-row {
  margin-bottom: 10px;
}

.simulator-row:last-child {
  margin-bottom: 0;
}

.simulator-row-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 4px;
}

.simulator-name {
  color: #000000;
  font-size: 12px;
  font-weight: 600;
}

.simulator-value {
  color: #000000;
  font-size: 12px;
  font-weight: 700;
}

:deep(.highcharts-tooltip),
:deep(.highcharts-tooltip text),
:deep(.highcharts-tooltip span) {
  color: #000000 !important;
  fill: #000000 !important;
}

:global(.highcharts-tooltip.black-tooltip),
:global(.highcharts-tooltip.black-tooltip text),
:global(.highcharts-tooltip.black-tooltip tspan),
:global(.highcharts-tooltip.black-tooltip span) {
  color: #ffffff !important;
  fill: #ffffff !important;
}

:global(.highcharts-tooltip.black-tooltip span) {
  background: #000000 !important;
  border: none !important;
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
  grid-template-columns: repeat(3, minmax(0, 1fr));
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

.metrics-summary {
  margin-top: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  overflow: hidden;
}

.metrics-summary-title {
  padding: 10px 12px;
  background: #f8fafc;
  color: #000000;
  font-size: 13px;
  font-weight: 700;
  border-bottom: 1px solid #e5e7eb;
}

.metrics-table-row {
  display: grid;
  grid-template-columns: minmax(140px, 1.3fr) 0.7fr 0.7fr 0.9fr;
  gap: 8px;
  padding: 8px 12px;
  color: #000000;
  font-size: 12px;
  border-bottom: 1px solid #eef2f7;
}

.metrics-table-row:last-child {
  border-bottom: none;
}

.metrics-table-head {
  background: #f8fafc;
  font-weight: 700;
}

.metrics-delta {
  font-weight: 700;
}

.report-notes {
  margin-top: 12px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.note-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  border-radius: 10px;
  padding: 10px;
  background: #f8fafc;
  border: 1px solid #e5e7eb;
}

.note-title {
  color: #000000;
  font-size: 12px;
  font-weight: 700;
}

.note-text {
  color: #000000;
  font-size: 12px;
  line-height: 1.45;
}

@media (max-width: 900px) {
  .insight-row {
    grid-template-columns: 1fr;
  }

  .report-notes {
    grid-template-columns: 1fr;
  }

  .metrics-table-row {
    grid-template-columns: 1fr 1fr;
  }
}
</style>

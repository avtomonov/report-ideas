<template>
  <figure class="highcharts-figure">
    <div v-if="renderError" class="render-error">
      Не удалось отрисовать график. Обновите страницу или попробуйте позже.
    </div>
    <div ref="heatmapRef" class="chart-canvas"></div>
    <div ref="shareRef" class="chart-canvas chart-canvas--small"></div>

    <div class="risk-panel">
      <div class="risk-title">Зоны внимания (ниже порога {{ satisfiedMin }}):</div>
      <div class="risk-list">
        <span v-for="item in riskPoints" :key="item" class="risk-chip">{{ item }}</span>
      </div>
    </div>
  </figure>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import Highcharts from 'highcharts'

const heatmapRef = ref(null)
const shareRef = ref(null)
const renderError = ref(false)
let heatmapChart = null
let shareChart = null
let resizeHandler = null

const satisfiedMin = 4
const processes = ['Онбординг', 'ИТ-поддержка', 'Офис-сервис', 'Кадровый сервис', 'Финсервис']
const criteria = ['Скорость', 'Прозрачность', 'Вежливость', 'Полезность']

const matrix = [
  [0, 0, 4.2], [0, 1, 3.8], [0, 2, 4.4], [0, 3, 4.0],
  [1, 0, 3.6], [1, 1, 3.5], [1, 2, 4.1], [1, 3, 3.7],
  [2, 0, 4.3], [2, 1, 4.1], [2, 2, 4.5], [2, 3, 4.2],
  [3, 0, 3.9], [3, 1, 3.7], [3, 2, 4.0], [3, 3, 3.8],
  [4, 0, 3.4], [4, 1, 3.2], [4, 2, 3.9], [4, 3, 3.6]
]

const dissatisfiedShare = [28, 35, 17, 26, 39]

const riskPoints = computed(() => {
  return matrix
    .filter((item) => item[2] < satisfiedMin)
    .map((item) => `${processes[item[0]]} / ${criteria[item[1]]}`)
})

const heatmapOptions = computed(() => ({
  chart: {
    type: 'column',
    height: 340,
    backgroundColor: 'transparent',
    plotAreaBackground: { color: '#f7a8a1' }
  },
  title: {
    text: 'Матрица качества процессов (сравнение по критериям)'
  },
  xAxis: {
    categories: criteria,
    title: { text: 'Критерии' }
  },
  yAxis: {
    min: 3,
    max: 5,
    title: { text: 'Оценка' },
    plotLines: [
      {
        value: satisfiedMin,
        color: '#f7a8a1',
        width: 1,
        dashStyle: 'Dash',
        label: {
          text: `Порог ${satisfiedMin}`
        }
      }
    ]
  },
  tooltip: {
    shared: true,
    valueSuffix: ''
  },
  legend: {
    align: 'center',
    verticalAlign: 'bottom'
  },
  credits: { enabled: false },
  plotOptions: {
    column: {
      borderRadius: 3,
      pointPadding: 0.08,
      groupPadding: 0.08
    }
  },
  series: [
    ...processes.map((processName, processIndex) => {
      const points = criteria.map((_, criterionIndex) => {
        const point = matrix.find((item) => item[0] === processIndex && item[1] === criterionIndex)
        const value = point ? point[2] : null

        return {
          y: value,
          color: value === null ? '#d2d2d2' : value < satisfiedMin ? '#f7a8a1' : value < 4.3 ? '#ffc184' : '#b7d2a5'
        }
      })

      return {
        name: processName,
        data: points,
        dataLabels: {
          enabled: true,
          formatter() {
            return this.y?.toFixed(1)
          }
        }
      }
    })
  ]
}))

const shareOptions = computed(() => ({
  chart: {
    type: 'column',
    height: 260,
    backgroundColor: 'transparent',
    plotAreaBackground: { color: '#f7a8a1' }
  },
  title: {
    text: 'Доля неудовлетворенных по процессам, %'
  },
  xAxis: {
    categories: processes
  },
  yAxis: {
    max: 50,
    title: { text: 'Доля, %' },
    plotLines: [
      {
        value: 30,
        color: '#f7a8a1',
        width: 1,
        dashStyle: 'Dash',
        label: {
          text: 'Порог риска 30%'
        }
      }
    ]
  },
  tooltip: {
    valueSuffix: '%'
  },
  credits: { enabled: false },
  series: [
    {
      name: 'Неудовлетворенные',
      color: '#ffc184',
      data: dissatisfiedShare
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

const renderHeatmap = async () => {
  if (!heatmapRef.value) return

  const visible = await waitForVisibleContainer(heatmapRef)
  if (!visible) return

  try {
    if (heatmapChart) heatmapChart.destroy()
    heatmapChart = Highcharts.chart(heatmapRef.value, heatmapOptions.value)
    heatmapChart.reflow()
    renderError.value = false
  } catch {
    renderError.value = true
  }
}

const renderShare = async () => {
  if (!shareRef.value) return

  const visible = await waitForVisibleContainer(shareRef)
  if (!visible) return

  try {
    if (shareChart) shareChart.destroy()
    shareChart = Highcharts.chart(shareRef.value, shareOptions.value)
    shareChart.reflow()
    renderError.value = false
  } catch {
    renderError.value = true
  }
}

onMounted(async () => {
  await renderHeatmap()
  await renderShare()

  resizeHandler = () => {
    if (heatmapChart) heatmapChart.reflow()
    if (shareChart) shareChart.reflow()
  }

  window.addEventListener('resize', resizeHandler)
})

watch(heatmapOptions, renderHeatmap, { deep: true })
watch(shareOptions, renderShare, { deep: true })

onBeforeUnmount(() => {
  if (resizeHandler) {
    window.removeEventListener('resize', resizeHandler)
    resizeHandler = null
  }

  if (heatmapChart) {
    heatmapChart.destroy()
    heatmapChart = null
  }

  if (shareChart) {
    shareChart.destroy()
    shareChart = null
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

.risk-panel {
  margin-top: 10px;
  padding: 10px;
  background: #fff7ed;
  border: 1px solid #fed7aa;
  border-radius: 10px;
}

.risk-title {
  font-size: 12px;
  font-weight: 700;
  color: #9a3412;
  margin-bottom: 8px;
}

.risk-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.risk-chip {
  background: #ffedd5;
  border: 1px solid #fdba74;
  color: #9a3412;
  border-radius: 999px;
  padding: 2px 8px;
  font-size: 11px;
}

.render-error {
  margin-bottom: 10px;
  padding: 10px;
  border-radius: 10px;
  border: 1px solid #fecaca;
  background: #fff1f2;
  color: #9f1239;
  font-size: 12px;
}
</style>

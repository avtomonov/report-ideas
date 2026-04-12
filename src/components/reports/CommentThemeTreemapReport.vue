<template>
  <div class="highcharts-figure">
    <div class="chart-canvas" ref="chartContainer"></div>

    <div class="summary-strip">
      <div class="summary-pill redred">
        <span class="summary-title">Главная критика</span>
        <strong>{{ topCritique.name }}</strong>
        <span>{{ topCritique.value }} комментариев</span>
      </div>

      <div class="summary-pill yellow">
        <span class="summary-title">Самая сильная идея</span>
        <strong>{{ topProposal.name }}</strong>
        <span>Actionability: {{ topProposal.actionability }}%</span>
      </div>

      <div class="summary-pill green">
        <span class="summary-title">Точка опоры</span>
        <strong>{{ topPraise.name }}</strong>
        <span>Поддерживает метрику {{ topPraise.metric }}</span>
      </div>
    </div>

    <p class="highcharts-description">
      Отчет опирается на GetCommentsSummarization, GetCommentsReportCycleData и дерево тем комментариев:
      нейросеть группирует текст в смысловые кластеры и показывает, какие темы сильнее всего влияют
      на восприятие руководителя, среды и карьерных ожиданий сотрудников.
    </p>

    <div v-if="renderError" class="render-error">
      <p>Ошибка при отображении графика</p>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import Highcharts from 'highcharts'
import ExportingModule from 'highcharts/modules/exporting'
import ExportDataModule from 'highcharts/modules/export-data'
import AccessibilityModule from 'highcharts/modules/accessibility'
import TreemapModule from 'highcharts/modules/treemap'
import ColorAxisModule from 'highcharts/modules/coloraxis'

const initHighchartsModule = (module) => {
  const initializer = typeof module === 'function' ? module : module?.default

  if (typeof initializer === 'function') {
    initializer(Highcharts)
  }
}

initHighchartsModule(ExportingModule)
initHighchartsModule(ExportDataModule)
initHighchartsModule(AccessibilityModule)
initHighchartsModule(ColorAxisModule)
initHighchartsModule(TreemapModule)

const chartContainer = ref(null)
const renderError = ref(false)
let chartInstance = null

const themeNodes = [
  { id: 'all', name: 'Все темы', color: '#ffffff' },
  { id: 'critique', name: 'Критика', parent: 'all', color: '#f7a8a1' },
  { id: 'proposal', name: 'Предложения', parent: 'all', color: '#fde993' },
  { id: 'praise', name: 'Похвала', parent: 'all', color: '#b7d2a5' },
  { name: 'Перегрузка созвонов', parent: 'critique', value: 43, colorValue: -18, confidence: 88, actionability: 72, metric: 'Баланс нагрузки' },
  { name: 'Нет ясности роста', parent: 'critique', value: 38, colorValue: -11, confidence: 85, actionability: 81, metric: 'Карьерная прозрачность' },
  { name: 'Обратная связь запаздывает', parent: 'critique', value: 34, colorValue: -6, confidence: 83, actionability: 76, metric: 'Обратная связь руководителя' },
  { name: 'Нужны короткие one-to-one', parent: 'proposal', value: 31, colorValue: 8, confidence: 80, actionability: 89, metric: 'Обратная связь руководителя' },
  { name: 'Запрос на внутренние треки', parent: 'proposal', value: 29, colorValue: 15, confidence: 84, actionability: 92, metric: 'Карьерная прозрачность' },
  { name: 'Нужен прозрачный backlog', parent: 'proposal', value: 26, colorValue: 10, confidence: 79, actionability: 86, metric: 'Понятность целей' },
  { name: 'Сильная поддержка команды', parent: 'praise', value: 36, colorValue: 20, confidence: 87, actionability: 68, metric: 'Командное взаимодействие' },
  { name: 'Гибкий график помогает', parent: 'praise', value: 30, colorValue: 16, confidence: 82, actionability: 64, metric: 'Гибкость графика' },
  { name: 'Руководитель быстро снимает блокеры', parent: 'praise', value: 24, colorValue: 12, confidence: 86, actionability: 73, metric: 'Скорость решения блокеров' }
]

const leafNodes = computed(() => themeNodes.filter((node) => !node.id))

const topCritique = computed(() => {
  return leafNodes.value
    .filter((node) => node.parent === 'critique')
    .sort((left, right) => right.value - left.value)[0]
})

const topProposal = computed(() => {
  return leafNodes.value
    .filter((node) => node.parent === 'proposal')
    .sort((left, right) => right.actionability - left.actionability)[0]
})

const topPraise = computed(() => {
  return leafNodes.value
    .filter((node) => node.parent === 'praise')
    .sort((left, right) => right.value - left.value)[0]
})

const chartOptions = computed(() => ({
  chart: {
    height: 560,
    backgroundColor: 'transparent'
  },
  title: {
    text: 'Нейросетевой пульс тем в комментариях',
    style: { color: '#000000', fontSize: '18px', fontWeight: '700' }
  },
  subtitle: {
    text: 'Каждый блок показывает силу темы, а цвет отражает тональность кластера',
    style: { color: '#000000', fontSize: '12px' }
  },
  tooltip: {
    useHTML: true,
    backgroundColor: '#ffffff',
    borderColor: '#d2d2d2',
    style: { color: '#000000' },
    pointFormatter() {
      if (this.id) {
        return `<b>${this.name}</b>`
      }

      return [
        `<b>${this.name}</b>`,
        `Комментарии: <b>${this.value}</b>`,
        `Уверенность кластера: <b>${this.confidence}%</b>`,
        `Actionability: <b>${this.actionability}%</b>`,
        `Связанная метрика: <b>${this.metric}</b>`
      ].join('<br/>')
    }
  },
  colorAxis: {
    min: -20,
    max: 20,
    stops: [
      [0, '#f7a8a1'],
      [0.25, '#ffc184'],
      [0.5, '#fde993'],
      [0.75, '#d5e88c'],
      [1, '#b7d2a5']
    ],
    labels: {
      style: {
        color: '#000000'
      }
    }
  },
  plotOptions: {
    treemap: {
      allowTraversingTree: false,
      layoutAlgorithm: 'squarified',
      dataLabels: {
        enabled: true,
        style: {
          color: '#000000',
          fontWeight: '700',
          textOutline: 'none'
        }
      },
      borderColor: '#ffffff',
      borderWidth: 3
    }
  },
  credits: { enabled: false },
  accessibility: {
    enabled: true,
    description: 'Treemap тем комментариев, сгруппированных нейросетью по тональности'
  },
  exporting: { enabled: true },
  series: [
    {
      type: 'treemap',
      layoutAlgorithm: 'squarified',
      animationLimit: 1000,
      colorAxis: 0,
      colorKey: 'colorValue',
      levels: [
        {
          level: 1,
          dataLabels: {
            enabled: false
          }
        },
        {
          level: 2,
          layoutAlgorithm: 'sliceAndDice',
          dataLabels: {
            enabled: true,
            align: 'left',
            verticalAlign: 'top',
            style: {
              color: '#000000',
              fontSize: '14px',
              fontWeight: '700',
              textOutline: 'none'
            }
          }
        },
        {
          level: 3,
          dataLabels: {
            enabled: true,
            style: {
              color: '#000000',
              fontSize: '12px',
              fontWeight: '700',
              textOutline: 'none'
            }
          }
        }
      ],
      data: themeNodes
    }
  ]
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
      retries += 1
      requestAnimationFrame(attempt)
    }
  }

  attempt()
}

onMounted(() => {
  safeInitChart()
})

onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.destroy()
    chartInstance = null
  }
})
</script>

<style scoped>
.highcharts-figure {
  width: 100%;
  min-height: 770px;
  padding: 20px;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.chart-canvas {
  width: 100%;
  min-height: 560px;
}

.summary-strip {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-top: 14px;
}

.summary-pill {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 14px;
  border-radius: 14px;
  color: #000000;
}

.summary-title {
  font-size: 12px;
}

.summary-pill strong {
  font-size: 15px;
}

.summary-pill span {
  color: #000000;
}

.highcharts-description {
  margin: 14px 0 0;
  color: #000000;
  font-size: 13px;
  line-height: 1.45;
}

.render-error {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 560px;
  background-color: #f5f5f5;
  border-radius: 4px;
  color: #d32f2f;
  font-size: 14px;
}

.redred {
  background-color: #f7a8a1;
}

.yellow {
  background-color: #fde993;
}

.green {
  background-color: #b7d2a5;
}

@media (max-width: 900px) {
  .summary-strip {
    grid-template-columns: 1fr;
  }
}
</style>
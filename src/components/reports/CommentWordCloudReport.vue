<template>
  <div class="highcharts-figure">
    <div class="chart-canvas" ref="chartContainer"></div>

    <div class="insight-grid">
      <div class="insight-card green">
        <span class="insight-label">Самое частое слово</span>
        <span class="insight-value">{{ topWord.name }}</span>
        <span class="insight-meta">{{ topWord.weight }} упоминаний</span>
      </div>

      <div class="insight-card yellow">
        <span class="insight-label">Уникальных слов</span>
        <span class="insight-value">{{ cloudData.length }}</span>
        <span class="insight-meta">после очистки стоп-слов</span>
      </div>

      <div class="insight-card redred">
        <span class="insight-label">Всего слов в корпусе</span>
        <span class="insight-value">{{ totalWords }}</span>
        <span class="insight-meta">из комментариев сотрудников</span>
      </div>
    </div>

    <p class="highcharts-description">
      Облако слов построено по синтетической выборке комментариев из GetCommentsSummarization.
      Чем чаще слово встречается в тексте, тем крупнее оно на графике.
    </p>

    <div v-if="renderError" class="render-error">
      <p>Ошибка при отображении графика</p>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import Highcharts from 'highcharts'

const chartContainer = ref(null)
const renderError = ref(false)
let chartInstance = null
let resizeHandler = null
let intersectionObserver = null
let highchartsModulesReady = false

const initHighchartsModule = (module) => {
  const initializer = typeof module === 'function' ? module : module?.default
  if (typeof initializer === 'function') {
    initializer(Highcharts)
  }
}

const ensureHighchartsModules = async () => {
  if (highchartsModulesReady) return

  if (typeof window !== 'undefined') {
    window.Highcharts = Highcharts
    window._Highcharts = Highcharts
  }

  const [WordcloudModule, ExportingModule, ExportDataModule, AccessibilityModule, ZoomModule] = await Promise.all([
    import('highcharts/modules/wordcloud.js'),
    import('highcharts/modules/exporting.js'),
    import('highcharts/modules/export-data.js'),
    import('highcharts/modules/accessibility.js'),
    import('highcharts/modules/non-cartesian-zoom.js')
  ])

  initHighchartsModule(WordcloudModule)
  initHighchartsModule(ExportingModule)
  initHighchartsModule(ExportDataModule)
  initHighchartsModule(AccessibilityModule)
  initHighchartsModule(ZoomModule)

  highchartsModulesReady = true
}

const rawText = [
  'руководитель регулярно дает обратную связь и помогает с приоритетами',
  'хочется больше прозрачности по карьерному росту и грейдам',
  'в команде отличный климат и взаимопомощь между отделами',
  'слишком много согласований бюрократия тормозит задачи',
  'баланс работа жизнь стал лучше после гибкого графика',
  'стресс высокий из-за сжатых дедлайнов и нехватки ресурсов',
  'онбординг новых сотрудников проходит быстро и понятно',
  'нужны внешние курсы и развитие hard skills',
  'признание заслуг мотивирует и повышает вовлеченность',
  'иногда микроменеджмент снижает доверие к руководству',
  'коммуникации между командами улучшились но не везде',
  'дмс и льготы важны для благополучия сотрудников',
  'удаленная работа помогает концентрации и фокусу',
  'часть сотрудников хочет больше офлайн встреч',
  'нужно улучшить инструменты и скорость внутренних сервисов',
  'лояльность растет когда есть ясные цели и признание',
  'ценности компании важны но нужна последовательность в действиях',
  'вовлеченность выше там где лидер поддерживает инициативу',
  'не хватает времени на обучение и развитие',
  'психологический климат в целом позитивный и уважительный'
].join(' ')

const stopWords = new Set([
  'и', 'в', 'на', 'с', 'по', 'но', 'к', 'не', 'из', 'для', 'где', 'есть', 'там', 'когда', 'это',
  'как', 'а', 'о', 'от', 'же', 'или', 'всех', 'всем', 'быть', 'бы', 'ли', 'у', 'за', 'до', 'из-за'
])

const tokens = rawText
  .toLowerCase()
  .replace(/[0-9.,!?()"':;«»\-]/g, ' ')
  .split(/\s+/)
  .filter(Boolean)
  .filter(word => word.length > 2 && !stopWords.has(word))

const totalWords = tokens.length

const problemWords = new Set([
  'стресс', 'бюрократия', 'микроменеджмент', 'нехватки', 'дедлайнов', 'тормозит', 'согласований',
  'не', 'снижает', 'нехватает', 'нехватка'
])

const advantageWords = new Set([
  'вовлеченность', 'лояльность', 'признание', 'поддерживает', 'помогает', 'взаимопомощь',
  'позитивный', 'уважительный', 'лучше', 'росту', 'развитие', 'прозрачности', 'климат'
])

const getWordTone = (word) => {
  if (problemWords.has(word)) return 'problem'
  if (advantageWords.has(word)) return 'advantage'
  return 'neutral'
}

const getBoostedWeight = (word, weight) => {
  const tone = getWordTone(word)
  if (tone === 'problem') return Number((weight * 2.4).toFixed(1))
  if (tone === 'advantage') return Number((weight * 2.1).toFixed(1))
  return weight
}

const getWordColor = (word) => {
  const tone = getWordTone(word)
  if (tone === 'problem') return '#d62828'
  if (tone === 'advantage') return '#2a9d8f'
  return '#5f5f5f'
}

const cloudData = Object.entries(
  tokens.reduce((acc, word) => {
    acc[word] = (acc[word] || 0) + 1
    return acc
  }, {})
)
  .map(([name, weight]) => ({
    name,
    weight: getBoostedWeight(name, weight),
    originalWeight: weight,
    tone: getWordTone(name),
    color: getWordColor(name)
  }))
  .sort((a, b) => b.weight - a.weight)
  .slice(0, 65)

const topWord = cloudData[0] || { name: 'нет данных', weight: 0 }

const chartOptions = computed(() => ({
  accessibility: {
    screenReaderSection: {
      beforeChartFormat: '<h5>{chartTitle}</h5><div>{chartSubtitle}</div><div>{chartLongdesc}</div><div>{viewTableButton}</div>'
    }
  },
  chart: {
    zooming: { type: 'xy' },
    panning: { enabled: true, type: 'xy' },
    panKey: 'shift',
    height: 520,
    backgroundColor: 'transparent'
  },
  series: [
    {
      type: 'wordcloud',
      data: cloudData,
      name: 'Упоминания',
      rotation: {
        from: -20,
        to: 20,
        orientations: 3
      },
      spiral: 'rectangular'
    }
  ],
  title: {
    text: 'Облако слов комментариев сотрудников',
    align: 'left',
    style: { color: '#000000', fontSize: '18px', fontWeight: '700' }
  },
  subtitle: {
    text: 'Красный — проблемные слова, зелёный — слова о преимуществах',
    align: 'left',
    style: { color: '#444444', fontSize: '12px' }
  },
  tooltip: {
    headerFormat: '<span style="font-size: 16px"><b>{point.name}</b></span><br/>',
    pointFormat: 'Упоминаний: <b>{point.originalWeight}</b><br/>Акцентированный вес: <b>{point.weight}</b>'
  },
  credits: { enabled: false },
  exporting: { enabled: true }
}))

const initChart = async () => {
  await nextTick()

  if (!chartContainer.value || chartContainer.value.offsetWidth === 0) return

  try {
    await ensureHighchartsModules()

    if (chartInstance) {
      chartInstance.destroy()
    }

    chartInstance = Highcharts.chart(chartContainer.value, chartOptions.value)
    requestAnimationFrame(() => {
      chartInstance?.reflow()
    })
    renderError.value = false
  } catch (error) {
    console.error('Error rendering word cloud chart:', error)
    renderError.value = true
  }
}

onMounted(() => {
  resizeHandler = () => {
    if (chartInstance) {
      chartInstance.reflow()
    }
  }
  window.addEventListener('resize', resizeHandler)

  intersectionObserver = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && !chartInstance) {
        initChart()
      }
    },
    { threshold: 0.15 }
  )

  if (chartContainer.value) {
    intersectionObserver.observe(chartContainer.value)
  }
})

onBeforeUnmount(() => {
  if (intersectionObserver) {
    intersectionObserver.disconnect()
    intersectionObserver = null
  }

  if (resizeHandler) {
    window.removeEventListener('resize', resizeHandler)
    resizeHandler = null
  }

  if (chartInstance) {
    chartInstance.destroy()
    chartInstance = null
  }
})
</script>

<style scoped>
.highcharts-figure {
  width: 100%;
  min-height: 720px;
  padding: 20px;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.chart-canvas {
  width: 100%;
  min-height: 520px;
}

.insight-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-top: 14px;
}

.insight-card {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 14px;
  border-radius: 14px;
  color: #000000;
}

.green { background-color: #b7d2a5; }
.yellow { background-color: #fde993; }
.redred { background-color: #f7a8a1; }

.insight-label {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #555555;
}

.insight-value {
  font-size: 15px;
  font-weight: 700;
}

.insight-meta {
  font-size: 12px;
  color: #444444;
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
  min-height: 80px;
  margin-top: 16px;
  color: #c0392b;
  font-size: 13px;
}
</style>

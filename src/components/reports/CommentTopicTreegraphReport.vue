<template>
  <div class="highcharts-figure">
    <div class="chart-canvas" ref="chartContainer"></div>

    <div class="insight-grid">
      <div class="insight-card redred">
        <span class="insight-label">Самая нагруженная категория</span>
        <span class="insight-value">{{ hotCategory.name }}</span>
        <span class="insight-meta">{{ hotCategory.count }} упоминаний, {{ hotCategory.children }} подтем</span>
      </div>

      <div class="insight-card yellow">
        <span class="insight-label">Всего тем зафиксировано</span>
        <span class="insight-value">{{ totalLeafCount }}</span>
        <span class="insight-meta">в {{ topCategories.length }} основных категориях</span>
      </div>

      <div class="insight-card green">
        <span class="insight-label">Чаще всего упоминают</span>
        <span class="insight-value">{{ topLeaf.name }}</span>
        <span class="insight-meta">{{ topLeaf.count }} раз в категории «{{ topLeaf.parent }}»</span>
      </div>
    </div>

    <p class="highcharts-description">
      Дерево тем строится на основе GetCommentsSummarization. Каждая ветка — смысловой кластер отзывов
      из анкетирования. Глубина дерева показывает детализацию: от большой категории до конкретной темы.
      Данные обновляются после каждой волны опроса.
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

  const [TreemapModule, TreegraphModule, ExportingModule, AccessibilityModule] = await Promise.all([
    import('highcharts/modules/treemap.js'),
    import('highcharts/modules/treegraph.js'),
    import('highcharts/modules/exporting.js'),
    import('highcharts/modules/accessibility.js')
  ])

  initHighchartsModule(TreemapModule)
  initHighchartsModule(TreegraphModule)
  initHighchartsModule(ExportingModule)
  initHighchartsModule(AccessibilityModule)

  highchartsModulesReady = true
}

// ─── Topic tree data ──────────────────────────────────────────────────────────
// Structure: [parent, id, leafLevel?]
// leaf level = 6 (используется для уменьшенных маркеров, как в примере)
const treeData = [
  // Root
  [undefined, 'Темы комментариев'],

  // ── Категория 1: Условия работы
  ['Темы комментариев', 'Условия работы'],
  ['Условия работы', 'Офисная среда'],
  ['Условия работы', 'Удалённая работа'],
  ['Условия работы', 'Оборудование и инструменты'],
  ['Офисная среда', 'Чистота и порядок', 6],
  ['Офисная среда', 'Шум и концентрация', 6],
  ['Офисная среда', 'Зоны отдыха', 6],
  ['Удалённая работа', 'Связь и инфраструктура', 6],
  ['Удалённая работа', 'Баланс работа-дом', 6],
  ['Оборудование и инструменты', 'ПО и лицензии', 6],
  ['Оборудование и инструменты', 'Техника и гаджеты', 6],

  // ── Категория 2: Руководство
  ['Темы комментариев', 'Руководство'],
  ['Руководство', 'Стиль управления'],
  ['Руководство', 'Обратная связь'],
  ['Руководство', 'Доступность руководителя'],
  ['Стиль управления', 'Микроменеджмент', 6],
  ['Стиль управления', 'Делегирование', 6],
  ['Стиль управления', 'Поддержка в кризисах', 6],
  ['Обратная связь', 'Регулярность 1-on-1', 6],
  ['Обратная связь', 'Конструктивность критики', 6],
  ['Доступность руководителя', 'Открытость к диалогу', 6],
  ['Доступность руководителя', 'Время реакции', 6],

  // ── Категория 3: Развитие и карьера
  ['Темы комментариев', 'Развитие и карьера'],
  ['Развитие и карьера', 'Обучение'],
  ['Развитие и карьера', 'Карьерный рост'],
  ['Развитие и карьера', 'Признание заслуг'],
  ['Обучение', 'Внутренние тренинги', 6],
  ['Обучение', 'Внешние курсы', 6],
  ['Обучение', 'Онбординг новых', 6],
  ['Карьерный рост', 'Прозрачность грейдов', 6],
  ['Карьерный рост', 'Горизонтальный рост', 6],
  ['Карьерный рост', 'Перевод в другие отделы', 6],
  ['Признание заслуг', 'Публичная похвала', 6],
  ['Признание заслуг', 'Бонусы и награды', 6],

  // ── Категория 4: Корпоративная культура
  ['Темы комментариев', 'Корпоративная культура'],
  ['Корпоративная культура', 'Ценности компании'],
  ['Корпоративная культура', 'Командный дух'],
  ['Корпоративная культура', 'Разнообразие и инклюзия'],
  ['Ценности компании', 'Соответствие словам и делу', 6],
  ['Ценности компании', 'Миссия компании', 6],
  ['Командный дух', 'Взаимопомощь', 6],
  ['Командный дух', 'Совместные активности', 6],
  ['Разнообразие и инклюзия', 'Равные возможности', 6],
  ['Разнообразие и инклюзия', 'Уважение к мнению', 6],

  // ── Категория 5: Процессы и операции
  ['Темы комментариев', 'Процессы и операции'],
  ['Процессы и операции', 'Коммуникации внутри'],
  ['Процессы и операции', 'KPI и цели'],
  ['Процессы и операции', 'Бюрократия'],
  ['Коммуникации внутри', 'Информированность о решениях', 6],
  ['Коммуникации внутри', 'Кросс-командные связи', 6],
  ['KPI и цели', 'Прозрачность метрик', 6],
  ['KPI и цели', 'Реализм плановых показателей', 6],
  ['Бюрократия', 'Согласования и апрувы', 6],
  ['Бюрократия', 'Документооборот', 6],

  // ── Категория 6: Благополучие
  ['Темы комментариев', 'Благополучие'],
  ['Благополучие', 'Физическое здоровье'],
  ['Благополучие', 'Психологический климат'],
  ['Благополучие', 'Льготы и компенсации'],
  ['Физическое здоровье', 'ДМС и страховка', 6],
  ['Физическое здоровье', 'Спорт и фитнес', 6],
  ['Психологический климат', 'Уровень стресса', 6],
  ['Психологический климат', 'Токсичность в коллективе', 6],
  ['Льготы и компенсации', 'Питание и кофе-поинты', 6],
  ['Льготы и компенсации', 'Компенсация транспорта', 6]
]

// Имитация количества упоминаний по категориям первого уровня
const categoryStats = {
  'Условия работы':       { count: 312, children: 11 },
  'Руководство':          { count: 284, children: 11 },
  'Развитие и карьера':   { count: 267, children: 12 },
  'Корпоративная культура': { count: 198, children: 10 },
  'Процессы и операции':  { count: 241, children: 10 },
  'Благополучие':         { count: 175, children: 10 }
}

// Имитация топ-листов по конкретным темам
const leafStats = [
  { name: 'Уровень стресса',            count: 89, parent: 'Психологический климат' },
  { name: 'Баланс работа-дом',          count: 83, parent: 'Удалённая работа' },
  { name: 'Прозрачность грейдов',       count: 74, parent: 'Карьерный рост' },
  { name: 'Микроменеджмент',            count: 71, parent: 'Стиль управления' },
  { name: 'Согласования и апрувы',      count: 68, parent: 'Бюрократия' }
]

const topCategories = Object.entries(categoryStats).map(([name, s]) => ({ name, ...s }))

const hotCategory = computed(() =>
  [...topCategories].sort((a, b) => b.count - a.count)[0]
)

const totalLeafCount = computed(() =>
  treeData.filter(d => d[2] === 6).length
)

const topLeaf = computed(() =>
  [...leafStats].sort((a, b) => b.count - a.count)[0]
)

// ─── Chart ────────────────────────────────────────────────────────────────────
const chartOptions = computed(() => ({
  chart: {
    spacingBottom: 30,
    marginRight: 160,
    height: 1400,
    backgroundColor: 'transparent'
  },
  title: {
    text: 'Дерево тем сотрудников',
    style: { color: '#000000', fontSize: '18px', fontWeight: '700' }
  },
  subtitle: {
    text: 'Смысловые кластеры из GetCommentsSummarization — от категории до конкретной темы',
    style: { color: '#444444', fontSize: '12px' }
  },
  series: [
    {
      type: 'treegraph',
      keys: ['parent', 'id', 'level'],
      clip: false,
      data: treeData,
      marker: {
        symbol: 'circle',
        radius: 6,
        fillColor: '#ffffff',
        lineWidth: 3
      },
      dataLabels: {
        align: 'left',
        pointFormat: '{point.id}',
        style: {
          color: '#000000',
          textOutline: '3px contrast',
          whiteSpace: 'nowrap',
          fontSize: '12px',
          fontWeight: '500'
        },
        x: 24,
        crop: false,
        overflow: 'none'
      },
      levels: [
        {
          level: 1,
          levelIsConstant: false
        },
        {
          level: 2,
          colorByPoint: true
        },
        {
          level: 3,
          colorVariation: {
            key: 'brightness',
            to: -0.5
          }
        },
        {
          level: 4,
          colorVariation: {
            key: 'brightness',
            to: 0.5
          }
        },
        {
          level: 6,
          dataLabels: {
            x: 10
          },
          marker: {
            radius: 4
          }
        }
      ]
    }
  ],
  tooltip: {
    useHTML: true,
    backgroundColor: '#ffffff',
    borderColor: '#d2d2d2',
    style: { color: '#000000' },
    pointFormatter() {
      return `<b>${this.id}</b>`
    }
  },
  credits: { enabled: false },
  exporting: { enabled: true },
  accessibility: {
    enabled: true,
    description: 'Дерево тем комментариев сотрудников.'
  }
}))

// ─── Init / lifecycle ─────────────────────────────────────────────────────────
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
    console.error('Error rendering treegraph chart:', error)
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

    if (
      chartContainer.value
      && chartContainer.value.offsetParent !== null
      && chartContainer.value.offsetWidth > 0
      && chartContainer.value.offsetHeight > 0
    ) {
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

  resizeHandler = () => {
    if (chartInstance) {
      chartInstance.reflow()
    } else {
      safeInitChart()
    }
  }

  window.addEventListener('resize', resizeHandler)
})

onBeforeUnmount(() => {
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
}

.chart-canvas {
  width: 100%;
  min-height: 400px;
}

.insight-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-top: 20px;
}

.insight-card {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 14px 16px;
  border-radius: 10px;
  background: #f5f5f5;
}

.insight-card.redred  { background: rgba(247, 168, 161, 0.3); }
.insight-card.yellow  { background: rgba(253, 233, 147, 0.4); }
.insight-card.green   { background: rgba(183, 210, 165, 0.35); }

.insight-label {
  font-size: 11px;
  color: #555;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.insight-value {
  font-size: 16px;
  font-weight: 700;
  color: #000;
}

.insight-meta {
  font-size: 12px;
  color: #444;
}

.highcharts-description {
  margin-top: 16px;
  font-size: 12px;
  color: #666;
  line-height: 1.5;
}

.render-error {
  color: #c0392b;
  font-size: 13px;
  margin-top: 10px;
}
</style>

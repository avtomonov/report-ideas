<template>
  <q-page class="reports-dashboard q-pa-md">
    <div class="reports-container q-mb-lg">
      <section
        v-for="(report, index) in reportItems"
        :key="report.title"
        class="report-card"
      >
        <div class="report-card__header">
          <div class="report-card__number">{{ String(index + 1).padStart(2, '0') }}</div>
          <div class="report-card__title">{{ report.title }}</div>
          <div class="report-card__likes">
            <q-btn
              dense
              flat
              round
              icon="thumb_up"
              color="positive"
              :disable="!likesAvailable"
              :loading="likesPending[report.id] === true"
              @click="likeReport(report.id)"
            />
            <span class="report-card__likes-count">{{ likesMap[report.id] ?? 0 }}</span>
          </div>
        </div>
        <q-separator class="report-card__separator" />
        <component :is="report.component" />
      </section>
    </div>


    <div class="likes-overview q-mt-md">
      <div class="likes-overview__head">
        <div class="likes-overview__title">Голосование по интересу к отчётам</div>
        <div class="likes-overview__total">Всего голосов: {{ totalLikes }}</div>
      </div>
      <div
        v-if="likesStatusMessage"
        class="likes-overview__status"
        :class="{ 'likes-overview__status--error': !likesAvailable }"
      >
        {{ likesStatusMessage }}
      </div>
      <div class="likes-overview__chips">
        <div
          v-for="(item, rank) in topLikedReports"
          :key="item.id"
          class="likes-chip"
        >
          <span class="likes-chip__rank">{{ rank + 1 }}</span>
          <span class="likes-chip__title">{{ item.title }}</span>
          <span class="likes-chip__count">{{ item.likes }}</span>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { computed, markRaw, onMounted, ref } from 'vue'
import EngagementVsLoyalty from './reports/EngagementVsLoyalty.vue'
import DepartmentMetricsByUnit from './reports/DepartmentMetricsByUnit.vue'
import DepartmentHappinessRankingList from './reports/DepartmentHappinessRankingList.vue'
import DepartmentHappinessRangeChart from './reports/DepartmentHappinessRangeChart.vue'
import ParticipationTrends from './reports/ParticipationTrends.vue'
import CommentsAnalysis from './reports/CommentsAnalysis.vue'
import ThemeTreeChart from './reports/ThemeTreeChart.vue'
import HappyIndexRussiaMap from './reports/HappyIndexRussiaMap.vue'
import HappyIndexWorldGlobe from './reports/HappyIndexWorldGlobe.vue'
import QuestionSpeedRiskReport from './reports/QuestionSpeedRiskReport.vue'
import PredictionWhatIfReport from './reports/PredictionWhatIfReport.vue'
import ActionPlanSlaReport from './reports/ActionPlanSlaReport.vue'
import BenchmarkVolatilityReport from './reports/BenchmarkVolatilityReport.vue'
import ServiceQualityThresholdReport from './reports/ServiceQualityThresholdReport.vue'
import DepartmentQualityCategoryReport from './reports/DepartmentQualityCategoryReport.vue'
import DepartmentEngagementHeatmap from './reports/DepartmentEngagementHeatmap.vue'
import MetricsCorrelationReport from './reports/MetricsCorrelationReport.vue'
import EmployeeGroupDistributionReport from './reports/EmployeeGroupDistributionReport.vue'
import DepartmentComparisonReport from './reports/DepartmentComparisonReport.vue'
import MetricsPrioritiesReport from './reports/MetricsPrioritiesReport.vue'
import UserMetricRatingsScatterReport from './reports/UserMetricRatingsScatterReport.vue'
import UserEngagementOnlyScatterReport from './reports/UserEngagementOnlyScatterReport.vue'
import CorrelationImportanceInsightReport from './reports/CorrelationImportanceInsightReport.vue'
import MetricImportanceRankingReport from './reports/MetricImportanceRankingReport.vue'
import NeuralRiskHeatmapReport from './reports/NeuralRiskHeatmapReport.vue'
import CommentThemeTreemapReport from './reports/CommentThemeTreemapReport.vue'
import EmployeeTransitionSankeyReport from './reports/EmployeeTransitionSankeyReport.vue'
import EmployeeSegmentParallelReport from './reports/EmployeeSegmentParallelReport.vue'
import CommentTopicTreegraphReport from './reports/CommentTopicTreegraphReport.vue'
import GenderEngagementPictorialReport from './reports/GenderEngagementPictorialReport.vue'
import CommentThemePackedBubbleReport from './reports/CommentThemePackedBubbleReport.vue'
import MetricCorrelationArcReport from './reports/MetricCorrelationArcReport.vue'
import CommentWordCloudReport from './reports/CommentWordCloudReport.vue'


const selectedPeriod = ref('Q4 2024')
const selectedDepartment = ref('All Departments')
const isRefreshing = ref(false)
const lastUpdate = ref(new Date())
const likesMap = ref({})
const likesPending = ref({})
const likesAvailable = ref(true)
const likesStatusMessage = ref('')

const periods = [
  { label: 'Q2 2024', value: 'Q2 2024' },
  { label: 'Q3 2024', value: 'Q3 2024' },
  { label: 'Q4 2024', value: 'Q4 2024' },
  { label: 'Этот год', value: 'This Year' }
]

const reportItems = [
  { id: 'department-metrics', title: 'Результаты отделов: метрики', component: markRaw(DepartmentMetricsByUnit) },
  { id: 'department-ranking', title: 'Результаты отделов: рейтинг', component: markRaw(DepartmentHappinessRankingList) },
  { id: 'department-range', title: 'Результаты отделов: диапазоны оценок', component: markRaw(DepartmentHappinessRangeChart) },
  { id: 'engagement-vs-loyalty', title: 'Вовлеченность и лояльность', component: markRaw(EngagementVsLoyalty) },
  { id: 'participation-trends', title: 'Тренды участия', component: markRaw(ParticipationTrends) },
  { id: 'comments-analysis', title: 'Анализ комментариев', component: markRaw(CommentsAnalysis) },
  { id: 'theme-tree', title: 'Дерево тем сотрудников', component: markRaw(ThemeTreeChart) },
  { id: 'russia-map', title: 'Happy Index по регионам России', component: markRaw(HappyIndexRussiaMap) },
  { id: 'world-globe', title: 'Happy Index по странам мира', component: markRaw(HappyIndexWorldGlobe) },
  { id: 'question-speed-risk', title: 'Скорость прохождения и риск прокликивания', component: markRaw(QuestionSpeedRiskReport) },
  { id: 'prediction-what-if', title: 'What-if симулятор факторов роста', component: markRaw(PredictionWhatIfReport) },
  { id: 'action-plan-sla', title: 'Action Plan: SLA и дедлайны', component: markRaw(ActionPlanSlaReport) },
  { id: 'benchmark-volatility', title: 'Квартильная волатильность бенчмарка', component: markRaw(BenchmarkVolatilityReport) },
  { id: 'service-quality-threshold', title: 'Качество сервисных процессов и порог', component: markRaw(ServiceQualityThresholdReport) },
  { id: 'department-quality-category', title: 'Распределение по качеству метрик', component: markRaw(DepartmentQualityCategoryReport) },
  // { title: 'Тепловая карта вовлеченности', component: markRaw(DepartmentEngagementHeatmap) },
  { id: 'metrics-correlation', title: 'Корреляция метрик', component: markRaw(MetricsCorrelationReport) },
  // { title: 'Распределение сотрудников по группам', component: markRaw(EmployeeGroupDistributionReport) },
  { id: 'department-comparison', title: 'Сравнение отделов по метрикам', component: markRaw(DepartmentComparisonReport) },
  { id: 'metrics-priorities', title: 'Приоритизация метрик', component: markRaw(MetricsPrioritiesReport) },
  { id: 'user-metric-ratings', title: 'Оценки пользователей по метрикам', component: markRaw(UserMetricRatingsScatterReport) },
  { id: 'user-engagement-only', title: 'Оценки по метрике Вовлеченность', component: markRaw(UserEngagementOnlyScatterReport) },
  { id: 'correlation-importance', title: 'Корреляция метрик и важность', component: markRaw(CorrelationImportanceInsightReport) },
  { id: 'metric-importance-ranking', title: 'Рейтинг важности метрик', component: markRaw(MetricImportanceRankingReport) },
  { id: 'neural-risk-heatmap', title: 'ИИ-прогноз рисков по сегментам', component: markRaw(NeuralRiskHeatmapReport) },
  { id: 'comment-theme-treemap', title: 'Нейросетевой пульс тем комментариев', component: markRaw(CommentThemeTreemapReport) },
  { id: 'employee-transition-sankey', title: 'Прогноз переходов сотрудников', component: markRaw(EmployeeTransitionSankeyReport) },
  { id: 'employee-segment-parallel', title: 'Параллельные профили сегментов', component: markRaw(EmployeeSegmentParallelReport) },
  { id: 'comment-topic-treegraph', title: 'Дерево тем комментариев', component: markRaw(CommentTopicTreegraphReport) },
  { id: 'gender-engagement', title: 'Вовлечённость по полу', component: markRaw(GenderEngagementPictorialReport) },
  // { title: 'Темы комментариев: пузыри', component: markRaw(CommentThemePackedBubbleReport) },
  { id: 'metric-correlation-arc', title: 'Корреляции HR-метрик: дуги', component: markRaw(MetricCorrelationArcReport) },
  { id: 'comment-word-cloud', title: 'Облако слов комментариев', component: markRaw(CommentWordCloudReport) }
]

const buildEmptyLikesMap = () => {
  return reportItems.reduce((acc, report) => {
    acc[report.id] = 0
    return acc
  }, {})
}

const readLikesResponse = async (response) => {
  const payload = await response.json().catch(() => ({}))

  if (!response.ok) {
    const error = new Error(payload.details || payload.error || 'Likes backend request failed')
    error.statusCode = response.status
    throw error
  }

  return payload
}

const loadLikesFromBackend = async () => {
  const response = await fetch('/api/report-likes')
  const payload = await readLikesResponse(response)
  likesMap.value = {
    ...buildEmptyLikesMap(),
    ...(payload.likes || {})
  }
  likesAvailable.value = true
  likesStatusMessage.value = ''
}

const likeReport = async (reportId) => {
  if (!likesAvailable.value) {
    return
  }

  likesPending.value = {
    ...likesPending.value,
    [reportId]: true
  }

  try {
    const response = await fetch('/api/report-likes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reportId, delta: 1 })
    })

    const payload = await readLikesResponse(response)
    likesMap.value = {
      ...likesMap.value,
      [reportId]: payload.likeCount
    }
    likesStatusMessage.value = ''
  } catch (error) {
    likesStatusMessage.value = error instanceof Error
      ? error.message
      : 'Лайки временно недоступны. Попробуйте позже.'

    if (error?.statusCode === 503) {
      likesAvailable.value = false
    }
  } finally {
    likesPending.value = {
      ...likesPending.value,
      [reportId]: false
    }
  }
}

const topLikedReports = computed(() => {
  return [...reportItems]
    .map((item) => ({
      id: item.id,
      title: item.title,
      likes: Number(likesMap.value[item.id] || 0)
    }))
    .sort((a, b) => b.likes - a.likes)
    .slice(0, 6)
})

const totalLikes = computed(() => {
  return Object.values(likesMap.value).reduce((sum, value) => sum + Number(value || 0), 0)
})

onMounted(async () => {
  likesMap.value = buildEmptyLikesMap()

  try {
    await loadLikesFromBackend()
  } catch (error) {
    likesAvailable.value = false
    likesStatusMessage.value = error instanceof Error
      ? error.message
      : 'Лайки недоступны. Настройте Vercel базу данных.'
  }
})

const formatDate = (date) => {
  return new Intl.DateTimeFormat('ru-RU', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

const refreshData = async () => {
  isRefreshing.value = true
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1500))
  lastUpdate.value = new Date()
  isRefreshing.value = false
}
</script>

<style scoped lang="scss">
.reports-dashboard {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;

  .likes-overview {
    background: #ffffff;
    border: 1px solid rgba(148, 163, 184, 0.25);
    border-radius: 16px;
    padding: 12px;
    box-shadow: 0 10px 25px rgba(15, 23, 42, 0.06);
  }

  .likes-overview__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 10px;
  }

  .likes-overview__title {
    font-size: 14px;
    font-weight: 700;
    color: #0f172a;
  }

  .likes-overview__total {
    font-size: 13px;
    font-weight: 700;
    color: #166534;
    background: rgba(34, 197, 94, 0.12);
    border-radius: 999px;
    padding: 4px 10px;
    border: 1px solid rgba(34, 197, 94, 0.2);
  }

  .likes-overview__chips {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
  }

  .likes-overview__status {
    margin-bottom: 10px;
    padding: 10px 12px;
    border-radius: 12px;
    background: rgba(59, 130, 246, 0.08);
    border: 1px solid rgba(59, 130, 246, 0.14);
    color: #1d4ed8;
    font-size: 13px;
    font-weight: 600;
  }

  .likes-overview__status--error {
    background: rgba(239, 68, 68, 0.08);
    border-color: rgba(239, 68, 68, 0.16);
    color: #b91c1c;
  }

  .likes-chip {
    display: grid;
    grid-template-columns: 24px 1fr auto;
    align-items: center;
    gap: 8px;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    padding: 7px 9px;
    background: #f8fafc;
  }

  .likes-chip__rank {
    width: 24px;
    height: 24px;
    border-radius: 8px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #0f766e 0%, #22c55e 100%);
    color: #ffffff;
    font-size: 12px;
    font-weight: 700;
  }

  .likes-chip__title {
    color: #0f172a;
    font-size: 12px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .likes-chip__count {
    color: #166534;
    font-size: 12px;
    font-weight: 700;
  }

  .reports-container {
    display: grid;
    gap: 16px;
    overflow-x: auto;
    padding-bottom: 12px;
    scroll-behavior: smooth;

    &::-webkit-scrollbar {
      height: 6px;
    }

    &::-webkit-scrollbar-track {
      background: #f0f0f0;
      border-radius: 3px;
    }

    &::-webkit-scrollbar-thumb {
      background: #ccc;
      border-radius: 3px;

      &:hover {
        background: #999;
      }
    }
  }

  .report-card {
    background: #ffffff;
    border: 1px solid rgba(148, 163, 184, 0.2);
    border-radius: 18px;
    padding: 16px;
    box-shadow: 0 18px 40px rgba(15, 23, 42, 0.08);
    transition: transform 0.2s ease, box-shadow 0.2s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 22px 42px rgba(15, 23, 42, 0.12);
    }
  }

  .report-card__header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
  }

  .report-card__number {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 12px;
    background: linear-gradient(135deg, #0f766e 0%, #22c55e 100%);
    color: #ffffff;
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 0.08em;
  }

  .report-card__title {
    flex: 1;
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: #0f172a;
  }

  .report-card__likes {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 3px 8px;
    border-radius: 999px;
    background: rgba(34, 197, 94, 0.1);
    border: 1px solid rgba(34, 197, 94, 0.25);
  }

  .report-card__likes-label {
    font-size: 11px;
    font-weight: 600;
    color: #166534;
  }

  .report-card__likes-count {
    min-width: 28px;
    text-align: right;
    font-size: 13px;
    font-weight: 700;
    color: #166534;
  }

  .report-card__separator {
    margin-bottom: 16px;
    background: linear-gradient(90deg, #22c55e 0%, rgba(34, 197, 94, 0.08) 100%);
  }

  .dashboard-header {
    background: white;
    padding: 12px 24px;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 24px;

      .title-section {
        flex: 1;

        h1 {
          font-size: 28px;
          font-weight: 700;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .text-subtitle2 {
          font-weight: 400;
        }
      }

      .header-actions {
        display: flex;
        gap: 8px;
      }
    }

    @media (max-width: 768px) {
      .header-content {
        flex-direction: column;
        align-items: flex-start;

        .header-actions {
          width: 100%;
          justify-content: flex-end;
        }
      }
    }
  }

  .filter-bar {
    display: flex;
    gap: 12px;
    align-items: center;
    flex-wrap: wrap;

    :deep(.q-field__control) {
      height: 40px;
    }

    @media (max-width: 768px) {
      flex-direction: column;
      align-items: stretch;

      :deep(.q-select) {
        width: 100%;
      }
    }
  }

  .dashboard-footer {
    border-top: 1px solid rgba(0, 0, 0, 0.08);
    color: #000000;
  }

  @media (max-width: 900px) {
    .likes-overview__head {
      flex-direction: column;
      align-items: flex-start;
    }

    .likes-overview__chips {
      grid-template-columns: 1fr;
    }

    .report-card__header {
      flex-wrap: wrap;
      align-items: flex-start;
    }

    .report-card__likes {
      margin-left: 52px;
    }
  }

  .orange {
    background-color: #ffc184;
  }

  .redred {
    background-color: #f7a8a1;
  }

  .light-green {
    background-color: #d5e88c;
  }

  .green {
    background-color: #b7d2a5;
  }

  .yellow {
    background-color: #fde993;
  }

  .gray {
    background-color: #d2d2d2;
  }
}
</style>

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
        </div>
        <q-separator class="report-card__separator" />
        <component :is="report.component" />
      </section>
    </div>

    <!-- Footer with last update -->
    <div class="dashboard-footer q-mt-lg q-pt-md text-center text-caption">
      Последнее обновление: {{ formatDate(lastUpdate) }}
    </div>
  </q-page>
</template>

<script setup>
import { markRaw, ref } from 'vue'
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

const periods = [
  { label: 'Q2 2024', value: 'Q2 2024' },
  { label: 'Q3 2024', value: 'Q3 2024' },
  { label: 'Q4 2024', value: 'Q4 2024' },
  { label: 'Этот год', value: 'This Year' }
]

const reportItems = [
  { title: 'Результаты отделов: метрики', component: markRaw(DepartmentMetricsByUnit) },
  { title: 'Результаты отделов: рейтинг', component: markRaw(DepartmentHappinessRankingList) },
  { title: 'Результаты отделов: диапазоны оценок', component: markRaw(DepartmentHappinessRangeChart) },
  { title: 'Вовлеченность и лояльность', component: markRaw(EngagementVsLoyalty) },
  { title: 'Тренды участия', component: markRaw(ParticipationTrends) },
  { title: 'Анализ комментариев', component: markRaw(CommentsAnalysis) },
  { title: 'Дерево тем сотрудников', component: markRaw(ThemeTreeChart) },
  { title: 'Happy Index по регионам России', component: markRaw(HappyIndexRussiaMap) },
  { title: 'Happy Index по странам мира', component: markRaw(HappyIndexWorldGlobe) },
  { title: 'Скорость прохождения и риск прокликивания', component: markRaw(QuestionSpeedRiskReport) },
  { title: 'What-if симулятор факторов роста', component: markRaw(PredictionWhatIfReport) },
  { title: 'Action Plan: SLA и дедлайны', component: markRaw(ActionPlanSlaReport) },
  { title: 'Квартильная волатильность бенчмарка', component: markRaw(BenchmarkVolatilityReport) },
  { title: 'Качество сервисных процессов и порог', component: markRaw(ServiceQualityThresholdReport) },
  { title: 'Распределение по качеству метрик', component: markRaw(DepartmentQualityCategoryReport) },
  // { title: 'Тепловая карта вовлеченности', component: markRaw(DepartmentEngagementHeatmap) },
  { title: 'Корреляция метрик', component: markRaw(MetricsCorrelationReport) },
  // { title: 'Распределение сотрудников по группам', component: markRaw(EmployeeGroupDistributionReport) },
  { title: 'Сравнение отделов по метрикам', component: markRaw(DepartmentComparisonReport) },
  { title: 'Приоритизация метрик', component: markRaw(MetricsPrioritiesReport) },
  { title: 'Оценки пользователей по метрикам', component: markRaw(UserMetricRatingsScatterReport) },
  { title: 'Оценки по метрике Вовлеченность', component: markRaw(UserEngagementOnlyScatterReport) },
  { title: 'Корреляция метрик и важность', component: markRaw(CorrelationImportanceInsightReport) },
  { title: 'Рейтинг важности метрик', component: markRaw(MetricImportanceRankingReport) },
  { title: 'ИИ-прогноз рисков по сегментам', component: markRaw(NeuralRiskHeatmapReport) },
  { title: 'Нейросетевой пульс тем комментариев', component: markRaw(CommentThemeTreemapReport) },
  { title: 'Прогноз переходов сотрудников', component: markRaw(EmployeeTransitionSankeyReport) },
  { title: 'Параллельные профили сегментов', component: markRaw(EmployeeSegmentParallelReport) },
  { title: 'Дерево тем комментариев', component: markRaw(CommentTopicTreegraphReport) },
  { title: 'Вовлечённость по полу', component: markRaw(GenderEngagementPictorialReport) },
  // { title: 'Темы комментариев: пузыри', component: markRaw(CommentThemePackedBubbleReport) },
  { title: 'Корреляции HR-метрик: дуги', component: markRaw(MetricCorrelationArcReport) },
  { title: 'Облако слов комментариев', component: markRaw(CommentWordCloudReport) }
]

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
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: #0f172a;
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

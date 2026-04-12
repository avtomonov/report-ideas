<template>
  <q-card class="department-card">
    <q-card-section>
      <div class="header">
        <h6 class="q-ma-none">Результаты отделов</h6>
        <q-btn flat dense round icon="more_vert" size="sm" />
      </div>
    </q-card-section>

    <q-separator />

    <q-card-section>
      <div class="department-grid">
        <div class="dept-item" v-for="dept in departments" :key="dept.id">
          <div class="dept-name">{{ dept.name }}</div>
          
          <div class="metrics">
            <div class="metric">
              <span class="metric-label">Вовлеченность</span>
              <q-linear-progress :value="dept.engagement / 100" :color="getColor(dept.engagement)" class="q-mt-xs" />
              <span class="metric-value">{{ dept.engagement }}%</span>
            </div>
            
            <div class="metric">
              <span class="metric-label">Лояльность</span>
              <q-linear-progress :value="dept.loyalty / 100" :color="getColor(dept.loyalty)" class="q-mt-xs" />
              <span class="metric-value">{{ dept.loyalty }}%</span>
            </div>
            
            <div class="metric">
              <span class="metric-label">Удовлетворение</span>
              <q-linear-progress :value="dept.satisfaction / 100" :color="getColor(dept.satisfaction)" class="q-mt-xs" />
              <span class="metric-value">{{ dept.satisfaction }}%</span>
            </div>
          </div>

          <div class="dept-footer">
            <span class="employee-count">{{ dept.employees }} сотр.</span>
            <span class="trend" :style="{ color: dept.trend > 0 ? '#4caf50' : '#f44336' }">
              <q-icon :name="dept.trend > 0 ? 'trending_up' : 'trending_down'" size="16px" />
              {{ Math.abs(dept.trend) }}%
            </span>
          </div>
        </div>
      </div>

      <q-separator class="q-my-md" />

      <div class="department-ranking">
        <div class="ranking-title">Рейтинг по индексу счастья</div>
        <div class="ranking-list">
          <div class="ranking-item" v-for="(dept, index) in rankings" :key="dept.id">
            <div class="rank-badge">{{ index + 1 }}</div>
            <div class="rank-name">{{ dept.name }}</div>
            <div class="rank-score">{{ dept.score }}%</div>
          </div>
        </div>
      </div>

      <q-separator class="q-my-md" />

      <div class="department-ranking-chart">
        <figure class="highcharts-figure">
          <div class="ranking-title">Оценка метрики «Счастье»</div>
          <div ref="rankingChartRef" class="ranking-chart-canvas"></div>
          <p class="highcharts-description">
            График показывает диапазон оценок сотрудников по метрике «Счастье». По оси значений используется шкала от 0 до 9.
          </p>
        </figure>
      </div>

      <div class="insight q-mt-md">
        <q-icon name="flag" color="success" size="sm" />
        <span class="q-ml-md text-caption">
          IT отдел показывает лучший результат. HR нужна поддержка.
        </span>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import Highcharts from 'highcharts'

import 'highcharts/highcharts-more'
import 'highcharts/modules/exporting'
import 'highcharts/modules/export-data'
import 'highcharts/modules/accessibility'
import 'highcharts/themes/adaptive'

const departments = ref([
  { id: 1, name: 'IT', engagement: 82, loyalty: 88, satisfaction: 85, employees: 245, trend: 8 },
  { id: 2, name: 'Продажи', engagement: 76, loyalty: 72, satisfaction: 74, employees: 156, trend: 5 },
  { id: 3, name: 'Маркетинг', engagement: 71, loyalty: 69, satisfaction: 68, employees: 89, trend: 3 },
  { id: 4, name: 'HR', engagement: 58, loyalty: 61, satisfaction: 59, employees: 42, trend: -2 },
  { id: 5, name: 'Финансы', engagement: 68, loyalty: 74, satisfaction: 72, employees: 78, trend: 6 },
  { id: 6, name: 'Операции', engagement: 74, loyalty: 76, satisfaction: 75, employees: 134, trend: 4 },
])

const rankingChartRef = ref(null)
let rankingChart = null

const rankings = computed(() => {
  return [...departments.value]
    .map(dept => ({
      ...dept,
      score: Math.round((dept.engagement + dept.loyalty + dept.satisfaction) / 3)
    }))
    .sort((a, b) => b.score - a.score)
})

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
    backgroundColor: 'transparent'
  },
  accessibility: {
    description: 'Диаграмма columnrange сравнивает диапазоны оценок сотрудников по метрике счастья. По вертикали показаны департаменты, по горизонтали шкала оценок от 0 до 9.'
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

const getColor = (value) => {
  if (value >= 80) return 'positive'
  if (value >= 70) return 'info'
  if (value >= 60) return 'warning'
  return 'negative'
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
.department-card {
  border-radius: 12px;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    h6 {
      margin: 0;
    }
  }

  .department-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 16px;
    margin-bottom: 24px;
  }

  .dept-item {
    padding: 16px;
    background: #f9f9f9;
    border-radius: 8px;
    border: 1px solid #e0e0e0;
    transition: all 0.2s ease;

    &:hover {
      border-color: #2196f3;
      background: #f5f7fa;
    }

    .dept-name {
      font-weight: 600;
      font-size: 14px;
      margin-bottom: 12px;
      color: #333;
    }

    .metrics {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-bottom: 12px;
    }

    .metric {
      display: flex;
      flex-direction: column;
      gap: 4px;

      .metric-label {
        font-size: 11px;
        color: #999;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .metric-value {
        font-size: 12px;
        font-weight: 600;
        color: #333;
      }
    }

    .dept-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 12px;
      border-top: 1px solid #e0e0e0;
      font-size: 12px;

      .employee-count {
        color: #999;
      }

      .trend {
        display: flex;
        align-items: center;
        gap: 4px;
        font-weight: 600;
      }
    }
  }

  .department-ranking {
    .ranking-title {
      font-weight: 600;
      margin-bottom: 12px;
      color: #333;
    }

    .ranking-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .ranking-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 0;

      .rank-badge {
        width: 32px;
        height: 32px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        font-size: 14px;
      }

      .rank-name {
        flex: 1;
        font-size: 13px;
        color: #333;
        font-weight: 500;
      }

      .rank-score {
        font-size: 14px;
        font-weight: 600;
        color: #667eea;
      }
    }
  }

  .department-ranking-chart {
    padding: 16px;
    border-radius: 12px;
    background: linear-gradient(180deg, #fafbff 0%, #f3f6fc 100%);
    border: 1px solid #e3e8f4;

    .highcharts-figure {
      margin: 0;
    }

    .ranking-title {
      font-weight: 600;
      margin-bottom: 12px;
      color: #333;
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

    :deep(.highcharts-container),
    :deep(.highcharts-root) {
      width: 100% !important;
    }
  }

  .insight {
    display: flex;
    align-items: flex-start;
    padding: 12px;
    background: #e8f5e9;
    border-radius: 8px;
    color: #2e7d32;
  }
}
</style>

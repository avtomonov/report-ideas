<template>
  <div class="department-grid">
    <div class="dept-item" v-for="dept in sortedDepartments" :key="dept.id">
      <div class="dept-header">
        <div class="dept-name">{{ dept.name }}</div>
        <div class="dept-average">{{ getAverage(dept) }}%</div>
      </div>

      <div class="metrics">
        <div class="metric">
          <span class="metric-label">Вовлеченность</span>
          <div class="progress-wrapper">
            <div class="progress-bar" :style="{ width: dept.engagement + '%', backgroundColor: getColor(dept.engagement) }"></div>
          </div>
          <span class="metric-value">{{ dept.engagement }}%</span>
        </div>

        <div class="metric">
          <span class="metric-label">Лояльность</span>
          <div class="progress-wrapper">
            <div class="progress-bar" :style="{ width: dept.loyalty + '%', backgroundColor: getColor(dept.loyalty) }"></div>
          </div>
          <span class="metric-value">{{ dept.loyalty }}%</span>
        </div>

        <div class="metric">
          <span class="metric-label">Удовлетворение</span>
          <div class="progress-wrapper">
            <div class="progress-bar" :style="{ width: dept.satisfaction + '%', backgroundColor: getColor(dept.satisfaction) }"></div>
          </div>
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
</template>

<script setup>
import { ref, computed } from 'vue'

const departments = ref([
  { id: 1, name: 'IT', engagement: 82, loyalty: 88, satisfaction: 85, employees: 245, trend: 8 },
  { id: 2, name: 'Продажи', engagement: 76, loyalty: 72, satisfaction: 74, employees: 156, trend: 5 },
  { id: 3, name: 'Маркетинг', engagement: 71, loyalty: 69, satisfaction: 68, employees: 89, trend: 3 },
  { id: 4, name: 'HR', engagement: 58, loyalty: 61, satisfaction: 59, employees: 42, trend: -2 },
  { id: 5, name: 'Финансы', engagement: 68, loyalty: 74, satisfaction: 72, employees: 78, trend: 6 },
  { id: 6, name: 'Операции', engagement: 74, loyalty: 76, satisfaction: 75, employees: 134, trend: 4 }
])

const getAverage = (dept) => {
  return Math.round((dept.engagement + dept.loyalty + dept.satisfaction) / 3)
}

const sortedDepartments = computed(() => {
  return [...departments.value].sort((a, b) => getAverage(b) - getAverage(a))
})

const getColor = (value) => {
  if (value >= 80) return '#b7d2a5' // green
  if (value >= 70) return '#d5e88c' // light-green
  if (value >= 60) return '#fde993' // yellow
  if (value >= 50) return '#ffc184' // orange
  return '#f7a8a1' // redred
}
</script>

<style scoped lang="scss">
.department-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
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

  .dept-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 12px;
  }

  .dept-name {
    font-weight: 600;
    font-size: 14px;
    color: #333;
  }

  .dept-average {
    font-weight: 700;
    font-size: 16px;
    color: #000000;
    min-width: 40px;
    text-align: right;
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

    .progress-wrapper {
      width: 100%;
      height: 6px;
      background: #e0e0e0;
      border-radius: 3px;
      overflow: hidden;
    }

    .progress-bar {
      height: 100%;
      border-radius: 3px;
      transition: width 0.3s ease;
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
</style>
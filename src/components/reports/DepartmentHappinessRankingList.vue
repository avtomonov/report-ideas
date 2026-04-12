<template>
  <div class="department-ranking">
    <div class="ranking-list">
      <div class="ranking-item" v-for="(dept, index) in rankings" :key="dept.id">
        <div class="rank-badge">{{ index + 1 }}</div>
        <div class="rank-name">{{ dept.name }}</div>
        <div class="rank-score">{{ dept.score }}%</div>
      </div>
    </div>

    <div class="insight q-mt-md">
      <q-icon name="flag" color="success" size="sm" />
      <span class="q-ml-md text-caption">IT отдел показывает лучший результат. HR нужна поддержка.</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const departments = ref([
  { id: 1, name: 'IT', engagement: 82, loyalty: 88, satisfaction: 85 },
  { id: 2, name: 'Продажи', engagement: 76, loyalty: 72, satisfaction: 74 },
  { id: 3, name: 'Маркетинг', engagement: 71, loyalty: 69, satisfaction: 68 },
  { id: 4, name: 'HR', engagement: 58, loyalty: 61, satisfaction: 59 },
  { id: 5, name: 'Финансы', engagement: 68, loyalty: 74, satisfaction: 72 },
  { id: 6, name: 'Операции', engagement: 74, loyalty: 76, satisfaction: 75 }
])

const rankings = computed(() => {
  return [...departments.value]
    .map((dept) => ({
      ...dept,
      score: Math.round((dept.engagement + dept.loyalty + dept.satisfaction) / 3)
    }))
    .sort((a, b) => b.score - a.score)
})
</script>

<style scoped lang="scss">
.department-ranking {
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
      background: linear-gradient(135deg, #22c55e 0%, #0f766e 100%);
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
      color: #15803d;
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
<template>
  <q-card class="enps-report-card">
    <q-card-section>
      <h6 class="q-ma-none">eNPS Анализ</h6>
    </q-card-section>

    <q-separator />

    <q-card-section>
      <div class="row q-col-gutter-lg items-center">
        <div class="col-12 col-sm-6">
          <div class="enps-groups">
            <div class="group-item promoters">
              <div class="group-number">{{ promoters }}%</div>
              <div class="group-label">Promoters</div>
              <div class="group-desc">{{ promotersCount }} чел.</div>
            </div>
            <div class="group-item skeptics">
              <div class="group-number">{{ skeptics }}%</div>
              <div class="group-label">Skeptics</div>
              <div class="group-desc">{{ skepticsCount }} чел.</div>
            </div>
            <div class="group-item critics">
              <div class="group-number">{{ critics }}%</div>
              <div class="group-label">Critics</div>
              <div class="group-desc">{{ criticsCount }} чел.</div>
            </div>
          </div>
        </div>

        <div class="col-12 col-sm-6">
          <div class="enps-score">
            <div class="score-value" :style="{ color: scoreColor }">
              {{ enpsScore > 0 ? '+' : '' }}{{ enpsScore }}
            </div>
            <div class="score-label">eNPS Score</div>
            <div class="score-change q-mt-md">
              <q-icon 
                :name="enpsChange > 0 ? 'trending_up' : 'trending_down'" 
                :color="enpsChange > 0 ? 'positive' : 'negative'"
                size="sm"
              />
              <span :class="enpsChange > 0 ? 'text-positive' : 'text-negative'" class="q-ml-xs">
                {{ enpsChange > 0 ? '+' : '' }}{{ enpsChange }} к прошлому циклу
              </span>
            </div>
          </div>
        </div>
      </div>

      <q-linear-progress 
        :value="(enpsScore + 100) / 200" 
        :color="scoreColor"
        class="q-mt-lg"
        size="12px"
      />
      <div class="text-caption q-mt-sm text-center text-grey-7">
        от -100 (все критики) до +100 (все промоутеры)
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref, computed } from 'vue'

const promoters = ref(45)
const skeptics = ref(30)
const critics = ref(25)
const enpsScore = ref(20)
const enpsChange = ref(+8)

const promotersCount = ref(892)
const skepticsCount = ref(595)
const criticsCount = ref(496)

const scoreColor = computed(() => {
  if (enpsScore.value >= 50) return '#4caf50'
  if (enpsScore.value >= 0) return '#ffc107'
  return '#f44336'
})
</script>

<style scoped lang="scss">
.enps-report-card {
  border-radius: 12px;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }

  .enps-groups {
    display: grid;
    grid-template-columns: 1fr;
    gap: 12px;

    .group-item {
      padding: 16px;
      border-radius: 8px;
      text-align: center;
      color: white;
      transition: transform 0.2s ease;

      &:hover {
        transform: translateY(-2px);
      }

      &.promoters {
        background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
      }

      &.skeptics {
        background: linear-gradient(135deg, #ffc107 0%, #ffb300 100%);
      }

      &.critics {
        background: linear-gradient(135deg, #f44336 0%, #da190b 100%);
      }

      .group-number {
        font-size: 28px;
        font-weight: 700;
        margin-bottom: 4px;
      }

      .group-label {
        font-size: 12px;
        opacity: 0.9;
        margin-bottom: 4px;
      }

      .group-desc {
        font-size: 13px;
        opacity: 0.85;
      }
    }
  }

  .enps-score {
    text-align: center;

    .score-value {
      font-size: 48px;
      font-weight: 700;
      margin-bottom: 8px;
    }

    .score-label {
      font-size: 14px;
      color: $grey-7;
      text-transform: uppercase;
    }

    .score-change {
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
    }
  }
}
</style>

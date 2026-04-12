<template>
  <q-card class="participation-card">
    <q-card-section>
      <div class="header">
        <h6 class="q-ma-none">Тренды участия</h6>
        <q-chip size="sm" label="Q4 2024" color="primary" text-color="white" />
      </div>
    </q-card-section>

    <q-separator />

    <q-card-section>
      <div class="trend-chart">
        <div class="row q-col-gutter-md q-mb-lg">
          <div class="col-12 col-sm-6">
            <div class="period-card">
              <div class="period-label">Q2 2024</div>
              <div class="participation-rate" :style="{ color: getPeriodColor(45) }">
                45%
              </div>
              <div class="progress-wrapper">
                <div class="progress-bar" :style="{ width: '45%', backgroundColor: getPeriodColor(45) }"></div>
              </div>
              <div class="detail text-caption q-mt-sm">1 324 сотр.</div>
            </div>
          </div>
          <div class="col-12 col-sm-6">
            <div class="period-card">
              <div class="period-label">Q3 2024</div>
              <div class="participation-rate" :style="{ color: getPeriodColor(62) }">
                62%
              </div>
              <div class="progress-wrapper">
                <div class="progress-bar" :style="{ width: '62%', backgroundColor: getPeriodColor(62) }"></div>
              </div>
              <div class="detail text-caption q-mt-sm">1 847 сотр.</div>
            </div>
          </div>
          <div class="col-12 col-sm-6">
            <div class="period-card">
              <div class="period-label">Q4 2024</div>
              <div class="participation-rate" :style="{ color: getPeriodColor(78) }">
                78%
              </div>
              <div class="progress-wrapper">
                <div class="progress-bar" :style="{ width: '78%', backgroundColor: getPeriodColor(78) }"></div>
              </div>
              <div class="detail text-caption q-mt-sm">2 312 сотр.</div>
            </div>
          </div>
          <div class="col-12 col-sm-6">
            <div class="period-card">
              <div class="period-label">На этой неделе</div>
              <div class="participation-rate" :style="{ color: getPeriodColor(82) }">
                82%
              </div>
              <div class="progress-wrapper">
                <div class="progress-bar" :style="{ width: '82%', backgroundColor: getPeriodColor(82) }"></div>
              </div>
              <div class="detail text-caption q-mt-sm">2 451 сотр.</div>
            </div>
          </div>
        </div>
      </div>

      <q-separator class="q-my-md" />

      <div class="stats-row">
        <div class="stat-item">
          <div class="stat-label">Тренд</div>
          <div class="stat-value positive">
            <q-icon name="trending_up" />
            +37% год в год
          </div>
        </div>
        <div class="stat-item">
          <div class="stat-label">Цель</div>
          <div class="stat-value">90% до Q1</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">Progress</div>
          <div class="stat-value">
            <q-circular-progress
              :value="82"
              size="80px"
              color="positive"
              show-value
              class="q-mx-auto"
            />
          </div>
        </div>
      </div>

      <div class="insight q-mt-md">
        <q-icon name="lightbulb" color="warning" size="sm" />
        <span class="q-ml-md text-caption">
          Рост участия ускорился с Q2 на Q3. Продолжайте стимулировать engagement.
        </span>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref } from 'vue'

const q2 = ref(45)
const q3 = ref(62)
const q4 = ref(78)
const thisWeek = ref(82)

const getPeriodColor = (value) => {
  if (value >= 75) return '#b7d2a5' // green
  if (value >= 60) return '#d5e88c' // light-green
  if (value >= 45) return '#ffc184' // orange
  return '#f7a8a1' // redred
}
</script>

<style scoped lang="scss">
.participation-card {
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
      flex: 1;
    }
  }

  .trend-chart {
    margin: 0;
  }

  .period-card {
    padding: 16px;
    background: #f5f5f5;
    border-radius: 8px;
    text-align: center;
    transition: all 0.2s ease;

    &:hover {
      background: #e8e8e8;
    }

    .period-label {
      font-size: 12px;
      color: #999;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 8px;
    }

    .participation-rate {
      font-size: 32px;
      font-weight: 700;
      margin: 8px 0;
    }

    .progress-wrapper {
      width: 100%;
      height: 6px;
      background: #e0e0e0;
      border-radius: 3px;
      overflow: hidden;
      margin: 8px 0;
    }

    .progress-bar {
      height: 100%;
      border-radius: 3px;
      transition: width 0.3s ease;
    }

    .detail {
      color: #666;
    }
  }

  .stats-row {
    display: flex;
    justify-content: space-around;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;

    .stat-item {
      flex: 1;
      min-width: 100px;
      text-align: center;

      .stat-label {
        font-size: 12px;
        color: #999;
        text-transform: uppercase;
        margin-bottom: 8px;
      }

      .stat-value {
        font-weight: 600;
        font-size: 16px;
        color: #333;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;

        &.positive {
          color: #4caf50;
        }
      }
    }
  }

  .insight {
    display: flex;
    align-items: flex-start;
    padding: 12px;
    background: #fff3e0;
    border-radius: 8px;
    color: #f57f17;
  }
}
</style>

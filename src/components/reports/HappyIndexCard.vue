<template>
  <q-card class="happy-index-card">
    <q-card-section class="bg-gradient text-white">
      <div class="row items-center">
        <div class="col">
          <div class="text-overline">Индекс счастья</div>
          <div class="text-h3 q-mt-md">{{ happyIndex }}%</div>
          <div class="text-subtitle2 q-mt-md flex items-center">
            <q-icon name="trending_up" color="positive" size="sm" class="q-mr-xs" />
            <span :class="trend > 0 ? 'text-positive' : 'text-negative'">
              {{ trend > 0 ? '+' : '' }}{{ trend }}% от цикла
            </span>
          </div>
        </div>
        <div class="col-auto">
          <q-circular-progress
            :value="happyIndex"
            size="120px"
            color="white"
            track-color="rgba(255,255,255,0.3)"
            :thickness="0.15"
            class="circle-progress"
          >
            <span class="text-white text-h6">{{ happyIndex }}%</span>
          </q-circular-progress>
        </div>
      </div>
    </q-card-section>

    <q-separator />

    <q-card-section>
      <div class="row q-col-gutter-md">
        <div class="col-6 col-sm-3">
          <div class="metric">
            <div class="metric-label">Вовлеченность</div>
            <div class="metric-value text-h6">{{ engagement }}%</div>
            <q-linear-progress :value="engagement / 100" color="blue" class="q-mt-sm" />
          </div>
        </div>
        <div class="col-6 col-sm-3">
          <div class="metric">
            <div class="metric-label">Лояльность</div>
            <div class="metric-value text-h6">{{ loyalty }}%</div>
            <q-linear-progress :value="loyalty / 100" color="purple" class="q-mt-sm" />
          </div>
        </div>
        <div class="col-6 col-sm-3">
          <div class="metric">
            <div class="metric-label">Удовлетворение</div>
            <div class="metric-value text-h6">{{ satisfaction }}%</div>
            <q-linear-progress :value="satisfaction / 100" color="green" class="q-mt-sm" />
          </div>
        </div>
        <div class="col-6 col-sm-3">
          <div class="metric">
            <div class="metric-label">eNPS</div>
            <div class="metric-value text-h6">{{ enps }}</div>
            <q-linear-progress :value="(enps + 100) / 200" color="orange" class="q-mt-sm" />
          </div>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref } from 'vue'

const happyIndex = ref(72)
const engagement = ref(68)
const loyalty = ref(75)
const satisfaction = ref(78)
const enps = ref(35)
const trend = ref(+12)
</script>

<style scoped lang="scss">
.happy-index-card {
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }

  .bg-gradient {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }

  .metric {
    padding: 12px;
    background: $grey-1;
    border-radius: 8px;
    text-align: center;

    .metric-label {
      font-size: 12px;
      color: $grey-7;
      margin-bottom: 8px;
      text-transform: uppercase;
    }

    .metric-value {
      color: $dark;
      font-weight: 600;
    }
  }
}
</style>

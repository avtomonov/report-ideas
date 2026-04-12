<template>
  <q-card class="comments-card">
    <q-card-section>
      <h6 class="q-ma-none">Анализ комментариев</h6>
    </q-card-section>

    <q-separator />

    <q-card-section>
      <div class="themes-grid">
        <div class="theme-item positive">
          <div class="theme-badge">
            <q-icon name="thumb_up" size="24px" />
          </div>
          <div class="theme-content">
            <h6 class="q-ma-none">Позитивные</h6>
            <div class="count">+523</div>
            <div class="progress-wrapper">
              <div class="progress-bar" :style="{ width: (523 / 1200) * 100 + '%', backgroundColor: '#b7d2a5' }"></div>
            </div>
            <div class="topics text-caption q-mt-sm">
              <span class="topic-tag">Дух команды (142)</span>
              <span class="topic-tag">Возможности (178)</span>
              <span class="topic-tag">Поддержка (203)</span>
            </div>
          </div>
        </div>

        <div class="theme-item neutral">
          <div class="theme-badge">
            <q-icon name="comment" size="24px" />
          </div>
          <div class="theme-content">
            <h6 class="q-ma-none">Нейтральные</h6>
            <div class="count">+356</div>
            <div class="progress-wrapper">
              <div class="progress-bar" :style="{ width: (356 / 1200) * 100 + '%', backgroundColor: '#fde993' }"></div>
            </div>
            <div class="topics text-caption q-mt-sm">
              <span class="topic-tag">Процесс (98)</span>
              <span class="topic-tag">Инструменты (127)</span>
              <span class="topic-tag">Коммуникация (131)</span>
            </div>
          </div>
        </div>

        <div class="theme-item negative">
          <div class="theme-badge">
            <q-icon name="thumb_down" size="24px" />
          </div>
          <div class="theme-content">
            <h6 class="q-ma-none">Требуют внимания</h6>
            <div class="count">+321</div>
            <div class="progress-wrapper">
              <div class="progress-bar" :style="{ width: (321 / 1200) * 100 + '%', backgroundColor: '#f7a8a1' }"></div>
            </div>
            <div class="topics text-caption q-mt-sm">
              <span class="topic-tag">Нагрузка (89)</span>
              <span class="topic-tag">Ясность (104)</span>
              <span class="topic-tag">Ресурсы (128)</span>
            </div>
          </div>
        </div>
      </div>

      <q-separator class="q-my-md" />

      <div class="top-themes">
        <div class="themes-label">Топ-темы этого месяца</div>
        <div class="theme-list">
          <div class="theme-row">
            <div class="theme-name">Гибкий график работы</div>
            <div class="progress-wrapper flex theme-bar">
              <div class="progress-bar" :style="{ width: '75%', backgroundColor: '#b7d2a5' }"></div>
            </div>
            <div class="theme-count">245</div>
          </div>
          <div class="theme-row">
            <div class="theme-name">Развитие карьеры</div>
            <div class="progress-wrapper flex theme-bar">
              <div class="progress-bar" :style="{ width: '68%', backgroundColor: '#d5e88c' }"></div>
            </div>
            <div class="theme-count">198</div>
          </div>
          <div class="theme-row">
            <div class="theme-name">Зарплата и льготы</div>
            <div class="progress-wrapper flex theme-bar">
              <div class="progress-bar" :style="{ width: '61%', backgroundColor: '#fde993' }"></div>
            </div>
            <div class="theme-count">154</div>
          </div>
          <div class="theme-row">
            <div class="theme-name">Командное сотрудничество</div>
            <div class="progress-wrapper flex theme-bar">
              <div class="progress-bar" :style="{ width: '58%', backgroundColor: '#ffc184' }"></div>
            </div>
            <div class="theme-count">142</div>
          </div>
        </div>
      </div>

      <div class="insight q-mt-md">
        <q-icon name="insights" color="info" size="sm" />
        <span class="q-ml-md text-caption">
          Гибкий график - главная тема. Рекомендуется пересмотреть политику работы.
        </span>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref } from 'vue'

const positive = ref(523)
const neutral = ref(356)
const negative = ref(321)
</script>

<style scoped lang="scss">
.comments-card {
  border-radius: 12px;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }

  .themes-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    margin-bottom: 24px;
  }

  .theme-item {
    padding: 16px;
    border-radius: 8px;
    border-left: 4px solid;
    transition: all 0.2s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    &.positive {
      background: linear-gradient(135deg, #e8f5e9 0%, #f1f8e9 100%);
      border-left-color: #4caf50;

      .theme-badge {
        background: rgba(76, 175, 80, 0.1);
        color: #4caf50;
      }
    }

    &.neutral {
      background: linear-gradient(135deg, #fff3e0 0%, #fffde7 100%);
      border-left-color: #ffc107;

      .theme-badge {
        background: rgba(255, 193, 7, 0.1);
        color: #ffc107;
      }
    }

    &.negative {
      background: linear-gradient(135deg, #ffebee 0%, #fff3e0 100%);
      border-left-color: #f44336;

      .theme-badge {
        background: rgba(244, 67, 54, 0.1);
        color: #f44336;
      }
    }

    .theme-badge {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 12px;
      font-size: 24px;
    }

    .theme-content {
      h6 {
        margin: 0 0 8px 0;
        font-weight: 600;
      }

      .count {
        font-size: 24px;
        font-weight: 700;
        margin: 4px 0 12px 0;
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
    }

    .topics {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;

      .topic-tag {
        background: rgba(0, 0, 0, 0.08);
        padding: 2px 8px;
        border-radius: 4px;
        white-space: nowrap;
      }
    }
  }

  .top-themes {
    .themes-label {
      font-weight: 600;
      margin-bottom: 12px;
      color: #333;
    }

    .theme-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .theme-row {
      display: flex;
      align-items: center;
      gap: 12px;

      .theme-name {
        min-width: 150px;
        font-size: 13px;
        color: #333;
      }

      .progress-wrapper {
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

      .theme-bar {
        height: 6px;
      }

      .theme-count {
        min-width: 30px;
        text-align: right;
        font-size: 13px;
        color: #999;
        font-weight: 500;
      }
    }
  }

  .insight {
    display: flex;
    align-items: flex-start;
    padding: 12px;
    background: #e3f2fd;
    border-radius: 8px;
    color: #1976d2;
  }
}
</style>

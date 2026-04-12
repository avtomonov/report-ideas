<template>
  <q-card class="comparison-card">
    <q-card-section>
      <h6 class="q-ma-none">Вовлеченность vs Лояльность</h6>
    </q-card-section>

    <q-separator />

    <q-card-section>
      <div class="comparison-chart">
        <div class="chart-container">
          <figure class="highcharts-figure q-ma-none full-width">
            <div ref="chartRef" class="comparison-chart-canvas"></div>
            <p class="highcharts-description">
              График построен по данным таблицы: по оси X годы, по оси Y доля сотрудников в процентах.
            </p>

            <div class="highcharts-data-table">
              <table :id="tableId" class="data-table">
                <thead>
                  <tr>
                    <th>Год</th>
                    <th>Вовлеченность</th>
                    <th>Лояльность</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th>2020</th>
                    <td>62</td>
                    <td>66</td>
                  </tr>
                  <tr>
                    <th>2021</th>
                    <td>64</td>
                    <td>69</td>
                  </tr>
                  <tr>
                    <th>2022</th>
                    <td>65</td>
                    <td>71</td>
                  </tr>
                  <tr>
                    <th>2023</th>
                    <td>67</td>
                    <td>73</td>
                  </tr>
                  <tr>
                    <th>2024</th>
                    <td>68</td>
                    <td>75</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </figure>
        </div>
      </div>

      <div class="row q-mt-lg q-col-gutter-md">
        <div class="col-6">
          <q-item>
            <q-item-section avatar>
              <div class="avg-badge blue">68%</div>
            </q-item-section>
            <q-item-section>
              <q-item-label>Средняя вовлеченность</q-item-label>
              <q-item-label caption>по всем отделам</q-item-label>
            </q-item-section>
          </q-item>
        </div>
        <div class="col-6">
          <q-item>
            <q-item-section avatar>
              <div class="avg-badge purple">75%</div>
            </q-item-section>
            <q-item-section>
              <q-item-label>Средняя лояльность</q-item-label>
              <q-item-label caption>по всем отделам</q-item-label>
            </q-item-section>
          </q-item>
        </div>
      </div>

      <q-linear-progress value="1" color="transparent" class="q-my-md" />

      <div class="insight">
        <q-icon name="info" color="positive" size="sm" />
        <span class="q-ml-md text-caption">
          Лояльность сотрудников стабильно выше вовлеченности. Рекомендуется усилить практики обратной связи и развития команд.
        </span>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import Highcharts from 'highcharts'
import 'highcharts/modules/data'
import 'highcharts/modules/exporting'
import 'highcharts/modules/accessibility'
import 'highcharts/themes/adaptive'

const engagement = ref(68)
const loyalty = ref(75)
const chartRef = ref(null)
const tableId = 'engagement-loyalty-datatable'
let chart = null

const renderChart = () => {
  if (!chartRef.value) return

  chart = Highcharts.chart(chartRef.value, {
    data: {
      table: tableId
    },
    chart: {
      type: 'column',
      height: 330,
      backgroundColor: 'transparent',
      plotAreaBackground: { color: '#b7d2a5' }
    },
    title: {
      text: 'Вовлеченность и лояльность по годам',
      style: {
        color: '#000000'
      }
    },
    subtitle: {
      text: 'Источник: внутренняя аналитика HappyInc',
      style: {
        color: '#000000'
      }
    },
    xAxis: {
      type: 'category',
      title: {
        text: 'Год',
        style: {
          color: '#000000'
        }
      },
      labels: {
        style: {
          color: '#000000'
        }
      }
    },
    yAxis: {
      min: 0,
      max: 100,
      title: {
        text: 'Процент сотрудников',
        style: {
          color: '#000000'
        }
      },
      labels: {
        format: '{value}%',
        style: {
          color: '#000000'
        }
      }
    },
    tooltip: {
      style: {
        color: '#000000'
      },
      valueSuffix: '%'
    },
    plotOptions: {
      column: {
        borderRadius: 6,
        pointPadding: 0.08,
        groupPadding: 0.12,
        dataLabels: {
          style: {
            color: '#000000',
            textOutline: 'none'
          }
        }
      }
    },
    colors: ['#8fcf9f', '#5eaf79'],
    credits: {
      enabled: false
    }
  })
}

onMounted(() => {
  renderChart()
})

onBeforeUnmount(() => {
  if (chart) {
    chart.destroy()
    chart = null
  }
})
</script>

<style scoped lang="scss">
.comparison-card {
  border-radius: 12px;
  transition: all 0.3s ease;
  color: #000000;

  &:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }

  :deep(.q-item__label),
  :deep(.q-item__label--caption),
  :deep(.text-caption) {
    color: #000000;
  }

  .comparison-chart {
    margin: 0 -8px;
  }

  .chart-container {
    width: 100%;
    min-height: 320px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .comparison-chart-canvas {
    width: 100%;
    min-height: 320px;
  }

  .highcharts-description {
    margin-top: 8px;
    color: #000000;
    font-size: 12px;
  }

  .data-table {
    display: none;
  }

  .avg-badge {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #000000;
    font-weight: 600;
    font-size: 14px;

    &.blue {
      background: linear-gradient(135deg, #aadfb8 0%, #7bcf9a 100%);
    }

    &.purple {
      background: linear-gradient(135deg, #7bcf9a 0%, #5eaf79 100%);
    }
  }

  .insight {
    display: flex;
    align-items: flex-start;
    padding: 12px;
    background: #e9f6ed;
    border-radius: 8px;
    color: #000000;
  }
}
</style>

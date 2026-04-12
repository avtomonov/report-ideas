<template>
  <q-card flat bordered>
    <q-card-section class="text-subtitle1 text-weight-bold">
      Дерево тем сотрудников
    </q-card-section>
    <q-separator />
    <q-card-section>
      <div id="container" class="chart-container" />
    </q-card-section>
  </q-card>
</template>

<script setup>
import { onMounted, onBeforeUnmount } from 'vue'
import Highcharts from 'highcharts'
import 'highcharts/highcharts-more'
import 'highcharts/modules/treemap'
import 'highcharts/modules/data'
import 'highcharts/modules/exporting'
import 'highcharts/modules/offline-exporting'
import 'highcharts/modules/accessibility'
import 'highcharts/modules/coloraxis'
import 'highcharts/themes/adaptive'

let chart = null

const renderChart = (data) => {
  chart = Highcharts.chart('container', {
    chart: {
      backgroundColor: '#ffffff',
      spacingTop: 150
    },
    title: {
      text: 'Темы, о которых сотрудники пишут в работе',
      align: 'left',
      style: {
        color: '#000000'
      }
    },
    subtitle: {
      text: 'Нажимайте на блоки, чтобы проваливаться в отделы, направления и конкретные темы.',
      align: 'left',
      style: {
        color: '#000000'
      }
    },
    series: [{
      name: 'All',
      type: 'treemap',
      layoutAlgorithm: 'squarified',
      allowDrillToNode: true,
      animationLimit: 1000,
      borderColor: '#3a4250',
      color: '#3a4250',
      opacity: 0.01,
      nodeSizeBy: 'leaf',
      dataLabels: {
        enabled: false,
        allowOverlap: false,
        style: {
          fontSize: '0.9em',
          textOutline: 'none'
        }
      },
      levels: [{
        level: 1,
        dataLabels: {
          enabled: true,
          headers: true,
          align: 'left',
          allowOverlap: false,
          crop: true,
          overflow: 'hidden',
          formatter: function () {
            const text = this.point?.name || ''
            return text.length > 30 ? `${text.slice(0, 30)}...` : text
          },
          style: {
            fontWeight: 'bold',
            fontSize: '1.02em',
            lineClamp: 1,
            color: '#000000',
            textOutline: '2px rgba(255, 255, 255, 0.35)',
            textTransform: 'uppercase'
          },
          padding: 4
        },
        borderWidth: 3,
        levelIsConstant: false
      }, {
        level: 2,
        dataLabels: {
          enabled: true,
          headers: true,
          align: 'center',
          allowOverlap: false,
          crop: true,
          overflow: 'hidden',
          formatter: function () {
            const text = this.point?.name || ''
            return text.length > 24 ? `${text.slice(0, 24)}...` : text
          },
          shape: 'callout',
          backgroundColor: '#ffffff',
          borderWidth: 1,
          borderColor: '#cccccc',
          padding: 2,
          style: {
            color: '#000000',
            fontWeight: 'bold',
            fontSize: '0.84em',
            lineClamp: 1,
            textOutline: '1px rgba(255, 255, 255, 0.28)',
            textTransform: 'uppercase'
          }
        },
        groupPadding: 1
      }, {
        level: 3,
        dataLabels: {
          enabled: true,
          align: 'center',
          allowOverlap: false,
          crop: true,
          overflow: 'hidden',
          formatter: function () {
            const width = this.point?.shapeArgs?.width || 0
            const height = this.point?.shapeArgs?.height || 0
            if (width < 70 || height < 40) {
              return null
            }

            const text = this.point?.name || ''
            const short = text.length > 22 ? `${text.slice(0, 22)}...` : text
            return `${short}<br><span style="font-size: 0.6em">${this.point?.custom?.performance || ''}</span>`
          },
          style: {
            color: '#000000'
          }
        }
      }],
      accessibility: {
        exposeAsGroupOnly: true
      },
      breadcrumbs: {
        floating: true,
        position: {
          align: 'left',
          verticalAlign: 'top',
          x: 8,
          y: 102
        },
        relativeTo: 'spacingBox',
        separator: {
          style: {
            color: '#333333',
            fontSize: '16px',
            fontWeight: '700'
          }
        },
        buttonTheme: {
          fill: '#ffffff',
          stroke: '#cccccc',
          'stroke-width': 1,
          r: 10,
          padding: 6,
          style: {
            color: '#000000',
            fontSize: '14px',
            fontWeight: '700'
          },
          states: {
            hover: {
              fill: '#f0f0f0',
              style: {
                color: '#000000'
              }
            },
            select: {
              fill: '#e8e8e8',
              style: {
                color: '#000000'
              }
            }
          }
        }
      },
      data
    }],
    tooltip: {
      followPointer: true,
      outside: true,
      headerFormat: '<span style="font-size: 0.9em">{point.custom.fullName}</span><br/>',
      pointFormat: '<b>Количество публикаций:</b> {point.value}<br/>{#if point.custom.performance}<b>Динамика за месяц:</b> {point.custom.performance}{/if}'
    },
    colorAxis: {
      minColor: '#f7a8a1',
      maxColor: '#d2d2d2',
      stops: [
        [0, '#f7a8a1'],
        [0.2, '#ffc184'],
        [0.38, '#fde993'],
        [0.55, '#d5e88c'],
        [0.75, '#b7d2a5'],
        [1, '#d2d2d2']
      ],
      min: -6,
      max: 12,
      gridLineWidth: 0,
      labels: {
        overflow: 'allow',
        format: '{#gt value 0}+{value}{else}{value}{/gt}%',
        style: {
          color: '#000000'
        }
      }
    },
    legend: {
      itemStyle: {
        color: '#000000'
      }
    },
    exporting: {
      sourceWidth: 1200,
      sourceHeight: 800,
      buttons: {
        fullscreen: {
          text: 'Полноэкранный режим',
          onclick: function () {
            this.fullscreen.toggle()
          }
        },
        contextButton: {
          menuItems: ['downloadPNG', 'downloadJPEG', 'downloadPDF', 'downloadSVG'],
          text: 'Выгрузить',
          symbol: void 0,
          y: -2
        }
      }
    },
    navigation: {
      buttonOptions: {
        theme: {
          fill: '#ffffff',
          style: {
            color: '#000000',
            whiteSpace: 'nowrap'
          },
          states: {
            hover: {
              fill: '#f0f0f0',
              style: {
                color: '#000000'
              }
            }
          }
        },
        symbolStroke: '#333333',
        useHTML: true,
        y: -2
      }
    }
  })
}

const buildTopicData = () => {
  const payload = {
    themeTrees: {
      '1f111548-34c9-622c-8a04-0a00ac070060': [
        { themeId: '1f111548-34f9-683c-af94-0a00ac070060', parentId: null, metricId: '00000031-0000-6000-8000-0a00ac070060', title: 'Ваш непосредственный руководитель' },
        { themeId: '1f111548-3565-6b54-8203-0a00ac070060', parentId: null, metricId: '00000032-0000-6000-8000-0a00ac070060', title: 'Цели и задачи подразделения' },
        { themeId: '1f111548-361a-68ba-a3d8-0a00ac070060', parentId: null, metricId: '00000036-0000-6000-8000-0a00ac070060', title: 'Обратная связь от руководителя' },
        { themeId: '1f111548-3671-6246-a3e4-0a00ac070060', parentId: null, metricId: '00000033-0000-6000-8000-0a00ac070060', title: 'Интерес к задачам и процессам' },
        { themeId: '1f111548-36c9-6eaa-876e-0a00ac070060', parentId: null, metricId: '00000034-0000-6000-8000-0a00ac070060', title: 'Изменения в компании' },
        { themeId: '1f111548-3723-69dc-9c00-0a00ac070060', parentId: null, metricId: '00000040-0000-6000-8000-0a00ac070060', title: 'Ваши коллеги' },
        { themeId: '1f111548-377c-6a50-804f-0a00ac070060', parentId: null, metricId: '00000037-0000-6000-8000-0a00ac070060', title: 'Эмоциональное и физическое здоровье' },
        { themeId: '1f111548-37d8-66de-bc04-0a00ac070060', parentId: null, metricId: '00000038-0000-6000-8000-0a00ac070060', title: 'Карьера' },
        { themeId: '1f111548-3839-6dc6-9d8b-0a00ac070060', parentId: null, metricId: '00000039-0000-6000-8000-0a00ac070060', title: 'Условия и оплата' },
        { themeId: '1f111548-39f9-6094-9397-0a00ac070060', parentId: '1f111548-34f9-683c-af94-0a00ac070060', metricId: '00000046-0000-6000-8000-0a00ac070060', title: 'Совещания (собрания) с руководителем' },
        { themeId: '1f111548-3898-60ec-b16b-0a00ac070060', parentId: '1f111548-34f9-683c-af94-0a00ac070060', metricId: '00000042-0000-6000-8000-0a00ac070060', title: 'Понятность и четкость поставленных задач' },
        { themeId: '1f111548-38f2-613c-91a3-0a00ac070060', parentId: '1f111548-34f9-683c-af94-0a00ac070060', metricId: '00000043-0000-6000-8000-0a00ac070060', title: 'Доверие к руководителю' },
        { themeId: '1f111548-3bf3-620a-962c-0a00ac070060', parentId: '1f111548-3565-6b54-8203-0a00ac070060', metricId: '00000051-0000-6000-8000-0a00ac070060', title: 'Есть идея! Как достигнуть цели' },
        { themeId: '1f111548-3a54-66b0-8993-0a00ac070060', parentId: '1f111548-3565-6b54-8203-0a00ac070060', metricId: '00000047-0000-6000-8000-0a00ac070060', title: 'Понятность целей, задач или стратегии в целом' },
        { themeId: '1f111548-3e3d-6060-ac55-0a00ac070060', parentId: '1f111548-361a-68ba-a3d8-0a00ac070060', metricId: '00000067-0000-6000-8000-0a00ac070060', title: 'Наличие и частота обратной связи от руководителя' },
        { themeId: '1f111548-3ee3-6384-b73e-0a00ac070060', parentId: '1f111548-361a-68ba-a3d8-0a00ac070060', metricId: '00000069-0000-6000-8000-0a00ac070060', title: 'Полезность встреч' },
        { themeId: '1f111548-409c-6324-9a46-0a00ac070060', parentId: '1f111548-3671-6246-a3e4-0a00ac070060', metricId: '00000054-0000-6000-8000-0a00ac070060', title: 'Интерес к своим задачам и процессам' },
        { themeId: '1f111548-413d-6184-9298-0a00ac070060', parentId: '1f111548-3671-6246-a3e4-0a00ac070060', metricId: '00000056-0000-6000-8000-0a00ac070060', title: 'Есть идея! Как улучшить процессы' },
        { themeId: '1f111548-4194-62e0-8bbc-0a00ac070060', parentId: '1f111548-36c9-6eaa-876e-0a00ac070060', metricId: '00000057-0000-6000-8000-0a00ac070060', title: 'Информирование об изменениях в компании' },
        { themeId: '1f111548-4242-6c1e-a4e7-0a00ac070060', parentId: '1f111548-36c9-6eaa-876e-0a00ac070060', metricId: '00000059-0000-6000-8000-0a00ac070060', title: 'Недостаточное планирование сложных задач' },
        { themeId: '1f111548-43c3-6160-87b0-0a00ac070060', parentId: '1f111548-3723-69dc-9c00-0a00ac070060', metricId: '00000089-0000-6000-8000-0a00ac070060', title: 'Коммуникации' },
        { themeId: '1f111548-4457-64c8-a642-0a00ac070060', parentId: '1f111548-3723-69dc-9c00-0a00ac070060', metricId: '00000091-0000-6000-8000-0a00ac070060', title: 'Взаимодействие' },
        { themeId: '1f111548-45e4-61b0-b277-0a00ac070060', parentId: '1f111548-377c-6a50-804f-0a00ac070060', metricId: '00000076-0000-6000-8000-0a00ac070060', title: 'Баланс между работой и личной жизнью' },
        { themeId: '1f111548-455a-653c-8c74-0a00ac070060', parentId: '1f111548-377c-6a50-804f-0a00ac070060', metricId: '00000074-0000-6000-8000-0a00ac070060', title: 'Стресс на рабочем месте' },
        { themeId: '1f111548-4626-620e-ad68-0a00ac070060', parentId: '1f111548-37d8-66de-bc04-0a00ac070060', metricId: '00000077-0000-6000-8000-0a00ac070060', title: 'Понятность карьеры' },
        { themeId: '1f111548-4661-6566-b7d7-0a00ac070060', parentId: '1f111548-37d8-66de-bc04-0a00ac070060', metricId: null, title: 'Обучение' },
        { themeId: '1f111548-47a1-6be2-b10a-0a00ac070060', parentId: '1f111548-3839-6dc6-9d8b-0a00ac070060', metricId: '00000083-0000-6000-8000-0a00ac070060', title: 'Оплата' },
        { themeId: '1f111548-4767-6a82-8690-0a00ac070060', parentId: '1f111548-3839-6dc6-9d8b-0a00ac070060', metricId: '00000082-0000-6000-8000-0a00ac070060', title: 'Льготы' },
        { themeId: '1f111548-481e-6fb6-a9e7-0a00ac070060', parentId: '1f111548-3839-6dc6-9d8b-0a00ac070060', metricId: '00000098-0000-6000-8000-0a00ac070060', title: 'Условия труда' },
        { themeId: '1f111548-4b28-6c70-b0ca-0a00ac070060', parentId: '1f111548-39f9-6094-9397-0a00ac070060', metricId: '00000046-0000-6000-8000-0a00ac070060', title: 'Эффективность рабочих встреч' },
        { themeId: '1f111548-4add-648c-afc2-0a00ac070060', parentId: '1f111548-39f9-6094-9397-0a00ac070060', metricId: '00000046-0000-6000-8000-0a00ac070060', title: 'Длительность совещаний' },
        { themeId: '1f111548-4c09-66e4-ab87-0a00ac070060', parentId: '1f111548-39f9-6094-9397-0a00ac070060', metricId: '00000046-0000-6000-8000-0a00ac070060', title: 'Быстрое одобрение всего, чтобы разойтись' },
        { themeId: '1f111548-4c59-6ab8-aac4-0a00ac070060', parentId: '1f111548-3bf3-620a-962c-0a00ac070060', metricId: '00000051-0000-6000-8000-0a00ac070060', title: 'Идеи, полезные для бизнеса' },
        { themeId: '1f111548-4d0a-6a5c-9781-0a00ac070060', parentId: '1f111548-3bf3-620a-962c-0a00ac070060', metricId: '00000051-0000-6000-8000-0a00ac070060', title: 'Снизить текучесть кадров' },
        { themeId: '1f111548-4f6c-6e58-9100-0a00ac070060', parentId: '1f111548-413d-6184-9298-0a00ac070060', metricId: '00000056-0000-6000-8000-0a00ac070060', title: 'Улучшение или упрощение процессов' },
        { themeId: '1f111548-502a-6ad4-ac02-0a00ac070060', parentId: '1f111548-413d-6184-9298-0a00ac070060', metricId: '00000056-0000-6000-8000-0a00ac070060', title: 'Распределение обязанностей между сотрудниками' },
        { themeId: '1f111548-508a-6600-8fb2-0a00ac070060', parentId: '1f111548-43c3-6160-87b0-0a00ac070060', metricId: '00000089-0000-6000-8000-0a00ac070060', title: 'Нормы деловой переписки' },
        { themeId: '1f111548-50e8-6f34-b50e-0a00ac070060', parentId: '1f111548-43c3-6160-87b0-0a00ac070060', metricId: '00000089-0000-6000-8000-0a00ac070060', title: 'Средства коммуникаций' },
        { themeId: '1f111548-5143-6dc6-b597-0a00ac070060', parentId: '1f111548-4457-64c8-a642-0a00ac070060', metricId: '00000091-0000-6000-8000-0a00ac070060', title: 'Качество взаимодействия с коллегами' },
        { themeId: '1f111548-51b0-6e76-9b35-0a00ac070060', parentId: '1f111548-4457-64c8-a642-0a00ac070060', metricId: '00000091-0000-6000-8000-0a00ac070060', title: 'Скорость взаимодействия с коллегами' },
        { themeId: '1f111548-5269-6548-bb6d-0a00ac070060', parentId: '1f111548-45e4-61b0-b277-0a00ac070060', metricId: '00000076-0000-6000-8000-0a00ac070060', title: 'Наличие переработок' },
        { themeId: '1f111548-5321-68d2-9431-0a00ac070060', parentId: '1f111548-45e4-61b0-b277-0a00ac070060', metricId: '00000076-0000-6000-8000-0a00ac070060', title: 'Короткие отпуска' },
        { themeId: '1f111548-5379-6794-b017-0a00ac070060', parentId: '1f111548-45e4-61b0-b277-0a00ac070060', metricId: '00000076-0000-6000-8000-0a00ac070060', title: 'Нет удаленной работы' },
        { themeId: '1f111548-544d-6ca6-a99a-0a00ac070060', parentId: '1f111548-4626-620e-ad68-0a00ac070060', metricId: '00000077-0000-6000-8000-0a00ac070060', title: 'Возможность вертикального роста' },
        { themeId: '1f111548-54fb-62de-bb50-0a00ac070060', parentId: '1f111548-4626-620e-ad68-0a00ac070060', metricId: '00000077-0000-6000-8000-0a00ac070060', title: 'Понятность того, что нужно сделать для карьерного роста' },
        { themeId: '1f111548-5537-64be-9e41-0a00ac070060', parentId: '1f111548-4661-6566-b7d7-0a00ac070060', metricId: '00000079-0000-6000-8000-0a00ac070060', title: 'Внутреннее обучение, стажировки, тренинги' },
        { themeId: '1f111548-5575-6354-b7ba-0a00ac070060', parentId: '1f111548-4661-6566-b7d7-0a00ac070060', metricId: '00000079-0000-6000-8000-0a00ac070060', title: 'Внешнее обучение, стажировки, тренинги' },
        { themeId: '1f111548-57c3-6958-a0e4-0a00ac070060', parentId: '1f111548-47a1-6be2-b10a-0a00ac070060', metricId: '00000083-0000-6000-8000-0a00ac070060', title: 'Постоянная заработная плата' },
        { themeId: '1f111548-5812-686e-b1f6-0a00ac070060', parentId: '1f111548-47a1-6be2-b10a-0a00ac070060', metricId: '00000083-0000-6000-8000-0a00ac070060', title: 'Премии' },
        { themeId: '1f111548-586f-64a6-8db5-0a00ac070060', parentId: '1f111548-47a1-6be2-b10a-0a00ac070060', metricId: '00000083-0000-6000-8000-0a00ac070060', title: 'Дополнительные выплаты' },
        { themeId: '1f111548-5677-67a2-a304-0a00ac070060', parentId: '1f111548-4767-6a82-8690-0a00ac070060', metricId: '00000082-0000-6000-8000-0a00ac070060', title: 'Оплата питания' },
        { themeId: '1f111548-570f-66ec-a827-0a00ac070060', parentId: '1f111548-4767-6a82-8690-0a00ac070060', metricId: '00000082-0000-6000-8000-0a00ac070060', title: 'Оплата обучения' },
        { themeId: '1f111548-5a96-62ca-8ca7-0a00ac070060', parentId: '1f111548-481e-6fb6-a9e7-0a00ac070060', metricId: '00000098-0000-6000-8000-0a00ac070060', title: 'Мое рабочее место' },
        { themeId: '1f111548-5ae9-6664-8729-0a00ac070060', parentId: '1f111548-481e-6fb6-a9e7-0a00ac070060', metricId: '00000098-0000-6000-8000-0a00ac070060', title: 'Напитки и еда' },
        { themeId: '1f111548-5b3d-6430-a5c7-0a00ac070060', parentId: '1f111548-481e-6fb6-a9e7-0a00ac070060', metricId: '00000098-0000-6000-8000-0a00ac070060', title: 'Доступность офиса' },
        { themeId: '1f111548-6c26-671a-9198-0a00ac070060', parentId: '1f111548-5a96-62ca-8ca7-0a00ac070060', metricId: '00000098-0000-6000-8000-0a00ac070060', title: 'Чистота на рабочем месте' },
        { themeId: '1f111548-6d80-6aac-af3e-0a00ac070060', parentId: '1f111548-5a96-62ca-8ca7-0a00ac070060', metricId: '00000098-0000-6000-8000-0a00ac070060', title: 'Уровень шума на рабочем месте' }
      ]
    }
  }

  const treeId = Object.keys(payload.themeTrees)[0]
  const themes = payload.themeTrees[treeId] || []
  const childrenCount = {}
  const metricFrequency = {}

  themes.forEach((item) => {
    if (item.parentId) {
      childrenCount[item.parentId] = (childrenCount[item.parentId] || 0) + 1
    }
    if (item.metricId) {
      metricFrequency[item.metricId] = (metricFrequency[item.metricId] || 0) + 1
    }
  })

  const hash = (text) => {
    let h = 0
    for (let i = 0; i < text.length; i += 1) {
      h = (h * 31 + text.charCodeAt(i)) % 2147483647
    }
    return h
  }

  const scoreByTitle = (title, h) => {
    const t = title.toLowerCase()

    const negativeWords = ['стресс', 'переработ', 'конфликт', 'не ', 'ниже рынка', 'шум', 'недостаточ', 'текучест', 'короткие отпуска']
    const positiveWords = ['доверие', 'возможность', 'полезность', 'качество', 'улучшение', 'обучение', 'помощь', 'карьер', 'премии']

    if (negativeWords.some((word) => t.includes(word))) {
      return Number((-5 + (h % 500) / 100).toFixed(2))
    }

    if (positiveWords.some((word) => t.includes(word))) {
      return Number((4 + (h % 800) / 100).toFixed(2))
    }

    return Number((1 + (h % 700) / 100).toFixed(2))
  }

  return themes.map((item) => {
    const isLeaf = !childrenCount[item.themeId]
    const valueBase = item.metricId ? (metricFrequency[item.metricId] || 1) : 1
    const h = hash(item.themeId)
    const colorValue = scoreByTitle(item.title, h)

    return {
      id: item.themeId,
      name: item.title,
      ...(item.parentId ? { parent: item.parentId } : {}),
      ...(isLeaf
        ? {
          value: 8 + valueBase * 2 + (h % 7),
          colorValue
        }
        : {}),
      custom: {
        fullName: item.title,
        metricId: item.metricId,
        performance: `${colorValue > 0 ? '+' : ''}${colorValue.toFixed(2)}%`
      }
    }
  })
}

const initChart = async () => {
  Highcharts.addEvent(Highcharts.Series, 'drawDataLabels', function () {
    if (this.type === 'treemap') {
      this.points.forEach((point) => {
        if (point.node.level === 2 && Number.isFinite(point.value)) {
          const previousValue = point.node.children.reduce(
            (acc, child) => acc + (child.point.value || 0) - (child.point.value || 0) * (child.point.colorValue || 0) / 100,
            0
          )

          const perf = 100 * (point.value - previousValue) / (previousValue || 1)

          point.custom = {
            performance: (perf < 0 ? '' : '+') + perf.toFixed(2) + '%'
          }

          if (point.dlOptions) {
            point.dlOptions.backgroundColor = this.colorAxis.toColor(perf)
          }
        }

        if (point.node.level === 3 && point.shapeArgs && point.dlOptions?.style) {
          const area = point.shapeArgs.width * point.shapeArgs.height
          point.dlOptions.style.fontSize = `${Math.min(22, 6 + Math.round(area * 0.00045))}px`
        }
      })
    }
  })

  const data = buildTopicData()
  renderChart(data)
}

onMounted(() => {
  initChart()
})

onBeforeUnmount(() => {
  if (chart) {
    chart.destroy()
    chart = null
  }
})
</script>

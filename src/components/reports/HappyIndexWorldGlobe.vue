<template>
  <figure class="highcharts-figure q-ma-none">
    <div ref="globeRef" class="globe-canvas"></div>
    <p class="highcharts-description">
      Глобальное распределение Happy Index по странам в ортографической проекции.
      Цвета: пастельный красный, желтый и зеленый.
    </p>
  </figure>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import Highcharts from 'highcharts/highmaps'
import 'highcharts/modules/data'
import 'highcharts/modules/exporting'
import 'highcharts/modules/accessibility'
import 'highcharts/themes/adaptive'

const globeRef = ref(null)
let chart = null

const data = [
  { name: 'United States of America', value: 72 },
  { name: 'Brazil', value: 66 },
  { name: 'Mexico', value: 64 },
  { name: 'Canada', value: 78 },
  { name: 'Russia', value: 61 },
  { name: 'Argentina', value: 65 },
  { name: 'Germany', value: 74 },
  { name: 'China', value: 67 },
  { name: 'Australia', value: 77 },
  { name: 'France', value: 73 },
  { name: 'United Kingdom', value: 75 },
  { name: 'India', value: 59 },
  { name: 'Japan', value: 70 },
  { name: 'South Korea', value: 69 },
  { name: 'Italy', value: 71 },
  { name: 'Spain', value: 72 },
  { name: 'Turkey', value: 60 },
  { name: 'South Africa', value: 58 },
  { name: 'Egypt', value: 55 },
  { name: 'Saudi Arabia', value: 63 },
  { name: 'Indonesia', value: 62 },
  { name: 'Malaysia', value: 68 },
  { name: 'Thailand', value: 64 },
  { name: 'Ukraine', value: 57 },
  { name: 'Poland', value: 70 },
  { name: 'Norway', value: 81 },
  { name: 'Sweden', value: 80 },
  { name: 'Finland', value: 82 },
  { name: 'Kazakhstan', value: 56 },
  { name: 'Chile', value: 69 }
]

const getGraticule = () => {
  const lines = []

  for (let x = -180; x <= 180; x += 15) {
    lines.push({
      geometry: {
        type: 'LineString',
        coordinates: x % 90 === 0
          ? [[x, -90], [x, 0], [x, 90]]
          : [[x, -80], [x, 80]]
      }
    })
  }

  for (let y = -90; y <= 90; y += 10) {
    const coordinates = []
    for (let x = -180; x <= 180; x += 5) {
      coordinates.push([x, y])
    }

    lines.push({
      geometry: {
        type: 'LineString',
        coordinates
      },
      lineWidth: y === 0 ? 1.5 : undefined
    })
  }

  return lines
}

const renderSea = (activeChart) => {
  let method = 'animate'

  if (!activeChart.sea) {
    activeChart.sea = activeChart.renderer
      .circle()
      .attr({
        fill: {
          radialGradient: {
            cx: 0.4,
            cy: 0.4,
            r: 1
          },
          stops: [
            [0, '#ffffff'],
            [1, '#dbeafe']
          ]
        },
        zIndex: -1
      })
      .add(activeChart.get('graticule').group)

    method = 'attr'
  }

  const bounds = activeChart.get('graticule').bounds
  const p1 = activeChart.mapView.projectedUnitsToPixels({ x: bounds.x1, y: bounds.y1 })
  const p2 = activeChart.mapView.projectedUnitsToPixels({ x: bounds.x2, y: bounds.y2 })

  activeChart.sea[method]({
    cx: (p1.x + p2.x) / 2,
    cy: (p1.y + p2.y) / 2,
    r: Math.min(p2.x - p1.x, p1.y - p2.y) / 2
  })
}

const renderChart = async () => {
  if (!globeRef.value) return

  const topology = await fetch('https://code.highcharts.com/mapdata/custom/world.topo.json')
    .then((response) => response.json())

  chart = Highcharts.mapChart(globeRef.value, {
    chart: {
      map: topology,
      height: 540,
    },
    title: {
      text: 'Happy Index по странам мира',
      floating: true,
      align: 'left',
      style: {
        textOutline: '2px contrast'
      }
    },
    subtitle: {
      text: 'Ортографическая проекция. Перетаскивайте карту для поворота.',
      floating: true,
      y: 34,
      align: 'left'
    },
    legend: {
      enabled: false
    },
    mapNavigation: {
      enabled: true,
      enableDoubleClickZoomTo: true,
      buttonOptions: {
        verticalAlign: 'bottom'
      }
    },
    mapView: {
      maxZoom: 30,
      projection: {
        name: 'Orthographic',
        rotation: [60, -30]
      }
    },
    colorAxis: {
      min: 45,
      max: 85,
      tickPixelInterval: 100,
      minColor: '#f7a8a1',
      maxColor: '#d2d2d2',
      stops: [
        [0, '#f7a8a1'],
        [0.2, '#ffc184'],
        [0.4, '#fde993'],
        [0.6, '#d5e88c'],
        [0.8, '#b7d2a5'],
        [1, '#d2d2d2']
      ]
    },
    tooltip: {
      pointFormat: '{point.name}: <b>{point.value}</b>'
    },
    plotOptions: {
      series: {
        animation: {
          duration: 750
        },
        clip: false
      }
    },
    credits: {
      enabled: false
    },
    series: [
      {
        name: 'Graticule',
        id: 'graticule',
        type: 'mapline',
        data: getGraticule(),
        nullColor: 'rgba(0, 0, 0, 0.05)',
        accessibility: {
          enabled: false
        },
        enableMouseTracking: false
      },
      {
        data,
        joinBy: 'name',
        name: 'Happy Index',
        states: {
          hover: {
            color: '#a8e2b7',
            borderColor: '#4b5563'
          }
        },
        dataLabels: {
          enabled: false,
          format: '{point.name}'
        },
        accessibility: {
          exposeAsGroupOnly: true
        }
      }
    ]
  })

  renderSea(chart)
  Highcharts.addEvent(chart, 'redraw', () => renderSea(chart))
}

onMounted(async () => {
  await renderChart()
})

onBeforeUnmount(() => {
  if (chart) {
    chart.destroy()
    chart = null
  }
})
</script>

<style scoped lang="scss">
.globe-canvas {
  width: 100%;
  min-height: 540px;
}

.highcharts-description {
  margin-top: 10px;
  color: #6b7280;
  font-size: 12px;
}
</style>

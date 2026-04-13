<template>
  <figure class="highcharts-figure q-ma-none">
    <div ref="mapRef" class="map-canvas"></div>
    <p class="highcharts-description">
      Карта показывает распределение Happy Index по регионам России. Шкала: красный - низкий уровень, желтый - средний, зеленый - высокий.
    </p>
  </figure>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import Highcharts from 'highcharts/highmaps'
import 'highcharts/modules/exporting'
import 'highcharts/modules/offline-exporting'
import 'highcharts/modules/accessibility'
import 'highcharts/themes/adaptive'

const mapRef = ref(null)
let chart = null

const hashCode = (text) => {
  let h = 0
  for (let i = 0; i < text.length; i += 1) {
    h = (h * 31 + text.charCodeAt(i)) % 100000
  }
  return h
}

const buildRegionData = (topology) => {
  const geo = Highcharts.geojson(topology)

  return geo
    .map((region) => {
      const key = region.properties?.['hc-key']
      if (!key) return null

      // Deterministic pseudo-random baseline in range 40..85
      const value = 40 + (hashCode(key) % 46)
      return [key, value]
    })
    .filter(Boolean)
}

const renderMap = async () => {
  if (!mapRef.value) return

  const topology = await fetch(
    '/mapdata/countries/ru/ru-all.topo.json'
  ).then((response) => response.json())

  const data = buildRegionData(topology)

  chart = Highcharts.mapChart(mapRef.value, {
    chart: {
      map: topology,
      height: 460,
    },
    title: {
      text: 'Распределение Happy Index по регионам России'
    },
    subtitle: {
      text: 'Пастельная шкала: красный - желтый - зеленый'
    },
    exporting: {
      sourceWidth: 1100,
      sourceHeight: 700
    },
    legend: {
      layout: 'horizontal',
      borderWidth: 0,
      floating: false,
      verticalAlign: 'bottom'
    },
    mapNavigation: {
      enabled: true,
      buttonOptions: {
        verticalAlign: 'bottom'
      }
    },
    colorAxis: {
      min: 40,
      max: 85,
      stops: [
        [0, '#f7a8a1'],
        [0.2, '#ffc184'],
        [0.4, '#fde993'],
        [0.6, '#d5e88c'],
        [0.8, '#b7d2a5'],
        [1, '#d2d2d2']
      ]
    },
    credits: {
      enabled: false
    },
    series: [
      {
        name: 'Happy Index',
        data,
        joinBy: 'hc-key',
        borderColor: '#ffffff',
        borderWidth: 0.7,
        nullColor: '#f3f4f6',
        states: {
          hover: {
            color: '#9ad8ae'
          }
        },
        tooltip: {
          pointFormat: '{point.name}: <b>{point.value}%</b>'
        },
        dataLabels: {
          enabled: false
        }
      }
    ]
  })
}

onMounted(async () => {
  await renderMap()
})

onBeforeUnmount(() => {
  if (chart) {
    chart.destroy()
    chart = null
  }
})
</script>

<style scoped lang="scss">
.map-canvas {
  width: 100%;
  min-height: 460px;
}

.highcharts-description {
  margin-top: 10px;
  color: #6b7280;
  font-size: 12px;
}
</style>

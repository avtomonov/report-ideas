<template>
	<div class="highcharts-figure">
		<div class="play-controls">
			<button class="play-btn" type="button" :title="isPlaying ? 'pause' : 'play'" @click="togglePlay">
				{{ isPlaying ? '❚❚' : '▶' }}
			</button>
			<button class="step-btn" type="button" title="Назад" @click="stepPeriod(-1)">−</button>
			<input
				v-model.number="currentPeriodIndex"
				class="play-range"
				type="range"
				:min="0"
				:max="periods.length - 1"
				step="1"
			/>
			<button class="step-btn" type="button" title="Вперед" @click="stepPeriod(1)">+</button>
			<span class="play-period">{{ currentPeriod }}</span>
		</div>

		<div class="chart-canvas" ref="chartContainer"></div>
		<div v-if="renderError" class="render-error">
			<p>Ошибка при отображении графика</p>
		</div>
	</div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import Highcharts from 'highcharts'

const chartContainer = ref(null)
const renderError = ref(false)
let chartInstance = null
let sequenceTimer = null

const startYear = 2000
const endYear = 2026
const periods = Array.from({ length: endYear - startYear + 1 }, (_, index) => String(startYear + index))
const currentPeriodIndex = ref(periods.length - 1)
const isPlaying = ref(false)

const currentPeriod = computed(() => periods[currentPeriodIndex.value])

const metricNames = [
	'Вовлеченность',
	'Удовлетворенность',
	'Лояльность',
	'eNPS',
	'Явка на работу',
	'Безопасность'
]

const metricProfiles = [
	{ base: 52, growth: 1.45, wave: 1.4 },
	{ base: 50, growth: 1.35, wave: 1.2 },
	{ base: 48, growth: 1.3, wave: 1.1 },
	{ base: 44, growth: 1.15, wave: 1.0 },
	{ base: 42, growth: 1.0, wave: 0.9 },
	{ base: 40, growth: 0.95, wave: 0.8 }
]

const buildImpactsForPeriod = (periodIndex) => {
	return metricProfiles.map((profile, metricIndex) => {
		const trendPart = profile.base + profile.growth * periodIndex
		const wavePart = Math.sin((periodIndex + metricIndex) / 2.8) * profile.wave
		return Math.max(35, Math.min(98, Number((trendPart + wavePart).toFixed(1))))
	})
}

const getMetricColor = (impact) => {
	if (impact >= 85) return '#b7d2a5'
	if (impact >= 75) return '#d5e88c'
	if (impact >= 70) return '#fde993'
	if (impact >= 65) return '#ffc184'
	return '#f7a8a1'
}

const getTrend = (metricIndex, periodIndex) => {
	if (periodIndex === 0) return '→'
	const previous = buildImpactsForPeriod(periodIndex - 1)[metricIndex]
	const current = buildImpactsForPeriod(periodIndex)[metricIndex]
	if (current > previous) return '↑'
	if (current < previous) return '↓'
	return '→'
}

const metricsRankingData = computed(() => {
	const impacts = buildImpactsForPeriod(currentPeriodIndex.value)
	return metricNames.map((metric, metricIndex) => {
		const impact = impacts[metricIndex]
		return {
			metric,
			impact,
			trend: getTrend(metricIndex, currentPeriodIndex.value),
			color: getMetricColor(impact)
		}
	})
})

const averageImpact = computed(() => Number(
	(
		metricsRankingData.value.reduce((sum, item) => sum + item.impact, 0) / metricsRankingData.value.length
	).toFixed(1)
))

const getPriorityLabel = (impact) => {
	if (impact >= 85) return 'Высокий приоритет'
	if (impact >= 70) return 'Средний приоритет'
	return 'Зона внимания'
}

const getSeriesData = () => metricsRankingData.value.map((item) => ({
	name: item.metric,
	y: item.impact,
	color: item.color,
	custom: item.trend,
	priority: getPriorityLabel(item.impact)
}))

const getTopMetric = () => {
	const top = [...metricsRankingData.value].sort((a, b) => b.impact - a.impact)[0]
	return `${top.metric}: ${top.impact}%`
}

const getSubtitleText = () => (
	`<span style="font-size:36px;font-weight:700;color:#000000">${currentPeriod.value}</span><br/>` +
	`<span style="font-size:14px;color:#000000">X: метрики | Y: влияние, % | Среднее: <b>${averageImpact.value}%</b> | Лидер: <b>${getTopMetric()}</b></span>`
)

const chartOptions = () => ({
	chart: {
		type: 'column',
		height: 620,
		backgroundColor: 'transparent',
		plotBorderColor: '#cccccc'
	},
	title: {
		text: 'Метрики по влиянию',
		style: { color: '#000000', fontSize: '20px', fontWeight: 'bold' }
	},
	subtitle: {
		text: getSubtitleText(),
		useHTML: true,
		align: 'right',
		verticalAlign: 'middle',
		floating: true,
		y: -90,
		x: -40,
		style: { color: '#666666', fontSize: '14px' }
	},
	xAxis: {
		type: 'category',
		categories: metricsRankingData.value.map(d => d.metric),
		title: { text: 'Метрики', style: { color: '#000000', fontWeight: 'bold', fontSize: '14px' } },
		labels: { style: { color: '#000000', fontSize: '13px' } },
		tickInterval: 1
	},
	yAxis: {
		type: 'linear',
		title: { text: 'Влияние, %', style: { color: '#000000', fontWeight: 'bold', fontSize: '14px' } },
		labels: { style: { color: '#000000', fontWeight: 'bold', fontSize: '14px' } },
		tickInterval: 10,
		min: 0,
		max: 100,
		plotLines: [
			{
				id: 'avg-line',
				value: averageImpact.value,
				color: '#000000',
				dashStyle: 'ShortDash',
				width: 2,
				label: {
					text: `Среднее: ${averageImpact.value}%`,
					style: { color: '#000000', fontSize: '11px' }
				}
			}
		]
	},
	plotOptions: {
		column: {
			pointWidth: 34,
			groupPadding: 0.16,
			borderWidth: 0,
			animation: {
				duration: 650,
				easing: 'easeOutCubic'
			},
			dataLabels: {
				enabled: true,
				inside: false,
				align: 'center',
				y: -6,
				style: { color: '#000000', fontSize: '14px', fontWeight: 'bold' },
				formatter() {
					return `${this.y}%`
				}
			}
		}
	},
	series: [{
		name: 'Уровень влияния',
		colorByPoint: true,
		data: getSeriesData()
	}],
	legend: {
		enabled: false
	},
	credits: { enabled: false },
	tooltip: {
		headerFormat: '<b>{point.category}</b><br/>',
		pointFormat: 'Влияние: {point.y}%<br/>Тренд к прошлому периоду: {point.custom}<br/>Приоритет: {point.priority}'
	}
})

const play = () => {
	if (sequenceTimer) return
	isPlaying.value = true
	sequenceTimer = setInterval(() => {
		if (currentPeriodIndex.value >= periods.length - 1) {
			pause()
			return
		}
		currentPeriodIndex.value += 1
	}, 700)
}

const pause = () => {
	isPlaying.value = false
	if (sequenceTimer) {
		clearInterval(sequenceTimer)
		sequenceTimer = null
	}
}

const stepPeriod = (direction) => {
	pause()
	const nextIndex = currentPeriodIndex.value + direction
	currentPeriodIndex.value = Math.max(0, Math.min(periods.length - 1, nextIndex))
}

const resetTimeline = () => {
	pause()
	currentPeriodIndex.value = 0
}

const togglePlay = () => {
	if (isPlaying.value) {
		pause()
		return
	}

	if (currentPeriodIndex.value >= periods.length - 1) {
		currentPeriodIndex.value = 0
	}
	play()
}

const initChart = () => {
	if (!chartContainer.value) return

	try {
		if (chartInstance) {
			chartInstance.destroy()
		}

		chartInstance = Highcharts.chart(chartContainer.value, chartOptions())
		renderError.value = false
	} catch (error) {
		console.error('Error rendering chart:', error)
		renderError.value = true
	}
}

const updateChartForPeriod = () => {
	if (!chartInstance) return

	chartInstance.update(
		{
			subtitle: {
				text: getSubtitleText()
			}
		},
		false,
		false,
		false
	)

	chartInstance.series[0].setData(getSeriesData(), false, {
		duration: 650,
		easing: 'easeOutCubic'
	})

	const axis = chartInstance.yAxis[0]
	axis.removePlotLine('avg-line')
	axis.addPlotLine({
		id: 'avg-line',
		value: averageImpact.value,
		color: '#000000',
		dashStyle: 'ShortDash',
		width: 2,
		label: {
			text: `Среднее: ${averageImpact.value}%`,
			style: { color: '#000000', fontSize: '11px' }
		}
	})

	chartInstance.redraw()
}

const safeInitChart = () => {
	let retries = 0
	const maxRetries = 8

	const attempt = () => {
		if (retries >= maxRetries) {
			renderError.value = true
			return
		}

		if (chartContainer.value && chartContainer.value.offsetParent !== null) {
			initChart()
		} else {
			retries += 1
			requestAnimationFrame(attempt)
		}
	}

	attempt()
}

onMounted(() => {
	safeInitChart()
})

watch(currentPeriodIndex, () => {
	updateChartForPeriod()
})

onBeforeUnmount(() => {
	pause()
	if (chartInstance) {
		chartInstance.destroy()
		chartInstance = null
	}
})
</script>

<style scoped>
.highcharts-figure {
	width: 100%;
	min-height: 700px;
	padding: 24px;
	background: white;
	border-radius: 8px;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.play-controls {
	display: grid;
	grid-template-columns: auto auto 1fr auto auto;
	align-items: center;
	gap: 12px;
	margin-bottom: 16px;
}

.play-btn,
.step-btn,
.reset-btn {
	height: 42px;
	border: 1px solid #d2d2d2;
	border-radius: 10px;
	background: #ffffff;
	color: #000000;
	font-weight: 700;
	cursor: pointer;
}

.play-btn,
.step-btn {
	width: 42px;
}

.play-btn {
	background: #fde993;
}

.reset-btn {
	padding: 0 12px;
}

.play-range {
	width: 100%;
	accent-color: #b7d2a5;
}

.play-period {
	min-width: 80px;
	text-align: right;
	color: #000000;
	font-weight: 700;
}

.chart-canvas {
	width: 100%;
	min-height: 620px;
}

.render-error {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 100%;
	min-height: 620px;
	background-color: #f5f5f5;
	border-radius: 4px;
	color: #d32f2f;
	font-size: 14px;
}
</style>

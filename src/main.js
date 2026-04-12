import { createApp } from 'vue'
import { Quasar } from 'quasar'
import HighchartsVue from 'highcharts-vue'

import App from './App.vue'
import quasarUserOptions from './quasar-user-options'

import '@quasar/extras/material-icons/material-icons.css'
import 'quasar/src/css/index.sass'
import './css/app.scss'

const app = createApp(App)

app.use(Quasar, quasarUserOptions)
app.use(HighchartsVue)

app.mount('#app')

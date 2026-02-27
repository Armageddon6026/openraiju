import '@/styles/main.css'
import 'virtual:uno.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import { definePreset } from '@primeuix/themes'
import Aura from '@primeuix/themes/aura'

import App from './App.vue'
import router from './router'

const RazerPreset = definePreset(Aura, {
	semantic: {
		primary: {
			50: '{green.50}',
			100: '{green.100}',
			200: '{green.200}',
			300: '{green.300}',
			400: '{green.400}',
			500: '{green.500}',
			600: '{green.600}',
			700: '{green.700}',
			800: '{green.800}',
			900: '{green.900}',
			950: '{green.950}',
		},
	},
})

const app = createApp(App)

app.use(createPinia())
app.use(PrimeVue, {
	theme: {
		preset: RazerPreset,
		options: {
			prefix: 'p',
			darkModeSelector: 'system',
		},
	},
})
app.use(router)

app.mount('#app')

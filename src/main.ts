import '@/styles/main.css'
import 'virtual:uno.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'
import ToastService from 'primevue/toastservice'
import ConfirmationService from 'primevue/confirmationservice'

import App from '@/App.vue'
import router from '@/router'

document.title = __APP_INFO__.pkg.name.charAt(0).toUpperCase() + __APP_INFO__.pkg.name.slice(1)

const app = createApp(App)

app.use(createPinia())
app.use(ToastService)
app.use(ConfirmationService)
app.use(PrimeVue, {
	theme: {
		preset: Aura,
		options: {
			prefix: 'p',
			darkModeSelector: 'system',
		},
	},
})
app.use(router)

app.mount('#app')

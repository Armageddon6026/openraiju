import { createRouter, createWebHistory } from 'vue-router'
import BaseLayout from '@/layout/BaseLayout.vue'

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes: [
		{
			path: '/',
			redirect: '/razer',
			component: BaseLayout,
			children: [
				{
					path: 'razer',
					name: 'razer',
					component: () => import('@/layout/RazerLayout.vue'),
					children: [
						{
							path: '',
							name: 'razerdashboard',
							component: () => import('@/views/razer/dashborad/DashboradView.vue'),
						},
						{
							path: 'device/:instanceId',
							name: 'razerdevice',
							component: () => import('@/views/razer/device/DeviceView.vue'),
						},
					],
				},
				{
					path: 'setting',
					name: 'setting',
					component: () => import('../views/SettingView.vue'),
				},
			],
		},
	],
})

export default router

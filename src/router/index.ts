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
							path: 'mouse/:instanceId',
							name: 'razermouse',
							component: () => import('@/views/razer/device/MouseView.vue'),
						},
						{
							path: 'accessory/:instanceId',
							name: 'razeraccessory',
							component: () => import('@/views/razer/device/AccessoryView.vue'),
						},
					],
				},
				{
					path: 'setting',
					name: 'setting',
					// route level code-splitting
					// this generates a separate chunk (About.[hash].js) for this route
					// which is lazy-loaded when the route is visited.
					component: () => import('../views/SettingView.vue'),
				},
			],
		},
	],
})

export default router

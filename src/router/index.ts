import { createRouter, createWebHistory } from 'vue-router'
import DashboardLayout from '@/layout/DashboardLayout.vue'

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes: [
		{
			path: '/',
			redirect: '/razer',
			component: DashboardLayout,
			children: [
				{
					path: 'razer',
					name: 'razer',
					component: () => import('@/layout/RazerLayout.vue'),
					children: [
						{
							path: '',
							name: 'razerdashboard',
							component: () => import('@/views/razer/DashboradView.vue'),
						},
						{
							path: 'mouse/:productId',
							name: 'razermouse',
							component: () => import('@/views/razer/MouseView.vue'),
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

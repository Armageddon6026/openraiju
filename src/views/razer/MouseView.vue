<script setup lang="ts">
import { useDeviceStore } from '@/stores'
import { useToast } from 'primevue'

const toast = useToast()
const route = useRoute()
const router = useRouter()
const deviceStore = useDeviceStore()

const currentDevice = computed(() => {
	return deviceStore.devicesMap.get(route.params.instanceId as string)
})

watchEffect(() => {
	if (!currentDevice.value) {
		toast.add({
			severity: 'warn',
			summary: 'Device Lost',
			detail: 'The device was disconnected or not found.',
			life: 3000,
		})
		router.replace('/')
	}
})
</script>

<template>
	<div>Mouse Dash Board</div>
</template>

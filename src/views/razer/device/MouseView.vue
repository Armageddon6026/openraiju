<script setup lang="ts">
import { useDeviceStore } from '@/stores'

const toast = useToast()
const route = useRoute()
const router = useRouter()
const deviceStore = useDeviceStore()

const currentDevice = computed(() => {
	return deviceStore.devicesMap.get(route.params.instanceId as string)
})

onMounted(async () => {
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
	<div v-if="currentDevice" p="6">
		<div fle="~" items="center" justify="between" mb="8">
			<h2 text="2xl" font="bold" uppercase="~" tracking="wider">Performance</h2>
		</div>

		<DpiStages v-if="currentDevice.config.getDpiStages" :device="currentDevice" />
		<PollingRate v-if="currentDevice.config.getPollingRate" :device="currentDevice" />
	</div>
	<div v-else flex="~col" items="center" justify="center" h="64" text="gray-600">
		<p>Loading Device Configuration...</p>
	</div>
</template>

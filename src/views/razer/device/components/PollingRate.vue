<script setup lang="ts">
const { device } = defineProps<{
	device: RazerDevice
}>()

const toast = useToast()

const pollingRate = ref<number>()

onMounted(async () => {
	if (device.config.getPollingRate) {
		pollingRate.value = await device.config.getPollingRate(device.instance)
	}
})
</script>

<template>
	<Card v-if="pollingRate" un-border="1 green-500">
		<template #title>
			<label class="block text-gray-400 mb-4 font-semibold uppercase text-xs">DPI Stages</label>
		</template>
		<template #subtitle>
			<div class="flex gap-4">
				<div>
					<div class="text-xs text-gray-500 mb-1">STAGE {{ pollingRate }}</div>
				</div>
			</div>
		</template>
	</Card>
</template>

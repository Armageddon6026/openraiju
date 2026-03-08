<script setup lang="ts">
const { device } = defineProps<{
	device: RazerDevice
}>()

const toast = useToast()

const pollingRate = ref<number>()
const isUpdating = ref(false)

const pollingRateOptions = computed(() => {
	if (!device.config.hardware) {
		return []
	}
	const maxPollingRate = device.config.hardware.HyperPolling ? 8000 : 1000
	const rates = []
	for (let rate = 125; rate <= maxPollingRate; rate *= 2) {
		if (rate === 250) continue
		rates.push(rate)
	}
	return rates
})

async function setPollingRate(rate: number) {
	if (isUpdating.value || pollingRate.value === rate) return

	const oldRate = pollingRate.value
	pollingRate.value = rate // Optimistic update
	isUpdating.value = true
	try {
		if (device.config.setPollingRate) {
			await device.config.setPollingRate(device.instance, rate)
			toast.add({
				severity: 'success',
				summary: 'Success',
				detail: `Polling rate set to ${rate} Hz`,
				life: 3000,
			})
		}
	} catch (error) {
		pollingRate.value = oldRate // Revert on failure
		toast.add({
			severity: 'error',
			summary: 'Error',
			detail: 'Failed to set polling rate',
			life: 3000,
		})
	} finally {
		isUpdating.value = false
	}
}

onMounted(async () => {
	if (device.config.getPollingRate) {
		pollingRate.value = await device.config.getPollingRate(device.instance)
	}
})
</script>

<template>
	<Card v-if="pollingRate !== undefined" un-border="1 green-500">
		<template #title>
			<label class="block text-gray-400 mb-4 font-semibold uppercase text-xs">Polling Rate</label>
		</template>
		<template #subtitle>
			<div class="flex gap-4" :class="{ 'pointer-events-none opacity-50': isUpdating }">
				<div
					v-for="rate in pollingRateOptions"
					:key="rate"
					class="flex-1 p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 text-center"
					:class="[
						pollingRate === rate
							? 'border-green-500 bg-green-500/10 shadow-[0_0_15px_rgba(34,197,94,0.3)]'
							: 'border-gray-700 bg-[#2a2a2a] hover:border-gray-500',
					]"
					@click="setPollingRate(rate)"
				>
					<div class="text-xl font-black text-white">
						{{ rate }}
					</div>
					<div class="text-xs text-gray-500 mt-1">Hz</div>
				</div>
			</div>
		</template>
	</Card>
</template>

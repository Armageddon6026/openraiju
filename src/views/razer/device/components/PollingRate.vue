<script setup lang="ts">
const { device } = defineProps<{
	device: RazerDevice
}>()

const toast = useToast()

const pollingRate = ref<number>()

const pollingRateOptions = computed(() => {
	if (!device.config.hardware) {
		return []
	}
	const maxPollingRate = device.config.hardware.HyperPolling ? 8000 : 1000
	const rates = []
	for (let rate = 125; rate <= maxPollingRate; rate *= 2) {
		if (rate === 250) continue // Skip 250 Hz
		rates.push(rate)
	}
	return rates
})

async function setPollingRate(rate: number) {
	if (!device.config.setPollingRate) {
		throw new Error('Device does not support setting polling rate')
	}
	if (!rate || pollingRate.value === rate) return

	const summary = 'Set Polling Rate'
	const oldRate = pollingRate.value
	pollingRate.value = rate
	try {
		await device.config.setPollingRate(device.instance, rate)
		toast.add({
			severity: 'success',
			summary: summary,
			detail: `Polling rate set to ${rate} Hz`,
			life: 3000,
		})
	} catch (e) {
		pollingRate.value = oldRate // Revert on failure
		toast.add({
			severity: 'error',
			summary: summary,
			detail: `${e}`,
			life: 3000,
		})
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
			<label block="~" text="xs gray-400" m="b4" font="semibold" uppercase="~">Polling Rate</label>
		</template>
		<template #subtitle>
			<div flex="~" gap="4">
				<div
					v-for="rate in pollingRateOptions"
					:key="rate"
					flex="1"
					p="4"
					rounded="lg"
					un-border="2"
					cursor="pointer"
					transition="all"
					duration="200"
					text="center"
					:class="[
						pollingRate === rate
							? 'border-green-500 bg-green-500/10 shadow-[0_0_15px_rgba(34,197,94,0.3)]'
							: 'border-gray-700 bg-[#2a2a2a] hover:border-gray-500',
					]"
					@click="setPollingRate(rate)"
				>
					<div text="xl white" font="black">
						{{ rate }}
					</div>
					<div text="xs gray-500" m="t1">Hz</div>
				</div>
			</div>
		</template>
	</Card>
</template>

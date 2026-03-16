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
	const maxPollingRate = device.config.hardware.hyper_polling ? 8000 : 1000
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
	<Card rounded="2xl" un-border="1 emerald-500/35" bg="#121212" overflow="hidden">
		<template #title>
			<div flex="~" items="center" justify="between">
				<div>
					<label block="~" text="xs gray-400" m="b1" font="semibold" uppercase="~">Response</label>
					<h3 text="xl emerald-50" font="bold">Polling Rate</h3>
				</div>
				<div rounded="lg" p="x3 y2" bg="emerald-500/10" un-border="1 emerald-500/30" text="right">
					<p text="xs emerald-200/85">Current</p>
					<p text="sm emerald-100" font="bold">{{ pollingRate }} Hz</p>
				</div>
			</div>
		</template>
		<template #content>
			<div flex="~ wrap" gap="3">
				<div
					v-for="rate in pollingRateOptions"
					:key="rate"
					flex="1 1 130px"
					p="4"
					rounded="lg"
					un-border="2"
					cursor="pointer"
					transition="all"
					duration="200"
					text="left"
					:class="[
						pollingRate === rate
							? 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_18px_rgba(16,185,129,0.25)]'
							: 'border-gray-700 bg-[#1b1b1b] hover:border-gray-500 hover:bg-[#202020]',
					]"
					@click="setPollingRate(rate)"
				>
					<div flex="~" items="center" justify="between" gap="2">
						<div>
							<p text="xl" font="black" :class="pollingRate === rate ? 'text-emerald-100' : 'text-white'">
								{{ rate }}
							</p>
							<p text="xs gray-500" m="t1">Hz</p>
						</div>
						<span v-if="pollingRate === rate" i="material-symbols-check-circle" text="xl emerald-300"></span>
					</div>
				</div>
			</div>
		</template>
	</Card>
</template>

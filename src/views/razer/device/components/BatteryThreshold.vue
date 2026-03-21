<script setup lang="ts">
const { device } = defineProps<{
	device: RazerDevice<RazerBaseDeviceConfig>
}>()

const toast = useToast()

const lowBatteryThreshold = ref(5)

onMounted(async () => {
	if (device.config.getLowBatteryThreshold) {
		const rawLowBatteryThreshold = await device.config.getLowBatteryThreshold(device.instance)
		lowBatteryThreshold.value = rawLowBatteryThreshold
	}
})

async function setLowBatteryThreshold() {
	if (!device.config.setLowBatteryThreshold) {
		throw new Error('Device does not support setting low battery threshold')
	}

	const summary = 'Set Low Battery Threshold'
	try {
		await device.config.setLowBatteryThreshold(device.instance, lowBatteryThreshold.value)
		toast.add({
			severity: 'success',
			summary: summary,
			detail: `Low battery threshold set to ${lowBatteryThreshold.value}%`,
			life: 3000,
		})
	} catch (e) {
		toast.add({
			severity: 'error',
			summary: summary,
			detail: `${e}`,
			life: 3000,
		})
	}
}
</script>

<template>
	<Card rounded="2xl" un-border="1 emerald-500/35" bg="#121212" overflow="hidden">
		<template #title>
			<div flex="~" items="center" justify="between">
				<div>
					<label block="~" text="xs gray-400" m="b1" font="semibold" uppercase="~">Power</label>
					<h3 text="xl emerald-50" font="bold">Low Battery Threshold</h3>
				</div>
				<div rounded="lg" p="x3 y2" bg="emerald-500/10" un-border="1 emerald-500/30" text="right">
					<p text="xs emerald-200/85">Current</p>
					<p text="sm emerald-100" font="bold">{{ lowBatteryThreshold }}%</p>
				</div>
			</div>
		</template>
		<template #content>
			<div rounded="xl" p="4" bg="[#171717]" un-border="1 emerald-500/20">
				<div flex="~" items="center" justify="between" gap="3">
					<div>
						<p text="xs gray-400">Low Battery Threshold</p>
						<p text="sm emerald-100" font="bold">{{ lowBatteryThreshold }}%</p>
					</div>
					<div text="xs gray-500 right">
						<p>5%</p>
						<p>100%</p>
					</div>
				</div>

				<Slider mt="4" v-model="lowBatteryThreshold" :min="5" :max="100" :step="5" @slideend="setLowBatteryThreshold" />
			</div>
		</template>
	</Card>
</template>

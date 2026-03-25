<script setup lang="ts">
const { device } = defineProps<{
	device: TypedDeviceWith<'mouse', 'getTrackingStep' | 'setTrackingStep'>
}>()

const toast = useToast()

const trackingStep = ref(0)
const trackingLevel = computed(() => {
	const max = device.config.hardware.optical_sensor.max_tracking_step
	const step = trackingStep.value
	if (step <= max * 0.25) return 'Low'
	if (step <= max * 0.75) return 'Medium'
	return 'High'
})

onMounted(async () => {
	trackingStep.value = await device.config.getTrackingStep(device.instance)
})

async function setTrackingStep() {
	const summary = 'Set Tracking Step'
	try {
		await device.config.setTrackingStep(device.instance, trackingStep.value)
		toast.add({
			severity: 'success',
			summary: summary,
			detail: `Tracking step set to ${trackingStep.value}`,
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
					<label block="~" text="xs gray-400" m="b1" font="semibold" uppercase="~">Tracking</label>
					<h3 text="xl emerald-50" font="bold">Smart Tracking</h3>
				</div>
				<div rounded="lg" p="x3 y2" bg="emerald-500/10" un-border="1 emerald-500/30" text="right">
					<p text="xs emerald-200/85">Current</p>
					<p text="sm emerald-100" font="bold">{{ trackingLevel }}</p>
				</div>
			</div>
		</template>
		<template #content>
			<div rounded="xl" p="4" bg="[#171717]" un-border="1 emerald-500/20">
				<div flex="~" items="center" justify="between" gap="3">
					<div>
						<p text="xs gray-400">Tracking Step</p>
						<p text="sm emerald-100" font="bold">{{ trackingLevel }}</p>
					</div>
					<div text="xs gray-500 right">
						<p>5%</p>
						<p>100%</p>
					</div>
				</div>

				<Slider
					mt="4"
					v-model="trackingStep"
					:min="0"
					:max="device.config.hardware.optical_sensor.max_tracking_step"
					:step="1"
					@slideend="setTrackingStep"
				/>
			</div>
		</template>
	</Card>
</template>

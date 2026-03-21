<script setup lang="ts">
const { device } = defineProps<{
	device: RazerDevice<RazerBaseDeviceConfig>
}>()

const toast = useToast()

const idleTimeMinutes = ref(1)

onMounted(async () => {
	if (device.config.getIdleTime) {
		const rawIdleTime = await device.config.getIdleTime(device.instance)
		idleTimeMinutes.value = rawIdleTime
	}
})

async function setIdleTime() {
	if (!device.config.setIdleTime) {
		throw new Error('Device does not support setting idle time')
	}

	const summary = 'Set Idle Time'
	try {
		await device.config.setIdleTime(device.instance, idleTimeMinutes.value)
		toast.add({
			severity: 'success',
			summary: summary,
			detail: `Idle time set to ${idleTimeMinutes.value} minutes`,
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
					<h3 text="xl emerald-50" font="bold">Wireless Idle Time</h3>
				</div>
				<div rounded="lg" p="x3 y2" bg="emerald-500/10" un-border="1 emerald-500/30" text="right">
					<p text="xs emerald-200/85">Current</p>
					<p text="sm emerald-100" font="bold">{{ idleTimeMinutes }} min</p>
				</div>
			</div>
		</template>
		<template #content>
			<div rounded="xl" p="4" bg="[#171717]" un-border="1 emerald-500/20">
				<div flex="~" items="center" justify="between" gap="3">
					<div>
						<p text="xs gray-400">Auto Sleep Delay</p>
						<p text="sm emerald-100" font="bold">{{ idleTimeMinutes }} minute(s)</p>
					</div>
					<div text="xs gray-500 right">
						<p>1 min</p>
						<p>15 min</p>
					</div>
				</div>

				<Slider
					mt="4"
					v-model="idleTimeMinutes"
					:min="1"
					:max="15"
					:step="1"
					@slideend="setIdleTime"
					@click="setIdleTime"
				/>
			</div>
		</template>
	</Card>
</template>

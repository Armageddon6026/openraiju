<script setup lang="ts">
const { device } = defineProps<{
	device: RazerDevice<RazerDeviceConfig<'mouse'>>
}>()

const toast = useToast()

const dpiStages = ref<RazerDpiStageInfo>()

const activeStage = computed(() => {
	if (!dpiStages.value) return undefined
	return dpiStages.value.DpiStages.find((stage) => stage.ID === dpiStages.value?.ActivateID)
})

onMounted(async () => {
	if (device.config.getDpiStages) {
		dpiStages.value = await device.config.getDpiStages(device.instance)
	}
})

async function setActivateDpiStage(selectStageId: number) {
	if (!device.config.setActivateDpiStage) {
		throw new Error('Device does not support setting DPI stages')
	}
	if (!dpiStages.value || dpiStages.value.ActivateID === selectStageId) {
		return
	}

	const summary = 'Set DPI Stage'
	try {
		await device.config.setActivateDpiStage(device.instance, selectStageId)
		dpiStages.value.ActivateID = selectStageId
		toast.add({
			severity: 'success',
			summary: summary,
			detail: `DPI Stage set to stage ${selectStageId}`,
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

async function setDpi(dpi: number) {
	if (!device.config.setDpiStages) {
		throw new Error('Device does not support setting DPI')
	}
	if (!dpiStages.value) {
		return
	}

	const summary = 'Set DPI'
	try {
		dpiStages.value.DpiStages[dpiStages.value.ActivateID - 1]!.X = dpi
		dpiStages.value.DpiStages[dpiStages.value.ActivateID - 1]!.Y = dpi
		await device.config.setDpiStages(device.instance, dpiStages.value)
		toast.add({
			severity: 'success',
			summary: summary,
			detail: `DPI set to ${dpi}`,
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
	<Card v-if="dpiStages" rounded="2xl" un-border="1 emerald-500/35" bg="#121212" overflow="hidden">
		<template #title>
			<div flex="~" items="center" justify="between">
				<div>
					<label block="~" text="xs gray-400" m="b1" font="semibold" uppercase="~">Performance</label>
					<h3 text="xl emerald-50" font="bold">DPI Stages</h3>
				</div>
				<div text="right" rounded="lg" p="x3 y2" bg="emerald-500/10" un-border="1 emerald-500/30">
					<p text="xs emerald-200/85">Active Stage</p>
					<p text="sm emerald-100" font="bold">
						{{ activeStage ? `Stage ${activeStage.ID} · ${activeStage.X.toLocaleString()} DPI` : '---' }}
					</p>
				</div>
			</div>
		</template>
		<template #content>
			<div class="flex flex-wrap gap-3">
				<div
					v-for="stage in dpiStages.DpiStages"
					:key="stage.ID"
					flex="1 1 160px"
					p="4"
					rounded="lg"
					un-border="2"
					cursor="pointer"
					transition="all"
					duration="200"
					text="left"
					@click="setActivateDpiStage(stage.ID)"
					:class="[
						dpiStages.ActivateID === stage.ID
							? 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_18px_rgba(16,185,129,0.25)]'
							: 'border-gray-700 bg-[#1b1b1b] hover:border-gray-500 hover:bg-[#202020]',
					]"
				>
					<div flex="~" items="start" justify="between" gap="2">
						<div>
							<p text="xs gray-400" m="b1">STAGE {{ stage.ID }}</p>
							<p text="xl" font="black" :class="dpiStages.ActivateID === stage.ID ? 'text-emerald-100' : 'text-white'">
								{{ stage.X.toLocaleString() }}
							</p>
							<p text="xs gray-500" m="t1">DPI</p>
						</div>
						<span
							v-if="dpiStages.ActivateID === stage.ID"
							i="material-symbols-check-circle"
							text="xl emerald-300"
						></span>
					</div>
				</div>
			</div>
			<div mt="4" rounded="xl" p="4" bg="[#171717]" un-border="1 emerald-500/20">
				<div flex="~" items="center" justify="between" gap="3">
					<div>
						<p text="xs gray-400">Sensitivity</p>
						<p text="sm emerald-100" font="bold">
							{{ dpiStages.DpiStages[dpiStages.ActivateID - 1]!.X.toLocaleString() }} DPI
						</p>
					</div>
					<div text="xs gray-500 right">
						<p>{{ device.config.hardware.optical_sensor.dpi_step.toLocaleString() }} min</p>
						<p>{{ device.config.hardware.optical_sensor.max_dpi.toLocaleString() }} max</p>
					</div>
				</div>
				<Slider
					mt="4"
					v-model="dpiStages.DpiStages[dpiStages.ActivateID - 1]!.X"
					:max="device.config.hardware.optical_sensor.max_dpi"
					:step="device.config.hardware.optical_sensor.dpi_step"
					@slideend="setDpi(dpiStages.DpiStages[dpiStages.ActivateID - 1]!.X)"
					@click="setDpi(dpiStages.DpiStages[dpiStages.ActivateID - 1]!.X)"
				/>
			</div>
		</template>
	</Card>
</template>

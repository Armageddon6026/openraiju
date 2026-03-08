<script setup lang="ts">
const { device } = defineProps<{
	device: RazerDevice
}>()

const toast = useToast()

const dpiStages = ref<MouseDpiInfo>()

onMounted(async () => {
	if (device.config.getDpiStages) {
		dpiStages.value = await device.config.getDpiStages(device.instance)
	}
})

async function setDpiStage(selectStageId: number) {
	if (!device.config.setDpiStages) {
		throw new Error('Device does not support setting DPI stages')
	}
	if (!dpiStages.value || dpiStages.value.ActivateID === selectStageId) {
		return
	}

	const summary = 'Set DPI Stage'
	dpiStages.value.ActivateID = selectStageId
	try {
		await device.config.setDpiStages(device.instance, dpiStages.value!)
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
</script>

<template>
	<Card v-if="dpiStages" un-border="1 green-500">
		<template #title>
			<label block="~" text="xs gray-400" m="b4" font="semibold" uppercase="~">DPI Stages</label>
		</template>
		<template #subtitle>
			<div class="flex gap-4">
				<div
					v-for="stage in dpiStages.DpiStages"
					:key="stage.ID"
					flex="1"
					p="4"
					rounded="lg"
					un-border="2"
					cursor="pointer"
					transition="all"
					duration="200"
					text="center"
					@click="setDpiStage(stage.ID)"
					:class="[
						dpiStages.ActivateID === stage.ID
							? 'border-green-500 bg-green-500/10 shadow-[0_0_15px_rgba(34,197,94,0.3)]'
							: 'border-gray-700 bg-[#2a2a2a] hover:border-gray-500',
					]"
				>
					<div text="xs gray-500" m="b1">STAGE {{ stage.ID }}</div>
					<div text="xl white" font="black">{{ stage.X }}</div>
				</div>
			</div>
		</template>
	</Card>
</template>

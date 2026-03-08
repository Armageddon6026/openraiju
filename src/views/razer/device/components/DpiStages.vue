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
	if (!device?.config.setDpiStages) {
		throw new Error('Device does not support setting DPI stages')
	}
	dpiStages.value!.ActivateID = selectStageId

	try {
		await device.config.setDpiStages(device.instance, dpiStages.value!)
	} catch (e) {
		toast.add({
			severity: 'error',
			summary: 'Set DPI Stage',
			detail: `${e}`,
			life: 3000,
		})
	}
}
</script>

<template>
	<Card v-if="dpiStages" un-border="1 green-500">
		<template #title>
			<label class="block text-gray-400 mb-4 font-semibold uppercase text-xs">DPI Stages</label>
		</template>
		<template #subtitle>
			<div class="flex gap-4">
				<div
					v-for="stage in dpiStages.DpiStages"
					:key="stage.ID"
					@click="setDpiStage(stage.ID)"
					:class="[
						'flex-1 p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 text-center',
						dpiStages.ActivateID === stage.ID
							? 'border-green-500 bg-green-500/10 shadow-[0_0_15px_rgba(34,197,94,0.3)]'
							: 'border-gray-700 bg-[#2a2a2a] hover:border-gray-500',
					]"
				>
					<div class="text-xs text-gray-500 mb-1">STAGE {{ stage.ID }}</div>
					<div class="text-xl font-black text-white">{{ stage.X }}</div>
				</div>
			</div>
		</template>
	</Card>
</template>

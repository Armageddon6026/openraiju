<script setup lang="ts">
const { device } = defineProps<{
	device: RazerDevice
}>()

const toast = useToast()

const dpiStages = ref<MouseDpiInfo>()

const activeStage = computed(() => {
	if (!dpiStages.value) return undefined
	return dpiStages.value.DpiStages.find((stage) => stage.ID === dpiStages.value?.ActivateID)
})

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
					@click="setDpiStage(stage.ID)"
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
		</template>
	</Card>
</template>

<script setup lang="ts">
import { useDeviceStore } from '@/stores'
import { useToast } from 'primevue'

const toast = useToast()
const route = useRoute()
const router = useRouter()
const deviceStore = useDeviceStore()

const dpiStages = ref<MouseDpiInfo>()
const currentDevice = computed(() => {
	return deviceStore.devicesMap.get(route.params.instanceId as string)
})

onMounted(async () => {
	if (!currentDevice.value) {
		toast.add({
			severity: 'warn',
			summary: 'Device Lost',
			detail: 'The device was disconnected or not found.',
			life: 3000,
		})
		router.replace('/')
		return
	}

	if (currentDevice.value.config.getDpiStages) {
		dpiStages.value = await currentDevice.value.config.getDpiStages(currentDevice.value.handle)
	}
})

async function setDpiStage(selectStageId: number) {
	if (!currentDevice.value?.config.setDpiStages) {
		throw new Error('Device does not support setting DPI stages')
	}
	dpiStages.value!.ActivateID = selectStageId

	try {
		await currentDevice.value.config.setDpiStages(currentDevice.value.handle, dpiStages.value!)
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
	<div
		v-if="currentDevice && dpiStages"
		class="p-6 bg-[#1a1a1a] rounded-xl shadow-lg border border-gray-800"
	>
		<div class="flex items-center justify-between mb-8">
			<h2 class="text-2xl font-bold text-white uppercase tracking-wider">Performance / DPI</h2>
			<Badge :value="currentDevice.handle.productName" severity="success" />
		</div>

		<div class="mb-10">
			<label class="block text-gray-400 mb-4 font-semibold uppercase text-xs">DPI Stages</label>
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
		</div>
	</div>
	<div v-else class="flex flex-col items-center justify-center h-64 text-gray-600">
		<i class="i-svg-spinners-blocks-shuffle-3 text-4xl mb-4"></i>
		<p>Loading Device Configuration...</p>
	</div>
</template>

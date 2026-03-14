<script setup lang="ts">
import { useDeviceStore } from '@/stores'
import DeviceSettingsLayout from './DeviceSettingsLayout.vue'

const toast = useToast()
const route = useRoute()
const router = useRouter()
const deviceStore = useDeviceStore()

const serial = ref('---')
const firmware = ref('---')
const activeSettingsTab = ref<number>(0)

const hasDpiControl = computed(() => Boolean(currentDevice.value?.config.getDpiStages))
const hasPollingControl = computed(() => Boolean(currentDevice.value?.config.getPollingRate))

const currentDevice = computed(() => {
	return deviceStore.devicesMap.get(route.params.instanceId as string)
})

async function loadDeviceMeta(device: RazerDevice) {
	try {
		serial.value = await device.config.getSerial(device.instance)
	} catch {
		serial.value = 'Unavailable'
	}

	try {
		firmware.value = await device.config.getFirmware(device.instance)
	} catch {
		firmware.value = 'Unavailable'
	}
}

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

	await loadDeviceMeta(currentDevice.value)
})
</script>

<template>
	<DeviceSettingsLayout
		v-if="currentDevice"
		:device="currentDevice"
		:serial="serial"
		:firmware="firmware"
		:active-tab="activeSettingsTab"
		@update:active-tab="activeSettingsTab = $event"
		:show-dpi-control="hasDpiControl"
		:show-polling-control="hasPollingControl"
		:is-pairing-device="false"
	>
		<template #tab-list>
			<Tab :value="0">
				<span flex="~" items="center" gap="2">
					<span i="material-symbols-performance-max"></span>
					<span>Performance</span>
				</span>
			</Tab>
			<Tab :value="1">
				<span flex="~" items="center" gap="2">
					<span i="material-symbols-light-mode"></span>
					<span>Lighting</span>
				</span>
			</Tab>
			<Tab :value="2">
				<span flex="~" items="center" gap="2">
					<span i="material-symbols-power-settings-rounded"></span>
					<span>Power</span>
				</span>
			</Tab>
			<Tab :value="3">
				<span flex="~" items="center" gap="2">
					<span i="material-symbols-tuning"></span>
					<span>Calibration</span>
				</span>
			</Tab>
			<Tab :value="4">
				<span flex="~" items="center" gap="2">
					<span i="material-symbols-bluetooth-connected"></span>
					<span>Pairing</span>
				</span>
			</Tab>
		</template>

		<template #tab-panels>
			<TabPanel :value="0">
				<div flex="~ col" gap="6">
					<DpiStages v-if="hasDpiControl" :device="currentDevice" />
					<PollingRate v-if="hasPollingControl" :device="currentDevice" />
				</div>
			</TabPanel>

			<TabPanel :value="1">
				<div flex="~ col" items="center" justify="center" h="48" text="gray-500">
					<span i="material-symbols-lightbulb-outline" text="3xl mb-4"></span>
					<p>Lighting control feature coming soon</p>
				</div>
			</TabPanel>

			<TabPanel :value="2">
				<div flex="~ col" items="center" justify="center" h="48" text="gray-500">
					<span i="material-symbols-battery-charging-20" text="3xl mb-4"></span>
					<p>Power management feature coming soon</p>
				</div>
			</TabPanel>

			<TabPanel :value="3">
				<div flex="~ col" items="center" justify="center" h="48" text="gray-500">
					<span i="material-symbols-settings-input-component" text="3xl mb-4"></span>
					<p>Calibration tools coming soon</p>
				</div>
			</TabPanel>

			<TabPanel :value="4">
				<div flex="~ col" gap="6">
					<DonglePairing v-if="currentDevice.config.pairHyperpollingDevice" :device="currentDevice"></DonglePairing>
				</div>
			</TabPanel>
		</template>
	</DeviceSettingsLayout>

	<div v-else flex="~col" items="center" justify="center" h="64" text="gray-600">
		<p>Loading Device Configuration...</p>
	</div>
</template>

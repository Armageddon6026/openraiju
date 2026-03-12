<script setup lang="ts">
import { RAZER_MOUSE_DEVICES } from '@/driver/razer/device'
import { useDeviceStore } from '@/stores'
import DeviceSettingsLayout from './DeviceSettingsLayout.vue'

const toast = useToast()
const route = useRoute()
const router = useRouter()
const deviceStore = useDeviceStore()

const serial = ref('---')
const firmware = ref('---')
const pairedDevicePid = ref<number | null>(null)
const activeSettingsTab = ref<number>(0)

const currentDevice = computed(() => {
	return deviceStore.devicesMap.get(route.params.instanceId as string)
})

const pairedDeviceName = computed(() => {
	if (!pairedDevicePid.value) return 'Not connected'
	const deviceInfo = RAZER_MOUSE_DEVICES.find((d) => d.productId === pairedDevicePid.value)
	return deviceInfo?.ui.name ?? `Unknown (${pairedDevicePid.value})`
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

async function pairDevice(device: RazerDevice) {
	const summary = 'Pairing Device'
	const pid = 0x00b0
	try {
		if (!device.config.pairHyperpollingDevice) {
			throw new Error('not supported')
		}

		await device.config.pairHyperpollingDevice(device.instance, pid)
		toast.add({
			severity: 'success',
			summary: summary,
			detail: `success`,
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

async function unpairDevice(device: RazerDevice) {
	const summary = 'Unpairing Device'
	try {
		if (!device.config.unpairHyperpollingDevice) {
			throw new Error('not supported')
		}

		await device.config.unpairHyperpollingDevice(device.instance, 0x00b0)
		pairedDevicePid.value = null
		toast.add({
			severity: 'success',
			summary: summary,
			detail: `success`,
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

async function connectPairedDevice(device: RazerDevice) {
	const summary = 'Pairing Device'
	try {
		if (!device.config.getPairDevices) {
			throw new Error('not supported')
		}

		const devices = await device.config.getPairDevices(device.instance)
		if (devices.length !== 1 || !devices[0]) {
			throw new Error('no devices found')
		}

		const pid = devices[0]
		pairedDevicePid.value = pid
		const deviceInfo = RAZER_MOUSE_DEVICES.find((d) => d.productId === pid)
		if (!deviceInfo) {
			throw new Error('device not found')
		}

		const newDeviceInfo: RazerDeviceConfig = {
			...deviceInfo,
			hardware: {
				...deviceInfo.hardware,
				hyper_polling: true,
			},
		}
		deviceStore.addDevice({
			config: newDeviceInfo,
			instance: device.instance,
		})

		toast.add({
			severity: 'success',
			summary: summary,
			detail: `pid ${devices[0]!}`,
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
	<DeviceSettingsLayout
		v-if="currentDevice"
		:device="currentDevice"
		:serial="serial"
		:firmware="firmware"
		:active-tab="activeSettingsTab"
		@update:active-tab="activeSettingsTab = $event"
		:is-pairing-device="true"
	>
		<template #tab-list>
			<Tab :value="0">
				<span flex="~" items="center" gap="2">
					<span i="material-symbols-bluetooth-connected"></span>
					<span>Pairing</span>
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
		</template>

		<template #tab-panels>
			<TabPanel :value="0">
				<div rounded="2xl" border="1 emerald-500/35" bg="#121212" overflow="hidden" p="6">
					<div flex="~ col" gap="4">
						<div grid="~ cols-1 md:cols-3" gap="3">
							<Button
								class="w-full"
								label="Pair"
								icon="i-material-symbols-link"
								severity="success"
								@click="pairDevice(currentDevice)"
							/>
							<Button
								class="w-full"
								label="Fetch Paired Device"
								icon="i-material-symbols-cable"
								severity="contrast"
								@click="connectPairedDevice(currentDevice)"
							/>
							<Button
								class="w-full"
								label="Unpair"
								icon="i-material-symbols-link-off"
								severity="danger"
								@click="unpairDevice(currentDevice)"
							/>
						</div>

						<div mt="4" rounded="xl" p="4" bg="[#1a1a1a]" border="1 emerald-500/20">
							<p text="xs gray-400" mb="1">Current Paired Device</p>
							<p text="sm gray-100">{{ pairedDeviceName }}</p>
						</div>
					</div>
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
		</template>
	</DeviceSettingsLayout>

	<div v-else flex="~col" items="center" justify="center" h="64" text="gray-600">
		<p>Loading Device Configuration...</p>
	</div>
</template>

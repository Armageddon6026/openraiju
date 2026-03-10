<script setup lang="ts">
import { test } from '@/driver/razer/command'
import { RAZER_MOUSE_DEVICES } from '@/driver/razer/device'
import { useDeviceStore } from '@/stores'

const toast = useToast()
const route = useRoute()
const router = useRouter()
const deviceStore = useDeviceStore()

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
	}
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
		const deviceInfo = RAZER_MOUSE_DEVICES.find((d) => d.productId === pid)
		if (!deviceInfo) {
			throw new Error('device not found')
		}

		deviceInfo.hardware.hyper_polling = true
		deviceStore.addDevice({
			config: deviceInfo,
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
	<div v-if="currentDevice" p="6">
		<div fle="~" items="center" justify="between" mb="8">
			<h2 text="2xl" font="bold" uppercase="~" tracking="wider">
				{{ currentDevice.config.ui.name }}
			</h2>
		</div>

		<div flex="~ col" gap="6">
			<Button @click="pairDevice(currentDevice)">PAIR</Button>
			<Button @click="connectPairedDevice(currentDevice)">Get Paired Device</Button>
			<Button @click="unpairDevice(currentDevice)">UNPAIR</Button>
		</div>
	</div>
	<div v-else flex="~col" items="center" justify="center" h="64" text="gray-600">
		<p>Loading Device Configuration...</p>
	</div>
</template>

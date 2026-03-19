<script setup lang="ts">
import { useDeviceStore } from '@/stores'

const { device } = defineProps<{
	device: RazerDevice
}>()

const toast = useToast()
const deviceStore = useDeviceStore()
const pairedDevicePid = ref<number | null>(null)

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
		const deviceInfo = await deviceStore.getConfig(pid)
		if (!deviceInfo) {
			throw new Error('device not found')
		}

		const newDeviceInfo = {
			...deviceInfo,
			hardware: {
				...deviceInfo.hardware,
			},
		}
		if ('hyper_polling' in newDeviceInfo.hardware) {
			newDeviceInfo.hardware.hyper_polling = true
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
	<div rounded="2xl" un-border="1 emerald-500/35" bg="#121212" overflow="hidden" p="6">
		<div flex="~ col" gap="4">
			<div grid="~ cols-1 md:cols-3" gap="3">
				<Button
					class="w-full"
					label="Pair"
					icon="i-material-symbols-link"
					severity="success"
					@click="pairDevice(device)"
				></Button>
				<Button
					class="w-full"
					label="Fetch Paired Device"
					icon="i-material-symbols-cable"
					severity="contrast"
					@click="connectPairedDevice(device)"
				></Button>
				<Button
					class="w-full"
					label="Unpair"
					icon="i-material-symbols-link-off"
					severity="danger"
					@click="unpairDevice(device)"
				></Button>
			</div>

			<div mt="4" rounded="xl" p="4" bg="[#1a1a1a]" un-border="1 emerald-500/20">
				<p text="xs gray-400" mb="1">Current Paired Device</p>
				<p text="sm gray-100">{{ pairedDevicePid }}</p>
			</div>
		</div>
	</div>
</template>

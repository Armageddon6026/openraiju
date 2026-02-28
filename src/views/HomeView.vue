<script setup lang="ts">
import { SUPPORTED_DEVICE_LIST } from '@/driver'
import type { HIDDeviceConfig } from '@/driver/types'
import { useToast } from 'primevue/usetoast'

const toast = useToast()
const hid_devices = ref<HIDDeviceConfig[]>([])
const level = ref(0)
const fs = SUPPORTED_DEVICE_LIST.map((d) => d.filter)

async function connectDevice() {
	const summary = 'hid device connect'

	try {
		const devices = await navigator.hid.requestDevice({
			filters: fs,
		})

		if (devices.length < 1) {
			return
		}
		const device = devices[0]
		if (!device) {
			toast.add({
				severity: 'error',
				summary: summary,
				detail: 'device not found',
				life: 3000, // 自動消失時間 (ms)
			})
			return
		}

		toast.add({
			severity: 'success',
			summary: summary,
			detail: `${device.productName} connected`,
			life: 3000,
		})

		await getHidDevices()
	} catch (e) {
		toast.add({
			severity: 'error',
			summary: summary,
			detail: `${e}`,
			life: 3000, // 自動消失時間 (ms)
		})
	}
}

async function getHidDevices() {
	const devices = (await navigator.hid.getDevices()).filter((d) => d.collections.length == 1)
	if (devices.length < 1) {
		return
	}

	devices.forEach(async (device) => {
		const deviceInfo = SUPPORTED_DEVICE_LIST.find(
			(d) => d.filter.vendorId === device.vendorId && d.filter.productId === device.productId,
		)
		if (deviceInfo) {
			hid_devices.value.push(deviceInfo)
			await getBatteryLevel(device, deviceInfo)
		}
	})
}

async function getBatteryLevel(device: HIDDevice, config: HIDDeviceConfig) {
	if (!config.features || !config.features.getBatteryLevel) {
		return
	}

	level.value = await config.features.getBatteryLevel(device)
}

onMounted(async () => {
	await getHidDevices()
})
</script>

<template>
	<div>
		<h1 text="4xl gray-200" font="bold">DASHBOARD</h1>
		<Button @click="connectDevice">ADD</Button>
		<div class="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-6">
			<Card v-for="device in hid_devices" class="bg-[#222] border-none w-[280px]">
				<template #header>
					<div class="flex items-center justify-center">
						<Image :src="device.ui.image" alt="Image" width="150" />
					</div>
				</template>
				<template #title>
					<h2 class="text-lg font-bold text-gray-200">{{ device.ui.name }}</h2>
				</template>
				<template #subtitle>
					<p class="text-sm text-gray-400">{{ device.ui.type }}</p>
					<p class="text-sm text-gray-400">{{ level }}%</p>
				</template>
				<template #footer>
					<div class="flex justify-end">
						<Button label="Settings" severity="secondary" text />
					</div>
				</template>
			</Card>
		</div>
	</div>
</template>

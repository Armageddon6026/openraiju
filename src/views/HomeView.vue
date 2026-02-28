<script setup lang="ts">
import { SUPPORTED_DEVICE_LIST } from '@/driver'
import { useToast } from 'primevue'
import { useConfirm } from 'primevue/useconfirm'

type HIDDeviceData = {
	config: HIDDeviceConfig
	handle: HIDDevice
	BatteryLevel?: number
}

const toast = useToast()
const confirm = useConfirm()
const hid_devices = ref<HIDDeviceData[]>([])

onMounted(async () => {
	await getHidDevices()
})

async function connectDevice() {
	const summary = 'hid device connect'

	try {
		const devices = await navigator.hid.requestDevice({
			filters: SUPPORTED_DEVICE_LIST,
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
			life: 3000,
		})
	}
}

async function disconnectDevice(device: HIDDevice) {
	const summary = 'hid device disconnect'

	confirm.require({
		message: 'Do you want to delete this device?',
		header: 'Delete Device',
		rejectLabel: 'Cancel',
		rejectProps: {
			label: 'Cancel',
			severity: 'secondary',
			outlined: true,
		},
		acceptProps: {
			label: 'Delete',
			severity: 'danger',
		},
		accept: async () => {
			try {
				if (device.opened) {
					await device.close()
				}

				await device.forget()
				toast.add({
					severity: 'success',
					summary: summary,
					detail: `${device.productName} disconnected`,
					life: 3000,
				})

				await getHidDevices()
			} catch (e) {
				toast.add({
					severity: 'error',
					summary: summary,
					detail: `${e}`,
					life: 3000,
				})
			}
		},
	})
}

async function getHidDevices() {
	hid_devices.value = []

	const devices = (await navigator.hid.getDevices()).filter((d) => d.collections.length == 1)
	if (devices.length < 1) {
		return
	}

	devices.forEach(async (device) => {
		const deviceConf = SUPPORTED_DEVICE_LIST.find(
			(d) => d.vendorId === device.vendorId && d.productId === device.productId,
		)

		if (deviceConf) {
			const hid_device: HIDDeviceData = {
				config: deviceConf,
				handle: device,
			}
			// get battery level if supported
			if (deviceConf.getBatteryLevel) {
				hid_device.BatteryLevel = await deviceConf.getBatteryLevel(device)
			}

			hid_devices.value.push(hid_device)
		}
	})
}
</script>

<template>
	<div>
		<h1 text="4xl gray-200" font="bold">DASHBOARD</h1>
		<div grid="~ cols-[repeat(auto-fill,280px)]" mt="8" gap="6" justify="center" md:justify="start">
			<Card
				@click="connectDevice"
				un-border="2 gray-600 dashed"
				w="280px"
				cursor="pointer"
				hover="bg-#2a2a2a"
				duration="300"
			>
				<template #content>
					<div
						flex="~ col"
						items="center"
						justify="center"
						h="250px"
						space="y-4"
						text="gray-500"
						font="bold"
					>
						<span i="material-symbols-add-circle-outline" text="30px "></span>
						<span text="20px"> ADD DEVICE </span>
					</div>
				</template>
			</Card>
			<Card v-for="device in hid_devices" bg="#222" w="280px">
				<template #header>
					<div flex="~" items="center" justify="center">
						<Image :src="device.config.ui.image" alt="Image" width="150" />
					</div>
				</template>
				<template #title>
					<h2 text="lg gray-200" font="bold">{{ device.config.ui.name }}</h2>
				</template>
				<template #subtitle>
					<p text="sm gray-400">{{ device.config.ui.type }}</p>
				</template>
				<template #footer>
					<div flex="~" justify="end">
						<Button
							icon="i-material-symbols-delete-outline"
							severity="danger"
							variant="text"
							@click="disconnectDevice(device.handle)"
						></Button>
					</div>
				</template>
			</Card>
		</div>
	</div>
</template>

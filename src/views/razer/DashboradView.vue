<script setup lang="ts">
import { useToast } from 'primevue'
import DeviceCard from './components/DeviceCard.vue'
import { RAZER_MOUSE_DEVICES } from '@/driver/razer/mouse'

const toast = useToast()
const router = useRouter()

const hid_devices = ref<HIDDeviceData[]>([])
const razer_support_list = [...RAZER_MOUSE_DEVICES /** add more devices here*/]

onMounted(async () => {
	await getHidDevices()
})

async function connectDevice() {
	const summary = 'hid device connect'

	try {
		const devices = await navigator.hid.requestDevice({
			filters: razer_support_list,
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

async function getHidDevices() {
	hid_devices.value = []

	const devices = (await navigator.hid.getDevices()).filter((d) => d.collections.length == 1)
	if (devices.length < 1) {
		return
	}

	devices.forEach(async (device) => {
		const deviceConf = razer_support_list.find(
			(d) =>
				d.vendorId === device.vendorId &&
				d.productId === device.productId &&
				device.collections[0] !== undefined &&
				d.usagePage === device.collections[0].usagePage &&
				d.usage === device.collections[0].usage,
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

async function removeDevice(productId: number) {
	const index = hid_devices.value.findIndex((d) => d.config.productId === productId)
	if (index < 0) {
		return
	}

	hid_devices.value.splice(index, 1)
}
</script>

<template>
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
		<DeviceCard v-for="d in hid_devices" :device="d" @disconnect="removeDevice"></DeviceCard>
	</div>
</template>

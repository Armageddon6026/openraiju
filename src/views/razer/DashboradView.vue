<script setup lang="ts">
import { useToast } from 'primevue'
import DeviceCard from './components/DeviceCard.vue'
import { RAZER_MOUSE_DEVICES } from '@/driver/razer/mouse'
import { useDeviceStore } from '@/stores'

const toast = useToast()
const router = useRouter()
const deviceStore = useDeviceStore()

const { addDevice, removeDevice } = deviceStore
const { devicesMap } = storeToRefs(deviceStore)

const razer_support_list = [...RAZER_MOUSE_DEVICES /** add more devices here*/]

onMounted(async () => {
	if (devicesMap.value.size < 1) {
		await getHidDevices()
	}
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

		for (const device of devices) {
			const deviceConf = razer_support_list.find(
				(conf) =>
					conf.vendorId === device.vendorId &&
					conf.productId === device.productId &&
					device.collections[0] !== undefined &&
					conf.usagePage === device.collections[0].usagePage &&
					conf.usage === device.collections[0].usage,
			)
			if (!deviceConf) continue

			try {
				await addDevice(deviceConf, device)
			} catch {
				continue
			}

			toast.add({
				severity: 'success',
				summary: summary,
				detail: `${device.productName} connected`,
				life: 3000,
			})
			return
		}

		throw new Error('device not supported')
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
	const devices = (await navigator.hid.getDevices()).filter((d) => d.collections.length == 1)
	if (devices.length < 1) {
		return
	}

	devices.forEach(async (device) => {
		const deviceConf = razer_support_list.find(
			(conf) =>
				conf.vendorId === device.vendorId &&
				conf.productId === device.productId &&
				device.collections[0] !== undefined &&
				conf.usagePage === device.collections[0].usagePage &&
				conf.usage === device.collections[0].usage,
		)

		if (deviceConf) {
			await addDevice(deviceConf, device)
		}
	})
}

function goToDeviceSettings(instanceId: string, type: string) {
	if (!instanceId) {
		return
	}

	router.push({
		name: `razer${type}`,
		params: { instanceId: instanceId },
	})
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
					h="262px"
					space="y-4"
					text="gray-500"
					font="bold"
				>
					<span i="material-symbols-add-circle-outline" text="30px "></span>
					<span text="20px"> ADD DEVICE </span>
				</div>
			</template>
		</Card>
		<DeviceCard
			v-for="[id, device] in devicesMap"
			:device="device"
			@click="goToDeviceSettings(id, device.config.ui.type)"
			@disconnect="removeDevice(id)"
		></DeviceCard>
	</div>
</template>

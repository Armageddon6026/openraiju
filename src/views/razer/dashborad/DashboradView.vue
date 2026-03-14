<script setup lang="ts">
import { RAZER_MOUSE_DEVICES, RAZER_ACCESSORY_DEVICES } from '@/driver/razer/device'
import { useDeviceStore } from '@/stores'
import { ping } from '@/driver/utils'
import { RAZER_KEYBOARD_DEVICES } from '@/driver/razer/device/keyboard'

const toast = useToast()
const router = useRouter()
const deviceStore = useDeviceStore()

const { addDevice, removeDevice } = deviceStore
const { devicesMap } = storeToRefs(deviceStore)

const razer_support_list = [
	...RAZER_MOUSE_DEVICES,
	...RAZER_KEYBOARD_DEVICES,
	...RAZER_ACCESSORY_DEVICES,
	/** add more devices here*/
]
const razer_config_map = new Map(razer_support_list.map((d) => [`${d.vendorId}:${d.productId}`, d]))

onMounted(async () => {
	if (devicesMap.value.size < 1) {
		await getHidDevices()
	}
})

async function connectDevice() {
	const summary = 'hid device connect'

	try {
		const instances = await navigator.hid.requestDevice({
			filters: razer_support_list,
		})

		for (const instance of instances) {
			const deviceConf = razer_config_map.get(`${instance.vendorId}:${instance.productId}`)
			if (!deviceConf || !(await ping(instance, deviceConf.hardware.wait_min))) continue

			await addDevice({
				config: deviceConf,
				instance: instance,
			})
			toast.add({
				severity: 'success',
				summary: summary,
				detail: `${instance.productName} connected`,
				life: 3000,
			})
			return
		}
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
	const instances = (await navigator.hid.getDevices()).filter((d) => d.collections.length == 1)

	instances.forEach(async (instance) => {
		const deviceConf = razer_config_map.get(`${instance.vendorId}:${instance.productId}`)
		if (!deviceConf || !(await ping(instance, deviceConf.hardware.wait_min))) return

		await addDevice({
			config: deviceConf,
			instance: instance,
		})
	})
}

function goToDeviceSettings(instanceId: string, type: string) {
	if (!instanceId) {
		return
	}

	router.push({
		name: `razerdevice`,
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
				<div flex="~ col" items="center" justify="center" h="262px" space="y-4" text="gray-500" font="bold">
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

<script setup lang="ts">
import { useDeviceStore } from '@/stores'
import { ping } from '@/driver/utils'
import { RAZER_VENDOR_ID } from '@/driver/razer/define'

const toast = useToast()
const router = useRouter()
const deviceStore = useDeviceStore()
const razer_support_list = ref<HIDDeviceFilter[]>([])

onMounted(async () => {
	const res = await fetch('razer_support_devices.json')
	const data = await res.json()
	razer_support_list.value = data.map((d: { productId: number }) => ({
		vendorId: RAZER_VENDOR_ID,
		productId: d.productId,
		usagePage: 0x0001,
		usage: 0x0002,
	}))

	if (!deviceStore.hasDevices) await getHidDevices()
})

async function connectDevice() {
	const summary = 'hid device connect'

	try {
		const instances = await navigator.hid.requestDevice({
			filters: razer_support_list.value,
		})

		for (const instance of instances) {
			const deviceConf = await deviceStore.getConfig(instance.productId)
			if (!deviceConf || !(await ping(instance, deviceConf.hardware.wait_min))) continue

			await deviceStore.addDevice({
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
		const deviceConf = await deviceStore.getConfig(instance.productId)
		if (!deviceConf || !(await ping(instance, deviceConf.hardware.wait_min))) return

		await deviceStore.addDevice({
			config: deviceConf,
			instance: instance,
		})
	})
}

function goToDeviceSettings(instanceId: string) {
	router.push({
		name: `razerdevice`,
		params: { instanceId: instanceId },
	})
}
</script>

<template>
	<h1 text="4xl gray-200" font="bold" mb="4">Razer Device Center</h1>
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
			v-for="[id, device] in deviceStore.deviceIterator"
			:device="device"
			@click="goToDeviceSettings(id)"
			@disconnect="deviceStore.removeDevice(id)"
		></DeviceCard>
	</div>
</template>

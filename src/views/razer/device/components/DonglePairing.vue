<script setup lang="ts">
import { useDeviceStore } from '@/stores'
import { valibotResolver } from '@primevue/forms/resolvers/valibot'
import * as v from 'valibot'

type hyperpolling_device = {
	productId: number
	name: string
}

const { device } = defineProps<{
	device: TypedDeviceWith<'accessory', 'pairHyperpollingDevice' | 'unpairHyperpollingDevice' | 'getPairDevices'>
}>()

type PairFormValues = {
	product_id?: number
}

const toast = useToast()
const deviceStore = useDeviceStore()
const pairedDevicePid = ref<number | null>(null)
const hyperpolling_device_list = ref<hyperpolling_device[]>([])
const resolver = valibotResolver(
	v.object({
		product_id: v.pipe(v.number('Please select a device first')),
	}),
)

onMounted(async () => {
	const res = await fetch('/razer/hyperpolling_device.json')
	const data = await res.json()
	hyperpolling_device_list.value = data
})

async function pairDevice({ valid, values }: { valid: boolean; values: PairFormValues }) {
	if (!valid || !values.product_id) {
		return
	}

	const summary = 'Pairing Device'
	try {
		await device.config.pairHyperpollingDevice(device.instance, values.product_id)

		toast.add({
			severity: 'success',
			summary,
			detail: 'success',
			life: 3000,
		})
	} catch (e) {
		toast.add({
			severity: 'error',
			summary,
			detail: String(e),
			life: 3000,
		})
	}
}

async function unpairDevice() {
	const summary = 'Unpairing Device'
	try {
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

async function connectPairedDevice() {
	const summary = 'Pairing Device'
	try {
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
				<Form
					v-slot="$form"
					:initial-values="{ product_id: null }"
					:resolver="resolver"
					w="full md:col-span-1"
					flex="~ col"
					gap="2"
					@submit="pairDevice"
				>
					<Select
						name="product_id"
						:options="hyperpolling_device_list"
						optionLabel="name"
						optionValue="productId"
						placeholder="Select HyperPolling Device"
						w="full"
					></Select>
					<Message v-if="$form.product_id?.invalid" severity="error" size="small" variant="simple">{{
						$form.product_id.error?.message
					}}</Message>
					<Button w="full" label="Pair" icon="i-material-symbols-link" severity="success" type="submit"></Button>
				</Form>
				<Button
					w="full"
					label="Unpair"
					icon="i-material-symbols-link-off"
					severity="danger"
					@click="unpairDevice()"
				></Button>
			</div>

			<div mt="4" rounded="xl" p="4" bg="[#1a1a1a]" un-border="1 emerald-500/20">
				<p text="xs gray-400" mb="1">Current Paired Device</p>
				<p text="sm gray-100">{{ pairedDevicePid }}</p>
			</div>
		</div>
	</div>
</template>

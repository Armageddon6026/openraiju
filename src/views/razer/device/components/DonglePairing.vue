<script setup lang="ts">
import { useDeviceStore } from '@/stores'
import { valibotResolver } from '@primevue/forms/resolvers/valibot'
import * as v from 'valibot'

type hyperpolling_device = {
	productId: number
	name: string
}

const { device } = defineProps<{
	device: DeviceWith<'pairDevice' | 'unpairDevice' | 'getPairedDevices'>
}>()

type PairFormValues = {
	product_id?: number
}

const toast = useToast()
const deviceStore = useDeviceStore()
const pairedDevicePid = ref<number | null>(null)
const hyperpolling_device_list = ref<hyperpolling_device[]>([])
const isConnecting = ref(false)
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
		const pairConfig = await deviceStore.getConfig(values.product_id)
		if (!pairConfig) {
			throw new Error('device config not found')
		}
		const cancelPairing = await device.config.pairDevice(
			device.instance,
			pairConfig.hardware.transaction_id,
			values.product_id,
		)

		toast.add({
			severity: 'success',
			summary,
			detail: 'success',
			life: 3000,
		})

		// 等待3秒後自動連接，同時顯示進度條
		isConnecting.value = true
		setTimeout(async () => {
			await connectWithRetry()

			await cancelPairing()
		}, 3000)
	} catch (e) {
		isConnecting.value = false
		toast.add({
			severity: 'error',
			summary,
			detail: String(e),
			life: 3000,
		})
	}
}

async function unpairDevice() {
	if (!pairedDevicePid.value) {
		toast.add({
			severity: 'warn',
			summary: 'Unpairing Device',
			detail: 'No paired device',
			life: 3000,
		})
		return
	}

	const summary = 'Unpairing Device'
	try {
		await device.config.unpairDevice(device.instance, pairedDevicePid.value)
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
		const pids = await device.config.getPairedDevices(device.instance)
		for (const pid of pids) {
			if (pid === device.instance.productId) continue

			const pairConf = await deviceStore.getConfig(pid)
			if (!pairConf) {
				throw new Error('device not found')
			}

			deviceStore.addDevice({
				config: pairConf,
				instance: device.instance,
			})

			pairedDevicePid.value = pid
		}

		toast.add({
			severity: 'success',
			summary: summary,
			detail: `pid ${pairedDevicePid.value}`,
			life: 3000,
		})
	} catch (e) {
		pairedDevicePid.value = null
		toast.add({
			severity: 'error',
			summary: summary,
			detail: `${e}`,
			life: 3000,
		})
		throw e
	}
}

async function connectWithRetry() {
	const maxRetryTime = 10000
	const retryInterval = 1000
	const startTime = Date.now()

	while (Date.now() - startTime < maxRetryTime) {
		try {
			await connectPairedDevice()
			isConnecting.value = false
			return
		} catch (e) {
			const elapsed = Date.now() - startTime
			if (elapsed >= maxRetryTime) {
				isConnecting.value = false
				console.error('Failed to connect paired device after 10 seconds')
				break
			}
			// 等待後重試
			await new Promise((resolve) => setTimeout(resolve, retryInterval))
		}
	}
}
</script>

<template>
	<div rounded="2xl" un-border="1 emerald-500/35" bg="#121212" overflow="hidden" p="6">
		<div flex="~ col" gap="4">
			<ProgressBar v-if="isConnecting" mode="indeterminate" style="height: 6px"></ProgressBar>

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
						:disabled="isConnecting"
					></Select>
					<Message v-if="$form.product_id?.invalid" severity="error" size="small" variant="simple">{{
						$form.product_id.error?.message
					}}</Message>
					<Button
						w="full"
						label="Pair"
						icon="i-material-symbols-link"
						severity="success"
						type="submit"
						:disabled="isConnecting"
					></Button>
				</Form>
				<Button
					w="full"
					label="Connect Paired Device"
					icon="i-material-symbols-link-off"
					severity="help"
					:disabled="isConnecting"
					@click="connectPairedDevice()"
				></Button>
				<Button
					w="full"
					label="Unpair"
					icon="i-material-symbols-link-off"
					severity="danger"
					:disabled="isConnecting"
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

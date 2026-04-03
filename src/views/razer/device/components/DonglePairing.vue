<script setup lang="ts">
import { useDeviceStore } from '@/stores'
import { valibotResolver } from '@primevue/forms/resolvers/valibot'
import * as v from 'valibot'

const { device } = defineProps<{
	device: DeviceWith<'pairDevice' | 'unpairDevice' | 'getPairedDevices' | 'getPairedList'>
}>()

type PairFormValues = {
	product_id?: number
}

const toast = useToast()
const deviceStore = useDeviceStore()
const pairedDevicePid = ref<number | null>(null)
const paired_device_list = ref<RazerPairedDeviceInfo[]>([])
const isConnecting = ref(false)
const resolver = valibotResolver(
	v.object({
		product_id: v.pipe(v.number('Please select a device first')),
	}),
)

onMounted(async () => {
	try {
		const pids = await device.config.getPairedDevices(device.instance)
		if (pids.length > 1) {
			pairedDevicePid.value = pids.find((pid) => pid !== device.instance.productId) || null
			return
		}

		const pairedList = await device.config.getPairedList(device.instance)
		paired_device_list.value = pairedList.filter((d) => !pids.includes(d.productId))
	} catch (e) {
		toast.add({
			severity: 'error',
			summary: 'Load Paired Devices',
			detail: `${e}`,
			life: 3000,
		})
	}
})

async function pairDevice({ valid, values }: { valid: boolean; values: PairFormValues }) {
	if (!valid || !values.product_id) {
		return
	}

	const summary = 'Pairing Device'
	try {
		const knownPairedPids = (await device.config.getPairedDevices(device.instance)).filter(
			(pid) => pid !== device.instance.productId,
		)

		const pairConfig = await deviceStore.getConfig(values.product_id)
		if (!pairConfig) {
			throw new Error('device config not found')
		}
		const cancelPairing = await device.config.pairDevice(
			device.instance,
			pairConfig.hardware.transaction_id,
			values.product_id,
		)
		isConnecting.value = true

		const pairedPid = await waitPairedDevicePid(knownPairedPids)
		if (!pairedPid) {
			await cancelPairing()
			throw new Error('pairing timeout after 10 seconds, canceled pairing')
		}

		//await connectPairedDevice(pairedPid)
		pairedDevicePid.value = pairedPid
		paired_device_list.value = paired_device_list.value.filter((d) => d.productId !== pairedPid)

		toast.add({
			severity: 'success',
			summary,
			detail: `pid ${pairedPid}`,
			life: 3000,
		})
	} catch (e) {
		toast.add({
			severity: 'error',
			summary,
			detail: String(e),
			life: 3000,
		})
	} finally {
		isConnecting.value = false
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

async function waitPairedDevicePid(knownPairedPids: number[]) {
	const maxRetryTime = 10000
	const retryInterval = 1000
	const startTime = Date.now()

	while (Date.now() - startTime < maxRetryTime) {
		try {
			const pids = (await device.config.getPairedDevices(device.instance)).filter(
				(pid) => pid !== device.instance.productId,
			)
			const newPairedPid = pids.find((pid) => !knownPairedPids.includes(pid))
			if (newPairedPid) {
				return newPairedPid
			}
		} catch {
			// 配對過程中可能暫時讀不到，忽略並重試
		}

		await new Promise((resolve) => setTimeout(resolve, retryInterval))
	}

	return null
}

async function connectPairedDevice(pid: number) {
	const pairConf = await deviceStore.getConfig(pid)
	if (!pairConf) {
		throw new Error('device not found')
	}

	const isHyperPolling =
		device.config.productId === 0x00b3 && (pairConf.ui.type === 'mouse' || pairConf.ui.type === 'keyboard')
	// due to sub devices being paired to the same host device, overwrite the pairing related functions to prevent confusion
	pairConf.getPairedDevices = undefined
	pairConf.pairDevice = undefined

	await deviceStore.addDevice({
		config: pairConf,
		instance: device.instance,
		status: {
			isSubDevice: true,
			isHyperpolling: isHyperPolling,
		},
	})
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
						:options="paired_device_list"
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
			</div>

			<div mt="4" rounded="xl" p="4" bg="[#1a1a1a]" un-border="1 emerald-500/20">
				<p text="xs gray-400" mb="1">Current Paired Device</p>
				<p text="sm gray-100">{{ pairedDevicePid }}</p>
			</div>
		</div>
	</div>
</template>

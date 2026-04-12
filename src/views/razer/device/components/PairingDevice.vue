<script setup lang="ts">
import { useDeviceStore } from '@/stores'
import { valibotResolver } from '@primevue/forms/resolvers/valibot'
import * as v from 'valibot'

const { device } = defineProps<{
	device: DeviceWith<'pairDevice' | 'unpairDevice' | 'getPairedDevices' | 'getPairedSupportList'>
}>()

type PairFormValues = {
	product_id?: number
}

const toast = useToast()
const route = useRoute()
const deviceStore = useDeviceStore()

const pairedDeviceInstanceIds = ref<string[] | undefined>()
const paired_device_list = ref<RazerPairedDeviceInfo[]>()
const isConnecting = ref(false)
const resolver = valibotResolver(
	v.object({
		product_id: v.pipe(v.number('Please select a device first')),
	}),
)

onMounted(async () => {
	try {
		const children = deviceStore.getPairedDeviceInstanceIds(route.params.instanceId as string)
		if (children && children.size > 0) {
			pairedDeviceInstanceIds.value = Array.from(children)
		} else {
			paired_device_list.value = await device.config.getPairedSupportList(device.instance)
		}
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
		const pairConfig = await deviceStore.loadDeviceConfig(values.product_id)
		if (!pairConfig) {
			throw new Error('device config not found')
		}
		isConnecting.value = true

		const cancelPairingCallback = await device.config.pairDevice(
			device.instance,
			pairConfig.hardware.transaction_id,
			values.product_id,
		)

		const newInstanceIds = await waitPairedDevicePid()
		if (!newInstanceIds || newInstanceIds.length === 0) {
			cancelPairingCallback()
			throw new Error('pairing timeout after 10 seconds, canceled pairing')
		}

		console.log('newInstanceIds', newInstanceIds)

		pairedDeviceInstanceIds.value = newInstanceIds
		paired_device_list.value = undefined

		toast.add({
			severity: 'success',
			summary,
			detail: `${pairedDeviceInstanceIds.value.join(', ')} paired successfully`,
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

async function waitPairedDevicePid() {
	const maxRetryTime = 10000
	const retryInterval = 1000
	const startTime = Date.now()

	while (Date.now() - startTime < maxRetryTime) {
		try {
			const newInstanceIds = await deviceStore.registerSubDevices(route.params.instanceId as string)
			if (newInstanceIds && newInstanceIds.length > 0) {
				return newInstanceIds
			}
		} catch {
			// 配對過程中可能暫時讀不到，忽略並重試
		}

		await new Promise((resolve) => setTimeout(resolve, retryInterval))
	}

	return null
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
				<p text="sm gray-100">{{ pairedDeviceInstanceIds?.join(', ') }}</p>
			</div>
		</div>
	</div>
</template>

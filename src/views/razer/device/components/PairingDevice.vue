<script setup lang="ts">
import { useDeviceStore } from '@/stores'
import type { FormSubmitEvent } from '@primevue/forms'
import { valibotResolver } from '@primevue/forms/resolvers/valibot'
import * as v from 'valibot'

const { device } = defineProps<{
	device: DeviceWith<'pairDevice' | 'unpairDevice' | 'getPairedDevices' | 'getPairedSupportList'>
}>()

const pairFormSchema = v.object({
	product_id: v.optional(v.number('Please select a device first')),
})
type PairFormValues = v.InferOutput<typeof pairFormSchema>

const toast = useToast()
const route = useRoute()
const deviceStore = useDeviceStore()

const subDeviceInstanceIds = ref<string[] | undefined>()
const supportedDeviceList = ref<RazerPairedDeviceInfo[]>()
const isConnecting = ref(false)

onMounted(async () => {
	try {
		const children = deviceStore.getPairedDeviceInstanceIds(route.params.instanceId as string)

		if (children && children.size > 0) {
			subDeviceInstanceIds.value = Array.from(children)
			supportedDeviceList.value = undefined
		} else {
			subDeviceInstanceIds.value = undefined
			supportedDeviceList.value = await device.config.getPairedSupportList(device.instance)
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

async function pairDevice(event: FormSubmitEvent<PairFormValues>) {
	const { values, valid } = event
	if (!valid || !values.product_id) {
		return
	}

	const summary = 'Pairing Device'
	try {
		const targetDeviceConfig = await deviceStore.loadDeviceConfig(values.product_id)
		if (!targetDeviceConfig) {
			throw new Error('device config not found')
		}
		isConnecting.value = true

		const cancelPairingCallback = await device.config.pairDevice(
			device.instance,
			targetDeviceConfig.hardware.transaction_id,
			values.product_id,
		)

		const pairedInstanceIds = await waitPairedDevicePid()
		if (!pairedInstanceIds || pairedInstanceIds.length === 0) {
			cancelPairingCallback()
			throw new Error('pairing timeout after 10 seconds, canceled pairing')
		}

		subDeviceInstanceIds.value = pairedInstanceIds
		supportedDeviceList.value = undefined

		toast.add({
			severity: 'success',
			summary,
			detail: `${subDeviceInstanceIds.value.join(', ')} paired successfully`,
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
			const pairedInstanceIds = await deviceStore.registerSubDevices(route.params.instanceId as string)
			if (pairedInstanceIds && pairedInstanceIds.length > 0) {
				return pairedInstanceIds
			}
		} catch {
			// ignore error and retry until timeout
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
					:resolver="valibotResolver(pairFormSchema)"
					w="full md:col-span-1"
					flex="~ col"
					gap="2"
					@submit="pairDevice"
				>
					<Select
						name="product_id"
						:options="supportedDeviceList"
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
				<p text="sm gray-100">{{ subDeviceInstanceIds?.join(', ') }}</p>
			</div>
		</div>
	</div>
</template>

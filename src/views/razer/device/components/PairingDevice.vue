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
const confirm = useConfirm()
const router = useRouter()
const route = useRoute()
const deviceStore = useDeviceStore()

const supportedDeviceList = ref<RazerPairedDeviceInfo[]>()
const pairedDevices = ref<Array<{ instanceId: string; config: RazerBaseDeviceConfig }>>([])
const isConnecting = ref(false)

onMounted(async () => {
	try {
		const children = deviceStore.getPairedDeviceInstanceIds(route.params.instanceId as string)

		if (children && children.size > 0) {
			const pairedInstanceIds = Array.from(children)
			supportedDeviceList.value = undefined
			pairedDevices.value = await loadPairedDevices(pairedInstanceIds)
		} else {
			supportedDeviceList.value = await device.config.getPairedSupportList(device.instance)
			pairedDevices.value = []
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

async function loadPairedDevices(instanceIds: string[]) {
	const entries = await Promise.all(
		instanceIds.map(async (instanceId) => {
			const pid = Number(instanceId.split('-')[1])
			if (!Number.isFinite(pid)) {
				return null
			}

			const config = await deviceStore.loadDeviceConfig(pid)
			if (!config) {
				return null
			}

			return {
				instanceId,
				config,
			}
		}),
	)

	return entries.filter((item): item is { instanceId: string; config: RazerBaseDeviceConfig } => !!item)
}

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

		pairedDevices.value = await loadPairedDevices(pairedInstanceIds)
		supportedDeviceList.value = undefined

		toast.add({
			severity: 'success',
			summary,
			detail: `${pairedInstanceIds.join(', ')} paired successfully`,
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

async function unpairDevice(instanceId: string, productId: number, deviceName: string) {
	const summary = 'Unpairing Device'

	confirm.require({
		message: 'Do you want to unpair this sub device?',
		header: 'Unpair Sub Device',
		rejectLabel: 'Cancel',
		rejectProps: {
			label: 'Cancel',
			severity: 'secondary',
			outlined: true,
		},
		acceptProps: {
			label: 'Unpair',
			severity: 'danger',
		},
		accept: async () => {
			if (!device.config.unpairDevice) {
				return
			}

			try {
				await device.config.unpairDevice(device.instance, productId)
				await deviceStore.unregisterDevice(instanceId)
				pairedDevices.value = pairedDevices.value.filter((item) => item.instanceId !== instanceId)

				if (pairedDevices.value.length === 0) {
					supportedDeviceList.value = await device.config.getPairedSupportList(device.instance)
				}

				toast.add({
					severity: 'success',
					summary: summary,
					detail: `${deviceName} disconnected`,
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
		},
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
	<Card rounded="2xl" un-border="1 emerald-500/35" bg="#121212" overflow="hidden">
		<template #title>
			<div flex="~" items="center" justify="between">
				<div>
					<label block="~" text="xs gray-400" m="b1" font="semibold" uppercase="~">Pairing</label>
					<h3 text="xl emerald-50" font="bold">Subdevice Management</h3>
				</div>
				<div rounded="lg" p="x3 y2" bg="emerald-500/10" un-border="1 emerald-500/30" text="right">
					<p text="xs emerald-200/85">Status</p>
					<p text="sm emerald-100" font="bold">
						{{ isConnecting ? 'Pairing...' : `${pairedDevices.length} Connected` }}
					</p>
				</div>
			</div>
		</template>
		<template #content>
			<div flex="~ col" gap="4">
				<ProgressBar v-if="isConnecting" mode="indeterminate" style="height: 6px"></ProgressBar>

				<div
					v-if="pairedDevices.length === 0 && !!supportedDeviceList?.length"
					rounded="xl"
					p="4"
					bg="[#171717]"
					un-border="1 emerald-500/20"
				>
					<div flex="~" items="center" justify="between" gap="3" m="b3">
						<div>
							<p text="xs gray-400" uppercase="~" tracking="[0.18em]">Available Device</p>
							<p text="sm emerald-100" font="semibold">Select a subdevice to pair</p>
						</div>
						<div
							rounded="lg"
							p="x3 y1.5"
							bg="emerald-500/10"
							un-border="1 emerald-500/30"
							text="sm emerald-200"
							font="bold"
						>
							Ready
						</div>
					</div>

					<div grid="~ cols-1 md:cols-5" gap="3" items="end">
						<Form
							v-slot="$form"
							:resolver="valibotResolver(pairFormSchema)"
							w="full md:col-span-5"
							flex="~ col"
							gap="2"
							@submit="pairDevice"
						>
							<div grid="~ cols-1 md:cols-[1fr_auto]" gap="2" items="start md:end">
								<Select
									name="product_id"
									:options="supportedDeviceList"
									optionLabel="name"
									optionValue="productId"
									placeholder="Select Supported Device"
									w="full"
									:disabled="isConnecting"
								></Select>
								<Button
									w="full md:150px"
									label="Start Pairing"
									icon="i-material-symbols-link"
									severity="info"
									type="submit"
									:loading="isConnecting"
									:disabled="isConnecting"
								></Button>
							</div>
							<Message v-if="$form.product_id?.invalid" severity="error" size="small" variant="simple">{{
								$form.product_id.error?.message
							}}</Message>
						</Form>
					</div>
				</div>

				<div v-if="pairedDevices.length > 0" mt="2" grid="~ cols-1 md:cols-2" gap="3">
					<div
						v-for="item in pairedDevices"
						:key="item.instanceId"
						role="button"
						tabindex="0"
						relative="~"
						rounded="xl"
						p="4"
						bg="[#171717]"
						un-border="1 emerald-500/20"
						flex="~ col md:row"
						gap="4"
						items="start md:center"
						cursor="pointer"
						transition="all duration-200"
						hover="bg-[#1e1e1e] un-border-emerald-400/40"
						focus-visible="outline-none un-border-emerald-300/70"
						@click="goToDeviceSettings(item.instanceId)"
					>
						<Image :src="item.config.ui.image" :alt="item.config.ui.name" width="100" />
						<div flex="1">
							<p text="xs emerald-300/85" uppercase="~" tracking="[0.18em]">Razer Device</p>
							<p text="lg gray-100" font="semibold">{{ item.config.ui.name }}</p>
							<p text="xs gray-400">Type: {{ item.config.ui.type }}</p>
						</div>
						<div absolute="~" top="2" right="2" z="1">
							<Button
								severity="danger"
								variant="text"
								icon="i-material-symbols-link-off-rounded"
								@click.stop="unpairDevice(item.instanceId, item.config.productId, item.config.ui.name)"
							></Button>
						</div>
					</div>
				</div>

				<div v-else mt="2" rounded="xl" p="4" bg="[#171717]" un-border="1 emerald-500/20">
					<div flex="~" items="center" gap="3">
						<span i="material-symbols-devices" text="2xl emerald-300/70"></span>
						<div>
							<p text="sm gray-300">No paired device connected</p>
							<p text="xs gray-500">Choose an available subdevice above to start pairing.</p>
						</div>
					</div>
				</div>
			</div>
		</template>
	</Card>
</template>

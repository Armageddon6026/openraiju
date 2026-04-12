<script setup lang="ts">
const { device } = defineProps<{ device: RazerDevice<RazerBaseDeviceConfig> }>()
const emits = defineEmits<{
	disconnect: []
}>()

const toast = useToast()
const confirm = useConfirm()

const batteryLevel = ref<number | undefined>()
const chargeState = ref<boolean | undefined>()

onMounted(async () => {
	if (device.config.getBatteryLevel) {
		batteryLevel.value = await device.config.getBatteryLevel(device.instance)
	}

	if (device.config.getChargeState) {
		chargeState.value = await device.config.getChargeState(device.instance)
	}
})

async function disconnectDevice() {
	const summary = 'hid device disconnect'

	confirm.require({
		message: 'Do you want to delete this device?',
		header: 'Delete Device',
		rejectLabel: 'Cancel',
		rejectProps: {
			label: 'Cancel',
			severity: 'secondary',
			outlined: true,
		},
		acceptProps: {
			label: 'Delete',
			severity: 'danger',
		},
		accept: async () => {
			try {
				emits('disconnect')
				toast.add({
					severity: 'success',
					summary: summary,
					detail: `${device.instance.productName} disconnected`,
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

async function unpairDevice() {
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
				await device.config.unpairDevice(device.instance, device.config.productId)
				emits('disconnect')
				toast.add({
					severity: 'success',
					summary: summary,
					detail: `${device.config.ui.name} disconnected`,
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

function getBatteryIcon(): string {
	if (!batteryLevel.value) return 'i-material-symbols-battery-android-question-outline'

	if (chargeState.value) {
		return 'i-material-symbols-battery-android-frame-bolt'
	}

	if (batteryLevel.value <= 10) return 'i-material-symbols-battery-android-alert-outline'
	if (batteryLevel.value <= 16) return 'i-material-symbols-battery-android-frame-1'
	if (batteryLevel.value <= 32) return 'i-material-symbols-battery-android-frame-2'
	if (batteryLevel.value <= 48) return 'i-material-symbols-battery-android-frame-3'
	if (batteryLevel.value <= 64) return 'i-material-symbols-battery-android-frame-4'
	if (batteryLevel.value <= 80) return 'i-material-symbols-battery-android-frame-5'
	if (batteryLevel.value <= 95) return 'i-material-symbols-battery-android-frame-6'
	return 'i-material-symbols-battery-android-frame-full'
}

function getTypeIcon(): string {
	switch (device.config.ui.type) {
		case 'mouse':
			return 'i-material-symbols-mouse-outline'
		case 'keyboard':
			return 'i-material-symbols-keyboard-outline'
		case 'accessory':
			return 'i-material-symbols-usb-rounded'
		default:
			return 'i-material-symbols-question-mark'
	}
}

function getBatteryColor(): string {
	const level = batteryLevel.value

	return (!level || level <= 20) && !chargeState.value ? 'text-red-500' : 'text-green-500'
}
</script>

<template>
	<Card w="280px" relative="~" cursor="pointer" un-border="1 green-500" hover="bg-#2a2a2a">
		<template #header>
			<div v-if="batteryLevel" absolute="~" top="3" right="3" fleX="~" items="center" gap="1">
				<span text="xs gray-400" font="mono">{{ batteryLevel }}%</span>
				<div :class="[getBatteryIcon(), getBatteryColor()]"></div>
			</div>
			<div flex="~" items="center" justify="center">
				<Image :src="device.config.ui.image" alt="Image" width="150" />
			</div>
		</template>
		<template #title>
			<h2 text="lg gray-200" font="bold" truncate :title="device.config.ui.name">{{ device.config.ui.name }}</h2>
		</template>
		<template #subtitle>
			<div flex="~" items="center" gap="1" text="gray-400">
				<div :class="[getTypeIcon()]" v-tooltip="device.config.ui.type"></div>
				<div
					v-if="(device.config?.hardware?.max_polling_rate ?? 0) > 1000"
					i="material-symbols-h-plus-mobiledata-badge-outline-rounded"
					v-tooltip="'support hyper polling'"
				></div>
				<div v-if="device.status.isSubDevice" i="material-symbols-link-rounded" v-tooltip="'sub device'"></div>
			</div>
		</template>
		<template #footer>
			<div flex="~" justify="end">
				<Button
					v-if="!device.status.isSubDevice"
					icon="i-material-symbols-delete-outline"
					severity="danger"
					variant="text"
					@click.stop="disconnectDevice"
				></Button>
				<Button
					v-else
					severity="danger"
					variant="text"
					icon="i-material-symbols-link-off-rounded"
					@click.stop="unpairDevice"
				></Button>
			</div>
		</template>
	</Card>
</template>

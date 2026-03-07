<script setup lang="ts">
const toast = useToast()
const confirm = useConfirm()

async function disconnectDevice(device: RazerDevice) {
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
				if (device.handler.opened) {
					await device.handler.close()
				}

				await device.handler.forget()
				toast.add({
					severity: 'success',
					summary: summary,
					detail: `${device.handler.productName} disconnected`,
					life: 3000,
				})

				if (!device.config.productId) {
					return
				}

				emits('disconnect', device.config.productId)
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

function getBatteryIcon(level: number | undefined): string {
	if (!level) return 'i-material-symbols-battery-android-question-outline'
	if (level <= 10) return 'i-material-symbols-battery-android-alert-outline'
	if (level <= 16) return 'i-material-symbols-battery-android-frame-1'
	if (level <= 32) return 'i-material-symbols-battery-android-frame-2'
	if (level <= 48) return 'i-material-symbols-battery-android-frame-3'
	if (level <= 64) return 'i-material-symbols-battery-android-frame-4'
	if (level <= 80) return 'i-material-symbols-battery-android-frame-5'
	if (level <= 95) return 'i-material-symbols-battery-android-frame-6'
	return 'i-material-symbols-battery-android-frame-full'
}

function getBatteryColor(level: number | undefined): string {
	return !level || level <= 20 ? 'text-red-500' : 'text-green-500'
}

const { device } = defineProps<{ device: RazerDevice }>()
const emits = defineEmits<{
	disconnect: [productId: number]
}>()
</script>

<template>
	<Card bg="#222" w="280px" relative="~" cursor="pointer" un-border="1 green-500" hover="bg-#2a2a2a">
		<template #header>
			<div v-if="device.BatteryLevel" absolute="~" top="3" right="3" fleX="~" items="center" gap="1">
				<span text="xs gray-400" font="mono">{{ device.BatteryLevel }}%</span>
				<div :class="[getBatteryIcon(device.BatteryLevel), getBatteryColor(device.BatteryLevel)]"></div>
			</div>
			<div flex="~" items="center" justify="center">
				<Image :src="device.config.ui.image" alt="Image" width="150" />
			</div>
		</template>
		<template #title>
			<h2 text="lg gray-200" font="bold">{{ device.config.ui.name }}</h2>
		</template>
		<template #subtitle>
			<p text="sm gray-400">{{ device.config.ui.type }}</p>
		</template>
		<template #footer>
			<div flex="~" justify="end">
				<Button
					icon="i-material-symbols-delete-outline"
					severity="danger"
					variant="text"
					@click.stop="disconnectDevice(device)"
				></Button>
			</div>
		</template>
	</Card>
</template>

<script setup lang="ts">
import { RAZER_LED_INDICATOR_MODE_MAP } from '@/driver/razer/command'

const { device } = defineProps<{
	device: DeviceWith<'getLedIndicatorMode' | 'setLedIndicatorMode'>
}>()

type razer_led_indicator_mode = keyof typeof RAZER_LED_INDICATOR_MODE_MAP

const toast = useToast()

const ledIndicatorMode = ref<razer_led_indicator_mode>()

const modeOptions = computed(() => {
	return Object.entries(RAZER_LED_INDICATOR_MODE_MAP).map(([mode, value]) => ({
		mode: Number(mode) as razer_led_indicator_mode,
		label: value.key,
	}))
})

onMounted(async () => {
	const mode = await device.config.getLedIndicatorMode(device.instance)
	if (!(mode in RAZER_LED_INDICATOR_MODE_MAP)) {
		toast.add({
			severity: 'error',
			summary: 'Error',
			detail: `Invalid LED indicator mode received from device: ${mode}`,
			life: 3000,
		})
		return
	}

	ledIndicatorMode.value = mode as razer_led_indicator_mode
})

async function setLedIndicatorMode(mode: razer_led_indicator_mode) {
	if (ledIndicatorMode.value === mode) return

	const summary = 'Set LED Indicator Mode'
	const oldMode = ledIndicatorMode.value
	ledIndicatorMode.value = mode
	try {
		await device.config.setLedIndicatorMode(device.instance, mode)
		toast.add({
			severity: 'success',
			summary: summary,
			detail: `LED indicator mode set to ${RAZER_LED_INDICATOR_MODE_MAP[mode].key}`,

			life: 3000,
		})
	} catch (e) {
		ledIndicatorMode.value = oldMode
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
	<Card rounded="2xl" un-border="1 emerald-500/35" bg="#121212" overflow="hidden">
		<template #title>
			<div flex="~" items="center" justify="between">
				<div>
					<label block="~" text="xs gray-400" m="b1" font="semibold" uppercase="~">Lighting</label>
					<h3 text="xl emerald-50" font="bold">LED Indicator</h3>
				</div>
				<div rounded="lg" p="x3 y2" bg="emerald-500/10" un-border="1 emerald-500/30" text="right">
					<p text="xs emerald-200/85">Current Mode</p>
					<p text="sm emerald-100" font="bold">
						{{ ledIndicatorMode ? RAZER_LED_INDICATOR_MODE_MAP[ledIndicatorMode].key : '---' }}
					</p>
				</div>
			</div>
		</template>
		<template #content>
			<div class="flex flex-wrap gap-3">
				<div
					v-for="option in modeOptions"
					:key="option.mode"
					flex="1 1 160px"
					p="4"
					rounded="lg"
					un-border="2"
					cursor="pointer"
					transition="all"
					duration="200"
					text="left"
					:class="[
						ledIndicatorMode === option.mode
							? 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_18px_rgba(16,185,129,0.25)]'
							: 'border-gray-700 bg-[#1b1b1b] hover:border-gray-500 hover:bg-[#202020]',
					]"
					@click="setLedIndicatorMode(option.mode)"
				>
					<div flex="~" items="center" justify="between" gap="2">
						<div>
							<p text="xs gray-400" m="b1">MODE {{ option.mode }}</p>
							<p text="lg" font="bold" :class="ledIndicatorMode === option.mode ? 'text-emerald-100' : 'text-white'">
								{{ option.label }}
							</p>
						</div>
						<span
							v-if="ledIndicatorMode === option.mode"
							i="material-symbols-check-circle"
							text="xl emerald-300"
						></span>
					</div>
				</div>
			</div>
		</template>
	</Card>
</template>

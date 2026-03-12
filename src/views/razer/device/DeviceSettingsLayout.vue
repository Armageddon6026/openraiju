<script setup lang="ts">
const props = defineProps<{
	device: RazerDevice
	serial: string
	firmware: string
	activeTab: number
	showDpiControl?: boolean
	showPollingControl?: boolean
	isPairingDevice?: boolean
}>()

const emit = defineEmits<{
	'update:activeTab': [value: number]
}>()

const productIdHex = computed(() => {
	if (!props.device?.config.productId) return '--'
	return `0x${props.device.config.productId.toString(16).padStart(4, '0').toUpperCase()}`
})

const sensorSummary = computed(() => {
	const sensor = props.device?.config.hardware.optical_sensor
	if (!sensor) return 'No optical sensor profile'
	return `${sensor.max_dpi.toLocaleString()} DPI / Step ${sensor.dpi_step}`
})

const heroSubtitle = computed(() => {
	if (props.isPairingDevice) return 'HyperPolling pairing controller'
	return sensorSummary.value
})

const pageTitle = computed(() => {
	if (props.isPairingDevice) return 'Razer Accessory Hub'
	return 'Razer Device Center'
})

const summaryCardTitle = computed(() => {
	if (props.isPairingDevice) return 'Accessory Summary'
	return 'Device Summary'
})

const summaryCardIcon = computed(() => {
	if (props.isPairingDevice) return 'i-material-symbols-usb'
	return 'i-material-symbols-mouse-outline'
})
</script>

<template>
	<div p="6" max-w="7xl" mx="auto" flex="~ col" gap="6">
		<section
			relative="~"
			overflow="hidden"
			rounded="3xl"
			p="6 md:8"
			:style="{ backgroundImage: 'linear-gradient(135deg,#111111 0%,#132014 50%,#101710 100%)' }"
			un-border="1 emerald-500/35"
		>
			<div
				absolute="~"
				inset="0"
				op="60"
				:style="{ backgroundImage: 'radial-gradient(circle at 18% 18%,#86ff8e55,transparent 44%)' }"
			></div>
			<div relative="~" grid="~ cols-1 lg:cols-[1.4fr_0.8fr]" gap="6" items="center">
				<div>
					<p text="emerald-300/90 xs" tracking="[0.24em]" uppercase="~" mb="2">{{ pageTitle }}</p>
					<h2 text="3xl md:4xl emerald-50" font="black" leading="tight">
						{{ device.config.ui.name }}
					</h2>
					<p text="sm emerald-100/75" mt="3">PID {{ productIdHex }} • {{ heroSubtitle }}</p>

					<div flex="~ wrap" gap="2" mt="5">
						<Badge value="Connected" severity="success" />
						<Badge v-if="device.config.hardware.hyper_polling" value="Hyper Polling" />
						<Badge v-if="showDpiControl" value="DPI Control" severity="contrast" />
						<Badge v-if="showPollingControl" value="Polling Rate" severity="contrast" />
						<Badge v-if="isPairingDevice" value="Pairing Ready" severity="contrast" />
					</div>
				</div>

				<div rounded="2xl" p="4" bg="black/30" un-border="1 emerald-100/12" flex="~" items="center" justify="center">
					<Image :src="device.config.ui.image" :alt="device.config.ui.name" width="210" />
				</div>
			</div>
		</section>

		<section grid="~ cols-1 xl:cols-[1.6fr_0.9fr]" gap="6">
			<Tabs :value="activeTab" @update:value="(v: string | number) => emit('update:activeTab', Number(v))">
				<TabList>
					<slot name="tab-list"></slot>
				</TabList>
				<TabPanels>
					<slot name="tab-panels"></slot>
				</TabPanels>
			</Tabs>

			<Card rounded="2xl" un-border="1 emerald-500/35" bg="#121212" overflow="hidden">
				<template #title>
					<div flex="~" items="center" justify="between">
						<h3 text="xl emerald-50" font="bold">{{ summaryCardTitle }}</h3>
						<span :class="[summaryCardIcon]" text="2xl emerald-400"></span>
					</div>
				</template>
				<template #content>
					<div flex="~ col" gap="4" text="sm gray-200">
						<div rounded="xl" p="3" bg="[#1a1a1a]" un-border="1 emerald-500/20">
							<p text="xs gray-400" mb="1">Serial Number</p>
							<p font="mono" break-all>{{ serial }}</p>
						</div>
						<div rounded="xl" p="3" bg="[#1a1a1a]" un-border="1 emerald-500/20">
							<p text="xs gray-400" mb="1">Firmware</p>
							<p font="mono">{{ firmware }}</p>
						</div>
						<div v-if="!isPairingDevice" rounded="xl" p="3" bg="[#1a1a1a]" un-border="1 emerald-500/20">
							<p text="xs gray-400" mb="1">Sensor Profile</p>
							<p>{{ sensorSummary }}</p>
						</div>
						<slot name="summary-extra"></slot>
					</div>
				</template>
			</Card>
		</section>
	</div>
</template>

<script setup lang="ts">
import { useDeviceStore } from '@/stores'
import { useDeviceTabs } from '@/views/razer/device/composables/useDeviceTabs'

const toast = useToast()
const route = useRoute()
const router = useRouter()
const deviceStore = useDeviceStore()

const serial = ref('---')
const firmware = ref('---')
const activeSettingsTab = ref<number>(0)

const currentDevice = computed(() => {
	return deviceStore.getDevice(route.params.instanceId as string)
})

const hasDpiControl = computed(() => {
	if (
		currentDevice.value &&
		currentDevice.value.config.getDpiStages &&
		currentDevice.value.config.ui.type === 'mouse'
	) {
		return currentDevice.value as RazerDevice<RazerDeviceConfig<'mouse'>>
	}
})

const hasPollingControl = computed(() => {
	if (!currentDevice.value || !currentDevice.value.config.getPollingRate) {
		return undefined
	}

	switch (currentDevice.value.config.ui.type) {
		case 'mouse':
			return currentDevice.value as RazerDevice<RazerDeviceConfig<'mouse'>>
		case 'keyboard':
			return currentDevice.value as RazerDevice<RazerDeviceConfig<'keyboard'>>
		default:
			return undefined
	}
})

const hasHyperpollingControl = computed(() => {
	if (
		currentDevice.value &&
		currentDevice.value.config.pairHyperpollingDevice &&
		currentDevice.value.config.ui.type === 'accessory'
	) {
		return currentDevice.value as RazerDevice<RazerDeviceConfig<'accessory'>>
	}
})

const { visibleTabs } = useDeviceTabs(hasDpiControl, hasPollingControl, hasHyperpollingControl)

// Ensure active tab is valid when available tabs change
watchEffect(() => {
	if (!visibleTabs.value.some((t) => t.value === activeSettingsTab.value)) {
		activeSettingsTab.value = visibleTabs.value[0]?.value ?? 0
	}
})

onMounted(async () => {
	if (!currentDevice.value) {
		toast.add({
			severity: 'warn',
			summary: 'Device Lost',
			detail: 'The device was disconnected or not found.',
			life: 3000,
		})
		router.replace('/')
		return
	}

	try {
		serial.value = await currentDevice.value.config.getSerial(currentDevice.value.instance)
	} catch {
		serial.value = 'Unavailable'
	}

	try {
		firmware.value = await currentDevice.value.config.getFirmware(currentDevice.value.instance)
	} catch {
		firmware.value = 'Unavailable'
	}
})
</script>

<template>
	<div v-if="currentDevice" p="6" max-w="7xl" mx="auto" flex="~ col" gap="6">
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
					<p text="emerald-300/90 xs" tracking="[0.24em]" uppercase="~" mb="2">Razer Device Center</p>
					<h2 text="3xl md:4xl emerald-50" font="black" leading="tight">
						{{ currentDevice.config.ui.name }}
					</h2>
					<div m="t2">
						<span text="sm emerald-100/75" m="r3">SN: {{ serial }}</span>
						<span text="sm emerald-100/75" m="r3">Firmware: {{ firmware }}</span>
					</div>
				</div>

				<div rounded="2xl" p="4" bg="black/30" un-border="1 emerald-100/12" flex="~" items="center" justify="center">
					<Image :src="currentDevice.config.ui.image" :alt="currentDevice.config.ui.name" width="210" />
				</div>
			</div>
		</section>

		<section gap="6" v-if="visibleTabs.length > 0">
			<Tabs
				un-border="1 emerald-500/35"
				rounded="2xl"
				bg="black/30"
				:value="activeSettingsTab"
				@update:value="(v: string | number) => (activeSettingsTab = Number(v))"
			>
				<TabList rounded="2xl">
					<Tab v-for="tab in visibleTabs" :key="tab.value" :value="tab.value">
						<span flex="~" items="center" gap="2">
							<span :class="[tab.icon]"></span>
							<span>{{ tab.label }}</span>
						</span>
					</Tab>
				</TabList>

				<TabPanels rounded="2xl">
					<TabPanel v-if="visibleTabs.some((t) => t.value === 0)" :value="0">
						<div flex="~ col" gap="3">
							<DpiStages v-if="hasDpiControl" :device="hasDpiControl" />
							<PollingRate v-if="hasPollingControl" :device="hasPollingControl" />
						</div>
					</TabPanel>

					<TabPanel v-if="visibleTabs.some((t) => t.value === 1)" :value="1">
						<div flex="~ col" items="center" justify="center" h="48" text="gray-500">
							<span i="material-symbols-lightbulb-outline" text="3xl mb-4"></span>
							<p>Lighting control feature coming soon</p>
						</div>
					</TabPanel>

					<TabPanel v-if="visibleTabs.some((t) => t.value === 2)" :value="2">
						<div flex="~ col" items="center" justify="center" h="48" text="gray-500">
							<span i="material-symbols-battery-charging-20" text="3xl mb-4"></span>
							<p>Power management feature coming soon</p>
						</div>
					</TabPanel>

					<TabPanel v-if="visibleTabs.some((t) => t.value === 3)" :value="3">
						<div flex="~ col" items="center" justify="center" h="48" text="gray-500">
							<span i="material-symbols-settings-input-component" text="3xl mb-4"></span>
							<p>Calibration tools coming soon</p>
						</div>
					</TabPanel>

					<TabPanel v-if="visibleTabs.some((t) => t.value === 4)" :value="4">
						<div flex="~ col" gap="6">
							<DonglePairing v-if="hasHyperpollingControl" :device="hasHyperpollingControl"></DonglePairing>
						</div>
					</TabPanel>
				</TabPanels>
			</Tabs>
		</section>
	</div>

	<div v-else flex="~col" items="center" justify="center" h="64" text="gray-600">
		<p>Loading Device Configuration...</p>
	</div>
</template>

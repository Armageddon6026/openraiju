<script setup lang="ts">
import { useDeviceStore } from '@/stores'

const toast = useToast()
const route = useRoute()
const router = useRouter()
const deviceStore = useDeviceStore()

const serial = ref('---')
const firmware = ref('---')
const activeSettingsTab = ref<number>(0)
const visitedTabs = reactive(new Set<number>())
const currentDevice = computed(() => {
	return deviceStore.getDevice(route.params.instanceId as string)
})

const performanceTab = {
	value: 0,
	icon: 'i-material-symbols-performance-max',
	label: 'Performance',
	get condition() {
		return this.contentComponents.some((c) => c.condition())
	},
	contentComponents: [
		{
			component: defineAsyncComponent(() => import('./components/DpiStages.vue')),
			condition: () => !!hasDpiControl.value,
			get props() {
				return { device: hasDpiControl.value! }
			},
		},
		{
			component: defineAsyncComponent(() => import('./components/PollingRate.vue')),
			condition: () => !!hasPollingControl.value,
			get props() {
				return { device: hasPollingControl.value! }
			},
		},
	],
	emptyContent: undefined,
}

const lightingTab = {
	value: 1,
	icon: 'i-material-symbols-light-mode',
	label: 'Lighting',
	get condition() {
		return this.contentComponents
	},
	contentComponents: undefined,
	emptyContent: {
		icon: 'material-symbols-lightbulb-outline',
		text: 'Lighting control feature coming soon',
	},
}

const powerTab = {
	value: 2,
	icon: 'i-material-symbols-power-settings-new-rounded',
	label: 'Power',
	get condition() {
		return this.contentComponents.some((c) => c.condition())
	},
	contentComponents: [
		{
			component: defineAsyncComponent(() => import('./components/IdleTime.vue')),
			condition: () => !!hasIdleTimeControl.value,
			get props() {
				return { device: hasIdleTimeControl.value! }
			},
		},
		{
			component: defineAsyncComponent(() => import('./components/BatteryThreshold.vue')),
			condition: () => !!hasBatteryThresholdControl.value,
			get props() {
				return { device: hasBatteryThresholdControl.value! }
			},
		},
	],
	emptyContent: undefined,
}

const calibrationTab = {
	value: 3,
	icon: 'i-material-symbols-settings-input-component-outline-rounded',
	label: 'Calibration',
	get condition() {
		return this.contentComponents
	},
	contentComponents: undefined,
	emptyContent: {
		icon: 'material-symbols-settings-input-component',
		text: 'Calibration tools coming soon',
	},
}

const pairingTab = {
	value: 4,
	icon: 'i-material-symbols-add-link-rounded',
	label: 'Pairing',
	get condition() {
		return this.contentComponents.some((c) => c.condition())
	},
	contentComponents: [
		{
			component: defineAsyncComponent(() => import('./components/DonglePairing.vue')),
			condition: () => !!hasHyperpollingControl.value,
			get props() {
				return { device: hasHyperpollingControl.value! }
			},
		},
	],
	emptyContent: undefined,
}

const allTabs = [performanceTab, lightingTab, powerTab, calibrationTab, pairingTab]

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

	return currentDevice.value
})

const hasIdleTimeControl = computed(() => {
	if (!currentDevice.value || !currentDevice.value.config.getIdleTime) {
		return undefined
	}

	return currentDevice.value
})

const hasBatteryThresholdControl = computed(() => {
	if (!currentDevice.value || !currentDevice.value.config.getLowBatteryThreshold) {
		return undefined
	}

	return currentDevice.value
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

const visibleTabs = computed(() => allTabs.filter((tab) => tab.condition))

// Ensure active tab is valid when available tabs change
watchEffect(() => {
	if (!visibleTabs.value.some((t) => t.value === activeSettingsTab.value)) {
		activeSettingsTab.value = visibleTabs.value[0]?.value ?? 0
	}
})

watch(
	activeSettingsTab,
	(value) => {
		visitedTabs.add(value)
	},
	{ immediate: true },
)

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
					<TabPanel v-for="tab in visibleTabs" :key="tab.value" :value="tab.value">
						<template v-if="visitedTabs.has(tab.value) && activeSettingsTab === tab.value">
							<!-- 有內容配置的組件列表 -->
							<template v-if="tab.contentComponents && tab.contentComponents.length > 0">
								<div flex="~ col" gap="3">
									<template v-for="(content, idx) in tab.contentComponents" :key="idx">
										<component v-if="content.condition()" :is="content.component" v-bind="content.props" />
									</template>
								</div>
							</template>

							<!-- 空狀態：coming soon -->
							<template v-else-if="tab.emptyContent">
								<div flex="~ col" items="center" justify="center" h="48" text="gray-500">
									<span :i="tab.emptyContent.icon" text="3xl mb-4"></span>
									<p>{{ tab.emptyContent.text }}</p>
								</div>
							</template>
						</template>
					</TabPanel>
				</TabPanels>
			</Tabs>
		</section>
	</div>

	<div v-else flex="~col" items="center" justify="center" h="64" text="gray-600">
		<p>Loading Device Configuration...</p>
	</div>
</template>

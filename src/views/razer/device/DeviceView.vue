<script setup lang="ts">
import { useDeviceStore } from '@/stores'
import { useCapabilityDevice, useTypedCapabilityDevice } from './composables/capability'

type TabContent = {
	component: ReturnType<typeof defineAsyncComponent>
	props: Record<string, unknown>
}

type ResolvedTab = {
	value: number
	icon: string
	label: string
	contents: TabContent[]
	emptyContent?: { icon: string; text: string }
}

const toast = useToast()
const route = useRoute()
const router = useRouter()
const deviceStore = useDeviceStore()

const activeSettingsTab = ref<number>(0)
const visitedTabs = reactive(new Set<number>())

const currentDevice = computed(() => {
	return deviceStore.getDevice(route.params.instanceId as string)
})

// Define async components for each tab content
// Performance - DPI Stages
const DpiStagesComp = defineAsyncComponent(() => import('./components/DpiStages.vue'))
const hasDpiControl = useTypedCapabilityDevice('mouse', currentDevice.value, [
	'getDpiStages',
	'setDpiStages',
	'setActivateDpiStage',
] as const)

const SnapTapComp = defineAsyncComponent(() => import('./components/SnapTap.vue'))
const hasSnapTapControl = useTypedCapabilityDevice('keyboard', currentDevice.value, ['getSnapTapSetting'] as const)

// Performance - Polling Rate
const PollingRateComp = defineAsyncComponent(() => import('./components/PollingRate.vue'))
const hasPollingControl = useCapabilityDevice(currentDevice.value, ['getPollingRate', 'setPollingRate'] as const)

// Power - Idle Time
const IdleTimeComp = defineAsyncComponent(() => import('./components/IdleTime.vue'))
const hasIdleTimeControl = useCapabilityDevice(currentDevice.value, ['getIdleTime', 'setIdleTime'] as const)

// Power - Battery Threshold
const BatteryThresholdComp = defineAsyncComponent(() => import('./components/BatteryThreshold.vue'))
const hasBatteryThresholdControl = useCapabilityDevice(currentDevice.value, [
	'getLowBatteryThreshold',
	'setLowBatteryThreshold',
] as const)

// Pairing - Hyperpolling Dongle
const DonglePairingComp = defineAsyncComponent(() => import('./components/DonglePairing.vue'))
const hasHyperpollingControl = useCapabilityDevice(currentDevice.value, [
	'pairDevice',
	'unpairDevice',
	'getPairedDevices',
] as const)

const visibleTabs = computed((): ResolvedTab[] => {
	const tabs: ResolvedTab[] = [
		{
			value: 0,
			icon: 'i-material-symbols-performance-max',
			label: 'Performance',
			contents: [
				resolve(DpiStagesComp, hasDpiControl.value),
				resolve(PollingRateComp, hasPollingControl.value),
				resolve(SnapTapComp, hasSnapTapControl.value),
			].filter(Boolean) as TabContent[],
		},
		{
			value: 1,
			icon: 'i-material-symbols-light-mode',
			label: 'Lighting',
			contents: [],
		},
		{
			value: 2,
			icon: 'i-material-symbols-power-settings-new-rounded',
			label: 'Power',
			contents: [
				resolve(IdleTimeComp, hasIdleTimeControl.value),
				resolve(BatteryThresholdComp, hasBatteryThresholdControl.value),
			].filter(Boolean) as TabContent[],
		},
		{
			value: 3,
			icon: 'i-material-symbols-add-link-rounded',
			label: 'Pairing',
			contents: [resolve(DonglePairingComp, hasHyperpollingControl.value)].filter(Boolean) as TabContent[],
		},
	]

	return tabs.filter((t) => t.contents.length > 0 || t.emptyContent)
})

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
})

// ── resolved tabs ─────────────────────────────────────────────────
function resolve(
	comp: ReturnType<typeof defineAsyncComponent>,
	device: RazerDevice<RazerBaseDeviceConfig> | undefined,
): TabContent | null {
	return device != null ? { component: comp, props: { device } } : null
}
</script>

<template>
	<div v-if="currentDevice" p="6" max-w="7xl" mx="auto" flex="~ col" gap="6">
		<DeviceHero :device="currentDevice" />

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
							<template v-if="tab.contents.length > 0">
								<div flex="~ col" gap="3">
									<component
										v-for="(content, idx) in tab.contents"
										:key="idx"
										:is="content.component"
										v-bind="content.props"
									/>
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

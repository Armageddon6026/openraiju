<script setup lang="ts">
import { useDeviceStore } from '@/stores'

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

const serial = ref('---')
const firmware = ref('---')
const activeSettingsTab = ref<number>(0)
const visitedTabs = reactive(new Set<number>())

const currentDevice = computed(() => {
	return deviceStore.getDevice(route.params.instanceId as string)
})

// ── capability helpers ────────────────────────────────────────────
function deviceHasFeatures<K extends keyof RazerDeviceFeature>(
	device: RazerDevice<RazerBaseDeviceConfig> | undefined,
	features: readonly K[],
): device is DeviceWith<K> {
	if (!device) return false
	return features.every((k) => typeof (device.config as unknown as Record<string, unknown>)[k] === 'function')
}

function deviceHasTypeAndFeatures<T extends RazerDeviceType, K extends keyof RazerDeviceFeature>(
	device: RazerDevice<RazerBaseDeviceConfig> | undefined,
	type: T,
	features: readonly K[],
): device is TypedDeviceWith<T, K> {
	if (!device || device.config.ui.type !== type) return false
	return features.every((k) => typeof (device.config as unknown as Record<string, unknown>)[k] === 'function')
}

function capabilityDevice<K extends keyof RazerDeviceFeature>(features: readonly K[]) {
	return computed((): DeviceWith<K> | undefined => {
		const d = currentDevice.value
		return deviceHasFeatures(d, features) ? d : undefined
	})
}

function typedCapabilityDevice<T extends RazerDeviceType, K extends keyof RazerDeviceFeature>(
	type: T,
	features: readonly K[],
) {
	return computed((): TypedDeviceWith<T, K> | undefined => {
		const d = currentDevice.value
		return deviceHasTypeAndFeatures(d, type, features) ? d : undefined
	})
}

// ── capabilities ──────────────────────────────────────────────────
const hasDpiControl = typedCapabilityDevice('mouse', ['getDpiStages', 'setDpiStages', 'setActivateDpiStage'] as const)

const hasPollingControl = capabilityDevice(['getPollingRate', 'setPollingRate'] as const)
const hasIdleTimeControl = capabilityDevice(['getIdleTime', 'setIdleTime'] as const)
const hasBatteryThresholdControl = capabilityDevice(['getLowBatteryThreshold', 'setLowBatteryThreshold'] as const)

const hasHyperpollingControl = typedCapabilityDevice('accessory', [
	'pairHyperpollingDevice',
	'unpairHyperpollingDevice',
	'getPairDevices',
] as const)

// ── async components（宣告一次，不放進 computed 裡）───────────────
const DpiStagesComp = defineAsyncComponent(() => import('./components/DpiStages.vue'))
const PollingRateComp = defineAsyncComponent(() => import('./components/PollingRate.vue'))
const IdleTimeComp = defineAsyncComponent(() => import('./components/IdleTime.vue'))
const BatteryThresholdComp = defineAsyncComponent(() => import('./components/BatteryThreshold.vue'))
const DonglePairingComp = defineAsyncComponent(() => import('./components/DonglePairing.vue'))

// ── resolved tabs ─────────────────────────────────────────────────
function resolve(
	device: RazerDevice<RazerBaseDeviceConfig> | undefined,
	comp: ReturnType<typeof defineAsyncComponent>,
): TabContent | null {
	return device != null ? { component: comp, props: { device } } : null
}

const visibleTabs = computed((): ResolvedTab[] => {
	const tabs: ResolvedTab[] = [
		{
			value: 0,
			icon: 'i-material-symbols-performance-max',
			label: 'Performance',
			contents: [resolve(hasDpiControl.value, DpiStagesComp), resolve(hasPollingControl.value, PollingRateComp)].filter(
				Boolean,
			) as TabContent[],
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
				resolve(hasIdleTimeControl.value, IdleTimeComp),
				resolve(hasBatteryThresholdControl.value, BatteryThresholdComp),
			].filter(Boolean) as TabContent[],
		},
		{
			value: 3,
			icon: 'i-material-symbols-settings-input-component-outline-rounded',
			label: 'Calibration',
			contents: [],
		},
		{
			value: 4,
			icon: 'i-material-symbols-add-link-rounded',
			label: 'Pairing',
			contents: [resolve(hasHyperpollingControl.value, DonglePairingComp)].filter(Boolean) as TabContent[],
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

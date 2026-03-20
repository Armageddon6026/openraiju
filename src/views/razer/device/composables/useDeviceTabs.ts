import { computed, type ComputedRef, type Component } from 'vue'

export interface TabContentComponent {
	component: Component // Vue component definition
	condition: () => boolean
	props?: Record<string, unknown>
}

export interface TabConfig {
	value: number
	icon: string
	label: string
	visible: boolean
	contentComponents: TabContentComponent[] | undefined
	emptyContent:
		| {
				icon: string
				text: string
		  }
		| undefined
}

export function useDeviceTabs(
	hasDpiControl: ComputedRef<RazerDevice<RazerBaseDeviceConfig> | undefined>,
	hasPollingControl: ComputedRef<RazerDevice<RazerBaseDeviceConfig> | undefined>,
	hasHyperpollingControl: ComputedRef<RazerDevice<RazerBaseDeviceConfig> | undefined>,
	tabContents?: Readonly<
		Record<number, readonly TabContentComponent[] | { readonly icon: string; readonly text: string }>
	>,
) {
	// Tab visibility 驗證邏輯集中管理
	const tabCheckers = {
		0: () => !!hasDpiControl.value || !!hasPollingControl.value, // Performance
		1: () => false, // Lighting
		2: () => false, // Power
		3: () => false, // Calibration
		4: () => !!hasHyperpollingControl.value, // Pairing
	} as const

	const allTabs = [
		{
			value: 0,
			icon: 'i-material-symbols-performance-max',
			label: 'Performance',
			get visible() {
				return tabCheckers[0]()
			},
			contentComponents: tabContents?.[0] as TabContentComponent[] | undefined,
			emptyContent: undefined,
		},
		{
			value: 1,
			icon: 'i-material-symbols-light-mode',
			label: 'Lighting',
			get visible() {
				return tabCheckers[1]()
			},
			contentComponents: undefined,
			emptyContent: {
				icon: 'material-symbols-lightbulb-outline',
				text: 'Lighting control feature coming soon',
			},
		},
		{
			value: 2,
			icon: 'i-material-symbols-power-settings-new-rounded',
			label: 'Power',
			get visible() {
				return tabCheckers[2]()
			},
			contentComponents: undefined,
			emptyContent: {
				icon: 'material-symbols-battery-charging-20',
				text: 'Power management feature coming soon',
			},
		},
		{
			value: 3,
			icon: 'i-material-symbols-settings-input-component-outline-rounded',
			label: 'Calibration',
			get visible() {
				return tabCheckers[3]()
			},
			contentComponents: undefined,
			emptyContent: {
				icon: 'material-symbols-settings-input-component',
				text: 'Calibration tools coming soon',
			},
		},
		{
			value: 4,
			icon: 'i-material-symbols-add-link-rounded',
			label: 'Pairing',
			get visible() {
				return tabCheckers[4]()
			},
			contentComponents: tabContents?.[4] as TabContentComponent[] | undefined,
			emptyContent: undefined,
		},
	] as const

	const visibleTabs = computed(() => allTabs.filter((tab) => tab.visible))

	return {
		allTabs,
		visibleTabs,
		tabCheckers,
	}
}

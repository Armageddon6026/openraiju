import { computed, type ComputedRef } from 'vue'

export interface TabConfig {
	value: number
	icon: string
	label: string
	visible: boolean
}

export function useDeviceTabs(
	hasDpiControl: ComputedRef<RazerDevice<RazerBaseDeviceConfig> | undefined>,
	hasPollingControl: ComputedRef<RazerDevice<RazerBaseDeviceConfig> | undefined>,
	hasHyperpollingControl: ComputedRef<RazerDevice<RazerBaseDeviceConfig> | undefined>,
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
		},
		{
			value: 1,
			icon: 'i-material-symbols-light-mode',
			label: 'Lighting',
			get visible() {
				return tabCheckers[1]()
			},
		},
		{
			value: 2,
			icon: 'i-material-symbols-power-settings-new-rounded',
			label: 'Power',
			get visible() {
				return tabCheckers[2]()
			},
		},
		{
			value: 3,
			icon: 'i-material-symbols-settings-input-component-outline-rounded',
			label: 'Calibration',
			get visible() {
				return tabCheckers[3]()
			},
		},
		{
			value: 4,
			icon: 'i-material-symbols-add-link-rounded',
			label: 'Pairing',
			get visible() {
				return tabCheckers[4]()
			},
		},
	] as const

	const visibleTabs = computed(() => allTabs.filter((tab) => tab.visible))

	return {
		allTabs,
		visibleTabs,
		tabCheckers,
	}
}

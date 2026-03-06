import { razer_command } from './command'
import { RAZER_VENDOR_ID } from './common'

export const RAZER_OPTICAL_SENSORS = {
	focus_pro_45K_gen2: {
		max_dpi: 45000,
		dpi_step: 1,
		motion_sync: true,
		smart_tracking_step: 3,
		asymmetric_cutoff_levels: 26,
		sensitivity_matcher: true,
		dynamic_sensitivity: true,
		rotation: true,
	},

	focus_pro_35K_gen2: {
		max_dpi: 35000,
		dpi_step: 1,
		motion_sync: true,
		smart_tracking_step: 3,
		asymmetric_cutoff_levels: 26,
		sensitivity_matcher: true,
	},

	focus_pro_30K: {
		max_dpi: 30000,
		dpi_step: 50,
		motion_sync: true,
		smart_tracking_step: 3,
		asymmetric_cutoff_levels: 26,
	},

	focus_X_26K: {
		max_dpi: 45000,
		dpi_step: 50,
		smart_tracking_step: 3,
	},
} as const satisfies Record<string, RazerOpticalSensor>

export const RAZER_COBRA_PRO_WIRED: RazerDeviceConfig = {
	vendorId: RAZER_VENDOR_ID,
	productId: 0x00af,
	usagePage: 0x0001,
	usage: 0x0002,
	ui: {
		name: 'Razer Cobra Pro Wired',
		type: 'mouse',
		image: 'https://dl.razerzone.com/src2/13182/13182-1-en-v2.png',
	},
	hardware: {
		transaction_id: 0x1f,
		optical_sensor: RAZER_OPTICAL_SENSORS.focus_pro_30K,
		wait_min: 50,
	},
	getSerial: razer_command.getSerial,
	getDpiStages: razer_command.getDpiStages,
	setDpiStages: razer_command.setDpiStages,
	getPollingRate: razer_command.getPollingRate,
	getBatteryLevel: razer_command.getBatteryLevel,
}

export const RAZER_COBRA_PRO_WIRELESS: RazerDeviceConfig = {
	...RAZER_COBRA_PRO_WIRED,
	productId: 0x00b0,
	ui: {
		...RAZER_COBRA_PRO_WIRED.ui,
		name: 'Razer Cobra Pro Wireless',
	},
}

export const RAZER_MOUSE_DEVICES: RazerDeviceConfig[] = [
	RAZER_COBRA_PRO_WIRED,
	RAZER_COBRA_PRO_WIRELESS,
]

export const RAZER_DEVICE_CONFIGS = import.meta.glob('@/driver/razer/devices/*.ts')

export const RAZER_VENDOR_ID = 0x1532

export const RAZER_OPTICAL_SENSORS = {
	focus_pro_45K_gen2: {
		max_dpi: 45000,
		dpi_step: 1,
		smart_tracking_step: 3,
		asymmetric_cutoff_levels: 26,
		sensitivity_matcher: true,
		dynamic_sensitivity: true,
		rotation: true,
	},

	focus_pro_35K_gen2: {
		max_dpi: 35000,
		dpi_step: 1,
		smart_tracking_step: 3,
		asymmetric_cutoff_levels: 26,
		sensitivity_matcher: true,
	},

	focus_pro_30K: {
		max_dpi: 30000,
		dpi_step: 50,
		smart_tracking_step: 3,
		asymmetric_cutoff_levels: 26,
	},

	focus_X_26K: {
		max_dpi: 26000,
		dpi_step: 50,
		smart_tracking_step: 2,
	},
} as const satisfies Record<string, RazerOpticalSensor>

import RAZER_BLACKWIDOW_V4_TKL_HYPERSPEED_WIRED from './02d7.ts'
export default {
	...RAZER_BLACKWIDOW_V4_TKL_HYPERSPEED_WIRED,
	productId: 0x02d5,
	ui: {
		...RAZER_BLACKWIDOW_V4_TKL_HYPERSPEED_WIRED.ui,
		name: 'Razer BlackWidow V4 TKL HyperSpeed Wireless',
	},
	hardware: {
		...RAZER_BLACKWIDOW_V4_TKL_HYPERSPEED_WIRED.hardware,
	},
} as const satisfies RazerDeviceConfig<'keyboard'>

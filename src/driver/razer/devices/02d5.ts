import { hardware_command } from '../command/index'
import { getHyperspeedSupportList, overrideHyperspeedConfig } from '../helper.ts'
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
		max_polling_rate: 1000,
	},
	pairDevice: hardware_command.pairDevice,
	unpairDevice: hardware_command.unpairDevice,
	getPairedDevices: hardware_command.getPairedDevices,
	getPairedSupportList: getHyperspeedSupportList,
	overridePairedDeviceConfig: overrideHyperspeedConfig,
} as const satisfies RazerDeviceConfig<'keyboard'>

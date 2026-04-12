import { hardware_command, other_command } from '../command/index'
import RAZER_BLACKWIDOW_V4_TKL_HYPERSPEED_WIRED from './02d7.ts'

export default () => {
	const RAZER_BLACKWIDOW_V4_TKL_HYPERSPEED_WIRED_CONFIG = RAZER_BLACKWIDOW_V4_TKL_HYPERSPEED_WIRED()

	return {
		...RAZER_BLACKWIDOW_V4_TKL_HYPERSPEED_WIRED_CONFIG,
		productId: 0x02d5,
		ui: {
			...RAZER_BLACKWIDOW_V4_TKL_HYPERSPEED_WIRED_CONFIG.ui,
			name: 'Razer BlackWidow V4 TKL HyperSpeed Wireless',
		},
		hardware: {
			...RAZER_BLACKWIDOW_V4_TKL_HYPERSPEED_WIRED_CONFIG.hardware,
			max_polling_rate: 1000,
		},
		pairDevice: hardware_command.pairDevice,
		unpairDevice: hardware_command.unpairDevice,
		getPairedDevices: hardware_command.getPairedDevices,
		getPairedSupportList: other_command.getHyperspeedSupportList,
		overridePairedDeviceConfig: other_command.overrideHyperspeedConfig,
	} as const satisfies RazerDeviceConfig<'keyboard'>
}

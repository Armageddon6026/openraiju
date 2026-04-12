import { hardware_command, other_command } from '../command/index'
import RAZER_COBRA_PRO_WIRED from './00af.ts'

export default () => {
	const RAZER_COBRA_PRO_WIRED_CONFIG = RAZER_COBRA_PRO_WIRED()

	return {
		...RAZER_COBRA_PRO_WIRED_CONFIG,
		productId: 0x00b0,
		ui: {
			...RAZER_COBRA_PRO_WIRED_CONFIG.ui,
			name: 'Razer Cobra Pro Wireless',
		},
		hardware: {
			...RAZER_COBRA_PRO_WIRED_CONFIG.hardware,
			max_polling_rate: 1000,
		},
		pairDevice: hardware_command.pairDevice,
		unpairDevice: hardware_command.unpairDevice,
		getPairedDevices: hardware_command.getPairedDevices,
		getPairedSupportList: other_command.getHyperspeedSupportList,
		overridePairedDeviceConfig: other_command.overrideHyperspeedConfig,
	} as const satisfies RazerDeviceConfig<'mouse'>
}

import { hardware_command } from '../command/index'
import { getHyperspeedSupportList } from '../helper.ts'
import RAZER_COBRA_PRO_WIRED from './00af.ts'

export default {
	...RAZER_COBRA_PRO_WIRED,
	productId: 0x00b0,
	ui: {
		...RAZER_COBRA_PRO_WIRED.ui,
		name: 'Razer Cobra Pro Wireless',
	},
	hardware: {
		...RAZER_COBRA_PRO_WIRED.hardware,
		max_polling_rate: 1000,
	},
	pairDevice: hardware_command.pairDevice,
	unpairDevice: hardware_command.unpairDevice,
	getPairedSupportList: getHyperspeedSupportList,
	getPairedDevices: hardware_command.getPairedDevices,
} as const satisfies RazerDeviceConfig<'mouse'>

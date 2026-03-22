import { accessory_command } from '../command/accessory.ts'
import RAZER_COBRA_PRO_WIRED from './00af.ts'

export default {
	...RAZER_COBRA_PRO_WIRED,
	productId: 0x00b0,
	ui: {
		...RAZER_COBRA_PRO_WIRED.ui,
		name: 'Razer Cobra Pro Wireless',
	},
	pairHyperpollingDevice: accessory_command.pairHyperpollingDevice,
	unpairHyperpollingDevice: accessory_command.unpairHyperpollingDevice,
	getPairDevices: accessory_command.getPairDevices,
} as const satisfies RazerDeviceConfig<'mouse'>

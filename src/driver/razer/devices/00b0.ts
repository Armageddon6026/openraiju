import { accessory_command } from '../command/accessory.ts'
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
		max_polling_rate: {
			native: 1000,
			hyper: 8000,
		},
	},
	pairDevice: accessory_command.pairDevice,
	unpairDevice: accessory_command.unpairDevice,
	getPairedDevices: accessory_command.getPairedDevices,
} as const satisfies RazerDeviceConfig<'mouse'>

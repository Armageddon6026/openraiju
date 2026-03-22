import { common_command } from '../command/index'

export default {
	productId: 0x0227,
	ui: {
		name: 'Razer Huntman',
		type: 'keyboard',
		image: 'https://assets.razerzone.com/eeimages/support/products/1360/1360_huntsman-3.png',
	},
	hardware: {
		transaction_id: 0x00,
		wait_min: 31,
	},
	getSerial: common_command.getSerial,
	getFirmware: common_command.getFirmware,
} as const satisfies RazerDeviceConfig<'keyboard'>

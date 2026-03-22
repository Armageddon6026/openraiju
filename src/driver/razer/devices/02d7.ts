import { common_command } from '../command/index'

export default {
	productId: 0x02d7,
	ui: {
		name: 'Razer BlackWidow V4 TKL HyperSpeed Wired',
		type: 'keyboard',
		image: 'https://dl.razerzone.com/src2/15142/15142-1-en-v1.png',
	},
	hardware: {
		transaction_id: 0x80,
		wait_min: 31,
		hyper_polling: false,
	},
	getSerial: common_command.getSerial,
	getFirmware: common_command.getFirmware,
	getBatteryLevel: common_command.getBatteryLevel,
	getChargeState: common_command.getChargeState,
} as const satisfies RazerDeviceConfig<'keyboard'>

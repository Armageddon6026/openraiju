import { accessory_command, common_command } from '../command/index'

export default {
	productId: 0x00b3,
	ui: {
		name: 'Razer Hyperpolling Dongle',
		type: 'accessory',
		image: 'https://dl.razerzone.com/src/6141/6141-1-en-v1.png',
	},
	hardware: {
		transaction_id: 0xff,
		wait_min: 60,
		transaction_device_id: 0x80,
	},
	getSerial: common_command.getSerial,
	getFirmware: common_command.getFirmware,
	pairHyperpollingDevice: accessory_command.pairHyperpollingDevice,
	unpairHyperpollingDevice: accessory_command.unpairHyperpollingDevice,
	getPairDevices: accessory_command.getPairDevices,
} as const satisfies RazerDeviceConfig<'accessory'>

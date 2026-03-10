import { accessory_command, RAZER_VENDOR_ID } from '../command/index'

const RAZER_HYPERPOLLING_WIRELESS_DONGLE: RazerDeviceConfig = {
	vendorId: RAZER_VENDOR_ID,
	productId: 0x00b3,
	usagePage: 0x0001,
	usage: 0x0002,
	ui: {
		name: 'Razer Hyperpolling Dongle',
		type: 'accessory',
		image: 'https://dl.razerzone.com/src/6141/6141-1-en-v1.png',
	},
	hardware: {
		transaction_id: 0x1f,
		wait_min: 100,
	},
	getSerial: async () => {
		return Math.random().toString(36).substring(2)
	},
	getFirmware: async () => {
		return '0.0.0.0'
	},
	pairHyperpollingDevice: accessory_command.pairHyperpollingDevice,
	unpairHyperpollingDevice: accessory_command.unpairHyperpollingDevice,
	getPairDevices: accessory_command.getPairDevices,
}

export const RAZER_ACCESSORY_DEVICES: RazerDeviceConfig[] = [RAZER_HYPERPOLLING_WIRELESS_DONGLE]

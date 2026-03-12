import { accessory_command, common_command, RAZER_VENDOR_ID } from '../command/index'

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
		transaction_id: 0xff,
		wait_min: 100,
	},
	getSerial: common_command.getSerial,
	getFirmware: common_command.getFirmware,
	pairHyperpollingDevice: accessory_command.pairHyperpollingDevice,
	unpairHyperpollingDevice: accessory_command.unpairHyperpollingDevice,
	getPairDevices: accessory_command.getPairDevices,
}

export const RAZER_ACCESSORY_DEVICES: RazerDeviceConfig[] = [RAZER_HYPERPOLLING_WIRELESS_DONGLE]

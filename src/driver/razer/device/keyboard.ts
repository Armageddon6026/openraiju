import { common_command, RAZER_VENDOR_ID } from '../command/index'

const RAZER_HUNTMAN: RazerDeviceConfig = {
	vendorId: RAZER_VENDOR_ID,
	productId: 0x0227,
	usagePage: 0x0001,
	usage: 0x0002,
	ui: {
		name: 'Razer Huntman',
		type: 'keyboard',
		image: 'https://assets.razerzone.com/eeimages/support/products/1360/1360_huntsman-3.png',
	},
	hardware: {
		transaction_id: 0x1f,
		wait_min: 100,
	},
	getSerial: common_command.getSerial,
	getFirmware: common_command.getFirmware,
}

export const RAZER_KEYBOARD_DEVICES: RazerDeviceConfig[] = [RAZER_HUNTMAN]

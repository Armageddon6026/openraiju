import { razer_command } from './command'
import { RAZER_VENDOR_ID } from './common'

export const RAZER_COBRA_PRO_WIRELESS: HIDDeviceConfig = {
	vendorId: RAZER_VENDOR_ID,
	productId: 0x00b0,
	usagePage: 0x0001,
	usage: 0x0002,
	ui: {
		name: 'Razer Cobra Pro Wireless',
		type: 'mouse',
		image: 'https://dl.razerzone.com/src2/13182/13182-1-en-v2.png',
	},
	hardware: {
		transaction_id: 0x1f,
		wait_min: 50,
	},

	getBatteryLevel: razer_command.getBatteryLevel,
}

export const RAZER_COBRA_PRO_WIRED: HIDDeviceConfig = {
	vendorId: RAZER_VENDOR_ID,
	productId: 0x00af,
	usagePage: 0x0001,
	usage: 0x0002,
	ui: {
		name: 'Razer Cobra Pro Wired',
		type: 'mouse',
		image: 'https://dl.razerzone.com/src2/13182/13182-1-en-v2.png',
	},
	hardware: {
		transaction_id: 0x1f,
		wait_min: 50,
	},
}

export const RAZER_MOUSE_DEVICES: HIDDeviceConfig[] = [
	RAZER_COBRA_PRO_WIRELESS,
	RAZER_COBRA_PRO_WIRED,
]

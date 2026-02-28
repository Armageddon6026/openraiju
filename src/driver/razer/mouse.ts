import type { HIDDeviceConfig } from '../types'
import { razer_command } from './command'
import { RAZER_VENDOR_ID } from './common'

export const RAZER_COBRA_PRO_WIRELESS: HIDDeviceConfig = {
	filter: {
		vendorId: RAZER_VENDOR_ID,
		productId: 0x00b0,
		usagePage: 0x0001,
		usage: 0x0002,
	},
	ui: {
		name: 'Razer Cobra Pro Wireless',
		type: 'Mouse',
		image: 'https://dl.razerzone.com/src2/13182/13182-1-en-v2.png',
	},
	features: {
		getBatteryLevel: razer_command.getBatteryLevel,
	},
}

export const RAZER_COBRA_PRO_WIRED: HIDDeviceConfig = {
	filter: {
		vendorId: RAZER_VENDOR_ID,
		productId: 0x00af,
		usagePage: 0x0001,
		usage: 0x0002,
	},
	ui: {
		name: 'Razer Cobra Pro Wired',
		type: 'Mouse',
		image: 'https://dl.razerzone.com/src2/13182/13182-1-en-v2.png',
	},
}

export const RAZER_MOUSE_DEVICES: HIDDeviceConfig[] = [
	RAZER_COBRA_PRO_WIRELESS,
	RAZER_COBRA_PRO_WIRED,
]

import { razer_command } from './command'
import { RAZER_VENDOR_ID } from './common'

export const RAZER_COBRA: HIDDeviceConfig = {
	vendorId: RAZER_VENDOR_ID,
	productId: 0x00a3,
	usagePage: 0x0001,
	usage: 0x0002,
	ui: {
		name: 'Razer Cobra',
		type: 'mouse',
		image:
			'https://hybrismediaprod.blob.core.windows.net/sys-master-phoenix-images-container/h54/h60/9591466950686/cobra-500x500.png',
	},
	hardware: {
		transaction_id: 0x1f,
		wait_min: 50,
	},
	getSerial: razer_command.getSerial,
	getDPIStages: razer_command.getDPIStages,
}

export const RAZER_COBRA_PRO_WIRED: HIDDeviceConfig = {
	...RAZER_COBRA,
	productId: 0x00af,
	ui: {
		...RAZER_COBRA.ui,
		name: 'Razer Cobra Pro Wired',
		image: 'https://dl.razerzone.com/src2/13182/13182-1-en-v2.png',
	},
	getBatteryLevel: razer_command.getBatteryLevel,
}

export const RAZER_COBRA_PRO_WIRELESS: HIDDeviceConfig = {
	...RAZER_COBRA_PRO_WIRED,
	productId: 0x00b0,
	ui: {
		...RAZER_COBRA_PRO_WIRED.ui,
		name: 'Razer Cobra Pro Wireless',
	},
}

export const RAZER_MOUSE_DEVICES: HIDDeviceConfig[] = [
	RAZER_COBRA,
	RAZER_COBRA_PRO_WIRELESS,
	RAZER_COBRA_PRO_WIRED,
]

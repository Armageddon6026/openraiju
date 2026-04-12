import { hardware_command, power_command } from '../command/index'

const supportedDevices = [
	{
		productId: 176,
		type: 'mouse',
		name: 'Razer Cobra Pro',
	},
	{
		productId: 725,
		type: 'keyboard',
		name: 'Razer BlackWidow V4 TKL Hyperspeed',
	},
]

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
	},
	getSerial: hardware_command.getSerial,
	getFirmware: hardware_command.getFirmware,
	pairDevice: hardware_command.pairDevice,
	unpairDevice: hardware_command.unpairDevice,
	getPairedDevices: hardware_command.getPairedDevices,
	getLedIndicatorMode: power_command.getLedIndicatorMode,
	setLedIndicatorMode: power_command.setLedIndicatorMode,

	getPairedSupportList: async function (this: RazerDeviceConfig<'accessory'>, instance: HIDDevice) {
		const firmwareVersion = await this.getFirmware(instance)
		const major = Number(firmwareVersion.split('.')[0])
		if (isNaN(major) || major < 1) {
			throw new Error(`Invalid firmware version: ${firmwareVersion}`)
		}

		// Major version 3 use "keyboard" , while major version 1 and 2 use "mouse"
		const deviceType = major === 3 ? 'keyboard' : 'mouse'

		return supportedDevices.filter((d) => d.type === deviceType).map((d) => ({ productId: d.productId, name: d.name }))
	},

	overridePairedDeviceConfig: async function (this: RazerDeviceConfig<'accessory'>, target: RazerBaseDeviceConfig) {
		target.hardware.wait_min = this.hardware.wait_min

		switch (target.ui.type) {
			case 'keyboard':
				target.hardware.max_polling_rate = 4000
				break
			case 'mouse':
				target.hardware.max_polling_rate = 8000
				break
		}

		target.pairDevice = undefined
		target.getPairedDevices = undefined
		target.getPairedSupportList = undefined
		target.overridePairedDeviceConfig = undefined
	},
} as const satisfies RazerDeviceConfig<'accessory'>

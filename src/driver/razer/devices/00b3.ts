import { hardware_command, power_command } from '../command/index'
import { getHyperpollingSupportList } from '../helper'

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
	getPairedSupportList: getHyperpollingSupportList,
} as const satisfies RazerDeviceConfig<'accessory'>

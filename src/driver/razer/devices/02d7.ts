import { mouse_command, power_command, keyboard_command, hardware_command } from '../command/index'

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
		max_polling_rate: {
			native: 1000,
		},
	},
	getSerial: hardware_command.getSerial,
	getFirmware: hardware_command.getFirmware,
	getBatteryLevel: power_command.getBatteryLevel,
	getChargeState: power_command.getChargeState,
	getLowBatteryThreshold: power_command.getLowBatteryThreshold,
	setLowBatteryThreshold: power_command.setLowBatteryThreshold,
	getIdleTime: power_command.getIdleTime,
	setIdleTime: power_command.setIdleTime,
	getPollingRate: mouse_command.getPollingRate,
	setPollingRate: mouse_command.setPollingRate,
	getSnapTapSetting: keyboard_command.getSnapTapSetting,
	setSnapTapSetting: keyboard_command.setSnapTapSetting,
} as const satisfies RazerDeviceConfig<'keyboard'>

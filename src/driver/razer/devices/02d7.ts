import { common_command, mouse_command } from '../command/index'
import { keyboard_command } from '../command/keyboard'

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
	getSerial: common_command.getSerial,
	getFirmware: common_command.getFirmware,
	getBatteryLevel: common_command.getBatteryLevel,
	getChargeState: common_command.getChargeState,
	getLowBatteryThreshold: common_command.getLowBatteryThreshold,
	setLowBatteryThreshold: common_command.setLowBatteryThreshold,
	getIdleTime: common_command.getIdleTime,
	setIdleTime: common_command.setIdleTime,
	getPollingRate: mouse_command.getPollingRate,
	setPollingRate: mouse_command.setPollingRate,
	getSnapTapSetting: keyboard_command.getSnapTapSetting,
} as const satisfies RazerDeviceConfig<'keyboard'>

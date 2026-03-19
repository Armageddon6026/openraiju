import { mouse_command, common_command } from '../command/index'
import { RAZER_OPTICAL_SENSORS } from '../define'

export default {
	productId: 0x00af,
	ui: {
		name: 'Razer Cobra Pro Wired',
		type: 'mouse',
		image: 'https://dl.razerzone.com/src2/13182/13182-1-en-v2.png',
	},
	hardware: {
		transaction_id: 0x00,
		wait_min: 31,
		max_dpi_stages: 5,
		optical_sensor: RAZER_OPTICAL_SENSORS.focus_pro_30K,
		hyper_polling: false,
	},
	getSerial: common_command.getSerial,
	getFirmware: common_command.getFirmware,
	getBatteryLevel: common_command.getBatteryLevel,
	getChargeState: common_command.getChargeState,
	getDpiStages: mouse_command.getDpiStages,
	setDpiStages: mouse_command.setDpiStages,
	setActivateDpiStage: mouse_command.setActivateDpiStage,
	getPollingRate: mouse_command.getPollingRate,
	setPollingRate: mouse_command.setPollingRate,
	getTrackingStep: mouse_command.getTrackingStep,
} as const satisfies RazerDeviceConfig<'mouse'>

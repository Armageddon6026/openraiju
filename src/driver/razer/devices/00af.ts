import { mouse_command, power_command, hardware_command } from '../command/index'
import { RAZER_OPTICAL_SENSORS, RAZER_SENSOR_MODEL } from '../define'

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
		sensor_model: RAZER_SENSOR_MODEL.avago_proximity_sensor,
		max_polling_rate: 1000,
	},
	getSerial: hardware_command.getSerial,
	getFirmware: hardware_command.getFirmware,
	getBatteryLevel: power_command.getBatteryLevel,
	getChargeState: power_command.getChargeState,
	getLowBatteryThreshold: power_command.getLowBatteryThreshold,
	setLowBatteryThreshold: power_command.setLowBatteryThreshold,
	getIdleTime: power_command.getIdleTime,
	setIdleTime: power_command.setIdleTime,
	getDpiStages: mouse_command.getDpiStages,
	setDpiStages: mouse_command.setDpiStages,
	setActivateDpiStage: mouse_command.setActivateDpiStage,
	getTrackingStep: mouse_command.getTrackingStep,
	setTrackingStep: mouse_command.setTrackingStep,
	getPollingRate: hardware_command.getPollingRate,
	setPollingRate: hardware_command.setPollingRate,
} as const satisfies RazerDeviceConfig<'mouse'>

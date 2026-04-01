import { buildRazerReport, sendCommand } from './common'

export enum RAZER_LED_INDICATOR_MODE {
	Connection = 1,
	BatteryLevel = 2,
	BatteryWarning = 3,
}

export const power_command = {
	async getBatteryLevel(this: RazerBaseDeviceConfig, instance: HIDDevice): Promise<number> {
		const response = await sendCommand(
			instance,
			buildRazerReport(this.hardware.transaction_id, 0x02, 0x07, 0x80),
			this.hardware.wait_min,
		)

		return Math.round(
			// battery level located at args_index + 1 (total 2 bytes)
			(response.getUint8(1) / 255) * 100,
		)
	},

	async getChargeState(this: RazerBaseDeviceConfig, instance: HIDDevice): Promise<boolean> {
		const response = await sendCommand(
			instance,
			buildRazerReport(this.hardware.transaction_id, 0x02, 0x07, 0x84),
			this.hardware.wait_min,
		)

		// charge state located at args_index + 1, 0 when not charging, 1 when charging
		return response.getUint8(1) === 1
	},

	async getLowBatteryThreshold(this: RazerBaseDeviceConfig, instance: HIDDevice): Promise<number> {
		const response = await sendCommand(
			instance,
			buildRazerReport(this.hardware.transaction_id, 0x01, 0x07, 0x81),
			this.hardware.wait_min,
		)

		// Same as battery level response format
		return Math.round((response.getUint8(0) / 255) * 100)
	},

	async setLowBatteryThreshold(this: RazerBaseDeviceConfig, instance: HIDDevice, threshold: number): Promise<void> {
		if (threshold < 5 || threshold > 100) {
			throw new Error('Low battery threshold must be between 5 and 100 percent')
		}
		if (threshold % 5 !== 0) {
			throw new Error('Low battery threshold must be in increments of 5 percent')
		}
		const setVal = Math.floor((threshold / 100) * 255)

		await sendCommand(
			instance,
			buildRazerReport(this.hardware.transaction_id, 0x01, 0x07, 0x01, [setVal]),
			this.hardware.wait_min,
		)
	},

	async getIdleTime(this: RazerBaseDeviceConfig, instance: HIDDevice): Promise<number> {
		const response = await sendCommand(
			instance,
			buildRazerReport(this.hardware.transaction_id, 0x02, 0x07, 0x83),
			this.hardware.wait_min,
		)

		// idle time located at args_index (total 2 bytes), unit is seconds, convert to minutes
		return Math.round(response.getUint16(0, false) / 60)
	},

	async setIdleTime(this: RazerBaseDeviceConfig, instance: HIDDevice, minutes: number): Promise<void> {
		if (minutes < 1 || minutes > 15) {
			throw new Error('Idle time must be between 1 and 15 minutes')
		}

		const setVal = minutes * 60
		const args: number[] = []
		let offset = 0
		args[offset++] = (setVal >> 8) & 0xff
		args[offset++] = setVal & 0xff

		await sendCommand(
			instance,
			buildRazerReport(this.hardware.transaction_id, 0x02, 0x07, 0x03, args),
			this.hardware.wait_min,
		)
	},

	async getLedIndicatorMode(this: RazerBaseDeviceConfig, instance: HIDDevice): Promise<RAZER_LED_INDICATOR_MODE> {
		const response = await sendCommand(
			instance,
			buildRazerReport(this.hardware.transaction_id, 0x01, 0x07, 0x90),
			this.hardware.wait_min,
		)
		const mode = response.getUint8(0)
		if (mode < 1 || mode > 3) {
			throw new Error('Invalid LED indicator mode received from device')
		}

		return mode
	},

	async setLedIndicatorMode(
		this: RazerBaseDeviceConfig,
		instance: HIDDevice,
		mode: RAZER_LED_INDICATOR_MODE,
	): Promise<void> {
		if (mode < 1 || mode > 3) {
			throw new Error('LED indicator mode must be between 1 and 3')
		}

		// mode
		// Connection: 1,
		// BatteryLevel: 2,
		// BatteryWarning: 3
		await sendCommand(
			instance,
			buildRazerReport(this.hardware.transaction_id, 0x01, 0x07, 0x02, [mode]),
			this.hardware.wait_min,
		)
	},
}

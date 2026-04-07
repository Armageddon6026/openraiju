import { buildRazerReport, sendCommand, razer_storage_type } from './common'

// ref: https://github.com/openrazer/openrazer/blob/master/driver/razermouse_driver.c
export const mouse_command = {
	async getDpiStages(this: RazerDeviceConfig<'mouse'>, instance: HIDDevice): Promise<RazerDpiStageInfo> {
		const response = await sendCommand(
			instance,
			buildRazerReport(this.hardware.transaction_id, 0x26, 0x04, 0x86, [razer_storage_type.profile_slot_default]),
			this.hardware.wait_min,
		)

		// Response format (hex):
		// 01    varstore
		// 02    active DPI stage
		// 04    number of stages = 4
		//
		// 01    first DPI stage
		// 03 20 first stage DPI X = 800
		// 03 20 first stage DPI Y = 800
		// 00 00 reserved
		//
		// 02    second DPI stage
		// 07 08 second stage DPI X = 1800
		// 07 08 second stage DPI Y = 1800
		// 00 00 reserved
		//
		// 03    third DPI stage
		// ...
		const dpiInfo: RazerDpiStageInfo = {
			ActivateID: response.getUint8(1),
			DpiStages: [],
		}

		const numberOfStages = response.getUint8(2)

		let index = 3 // start read stage info
		for (let i = 0; i < numberOfStages; i++) {
			const stageId = response.getUint8(index)
			index += 1
			const dpiX = response.getUint16(index, false)
			index += 2
			const dpiY = response.getUint16(index, false)
			index += 2
			index += 2 // skip reserved

			dpiInfo.DpiStages.push({
				ID: stageId,
				X: dpiX,
				Y: dpiY,
			})
		}

		return dpiInfo
	},

	async setActivateDpiStage(this: RazerDeviceConfig<'mouse'>, instance: HIDDevice, stageId: number) {
		if (stageId > this.hardware.max_dpi_stages) {
			throw new Error('Active DPI stage ID exceeds the number of available stages')
		}

		await sendCommand(
			instance,
			buildRazerReport(this.hardware.transaction_id, 0x02, 0x04, 0x04, [
				razer_storage_type.profile_slot_default,
				stageId,
			]),
			this.hardware.wait_min,
		)
	},

	async setDpiStages(this: RazerDeviceConfig<'mouse'>, instance: HIDDevice, dpiInfo: RazerDpiStageInfo) {
		if (dpiInfo.ActivateID > this.hardware.max_dpi_stages) {
			throw new Error('Active DPI stage ID exceeds the number of available stages')
		}
		const numberOfStages = dpiInfo.DpiStages.length
		if (numberOfStages > this.hardware.max_dpi_stages || numberOfStages <= 0) {
			throw new Error(`Number of DPI stages must be between 1 and ${this.hardware.max_dpi_stages}`)
		}

		// The request uses the same format as the response from getDpiStages
		const args: number[] = []
		let offset = 0

		args[offset++] = razer_storage_type.profile_slot_default
		args[offset++] = dpiInfo.ActivateID
		args[offset++] = numberOfStages

		for (const stage of dpiInfo.DpiStages) {
			const { ID, X: dpiX, Y: dpiY } = stage

			args[offset++] = ID
			if (
				dpiX > this.hardware.optical_sensor.max_dpi ||
				dpiY > this.hardware.optical_sensor.max_dpi ||
				dpiX < this.hardware.optical_sensor.dpi_step ||
				dpiY < this.hardware.optical_sensor.dpi_step
			) {
				throw new Error(
					`DPI value ${dpiX}/${dpiY} exceeds the maximum supported DPI of ${this.hardware.optical_sensor.max_dpi}`,
				)
			}

			if (dpiX % this.hardware.optical_sensor.dpi_step !== 0 || dpiY % this.hardware.optical_sensor.dpi_step !== 0) {
				throw new Error(
					`DPI value ${dpiX}/${dpiY} is not a multiple of the DPI step of ${this.hardware.optical_sensor.dpi_step}`,
				)
			}

			args[offset++] = (dpiX >> 8) & 0xff
			args[offset++] = dpiX & 0xff
			args[offset++] = (dpiY >> 8) & 0xff
			args[offset++] = dpiY & 0xff
			args[offset++] = 0x00 // Reserved
			args[offset++] = 0x00 // Reserved
		}

		await sendCommand(
			instance,
			buildRazerReport(this.hardware.transaction_id, 0x26, 0x04, 0x06, args),
			this.hardware.wait_min,
		)
	},

	async getTrackingStep(this: RazerDeviceConfig<'mouse'>, instance: HIDDevice): Promise<number> {
		const response = await sendCommand(
			instance,
			buildRazerReport(this.hardware.transaction_id, 0x02, 0x0b, 0x8b, [
				razer_storage_type.runtime,
				this.hardware.sensor_model,
			]),
			this.hardware.wait_min,
		)

		// response fomat
		// 0x00 -> runtime storage
		// 0x04 -> sensor id
		// 0x01 -> tracking mode (0x01: Symmetric , 0x04: Asymmetric)
		// 0x01 -> if tracking mode is symmetric, this byte indicates the tracking step.
		const mode = response.getUint8(2)
		if (mode === 0x01) {
			return response.getUint8(3)
		} else {
			throw new Error('Asymmetric tracking mode is not supported')
		}
	},

	async setTrackingStep(this: RazerDeviceConfig<'mouse'>, instance: HIDDevice, step: number) {
		if (this.hardware.optical_sensor.max_tracking_step < step || step < 0) {
			throw new Error(`Tracking step ${step} is not supported`)
		}

		await sendCommand(
			instance,
			buildRazerReport(this.hardware.transaction_id, 0x04, 0x0b, 0x0b, [
				razer_storage_type.runtime,
				this.hardware.sensor_model,
				0x01,
				step,
			]),
			this.hardware.wait_min,
		)
	},
}

import {
	buildRazerReport,
	razer_report_type,
	sendCommand,
	DEVICE_VARIABLE_STORAGE,
	RUNTIME_VARIABLE_STORAGE,
} from './common'

// ref: https://github.com/openrazer/openrazer/blob/master/driver/razermouse_driver.c
export const razer_command = {
	async getSerial(this: RazerDeviceConfig, device: HIDDevice): Promise<string> {
		const response = await sendCommand(
			device,
			buildRazerReport(this.hardware.transaction_id, 0x16, 0x00, 0x82),
			this.hardware.wait_min,
		)

		// serial format: 15 bytes + 1 \0
		const bytes = new Uint8Array(
			response.buffer,
			response.byteOffset + razer_report_type.args_index,
			0x16,
		)
		return new TextDecoder('ascii').decode(bytes).replace(/\0+$/, '') // remove padding \0
	},

	async getBatteryLevel(this: RazerDeviceConfig, device: HIDDevice): Promise<number> {
		const response = await sendCommand(
			device,
			buildRazerReport(this.hardware.transaction_id, 0x02, 0x07, 0x80),
			this.hardware.wait_min,
		)

		return Math.round(
			// battery level located at args_index + 1 (total 2 bytes)
			(response.getUint8(razer_report_type.args_index + 1) / 255) * 100,
		)
	},

	async getDpiStages(this: RazerDeviceConfig, device: HIDDevice): Promise<MouseDpiInfo> {
		const response = await sendCommand(
			device,
			buildRazerReport(this.hardware.transaction_id, 0x26, 0x04, 0x86, [DEVICE_VARIABLE_STORAGE]),
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
		const dpiInfo: MouseDpiInfo = {
			ActivateID: response.getUint8(razer_report_type.args_index + 1),
			DpiStages: [],
		}

		const numberOfStages = response.getUint8(razer_report_type.args_index + 2)

		let index = razer_report_type.args_index + 3 // start read stage info
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

	async setDpiStages(this: RazerDeviceConfig, device: HIDDevice, dpiInfo: MouseDpiInfo) {
		if (dpiInfo.ActivateID > dpiInfo.DpiStages.length) {
			throw new Error('Active DPI stage ID exceeds the number of available stages')
		}

		// The request uses the same format as the response from getDpiStages
		let args: number[] = []
		args[0] = DEVICE_VARIABLE_STORAGE
		args[1] = dpiInfo.ActivateID
		args[2] = dpiInfo.DpiStages.length

		let offset = 3
		for (let i = 0; i < dpiInfo.DpiStages.length; i++) {
			if (!dpiInfo.DpiStages[i]) {
				throw new Error(`DPI stage at index ${i} is undefined`)
			}

			args[offset++] = dpiInfo.DpiStages[i]!.ID

			const dpiX = dpiInfo.DpiStages[i]!.X
			const dpiY = dpiInfo.DpiStages[i]!.Y

			if (
				dpiX > this.hardware.optical_sensor.max_dpi ||
				dpiY > this.hardware.optical_sensor.max_dpi
			) {
				throw new Error(
					`DPI value ${dpiX}/${dpiY} exceeds the maximum supported DPI of ${this.hardware.optical_sensor.max_dpi}`,
				)
			}

			if (
				dpiX % this.hardware.optical_sensor.dpi_step !== 0 ||
				dpiY % this.hardware.optical_sensor.dpi_step !== 0
			) {
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
			device,
			buildRazerReport(this.hardware.transaction_id, 0x26, 0x04, 0x06, args),
			this.hardware.wait_min,
		)
	},

	async getPollingRate(this: RazerDeviceConfig, device: HIDDevice): Promise<number> {
		const commandId = this.hardware.HyperPolling ? 0xc0 : 0x85
		const maxPollingRate = this.hardware.HyperPolling ? 8000 : 1000

		const response = await sendCommand(
			device,
			buildRazerReport(this.hardware.transaction_id, 0x01, 0x00, commandId),
			this.hardware.wait_min,
		)

		// The response contains the polling index, which is used to calculate the polling rate.
		// Ex:
		// - If pollingIndex = 0x10 (16 in decimal) and HyperPolling is enabled,
		// - pollingRate = maxPollingRate (8000) / pollingIndex (16) = 8000 / 12 = 500 Hz
		const pollingIndex = response.getUint8(razer_report_type.args_index)
		if (pollingIndex === 0) {
			throw new Error('Failed to get polling rate')
		}
		return maxPollingRate / pollingIndex
	},

	async setPollingRate(this: RazerDeviceConfig, device: HIDDevice, pollingRate: number) {
		const hyper = this.hardware.HyperPolling
		const commandId = hyper ? 0x40 : 0x05
		const maxPollingRate = hyper ? 8000 : 1000
		const data_size = hyper ? 0x02 : 0x01

		if (pollingRate > maxPollingRate) {
			throw new Error('Polling rate exceeds the maximum supported rate')
		}

		if (maxPollingRate % pollingRate !== 0 || pollingRate === 250 /** RAZER Not supported 250  */) {
			throw new Error(`Polling rate ${pollingRate} is not supported`)
		}

		const pollingIndex = maxPollingRate / pollingRate
		// check 2^x
		if ((pollingIndex & (pollingIndex - 1)) !== 0) {
			throw new Error(`Polling rate ${pollingRate} is not supported`)
		}
		const args = hyper ? [RUNTIME_VARIABLE_STORAGE, pollingIndex] : [pollingIndex]

		await sendCommand(
			device,
			buildRazerReport(this.hardware.transaction_id, data_size, 0x00, commandId, args),
			this.hardware.wait_min,
		)

		// HyperPolling requires two commands: runtime update (0x00) and persistent storage (0x01) write
		if (hyper) {
			await sendCommand(
				device,
				buildRazerReport(this.hardware.transaction_id, data_size, 0x00, commandId, [
					DEVICE_VARIABLE_STORAGE,
					pollingIndex,
				]),
				this.hardware.wait_min,
			)
		}
	},
}

import { buildRazerReport, razer_report_type, sendCommand, DEVICE_VARIABLE_STORAGE } from './common'

// ref: https://github.com/openrazer/openrazer/blob/master/driver/razermouse_driver.c
export const razer_command = {
	async getSerial(this: HIDDeviceConfig, device: HIDDevice): Promise<string> {
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

	async getBatteryLevel(this: HIDDeviceConfig, device: HIDDevice): Promise<number> {
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

	async getDpiStages(this: HIDDeviceConfig, device: HIDDevice): Promise<MouseDpiInfo> {
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

	async setDpiStages(this: HIDDeviceConfig, device: HIDDevice, dpiInfo: MouseDpiInfo) {
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
}

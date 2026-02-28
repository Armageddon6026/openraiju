import { buildRazerReport, razer_report_type, sendCommand } from './common'

export const razer_command = {
	async getBatteryLevel(device: HIDDevice): Promise<number> {
		const response = await sendCommand(device, buildRazerReport(0x02, 0x07, 0x80))

		return Math.round(
			// battery level located at args_index + 1 (total 2 bytes)
			(response.getUint8(razer_report_type.args_index + 1) / 255) * 100,
		)
	},
}

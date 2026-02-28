import { buildRazerReport, razer_report_type, sendCommand } from './common'

export const razer_command = {
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
}

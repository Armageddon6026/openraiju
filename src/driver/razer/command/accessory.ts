import { buildRazerReport, sendCommand } from './common'

export const accessory_command = {
	async pairHyperpollingDevice(this: RazerDeviceConfig, instance: HIDDevice, pid: number) {
		await sendCommand(
			instance,
			buildRazerReport(this.hardware.transaction_id, 0x01, 0x00, 0x46, [0x01]),
			this.hardware.wait_min,
		)

		const args: number[] = []
		let offset = 0

		args[offset++] = 0x01
		args[offset++] = (pid >> 8) & 0xff
		args[offset++] = pid & 0xff

		await sendCommand(instance, buildRazerReport(this.hardware.transaction_id, 0x01, 0x00, 0x41, args), 1000)
	},

	async unpairHyperpollingDevice(this: RazerDeviceConfig, instance: HIDDevice, pid: number) {
		const args: number[] = []
		let offset = 0

		args[offset++] = (pid >> 8) & 0xff
		args[offset++] = pid & 0xff
		await sendCommand(
			instance,
			buildRazerReport(this.hardware.transaction_id, 0x02, 0x00, 0x42, args),
			this.hardware.wait_min,
		)
	},
}

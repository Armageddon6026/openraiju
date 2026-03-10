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

		await sendCommand(instance, buildRazerReport(this.hardware.transaction_id, 0x03, 0x00, 0x41, args), 1000 * 10)
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

	async getPairDevices(this: RazerDeviceConfig, instance: HIDDevice): Promise<number[]> {
		const response = await sendCommand(
			instance,
			buildRazerReport(this.hardware.transaction_id, 0x00, 0x00, 0xbf),
			this.hardware.wait_min,
		)

		// Response format (hex):
		// 02    pair count
		// 01    first devie pair state 0=disabled 1=enabled
		// 00 b0 first devie pid
		//
		// 00    second devie pair state 0=disabled 1=enabled
		// ff ff second devie pid
		// ...
		const pids: number[] = []
		let offset = 0

		const numberOfDevices = response.getUint8(0)
		offset += 1
		for (let i = 0; i < numberOfDevices; i++) {
			const isPaired = response.getUint8(offset)
			offset += 1
			if (isPaired === 1) {
				const pid = response.getUint16(offset, false)
				pids.push(pid)
			}

			offset += 2
		}

		return pids
	},
}

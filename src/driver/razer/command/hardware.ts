import { buildRazerReport, razer_storage_type, sendCommand } from './common'

export const hardware_command = {
	async getSerial(this: RazerBaseDeviceConfig, instance: HIDDevice): Promise<string> {
		const response = await sendCommand(
			instance,
			buildRazerReport(this.hardware.transaction_id, 0x16, 0x00, 0x82),
			this.hardware.wait_min,
		)

		// serial format: 15 bytes + 1 \0
		const bytes = new Uint8Array(response.buffer, response.byteOffset, 0x16)
		return new TextDecoder('ascii').decode(bytes).replace(/\0+$/, '') // remove padding \0
	},

	async getFirmware(this: RazerBaseDeviceConfig, instance: HIDDevice): Promise<string> {
		const response = await sendCommand(
			instance,
			buildRazerReport(this.hardware.transaction_id, 0x04, 0x00, 0x81),
			this.hardware.wait_min,
		)

		// firmware format: 4 bytes
		return `${response.getUint8(0)}.${response.getUint8(1)}.${response.getUint8(2)}.${response.getUint8(3)}`
	},

	async getPollingRate(this: RazerBaseDeviceConfig, instance: HIDDevice): Promise<number> {
		if (!this.hardware.max_polling_rate) {
			throw new Error('Device does not support polling rate configuration')
		}

		const maxPollingRate = this.hardware.max_polling_rate
		const isHyperpolling = maxPollingRate > 1000

		const commandId = isHyperpolling ? 0xc0 : 0x85
		const response = await sendCommand(
			instance,
			buildRazerReport(this.hardware.transaction_id, 0x01, 0x00, commandId, [razer_storage_type.profile_slot_default]),
			this.hardware.wait_min,
		)

		// The response contains the polling index, which is used to calculate the polling rate.
		// Ex:
		// - If pollingIndex = 0x10 (16 in decimal) and HyperPolling is enabled,
		// - pollingRate = maxPollingRate (8000) / pollingIndex (16) = 8000 / 16 = 500 Hz
		const pollingIndex = response.getUint8(isHyperpolling ? 1 : 0)
		if (pollingIndex === 0) {
			throw new Error('Failed to get polling rate')
		}

		return maxPollingRate / pollingIndex
	},

	async setPollingRate(this: RazerBaseDeviceConfig, instance: HIDDevice, pollingRate: number) {
		if (!this.hardware.max_polling_rate) {
			throw new Error('Device does not support polling rate configuration')
		}

		const maxPollingRate = this.hardware.max_polling_rate
		const isHyperpolling = maxPollingRate > 1000

		const commandId = isHyperpolling ? 0x40 : 0x05
		const data_size = isHyperpolling ? 0x02 : 0x01

		if (pollingRate > maxPollingRate) {
			throw new Error(`Polling rate exceeds the maximum supported rate of ${maxPollingRate}`)
		}

		const pollingIndex = maxPollingRate / pollingRate
		if (
			pollingRate === 250 /** RAZER Not supported 250  */ ||
			maxPollingRate % pollingRate !== 0 ||
			(pollingIndex & (pollingIndex - 1)) !== 0 /** check 2^x */
		) {
			throw new Error(`Polling rate ${pollingRate} is not supported`)
		}

		// HyperPolling requires two commands: runtime update (0x00) and persistent storage (0x01) write
		const args = isHyperpolling ? [razer_storage_type.runtime, pollingIndex] : [pollingIndex]
		await sendCommand(
			instance,
			buildRazerReport(this.hardware.transaction_id, data_size, 0x00, commandId, args),
			this.hardware.wait_min,
		)

		if (isHyperpolling) {
			await sendCommand(
				instance,
				buildRazerReport(this.hardware.transaction_id, data_size, 0x00, commandId, [
					razer_storage_type.profile_slot_default,
					pollingIndex,
				]),
				this.hardware.wait_min,
			)
		}
	},

	async pairDevice(
		this: RazerBaseDeviceConfig,
		instance: HIDDevice,
		transaction_id: number, // used the transaction_id from the pairing device's config
		pid: number,
	): Promise<() => Promise<void>> {
		const start_pair = 0x01
		const cancel_pair = 0x04
		// start pair mode
		await sendCommand(
			instance,
			buildRazerReport(transaction_id, 0x01, 0x00, 0x46, [start_pair]),
			this.hardware.wait_min,
		)

		const args: number[] = []
		let offset = 0

		args[offset++] = 0x01
		args[offset++] = (pid >> 8) & 0xff
		args[offset++] = pid & 0xff

		// scan device
		await sendCommand(instance, buildRazerReport(transaction_id, 0x03, 0x00, 0x41, args), this.hardware.wait_min)

		return async () => {
			// cancel pair mode
			await sendCommand(
				instance,
				buildRazerReport(transaction_id, 0x01, 0x00, 0x46, [cancel_pair]),
				this.hardware.wait_min,
			)
		}
	},

	async unpairDevice(this: RazerBaseDeviceConfig, instance: HIDDevice, pid: number) {
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

	async getPairedDevices(this: RazerBaseDeviceConfig, instance: HIDDevice): Promise<number[]> {
		const response = await sendCommand(
			instance,
			buildRazerReport(this.hardware.transaction_id, 0x80, 0x00, 0xbf),
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

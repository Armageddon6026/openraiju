import { buildRazerReport, razer_storage_type, sendCommand } from './common'

const max_snap_tap_pairs = 4

export const keyboard_command = {
	async getSnapTapSetting(this: RazerDeviceConfig<'keyboard'>, instance: HIDDevice): Promise<RazerSnapTapInfo> {
		const response = await sendCommand(
			instance,
			buildRazerReport(this.hardware.transaction_id, 0x0f, 0x02, 0xa7, [razer_storage_type.profile_slot_default]),
			this.hardware.wait_min,
		)

		// Response format (hex):
		// 01    varstore
		// 00    reserved
		// 01    enabled (1) or disabled (0)
		//
		// 25  first key pair1
		// 27  first key pair2
		// 00  reserved
		//
		// 1f  second key pair1
		// 21  second key pair2
		// 00  reserved
		//
		// ...
		let offset = 2
		const info: RazerSnapTapInfo = {
			Enabled: response.getUint8(offset++) === 1,
			KeyPair: [],
		}

		for (let i = 0; i < max_snap_tap_pairs; i++) {
			const key1 = response.getUint8(offset++)
			if (key1 === 0) {
				// If Key1 is 0, it indicates no more valid key pairs
				break
			}
			const key2 = response.getUint8(offset++)
			offset++ // Skip the reserved byte
			info.KeyPair.push({ Key1: key1, Key2: key2 })
		}

		return info
	},

	async setSnapTapSetting(this: RazerDeviceConfig<'keyboard'>, instance: HIDDevice, info: RazerSnapTapInfo) {
		const keyPairLength = info.KeyPair.length
		if (keyPairLength > max_snap_tap_pairs || keyPairLength <= 0) {
			throw new Error(`Invalid number of key pairs. Must be between 1 and ${max_snap_tap_pairs}.`)
		}

		const args: number[] = []
		let offset = 0
		args[offset++] = razer_storage_type.profile_slot_default
		args[offset++] = 0 // reserved
		args[offset++] = info.Enabled ? 1 : 0

		for (const pair of info.KeyPair) {
			const { Key1, Key2 } = pair
			if (Key1 === 0 || Key2 === 0) {
				throw new Error('Key codes in pairs cannot be 0.')
			}

			args[offset++] = Key1
			args[offset++] = Key2
			args[offset++] = 0 // reserved
		}

		await sendCommand(
			instance,
			buildRazerReport(this.hardware.transaction_id, 0x0f, 0x02, 0x27, args),
			this.hardware.wait_min,
		)
	},
}

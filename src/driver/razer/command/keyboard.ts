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
}

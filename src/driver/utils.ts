// for debug usage
export function printBuffer(buffer: ArrayBufferLike) {
	const uint8Array = new Uint8Array(buffer)
	let hexString = ''
	for (let i = 0; i < uint8Array.length; i++) {
		hexString += uint8Array[i]!.toString(16).padStart(2, '0') + ' '
	}
	console.log(hexString.trim())
}

export async function ping(instance: HIDDevice) {
	try {
		if (!instance.opened) await instance.open()

		await Promise.race([
			instance.receiveFeatureReport(0x00),
			new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 100)),
		])

		return true
	} catch {
		return false
	}
}

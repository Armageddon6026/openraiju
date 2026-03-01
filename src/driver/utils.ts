// for debug usage
export function printBuffer(buffer: ArrayBufferLike) {
	const uint8Array = new Uint8Array(buffer)
	let hexString = ''
	for (let i = 0; i < uint8Array.length; i++) {
		hexString += uint8Array[i]!.toString(16).padStart(2, '0') + ' '
	}
	console.log(hexString.trim())
}

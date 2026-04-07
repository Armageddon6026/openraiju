import { RAZER_DEVICE_CONFIGS } from './define'

export async function getHyperspeedSupportList(
	this: RazerBaseDeviceConfig,
	_instance: HIDDevice,
): Promise<RazerPairedDeviceInfo[]> {
	const res = await fetch('/razer/hyperspeed_device.json')
	const data = (await res.json()) as { productId: number; type: RazerDeviceType; name: string }[]

	// if primary transaction_id bit is 0, it's a mouse device, otherwise it's a keyboard device.
	// return the different hyperspeed device list based on the device type.
	const deviceType = (this.hardware.transaction_id & 0x80) === 0 ? 'keyboard' : 'mouse'

	return data.filter((d) => d.type === deviceType).map((d) => ({ productId: d.productId, name: d.name }))
}

export async function setHyperspeedHardware(this: RazerBaseDeviceConfig, target: RazerBaseDeviceConfig) {
	target.hardware.wait_min = this.hardware.wait_min
	target.pairDevice = undefined
	target.getPairedDevices = undefined
	target.getPairedSupportList = undefined
	target.setPairDeviceConfig = undefined
}

export async function getRazerDeviceConfig(productId: number): Promise<RazerBaseDeviceConfig | null> {
	const hex = productId.toString(16).padStart(4, '0')

	// lazy loading
	const configloader = RAZER_DEVICE_CONFIGS[`/src/driver/razer/devices/${hex}.ts`] as () =>
		| Promise<{ default: RazerBaseDeviceConfig }>
		| undefined
	if (!configloader) return null

	const conf = await configloader()
	if (!conf) return null

	return conf.default
}

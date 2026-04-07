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

export async function getHyperpollingSupportList(this: RazerDeviceConfig<'accessory'>, instance: HIDDevice) {
	const res = await fetch('/razer/hyperpolling_device.json')
	const data = (await res.json()) as { productId: number; type: RazerDeviceType; name: string }[]

	const firmwareVersion = await this.getFirmware(instance)
	const major = Number(firmwareVersion.split('.')[0])
	if (isNaN(major) || major < 1) {
		throw new Error(`Invalid firmware version: ${firmwareVersion}`)
	}

	// Major version 3 use "keyboard" , while major version 1 and 2 use "mouse"
	const deviceType = major === 3 ? 'keyboard' : 'mouse'

	return data.filter((d) => d.type === deviceType).map((d) => ({ productId: d.productId, name: d.name }))
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

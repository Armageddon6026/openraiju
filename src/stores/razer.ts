import { RAZER_SUPPORTED_DEVICES, RAZER_VENDOR_ID } from '@/driver/razer/define'

export const useDeviceStore = defineStore('razerStore', () => {
	const devicesMap = ref(new Map<string, RazerDevice>())

	async function getConfig(productId: number): Promise<RazerDeviceConfig | null> {
		const hex = productId.toString(16).padStart(4, '0')

		// lazy loading
		const loader = RAZER_SUPPORTED_DEVICES[`/src/driver/razer/devices/${hex}.ts`] as () =>
			| Promise<{ default: RazerDeviceConfig }>
			| undefined
		if (!loader) return null

		const mod = await loader()
		if (!mod) return null

		return mod.default
	}

	async function addDevice(device: RazerDevice) {
		const sn = await device.config.getSerial(device.instance)
		if (!sn) {
			throw new Error('No serial number found')
		}

		// generate ID
		const id = `${RAZER_VENDOR_ID}-${device.config.productId}-${sn}`

		devicesMap.value.set(id, device)
	}

	function removeDevice(instanceId: string) {
		devicesMap.value.delete(instanceId)
	}

	function getDevice(instanceId: string): RazerDevice | undefined {
		return devicesMap.value.get(instanceId)
	}

	return { devicesMap, addDevice, removeDevice, getDevice, getConfig }
})

if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(useDeviceStore, import.meta.hot))
}

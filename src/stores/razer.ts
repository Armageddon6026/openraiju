import { RAZER_DEVICE_CONFIGS, RAZER_VENDOR_ID } from '@/driver/razer/define'

export const useDeviceStore = defineStore('razerStore', () => {
	const devicesMap = ref(new Map<string, RazerDevice>())

	const deviceIterator = computed(() => Array.from(devicesMap.value.entries()))
	const hasDevices = computed(() => devicesMap.value.size > 0)

	async function getConfig(productId: number): Promise<RazerBaseDeviceConfig | null> {
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

	return { deviceIterator, hasDevices, addDevice, removeDevice, getDevice, getConfig }
})

if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(useDeviceStore, import.meta.hot))
}

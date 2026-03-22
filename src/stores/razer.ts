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

	async function addDevice(device: RazerDevice<RazerBaseDeviceConfig>) {
		const sn = await device.config.getSerial(device.instance)
		if (!sn) {
			throw new Error('No serial number found')
		}

		// generate ID
		const id = `${RAZER_VENDOR_ID}-${device.config.productId}-${sn}`

		devicesMap.value.set(id, device)

		// check for paired sub devices
		if (!device.config.getPairedDevices) {
			return
		}
		const pids = await device.config.getPairedDevices(device.instance)
		for (const pid of pids) {
			if (pid === device.config.productId) {
				continue
			}

			try {
				const pairConf = await getConfig(pid)
				if (!pairConf) {
					continue
				}

				const pairSn = await pairConf.getSerial(device.instance)
				if (!pairSn) {
					throw new Error('No serial number found')
				}

				const pairId = `${RAZER_VENDOR_ID}-${pid}-${pairSn}`
				devicesMap.value.set(pairId, {
					instance: device.instance,
					config: pairConf,
				})
			} catch (e) {
				console.warn(`Failed to add paired device with PID ${pid}:`, e)
				continue
			}
		}
	}

	function removeDevice(instanceId: string) {
		devicesMap.value.delete(instanceId)
	}

	function getDevice(instanceId: string): RazerDevice<RazerBaseDeviceConfig> | undefined {
		return devicesMap.value.get(instanceId)
	}

	return { deviceIterator, hasDevices, addDevice, removeDevice, getDevice, getConfig }
})

if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(useDeviceStore, import.meta.hot))
}

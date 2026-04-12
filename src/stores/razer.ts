import { RAZER_DEVICE_CONFIGS, RAZER_VENDOR_ID } from '@/driver/razer/define'

export const useDeviceStore = defineStore('razerStore', () => {
	const devicesMap = ref(new Map<string, RazerDevice>())
	const parentToChildren = ref(new Map<string, Set<string>>())

	const deviceEntries = computed(() => Array.from(devicesMap.value.entries()))
	const hasDevices = computed(() => devicesMap.value.size > 0)

	async function loadDeviceConfig(productId: number): Promise<RazerBaseDeviceConfig | null> {
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

	async function registerDevice(instance: HIDDevice) {
		const deviceConfig = await loadDeviceConfig(instance.productId)
		if (!deviceConfig) {
			throw new Error(`Unsupported device with PID ${instance.productId}`)
		}

		const sn = await deviceConfig.getSerial(instance)
		if (!sn) {
			throw new Error('No serial number found')
		}

		const instanceId = `${RAZER_VENDOR_ID}-${instance.productId}-${sn}`
		devicesMap.value.set(instanceId, {
			config: deviceConfig,
			instance: instance,
			status: {},
		})

		await registerSubDevices(instanceId)
	}

	async function registerSubDevices(instanceId: string) {
		const device = devicesMap.value.get(instanceId)
		if (!device) {
			return
		}

		const deviceConfig = device.config
		// check for paired sub devices
		if (!deviceConfig.getPairedDevices) {
			return
		}
		const pids = await deviceConfig.getPairedDevices(device.instance)
		for (const pid of pids) {
			if (pid === deviceConfig.productId) {
				continue
			}

			const subDeviceConfig = await loadDeviceConfig(pid)
			if (!subDeviceConfig) {
				continue
			}

			const subSn = await subDeviceConfig.getSerial(device.instance)
			if (!subSn) {
				throw new Error('No serial number found')
			}

			// overwrite child device config with parent device config if supported some features like hyperspeed.
			if (deviceConfig.setPairDeviceConfig) {
				await deviceConfig.setPairDeviceConfig(subDeviceConfig)
			}

			const subInstanceId = `${RAZER_VENDOR_ID}-${pid}-${subSn}`
			devicesMap.value.set(subInstanceId, {
				instance: device.instance,
				config: subDeviceConfig,
				status: {
					isSubDevice: true,
				},
			})

			// link parent and child devices
			if (!parentToChildren.value.has(instanceId)) {
				parentToChildren.value.set(instanceId, new Set())
			}
			parentToChildren.value.get(instanceId)!.add(subInstanceId)
		}
	}

	async function unregisterDevice(instanceId: string) {
		const device = devicesMap.value.get(instanceId)
		if (!device) {
			return
		}

		devicesMap.value.delete(instanceId)

		if (device.status.isSubDevice) {
			return
		}

		if (device.instance.opened) {
			await device.instance.close()
		}

		await device.instance.forget()

		// remove child devices
		const children = parentToChildren.value.get(instanceId)
		if (children) {
			for (const childId of children) {
				await unregisterDevice(childId)
			}
			parentToChildren.value.delete(instanceId)
		}
	}

	function getDevice(instanceId: string): RazerDevice<RazerBaseDeviceConfig> | undefined {
		return devicesMap.value.get(instanceId)
	}

	return {
		deviceEntries,
		hasDevices,
		loadDeviceConfig,
		getDevice,
		registerDevice,
		registerSubDevices,
		unregisterDevice,
	}
})

if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(useDeviceStore, import.meta.hot))
}

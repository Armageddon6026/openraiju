import { RAZER_DEVICE_CONFIGS, RAZER_VENDOR_ID } from '@/driver/razer/define'

export const useDeviceStore = defineStore('razerStore', () => {
	const devicesMap = ref(new Map<string, RazerDevice>())
	const parentToChildren = ref(new Map<string, Set<string>>())

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

	async function addDevice(device: RazerDevice<RazerBaseDeviceConfig>): Promise<string> {
		const sn = await device.config.getSerial(device.instance)
		if (!sn) {
			throw new Error('No serial number found')
		}

		// generate ID
		const did = `${RAZER_VENDOR_ID}-${device.config.productId}-${sn}`

		devicesMap.value.set(did, device)

		// check for paired sub devices
		if (!device.config.getPairedDevices) {
			return did
		}
		const pids = await device.config.getPairedDevices(device.instance)
		for (const pid of pids) {
			if (pid === device.config.productId) {
				continue
			}

			const pairConf = await getConfig(pid)
			if (!pairConf) {
				continue
			}

			// copy the wait_min value from the parent device to ensure proper pairing behavior
			pairConf.hardware.wait_min = device.config.hardware.wait_min

			// hyperpolling dongle, Enable hyperpolling mode
			const isHyperPolling =
				device.config.productId === 0x00b3 && (pairConf.ui.type === 'mouse' || pairConf.ui.type === 'keyboard')

			// due to sub devices being paired to the same host device, overwrite the pairing related functions to prevent confusion
			pairConf.getPairedDevices = undefined
			pairConf.pairDevice = undefined
			pairConf.unpairDevice = undefined

			try {
				const subdid = await addDevice({
					instance: device.instance,
					config: pairConf,
					status: {
						isHyperpolling: isHyperPolling,
						isSubDevice: true,
					},
				})

				// link parent and child devices
				if (!parentToChildren.value.has(did)) {
					parentToChildren.value.set(did, new Set())
				}
				parentToChildren.value.get(did)!.add(subdid)
			} catch (e) {
				console.warn(`Failed to add paired device with PID ${pid}:`, e)
				continue
			}
		}

		return did
	}

	async function removeDevice(instanceId: string) {
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
				await removeDevice(childId)
			}
			parentToChildren.value.delete(instanceId)
		}
	}

	function getDevice(instanceId: string): RazerDevice<RazerBaseDeviceConfig> | undefined {
		return devicesMap.value.get(instanceId)
	}

	return { deviceIterator, hasDevices, addDevice, removeDevice, getDevice, getConfig }
})

if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(useDeviceStore, import.meta.hot))
}

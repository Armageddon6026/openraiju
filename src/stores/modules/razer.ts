export const useDeviceStore = defineStore('razerStore', () => {
	const devicesMap = ref(new Map<string, RazerDevice>())

	async function addDevice(conf: RazerDeviceConfig, handler: HIDDevice) {
		const sn = await conf.getSerial(handler)
		if (!sn) {
			throw new Error('No serial number found')
		}

		// generate ID
		const instanceId = `${conf.vendorId}-${conf.productId}-${sn}`

		const device: RazerDevice = {
			config: conf,
			handler: handler,
		}

		// if device has battery
		if (device.config.getBatteryLevel) {
			device.BatteryLevel = await device.config.getBatteryLevel(device.handler)
		}

		devicesMap.value.set(instanceId, device)
	}

	function removeDevice(instanceId: string) {
		devicesMap.value.delete(instanceId)
	}

	function getDeviceById(instanceId: string): RazerDevice | undefined {
		return devicesMap.value.get(instanceId)
	}

	return { devicesMap, addDevice, removeDevice, getDeviceById }
})

if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(useDeviceStore, import.meta.hot))
}

export const useDeviceStore = defineStore('device', () => {
	const devicesMap = ref(new Map<string, HIDDeviceData>())

	async function addDevice(conf: HIDDeviceConfig, handle: HIDDevice) {
		const sn = await conf.getSerial(handle)
		if (!sn) {
			throw new Error('No serial number found')
		}

		// generate ID
		const instanceId = `${conf.vendorId}-${conf.productId}-${sn}`

		const deviceData: HIDDeviceData = {
			config: conf,
			handle: handle,
		}

		// if device has battery
		if (conf.getBatteryLevel) {
			deviceData.BatteryLevel = await conf.getBatteryLevel(handle)
		}

		devicesMap.value.set(instanceId, deviceData)
	}

	function removeDevice(instanceId: string) {
		devicesMap.value.delete(instanceId)
	}

	function getDeviceById(instanceId: string): HIDDeviceData | undefined {
		return devicesMap.value.get(instanceId)
	}

	return { devicesMap, addDevice, removeDevice, getDeviceById }
})

if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(useDeviceStore, import.meta.hot))
}

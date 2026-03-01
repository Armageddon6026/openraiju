export const useDeviceStore = defineStore('device', () => {
	const devicesMap = ref(new Map<string, HIDDeviceData>())
	let _idCounter = 0

	async function addDevice(conf: HIDDeviceConfig, handle: HIDDevice) {
		// generate ID "dev-1", "dev-2"
		const instanceId = `dev-${_idCounter++}`

		const deviceData: HIDDeviceData = {
			config: conf,
			handle: handle,
		}

		// if device has battery
		if (conf.getBatteryLevel) {
			deviceData.BatteryLevel = await conf.getBatteryLevel(handle)
		}

		devicesMap.value.set(instanceId, deviceData)
		return instanceId
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

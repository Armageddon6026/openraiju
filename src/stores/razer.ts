export const useDeviceStore = defineStore('razerStore', () => {
	const devicesMap = ref(new Map<string, RazerDevice>())

	async function addDevice(device: RazerDevice) {
		const sn = await device.config.getSerial(device.instance)
		if (!sn) {
			throw new Error('No serial number found')
		}

		// generate ID
		const id = `${device.config.vendorId}-${device.config.productId}-${sn}`

		devicesMap.value.set(id, device)
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

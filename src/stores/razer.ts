import { RAZER_VENDOR_ID } from '@/driver/razer/define'
import { getRazerDeviceConfig } from '@/driver/razer/helper'

export const useDeviceStore = defineStore('razerStore', () => {
	const devicesMap = ref(new Map<string, RazerDevice>())
	const parentToChildren = ref(new Map<string, Set<string>>())

	const deviceIterator = computed(() => Array.from(devicesMap.value.entries()))
	const hasDevices = computed(() => devicesMap.value.size > 0)

	async function addDevice(instance: HIDDevice) {
		const deviceConfig = await getRazerDeviceConfig(instance.productId)
		if (!deviceConfig) {
			throw new Error(`Unsupported device with PID ${instance.productId}`)
		}

		const sn = await deviceConfig.getSerial(instance)
		if (!sn) {
			throw new Error('No serial number found')
		}

		const did = `${RAZER_VENDOR_ID}-${instance.productId}-${sn}`
		devicesMap.value.set(did, {
			config: deviceConfig,
			instance: instance,
			status: {},
		})

		// check for paired sub devices
		if (!deviceConfig.getPairedDevices) {
			return
		}
		const pids = await deviceConfig.getPairedDevices(instance)
		for (const pid of pids) {
			if (pid === deviceConfig.productId) {
				continue
			}

			const subDeviceConfig = await getRazerDeviceConfig(pid)
			if (!subDeviceConfig) {
				continue
			}

			// copy the wait_min value from the parent device to ensure proper pairing behavior
			subDeviceConfig.hardware.wait_min = deviceConfig.hardware.wait_min

			// hyperpolling dongle, Enable hyperpolling mode
			if (
				instance.productId === 0x00b3 &&
				(subDeviceConfig.ui.type === 'mouse' || subDeviceConfig.ui.type === 'keyboard')
			) {
				subDeviceConfig.hardware.max_polling_rate = subDeviceConfig.ui.type === 'mouse' ? 8000 : 4000
			}

			// due to sub devices being paired to the same host device, overwrite the pairing related functions to prevent confusion
			subDeviceConfig.getPairedDevices = undefined
			subDeviceConfig.pairDevice = undefined

			const subdid = `${RAZER_VENDOR_ID}-${pid}-${sn}`
			devicesMap.value.set(subdid, {
				instance: instance,
				config: subDeviceConfig,
				status: {
					isSubDevice: true,
				},
			})

			// link parent and child devices
			if (!parentToChildren.value.has(did)) {
				parentToChildren.value.set(did, new Set())
			}
			parentToChildren.value.get(did)!.add(subdid)
		}
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

	return { deviceIterator, hasDevices, addDevice, removeDevice, getDevice }
})

if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(useDeviceStore, import.meta.hot))
}

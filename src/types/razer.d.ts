declare interface RazerDevice {
	readonly config: RazerDeviceConfig
	readonly instance: HIDDevice
}

declare interface RazerDeviceConfig extends RazerDeviceFeature {
	readonly productId: number
	readonly ui: {
		name: string
		type: 'keyboard' | 'mouse' | 'headset' | 'accessory'
		image: string
	}
	readonly hardware: {
		wait_min: number
		transaction_id: number
		optical_sensor?: RazerOpticalSensor
		hyper_polling?: boolean // Indicates whether the device supports 8K polling rate.
	}
}

declare interface RazerOpticalSensor {
	readonly max_dpi: number
	readonly dpi_step: number
	readonly smart_tracking_step: 3 | 2
	readonly motion_sync?: boolean
	readonly asymmetric_cutoff_levels?: 26
	readonly sensitivity_matcher?: boolean
	readonly dynamic_sensitivity?: boolean
	readonly rotation?: boolean
}

declare interface DpiStagesInfo {
	ActivateID: number
	DpiStages: DpiInfo[]
}

declare interface DpiInfo {
	ID: number
	X: number
	Y: number
}

declare interface RazerDeviceFeature {
	getSerial(this: RazerDeviceConfig, instance: HIDDevice): Promise<string>
	getFirmware(this: RazerDeviceConfig, instance: HIDDevice): Promise<string>
	// option
	getBatteryLevel?: (this: RazerDeviceConfig, instance: HIDDevice) => Promise<number>
	getChargeState?: (this: RazerDeviceConfig, instance: HIDDevice) => Promise<boolean>
	getDpiStages?: (this: RazerDeviceConfig, instance: HIDDevice) => Promise<DpiStagesInfo>
	setDpiStages?: (this: RazerDeviceConfig, instance: HIDDevice, dpi: DpiStagesInfo) => Promise<void>
	getPollingRate?: (this: RazerDeviceConfig, instance: HIDDevice) => Promise<number>
	setPollingRate?: (this: RazerDeviceConfig, instance: HIDDevice, pollingRate: number) => Promise<void>
	getTrackingStep?: (this: RazerDeviceConfig, instance: HIDDevice) => Promise<number>
	pairHyperpollingDevice?: (this: RazerDeviceConfig, instance: HIDDevice, pid: number) => Promise<void>
	unpairHyperpollingDevice?: (this: RazerDeviceConfig, instance: HIDDevice, pid: number) => Promise<void>
	getPairDevices?: (this: RazerDeviceConfig, instance: HIDDevice) => Promise<number[]>
}

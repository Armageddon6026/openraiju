declare interface RazerDevice {
	config: RazerDeviceConfig
	handler: HIDDevice
	BatteryLevel?: number
}

declare interface RazerDeviceConfig extends HIDDeviceFilter, RazerDeviceFeature {
	readonly ui: {
		name: string
		type: 'keyboard' | 'mouse' | 'headset'
		image: string
	}
	readonly hardware: {
		wait_min: number
		transaction_id: number
		optical_sensor: RazerOpticalSensor
		HyperPolling?: boolean // Indicates whether the device supports 8K polling rate.
	}
}

declare interface RazerOpticalSensor {
	max_dpi: number
	dpi_step: number
	smart_tracking_step: 3 | 2
	motion_sync?: boolean
	asymmetric_cutoff_levels?: 26
	sensitivity_matcher?: boolean
	dynamic_sensitivity?: boolean
	rotation?: boolean
}

declare interface MouseDpiInfo {
	ActivateID: number
	DpiStages: {
		ID: number
		X: number
		Y: number
	}[]
}

declare interface RazerDeviceFeature {
	getSerial(this: RazerDeviceConfig, handler: HIDDevice): Promise<string>
	// option
	getBatteryLevel?: (this: RazerDeviceConfig, handler: HIDDevice) => Promise<number>
	getChargeState?: (this: RazerDeviceConfig, device: HIDDevice) => Promise<boolean>
	getDpiStages?: (this: RazerDeviceConfig, handler: HIDDevice) => Promise<MouseDpiInfo>
	setDpiStages?: (this: RazerDeviceConfig, handler: HIDDevice, dpi: MouseDpiInfo) => Promise<void>
	getPollingRate?: (this: RazerDeviceConfig, handler: HIDDevice) => Promise<number>
	setPollingRate?: (this: RazerDeviceConfig, device: HIDDevice, pollingRate: number) => Promise<void>
}

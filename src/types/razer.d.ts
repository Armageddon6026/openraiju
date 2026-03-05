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
		HyperPolling?: boolean // Indicates whether the device supports 8K polling rate.
	}
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
	getDpiStages?: (this: RazerDeviceConfig, handler: HIDDevice) => Promise<MouseDpiInfo>
	setDpiStages?: (this: RazerDeviceConfig, handler: HIDDevice, dpi: MouseDpiInfo) => Promise<void>
	getPollingRate?: (this: RazerDeviceConfig, handler: HIDDevice) => Promise<number>
}

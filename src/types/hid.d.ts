declare interface HIDDeviceConfig extends HIDDeviceFilter, HIDDeviceFeature {
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

declare interface HIDDeviceData {
	config: HIDDeviceConfig
	handle: HIDDevice
	BatteryLevel?: number
}

declare interface MouseDpiInfo {
	ActivateID: number
	DpiStages: Dpi[]
}

declare interface Dpi {
	ID: number
	X: number
	Y: number
}

declare interface HIDDeviceFeature {
	getSerial(this: HIDDeviceConfig, device: HIDDevice): Promise<string>
	// option
	getBatteryLevel?: (this: HIDDeviceConfig, device: HIDDevice) => Promise<number>
	getDpiStages?: (this: HIDDeviceConfig, device: HIDDevice) => Promise<MouseDpiInfo>
	setDpiStages?: (this: HIDDeviceConfig, device: HIDDevice, dpi: MouseDpiInfo) => Promise<void>
	getPollingRate?: (this: HIDDeviceConfig, device: HIDDevice) => Promise<number>
}

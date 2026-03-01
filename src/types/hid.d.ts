declare interface HIDDeviceConfig extends HIDDeviceFilter, HIDDeviceFeature {
	readonly ui: {
		name: string
		type: 'keyboard' | 'mouse' | 'headset'
		image: string
	}
	readonly hardware: {
		transaction_id: number
		wait_min: number
	}
}

declare interface HIDDeviceFeature {
	getBatteryLevel?: (this: HIDDeviceConfig, device: HIDDevice) => Promise<number>
	getDPIStages?: (this: HIDDeviceConfig, device: HIDDevice) => Promise<MouseDpiInfo>
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

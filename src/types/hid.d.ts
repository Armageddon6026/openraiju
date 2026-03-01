declare interface HIDDeviceConfig extends HIDDeviceFilter {
	readonly ui: {
		name: string
		type: 'Keyboard' | 'Mouse' | 'Headset'
		image: string
	}
	readonly hardware: {
		transaction_id: number
		wait_min: number
	}
	// option
	getBatteryLevel?: (this: HIDDeviceConfig, device: HIDDevice) => Promise<number>
}

declare interface HIDDeviceData {
	config: HIDDeviceConfig
	handle: HIDDevice
	BatteryLevel?: number
}

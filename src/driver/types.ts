export interface HIDDeviceConfig {
	filter: HIDDeviceFilter // WebHID 規範需要的過濾器
	ui: {
		name: string
		type: 'Keyboard' | 'Mouse' | 'Headset'
		image: string
	}
	// option
	features?: {
		getBatteryLevel?: (device: HIDDevice) => Promise<number>
	}
}

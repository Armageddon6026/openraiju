declare interface RazerDevice<TConfig extends RazerDeviceConfig = RazerDeviceConfig> {
	readonly config: TConfig
	readonly instance: HIDDevice
	readonly status: {
		isSubDevice?: boolean
		isHyperpolling?: boolean
	}
}

type DeviceWith<K extends keyof RazerDeviceFeature> = RazerDevice<
	RazerBaseDeviceConfig & Required<Pick<RazerDeviceFeature, K>>
>

type TypedDeviceWith<T extends RazerDeviceType, K extends keyof RazerDeviceFeature> = RazerDevice<
	RazerDeviceConfig<T> & Required<Pick<RazerDeviceFeature, K>>
>

type RazerDeviceType = 'keyboard' | 'mouse' | 'accessory'

declare interface RazerBaseDeviceConfig extends RazerDeviceFeature {
	readonly productId: number
	readonly ui: {
		name: string
		type: RazerDeviceType
		image: string
	}
	readonly hardware: {
		wait_min: number
		/**
		 * Transaction ID (Index 1): Defines the target routing of the HID report.
		 * - 0xFF-0xE0: Other command (Hyperpolling Dongle etc.).
		 * - 0x80-0xDF: Routes command to the connected Keyboard.
		 * - 0x00-0x7F: Routes command to the connected Mouse.
		 */
		transaction_id: number
	}
}

type RazerHardwareMap = {
	keyboard: {
		max_polling_rate?: {
			native: number
			hyper?: number // Indicates whether the device supports 8K polling rate.
		}
	}
	mouse: {
		max_dpi_stages: number
		max_polling_rate: {
			native: number
			hyper?: number
		}
		optical_sensor: RazerOpticalSensor
	}
}

type RazerDeviceConfig<T extends RazerDeviceType> = RazerBaseDeviceConfig & {
	ui: {
		name: string
		type: T
		image: string
	}
	hardware: RazerHardwareMap[T]
}

declare interface RazerOpticalSensor {
	readonly max_dpi: number
	readonly dpi_step: number
	readonly max_tracking_step: 2 | 1
	readonly motion_sync?: boolean
	readonly asymmetric_cutoff_levels?: 26
	readonly sensitivity_matcher?: boolean
	readonly dynamic_sensitivity?: boolean
	readonly rotation?: boolean
}

declare interface RazerDpiStageInfo {
	ActivateID: number
	DpiStages: {
		ID: number
		X: number
		Y: number
	}[]
}

declare interface RazerSnapTapInfo {
	Enabled: boolean
	KeyPair: {
		Key1: number
		Key2: number
	}[]
}

declare interface RazerDeviceFeature {
	getSerial(this: RazerDeviceConfig, instance: HIDDevice): Promise<string>
	getFirmware(this: RazerDeviceConfig, instance: HIDDevice): Promise<string>
	// option
	getBatteryLevel?: (this: RazerDeviceConfig, instance: HIDDevice) => Promise<number>
	getChargeState?: (this: RazerDeviceConfig, instance: HIDDevice) => Promise<boolean>
	getLowBatteryThreshold?: (this: RazerBaseDeviceConfig, instance: HIDDevice) => Promise<number>
	setLowBatteryThreshold?: (this: RazerBaseDeviceConfig, instance: HIDDevice, threshold: number) => Promise<void>
	getIdleTime?: (this: RazerBaseDeviceConfig, instance: HIDDevice) => Promise<number>
	setIdleTime?: (this: RazerBaseDeviceConfig, instance: HIDDevice, minutes: number) => Promise<void>
	getDpiStages?: (this: RazerDeviceConfig, instance: HIDDevice) => Promise<RazerDpiStageInfo>
	setDpiStages?: (this: RazerDeviceConfig, instance: HIDDevice, dpi: RazerDpiStageInfo) => Promise<void>
	setActivateDpiStage?: (this: RazerDeviceConfig, instance: HIDDevice, stageId: number) => Promise<void>
	getTrackingStep?: (this: RazerDeviceConfig, instance: HIDDevice) => Promise<number>
	setTrackingStep?: (this: RazerDeviceConfig, instance: HIDDevice, step: number) => Promise<void>
	getPollingRate?: (this: RazerDeviceConfig, instance: HIDDevice, isHyperpolling: boolean) => Promise<number>
	setPollingRate?: (
		this: RazerDeviceConfig,
		instance: HIDDevice,
		pollingRate: number,
		isHyperpolling: boolean,
	) => Promise<void>
	pairDevice?: (
		this: RazerDeviceConfig,
		instance: HIDDevice,
		transaction_id: number,
		pid: number,
	) => Promise<() => Promise<void>>
	unpairDevice?: (this: RazerDeviceConfig, instance: HIDDevice, pid: number) => Promise<void>
	getPairedDevices?: (this: RazerDeviceConfig, instance: HIDDevice) => Promise<number[]>
	getSnapTapSetting?: (this: RazerDeviceConfig, instance: HIDDevice) => Promise<RazerSnapTapInfo>
	setSnapTapSetting?: (this: RazerDeviceConfig, instance: HIDDevice, info: RazerSnapTapInfo) => Promise<void>
}

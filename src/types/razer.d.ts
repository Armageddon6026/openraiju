declare interface RazerDevice<TConfig extends RazerDeviceConfig = RazerDeviceConfig> {
	readonly config: TConfig
	readonly instance: HIDDevice
}

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
		transaction_id: number
	}
}

type RazerHardwareMap = {
	keyboard: {
		hyper_polling: boolean // Indicates whether the device supports 8K polling rate.
	}
	mouse: {
		max_dpi_stages: number
		optical_sensor: RazerOpticalSensor
		hyper_polling: boolean
		transaction_device_id: number
	}
	accessory: {
		transaction_device_id: number
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
	readonly smart_tracking_step: 3 | 2
	readonly motion_sync?: boolean
	readonly asymmetric_cutoff_levels?: 26
	readonly sensitivity_matcher?: boolean
	readonly dynamic_sensitivity?: boolean
	readonly rotation?: boolean
}

declare interface RazerDpiStageInfo {
	ActivateID: number
	DpiStages: RazerDpiInfo[]
}

declare interface RazerDpiInfo {
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
	getLowBatteryThreshold?: (this: RazerBaseDeviceConfig, instance: HIDDevice) => Promise<number>
	setLowBatteryThreshold?: (this: RazerBaseDeviceConfig, instance: HIDDevice, threshold: number) => Promise<void>
	getIdleTime?: (this: RazerBaseDeviceConfig, instance: HIDDevice) => Promise<number>
	setIdleTime?: (this: RazerBaseDeviceConfig, instance: HIDDevice, minutes: number) => Promise<void>
	getDpiStages?: (this: RazerDeviceConfig, instance: HIDDevice) => Promise<RazerDpiStageInfo>
	setDpiStages?: (this: RazerDeviceConfig, instance: HIDDevice, dpi: RazerDpiStageInfo) => Promise<void>
	setActivateDpiStage?: (this: RazerDeviceConfig, instance: HIDDevice, stageId: number) => Promise<void>
	getPollingRate?: (this: RazerDeviceConfig, instance: HIDDevice) => Promise<number>
	setPollingRate?: (this: RazerDeviceConfig, instance: HIDDevice, pollingRate: number) => Promise<void>
	pairHyperpollingDevice?: (this: RazerDeviceConfig, instance: HIDDevice, pid: number) => Promise<void>
	unpairHyperpollingDevice?: (this: RazerDeviceConfig, instance: HIDDevice, pid: number) => Promise<void>
	getPairDevices?: (this: RazerDeviceConfig, instance: HIDDevice) => Promise<number[]>
}

type DeviceWith<K extends keyof RazerDeviceFeature> = RazerDevice<
	RazerBaseDeviceConfig & Required<Pick<RazerDeviceFeature, K>>
>

type TypedDeviceWith<T extends RazerDeviceType, K extends keyof RazerDeviceFeature> = RazerDevice<
	RazerDeviceConfig<T> & Required<Pick<RazerDeviceFeature, K>>
>

// ── capability helpers ────────────────────────────────────────────
function deviceHasFeatures<K extends keyof RazerDeviceFeature>(
	device: RazerDevice<RazerBaseDeviceConfig> | undefined,
	features: readonly K[],
): device is DeviceWith<K> {
	if (!device) return false
	return features.every((k) => typeof (device.config as unknown as Record<string, unknown>)[k] === 'function')
}

function deviceHasTypeAndFeatures<T extends RazerDeviceType, K extends keyof RazerDeviceFeature>(
	device: RazerDevice<RazerBaseDeviceConfig> | undefined,
	type: T,
	features: readonly K[],
): device is TypedDeviceWith<T, K> {
	if (!device || device.config.ui.type !== type) return false
	return features.every((k) => typeof (device.config as unknown as Record<string, unknown>)[k] === 'function')
}

export function useCapabilityDevice<K extends keyof RazerDeviceFeature>(
	d: RazerDevice<RazerBaseDeviceConfig> | undefined,
	features: readonly K[],
) {
	return computed((): DeviceWith<K> | undefined => {
		return deviceHasFeatures(d, features) ? d : undefined
	})
}

export function useTypedCapabilityDevice<T extends RazerDeviceType, K extends keyof RazerDeviceFeature>(
	type: T,
	d: RazerDevice<RazerBaseDeviceConfig> | undefined,
	features: readonly K[],
) {
	return computed((): TypedDeviceWith<T, K> | undefined => {
		return deviceHasTypeAndFeatures(d, type, features) ? d : undefined
	})
}

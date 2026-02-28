import type { HIDDeviceConfig } from './types'
import { RAZER_MOUSE_DEVICES } from './razer/mouse'

// 未來可以輕鬆加入 [ ...LOGITECH_DEVICES, ...CORSAIR_DEVICES ]
export const SUPPORTED_DEVICE_LIST: HIDDeviceConfig[] = [...RAZER_MOUSE_DEVICES]

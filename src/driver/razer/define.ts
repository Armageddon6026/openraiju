export const RAZER_DEVICE_CONFIGS = import.meta.glob('@/driver/razer/devices/*.ts')

export const RAZER_VENDOR_ID = 0x1532

export const RAZER_OPTICAL_SENSORS = {
	focus_pro_45K_gen2: {
		max_dpi: 45000,
		dpi_step: 1,
		max_tracking_step: 2,
		asymmetric_cutoff_levels: 26,
		sensitivity_matcher: true,
		dynamic_sensitivity: true,
		rotation: true,
	},

	focus_pro_35K_gen2: {
		max_dpi: 35000,
		dpi_step: 1,
		max_tracking_step: 2,
		asymmetric_cutoff_levels: 26,
		sensitivity_matcher: true,
	},

	focus_pro_30K: {
		max_dpi: 30000,
		dpi_step: 50,
		max_tracking_step: 2,
		asymmetric_cutoff_levels: 26,
	},

	focus_X_26K: {
		max_dpi: 26000,
		dpi_step: 50,
		max_tracking_step: 1,
	},
} as const satisfies Record<string, RazerOpticalSensor>

export const RAZER_SENSOR_MODEL = {
	none: 0,
	lift_detection_sensor: 1,
	hand_move_L2R_sensor: 2,
	hand_move_R2L_sensor: 3,
	avago_proximity_sensor: 4,
	philips_proximity_sensor: 5,
}

export const RAZER_KEY_MAP: Record<string, number> = {
	// Number keys
	Backquote: 0, // KEY_ID_NULL
	Digit1: 2, // KEY_ID_1
	Digit2: 3, // KEY_ID_2
	Digit3: 4, // KEY_ID_3
	Digit4: 5, // KEY_ID_4
	Digit5: 6, // KEY_ID_5
	Digit6: 7, // KEY_ID_6
	Digit7: 8, // KEY_ID_7
	Digit8: 9, // KEY_ID_8
	Digit9: 10, // KEY_ID_9
	Digit0: 11, // KEY_ID_0
	Minus: 12, // KEY_ID_MIS
	Equal: 13, // KEY_ID_EQU
	Backspace: 15, // KEY_ID_BSP
	// Top row letters
	Tab: 16, // KEY_ID_TAB
	KeyQ: 17, // KEY_ID_q
	KeyW: 18, // KEY_ID_w
	KeyE: 19, // KEY_ID_e
	KeyR: 20, // KEY_ID_r
	KeyT: 21, // KEY_ID_t
	KeyY: 22, // KEY_ID_y
	KeyU: 23, // KEY_ID_u
	KeyI: 24, // KEY_ID_i
	KeyO: 25, // KEY_ID_o
	KeyP: 26, // KEY_ID_p
	BracketLeft: 27, // KEY_ID_OQO
	BracketRight: 28, // KEY_ID_EQO
	Backslash: 29, // KEY_ID_BSL
	// Home row
	CapsLock: 30, // KEY_ID_CAP
	KeyA: 31, // KEY_ID_a
	KeyS: 32, // KEY_ID_s
	KeyD: 33, // KEY_ID_d
	KeyF: 34, // KEY_ID_f
	KeyG: 35, // KEY_ID_g
	KeyH: 36, // KEY_ID_h
	KeyJ: 37, // KEY_ID_j
	KeyK: 38, // KEY_ID_k
	KeyL: 39, // KEY_ID_l
	Semicolon: 40, // KEY_ID_COL
	Quote: 41, // KEY_ID_CC
	Enter: 43, // KEY_ID_RTN
	// Bottom row
	ShiftLeft: 44, // KEY_ID_LEFT_SHIFT
	KeyZ: 46, // KEY_ID_z
	KeyX: 47, // KEY_ID_x
	KeyC: 48, // KEY_ID_c
	KeyV: 49, // KEY_ID_v
	KeyB: 50, // KEY_ID_b
	KeyN: 51, // KEY_ID_n
	KeyM: 52, // KEY_ID_m
	Comma: 53, // KEY_ID_CMA
	Period: 54, // KEY_ID_DOT
	Slash: 55, // KEY_ID_SL
	ShiftRight: 57, // KEY_ID_RIGHT_SHIFT
	// Modifier keys
	ControlLeft: 58, // KEY_ID_LCTRL
	MetaLeft: 59, // KEY_ID_RIGHT_WIN
	AltLeft: 60, // KEY_ID_LALT
	Space: 61, // KEY_ID_SPC
	AltRight: 62, // KEY_ID_RALT
	ControlRight: 64, // KEY_ID_RCTRL
	// Navigation
	Insert: 75, // KEY_ID_INS
	Delete: 76, // KEY_ID_DEL
	ArrowLeft: 79, // KEY_ID_LA
	Home: 80, // KEY_ID_HOME
	End: 81, // KEY_ID_END
	ArrowUp: 83, // KEY_ID_UA
	ArrowDown: 84, // KEY_ID_DA
	PageUp: 85, // KEY_ID_PUP
	PageDown: 86, // KEY_ID_PDN
	ArrowRight: 89, // KEY_ID_RA
	// Numpad
	NumLock: 90, // PAD_ID_NUM
	Numpad7: 91, // PAD_ID_7
	Numpad4: 92, // PAD_ID_4
	Numpad1: 93, // PAD_ID_1
	NumpadDivide: 95, // PAD_ID_SL
	Numpad8: 96, // PAD_ID_8
	Numpad5: 97, // PAD_ID_5
	Numpad2: 98, // PAD_ID_2
	Numpad0: 99, // PAD_ID_0
	NumpadMultiply: 100, // PAD_ID_MUL
	Numpad9: 101, // PAD_ID_9
	Numpad6: 102, // PAD_ID_6
	Numpad3: 103, // PAD_ID_3
	NumpadDecimal: 104, // PAD_ID_DEL
	NumpadSubtract: 105, // PAD_ID_SUB
	NumpadAdd: 106, // PAD_ID_PLUS
	NumpadEnter: 108, // PAD_ID_ENT
	// Function keys
	Escape: 110, // KEY_ID_ESC
	F1: 112, // KEY_ID_F1
	F2: 113, // KEY_ID_F2
	F3: 114, // KEY_ID_F3
	F4: 115, // KEY_ID_F4
	F5: 116, // KEY_ID_F5
	F6: 117, // KEY_ID_F6
	F7: 118, // KEY_ID_F7
	F8: 119, // KEY_ID_F8
	F9: 120, // KEY_ID_F9
	F10: 121, // KEY_ID_F10
	F11: 122, // KEY_ID_F11
	F12: 123, // KEY_ID_F12
	PrintScreen: 124, // KEY_ID_PSC
	ScrollLock: 125, // KEY_ID_SLK
	Pause: 126, // KEY_ID_PSE
	MetaRight: 127, // KEY_ID_LWIN
	ContextMenu: 129, // KEY_ID_APP
}

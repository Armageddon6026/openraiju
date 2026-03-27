<script setup lang="ts">
const { device } = defineProps<{
	device: TypedDeviceWith<'keyboard', 'getSnapTapSetting'>
}>()

const toast = useToast()

const snapTapInfo = ref<RazerSnapTapInfo>()
const editingPairs = ref<RazerSnapTapInfo['KeyPair']>([])

type PairSide = 'Key1' | 'Key2'
const listeningTarget = ref<{ index: number; side: PairSide } | null>(null)

/**
 * Temporary mock writer for Snap Tap until real driver command exists.
 * Replace this with device.config.setSnapTapSetting(...) when implemented.
 */
async function mockSetSnapTapSetting(_instance: HIDDevice, _payload: RazerSnapTapInfo): Promise<void> {
	await new Promise((resolve) => setTimeout(resolve, 250))
}

function clonePairs(pairs: RazerSnapTapInfo['KeyPair']) {
	return pairs.map((pair) => ({
		Key1: pair.Key1,
		Key2: pair.Key2,
	}))
}

function createEmptyPair() {
	return {
		Key1: 0,
		Key2: 0,
	}
}

const razerKeyIdMap: Record<string, number> = {
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

const hidUsageMap = razerKeyIdMap

const usageCodeToName = computed(() => {
	const reverse: Record<number, string> = {}
	for (const [code, usage] of Object.entries(hidUsageMap)) {
		if (!reverse[usage]) reverse[usage] = code
	}
	return reverse
})

function formatKey(usage: number) {
	if (!usage) return 'Press key...'
	const name = usageCodeToName.value[usage]
	return name ? `${name} (${usage})` : `${usage}`
}

function startListen(index: number, side: PairSide) {
	listeningTarget.value = { index, side }
}

function stopListen() {
	listeningTarget.value = null
}

function captureKey(index: number, side: PairSide, event: KeyboardEvent) {
	if (!listeningTarget.value || listeningTarget.value.index !== index || listeningTarget.value.side !== side) {
		return
	}

	event.preventDefault()

	if (event.code === 'Escape') {
		editingPairs.value[index]![side] = 0
		stopListen()
		return
	}

	const usage = hidUsageMap[event.code]
	if (!usage) {
		toast.add({
			severity: 'warn',
			summary: 'Unsupported key',
			detail: `Key ${event.code} is not mapped yet.`,
			life: 1800,
		})
		return
	}

	editingPairs.value[index]![side] = usage
	stopListen()
}

onMounted(async () => {
	try {
		const data = await device.config.getSnapTapSetting(device.instance)
		snapTapInfo.value = {
			Enabled: data.Enabled,
			KeyPair: clonePairs(data.KeyPair),
		}
		editingPairs.value = clonePairs(data.KeyPair)
	} catch (e) {
		toast.add({
			severity: 'error',
			summary: 'Load Snap Tap',
			detail: `${e}`,
			life: 3000,
		})
	}
})

const hasDuplicatePair = computed(() => {
	const seen = new Set<string>()
	for (const pair of editingPairs.value) {
		const a = Math.min(pair.Key1, pair.Key2)
		const b = Math.max(pair.Key1, pair.Key2)
		const key = `${a}-${b}`
		if (seen.has(key)) return true
		seen.add(key)
	}
	return false
})

const hasSameKeyInPair = computed(() => {
	return editingPairs.value.some((pair) => pair.Key1 === pair.Key2)
})

const canSave = computed(() => {
	if (!snapTapInfo.value) return false
	if (hasDuplicatePair.value || hasSameKeyInPair.value) return false
	return true
})

function addPair() {
	editingPairs.value.push(createEmptyPair())
}

function removePair(index: number) {
	editingPairs.value.splice(index, 1)
}

function resetPairs() {
	if (!snapTapInfo.value) return
	editingPairs.value = clonePairs(snapTapInfo.value.KeyPair)
	stopListen()
}

async function saveSnapTap() {
	if (!snapTapInfo.value) return
	if (!canSave.value) {
		toast.add({
			severity: 'warn',
			summary: 'Save Snap Tap',
			detail: 'Please resolve invalid key pairs before saving.',
			life: 2500,
		})
		return
	}

	const summary = 'Save Snap Tap'
	const payload: RazerSnapTapInfo = {
		Enabled: snapTapInfo.value.Enabled,
		KeyPair: clonePairs(editingPairs.value),
	}

	try {
		await mockSetSnapTapSetting(device.instance, payload)
		snapTapInfo.value = {
			Enabled: payload.Enabled,
			KeyPair: clonePairs(payload.KeyPair),
		}
		toast.add({
			severity: 'success',
			summary,
			detail: 'Snap Tap setting saved (mock).',
			life: 2500,
		})
	} catch (e) {
		toast.add({
			severity: 'error',
			summary,
			detail: `${e}`,
			life: 3000,
		})
	}
}
</script>

<template>
	<Card v-if="snapTapInfo" rounded="2xl" un-border="1 sky-500/35" bg="#121212" overflow="hidden">
		<template #title>
			<div flex="~" items="center" justify="between">
				<div>
					<label block="~" text="xs gray-400" m="b1" font="semibold" uppercase="~">Keyboard</label>
					<h3 text="xl sky-50" font="bold">Snap Tap</h3>
				</div>
				<div text="right" rounded="lg" p="x3 y2" bg="sky-500/10" un-border="1 sky-500/30">
					<p text="xs sky-200/85">Status</p>
					<p text="sm sky-100" font="bold">
						{{ snapTapInfo.Enabled ? 'Enabled' : 'Disabled' }}
					</p>
				</div>
			</div>
		</template>

		<template #content>
			<div rounded="xl" p="4" bg="[#171717]" un-border="1 sky-500/20">
				<div flex="~" items="center" justify="between" gap="3">
					<div>
						<p text="sm sky-100" font="bold">Enable Snap Tap</p>
						<p text="xs gray-400">Allow quick directional overwrite between paired keys.</p>
					</div>
					<ToggleSwitch v-model="snapTapInfo.Enabled" />
				</div>
			</div>

			<div mt="4" rounded="xl" p="4" bg="[#171717]" un-border="1 sky-500/20">
				<div flex="~" items="center" justify="between" m="b3">
					<div>
						<p text="sm sky-100" font="bold">Key Pairs</p>
						<p text="xs gray-400">Click a field then press a key. Esc clears current field.</p>
					</div>
					<Button label="Add Pair" severity="info" outlined size="small" @click="addPair" />
				</div>

				<div v-if="editingPairs.length === 0" text="xs gray-500" p="y2">No key pair configured.</div>

				<div class="flex flex-col gap-2">
					<div
						v-for="(pair, index) in editingPairs"
						:key="index"
						class="grid grid-cols-[1fr_auto_1fr_auto] items-center gap-2"
					>
						<input
							:value="formatKey(pair.Key1)"
							readonly
							class="w-full rounded-md border border-gray-700 bg-[#1a1a1a] px-3 py-2 text-sm text-white outline-none transition-colors focus:border-sky-400"
							:class="listeningTarget?.index === index && listeningTarget?.side === 'Key1' ? 'ring-1 ring-sky-400' : ''"
							@focus="startListen(index, 'Key1')"
							@blur="stopListen"
							@keydown="captureKey(index, 'Key1', $event)"
						/>
						<span text="sm gray-500">↔</span>
						<input
							:value="formatKey(pair.Key2)"
							readonly
							class="w-full rounded-md border border-gray-700 bg-[#1a1a1a] px-3 py-2 text-sm text-white outline-none transition-colors focus:border-sky-400"
							:class="listeningTarget?.index === index && listeningTarget?.side === 'Key2' ? 'ring-1 ring-sky-400' : ''"
							@focus="startListen(index, 'Key2')"
							@blur="stopListen"
							@keydown="captureKey(index, 'Key2', $event)"
						/>
						<Button
							icon="i-material-symbols-delete-outline-rounded"
							severity="danger"
							text
							size="small"
							@click="removePair(index)"
						/>
					</div>
				</div>

				<div v-if="hasSameKeyInPair" mt="3" text="xs amber-300">A pair cannot use the same key code on both sides.</div>
				<div v-if="hasDuplicatePair" mt="1" text="xs amber-300">
					Duplicate pairs detected. Remove duplicates before saving.
				</div>

				<div mt="4" flex="~" justify="end" gap="2">
					<Button label="Reset" severity="secondary" outlined @click="resetPairs" />
					<Button label="Save (Mock)" severity="info" :disabled="!canSave" @click="saveSnapTap" />
				</div>
			</div>
		</template>
	</Card>
</template>

<script setup lang="ts">
import { RAZER_KEY_MAP } from '@/driver/razer/define'

const { device } = defineProps<{
	device: TypedDeviceWith<'keyboard', 'getSnapTapSetting' | 'setSnapTapSetting'>
}>()

const toast = useToast()

const snapTapInfo = ref<RazerSnapTapInfo>()
const editingPairs = ref<RazerSnapTapInfo['KeyPair']>([])

type PairSide = 'Key1' | 'Key2'
const listeningTarget = ref<{ index: number; side: PairSide } | null>(null)

function clonePairs(pairs: RazerSnapTapInfo['KeyPair']) {
	return pairs.map((pair) => ({
		Key1: pair.Key1,
		Key2: pair.Key2,
	}))
}

const usageCodeToName = computed(() => {
	const reverse: Record<number, string> = {}
	for (const [code, usage] of Object.entries(RAZER_KEY_MAP)) {
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

	const usage = RAZER_KEY_MAP[event.code]
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
	editingPairs.value.push({ Key1: 0, Key2: 0 })
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
		await device.config.setSnapTapSetting(device.instance, payload)
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
					<ToggleSwitch v-model="snapTapInfo.Enabled" @change="saveSnapTap" />
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

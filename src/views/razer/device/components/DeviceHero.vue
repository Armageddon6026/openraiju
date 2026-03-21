<script setup lang="ts">
const { device } = defineProps<{
	device: RazerDevice<RazerBaseDeviceConfig>
}>()

const serial = ref('---')
const firmware = ref('---')

onMounted(async () => {
	try {
		serial.value = await device.config.getSerial(device.instance)
	} catch {
		serial.value = 'Unavailable'
	}

	try {
		firmware.value = await device.config.getFirmware(device.instance)
	} catch {
		firmware.value = 'Unavailable'
	}
})
</script>

<template>
	<section
		relative="~"
		overflow="hidden"
		rounded="3xl"
		p="6 md:8"
		:style="{ backgroundImage: 'linear-gradient(135deg,#111111 0%,#132014 50%,#101710 100%)' }"
		un-border="1 emerald-500/35"
	>
		<div
			absolute="~"
			inset="0"
			op="60"
			:style="{ backgroundImage: 'radial-gradient(circle at 18% 18%,#86ff8e55,transparent 44%)' }"
		></div>
		<div relative="~" grid="~ cols-1 lg:cols-[1.4fr_0.8fr]" gap="6" items="center">
			<div>
				<p text="emerald-300/90 xs" tracking="[0.24em]" uppercase="~" mb="2">Razer Device Center</p>
				<h2 text="3xl md:4xl emerald-50" font="black" leading="tight">
					{{ device.config.ui.name }}
				</h2>
				<div m="t2">
					<span text="sm emerald-100/75" m="r3">SN: {{ serial }}</span>
					<span text="sm emerald-100/75" m="r3">Firmware: {{ firmware }}</span>
				</div>
			</div>

			<div rounded="2xl" p="4" bg="black/30" un-border="1 emerald-100/12" flex="~" items="center" justify="center">
				<Image :src="device.config.ui.image" :alt="device.config.ui.name" width="210" />
			</div>
		</div>
	</section>
</template>

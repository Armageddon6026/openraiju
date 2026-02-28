<script setup lang="ts">
import type { MenuItem } from 'primevue/menuitem'
import { ref } from 'vue'

const items = ref<MenuItem[]>()
</script>

<template>
	<Menu :model="items" class="h-screen flex flex-col justify-between">
		<template #start>
			<div p="5" flex items-center justify-center border-b border-gray-700>
				<h1 class="text-2xl font-bold text-green-500">OPENRAZER</h1>
			</div>
		</template>
		<template #item="{ item, props }">
			<a v-ripple v-bind="props.action" class="flex justify-center">
				<span :class="item.icon" />
			</a>
		</template>
		<template #end>
			<div p="2" mt="auto">
				<Button v-ripple class="w-full flex justify-center" label="Primary" variant="outlined">
					<span i-material-symbols-settings-outline-rounded />
					<p>Settings</p>
				</Button>
			</div>
		</template>
	</Menu>
</template>

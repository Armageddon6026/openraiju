<script setup lang="ts"></script>

<template>
	<aside
		class="w-18 h-screen bg-[#0f0f0f] border-r border-[#222] flex flex-col items-center py-6 gap-4"
	>
		<div
			class="w-10 h-10 border border-[#444] rounded-xl flex items-center justify-center text-white"
		>
			H
		</div>

		<nav flex="~ 1 col" gap="4" p="3">
			<Button icon="i-brands-razer" variant="outlined"> </Button>
			<!-- add other brand buttons here 
			<Button icon="i-brands-logitech" variant="outlined"></Button>
			-->
		</nav>

		<div flex="~ col" items="center" gap="4">
			<Button icon="i-material-symbols-settings-outline" variant="text"></Button>
			<div h="px" w="8" bg="#333"></div>
			<Avatar
				image="https://primefaces.org/cdn/primevue/images/avatar/amyelsner.png"
				shape="circle"
				class="!w-10 !h-10 cursor-pointer hover:ring-2 ring-gray-500 transition-all"
			/>
		</div>
	</aside>
</template>

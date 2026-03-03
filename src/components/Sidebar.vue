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
			<Button as="router-link" to="/razer" icon="i-brands-razer" variant="outlined"> </Button>
			<!-- add other brand buttons here 
			<Button icon="i-brands-logitech" variant="outlined"></Button>
			-->
		</nav>

		<div flex="~ col" items="center" gap="4">
			<Button
				as="router-link"
				to="/setting"
				icon="i-material-symbols-settings-outline"
				variant="text"
				severity="secondary"
			></Button>
			<div h="px" w="8" bg="#333"></div>
			<Button
				icon="i-commons-github"
				as="a"
				href="https://github.com/Armageddon6026"
				target="_blank"
				rel="noopener noreferrer"
				severity="secondary"
				variant="text"
			>
			</Button>
		</div>
	</aside>
</template>

<script setup lang="ts">
import Sidebar from '@/components/Sidebar.vue'
</script>

<template>
	<div class="flex h-screen w-full">
		<Sidebar />
		<main class="flex-1 p-8">
			<RouterView />
		</main>
	</div>
</template>

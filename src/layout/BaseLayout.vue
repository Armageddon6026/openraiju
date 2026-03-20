<script setup lang="ts"></script>

<template>
	<div flex="~" min-h-screen w="full">
		<Sidebar />
		<main flex="1" p="4">
			<RouterView />
		</main>
	</div>
</template>

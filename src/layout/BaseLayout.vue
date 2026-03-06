<script setup lang="ts"></script>

<template>
	<div flex="~" h="screen" w="full">
		<Sidebar />
		<main flex="1" p="8">
			<RouterView />
		</main>
	</div>
</template>

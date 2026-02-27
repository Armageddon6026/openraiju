<script setup lang="ts">
const devices = [
	{ name: 'Razer Huntsman V2', type: 'Keyboard', image: 'pi pi-desktop' },
	{ name: 'Razer Naga V2 Pro', type: 'Mouse', image: 'pi pi-compass' },
	{ name: 'Chroma Connect', type: 'Module', image: 'pi pi-prime' },
	{ name: 'Philips Hue', type: 'Module', image: 'pi pi-lightbulb' },
]
</script>

<template>
  <div>
    <h1 class="text-4xl font-bold text-gray-200">DASHBOARD</h1>
    <div class="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Card v-for="device in devices" :key="device.name" class="bg-[#222] border-none">
        <template #header>
          <div class="flex items-center justify-center bg-[#333] p-8">
            <i :class="device.image" class="text-6xl text-gray-500" />
          </div>
        </template>
        <template #title>
          <h2 class="text-lg font-bold text-gray-200">{{ device.name }}</h2>
        </template>
        <template #subtitle>
          <p class="text-sm text-gray-400">{{ device.type }}</p>
        </template>
        <template #footer>
          <div class="flex justify-end">
            <Button label="Settings" severity="secondary" text />
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>

<template>
  <ClientOnly>
    <UContainer class="py-10">
      <UCard>
        <template #header>
          <h1 class="text-2xl font-bold">Session Status</h1>
        </template>

        <div v-if="session.isPending" class="text-gray-500">
          Loading session...
        </div>
        <div v-else-if="session.data">
          <p class="font-bold">You are logged in!</p>
          <pre
            class="mt-4 bg-gray-100 dark:bg-gray-800 p-4 rounded-md overflow-auto"
            >{{ session.data.user }}</pre
          >
        </div>
        <div v-else>
          <p class="text-red-500">You are not logged in.</p>
          <pre class="mt-4 bg-gray-100 dark:bg-gray-800 p-4 rounded-md">{{
            session.data
          }}</pre>
        </div>
      </UCard>
    </UContainer>

    <template #fallback>
      <UContainer class="py-10">
        <div class="text-center text-gray-500">Loading application...</div>
      </UContainer>
    </template>
  </ClientOnly>
</template>

<script setup lang="ts">
const { $auth } = useNuxtApp();
const session = $auth.useSession();
</script>
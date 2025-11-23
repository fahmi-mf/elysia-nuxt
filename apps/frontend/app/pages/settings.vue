<template>
  <ClientOnly>
    <UContainer class="py-10">
      <div class="flex flex-col lg:flex-row gap-8">
        <aside class="lg:w-64 shrink-0">
          <nav class="space-y-1">
            <h2 class="px-3 text-lg font-semibold mb-4">Settings</h2>
            <UNavigationMenu 
              :items="settingsLinks" 
              orientation="vertical" 
              class="w-full"
            />
          </nav>
        </aside>

        <main class="flex-1 min-w-0">
          <NuxtPage />
        </main>
      </div>
    </UContainer>
  </ClientOnly>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ["auth"],
});

const settingsLinks = [
  {
    label: "Account and Security",
    icon: "i-heroicons-user-circle",
    to: "/settings/account",
  },
    {
        label: "Devices",
        icon: "i-heroicons-device-phone-mobile",
        to: "/settings/devices",
    },
];
</script>
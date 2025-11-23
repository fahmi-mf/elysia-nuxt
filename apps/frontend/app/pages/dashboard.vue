<template>
  <ClientOnly>
    <UContainer class="py-10">
      <div v-if="session.data" class="grid gap-6 md:grid-cols-2">
        <UCard>
          <template #header>
            <h2 class="text-xl font-bold">User</h2>
          </template>

          <div class="flex flex-col gap-2">
            <h3 class="text-lg font-semibold">{{ session.data.user.name }}</h3>
            <p class="text-gray-500">{{ session.data.user.email }}</p>

            <div v-if="!session.data.user.emailVerified" class="mt-2 p-3 bg-yellow-500/10 rounded-md border border-yellow-500/20">
              <div class="flex items-center gap-2 text-yellow-600 dark:text-yellow-400 mb-2">
                <UIicon name="i-heroicons-exclamation-triangle" />
                <span class="text-sm font-medium">Your email is not verified</span>
              </div>
              
              <UButton 
                size="xs" 
                color="warning" 
                variant="solid"
                :loading="isSendingEmail"
                @click="resendVerification"
              >
                Resend verification email
              </UButton>
            </div>

            <div class="mt-4 text-xs text-gray-400 space-y-1">
              <p>ID: {{ session.data.user.id }}</p>
              <p>Created: {{ new Date(session.data.user.createdAt).toLocaleString() }}</p>
              <p>Updated: {{ new Date(session.data.user.updatedAt).toLocaleString() }}</p>
            </div>
          </div>
        </UCard>

        <UCard>
          <template #header>
            <h2 class="text-xl font-bold">Current Session</h2>
          </template>

          <div class="text-sm text-gray-300 space-y-2 wrap-break-word">
            <p><strong>IP Address:</strong> {{ session.data.session.ipAddress }}</p>
            <p><strong>User Agent:</strong> {{ session.data.session.userAgent }}</p>
            <p><strong>Expires:</strong> {{ new Date(session.data.session.expiresAt).toLocaleString() }}</p>
            <p class="mt-4"><strong>Token:</strong> {{ session.data.session.token }}</p>
          </div>
        </UCard>
      </div>
    </UContainer>

    <template #fallback>
      <UContainer class="py-10">
        <div class="text-center text-gray-500">Loading Dashboard...</div>
      </UContainer>
    </template>
  </ClientOnly>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ["auth"],
});

const { $auth } = useNuxtApp();
const toast = useToast();
const isSendingEmail = ref(false);

const session = $auth.useSession();

// Function to resend the email
async function resendVerification() {
  isSendingEmail.value = true;
  try {
    const { error } = await $auth.sendVerificationEmail({
      email: session.value.data!.user.email,
      callbackURL: "/dashboard"
    });
    
    if (error) {
      toast.add({ title: "Error", description: error.message, color: "error" });
    } else {
      toast.add({ 
        title: "Email sent", 
        description: "Check your inbox (or console if using Ethereal)", 
        color: "success" 
      });
    }
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : "Unknown error";
    toast.add({ title: "Error", description: errorMessage, color: "error" });
  } finally {
    isSendingEmail.value = false;
  }
}
</script>
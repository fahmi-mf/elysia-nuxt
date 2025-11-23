<template>
  <UPageCard class="w-full max-w-sm">
    <UAuthForm
      :fields="fields"
      :submit-button="{ label: 'Verify', loading: isLoading }"
      title="Two-Factor Authentication"
      description="Enter the code from your authenticator application."
      icon="i-heroicons-shield-check"
      @submit="onSubmit"
    >
      <template #footer>
        <div class="text-center mt-2">
          <UButton 
            variant="link" 
            color="neutral" 
            size="xs"
            @click="toggleMethod"
          >
            {{ useBackupCode ? 'Use app code' : 'Use backup code' }}
          </UButton>
        </div>
      </template>
    </UAuthForm>
  </UPageCard>
</template>

<script setup lang="ts">
import type { FormSubmitEvent, AuthFormField } from "@nuxt/ui";

definePageMeta({ layout: "auth" });

const { $auth } = useNuxtApp();
const toast = useToast();
const isLoading = ref(false);
const useBackupCode = ref(false);

const fields = computed<AuthFormField[]>(() => [
  {
    name: "code",
    type: "text",
    label: useBackupCode.value ? "Backup Code" : "Verification Code (6 digits)",
    placeholder: useBackupCode.value ? "E.g. 12345678" : "123456",
    required: true,
  }
]);

function toggleMethod() {
  useBackupCode.value = !useBackupCode.value;
}

async function onSubmit(event: FormSubmitEvent<{ code: string }>) {
  isLoading.value = true;
  try {
    let res;
    
    if (useBackupCode.value) {
      // Verify with backup code
      res = await $auth.twoFactor.verifyBackupCode({
        code: event.data.code
      }, {
        onSuccess: async () => {
          await navigateTo("/dashboard");
        }
      });
    } else {
      // Verify with TOTP (App)
      res = await $auth.twoFactor.verifyTotp({
        code: event.data.code,
        trustDevice: true // Trust this device for 30 days
      }, {
        onSuccess: async () => {
          await navigateTo("/dashboard");
        }
      });
    }

    if (res.error) {
      toast.add({ title: "Error", description: res.error.message, color: "error" });
    }
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : "Unknown error";
    toast.add({ title: "Error", description: errorMessage, color: "error" });
  } finally {
    isLoading.value = false;
  }
}
</script>
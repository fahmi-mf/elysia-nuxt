<template>
  <UPageCard class="w-full max-w-sm">
    <UAuthForm
      :schema="schema"
      :fields="fields"
      :submit-button="{ label: 'Send Email', loading: isLoading }"
      title="Recover Password"
      icon="i-heroicons-envelope"
      @submit="onSubmit"
    >
      <template #description>
        Enter your email and we will send you a link to reset your password.
      </template>
      <template #footer>
        <div class="text-center mt-2">
          <ULink to="/auth/login" class="text-primary text-sm font-medium">
            Back to login
          </ULink>
        </div>
      </template>
    </UAuthForm>
  </UPageCard>
</template>

<script setup lang="ts">
import { z } from "zod";
import type { FormSubmitEvent, AuthFormField } from "@nuxt/ui";

definePageMeta({ 
  layout: "auth",
  middleware: ["guest"] 
});

const { $auth } = useNuxtApp();
const toast = useToast();
const isLoading = ref(false);

const fields: AuthFormField[] = [
  { name: "email", type: "email", label: "Email", placeholder: "your@email.com" },
];

const schema = z.object({
  email: z.string().email("Invalid email"),
});

type Schema = z.output<typeof schema>;

async function onSubmit(event: FormSubmitEvent<Schema>) {
  isLoading.value = true;
  try {
    const { error } = await $auth.requestPasswordReset({
      email: event.data.email,
      redirectTo: "/auth/reset",
    });

    if (error) {
      toast.add({ title: "Error", description: error.message, color: "error" });
    } else {
      toast.add({
        title: "Email sent",
        description: "Check your inbox (or console in dev)",
        color: "success",
      });
    }
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : "Unknown error";
    toast.add({ title: "Error", description: errorMessage, color: "error" });
  } finally {
    isLoading.value = false;
  }
}
</script>
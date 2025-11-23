<template>
  <UPageCard class="w-full max-w-sm">
    <UAuthForm
      :schema="schema"
      :fields="fields"
      :submit-button="{ label: 'Reset Password', loading: isLoading }"
      title="New Password"
      icon="i-heroicons-lock-closed"
      @submit="onSubmit"
    />
  </UPageCard>
</template>

<script setup lang="ts">
import { z } from "zod";
import type { FormSubmitEvent, AuthFormField } from "@nuxt/ui";

definePageMeta({ layout: "auth" });

const { $auth } = useNuxtApp();
const route = useRoute();
const toast = useToast();
const isLoading = ref(false);
const router = useRouter();

// We validate that the token exists in the URL
if (!route.query.token) {
  toast.add({ title: "Error", description: "Invalid or missing token", color: "error" });
  router.push("/auth/login");
}

const fields: AuthFormField[] = [
  { name: "password", label: "New Password", type: "password", placeholder: "••••••••" },
  { name: "passwordConfirmation", label: "Confirm Password", type: "password", placeholder: "••••••••" },
];

const schema = z
  .object({
    password: z.string().min(8, "Minimum 8 characters"),
    passwordConfirmation: z.string().min(8, "Confirm password"),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "Passwords do not match",
    path: ["passwordConfirmation"],
  });

type Schema = z.output<typeof schema>;

async function onSubmit(event: FormSubmitEvent<Schema>) {
  isLoading.value = true;
  try {
    const { error } = await $auth.resetPassword({
      newPassword: event.data.password,
      token: route.query.token as string,
    });

    if (error) {
      toast.add({ title: "Error", description: error.message, color: "error" });
    } else {
      toast.add({ title: "Success!", description: "Password updated. Please log in.", color: "success" });
      await navigateTo("/auth/login");
    }
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : "Unknown error";
    toast.add({ title: "Error", description: errorMessage, color: "error" });
  } finally {
    isLoading.value = false;
  }
}
</script>
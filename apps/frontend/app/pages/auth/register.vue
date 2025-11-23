<template>
  <UPageCard class="w-full max-w-sm">
    <UAuthForm
      :schema="schema"
      :fields="fields"
      :providers="providers"
      :submit-button="{ label: 'Create Account', loading: isLoading }"
      title="Create Account"
      icon="i-heroicons-user-plus"
      @submit="onSubmit"
    >
      <template #description>
        Already have an account?
        <ULink to="/auth/login" class="text-primary font-medium"
          >Log In</ULink
        >.
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

const providers = [
  {
    label: 'Google',
    icon: 'i-simple-icons-google',
    onClick: async () => {
      try {
        const callbackURL = `${window.location.origin}/dashboard`;
        await $auth.signIn.social({
          provider: 'google',
          callbackURL: callbackURL
        });
      } catch {
        toast.add({ title: "Error", description: "Could not connect with Google", color: "error" });
      }
    }
  },
  {
    label: 'GitHub',
    icon: 'i-simple-icons-github',
    onClick: async () => {
      try {
        const callbackURL = `${window.location.origin}/dashboard`;

        await $auth.signIn.social({
          provider: 'github',
          callbackURL: callbackURL
        });
      } catch {
        toast.add({ title: "Error", description: "Could not connect with GitHub", color: "error" });
      }
    }
  }
];

const fields: AuthFormField[] = [
  {
    name: "name",
    type: "text",
    label: "Name",
    placeholder: "Your Name",
  },
  {
    name: "username",
    type: "text",
    label: "Username",
    placeholder: "your_username",
  },
  {
    name: "email",
    type: "email",
    label: "Email",
    placeholder: "your@email.com",
  },
  {
    name: "password",
    label: "Password",
    type: "password",
    placeholder: "••••••••",
  },
  {
    name: "passwordConfirmation",
    label: "Confirm Password",
    type: "password",
    placeholder: "••••••••",
  },
];

const schema = z
  .object({
    name: z.string().min(2, { error: "Name is required" }),
    username: z.string().min(3, { error: "Username must be at least 3 characters" }),
    email: z.string().email({ message: "Invalid email" }),
    password: z.string().min(8, { error: "Password must be at least 8 characters" }),
    passwordConfirmation: z.string().min(8, { error: "You must confirm the password" }),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "Passwords do not match",
    path: ["passwordConfirmation"],
  });

type Schema = z.output<typeof schema>;

async function onSubmit(event: FormSubmitEvent<Schema>) {
  isLoading.value = true;
  try {
    const { error } = await $auth.signUp.email({
      name: event.data.name,
      username: event.data.username,
      email: event.data.email,
      password: event.data.password,
    });

    if (error) {
      toast.add({
        title: "Error",
        description: error.message,
        color: "error",
      });
    } else {
      toast.add({
        title: "Account Created!",
        description: "Logging in...",
        color: "success",
      });
      await navigateTo("/dashboard");
    }
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : "Unknown error";
    toast.add({ title: "Error", description: errorMessage, color: "error" });
  } finally {
    isLoading.value = false;
  }
}
</script>
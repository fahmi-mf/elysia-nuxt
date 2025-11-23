<template>
  <UPageCard class="w-full max-w-sm">
    <UAuthForm
      :schema="schema"
      :fields="fields"
      :providers="providers"
      :submit-button="{ label: 'Log In', loading: isLoading }"
      title="Log In"
      icon="i-heroicons-key"
      @submit="onSubmit"
    >
      <template #description>
        Don't have an account?
        <ULink to="/auth/register" class="text-primary font-medium">Sign Up</ULink>.
      </template>

      <template #password-hint>
        <ULink to="/auth/forgot" class="text-primary font-medium">
          Forgot your password?
        </ULink>
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
    label: 'Passkey (Fingerprint/FaceID)',
    icon: 'i-heroicons-finger-print',
    onClick: async () => {
      try {
        const { error } = await $auth.signIn.passkey({ 
            autoFill: false, 
            fetchOptions: {
                onSuccess: () => {
                    navigateTo('/dashboard');
                }
            }
        }); 
        
        if (error) {
             toast.add({ title: "Error", description: error.message, color: "error" });
        }
      } catch {
        toast.add({ title: "Error", description: "Could not sign in with Passkey", color: "error" });
      }
    }
  },
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
  { name: "identifier", type: "text", label: "Email or Username", placeholder: "your@email.com", autocomplete: "username webauthn" },
  { name: "password", label: "Password", type: "password", placeholder: "••••••••", autocomplete: "current-password webauthn" },
];

const schema = z.object({
  identifier: z.string().min(3, "Required"),
  password: z.string().min(8, "Minimum 8 characters"),
});

type Schema = z.output<typeof schema>;

async function onSubmit(event: FormSubmitEvent<Schema>) {
  isLoading.value = true;
  const isEmail = event.data.identifier.includes("@");
  
  try {
    let res;
    const creds = { 
        email: event.data.identifier, 
        username: event.data.identifier, 
        password: event.data.password 
    };

    if (isEmail) {
      res = await $auth.signIn.email(creds);
    } else {
      res = await $auth.signIn.username(creds);
    }

    const { data, error } = res;

    if (error) {
      if (error.status === 403 && error.message?.toLowerCase().includes("verify")) {
        toast.add({
          title: "Verification Required",
          description: "Please check your email to verify your account before logging in.",
          color: "warning",
          duration: 8000
        });
      } else {
        toast.add({ title: "Error", description: error.message ?? "Unknown error", color: "error" });
      }
    } else if (data && "twoFactorRedirect" in data) {
      // If it enters here, it's because the device is NOT trusted or the period expired
      toast.add({ title: "2FA Required", description: "Enter your security code", color: "info" });
      await navigateTo("/auth/2fa");
    } else {
      // If it enters here, it's a normal login or a trusted device (skip 2FA)
      toast.add({ title: "Welcome!", color: "success" });
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
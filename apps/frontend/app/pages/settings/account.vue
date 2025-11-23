<template>
  <div class="space-y-6">
    <div class="border-b border-gray-200 dark:border-gray-800 pb-4">
      <h1 class="text-2xl font-bold">Account and Security</h1>
      <p class="text-gray-500 mt-1">Manage your access and security methods.</p>
    </div>

    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-lg font-semibold flex items-center gap-2">
              <UIcon name="i-heroicons-key" class="text-primary" />
              Password
            </h3>
            <p class="text-sm text-gray-500">Change your current password.</p>
          </div>
          <UButton
            icon="i-heroicons-pencil-square"
            size="sm"
            color="primary"
            variant="solid"
            @click="isPasswordModalOpen = true"
          >
            Change password
          </UButton>
        </div>
      </template>
      <div class="text-sm text-gray-500">
        It is recommended to use a strong and unique password.
      </div>
    </UCard>

    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-lg font-semibold flex items-center gap-2">
              <UIcon name="i-heroicons-shield-check" class="text-primary" />
              Two-Factor Authentication (2FA)
            </h3>
            <p class="text-sm text-gray-500">Add an extra layer of security to your account.</p>
          </div>
          
          <div v-if="session.data?.user.twoFactorEnabled">
             <UBadge color="success" variant="subtle">Activated</UBadge>
             <UButton 
               class="ml-2" 
               color="error" 
               size="xs" 
               variant="ghost" 
               @click="isDisable2FAModalOpen = true"
             >Deactivate</UButton>
          </div>
          <UButton
            v-else
            icon="i-heroicons-plus"
            size="sm"
            @click="isEnable2FAModalOpen = true"
          >
            Activate 2FA
          </UButton>
        </div>
      </template>
      
      <div class="text-sm text-gray-500">
        Protect your account by requiring a code from an authenticator application when logging in.
      </div>
    </UCard>

    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-lg font-semibold flex items-center gap-2">
              <UIicon name="i-heroicons-finger-print" class="text-primary" />
              Passkeys (Fingerprint / FaceID)
            </h3>
            <p class="text-sm text-gray-500">Access securely without a password.</p>
          </div>
          <UButton
            icon="i-heroicons-plus"
            size="sm"
            :loading="isAddingPasskey"
            @click="handleAddPasskey"
          >
            Add Passkey
          </UButton>
        </div>
      </template>

      <div v-if="passkeys.length > 0" class="space-y-3">
        <div
          v-for="key in passkeys"
          :key="key.id"
          class="flex items-center justify-between p-3 border rounded-md border-gray-200 dark:border-gray-800"
        >
          <div class="flex items-center gap-3">
            <div class="p-2 bg-gray-100 dark:bg-gray-800 rounded-full">
              <UIicon name="i-heroicons-device-phone-mobile" class="w-5 h-5" />
            </div>
            <div>
              <p class="font-medium">{{ key.name || 'Unnamed Passkey' }}</p>
              <p class="text-xs text-gray-500">
                Created: {{ new Date(key.createdAt).toLocaleDateString() }}
              </p>
            </div>
          </div>
          <UButton
            color="error"
            variant="ghost"
            icon="i-heroicons-trash"
            size="xs"
            @click="handleDeletePasskey(key.id)"
          />
        </div>
      </div>

      <div v-else class="text-center py-6 text-gray-500 text-sm">
        You have no Passkeys configured. Add one to log in faster.
      </div>
    </UCard>

    <UCard class="border-red-200 dark:border-red-900 ring-red-200 dark:ring-red-900">
      <template #header>
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-lg font-semibold flex items-center gap-2 text-red-600 dark:text-red-400">
              <UIicon name="i-heroicons-exclamation-triangle" />
              Danger Zone
            </h3>
            <p class="text-sm text-gray-500">Irreversible actions for your account.</p>
          </div>
          <UButton
            color="error"
            variant="solid"
            icon="i-heroicons-trash"
            @click="isDeleteAccountModalOpen = true"
          >
            Delete Account
          </UButton>
        </div>
      </template>
      <div class="text-sm text-gray-500">
        Once you delete your account, there is no turning back. Please make sure before proceeding.
      </div>
    </UCard>

    <UModal v-model:open="isPasswordModalOpen" :prevent-close="isChangingPassword">
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
            Change Password
          </h3>
          <UButton color="primary" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1" @click="isPasswordModalOpen = false" />
        </div>
      </template>

      <template #body>
        <UForm :schema="passwordSchema" :state="passwordState" class="space-y-4" @submit="onChangePassword">
          <UFormField label="Current Password" name="currentPassword">
            <UInput v-model="passwordState.currentPassword" type="password" />
          </UFormField>

          <UFormField label="New Password" name="newPassword">
            <UInput v-model="passwordState.newPassword" type="password" />
          </UFormField>
          
          <UFormField label="Confirm New Password" name="confirmPassword">
            <UInput v-model="passwordState.confirmPassword" type="password" />
          </UFormField>

          <UCheckbox 
            v-model="passwordState.revokeOtherSessions" 
            name="revokeOtherSessions"
            label="Log out on other devices" 
            help="Recommended if you believe your account was compromised"
          />

          <div class="flex justify-end gap-3 pt-4">
            <UButton label="Cancel" color="secondary" variant="ghost" @click="isPasswordModalOpen = false" />
            <UButton type="submit" label="Save Changes" color="primary" :loading="isChangingPassword" />
          </div>
        </UForm>
      </template>
    </UModal>

    <UModal 
      v-model:open="isEnable2FAModalOpen"
      title="Activate 2FA"
      description="Follow the steps to set up two-factor authentication."
    >
      <template #body>
          <div v-if="twoFactorStep === 'password'" class="space-y-4">
              <p class="text-sm text-gray-500">For security, enter your password to continue.</p>
              <UInput v-model="passwordFor2FA" type="password" placeholder="Current password" />
              <div class="flex justify-end">
                  <UButton :loading="isEnabling2FA" @click="enable2FA">Continue</UButton>
              </div>
          </div>

          <div v-else-if="twoFactorStep === 'qr'" class="space-y-6">
              <div class="text-center">
                  <p class="text-sm mb-4">1. Scan this code with your authenticator application.</p>
                  <div class="flex justify-center bg-white p-4 rounded-lg mx-auto">
                      <img :src="qrCodeUrl" alt="QR Code 2FA" >
                  </div>
              </div>
              
              <div class="space-y-2">
                  <p class="text-sm">2. Enter the 6-digit code.</p>
                  <UInput v-model="totpCode" placeholder="123456" class="text-center tracking-widest" maxlength="6" />
              </div>

              <div class="flex justify-end">
                  <UButton :loading="isVerifying2FA" @click="verifyAndActivate2FA">Activate 2FA</UButton>
              </div>
          </div>

          <div v-else-if="twoFactorStep === 'backup'" class="space-y-4">
              <div class="bg-green-50 dark:bg-green-900/20 p-4 rounded-md text-center">
                  <UIicon name="i-heroicons-check-circle" class="text-green-500 w-8 h-8 mb-2" />
                  <h3 class="text-lg font-bold text-green-700 dark:text-green-400">2FA Activated!</h3>
              </div>
              
              <div>
                  <p class="text-sm font-bold mb-2">SAVE THESE BACKUP CODES</p>
                  <div class="grid grid-cols-2 gap-2 bg-gray-100 dark:bg-gray-900 p-4 rounded font-mono text-sm">
                      <span v-for="code in backupCodes" :key="code" class="bg-white dark:bg-gray-800 p-1 px-2 rounded text-center select-all">{{ code }}</span>
                  </div>
              </div>

              <div class="flex justify-end">
                  <UButton @click="finish2FASetup">Understood</UButton>
              </div>
          </div>
      </template>
    </UModal>

    <UModal 
      v-model:open="isDisable2FAModalOpen"
      title="Deactivate 2FA"
      description="Are you sure? Your account will be less secure."
    >
      <template #body>
          <div class="space-y-4">
              <p class="text-sm text-gray-500">Enter your password to confirm.</p>
              <UInput v-model="passwordForDisable2FA" type="password" placeholder="Current password" />
              <div class="flex justify-end gap-2">
                  <UButton variant="ghost" @click="isDisable2FAModalOpen = false">Cancel</UButton>
                  <UButton color="error" :loading="isDisabling2FA" @click="disable2FA">Deactivate</UButton>
              </div>
          </div>
      </template>
    </UModal>

    <UModal v-model:open="isDeleteAccountModalOpen" title="Delete Account Permanently?">
       <template #description>
         This action cannot be undone. All your data will be deleted.
       </template>
       <template #body>
         <div class="space-y-4">
            <div v-if="hasPassword">
                <p class="text-sm text-gray-500 mb-2">Enter your password to confirm deletion.</p>
                <UInput v-model="deleteAccountPassword" type="password" placeholder="Your current password" />
            </div>
            <div v-else>
                 <div class="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 rounded text-sm flex gap-2">
                    <UIicon name="i-heroicons-information-circle" class="w-5 h-5 shrink-0" />
                    <p>Since you logged in with a social network, we will send you a confirmation email to verify it is you.</p>
                 </div>
            </div>

            <div class="flex justify-end gap-2 mt-4">
                 <UButton variant="ghost" @click="isDeleteAccountModalOpen = false">Cancel</UButton>
                 <UButton 
                    color="error" 
                    variant="solid" 
                    :loading="isDeletingAccount" 
                    @click="handleDeleteAccount"
                 >
                     {{ hasPassword ? 'Delete permanently' : 'Send confirmation email' }}
                 </UButton>
            </div>
          </div>
       </template>
    </UModal>

  </div>
</template>

<script setup lang="ts">
import { z } from "zod";
import type { FormSubmitEvent } from "@nuxt/ui";
import { useQRCode } from '@vueuse/integrations/useQRCode';

const { $auth } = useNuxtApp();
const toast = useToast();
const session = $auth.useSession();

interface Passkey {
  id: string;
  name?: string | null;
  publicKey: string;
  userId: string;
  credentialID: string;
  counter: number;
  deviceType: string;
  backedUp: boolean;
  transports?: string | null;
  createdAt: Date;
  aaguid?: string | null;
}

const isAddingPasskey = ref(false);
const passkeys = ref<Passkey[]>([]); 

// Load Passkeys on initialization
const fetchPasskeys = async () => {
  try {
    const res = await $auth.passkey.listUserPasskeys();
    passkeys.value = (res?.data as unknown as Passkey[]) || [];
  } catch (e) {
    console.error("Error loading passkeys", e);
  }
};

onMounted(fetchPasskeys);

// Add Passkey
const handleAddPasskey = async () => {
  isAddingPasskey.value = true;
  try {
    const res = await $auth.passkey.addPasskey({
      name: "My Device", 
    });

    if (res?.error) {
      toast.add({ title: "Error", description: res.error.message, color: "error" });
    } else {
      toast.add({ title: "Passkey added", color: "success" });
      await fetchPasskeys(); 
    }
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : "Unknown error";
    toast.add({ title: "Error", description: errorMessage, color: "error" });
  } finally {
    isAddingPasskey.value = false;
  }
};

// Delete Passkey
const handleDeletePasskey = async (id: string) => {
  if (!confirm("Are you sure you want to delete this Passkey?")) return;

  try {
    const res = await $auth.passkey.deletePasskey({ id });
    
    if (res?.error) {
      toast.add({ title: "Error", color: "error" });
    } else {
      toast.add({ title: "Passkey deleted", color: "success" });
      await fetchPasskeys();
    }
  } catch {
    toast.add({ title: "Error", color: "error" });
  }
};

const isPasswordModalOpen = ref(false);
const isChangingPassword = ref(false);

// Validation schema
const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "You must confirm the password"),
  revokeOtherSessions: z.boolean().default(true)
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type PasswordSchema = z.output<typeof passwordSchema>;

const passwordState = reactive<Partial<PasswordSchema>>({
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
  revokeOtherSessions: true
});

const onChangePassword = async (event: FormSubmitEvent<PasswordSchema>) => {
  isChangingPassword.value = true;
  try {
    const { error } = await $auth.changePassword({
      newPassword: event.data.newPassword,
      currentPassword: event.data.currentPassword,
      revokeOtherSessions: event.data.revokeOtherSessions
    });

    if (error) {
      toast.add({ title: "Error", description: error.message, color: "error" });
    } else {
      toast.add({ title: "Password updated", color: "success" });
      isPasswordModalOpen.value = false;
      passwordState.currentPassword = "";
      passwordState.newPassword = "";
      passwordState.confirmPassword = "";
    }
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : "Unknown error";
    toast.add({ title: "Error", description: errorMessage, color: "error" });
  } finally {
    isChangingPassword.value = false;
  }
};

// 2FA
const isEnable2FAModalOpen = ref(false);
const isDisable2FAModalOpen = ref(false);
const twoFactorStep = ref<'password' | 'qr' | 'backup'>('password');
const passwordFor2FA = ref('');
const passwordForDisable2FA = ref('');
const isEnabling2FA = ref(false);
const isVerifying2FA = ref(false);
const isDisabling2FA = ref(false);
const totpURI = ref('');
const totpCode = ref('');
const backupCodes = ref<string[]>([]);

// Generate reactive QR using vueuse
const qrCodeUrl = useQRCode(totpURI);

const enable2FA = async () => {
    isEnabling2FA.value = true;
    try {
        const res = await $auth.twoFactor.enable({
            password: passwordFor2FA.value
        });
        if (res.error) {
            toast.add({ title: "Error", description: res.error.message, color: "error" });
            return;
        }
        totpURI.value = res.data.totpURI;
        backupCodes.value = res.data.backupCodes || [];
        twoFactorStep.value = 'qr';
    } catch {
        toast.add({ title: "Unexpected error", color: "error" });
    } finally {
        isEnabling2FA.value = false;
    }
};

const verifyAndActivate2FA = async () => {
    isVerifying2FA.value = true;
    try {
        const res = await $auth.twoFactor.verifyTotp({
            code: totpCode.value,
            trustDevice: true
        });

        if (res.error) {
            toast.add({ title: "Invalid code", description: res.error.message, color: "error" });
        } else {
            // If successful, show backup codes
            twoFactorStep.value = 'backup';
        }
    } catch {
        toast.add({ title: "Error", color: "error" });
    } finally {
        isVerifying2FA.value = false;
    }
};

const finish2FASetup = () => {
    isEnable2FAModalOpen.value = false;
    twoFactorStep.value = 'password';
    passwordFor2FA.value = '';
    totpCode.value = '';
    window.location.reload();
};

// Disable 2FA
const disable2FA = async () => {
    isDisabling2FA.value = true;
    try {
        const res = await $auth.twoFactor.disable({
            password: passwordForDisable2FA.value
        });
        if (res.error) {
            toast.add({ title: "Error", description: res.error.message, color: "error" });
        } else {
            toast.add({ title: "2FA Deactivated", color: "success" });
            isDisable2FAModalOpen.value = false;
            passwordForDisable2FA.value = '';
            window.location.reload();
        }
    } catch {
        toast.add({ title: "Error", color: "error" });
    } finally {
        isDisabling2FA.value = false;
    }
};

// Delete Account
const isDeleteAccountModalOpen = ref(false);
const isDeletingAccount = ref(false);
const deleteAccountPassword = ref('');

const hasPassword = computed(() => {
    return true;
});

const handleDeleteAccount = async () => {
    isDeletingAccount.value = true;
    try {
        let res;
        
        if (deleteAccountPassword.value) {
            res = await $auth.deleteUser({
                password: deleteAccountPassword.value,
            });
        } else {
            res = await $auth.deleteUser();
        }

        if (res?.error) {
             toast.add({ title: "Error", description: res.error.message, color: "error" });
        } else {
             if (deleteAccountPassword.value) {
                // If we send password and there was no error -> Account deleted
                toast.add({ title: "Account deleted", color: "success" });
                window.location.href = '/'; 
             } else {
                // If we don't send password, we assume the verification email was sent
                toast.add({ 
                    title: "Verification sent", 
                    description: "Check your email to confirm the deletion.", 
                    color: "info" 
                });
                isDeleteAccountModalOpen.value = false;
             }
        }
    } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : "An unknown error occurred";
        toast.add({ title: "Error", description: errorMessage, color: "error" });
    } finally {
        isDeletingAccount.value = false;
        deleteAccountPassword.value = '';
    }
};
</script>
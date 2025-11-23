<template>
  <div class="space-y-6">
    <div class="border-b border-gray-200 dark:border-gray-800 pb-4">
      <h1 class="text-2xl font-bold">Devices</h1>
      <p class="text-gray-500 mt-1">
        Manage your active sessions and connected devices.
      </p>
    </div>

    <div class="flex justify-end">
      <UButton
        color="error"
        variant="soft"
        icon="i-heroicons-shield-exclamation"
        :loading="isRevokingAll"
        @click="handleRevokeOthers"
      >
        Log out on other devices
      </UButton>
    </div>

    <div class="space-y-4">
      <UCard
        v-for="sessionItem in sessions"
        :key="sessionItem.id"
        :class="[
          'transition-colors',
          isCurrentSession(sessionItem.token)
            ? 'ring-2 ring-primary-500/50 dark:ring-primary-400/50'
            : '',
        ]"
      >
        <div class="flex items-start justify-between gap-4">
          <div class="flex items-start gap-4">
            <div class="p-2 bg-gray-100 dark:bg-gray-800 rounded-full shrink-0">
              <UIcon
                :name="getDeviceIcon(sessionItem.userAgent)"
                class="w-6 h-6 text-gray-600 dark:text-gray-300"
              />
            </div>

            <div>
              <div class="flex items-center gap-2">
                <p class="font-medium text-gray-900 dark:text-white">
                  {{ getDeviceName(sessionItem.userAgent) }}
                </p>
                <UBadge
                  v-if="isCurrentSession(sessionItem.token)"
                  size="xs"
                  color="primary"
                  variant="subtle"
                >
                  This device
                </UBadge>
              </div>

              <div class="text-sm text-gray-500 mt-1 space-y-1">
                <p class="flex items-center gap-1">
                  <UIicon name="i-heroicons-globe-alt" class="w-4 h-4" />
                  {{ sessionItem.ipAddress || "Unknown IP" }}
                </p>
                <p class="flex items-center gap-1">
                  <UIicon name="i-heroicons-clock" class="w-4 h-4" />
                  Expires:
                  {{ new Date(sessionItem.expiresAt).toLocaleDateString() }}
                </p>
              </div>
            </div>
          </div>

          <UButton
            v-if="!isCurrentSession(sessionItem.token)"
            color="secondary"
            variant="ghost"
            icon="i-heroicons-x-circle"
            :loading="revokingId === sessionItem.id"
            label="Revoke"
            @click="handleRevoke(sessionItem)"
          />
        </div>
      </UCard>

      <div
        v-if="sessions.length === 0 && !isLoading"
        class="text-center py-8 text-gray-500"
      >
        No active sessions found.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { $auth } = useNuxtApp();
const toast = useToast();

// Define local interface for the session
interface ActiveSession {
  id: string;
  token: string;
  userId: string;
  expiresAt: Date;
  ipAddress?: string | null;
  userAgent?: string | null;
}

const sessions = ref<ActiveSession[]>([]);
const isLoading = ref(true);
const isRevokingAll = ref(false);
const revokingId = ref<string | null>(null);

const currentSession = $auth.useSession();

const isCurrentSession = (token: string) => {
  return token === currentSession.value.data?.session.token;
};

// Load list of sessions
const fetchSessions = async () => {
  isLoading.value = true;
  try {
    const { data } = await $auth.listSessions();
    if (data) {
      sessions.value = data as unknown as ActiveSession[];
    }
  } catch (e) {
    console.error(e);
    toast.add({ title: "Error loading sessions", color: "error" });
  } finally {
    isLoading.value = false;
  }
};

// Revoke a specific session
const handleRevoke = async (sessionItem: ActiveSession) => {
  revokingId.value = sessionItem.id;
  try {
    const { error } = await $auth.revokeSession({
      token: sessionItem.token,
    });

    if (error) {
      toast.add({
        title: "Revoke Error",
        description: error.message,
        color: "error",
      });
    } else {
      toast.add({ title: "Session revoked", color: "success" });
      await fetchSessions(); // Reload list
    }
  } catch {
    toast.add({ title: "Unexpected error", color: "error" });
  } finally {
    revokingId.value = null;
  }
};

// Revoke all OTHER sessions
const handleRevokeOthers = async () => {
  if (!confirm("Are you sure you want to log out on all other devices?"))
    return;

  isRevokingAll.value = true;
  try {
    const { error } = await $auth.revokeOtherSessions();

    if (error) {
      toast.add({
        title: "Error revoking sessions",
        description: error.message,
        color: "error",
      });
    } else {
      toast.add({ title: "Other sessions closed", color: "success" });
      await fetchSessions();
    }
  } catch {
    toast.add({ title: "Unexpected error", color: "error" });
  } finally {
    isRevokingAll.value = false;
  }
};

// Visual helpers
const getDeviceIcon = (ua?: string | null) => {
  if (!ua) return "i-heroicons-device-phone-mobile";
  const lower = ua.toLowerCase();
  if (lower.includes("windows") || lower.includes("mac") || lower.includes("linux")) {
    return "i-heroicons-computer-desktop";
  }
  return "i-heroicons-device-phone-mobile";
};

const getDeviceName = (ua?: string | null) => {
  if (!ua) return "Unknown device";
  if (ua.includes("Windows")) return "Windows PC";
  if (ua.includes("Macintosh")) return "Mac";
  if (ua.includes("Linux")) return "Linux Machine";
  if (ua.includes("Android")) return "Android Device";
  if (ua.includes("iPhone")) return "iPhone";
  if (ua.includes("iPad")) return "iPad";
  return "Web Browser";
};

onMounted(fetchSessions);
</script>
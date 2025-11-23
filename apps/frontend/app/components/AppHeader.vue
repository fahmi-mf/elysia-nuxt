<template>
  <UHeader>
    <template #left>
      <NuxtLink to="/" class="font-bold text-xl text-gray-900 dark:text-white">
        Elysia Nuxt
      </NuxtLink>
    </template>

    <template #right>
      <UColorModeButton />

      <ClientOnly>
        <template #default>
          <UDropdownMenu
            v-if="session.data"
            :items="userMenuItems"
            :content="{ align: 'end' }"
            :ui="{ content: 'w-64' }"
          >
            <UAvatar
              :alt="session.data.user.name ?? ''"
              :src="session.data.user.image ?? undefined"
              size="sm"
            />
          </UDropdownMenu>

          <div v-else class="flex items-center gap-2">
            <UButton
              to="/auth/login"
              label="Log In"
              color="neutral"
              variant="ghost"
            />
            <UButton
              to="/auth/register"
              label="Sign Up"
              color="primary"
            />
          </div>
        </template>

        <template #fallback>
          <USkeleton class="w-8 h-8 rounded-full" />
        </template>
      </ClientOnly>
    </template>
  </UHeader>
</template>

<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

const { $auth } = useNuxtApp();
const toast = useToast();

type SessionData = {
    session: {
        token: string;
        id: string; 
    };
    user: {
        id: string; 
        name: string;
        email: string;
        image?: string | null;
    };
};

const session = $auth.useSession();
const deviceSessions = ref<SessionData[]>([]);

const fetchSessions = async () => {
  if (session.value.data) {
    try {
      const { data, error } = await $auth.multiSession.listDeviceSessions();
      
      if (error) {
        console.error("Error fetching sessions:", error);
        return;
      }

      deviceSessions.value = (data as unknown as SessionData[]) || [];
    } catch (e) {
      console.error("Exception loading sessions:", e);
    }
  }
};

watch(() => session.value.data?.user.id, fetchSessions, { immediate: true });

const switchAccount = async (sessionToken: string) => {
  try {
    const { error } = await $auth.multiSession.setActive({ sessionToken });
    
    if (error) {
        toast.add({ title: "Switch Error", description: error.message, color: "error" });
    } else {
        window.location.reload(); 
    }
  } catch {
    toast.add({ title: "Error switching account", color: "error" });
  }
};

const handleSignOut = async () => {
  try {
    await $auth.signOut({
      fetchOptions: {
        onSuccess: () => {
            toast.add({ title: "Session closed", color: "success" });
            navigateTo("/auth/login");
        },
        onError: (ctx) => {
             toast.add({ title: "Error signing out", description: ctx.error.message, color: "error" });
        }
      }
    });
  } catch {
    toast.add({ title: "Unexpected error", color: "error" });
  }
};

const userMenuItems = computed<DropdownMenuItem[][]>(() => {
  const currentUserId = session.value.data?.user.id;

  const otherSessionsMap = new Map();
  deviceSessions.value.forEach((s) => {
    if (s.user.id !== currentUserId) {
        otherSessionsMap.set(s.user.id, s);
    }
  });
  
  const otherSessions = Array.from(otherSessionsMap.values());

  const otherSessionItems: DropdownMenuItem[] = otherSessions.map((s) => ({
    label: s.user.name || s.user.email,
    avatar: { src: s.user.image || undefined },
    icon: 'i-heroicons-arrow-path',
    onSelect: () => switchAccount(s.session.token)
  }));

  const switchAccountChildren: DropdownMenuItem[][] = [
    [{ label: "Current Session", type: "label" }],

    [{
      label: session.value.data?.user.name ?? 'User',
      avatar: { src: session.value.data?.user.image ?? undefined },
      checked: true,
      type: 'checkbox',
      onSelect: (e) => e.preventDefault()
    }],

    ...(otherSessions.length > 0 ? [[{ label: "Other Accounts", type: "label" as const }]] : []),

    ...(otherSessions.length > 0 ? [otherSessionItems] : []),

    [{
      label: "Add Account",
      icon: "i-heroicons-plus-circle",
      to: "/auth/login?addAccount=true"
    }]
  ];

  return [
    [
      {
        label: session.value.data?.user.name ?? 'User',
        avatar: {
          src: session.value.data?.user.image ?? undefined
        },
        type: 'label'
      }
    ],
    [
      {
        label: "Dashboard",
        icon: "i-heroicons-squares-2x2",
        to: "/dashboard",
      },
      {
        label: "Profile",
        icon: "i-heroicons-user",
        disabled: true,
      },
      {
        label: "Switch Account",
        icon: "i-heroicons-users",
        children: switchAccountChildren
      },
      {
        label: "Settings",
        icon: "i-heroicons-cog-6-tooth",
        to: "/settings",
      }
    ],
    [
      {
        label: "Sign out of all sessions",
        icon: "i-heroicons-arrow-left-on-rectangle",
        color: 'error',
        onSelect: handleSignOut,
      },
    ],
  ];
});
</script>
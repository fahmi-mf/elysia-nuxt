import { createAuthClient } from "better-auth/vue";
import { usernameClient, multiSessionClient, twoFactorClient } from "better-auth/client/plugins";
import { passkeyClient } from "@better-auth/passkey/client"

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();

  // --- CORRECTION FOR SSR ---
  // If we are on the server, we capture cookies from the incoming request.
  // If we are on the client, we let the browser handle them (undefined).
  const headers = import.meta.server ? useRequestHeaders(['cookie']) : undefined;

  const authClient = createAuthClient({
    baseURL: config.public.apiUrl,
    
    // We inject the headers (including the session cookie) into the client requests
    fetchOptions: {
      headers: headers
    },

    plugins: [
      usernameClient(),
      multiSessionClient(),
      passkeyClient(),
      twoFactorClient(),
    ],
  });

  return {
    provide: {
      auth: authClient,
    },
  };
});
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  modules: [
    "@nuxt/eslint",
    "@nuxt/hints",
    "@nuxt/scripts",
    "@nuxt/ui",
    "@vee-validate/nuxt",
    "@vueuse/nuxt",
    "@nuxtjs/i18n",
  ],

  css: ["~/assets/css/main.css"],

  i18n: {
    locales: [
      { code: 'en-US', name: 'English (US)', file: 'en-US.json' },
      { code: 'es-MX', name: 'Español (Mexico)', file: 'es-MX.json' }
    ],
    defaultLocale: 'en-US',
    langDir: 'locales',
    strategy: 'no_prefix',
    fallbackLocale: 'en-US'
  },

  devServer: {
    port: 4242,
  },

  runtimeConfig: {
    public: {
      apiUrl: process.env.NUXT_PUBLIC_API_URL,
    },
  },
});

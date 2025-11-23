export default defineNuxtRouteMiddleware(async () => {
  const { $auth } = useNuxtApp();
  const session = await $auth.getSession();

  if (!session.data) {
    return navigateTo("/auth/login");
  }
});
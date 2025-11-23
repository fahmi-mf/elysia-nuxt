export default defineNuxtRouteMiddleware(async (to) => {
  const { $auth } = useNuxtApp();
  const session = await $auth.getSession();

  if (to.query.addAccount === 'true') {
    return;
  }

  if (session.data) {
    return navigateTo("/dashboard");
  }
});
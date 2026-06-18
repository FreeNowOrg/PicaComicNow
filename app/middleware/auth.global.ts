export default defineNuxtRouteMiddleware(async (to) => {
  const user = useUserStore()

  if (!user.isLoggedIn && to.name !== 'auth') {
    try {
      await user.fetchProfile()
    } catch {
      console.warn('[App]', 'Verification information has expired')
      return navigateTo({
        path: '/auth',
        query: { from: to.fullPath, tips: '1' },
      })
    }
  }
})

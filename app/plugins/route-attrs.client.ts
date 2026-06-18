export default defineNuxtPlugin(() => {
  const router = useRouter()

  router.afterEach(({ name }) => {
    document.body.setAttribute('data-route', name as string)
    document.body.classList.remove('lock-scroll')
  })
})

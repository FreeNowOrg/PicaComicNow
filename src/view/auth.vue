<template lang="pug">
#auth-container
  h1 Authorization

  p.info.tips(v-if='$route.query.tips')
    .title Tips
    p You must log in to use this website

  section(v-if='user.data')
    .card
      h2 Sign out
      .align-center
        button(@click.prevent='handleSignOut') Sign out

  section(v-else)
    form.form.card.align-center(:class='{ "loading-cover": onAuthenticating }')
      h2(style='left: 0; transform: none') Login
      label
        strong Username/email
        input(v-model='email')
      label
        strong Password
        input(v-model='password', type='password')
      div
        button(@click.prevent='handleLogin') Login
      //- Error
      .info.error(v-if='errorMsg')
        .title {{ errorTitle }}
        p {{ errorMsg }}
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { setTitle } from '../utils/setTitle'
import { getErrMsg } from '../utils/getErrMsg'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const user = useUserStore()

const onAuthenticating = ref(false)
const email = ref('')
const password = ref('')
const token = ref('')
const errorTitle = ref('')
const errorMsg = ref('')

function handleLogin() {
  if (!email.value || !password.value) return

  onAuthenticating.value = true
  errorTitle.value = ''
  errorMsg.value = ''

  user
    .login(email.value, password.value)
    .then(
      (data) => {
        console.log('auth ok', data)
        return user.fetchProfile()
      },
      (err) => {
        console.warn('auth faild', err)
        errorTitle.value = 'Auth failed'
        errorMsg.value = getErrMsg(err)
      }
    )
    .then(
      (profile) => {
        console.log('profile ok', profile)
        if (route.query.from) {
          router.push(route.query.from as string)
        }
      },
      (err) => {
        console.warn('profile faild')
        errorTitle.value = 'Faild to get profile'
        errorMsg.value = getErrMsg(err)
      }
    )
    .finally(() => {
      onAuthenticating.value = false
    })
}

function handleSignOut() {
  window.Cookies.remove('PICA_TOKEN')
  location.reload()
}

onMounted(() => {
  setTitle('Authorization')
})
</script>

<style scoped lang="sass">
.form
  width: 60%
  margin: 0 auto
  padding: 2rem

  label
    display: flex
    margin: 1rem auto
    align-items: center

    strong
      margin-right: 1rem

    input
      flex: 1
      width: 100%
      padding: 4px 0.75rem
      font-size: 1rem
      line-height: 1.6
      border: none
      border-radius: 1em
      background-color: rgba(0, 0, 0, 0.05)
      outline: none
      &:hover
        box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.25)
      &:focus
        box-shadow: 0 0 0 2px var(--theme-accent-color)

  .info
    text-align: left
    margin-top: 1rem

@media (max-width: 600px)
  .form
    width: 90%
    label
      flex-direction: column
</style>

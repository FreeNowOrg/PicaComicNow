<template lang="pug">
h1 Home

h2 Login
section
  form.card.align-center(:class='{ "loading-cover": onAuthenticating }')
    label
      strong email
      input(v-model='email', type='email')
    label
      strong password
      input(v-model='password', type='password')
    div
      button(@click='handleLogin') Login
    //- OK
    .info.tips(v-if='token')
      .title Login succeeded
      p Your App token: <code>{{ token }}</code>
    //- Error
    .info.error(v-if='authError')
      .title Login faild
      p {{ authError }}
</template>

<script setup lang="ts">
import axios from 'axios'
import { onMounted, ref } from 'vue'
import { API_BASE } from '../config'
import { setTitle } from '../utils/setTitle'

const onAuthenticating = ref(false)
const email = ref('')
const password = ref('')
const token = ref('')
const authError = ref('')

function handleLogin(e) {
  e.preventDefault()
  onAuthenticating.value = true
  authError.value = ''
  console.log({
    email: email.value,
    password: password.value,
  })
  return

  axios({
    url: `${API_BASE}/auth`,
    method: 'POST',
    headers: {
      'cache-control': 'no-cache',
    },
    data: {
      email: email.value,
      password: password.value,
    },
  })
    .then(
      ({ data }: any) => {
        console.log('auth ok', data)
        token.value = data?.body?.token
      },
      (err) => {
        console.error('auth faild', err)
        authError.value =
          err?.response?.data?.message || err.message || 'HTTP Timeout'
      }
    )
    .finally(() => {
      onAuthenticating.value = false
    })
}

onMounted(() => {
  setTitle()
})
</script>

<style scoped lang="sass">
form
  label
    display: block
    margin-top: 1rem
    margin-bottom: 1rem
    strong
      display: block

  .info
    text-align: left
    margin-top: 1rem
</style>
<template lang="pug">
#auth-container
  h1 登录

  PicaMbox(v-if='$route.query.tips', type='info', header='提示', style='margin-bottom: 1rem')
    p 请先登录后使用

  section(v-if='user.profile')
    PicaCard
      h2 你好，{{ user.profile.name }}
      .align-center
        PicaButton(variant='primary', @click.prevent='handleSignOut') 退出登录

  section(v-else)
    PicaCard.form.align-center(:class='{ "loading-cover": onAuthenticating }')
      h2(style='left: 0; transform: none') 登录
      label
        strong 用户名/邮箱
        input.pica-input(v-model='email')
      label
        strong 密码
        input.pica-input(v-model='password', type='password')
      div
        PicaButton(variant='primary', @click.prevent='handleLogin') 登录
      //- Error
      PicaMbox(v-if='errorMsg', type='error')
        template(#header) {{ errorTitle }}
        p {{ errorMsg }}
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { setTitle } from '~/utils/setTitle'
import { getErrMsg } from '~/utils/getErrMsg'
import { useUserStore } from '~/stores/user'

const route = useRoute()
const router = useRouter()
const user = useUserStore()

const onAuthenticating = ref(false)
const email = ref('')
const password = ref('')
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
        errorTitle.value = '认证失败'
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
        errorTitle.value = '获取资料失败'
        errorMsg.value = getErrMsg(err)
      }
    )
    .finally(() => {
      onAuthenticating.value = false
    })
}

function handleSignOut() {
  user.logout()
}

onMounted(() => {
  setTitle('Authorization')
})
</script>

<style scoped lang="scss">
.form {
  width: 60%;
  margin: 0 auto;
  padding: 2rem;

  label {
    display: flex;
    margin: 1rem auto;
    align-items: center;

    strong {
      margin-right: 1rem;
      white-space: nowrap;
    }
  }
}

@media (max-width: 600px) {
  .form {
    width: 90%;

    label {
      flex-direction: column;
      align-items: flex-start;

      strong {
        margin-bottom: 0.5rem;
      }
    }
  }
}
</style>

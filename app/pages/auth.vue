<template lang="pug">
#auth-container
  h1 {{ user.profile ? '账户设置' : mode === 'login' ? '登录' : '注册' }}

  PicaMbox(v-if='$route.query.tips', type='info', header='提示', style='margin-bottom: 1rem')
    p 请先登录后使用

  section.account-section(v-if='user.profile')
    PicaCard
      h2 你好，{{ user.profile.name }}
      .account-actions
        NuxtLink(to='/profile')
          PicaButton(size='sm') 个人资料
        PicaButton(size='sm', variant='primary', @click.prevent='handleSignOut') 退出登录

    PicaCard.pwd-card
      h2 修改密码
      .pwd-form(:class='{ "loading-cover": pwdLoading }')
        label
          strong 旧密码
          input.pica-input(v-model='pwdForm.oldPassword', type='password')
        label
          strong 新密码
          input.pica-input(v-model='pwdForm.newPassword', type='password')
        label
          strong 确认密码
          input.pica-input(v-model='pwdForm.confirmPassword', type='password')
        .align-center
          PicaButton(
            variant='primary',
            :disabled='pwdLoading',
            @click.prevent='handleChangePassword'
          ) 修改密码
      PicaMbox(v-if='pwdError', type='error', style='margin-top: 0.75rem')
        template(#header) 修改失败
        p {{ pwdError }}
      PicaMbox(v-if='pwdSuccess', type='info', header='成功', style='margin-top: 0.75rem')
        p {{ pwdSuccess }}

  section(v-else)
    .mode-tabs
      button.tab(:class='{ active: mode === "login" }', @click='mode = "login"') 登录
      button.tab(:class='{ active: mode === "register" }', @click='mode = "register"') 注册

    //- Login form
    PicaCard.form.align-center(v-if='mode === "login"', :class='{ "loading-cover": loading }')
      label
        strong 用户名/邮箱
        input.pica-input(v-model='loginForm.email')
      label
        strong 密码
        input.pica-input(v-model='loginForm.password', type='password')
      div
        PicaButton(variant='primary', @click.prevent='handleLogin') 登录

    //- Register form
    PicaCard.form(v-if='mode === "register"', :class='{ "loading-cover": loading }')
      .form-section
        h3 基本信息
        label
          strong 昵称
          input.pica-input(v-model='regForm.name', placeholder='显示名称')
        label
          strong 用户名
          input.pica-input(v-model='regForm.email', placeholder='用于登录的用户名')
        label
          strong 密码
          input.pica-input(v-model='regForm.password', type='password')
        label
          strong 确认密码
          input.pica-input(v-model='regForm.passwordConfirm', type='password')
        label
          strong 生日
          input.pica-input(v-model='regForm.birthday', type='date')
        label
          strong 性别
          PicaSelect(
            :options='genderOptions',
            :model-value='regForm.gender',
            @update:model-value='setGender'
          )

      .form-section
        h3 安全问题
        p.hint 用于找回账户，请牢记答案
        .qa-group(v-for='(_, i) in regForm.questions', :key='i')
          label
            strong 问题 {{ i + 1 }}
            input.pica-input(v-model='regForm.questions[i]', :placeholder='`安全问题 ${i + 1}`')
          label
            strong 回答 {{ i + 1 }}
            input.pica-input(v-model='regForm.answers[i]', :placeholder='`回答 ${i + 1}`')

      .align-center
        PicaButton(variant='primary', @click.prevent='handleRegister') 注册

    //- Error / Success
    PicaMbox(v-if='errorMsg', type='error', style='margin-top: 1rem')
      template(#header) {{ errorTitle }}
      p {{ errorMsg }}
    PicaMbox(v-if='successMsg', type='info', header='成功', style='margin-top: 1rem')
      p {{ successMsg }}
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { setTitle } from '~/utils/setTitle'
import { getErrMsg } from '~/utils/getErrMsg'
import { useUserStore } from '~/stores/user'
import { picaClient } from '~/utils/pica-client'

const route = useRoute()
const router = useRouter()
const user = useUserStore()

const mode = ref<'login' | 'register'>('login')
const loading = ref(false)
const errorTitle = ref('')
const errorMsg = ref('')
const successMsg = ref('')

const loginForm = reactive({ email: '', password: '' })

const regForm = reactive({
  name: '',
  email: '',
  password: '',
  passwordConfirm: '',
  birthday: '2000-01-01',
  gender: 'm' as 'm' | 'f' | 'bot',
  questions: ['', '', ''],
  answers: ['', '', ''],
})

function setGender(v: string | number) {
  regForm.gender = v as 'm' | 'f' | 'bot'
}

const genderOptions = [
  { label: '男', value: 'm' },
  { label: '女', value: 'f' },
  { label: '机器人', value: 'bot' },
]

function clearMessages() {
  errorTitle.value = ''
  errorMsg.value = ''
  successMsg.value = ''
}

function handleLogin() {
  if (!loginForm.email || !loginForm.password) return

  loading.value = true
  clearMessages()

  user
    .login(loginForm.email, loginForm.password)
    .then(() => {
      if (route.query.from) {
        router.push(route.query.from as string)
      }
    })
    .catch((err) => {
      errorTitle.value = '登录失败'
      errorMsg.value = getErrMsg(err)
    })
    .finally(() => {
      loading.value = false
    })
}

function handleRegister() {
  if (!regForm.name || !regForm.email || !regForm.password) {
    errorTitle.value = '表单不完整'
    errorMsg.value = '请填写昵称、用户名和密码'
    return
  }
  if (regForm.password !== regForm.passwordConfirm) {
    errorTitle.value = '密码不一致'
    errorMsg.value = '两次输入的密码不一致'
    return
  }

  loading.value = true
  clearMessages()

  const payload = {
    name: regForm.name,
    email: regForm.email,
    password: regForm.password,
    birthday: regForm.birthday,
    gender: regForm.gender,
    question1: regForm.questions[0],
    question2: regForm.questions[1],
    question3: regForm.questions[2],
    answer1: regForm.answers[0],
    answer2: regForm.answers[1],
    answer3: regForm.answers[2],
  }
  user
    .register(payload)
    .then(() => {
      successMsg.value = '注册成功，请登录'
      mode.value = 'login'
      loginForm.email = regForm.email
      loginForm.password = ''
    })
    .catch((err) => {
      errorTitle.value = '注册失败'
      errorMsg.value = getErrMsg(err)
    })
    .finally(() => {
      loading.value = false
    })
}

const pwdForm = reactive({ oldPassword: '', newPassword: '', confirmPassword: '' })
const pwdLoading = ref(false)
const pwdError = ref('')
const pwdSuccess = ref('')

async function handleChangePassword() {
  pwdError.value = ''
  pwdSuccess.value = ''

  if (!pwdForm.oldPassword || !pwdForm.newPassword) {
    pwdError.value = '请填写旧密码和新密码'
    return
  }
  if (pwdForm.newPassword !== pwdForm.confirmPassword) {
    pwdError.value = '两次输入的新密码不一致'
    return
  }

  pwdLoading.value = true
  try {
    await picaClient.changePassword(pwdForm.oldPassword, pwdForm.newPassword)
    pwdSuccess.value = '密码修改成功，请重新登录'
    pwdForm.oldPassword = ''
    pwdForm.newPassword = ''
    pwdForm.confirmPassword = ''
    setTimeout(() => user.logout(), 2000)
  } catch (e) {
    pwdError.value = getErrMsg(e)
  } finally {
    pwdLoading.value = false
  }
}

function handleSignOut() {
  user.logout()
}

onMounted(() => {
  setTitle('Authorization')
})
</script>

<style scoped lang="scss">
.account-section {
  max-width: 500px;
  margin: 0 auto;

  .account-actions {
    display: flex;
    justify-content: center;
    gap: 0.5rem;
    margin-top: 0.75rem;

    a { text-decoration: none; }
  }
}

.pwd-card {
  margin-top: 1.25rem;

  h2 {
    margin: 0 0 0.75rem;
    display: inline-block;
    left: unset;
    transform: none;
    padding: 0.1em 0.5em;
  }

  label {
    display: flex;
    align-items: center;
    margin: 0.75rem 0;

    strong {
      min-width: 5.5rem;
      margin-right: 0.75rem;
      white-space: nowrap;
      font-size: 0.9rem;
    }

    input { flex: 1; }
  }
}

.mode-tabs {
  display: flex;
  max-width: 500px;
  margin: 0 auto 1rem;

  .tab {
    flex: 1;
    padding: 0.5rem 1rem;
    font-weight: 700;
    font-size: 1rem;
    border: 2px solid #000;
    background: #fff;
    cursor: pointer;
    transition: all 0.15s;

    &:first-child { border-right: none; }

    &.active {
      background: #FF5C8A;
      color: #fff;
    }

    &:not(.active):hover {
      background: #FFE066;
    }
  }
}

.form {
  max-width: 500px;
  margin: 0 auto;
  padding: 1.5rem;

  label {
    display: flex;
    margin: 0.75rem 0;
    align-items: center;

    strong {
      min-width: 5.5rem;
      margin-right: 0.75rem;
      white-space: nowrap;
      font-size: 0.9rem;
    }

    input, .pica-select {
      flex: 1;
    }
  }
}

.form-section {
  margin-bottom: 1.5rem;

  h3 {
    margin: 0 0 0.5rem;
    font-size: 1rem;
    padding: 0.2em 0.5em;
    background: #FFE066;
    border: 2px solid #000;
    display: inline-block;
  }

  .hint {
    font-size: 0.8rem;
    color: #888;
    margin: 0 0 0.5rem;
  }
}

.qa-group {
  padding: 0.5rem 0;
  border-bottom: 1px dashed #ddd;

  &:last-child { border-bottom: none; }
}

@media (max-width: 600px) {
  .form {
    label {
      flex-direction: column;
      align-items: flex-start;

      strong {
        margin-bottom: 0.25rem;
      }

      input, .pica-select {
        width: 100%;
      }
    }
  }
}
</style>

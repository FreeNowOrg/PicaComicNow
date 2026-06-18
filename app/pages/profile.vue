<template lang="pug">
#profile-container
  .bread-crumb
    NuxtLink(to='/') 首页
    span 个人资料

  section.profile-layout(v-if='user.profile')
    .profile-left
      PicaCard.profile-card
        .avatar-area
          img.avatar(:src='user.profile.avatar?.fileUrl || DEFAULT_AVATAR')
        h1.name {{ user.profile.name }}
        .badges
          span.badge {{ user.profile.title }}
          span.level Lv.{{ user.profile.level }}
        .uid @{{ user.profile.email }}
        .profile-meta
          .meta-row
            i.i-fa6-solid-venus-mars
            | {{ genderLabel }}
          .meta-row
            i.i-fa6-solid-calendar
            | 注册于 {{ formatDate(user.profile.created_at) }}
          .meta-row
            i.i-fa6-solid-star
            | 经验值 {{ user.profile.exp }}
          .meta-row
            i.i-fa6-solid-circle-check(v-if='user.profile.isPunched')
            i.i-fa6-regular-circle(v-else)
            | {{ user.profile.isPunched ? '今日已签到' : '今日未签到' }}
        .profile-actions
          PicaButton(
            size='sm',
            :variant='user.profile.isPunched ? "default" : "primary"',
            :disabled='user.profile.isPunched || punchLoading',
            @click='handlePunch'
          ) {{ user.profile.isPunched ? '已签到' : '签到' }}
          NuxtLink(to='/favourite')
            PicaButton(size='sm') 我的收藏

    .profile-right
      PicaCard.slogan-card
        .slogan-header
          h2 个性签名
          PicaButton(v-if='!sloganEdit', size='sm', @click='startEdit') 编辑
        .slogan-view(v-if='!sloganEdit', :class='{ "loading-cover": sloganLoading }')
          p.slogan-text {{ user.profile.slogan || '这个人很懒，什么都没写...' }}
        .slogan-edit(v-else)
          textarea.pica-input(v-model='sloganInput', rows='3')
          .edit-actions
            PicaButton(size='sm', @click='sloganEdit = false') 取消
            PicaButton(size='sm', variant='primary', :disabled='sloganLoading', @click='handleSloganEdit') 保存

  section.no-profile(v-else)
    PicaCard
      .no-profile-inner
        i.i-fa6-solid-user-slash.no-profile-icon
        h2 请先登录
        p 登录后可查看和编辑个人资料
        NuxtLink(to='/auth')
          PicaButton(variant='primary') 前往登录
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { setTitle } from '~/utils/setTitle'
import { useUserStore } from '~/stores/user'
import { picaClient } from '~/utils/pica-client'
import { DEFAULT_AVATAR } from '~/utils/config'

const user = useUserStore()

const sloganEdit = ref(false)
const sloganInput = ref('')
const sloganLoading = ref(false)
const punchLoading = ref(false)

const genderLabel = computed(() => {
  const m: Record<string, string> = { m: '男', f: '女', bot: '机器人' }
  return m[user.profile?.gender || ''] || '未知'
})

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
}

function startEdit() {
  sloganInput.value = user.profile?.slogan || ''
  sloganEdit.value = true
}

function handleSloganEdit() {
  sloganLoading.value = true
  sloganEdit.value = false
  picaClient
    .updateSlogan(sloganInput.value)
    .then(() => user.fetchProfile())
    .catch((e) => console.warn('Failed to modify slogan', e))
    .finally(() => { sloganLoading.value = false })
}

async function handlePunch() {
  punchLoading.value = true
  try {
    await picaClient.http.post('/users/punch-in')
    await user.fetchProfile()
  } catch (e) {
    console.warn('Punch-in failed', e)
  } finally {
    punchLoading.value = false
  }
}

watch(
  computed(() => user.profile),
  (val) => { if (val) sloganInput.value = val.slogan }
)

onMounted(() => setTitle('个人资料'))
</script>

<style scoped lang="scss">
.profile-layout {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 1.25rem;
  align-items: start;
}

.profile-card {
  text-align: center;
}

.avatar-area {
  margin-bottom: 1rem;

  .avatar {
    width: 96px;
    height: 96px;
    border: 3px solid #000;
    box-shadow: 4px 4px 0 0 #000;
    display: block;
    margin: 0 auto;
    object-fit: cover;
  }
}

h1.name {
  margin: 0;
  font-size: 1.5rem;
}

.badges {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin: 0.5rem 0;

  .badge {
    background: #FF5C8A;
    color: #fff;
    padding: 1px 8px;
    border: 2px solid #000;
    font-size: 0.75rem;
    font-weight: 700;
  }

  .level {
    font-size: 0.75rem;
    font-weight: 700;
    color: #888;
  }
}

.uid {
  font-size: 0.8rem;
  color: #888;
  margin-bottom: 1rem;
}

.profile-meta {
  text-align: left;
  border-top: 2px solid #000;
  padding-top: 0.75rem;
  margin-top: 0.5rem;

  .meta-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.85rem;
    font-weight: 600;
    padding: 0.25rem 0;

    i {
      width: 1rem;
      text-align: center;
      color: #FF5C8A;
    }
  }
}

.profile-actions {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1rem;
  padding-top: 0.75rem;
  border-top: 2px solid #000;

  a { text-decoration: none; }
}

.slogan-card {
  .slogan-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.75rem;

    h2 {
      margin: 0;
      display: inline-block;
      left: unset;
      transform: none;
      padding: 0.1em 0.5em;
    }
  }

  .slogan-text {
    white-space: pre-wrap;
    line-height: 1.6;
    margin: 0;
    min-height: 3rem;
  }

  textarea {
    width: 100%;
    min-height: 5rem;
    resize: vertical;
  }

  .edit-actions {
    display: flex;
    gap: 0.5rem;
    justify-content: flex-end;
    margin-top: 0.75rem;
  }
}

.no-profile {
  max-width: 500px;
  margin: 0 auto;
}

.no-profile-inner {
  text-align: center;
  padding: 2rem 1rem;

  .no-profile-icon {
    font-size: 3rem;
    color: #ccc;
    margin-bottom: 1rem;
  }

  h2 {
    left: unset;
    transform: none;
    background: none;
    border: none;
    padding: 0;
  }

  p {
    color: #888;
    margin-bottom: 1.5rem;
  }

  a { text-decoration: none; }
}

@media (max-width: 800px) {
  .profile-layout {
    grid-template-columns: 1fr;
  }
}
</style>

<template lang="pug">
.user-card
  template(v-if='user.profile')
    .user-info
      img.user-avatar(:src='user.profile.avatar?.fileUrl || DEFAULT_AVATAR')
      .user-details
        .user-name {{ user.profile.name }}
        .user-level
          span.badge {{ user.profile.title }}
          span.level Lv.{{ user.profile.level }}
    .user-actions
      PicaButton(
        size='sm',
        :variant='user.profile.isPunched ? "default" : "primary"',
        :disabled='user.profile.isPunched',
        @click='handlePunch'
      ) {{ user.profile.isPunched ? '已签到' : '签到' }}
      NuxtLink(to='/favourite')
        PicaButton(size='sm') 我的收藏
  template(v-else)
    .user-info
      img.user-avatar(:src='DEFAULT_AVATAR')
      .user-details
        .user-name 请先登录以使用完整功能
    .user-actions
      NuxtLink(to='/auth')
        PicaButton(size='sm', variant='primary') 登录
</template>

<script setup lang="ts">
import { useUserStore } from '~/stores/user'
import { DEFAULT_AVATAR } from '~/utils/config'
import { picaClient } from '~/utils/pica-client'

const user = useUserStore()

async function handlePunch() {
  try {
    await picaClient.http.post('/users/punch-in')
    await user.fetchProfile()
  } catch (e) {
    console.warn('Punch-in failed', e)
  }
}
</script>

<style scoped lang="scss">
.user-card {
  border: 2px solid #000;
  background: #fff;
  padding: 0.75rem 1rem;
  margin-bottom: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-avatar {
  width: 48px;
  height: 48px;
  border: 2px solid #000;
  display: block;
  object-fit: cover;
}

.user-details {
  .user-name {
    font-weight: 900;
    font-size: 1rem;
  }

  .user-level {
    display: flex;
    gap: 0.5rem;
    margin-top: 2px;
    font-size: 0.75rem;
    font-weight: 700;
  }

  .badge {
    background: #FF5C8A;
    color: #fff;
    padding: 0 6px;
    border: 1px solid #000;
  }

  .level {
    color: #888;
  }
}

.user-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;

  a {
    text-decoration: none;
  }
}
</style>

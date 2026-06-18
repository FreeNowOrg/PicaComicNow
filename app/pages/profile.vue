<template lang="pug">
#profile-container
  section.user-profile(v-if='user.profile')
    //- h1 My Profile
    PicaCard.metadata.align-center
      .avatar
        img.pica-border(:src='user.profile?.avatar?.fileUrl || DEFAULT_AVATAR')
      h1.name {{ user.profile.name }}
      .extra
        span.title {{ user.profile.title }}
        | &nbsp;
        span.uid @{{ user.profile.email }}
    PicaCard.slogan
      h2 个性签名
      .slogan-view.flex(
        v-if='!sloganEdit',
        :class='{ "loading-cover": sloganLoading }'
      )
        p.pre.flex-1 {{ user.profile.slogan || '-' }}
        .edit-btn
          PicaButton(size='sm', @click='sloganEdit = true') 编辑
      .slogan-edit(v-else)
        .flex
          label.flex-1(for='sloganEdit')
            strong 更新签名
          .cancel-btn
            PicaButton(size='sm', @click='sloganEdit = false') 取消
        .flex.gap-1
          .edit-area.flex-1
            textarea#sloganEdit.pica-input(v-model='sloganInput')
          .btn-area
            PicaButton(variant='primary', size='sm', :disabled='sloganLoading', @click='handleSloganEdit') 提交
    PicaCard
      details
        pre {{ user.profile }}

  section.user-profile.no-profile(v-else)
    h1.name 请先登录
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

function handleSloganEdit() {
  sloganLoading.value = true
  sloganEdit.value = false
  picaClient
    .updateSlogan(sloganInput.value)
    .then(() => {
      return user.fetchProfile()
    })
    .then(() => {
      sloganLoading.value = false
    })
    .catch((e) => {
      sloganLoading.value = false
      console.warn('Faild to modify slogan', e)
    })
}

watch(
  computed(() => user.profile),
  (val) => {
    if (val) {
      sloganInput.value = val.slogan
    }
  }
)

onMounted(() => {
  setTitle('User Profile')
})
</script>

<style scoped lang="scss">
.pica-card {
  margin-bottom: 1rem;
}

.metadata {
  margin-top: 50px;
  position: relative;
  padding-top: 50px;

  .avatar {
    position: absolute;
    left: 50%;
    top: -40px;
    transform: translateX(-50%);

    img {
      width: 80px;
      height: 80px;
      border-radius: 0;
      box-shadow: 0 0 0 4px #fff, 0 0 0 6px #000;
    }
  }

  h1.name {
    margin: 0.4rem auto 0 auto;
    font-size: 1.8rem;
  }

  .title {
    display: inline-block;
    padding: 2px 6px;
    background-color: #ff5c8a;
    color: #000;
    border: 2px solid #000;
    border-radius: 0;
    font-size: 0.8rem;
    font-weight: 700;
  }

  .uid {
    font-size: 0.8rem;
    font-weight: 400;
    font-style: italic;
    color: #888;
    margin: 0.2rem auto;
  }
}

.slogan-edit {
  label {
    line-height: 2;
  }

  .edit-area {
    textarea {
      width: 100%;
      min-height: 4rem;
      resize: vertical;
    }
  }

  .btn-area {
    display: flex;
    align-items: end;
  }
}
</style>

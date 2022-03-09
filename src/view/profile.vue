<template lang="pug">
#profile-container
  section.user-profile
    //- h1 My Profile
    .card.metadata.align-center
      .avatar
        img(src='https://i.loli.net/2021/03/26/QPOtzh1XbF2eujd.png')
      h1.name {{ userData.name }}
      .extra
        span.title {{ userData.title }}
        | &nbsp;
        span.uid @{{ userData.email }}
    .card.slogan
      h2 Slogan
      .slogan-view.flex(
        v-if='!sloganEdit',
        :class='{ "loading-cover": sloganLoading }'
      )
        p.pre.flex-1 {{ userData.slogan || "-" }}
        .edit-btn
          a.pointer(@click='sloganEdit = true') edit
      .slogan-edit(v-else)
        .flex
          label.flex-1(for='sloganEdit')
            strong Update slogan
          .cancel-btn
            a.pointer(@click='sloganEdit = false') cancel
        .flex.gap-1
          .edit-area.flex-1
            textarea#sloganEdit(v-model='sloganInput')
          .btn-area
            button(:disabled='sloganLoading', @click='handleSloganEdit') Submit

    .card
      details
        pre {{ userData }}
</template>

<script setup lang="ts">
import axios from 'axios'
import { onMounted, ref, watch } from 'vue'

import { getProfile, userData } from '../components/userData'
import { API_BASE } from '../config'
import { setTitle } from '../utils/setTitle'

const sloganEdit = ref(false)
const sloganInput = ref('')
const sloganLoading = ref(false)

function handleSloganEdit() {
  sloganLoading.value = true
  sloganEdit.value = false
  axios
    .put(`${API_BASE}/users/profile`, {
      slogan: sloganInput.value,
    })
    .then(() => {
      return getProfile()
    })
    .then(() => {
      sloganLoading.value = false
    })
    .catch((e) => {
      sloganLoading.value = false
      console.warn('Faild to modify slogan', e)
    })
}

watch(userData, (val) => {
  sloganInput.value = val?.slogan as string
})

onMounted(() => {
  setTitle('User Profile')
})
</script>

<style scoped lang="sass">
.card
  margin-bottom: 1rem

.metadata
  margin-top: 50px
  position: relative
  padding-top: 50px
  .avatar
    position: absolute
    left: 50%
    top: -40px
    transform: translateX(-50%)
    img
      width: 80px
      height: 80px
      border-radius: 50%
      box-shadow: 0 0 0 4px #fff
  h1.name
    margin: 0.4rem auto 0 auto
    font-size: 1.8rem
  .title
    display: inline-block
    padding: 2px 4px
    background-color: #888
    color: #fff
    border-radius: 4px
    font-size: 0.8rem
  .uid
    font-size: 0.8rem
    font-weight: 400
    font-style: italic
    color: #888
    margin: 0.2rem auto

.slogan-edit
  label
    line-height: 2
  .edit-area
    textarea
      width: 100%
      min-height: 4rem
      resize: vertical
  .btn-area
    display: flex
    align-items: end
</style>
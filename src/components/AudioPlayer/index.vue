<script setup lang="ts">
import { useWebSocket } from '@vueuse/core'
import { onBeforeUnmount, ref, watch } from 'vue'
import { AudioPlayer } from './audioPlayer'

const play = ref(false)
const audioPlayer = ref<AudioPlayer | null>(null)
const { data, open, close } = useWebSocket(`${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}/audio`, {
  immediate: false,
})

function togglePlay() {
  play.value = !play.value
  if (play.value) {
    audioPlayer.value?.destroy()
    audioPlayer.value = new AudioPlayer()
    open()
  }
  else {
    close()
    audioPlayer.value?.destroy()
    audioPlayer.value = null
  }
}

watch(data, (newData: Blob) => {
  if (newData && audioPlayer.value) {
    newData.arrayBuffer().then((buffer) => {
      audioPlayer.value!.play(buffer)
    })
  }
})

onBeforeUnmount(() => {
  audioPlayer.value?.destroy()
})
</script>

<template>
  <v-btn
    v-if="play"
    icon="mdi-volume-high"
    @click="togglePlay"
  />
  <v-btn
    v-else
    icon="mdi-volume-off"
    @click="togglePlay"
  />
</template>

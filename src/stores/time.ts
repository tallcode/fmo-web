import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import relativeTime from 'dayjs/plugin/relativeTime'
import fetchJsonp from 'fetch-jsonp'
import { defineStore } from 'pinia'
import { computed, onMounted } from 'vue'

dayjs.extend(duration)
dayjs.extend(relativeTime)

let diff: number | undefined
async function getServerTime() {
  if (diff !== undefined) {
    return Date.now() - diff
  }
  return fetchJsonp('//t.alicdn.com/t/gettime').then(response => response.json()).then((data: { time: number }) => data.time * 1000).then((time) => {
    diff = Date.now() - time
    return time
  }).catch(() => {
    return Date.now() - (diff === undefined ? 0 : diff)
  })
}

export const useTimeStore = defineStore('time', () => {
  const currentTime = computed (() => Date.now() - (diff === undefined ? 0 : diff))

  onMounted(async () => {
    if (diff === undefined) {
      await getServerTime()
    }
  })

  function formatTime(time: number) {
    return dayjs(time).format('YYYY-MM-DD HH:mm:ss')
  }

  function formatDuration(time: number, suffix = false) {
    return dayjs.duration(time - currentTime.value).humanize(suffix)
  }

  return {
    currentTime,
    formatTime,
    formatDuration,
  }
})

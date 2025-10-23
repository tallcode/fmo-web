import { useTimeoutPoll } from '@vueuse/core'
import axios from 'axios'
import { defineStore } from 'pinia'
import { ref } from 'vue'

// async function getCount() {
//   const response = await axios.get<{ count: number }>('/api/count', { responseType: 'json' })
//   return response.data.count || 0
// }

async function getClient() {
  const response = await axios.get<string[]>('/api/client', { responseType: 'json' })
  return Array.isArray(response.data) ? response.data : []
}

export const useStatusStore = defineStore('status', () => {
  const clients = ref<string[]>([])
  // const count = ref(0)

  async function refresh() {
    clients.value = await getClient().catch(() => [])
    // count.value = await getCount().catch(() => 0)
  }

  useTimeoutPoll(refresh, 1000, {
    immediateCallback: true,
  })

  return {
    clients,
    // count,
  }
})

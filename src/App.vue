<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useStatusStore } from './stores/status'
import { useTimeStore } from './stores/time'

const { clients } = storeToRefs(useStatusStore())
const { formatDuration } = useTimeStore()
</script>

<template>
  <v-app>
    <v-app-bar :elevation="2">
      <v-app-bar-title>
        FMO<span>&nbsp;&nbsp;</span><span class="text-caption">杭州中继</span>
      </v-app-bar-title>
    </v-app-bar>

    <v-main>
      <v-list v-if="clients.length > 0">
        <v-list-item
          v-for="client in clients"
          :key="client.clientId"
        >
          <v-list-item-title>{{ client.callsign }}</v-list-item-title>
          <template #append>
            <v-list-item-action class="flex-column align-end">
              <small class="text-high-emphasis opacity-60">{{ formatDuration(client.connectedAt, true) }}</small>
            </v-list-item-action>
          </template>
        </v-list-item>
      </v-list>
    </v-main>
  </v-app>
</template>

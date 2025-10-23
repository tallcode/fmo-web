<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useStatusStore } from './stores/status'

const { clients } = storeToRefs(useStatusStore())
</script>

<template>
  <v-app>
    <v-app-bar :elevation="2">
      <v-app-bar-title>
        FMO<span>&nbsp;&nbsp;</span><span class="text-caption">杭州中继</span>
      </v-app-bar-title>
    </v-app-bar>

    <v-main>
      <v-list
        v-if="clients.length > 0"
        :items="clients"
      />
    </v-main>
  </v-app>
</template>

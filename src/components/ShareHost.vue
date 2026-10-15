<template>
  <MxShareSheet
    v-model="share.open"
    data-testid="share-host"
    :loading="share.loading"
    :payload="share.payload"
    :qr="share.qr"
    :title="share.title"
  />
</template>

<script lang="ts" setup>
  import { MxShareSheet } from '@pedrolucaslopes/mixtape-ui'
  import { useShareStore } from '@/stores/share'

  const share = useShareStore()
</script>

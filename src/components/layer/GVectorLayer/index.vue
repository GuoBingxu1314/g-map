<script setup lang="ts">
import { inject, onBeforeUnmount, provide } from 'vue';

import VectorLayer from 'ol/layer/Vector';

import { MAP_KEY, VECTOR_LAYER_KEY } from '@/context/keys';

defineOptions({
  name: 'GVectorLayer',
});

const map = inject(MAP_KEY);

if (!map) {
  throw new Error('[GVectorLayer] must be used within a [GMap]');
}

const layer = new VectorLayer({
  zIndex: 100,
});

map.addLayer(layer);

provide(VECTOR_LAYER_KEY, layer);

onBeforeUnmount(() => {
  map.removeLayer(layer);
})
</script>

<template>
  <slot />
</template>

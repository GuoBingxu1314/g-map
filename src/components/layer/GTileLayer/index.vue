<script setup lang="ts">
import { inject, onBeforeUnmount, provide } from 'vue';

import TileLayer from 'ol/layer/Tile';

import { MAP_KEY, TILE_LAYER_KEY } from '@/context/keys';

defineOptions({
  name: 'GTileLayer',
});

const map = inject(MAP_KEY);

if (!map) {
  throw new Error('[GTileLayer] must be used inside [GMap]');
}

const layer = new TileLayer();

map.addLayer(layer);

provide(TILE_LAYER_KEY, layer);

onBeforeUnmount(() => {
  map.removeLayer(layer);
})
</script>

<template>
  <slot />
</template>

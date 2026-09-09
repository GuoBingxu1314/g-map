<script setup lang="ts">
import { inject } from 'vue';

import OSM from 'ol/source/OSM';

import { TILE_LAYER_KEY } from '@/context/keys';

defineOptions({
  name: 'GOsmSource',
});

const layer = inject(TILE_LAYER_KEY);

if (!layer) {
  throw new Error('[GOsmSource] must be used inside [GTileLayer]');
}

const source = new OSM();

layer.setSource(source);
</script>

<template>
  <slot />
</template>

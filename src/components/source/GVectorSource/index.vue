<script setup lang="ts">
import { inject, provide } from 'vue';

import VectorSource from 'ol/source/Vector';

import { VECTOR_LAYER_KEY, VECTOR_SOURCE_KEY } from '@/context/keys';

defineOptions({
  name: 'GVectorSource',
});

const layer = inject(VECTOR_LAYER_KEY);

if (!layer) {
  throw new Error('[GVectorSource] must be used within a [GVectorLayer]');
}

const source = new VectorSource();

layer.setSource(source);

provide(VECTOR_SOURCE_KEY, source);
</script>

<template>
  <slot />
</template>

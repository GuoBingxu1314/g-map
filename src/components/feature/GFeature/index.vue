<script setup lang="ts">
import type { GFeatureEvent } from '@/context/feature/events';

import { inject, onBeforeUnmount, provide, watch } from 'vue';

import Feature from 'ol/Feature';

import { FEATURE_KEY, VECTOR_SOURCE_KEY } from '@/context/keys';

import { registerFeatureEvents, unregisterFeatureEvents } from '@/context/feature/events';
import { registerFeatureSource, unregisterFeatureSource } from '@/context/feature/source';
import { removeFeatureState } from '@/context/feature/state';

defineOptions({
  name: 'GFeature',
});

interface Props {
  id?: string | number;
  properties?: Record<string, unknown>;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  click: [event: GFeatureEvent];
  dblclick: [event: GFeatureEvent];
  mouseenter: [event: GFeatureEvent];
  mouseleave: [event: GFeatureEvent];
  select: [event: GFeatureEvent];
  unselect: [event: GFeatureEvent];
}>();

const source = inject(VECTOR_SOURCE_KEY);

if (!source) {
  throw new Error('[GFeature] must be used within a [GVectorSource]');
}

const feature = new Feature();
source.addFeature(feature);

registerFeatureSource(feature, source);

provide(FEATURE_KEY, feature);

function updateId() {
  feature.setId(props.id);
}

let previousProperties: Record<string, unknown> = {};

function updateProperties(properties: Record<string, unknown>) {
  Object.keys(previousProperties).forEach(key => {
    if (!(key in properties)) {
      feature.unset(key);
    }
  });

  feature.setProperties(properties);

  previousProperties = {
    ...properties,
  };
}

updateId();
updateProperties(props.properties ?? {})

watch(
  () => props.id,
  id => {
    feature.setId(id);
  }
)

watch(
  () => props.properties,
  properties => {
    updateProperties(properties ?? {});
  },
  { deep: true },
)

registerFeatureEvents(feature, {
  singleclick: event => emit('click', event),
  dblclick: event => emit('dblclick', event),
  mouseenter: event => emit('mouseenter', event),
  mouseleave: event => emit('mouseleave', event),
  select: event => emit('select', event),
  unselect: event => emit('unselect', event),
})

onBeforeUnmount(() => {
  if (source.hasFeature(feature)) {
    source.removeFeature(feature);
  }
  unregisterFeatureEvents(feature);
  unregisterFeatureSource(feature);
  removeFeatureState(feature);
});
</script>

<template>
  <slot />
</template>

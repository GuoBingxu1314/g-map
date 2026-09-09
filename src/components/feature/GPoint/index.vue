<script setup lang="ts">
import type { PointStyleOptions, ResolvedPointStyleOptions } from '@/styles/point';

import { inject, onBeforeUnmount, onMounted, nextTick, ref, watch } from 'vue';

import Point from 'ol/geom/Point';
import Style from 'ol/style/Style';
import CircleStyle from 'ol/style/Circle';
import Icon from 'ol/style/Icon';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';

import { fromLonLat, toLonLat } from 'ol/proj';

import { MAP_KEY, FEATURE_KEY } from '@/context/keys';

import { createPointStyle, resolvePointStyleOptions } from '@/styles/point';
import { updateIconScale } from '@/utils/iconScale.js';
import { createIconStyle } from '@/styles/icon';

defineOptions({
  name: 'GPoint',
});

interface Props extends PointStyleOptions {
  // 经纬度
  coordinates: [number, number];
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:coordinates': [
    coordinates: [number, number],
  ];
}>();

const map = inject(MAP_KEY);
if (!map) {
  throw new Error('[GPoint] must be used inside [GMap]');
}

const feature = inject(FEATURE_KEY);
if (!feature) {
  throw new Error('[GPoint] must be used inside [GFeature]');
}

// 一个 GFeature 只能拥有一个 Geometry
if (feature.getGeometry()) {
  throw new Error('[GPoint] A GFeature can only contain one geometry');
}

// --------------------------------------------------
// Slot Icon
// --------------------------------------------------

const iconContainer = ref<HTMLElement>();

/**
 * 判断当前是否存在 icon Slot
 */
function hasSlotIcon() {
  return !!iconContainer.value?.querySelector('svg');
}

/**
 * 将 Slot 中的 SVG 转成 Data URL
 */
function getSlotIconSrc() {
  const svg = iconContainer.value?.querySelector('svg');

  if (!svg) {
    return undefined;
  }

  const clone = svg.cloneNode(true) as SVGElement;

  if (!clone.getAttribute('xmlns')) {
    clone.setAttribute(
      'xmlns',
      'http://www.w3.org/2000/svg',
    );
  }

  if (!clone.getAttribute('xmlns:xlink')) {
    clone.setAttribute(
      'xmlns:xlink',
      'http://www.w3.org/1999/xlink',
    );
  }

  const serializer = new XMLSerializer();
  const svgText = serializer.serializeToString(clone);

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgText)}`;
}

// --------------------------------------------------
// Style
// --------------------------------------------------

let slotObserver: MutationObserver | undefined;

let currentIcon: Icon | undefined;
let currentStyle: Style | undefined;

let currentCircle: CircleStyle | undefined;
let currentFill: Fill | undefined;
let currentStroke: Stroke | undefined;

/**
 * 获取完整的 Style 配置
 *
 * Props 是可选的，所以这里统一补齐默认值。
 */
function getStyleOptions(): ResolvedPointStyleOptions {
  return resolvePointStyleOptions(props);
}

/**
 * 清理当前 Style 引用
 */
function resetCurrentStyle() {
  currentIcon = undefined;
  currentStyle = undefined;
  currentCircle = undefined;
  currentFill = undefined;
  currentStroke = undefined;
}

// --------------------------------------------------
// Point
// --------------------------------------------------

const point = new Point(
  fromLonLat(props.coordinates),
);

feature.setGeometry(point);

/**
 * Point -> Vue
 */
function handlePointChange() {
  const coordinates = point.getCoordinates();

  emit(
    'update:coordinates',
    toLonLat(coordinates) as [number, number],
  );
}

point.on('change', handlePointChange);

/**
 * Vue -> Point
 */
function updateCoordinates(
  coordinates: [number, number],
) {
  const next = fromLonLat(coordinates);
  const current = point.getCoordinates();

  if (
    current[0] === next[0] &&
    current[1] === next[1]
  ) {
    return;
  }

  point.setCoordinates(next);
}

// --------------------------------------------------
// Circle Style
// --------------------------------------------------

function createCircleStyle() {
  const options = getStyleOptions();

  const result = createPointStyle({
    color: options.color,
    radius: options.radius,
    strokeColor: options.strokeColor,
    strokeWidth: options.strokeWidth,
    opacity: options.opacity,
    zIndex: options.zIndex,
  });

  currentFill = result.fill;
  currentStroke = result.stroke;
  currentCircle = result.circle;
  currentStyle = result.style;

  return result.style;
}

// --------------------------------------------------
// Image Style
// --------------------------------------------------

function createPointIconStyle() {
  const options = getStyleOptions();

  if (!options.icon.src) {
    resetCurrentStyle();

    return undefined;
  }

  const result = createPointStyle({
    icon: {
      src: options.icon.src,
      size: options.icon.size,
      anchor: options.icon.anchor,
      anchorOrigin: options.icon.anchorOrigin,
      offset: options.icon.offset,
      rotation: options.icon.rotation,
    },
    opacity: options.opacity,
    zIndex: options.zIndex,
  });

  currentIcon = result.icon;
  currentStyle = result.style;

  return result.style;
}

// --------------------------------------------------
// Slot Icon Style
// --------------------------------------------------

function createSlotIconStyle() {
  const src = getSlotIconSrc();

  if (!src) {
    resetCurrentStyle();

    return undefined;
  }

  const options = getStyleOptions();

  const icon = createIconStyle({
    src,
    anchor: options.icon.anchor,
    anchorOrigin: options.icon.anchorOrigin,
    offset: options.icon.offset,
    rotation: options.icon.rotation,
    opacity: options.opacity,
  });

  currentIcon = icon;

  const style = new Style({
    image: icon,
    zIndex: options.zIndex,
  });

  currentStyle = style;

  updateIconScale(icon, options.icon.size ?? 1);

  return style;
}

// --------------------------------------------------
// Style
// --------------------------------------------------

/**
 * 创建当前应该使用的 Style
 *
 * 优先级：
 *
 * #icon
 *   ↓
 * src
 *   ↓
 * Circle
 */
function createStyle() {
  if (hasSlotIcon()) {
    return createSlotIconStyle();
  }

  if (props.icon?.src) {
    return createPointIconStyle();
  }

  return createCircleStyle();
}

/**
 * 更新 Feature Style
 */
function updateStyle() {
  const style = createStyle();

  feature?.setStyle(style);
}

// --------------------------------------------------
// 初始化
// --------------------------------------------------

updateStyle();

onMounted(async () => {
  await nextTick();

  if (!iconContainer.value) {
    return;
  }

  slotObserver = new MutationObserver(() => {
    if (hasSlotIcon()) {
      updateStyle();
    }
  });

  slotObserver.observe(
    iconContainer.value,
    {
      childList: true,
      subtree: true,
    },
  );

  if (hasSlotIcon()) {
    updateStyle();
  }
});

// --------------------------------------------------
// Coordinates
// --------------------------------------------------

watch(
  () => props.coordinates,
  coordinates => {
    updateCoordinates(coordinates);
  },
);

// --------------------------------------------------
// Circle Style
// --------------------------------------------------
watch(
  [
    () => props.color,
    () => props.radius,
    () => props.strokeColor,
    () => props.strokeWidth,
    () => props.opacity,
    () => props.zIndex,
    () => props.icon
  ],
  () => {
    updateStyle();
  },
  {
    deep: true,
  },
);

// --------------------------------------------------
// Destroy
// --------------------------------------------------

onBeforeUnmount(() => {
  point.un(
    'change',
    handlePointChange,
  );

  slotObserver?.disconnect();
  slotObserver = undefined;

  resetCurrentStyle();

  feature.setGeometry(undefined);
  feature.setStyle(undefined);
});
</script>

<template>
  <div
    v-if="$slots.icon"
    ref="iconContainer"
    style="display: none;"
  >
    <slot name="icon" />
  </div>

  <slot v-else />
</template>

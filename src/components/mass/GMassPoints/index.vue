<script setup lang="ts">
import type { MassPointItem, MassPointStyleMapping } from '@/styles/massPoint';
import type { HoverStyleOptions } from '@/styles/hover';
import type { SelectStyleOptions } from '@/styles/select';
import type { GFeatureEvent } from '@/context/feature/events';

import { inject, onBeforeUnmount, watch } from 'vue';

import { MAP_KEY } from '@/context/keys';

import { createMassPointsController } from '@/core/mass/massPoints';

defineOptions({
  name: 'GMassPoints',
});

interface Props {
  /** 海量点数据；替换数组即触发增量更新（按 id diff，不做深比较以省遍历） */
  data: MassPointItem[];
  /**
   * 基础样式映射：字面量（所有点一致）或按点求值的函数（逐点差异化）。
   * 结构对齐普通点：圆点（color/radius/strokeColor/strokeWidth/opacity），
   * 或图标（icon.src/size/anchor/rotation/opacity）。icon.src 支持逐点映射函数，
   * 内部自动合成雪碧图实现逐点不同图标（WebGL 下 icon-src 无法逐点，故合成）。
   */
  style?: MassPointStyleMapping;
  /**
   * 是否启用悬停高亮，默认 true。
   * 命中检测由地图级统一负责，此处仅控制是否对本图层应用 hover 效果。
   */
  hoverable?: boolean;
  /**
   * 悬停样式，结构与普通点 GFeature 的 hoverStyle 完全一致（HoverStyleOptions）。
   * 圆点模式取 point.color/point.radius；图标模式取 point.icon.size 推导放大。
   * 缺省回退默认视觉（已对齐普通点 DEFAULT_HOVER_STYLE）。
   */
  hoverStyle?: HoverStyleOptions;
  /**
   * 选中样式，结构同 hoverStyle。选中由地图级 mapRef.selectFeature() 驱动，
   * 此处仅配置选中态的视觉。缺省回退默认（对齐普通点 DEFAULT_SELECT_STYLE）。
   */
  selectStyle?: SelectStyleOptions;
  /** 图层 zIndex，默认 100 */
  zIndex?: number;
}

const props = withDefaults(defineProps<Props>(), {
  style: () => ({}),
  hoverable: true,
  zIndex: 100,
});

const emit = defineEmits<{
  click: [event: GFeatureEvent];
  dblclick: [event: GFeatureEvent];
  mouseenter: [event: GFeatureEvent];
  mouseleave: [event: GFeatureEvent];
  select: [event: GFeatureEvent];
  unselect: [event: GFeatureEvent];
}>();

const map = inject(MAP_KEY);

if (!map) {
  throw new Error('[GMassPoints] must be used within a [GMap]');
}

const controller = createMassPointsController(
  map,
  {
    hoverable: props.hoverable,
    zIndex: props.zIndex,
  },
  {
    onMouseEnter: e => emit('mouseenter', e),
    onMouseLeave: e => emit('mouseleave', e),
    onClick: e => emit('click', e),
    onDblClick: e => emit('dblclick', e),
    onSelect: e => emit('select', e),
    onUnselect: e => emit('unselect', e),
  },
);

// 合并基础样式与独立的 hover/select 样式（独立 props 优先），交给控制器编译 WebGL 表达式
function buildMapping(): MassPointStyleMapping {
  return {
    ...props.style,
    hoverStyle: props.hoverStyle,
    selectStyle: props.selectStyle,
  };
}

// 先设样式映射再灌数据，保证首帧即按映射求值
controller.setStyleMapping(buildMapping());
controller.setData(props.data);

// 数据：引用比较即可，内部按 id 做增量 diff
watch(
  () => props.data,
  data => {
    controller.setData(data);
  },
);

// 样式：深比较（含 hover/select），映射变化时重编译 WebGL 表达式并重算各点属性
watch(
  () => [props.style, props.hoverStyle, props.selectStyle] as const,
  () => {
    controller.setStyleMapping(buildMapping());
  },
  { deep: true },
);

// 行为开关
watch(
  () => [props.hoverable, props.zIndex] as const,
  ([hoverable, zIndex]) => {
    controller.setOptions({ hoverable, zIndex });
  },
);

onBeforeUnmount(() => {
  controller.destroy();
});
</script>

<template>
  <slot />
</template>

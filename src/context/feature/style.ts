import type Feature from 'ol/Feature';
import type { StyleLike } from 'ol/style/Style';

/**
 * 样式分层。
 *
 * 同一个 Feature 可能同时被多个来源设置样式（几何基础样式、悬停、选中、编辑），
 * 通过分层 + 优先级统一仲裁，避免多个写入者互相覆盖。
 */
export type StyleLayer = 'base' | 'hover' | 'select' | 'modify';

/**
 * 层级优先级，数值越大越优先。
 *
 * base(几何基础) < hover(悬停) < select(选中) < modify(编辑)
 */
const LAYER_PRIORITY: Record<StyleLayer, number> = {
  base: 0,
  hover: 1,
  select: 2,
  modify: 3,
};

export interface FeatureStyleController {
  /** 设置某一层的样式，传 undefined 表示该层无样式（回退到低优先级层） */
  setStyle(layer: StyleLayer, style: StyleLike | undefined): void;
  /** 清除某一层，回退到次高优先级层 */
  clearStyle(layer: StyleLayer): void;
  /** 读取某一层当前样式 */
  getStyle(layer: StyleLayer): StyleLike | undefined;
  /** 读取最终生效的样式 */
  getEffectiveStyle(): StyleLike | undefined;
}

const styleControllers = new WeakMap<Feature, FeatureStyleController>();

export function createFeatureStyleController(
  feature: Feature,
): FeatureStyleController {
  const layers = new Map<StyleLayer, StyleLike | undefined>();

  /**
   * 计算当前生效样式：取所有「有样式」的层中优先级最高者，写回 Feature。
   */
  function resolve() {
    let effective: StyleLike | undefined;
    let highest = -1;

    layers.forEach((style, layer) => {
      if (style === undefined) return;

      const priority = LAYER_PRIORITY[layer];

      if (priority > highest) {
        highest = priority;
        effective = style;
      }
    });

    feature.setStyle(effective);
  }

  function setStyle(layer: StyleLayer, style: StyleLike | undefined) {
    layers.set(layer, style);
    resolve();
  }

  function clearStyle(layer: StyleLayer) {
    layers.delete(layer);
    resolve();
  }

  function getStyle(layer: StyleLayer) {
    return layers.get(layer);
  }

  function getEffectiveStyle() {
    return feature.getStyle();
  }

  return {
    setStyle,
    clearStyle,
    getStyle,
    getEffectiveStyle,
  };
}

export function registerFeatureStyleController(
  feature: Feature,
  controller: FeatureStyleController,
) {
  styleControllers.set(feature, controller);
}

export function unregisterFeatureStyleController(feature: Feature) {
  styleControllers.delete(feature);
}

/**
 * 获取 Feature 的样式控制器。
 *
 * - GFeature 管理的 Feature：返回其已注册的控制器。
 * - 命令式创建的 Feature（如 mapRef.addPoint）：首次访问时惰性创建，
 *   并把其当前样式作为 base 层兜底，保证选中/取消选中后能正确回退。
 */
export function getFeatureStyleController(
  feature: Feature,
): FeatureStyleController {
  let controller = styleControllers.get(feature);

  if (!controller) {
    controller = createFeatureStyleController(feature);

    const existing = feature.getStyle();

    if (existing) {
      controller.setStyle('base', existing);
    }

    styleControllers.set(feature, controller);
  }

  return controller;
}

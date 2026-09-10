import type OlMap from 'ol/Map';
import type MapBrowserEvent from 'ol/MapBrowserEvent';
import type { VectorSourceEvent } from 'ol/source/Vector';
import type { StyleLike } from 'ol/style/Style';
import type { GFeatureEvent } from '@/context/feature/events';
import type { FeatureStyleController } from '@/context/feature/style';

import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import VectorSource from 'ol/source/Vector';
import WebGLVectorLayer from 'ol/layer/WebGLVector';

import { fromLonLat } from 'ol/proj';

import type { MassPointItem, MassPointStyleMapping } from '@/styles/massPoint';
import type { SpriteAtlas } from '@/core/mass/spriteAtlas';

import {
  compileMassPointStyle,
  resolveMassPointProperties,
  isIconMode,
  MASS_POINT_PROPS,
  HOVER_NONE,
  ICON_IDX_NONE,
} from '@/styles/massPoint';
import { buildSpriteAtlas } from '@/core/mass/spriteAtlas';

// 四套注册机制：让海量点 feature 接入普通点的地图级交互（events / styleController / source / state）
import { registerFeatureEvents, unregisterFeatureEvents } from '@/context/feature/events';
import { registerFeatureStyleController, unregisterFeatureStyleController } from '@/context/feature/style';
import { registerFeatureSource, unregisterFeatureSource } from '@/context/feature/source';
import { isFeatureSelected, removeFeatureState } from '@/context/feature/state';

/**
 * 海量点交互回调，统一回传 GFeatureEvent（与普通点 GFeature 事件结构一致）。
 * event.properties 为原始数据项（干净业务字段，不含内部 gmp* 渲染属性），
 * event.originalEvent 为触发的浏览器事件。
 */
export interface MassPointsHandlers {
  onMouseEnter?: (event: GFeatureEvent) => void;
  onMouseLeave?: (event: GFeatureEvent) => void;
  onClick?: (event: GFeatureEvent) => void;
  onDblClick?: (event: GFeatureEvent) => void;
  onSelect?: (event: GFeatureEvent) => void;
  onUnselect?: (event: GFeatureEvent) => void;
}

/** 海量点行为配置 */
export interface MassPointsOptions {
  /** 是否启用悬停高亮，默认 true */
  hoverable?: boolean;
  /** 图层 zIndex，默认 100 */
  zIndex?: number;
}

export interface MassPointsController {
  setData: (items: MassPointItem[]) => void;
  setStyleMapping: (mapping: MassPointStyleMapping) => void;
  setOptions: (options: MassPointsOptions) => void;
  destroy: () => void;
}

const MASS_LAYER_Z_INDEX = 100;

const MASS_POINTS_DEFAULTS: Required<MassPointsOptions> = {
  hoverable: true,
  zIndex: MASS_LAYER_Z_INDEX,
};

/** 合并配置：仅用 next 中显式给出（非 undefined）的值覆盖 base */
function mergeOptions(
  base: Required<MassPointsOptions>,
  next: MassPointsOptions,
): Required<MassPointsOptions> {
  return {
    hoverable: next.hoverable ?? base.hoverable,
    zIndex: next.zIndex ?? base.zIndex,
  };
}

/**
 * 海量点控制器：数据驱动 + WebGL 单层渲染。
 *
 * - 数据 → 轻量 OL Feature（无 Vue 组件/watch/WeakMap 注册），差异化样式写进 properties，
 *   由 WebGL 表达式在 GPU 侧读取，可流畅承载数万~百万点。
 * - 悬停用 style variable（`updateStyleVariables`）整层重绘，O(1)。
 * - 选中用 feature property（`gmpSelected`），天然支持多选。
 * - 图标模式：icon-src 是 layer 级静态纹理，故把逐点 URL 异步合成一张雪碧图，
 *   逐点回填 iconIdx，shader 用 case(iconIdx) 取子图；合成中/失败回退圆点占位。
 * - WebGL 上下文必须在销毁时手动 `layer.dispose()` 释放。
 */
export function createMassPointsController(
  map: OlMap,
  initialOptions: MassPointsOptions = {},
  handlers: MassPointsHandlers = {},
): MassPointsController {
  let options = mergeOptions(MASS_POINTS_DEFAULTS, initialOptions);
  let mapping: MassPointStyleMapping = {};

  const source = new VectorSource();
  const layer = new WebGLVectorLayer({
    source,
    style: compileMassPointStyle(mapping),
    variables: { hoverKey: HOVER_NONE },
    zIndex: options.zIndex,
  });

  map.addLayer(layer);

  /** id(string) -> feature：用于数据 diff 与命中回查 */
  const featureById = new Map<string, Feature>();
  /** id(string) -> 原始数据项：用于事件回传 */
  const itemById = new Map<string, MassPointItem>();
  /** id(string) -> 数值悬停键：hover 用数值比较，避开字符串属性的 vec3 打包 */
  const keyById = new Map<string, number>();
  let nextKey = 0;
  /** 当前悬停点 id，null 表示无 */
  let hoveredId: string | null = null;

  // ---- 图标（雪碧图）状态 ----
  /** 当前合成好的雪碧图；null 表示未就绪（圆点占位） */
  let atlas: SpriteAtlas | null = null;
  /** id(string) -> 该点图标 URL（由 icon.src 映射求值），用于合成与 iconIdx 回填 */
  const iconUrlById = new Map<string, string>();
  /** 已发起合成的 URL 集合签名，避免重复合成 */
  let atlasSignature = '';
  /** 异步合成竞态令牌：只有最新一次合成的结果会被采用 */
  let spriteToken = 0;

  /**
   * 构造与普通点一致的 GFeatureEvent。
   * properties 用原始数据项（干净业务字段），而非 feature.getProperties()
   * （后者含 gmp* 内部渲染属性）；originalEvent 为触发的浏览器事件。
   */
  function makeEvent(
    feature: Feature,
    id: string,
    originalEvent: MapBrowserEvent,
  ): GFeatureEvent {
    const item = itemById.get(id);

    return {
      feature,
      id: item?.id ?? id,
      properties: item ? { ...item } : {},
      originalEvent,
    };
  }

  // ---- hover：style variable 驱动，O(1) 整层重绘 ----
  // 命中检测与 mouseenter/mouseleave 分发由地图级 mapEventController 统一负责，
  // 这里只在事件回调里更新 hover uniform，保持海量点 O(1) 重绘的性能优势。

  // 把指定点设为悬停（写入其数值键到 style variable）
  function setHover(feature: Feature) {
    const id = String(feature.getId());

    if (id === hoveredId) return;

    hoveredId = id;
    layer.updateStyleVariables({ hoverKey: keyById.get(id) ?? HOVER_NONE });
  }

  // 清除悬停高亮（写 HOVER_NONE=-1，永不命中）；数据移除/关闭 hover/鼠标移出时调用
  function clearHover() {
    if (hoveredId === null) return;

    hoveredId = null;
    layer.updateStyleVariables({ hoverKey: HOVER_NONE });
  }

  // ---- select：WebGL 样式适配器 ----
  // 地图级 selectController 通过 getFeatureStyleController(feature).setStyle('select', style) 应用选中，
  // 但矢量 Style 对 WebGL 图层无效，故注册适配器把「select 层有无样式」翻译成 gmpSelected property，
  // 由 FlatStyle 表达式（case isSelected）在 GPU 侧渲染选中态。
  const SELECTED_STYLE_MARKER = {} as StyleLike;

  function createWebGLStyleController(feature: Feature): FeatureStyleController {
    return {
      setStyle(layer, style) {
        if (layer === 'select') {
          feature.set(MASS_POINT_PROPS.selected, style !== undefined ? 1 : 0);
        }
        // hover 层忽略：hover 走 uniform（setHover），不用 per-feature style
      },
      clearStyle(layer) {
        if (layer === 'select') {
          feature.set(MASS_POINT_PROPS.selected, 0);
        }
      },
      getStyle(layer) {
        return layer === 'select' && feature.get(MASS_POINT_PROPS.selected)
          ? SELECTED_STYLE_MARKER
          : undefined;
      },
      getEffectiveStyle() {
        return undefined;
      },
    };
  }

  /**
   * 为一个海量点 feature 注册四套机制，使其能被地图级交互控制器像普通点一样驱动：
   * - events：mouseenter/leave 驱动 hover uniform，select/unselect/click/dblclick 转发 handlers（emit）
   * - styleController：WebGL 适配器，把 select 层样式翻译成 gmpSelected property
   * - source：使 mapRef.removeFeature(feature) 能删除本点
   * 选中态（state）由 selectController 调 setFeatureSelected 维护，无需在此显式注册。
   */
  function registerFeature(feature: Feature) {
    const id = String(feature.getId());

    registerFeatureSource(feature, source);
    registerFeatureStyleController(feature, createWebGLStyleController(feature));
    registerFeatureEvents(feature, {
      singleclick: event => handlers.onClick?.(makeEvent(feature, id, event.originalEvent)),
      dblclick: event => handlers.onDblClick?.(makeEvent(feature, id, event.originalEvent)),
      mouseenter: event => {
        if (!options.hoverable) return;

        setHover(feature);
        handlers.onMouseEnter?.(makeEvent(feature, id, event.originalEvent));
      },
      mouseleave: event => {
        clearHover();
        handlers.onMouseLeave?.(makeEvent(feature, id, event.originalEvent));
      },
      select: event => handlers.onSelect?.(makeEvent(feature, id, event.originalEvent)),
      unselect: event => handlers.onUnselect?.(makeEvent(feature, id, event.originalEvent)),
    });
  }

  function unregisterFeature(feature: Feature) {
    unregisterFeatureEvents(feature);
    unregisterFeatureStyleController(feature);
    unregisterFeatureSource(feature);
    removeFeatureState(feature);
  }

  // 统一清理：无论 setData 移除还是命令式 removeFeature，都经 source 的 removefeature 事件，
  // 在此清理内部索引并注销四套注册，避免状态泄漏与重复清理。
  function handleRemoveFeature(feature: Feature) {
    const id = String(feature.getId());

    if (hoveredId === id) clearHover();

    featureById.delete(id);
    itemById.delete(id);
    keyById.delete(id);
    iconUrlById.delete(id);

    unregisterFeature(feature);
  }

  function onSourceRemoveFeature(event: VectorSourceEvent) {
    if (event.feature) handleRemoveFeature(event.feature);
  }

  source.on('removefeature', onSourceRemoveFeature);

  // ---- 图标（雪碧图）辅助 ----

  /** 对一个数据项求值图标 URL（icon.src 可为字面量或映射函数） */
  function resolveIconUrl(item: MassPointItem): string {
    const src = mapping.icon?.src;

    if (src === undefined) return '';

    return typeof src === 'function' ? src(item) : src;
  }

  /**
   * 计算某点写进 feature 的完整属性。
   *
   * 含三部分：原始业务字段（平铺，供 GMap.pickFeature 拾取时直接读取）
   * + gmp* 渲染属性（WebGL 表达式 get，放后面以覆盖同名业务字段）
   * + 选中态/图标索引。
   * 未被 style 引用的业务字段不会进 GPU buffer，仅存于 JS 侧 properties。
   */
  function computeProps(
    item: MassPointItem,
    id: string,
    key: number,
    selected: boolean,
  ): Record<string, unknown> {
    const renderProps = resolveMassPointProperties(item, mapping, key);

    // 选中态来自地图级 selectController 维护的 state（数据刷新时保持不变）
    renderProps[MASS_POINT_PROPS.selected] = selected ? 1 : 0;

    // 雪碧图就绪时，把 URL 换成 iconIdx；否则保持占位（ICON_IDX_NONE），等合成后回填
    if (atlas) {
      const url = iconUrlById.get(id);

      renderProps[MASS_POINT_PROPS.iconIdx] = url
        ? (atlas.urlToIdx.get(url) ?? ICON_IDX_NONE)
        : ICON_IDX_NONE;
    }

    // 业务字段平铺在前，渲染属性覆盖同名（保护 gmp* 不被业务字段污染）
    return { ...item, ...renderProps };
  }

  /** 雪碧图合成完成后，按 iconUrlById 回填所有点的 iconIdx */
  function applyIconIdx() {
    if (!atlas) return;

    const current = atlas;

    featureById.forEach((feature, id) => {
      const url = iconUrlById.get(id);

      feature.set(
        MASS_POINT_PROPS.iconIdx,
        url ? (current.urlToIdx.get(url) ?? ICON_IDX_NONE) : ICON_IDX_NONE,
      );
    });
  }

  /** 收集当前所有点的去重图标 URL */
  function collectIconUrls(): string[] {
    const urls = new Set<string>();

    iconUrlById.forEach(u => {
      if (u) urls.add(u);
    });

    return [...urls];
  }

  /** 异步合成雪碧图；用令牌防竞态，失败则降级圆点 */
  async function rebuildSprite(urls: string[]) {
    const token = ++spriteToken;

    try {
      const next = await buildSpriteAtlas(urls);

      if (token !== spriteToken) return; // 已有更新的合成，丢弃本次

      atlas = next;
      layer.setStyle(compileMassPointStyle(mapping, atlas));
      applyIconIdx();
    } catch (error) {
      if (token !== spriteToken) return;

      console.warn('[g-map] 海量点图标合成失败，降级为圆点渲染：', error);
      atlas = null;
      layer.setStyle(compileMassPointStyle(mapping, null));
    }
  }

  /**
   * 同步雪碧图状态：
   * - 非图标模式：清理 atlas 并切回圆点
   * - 图标模式：URL 集合变化时重新合成（签名去重，避免无谓合成）
   */
  function syncSprite() {
    if (!isIconMode(mapping)) {
      if (atlas || atlasSignature || iconUrlById.size) {
        atlas = null;
        atlasSignature = '';
        iconUrlById.clear();
        layer.setStyle(compileMassPointStyle(mapping, null));
      }

      return;
    }

    const urls = collectIconUrls();

    if (urls.length === 0) return;

    const signature = [...urls].sort().join('\u0000');

    if (signature === atlasSignature) return;

    atlasSignature = signature;
    void rebuildSprite(urls);
  }

  // ---- 对外 API ----

  /** 增量 diff：命中则更新几何/属性，未命中则新增，缺失则移除 */
  function setData(items: MassPointItem[]) {
    const iconMode = isIconMode(mapping);
    const nextIds = new Set<string>();
    const toAdd: Feature[] = [];

    items.forEach(item => {
      const id = String(item.id);
      nextIds.add(id);
      itemById.set(id, item);

      let key = keyById.get(id);

      if (key === undefined) {
        key = nextKey++;
        keyById.set(id, key);
      }

      // 图标模式：先求值 URL（computeProps 会据此回填 iconIdx）
      if (iconMode) iconUrlById.set(id, resolveIconUrl(item));

      const existing = featureById.get(id);

      if (existing) {
        const geometry = existing.getGeometry() as Point | undefined;
        geometry?.setCoordinates(fromLonLat(item.coordinates));
        existing.setProperties(computeProps(item, id, key, isFeatureSelected(existing)));

        return;
      }

      const feature: Feature = new Feature(new Point(fromLonLat(item.coordinates)));
      feature.setId(id);
      feature.setProperties(computeProps(item, id, key, false));
      featureById.set(id, feature);
      // 注册四套机制，接入地图级交互（events / styleController / source）
      registerFeature(feature);
      toAdd.push(feature);
    });

    // 移除本次数据中已不存在的点：只调 source.removeFeature，
    // 内部索引清理与四套注销交给 source 的 removefeature 事件统一处理
    [...featureById.keys()].forEach(id => {
      if (nextIds.has(id)) return;

      const stale = featureById.get(id);

      if (stale) source.removeFeature(stale);
    });

    if (toAdd.length) source.addFeatures(toAdd);

    // URL 集合可能变化，按需（重新）合成雪碧图
    syncSprite();
  }

  /** 重编译 WebGL 表达式，并按新映射重算每个点的样式属性 */
  function setStyleMapping(next: MassPointStyleMapping) {
    mapping = next;

    // 图标模式：src 映射可能变化，对所有点重新求值 URL；否则清空
    if (isIconMode(mapping)) {
      itemById.forEach((item, id) => {
        iconUrlById.set(id, resolveIconUrl(item));
      });
    } else {
      iconUrlById.clear();
    }

    // 先用当前 atlas（可能为 null）设样式并重算属性，随后按需异步重合成
    layer.setStyle(compileMassPointStyle(mapping, atlas));
    recomputeAllProperties();
    syncSprite();
  }

  /** 全量重算所有点的样式属性（样式映射变化时用） */
  function recomputeAllProperties() {
    featureById.forEach((feature, id) => {
      const item = itemById.get(id);
      const key = keyById.get(id);

      if (!item || key === undefined) return;

      feature.setProperties(computeProps(item, id, key, isFeatureSelected(feature)));
    });
  }

  function setOptions(next: MassPointsOptions) {
    const wasHoverable = options.hoverable;
    options = mergeOptions(options, next);
    layer.setZIndex(options.zIndex);

    // 关闭 hover 时清除残留高亮
    if (wasHoverable && !options.hoverable) clearHover();
  }

  function destroy() {
    // 使进行中的异步合成失效（其回调会因令牌不匹配而放弃操作已销毁的图层）
    spriteToken++;
    atlas = null;
    atlasSignature = '';

    // 注销所有 feature 的四套注册（source.clear 不触发 removefeature，需手动注销）
    featureById.forEach(feature => unregisterFeature(feature));

    source.un('removefeature', onSourceRemoveFeature);

    map.removeLayer(layer);
    // WebGL 上下文必须手动释放，否则不会被 GC 回收
    layer.dispose();
    source.clear();

    featureById.clear();
    itemById.clear();
    keyById.clear();
    iconUrlById.clear();
    nextKey = 0;
    hoveredId = null;
  }

  return {
    setData,
    setStyleMapping,
    setOptions,
    destroy,
  };
}

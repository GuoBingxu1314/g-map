import type { FlatStyle } from 'ol/style/flat';
import type { IconOrigin } from 'ol/style/Icon';
import type { SpriteAtlas } from '@/core/mass/spriteAtlas';
import type { HoverStyleOptions } from './hover';
import type { SelectStyleOptions } from './select';

/**
 * 海量点数据项。
 *
 * 与声明式的 GFeature/GPoint 不同，海量点走「数据驱动 + WebGL」通道：
 * 每个点是一个轻量 OL Feature（无 Vue 组件 / watch / WeakMap 注册），
 * 差异化信息通过 properties 交给 GPU 表达式渲染，可流畅承载数万~百万点。
 */
export interface MassPointItem {
  /** 唯一标识，用于 hover/选中匹配与事件回传；约定非空、且同一批数据类型一致 */
  id: string | number;
  /** 经纬度 [lng, lat]，内部转 Web Mercator */
  coordinates: [number, number];
  /**
   * 业务字段（如 level、name）：用 any 而非 unknown，
   * 以便样式映射函数/事件回调里直接访问与比较（如 item.level > 2），无需断言。
   * id/coordinates 仍保持强类型——同一接口内显式属性优先于索引签名。
   */
  [key: string]: any;
}

/** 样式值：字面量（所有点一致），或按点求值的映射函数（逐点差异化） */
export type MassPointStyleValue<T> = T | ((item: MassPointItem) => T);

/**
 * 海量点图标样式，字段对齐普通点的 IconStyleOptions。
 *
 * 关键差异（WebGL 通道约束）：
 * - `src` 可以是「逐点映射函数」，但 OL 的 icon-src 是 layer 级静态纹理，
 *   内部会把用到的所有 URL 自动合成一张雪碧图，再逐点用 iconIdx 取子图。
 * - `offset` 不对外暴露：icon-offset/icon-size 已被雪碧图内部占用。
 * - `anchor`/`anchorOrigin` 为 layer 级静态（逐点 anchor 需 vec2 属性，留后续）。
 */
export interface MassPointIconStyle {
  /** 图标 URL：字面量（所有点同图）或映射函数（逐点不同图，内部自动合成雪碧图） */
  src?: MassPointStyleValue<string>;
  /** 显示尺寸（最长边像素），对齐普通点 icon.size；逐点可映射 */
  size?: MassPointStyleValue<number>;
  /** 锚点，layer 级静态，默认 [0.5, 1]（底部中心，对齐普通点） */
  anchor?: [number, number];
  /** 锚点原点，layer 级静态 */
  anchorOrigin?: IconOrigin;
  /** 旋转（弧度），逐点可映射 */
  rotation?: MassPointStyleValue<number>;
  /** 透明度，逐点可映射 */
  opacity?: MassPointStyleValue<number>;
}

/**
 * 海量点样式映射，结构对齐普通点的 PointStyleOptions。
 *
 * 映射函数只在数据/样式变化时对每个点求值一次，结果写进 feature properties，
 * 再由 WebGL 表达式读取渲染——不进入渲染循环，因此逐点差异化也无性能负担。
 *
 * 圆点 / 图标二选一：提供 `icon.src` 即整层走图标（雪碧图），否则走圆点。
 */
export interface MassPointStyleMapping {
  // —— 圆点（对齐 PointStyleOptions）——
  radius?: MassPointStyleValue<number>;
  color?: MassPointStyleValue<string>;
  strokeColor?: MassPointStyleValue<string>;
  strokeWidth?: MassPointStyleValue<number>;
  opacity?: MassPointStyleValue<number>;

  // —— 图标（提供即切换为图标模式）——
  icon?: MassPointIconStyle;

  // —— 悬停/选中高亮（对象样式，与普通点 GFeature 的 hoverStyle/selectStyle 完全一致）——
  /**
   * 悬停样式，结构对齐普通点（HoverStyleOptions）。
   * 圆点模式取 point.color / point.radius（换色 + 改半径，style variable 驱动 O(1) 重绘）；
   * 图标模式为雪碧图纹理无法换色，取 point.icon.size 相对基准尺寸推导放大系数。
   * 缺省回退 MASS_POINT_DEFAULT（已对齐普通点 DEFAULT_HOVER_STYLE）。
   */
  hoverStyle?: HoverStyleOptions;
  /**
   * 选中样式，结构同 hoverStyle（feature property 驱动，支持多选）。
   * 缺省回退 MASS_POINT_DEFAULT（已对齐普通点 DEFAULT_SELECT_STYLE）。
   */
  selectStyle?: SelectStyleOptions;
}

/** 默认视觉，对齐普通点/悬停/选中的一致观感 */
export const MASS_POINT_DEFAULT = {
  radius: 6,
  color: '#1677ff',
  strokeColor: '#ffffff',
  strokeWidth: 2,
  opacity: 1,
  iconSize: 32,
  iconRotation: 0,
  iconOpacity: 1,
  iconAnchor: [0.5, 1] as [number, number],
  hoverRadius: 8,
  hoverColor: '#409eff',
  hoverScale: 1.3,
  selectRadius: 9,
  selectColor: '#ffd065',
  selectScale: 1.5,
} as const;

/**
 * 内部保留 property 名。
 *
 * 注意：绝不能用下划线前缀——OL 把属性名拼成 shader 变量 `a_prop_<name>`，
 * 前导下划线会产生连续双下划线（如 `a_prop__id`），而 GLSL 保留含 `__` 的标识符，
 * 会导致片段着色器编译失败。故统一用 `gmp` 前缀命名空间，既合规又避免与业务字段冲突。
 *
 * 另：状态匹配（key）与图标索引（iconIdx）都用数值——WebGL 中字符串属性按 vec3
 * 打包、数组属性按类型推断打包，只有标量数值在 `==` / 算术里最稳健。
 */
export const MASS_POINT_PROPS = {
  /** 数值悬停键：hover 用 `['==', ['get',key], ['var',hoverKey]]` 标量比较 */
  key: 'gmpKey',
  // 圆点
  radius: 'gmpRadius',
  color: 'gmpColor',
  strokeColor: 'gmpStrokeColor',
  strokeWidth: 'gmpStrokeWidth',
  opacity: 'gmpOpacity',
  // 图标（iconIdx 由控制器在雪碧图合成后回填；size/rotation/opacity 逐点求值）
  iconIdx: 'gmpIconIdx',
  iconSize: 'gmpIconSize',
  iconRotation: 'gmpIconRotation',
  iconOpacity: 'gmpIconOpacity',
  // 状态
  selected: 'gmpSelected',
} as const;

/** 无悬停时 hoverKey 变量的哨兵值（数值 key 从 0 起，-1 永不命中） */
export const HOVER_NONE = -1;

/** iconIdx 未回填（雪碧图未就绪）时的占位值，永不命中任何格子 */
export const ICON_IDX_NONE = -1;

function resolveValue<T>(
  value: MassPointStyleValue<T> | undefined,
  item: MassPointItem,
  fallback: T,
): T {
  if (value === undefined) return fallback;

  return typeof value === 'function'
    ? (value as (item: MassPointItem) => T)(item)
    : value;
}

/**
 * 对一个数据项求值样式映射，产出写进 feature 的 properties。
 *
 * key 为控制器分配的数值悬停键。iconIdx 在此仅占位（ICON_IDX_NONE），
 * 因为雪碧图是异步合成的，真实索引由控制器在合成完成后回填。
 * 圆点与图标属性都写入，由 compileMassPointStyle 按模式取用，互不干扰。
 */
export function resolveMassPointProperties(
  item: MassPointItem,
  mapping: MassPointStyleMapping,
  key: number,
): Record<string, unknown> {
  const icon = mapping.icon;
  return {
    [MASS_POINT_PROPS.key]: key,
    // 圆点
    [MASS_POINT_PROPS.radius]: resolveValue(mapping.radius, item, MASS_POINT_DEFAULT.radius),
    [MASS_POINT_PROPS.color]: resolveValue(mapping.color, item, MASS_POINT_DEFAULT.color),
    [MASS_POINT_PROPS.strokeColor]: resolveValue(mapping.strokeColor, item, MASS_POINT_DEFAULT.strokeColor),
    [MASS_POINT_PROPS.strokeWidth]: resolveValue(mapping.strokeWidth, item, MASS_POINT_DEFAULT.strokeWidth),
    [MASS_POINT_PROPS.opacity]: resolveValue(mapping.opacity, item, MASS_POINT_DEFAULT.opacity),
    // 图标（iconIdx 合成后回填）
    [MASS_POINT_PROPS.iconIdx]: ICON_IDX_NONE,
    [MASS_POINT_PROPS.iconSize]: resolveValue(icon?.size, item, MASS_POINT_DEFAULT.iconSize),
    [MASS_POINT_PROPS.iconRotation]: resolveValue(icon?.rotation, item, MASS_POINT_DEFAULT.iconRotation),
    [MASS_POINT_PROPS.iconOpacity]: resolveValue(icon?.opacity, item, MASS_POINT_DEFAULT.iconOpacity),
  };
}

/** 该映射是否请求了图标模式（用户提供了 icon.src） */
export function isIconMode(mapping: MassPointStyleMapping): boolean {
  return mapping.icon?.src !== undefined;
}

/**
 * 图标模式：按 iconIdx 生成 `icon-offset` 表达式。
 *
 * 规则网格里每个格子的左上角偏移在编译期即可算出，故用 `case` 逐索引返回
 * 字面量 `[x, y]`（SizeType → vec2）。相比算术表达式，字面量分支类型确定，
 * 不会触发 ternary 类型不一致。图标种类极多时着色器会变长（每格一个分支），
 * 海量点场景图标种类通常有限，可接受。
 */
function buildIconOffsetExpression(atlas: SpriteAtlas): unknown {
  const { cols, cellW, cellH, count } = atlas;
  const offsetOf = (i: number): [number, number] => [
    (i % cols) * cellW,
    Math.floor(i / cols) * cellH,
  ];

  // 只有一个图标：直接用字面量偏移（无需 case）
  if (count <= 1) return offsetOf(0);

  // 多个图标：['case', ==idx0, off0, ==idx1, off1, ..., offLast(fallback)]
  const expr: unknown[] = ['case'];
  for (let i = 0; i < count - 1; i++) {
    expr.push(['==', ['get', MASS_POINT_PROPS.iconIdx], i], offsetOf(i));
  }
  expr.push(offsetOf(count - 1));
  return expr;
}

/**
 * 由悬停/选中的目标图标尺寸推导放大系数。
 * 未指定目标尺寸或基准非法时回退默认倍数。
 */
function deriveIconScale(
  targetSize: number | undefined,
  baseSize: number,
  fallback: number,
): number {
  if (targetSize === undefined || baseSize <= 0) return fallback;
  return targetSize / baseSize;
}

/** 圆点模式样式（含悬停/选中高亮） */
function compileCircleStyle(mapping: MassPointStyleMapping): FlatStyle {
  const hoverRadius = mapping.hoverStyle?.point?.radius ?? MASS_POINT_DEFAULT.hoverRadius;
  const hoverColor = mapping.hoverStyle?.point?.color ?? MASS_POINT_DEFAULT.hoverColor;
  const selectRadius = mapping.selectStyle?.point?.radius ?? MASS_POINT_DEFAULT.selectRadius;
  const selectColor = mapping.selectStyle?.point?.color ?? MASS_POINT_DEFAULT.selectColor;

  const isSelected = ['==', ['get', MASS_POINT_PROPS.selected], 1];
  const isHovered = ['==', ['get', MASS_POINT_PROPS.key], ['var', 'hoverKey']];

  return {
    'circle-radius': [
      'case',
      isSelected, selectRadius,
      isHovered, hoverRadius,
      ['get', MASS_POINT_PROPS.radius],
    ],
    'circle-fill-color': [
      'case',
      isSelected, selectColor,
      isHovered, hoverColor,
      ['get', MASS_POINT_PROPS.color],
    ],
    'circle-stroke-color': ['get', MASS_POINT_PROPS.strokeColor],
    'circle-stroke-width': ['get', MASS_POINT_PROPS.strokeWidth],
    'circle-opacity': ['get', MASS_POINT_PROPS.opacity],
  } as unknown as FlatStyle;
}

/** 图标模式样式（雪碧图 + 逐点子图 + 缩放高亮） */
function compileIconStyle(
  mapping: MassPointStyleMapping,
  atlas: SpriteAtlas,
): FlatStyle {
  const icon = mapping.icon ?? {};
  // 图标基准尺寸：字面量则用之；逐点映射函数时放大系数为统一倍数，用默认基准
  const baseIconSize = typeof icon.size === 'number' ? icon.size : MASS_POINT_DEFAULT.iconSize;
  // 图标模式无法换色（雪碧图纹理），hover/select 表现为放大：
  // 由 hoverStyle.point.icon.size 相对基准尺寸推导放大系数，缺省用默认倍数
  const hoverScale = deriveIconScale(mapping.hoverStyle?.point?.icon?.size, baseIconSize, MASS_POINT_DEFAULT.hoverScale);
  const selectScale = deriveIconScale(mapping.selectStyle?.point?.icon?.size, baseIconSize, MASS_POINT_DEFAULT.selectScale);
  const anchor = icon.anchor ?? MASS_POINT_DEFAULT.iconAnchor;

  const isSelected = ['==', ['get', MASS_POINT_PROPS.selected], 1];
  const isHovered = ['==', ['get', MASS_POINT_PROPS.key], ['var', 'hoverKey']];

  // 基础缩放 = 逐点显示尺寸 / 格子边长（Divide 参数强制 NumberType，编译为 float 标量）
  const baseScale = ['/', ['get', MASS_POINT_PROPS.iconSize], atlas.cellW];
  // 悬停/选中放大系数。
  // 关键：icon-scale 在 SizeType 上下文解析，case 的 fallback 类型决定各值分支的解析类型——
  // 字面量 number 会被 toSize 成 vec2，而 baseScale（Divide）实际编译为 float；
  // 若把 baseScale 直接当 fallback，值分支（vec2）与 fallback（float）不一致，
  // 触发 vertex shader `mismatching ternary operand types (vec2 vs float)`。
  // 故 case 内只放字面量系数（全部 → vec2，类型一致），再与 baseScale 相乘（float × vec2 = vec2）。
  const scaleMultiplier = [
    'case',
    isSelected, selectScale,
    isHovered, hoverScale,
    1,
  ];
  const scaleExpr = ['*', baseScale, scaleMultiplier];

  const style: Record<string, unknown> = {
    'icon-src': atlas.dataUrl,
    // 源图裁剪区 = 一个格子（静态）；配合逐点 offset 取子图
    'icon-size': [atlas.cellW, atlas.cellH],
    'icon-offset': buildIconOffsetExpression(atlas),
    // 显示缩放（逐点 + 悬停/选中放大）
    'icon-scale': scaleExpr,
    'icon-opacity': ['get', MASS_POINT_PROPS.iconOpacity],
    'icon-rotation': ['get', MASS_POINT_PROPS.iconRotation],
    'icon-anchor': anchor,
  };
  if (icon.anchorOrigin) {
    style['icon-anchor-origin'] = icon.anchorOrigin;
  }

  return style as unknown as FlatStyle;
}

/**
 * 把样式映射编译成 WebGL FlatStyle 表达式。
 *
 * - 圆点模式（默认）：circle-* 逐点差异化 + 悬停/选中高亮
 * - 图标模式（提供 icon.src 且雪碧图 atlas 就绪）：icon-* 雪碧图子图 + 缩放高亮
 * - 图标模式但 atlas 尚未就绪（异步合成中）：回退圆点占位，合成完由控制器 setStyle 切换
 *
 * 优先级：选中 > 悬停 > 基础。
 */
export function compileMassPointStyle(
  mapping: MassPointStyleMapping = {},
  atlas: SpriteAtlas | null = null,
): FlatStyle {
  if (isIconMode(mapping) && atlas) {
    return compileIconStyle(mapping, atlas);
  }
  return compileCircleStyle(mapping);
}

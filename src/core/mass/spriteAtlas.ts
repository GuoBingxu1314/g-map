/**
 * 雪碧图合成器 —— 海量点「逐点不同图标」在 WebGL 下的落地。
 *
 * 背景：OL WebGLVector 的 `icon-src` 被 assert 为 layer 级静态纹理
 * （render/webgl/style.js: "WebGL layers do not support expressions for the icon-src"），
 * 一个图层只能绑一张图，无法逐点不同 URL。
 *
 * 方案：把「一批图标 URL」异步合成为一张规则网格雪碧图，整层用它作 `icon-src`；
 * 逐点存数值属性 iconIdx，shader 用 `case(iconIdx)` 选出该格的 `icon-offset`，
 * 配合静态 `icon-size`（格子尺寸）取子矩形，实现逐点不同图标。
 */

/** 雪碧图合成选项 */
export interface SpriteAtlasOptions {
  /** 统一格子边长（正方形）；默认取所有图标的最大自然边长 */
  cellSize?: number;
  /** 跨域策略，默认 'anonymous'（合成进 canvas 必需，否则 toDataURL 被污染而报错） */
  crossOrigin?: string;
  /** 雪碧图最大边长（WebGL 纹理上限），默认 4096；超出则收缩格子 */
  maxTextureSize?: number;
}

/** 合成产物：既提供纹理，也提供 iconIdx→offset 换算所需的布局信息 */
export interface SpriteAtlas {
  /** 合成图 dataURL，作为 layer 的 icon-src */
  dataUrl: string;
  /** 格子宽（源图裁剪区），用于 icon-size */
  cellW: number;
  /** 格子高（源图裁剪区），用于 icon-size */
  cellH: number;
  /** 列数，用于 iconIdx → (col,row) → offset 换算 */
  cols: number;
  /** 图标种类数（格子总数） */
  count: number;
  /** URL → 格子索引；控制器据此把每个点的 URL 换成 iconIdx */
  urlToIdx: Map<string, number>;
}

const DEFAULT_MAX_TEXTURE = 4096;
const FALLBACK_CELL = 32;

/** 加载单张图片（crossOrigin 由调用方决定；失败 reject，由上层降级为透明格） */
function loadImage(src: string, crossOrigin?: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    if (crossOrigin) img.crossOrigin = crossOrigin;
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`icon load failed: ${src}`));
    img.src = src;
  });
}

/**
 * 异步合成雪碧图。
 *
 * - URL 去重并保持首次出现顺序（iconIdx 稳定）
 * - 单图加载失败不阻塞整体：该格留透明，仍分配 idx
 * - 图标等比归一化到统一格子（小图会被放大，最长边=cell）
 * - 格子布局接近正方形，受 maxTextureSize 约束（种类极多时自动收缩 cell）
 *
 * @throws 无有效 URL、拿不到 2d 上下文、或 canvas 被跨域污染导致 toDataURL 失败时抛错，
 *         由控制器捕获并降级为圆点渲染。
 */
export async function buildSpriteAtlas(
  urls: string[],
  options: SpriteAtlasOptions = {},
): Promise<SpriteAtlas> {
  // 去重，保持稳定顺序
  const unique: string[] = [];
  const seen = new Set<string>();
  for (const u of urls) {
    if (u && !seen.has(u)) {
      seen.add(u);
      unique.push(u);
    }
  }
  if (unique.length === 0) {
    throw new Error('[g-map] sprite atlas: no valid icon url');
  }

  const crossOrigin = options.crossOrigin ?? 'anonymous';
  const maxTexture = options.maxTextureSize ?? DEFAULT_MAX_TEXTURE;

  // 并发加载；单图失败记为 null（该格透明），不 reject 整体
  const images = await Promise.all(
    unique.map((u) => loadImage(u, crossOrigin).catch(() => null)),
  );

  // 格子边长：默认取最大自然边长（正方形，等比归一化后所有图标显示尺寸一致）
  let cell = options.cellSize ?? 0;
  if (!cell) {
    for (const img of images) {
      if (img) cell = Math.max(cell, img.naturalWidth, img.naturalHeight);
    }
  }
  if (!cell) cell = FALLBACK_CELL; // 全部加载失败时的兜底
  cell = Math.max(1, Math.ceil(cell));

  // 布局：接近正方形，且列宽不超过纹理上限
  const n = unique.length;
  const maxCols = Math.max(1, Math.floor(maxTexture / cell));
  let cols = Math.min(Math.ceil(Math.sqrt(n)), maxCols);
  const rows = Math.ceil(n / cols);

  // 行高仍超上限（种类极多）→ 收缩格子边长
  let cellW = cell;
  let cellH = cell;
  if (rows * cell > maxTexture) {
    const shrunk = Math.floor(maxTexture / rows);
    if (shrunk >= 1) {
      cellW = shrunk;
      cellH = shrunk;
    }
  }

  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, cols * cellW);
  canvas.height = Math.max(1, rows * cellH);
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('[g-map] sprite atlas: 2d context unavailable');
  }

  const urlToIdx = new Map<string, number>();
  unique.forEach((u, idx) => {
    urlToIdx.set(u, idx);
    const img = images[idx];
    if (!img) return; // 失败 → 留透明格
    const col = idx % cols;
    const row = Math.floor(idx / cols);
    const dx = col * cellW;
    const dy = row * cellH;
    // 等比归一化到格子（最长边填满 cell），居中绘制
    const scale = Math.min(cellW / img.naturalWidth, cellH / img.naturalHeight);
    const w = img.naturalWidth * scale;
    const h = img.naturalHeight * scale;
    ctx.drawImage(img, dx + (cellW - w) / 2, dy + (cellH - h) / 2, w, h);
  });

  let dataUrl: string;
  try {
    dataUrl = canvas.toDataURL();
  } catch {
    throw new Error(
      '[g-map] sprite atlas: canvas tainted (图标跨域且服务器未放行 CORS，无法合成)',
    );
  }

  return { dataUrl, cellW, cellH, cols, count: n, urlToIdx };
}

/** 由 iconIdx 与布局换算格子左上角偏移（源图像素坐标） */
export function spriteOffset(idx: number, cols: number, cellW: number, cellH: number): [number, number] {
  const col = idx % cols;
  const row = Math.floor(idx / cols);
  return [col * cellW, row * cellH];
}

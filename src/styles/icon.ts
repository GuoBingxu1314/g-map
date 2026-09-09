import Icon from 'ol/style/Icon';


export interface IconStyleOptions {

  src?: string;

  /**
   * 图片显示尺寸
   */
  size?: number;

  /**
   * 锚点
   */
  anchor?: [number, number];

  /**
   * 锚点单位
   */
  anchorOrigin?:
    | 'top-left'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-right';

  /**
   * 偏移
   */
  offset?: [number, number];

  /**
   * 旋转
   */
  rotation?: number;

  /**
   * 透明度
   */
  opacity?: number;
}


export function createIconStyle(
  options: IconStyleOptions,
) {

  return new Icon({

    src: options.src,

    anchor: options.anchor,

    anchorOrigin: options.anchorOrigin,

    offset: options.offset,

    rotation: options.rotation,

    opacity: options.opacity,

  });

}

import { App } from 'vue';
import { ComponentOptionsMixin } from 'vue';
import { ComponentProvideOptions } from 'vue';
import { default as default_2 } from 'ol/MapBrowserEvent';
import { default as default_3 } from 'ol/Feature';
import { default as default_4 } from 'ol/geom/Geometry';
import { default as default_5 } from 'ol/geom/Point';
import { DefineComponent } from 'vue';
import { Plugin as Plugin_2 } from 'vue';
import { PublicProps } from 'vue';

declare const __VLS_base: DefineComponent<Props, GMapExpose, {}, {}, {}, ComponentOptionsMixin, ComponentOptionsMixin, {}, string, PublicProps, Readonly<Props> & Readonly<{}>, {
    attribution: boolean;
}, {}, {}, {}, string, ComponentProvideOptions, false, {}, any>;

declare const __VLS_base_10: DefineComponent<Props_6, {}, {}, {}, {}, ComponentOptionsMixin, ComponentOptionsMixin, {
    "update:coordinates": (coordinates: [number, number][][]) => any;
}, string, PublicProps, Readonly<Props_6> & Readonly<{
    "onUpdate:coordinates"?: ((coordinates: [number, number][][]) => any) | undefined;
}>, {}, {}, {}, {}, string, ComponentProvideOptions, false, {}, any>;

declare const __VLS_base_11: DefineComponent<Props_7, {}, {}, {}, {}, ComponentOptionsMixin, ComponentOptionsMixin, {
    "update:center": (center: [number, number]) => any;
    "update:radius": (radius: number) => any;
}, string, PublicProps, Readonly<Props_7> & Readonly<{
    "onUpdate:center"?: ((center: [number, number]) => any) | undefined;
    "onUpdate:radius"?: ((radius: number) => any) | undefined;
}>, {}, {}, {}, {}, string, ComponentProvideOptions, false, {}, any>;

declare const __VLS_base_2: DefineComponent<Props_2, {}, {}, {}, {}, ComponentOptionsMixin, ComponentOptionsMixin, {
    "update:center": (center: [number, number]) => any;
    "update:zoom": (zoom: number) => any;
}, string, PublicProps, Readonly<Props_2> & Readonly<{
    "onUpdate:center"?: ((center: [number, number]) => any) | undefined;
    "onUpdate:zoom"?: ((zoom: number) => any) | undefined;
}>, {
    center: [number, number];
    zoom: number;
}, {}, {}, {}, string, ComponentProvideOptions, false, {}, any>;

declare const __VLS_base_3: DefineComponent<{}, {}, {}, {}, {}, ComponentOptionsMixin, ComponentOptionsMixin, {}, string, PublicProps, Readonly<{}> & Readonly<{}>, {}, {}, {}, {}, string, ComponentProvideOptions, true, {}, any>;

declare const __VLS_base_4: DefineComponent<{}, {}, {}, {}, {}, ComponentOptionsMixin, ComponentOptionsMixin, {}, string, PublicProps, Readonly<{}> & Readonly<{}>, {}, {}, {}, {}, string, ComponentProvideOptions, true, {}, any>;

declare const __VLS_base_5: DefineComponent<{}, {}, {}, {}, {}, ComponentOptionsMixin, ComponentOptionsMixin, {}, string, PublicProps, Readonly<{}> & Readonly<{}>, {}, {}, {}, {}, string, ComponentProvideOptions, true, {}, any>;

declare const __VLS_base_6: DefineComponent<{}, {}, {}, {}, {}, ComponentOptionsMixin, ComponentOptionsMixin, {}, string, PublicProps, Readonly<{}> & Readonly<{}>, {}, {}, {}, {}, string, ComponentProvideOptions, true, {}, any>;

declare const __VLS_base_7: DefineComponent<Props_3, {}, {}, {}, {}, ComponentOptionsMixin, ComponentOptionsMixin, {
    click: (event: GFeatureEvent< default_2<PointerEvent | KeyboardEvent | WheelEvent>>) => any;
    dblclick: (event: GFeatureEvent< default_2<PointerEvent | KeyboardEvent | WheelEvent>>) => any;
    select: (event: GFeatureEvent< default_2<PointerEvent | KeyboardEvent | WheelEvent>>) => any;
    mouseenter: (event: GFeatureEvent< default_2<PointerEvent | KeyboardEvent | WheelEvent>>) => any;
    mouseleave: (event: GFeatureEvent< default_2<PointerEvent | KeyboardEvent | WheelEvent>>) => any;
    unselect: (event: GFeatureEvent< default_2<PointerEvent | KeyboardEvent | WheelEvent>>) => any;
}, string, PublicProps, Readonly<Props_3> & Readonly<{
    onClick?: ((event: GFeatureEvent< default_2<PointerEvent | KeyboardEvent | WheelEvent>>) => any) | undefined;
    onDblclick?: ((event: GFeatureEvent< default_2<PointerEvent | KeyboardEvent | WheelEvent>>) => any) | undefined;
    onSelect?: ((event: GFeatureEvent< default_2<PointerEvent | KeyboardEvent | WheelEvent>>) => any) | undefined;
    onMouseenter?: ((event: GFeatureEvent< default_2<PointerEvent | KeyboardEvent | WheelEvent>>) => any) | undefined;
    onMouseleave?: ((event: GFeatureEvent< default_2<PointerEvent | KeyboardEvent | WheelEvent>>) => any) | undefined;
    onUnselect?: ((event: GFeatureEvent< default_2<PointerEvent | KeyboardEvent | WheelEvent>>) => any) | undefined;
}>, {}, {}, {}, {}, string, ComponentProvideOptions, false, {}, any>;

declare const __VLS_base_8: DefineComponent<Props_4, {}, {}, {}, {}, ComponentOptionsMixin, ComponentOptionsMixin, {
    "update:coordinates": (coordinates: [number, number]) => any;
}, string, PublicProps, Readonly<Props_4> & Readonly<{
    "onUpdate:coordinates"?: ((coordinates: [number, number]) => any) | undefined;
}>, {}, {}, {}, {}, string, ComponentProvideOptions, false, {}, any>;

declare const __VLS_base_9: DefineComponent<Props_5, {}, {}, {}, {}, ComponentOptionsMixin, ComponentOptionsMixin, {
    "update:coordinates": (coordinates: [number, number][]) => any;
}, string, PublicProps, Readonly<Props_5> & Readonly<{
    "onUpdate:coordinates"?: ((coordinates: [number, number][]) => any) | undefined;
}>, {}, {}, {}, {}, string, ComponentProvideOptions, false, {}, any>;

declare const __VLS_export: __VLS_WithSlots<typeof __VLS_base, __VLS_Slots>;

declare const __VLS_export_10: __VLS_WithSlots_10<typeof __VLS_base_10, __VLS_Slots_10>;

declare const __VLS_export_11: __VLS_WithSlots_11<typeof __VLS_base_11, __VLS_Slots_11>;

declare const __VLS_export_2: __VLS_WithSlots_2<typeof __VLS_base_2, __VLS_Slots_2>;

declare const __VLS_export_3: __VLS_WithSlots_3<typeof __VLS_base_3, __VLS_Slots_3>;

declare const __VLS_export_4: __VLS_WithSlots_4<typeof __VLS_base_4, __VLS_Slots_4>;

declare const __VLS_export_5: __VLS_WithSlots_5<typeof __VLS_base_5, __VLS_Slots_5>;

declare const __VLS_export_6: __VLS_WithSlots_6<typeof __VLS_base_6, __VLS_Slots_6>;

declare const __VLS_export_7: __VLS_WithSlots_7<typeof __VLS_base_7, __VLS_Slots_7>;

declare const __VLS_export_8: __VLS_WithSlots_8<typeof __VLS_base_8, __VLS_Slots_8>;

declare const __VLS_export_9: __VLS_WithSlots_9<typeof __VLS_base_9, __VLS_Slots_9>;

declare type __VLS_Slots = {} & {
    default?: (props: typeof __VLS_1) => any;
};

declare type __VLS_Slots_10 = {} & {
    default?: (props: typeof __VLS_1) => any;
};

declare type __VLS_Slots_11 = {} & {
    default?: (props: typeof __VLS_1) => any;
};

declare type __VLS_Slots_2 = {} & {
    default?: (props: typeof __VLS_1) => any;
};

declare type __VLS_Slots_3 = {} & {
    default?: (props: typeof __VLS_1) => any;
};

declare type __VLS_Slots_4 = {} & {
    default?: (props: typeof __VLS_1) => any;
};

declare type __VLS_Slots_5 = {} & {
    default?: (props: typeof __VLS_1) => any;
};

declare type __VLS_Slots_6 = {} & {
    default?: (props: typeof __VLS_1) => any;
};

declare type __VLS_Slots_7 = {} & {
    default?: (props: typeof __VLS_1) => any;
};

declare type __VLS_Slots_8 = {} & {
    icon?: (props: typeof __VLS_1) => any;
} & {
    default?: (props: typeof __VLS_3) => any;
};

declare type __VLS_Slots_9 = {} & {
    default?: (props: typeof __VLS_1) => any;
};

declare type __VLS_WithSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};

declare type __VLS_WithSlots_10<T, S> = T & {
    new (): {
        $slots: S;
    };
};

declare type __VLS_WithSlots_11<T, S> = T & {
    new (): {
        $slots: S;
    };
};

declare type __VLS_WithSlots_2<T, S> = T & {
    new (): {
        $slots: S;
    };
};

declare type __VLS_WithSlots_3<T, S> = T & {
    new (): {
        $slots: S;
    };
};

declare type __VLS_WithSlots_4<T, S> = T & {
    new (): {
        $slots: S;
    };
};

declare type __VLS_WithSlots_5<T, S> = T & {
    new (): {
        $slots: S;
    };
};

declare type __VLS_WithSlots_6<T, S> = T & {
    new (): {
        $slots: S;
    };
};

declare type __VLS_WithSlots_7<T, S> = T & {
    new (): {
        $slots: S;
    };
};

declare type __VLS_WithSlots_8<T, S> = T & {
    new (): {
        $slots: S;
    };
};

declare type __VLS_WithSlots_9<T, S> = T & {
    new (): {
        $slots: S;
    };
};

export declare interface CircleStyleOptions {
    fillColor?: string;
    strokeColor?: string;
    strokeWidth?: number;
    zIndex?: number;
}

export declare type Coordinate = [
number,
number
];

export declare interface DrawCircleResult {
    center: Coordinate;
    radius: number;
}

export declare type DrawLineStringResult = Coordinate[];

export declare type DrawPolygonResult = Coordinate[];

export declare interface DrawStyleOptions {
    fillColor?: string;
    strokeColor?: string;
    strokeWidth?: number;
    pointRadius?: number;
}

export declare type DrawType = 'LineString' | 'Polygon' | 'Circle';

export declare interface FeatureEvents {
    singleclick?: (event: GFeatureEvent) => void;
    click?: (event: GFeatureEvent) => void;
    dblclick?: (event: GFeatureEvent) => void;
    mouseenter?: (event: GFeatureEvent) => void;
    mouseleave?: (event: GFeatureEvent) => void;
    select?: (event: GFeatureEvent) => void;
    unselect?: (event: GFeatureEvent) => void;
}

export declare const GCircle: typeof __VLS_export_11;

export declare const GFeature: typeof __VLS_export_7;

export declare interface GFeatureEvent<T extends default_2 = default_2> {
    feature: default_3;
    id: string | number | undefined;
    properties: Record<string, unknown>;
    originalEvent: T;
}

export declare const GLineString: typeof __VLS_export_9;

export declare const GMap: typeof __VLS_export;

export declare interface GMapExpose {
    addPoint(coordinates: [number, number], options?: PointStyleOptions): default_3<default_5>;
    removeFeature(feature: default_3): boolean;
    clearPoints(): void;
    pickPoint(): Promise<[number, number]>;
    pickFeature<T extends default_4 = default_4>(options?: PickFeatureOptions<T>): Promise<default_3<T>>;
    drawLineString(options?: StartDrawOptions): Promise<DrawLineStringResult>;
    drawPolygon(options?: StartDrawOptions): Promise<DrawPolygonResult>;
    drawCircle(options?: StartDrawOptions): Promise<DrawCircleResult>;
    cancelInteraction(): void;
    selectFeature(options?: SelectFeatureOptions): void;
    stopSelect(): void;
    clearSelection(): void;
    getSelectedFeatures(): default_3[];
}

export declare const GMapPlugin: Plugin_2;

export declare const GOsmSource: typeof __VLS_export_5;

export declare const GPoint: typeof __VLS_export_8;

export declare const GPolygon: typeof __VLS_export_10;

export declare const GTileLayer: typeof __VLS_export_3;

export declare const GVectorLayer: typeof __VLS_export_4;

export declare const GVectorSource: typeof __VLS_export_6;

export declare const GView: typeof __VLS_export_2;

export declare interface IconStyleOptions {
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
    anchorOrigin?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
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

export declare function install(app: App): void;

export declare interface LineStringStyleOptions {
    color?: string;
    width?: number;
    opacity?: number;
    lineCap?: CanvasLineCap;
    lineJoin?: CanvasLineJoin;
    lineDash?: number[];
    zIndex?: number;
}

export declare interface PickFeatureOptions<T extends default_4 = default_4> {
    filter?: (feature: default_3) => boolean;
}

export declare interface PointStyleOptions {
    color?: string;
    radius?: number;
    strokeColor?: string;
    strokeWidth?: number;
    opacity?: number;
    zIndex?: number;
    icon?: IconStyleOptions;
}

export declare interface PolygonStyleOptions {
    fillColor?: string;
    strokeColor?: string;
    strokeWidth?: number;
    lineCap?: CanvasLineCap;
    lineJoin?: CanvasLineJoin;
    lineDash?: number[];
    zIndex?: number;
}

declare interface Props {
    /**
     * 是否显示版权署名（Attribution）控件。
     *
     * 使用 OpenStreetMap 等瓦片源时，其服务条款要求展示署名，
     * 因此默认开启。若你已自行提供署名，可将其关闭。
     */
    attribution?: boolean;
}

declare interface Props_2 {
    center?: [number, number];
    zoom?: number;
    minZoom?: number;
    maxZoom?: number;
    rotation?: number;
}

declare interface Props_3 {
    id?: string | number;
    properties?: Record<string, unknown>;
}

declare interface Props_4 extends PointStyleOptions {
    coordinates: [number, number];
}

declare interface Props_5 extends LineStringStyleOptions {
    coordinates: [number, number][];
}

declare interface Props_6 extends PolygonStyleOptions {
    coordinates: [number, number][][];
}

declare interface Props_7 extends CircleStyleOptions {
    center: [number, number];
    radius: number;
}

export declare interface ResolvedPointStyleOptions {
    color: string;
    radius: number;
    strokeColor: string;
    strokeWidth: number;
    opacity: number;
    zIndex: number;
    icon: IconStyleOptions;
}

export declare interface SelectFeatureOptions {
    filter?: (feature: default_3) => boolean;
    style?: SelectStyleOptions;
    multi?: boolean;
}

export declare interface SelectStyleOptions {
    point?: Partial<PointStyleOptions>;
    line?: Partial<LineStringStyleOptions>;
    polygon?: Partial<PolygonStyleOptions>;
}

export declare interface StartDrawOptions {
    style?: DrawStyleOptions;
}

export { }

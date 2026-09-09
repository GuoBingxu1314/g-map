import { createElementBlock as e, defineComponent as t, inject as n, nextTick as r, onBeforeUnmount as i, onMounted as a, openBlock as o, provide as s, ref as c, renderSlot as l, watch as u } from "vue";
import d from "ol/Map";
import f from "ol/layer/Vector";
import p from "ol/source/Vector";
import m from "ol/Feature";
import { defaults as h } from "ol/control";
import g from "ol/interaction/Draw";
import { fromLonLat as _, toLonLat as v } from "ol/proj";
import y from "ol/style/Fill";
import b from "ol/style/Stroke";
import x from "ol/style/Circle";
import S from "ol/style/Style";
import C from "ol/geom/Point";
import w from "ol/style/Icon";
import T from "ol/geom/LineString";
import E from "ol/geom/Polygon";
import D from "ol/geom/Circle";
import O from "ol/View";
import k from "ol/layer/Tile";
import A from "ol/source/OSM";
//#region src/context/keys.ts
var j = Symbol("GMap"), ee = Symbol("GView"), M = Symbol("GTileLayer"), N = Symbol("GVectorLayer"), P = Symbol("GVectorSource"), F = Symbol("GFeature"), I = /* @__PURE__ */ new WeakMap();
function te(e, t) {
	I.set(e, t);
}
function ne(e) {
	I.delete(e);
}
function L(e) {
	return I.get(e);
}
function re(e) {
	let t = { ...e.getProperties() };
	return delete t.geometry, t;
}
function R(e, t) {
	return {
		feature: e,
		id: e.getId(),
		properties: re(e),
		originalEvent: t
	};
}
//#endregion
//#region src/core/map/mapEvents.ts
function ie(e, t) {
	let n;
	function r(t) {
		let n;
		return e.forEachFeatureAtPixel(t, (e) => (n = e, !0)), n;
	}
	function i(e) {
		let t = r(e.pixel);
		t !== n && (n && L(n)?.mouseleave?.(R(n, e)), t && L(t)?.mouseenter?.(R(t, e)), n = t);
	}
	function a(e) {
		if (t()) return;
		let n = r(e.pixel);
		n && L(n)?.singleclick?.(R(n, e));
	}
	function o(e) {
		if (t()) return;
		let n = r(e.pixel);
		n && L(n)?.click?.(R(n, e));
	}
	function s(e) {
		if (t()) return;
		let n = r(e.pixel);
		n && L(n)?.dblclick?.(R(n, e));
	}
	e.on("pointermove", i), e.on("singleclick", a), e.on("click", o), e.on("dblclick", s);
	function c() {
		e.un("pointermove", i), e.un("singleclick", a), e.un("click", o), e.un("dblclick", s), n &&= void 0;
	}
	return {
		handlePointerMove: i,
		handleSingleClick: a,
		handleClick: o,
		handleDblClick: s,
		destroy: c
	};
}
//#endregion
//#region src/styles/draw.ts
var z = {
	fillColor: "rgba(22, 119, 255, 0.15)",
	strokeColor: "#1677ff",
	strokeWidth: 2,
	pointRadius: 5
};
function ae(e = {}) {
	let { fillColor: t = z.fillColor, strokeColor: n = z.strokeColor, strokeWidth: r = z.strokeWidth, pointRadius: i = z.pointRadius } = e, a = new y({ color: t }), o = new b({
		color: n,
		width: r
	}), s = new x({
		radius: i,
		fill: new y({ color: n }),
		stroke: new b({
			color: "#ffffff",
			width: 2
		})
	});
	return new S({
		fill: a,
		stroke: o,
		image: s
	});
}
//#endregion
//#region src/core/interaction/draw.ts
function oe(e, t, n, r) {
	let i = new g({
		source: t,
		type: n,
		style: ae(r?.style)
	}), a = !1, o, s, c = new Promise((e, t) => {
		o = e, s = t;
	});
	function l() {
		e.removeInteraction(i), t.clear();
	}
	function u(e) {
		if (a) return;
		a = !0;
		let t = o;
		o = void 0, s = void 0, queueMicrotask(() => {
			l(), t?.(e);
		});
	}
	function d(e) {
		if (a) return;
		a = !0;
		let t = s;
		o = void 0, s = void 0, l(), t?.(e);
	}
	function f(e) {
		if (a) return;
		let t = e.feature.getGeometry();
		if (!t) {
			d(/* @__PURE__ */ Error("[GMap] drawn feature has no geometry"));
			return;
		}
		if (n === "LineString") {
			u(t.getCoordinates().map((e) => v(e)));
			return;
		}
		if (n === "Polygon") {
			u(t.getCoordinates()[0]?.map((e) => v(e)) || []);
			return;
		}
		let r = t;
		u({
			center: v(r.getCenter()),
			radius: r.getRadius()
		});
	}
	function p() {
		a || (i.abortDrawing(), d(/* @__PURE__ */ Error("[GMap drawing cancelled]")));
	}
	return i.once("drawend", (e) => {
		f(e);
	}), e.addInteraction(i), {
		promise: c,
		cancel: p
	};
}
//#endregion
//#region src/core/interaction/pick.ts
function se(e) {
	let t = !1, n, r, i = new Promise((e, t) => {
		n = e, r = t;
	});
	function a() {
		e.un("click", c);
	}
	function o(e) {
		if (t) return;
		t = !0;
		let i = n;
		a(), n = void 0, r = void 0, i?.(e);
	}
	function s(e) {
		if (t) return;
		t = !0;
		let i = r;
		a(), n = void 0, r = void 0, i?.(e);
	}
	function c(e) {
		t || o(v(e.coordinate));
	}
	function l() {
		s(/* @__PURE__ */ Error("[GMap point picking cancelled]"));
	}
	return e.on("click", c), {
		promise: i,
		cancel: l
	};
}
function ce(e, t) {
	let n = !1, r, i, a = new Promise((e, t) => {
		r = e, i = t;
	});
	function o() {
		e.un("click", l);
	}
	function s(e) {
		if (n) return;
		n = !0;
		let t = r;
		o(), r = void 0, i = void 0, t?.(e);
	}
	function c(e) {
		if (n) return;
		n = !0;
		let t = i;
		o(), r = void 0, i = void 0, t?.(e);
	}
	function l(r) {
		if (n) return;
		let i;
		e.forEachFeatureAtPixel(r.pixel, (e) => {
			let n = e;
			return t?.filter && !t.filter(n) ? !1 : (i = n, !0);
		}), i && s(i);
	}
	function u() {
		c(/* @__PURE__ */ Error("[GMap feature picking cancelled]"));
	}
	return e.on("click", l), {
		promise: a,
		cancel: u
	};
}
//#endregion
//#region src/utils/iconScale.ts
function B(e, t) {
	let n = e.getImage(1);
	if (!(n instanceof HTMLImageElement)) return;
	let r = () => {
		let r = n.naturalWidth, i = n.naturalHeight;
		if (!r || !i) return;
		let a = Math.max(r, i);
		return e.setScale(t / a), !0;
	};
	r() || (n.onload = r);
}
//#endregion
//#region src/styles/icon.ts
function V(e) {
	return new w({
		src: e.src,
		anchor: e.anchor,
		anchorOrigin: e.anchorOrigin,
		offset: e.offset,
		rotation: e.rotation,
		opacity: e.opacity
	});
}
//#endregion
//#region src/styles/point.ts
var H = {
	color: "#1677ff",
	radius: 6,
	strokeColor: "#ffffff",
	strokeWidth: 2,
	opacity: 1,
	zIndex: 0,
	icon: {
		src: void 0,
		size: 32,
		anchor: [.5, 1],
		rotation: 0
	}
};
function le(e = {}) {
	return {
		color: e.color ?? H.color,
		radius: e.radius ?? H.radius,
		strokeColor: e.strokeColor ?? H.strokeColor,
		strokeWidth: e.strokeWidth ?? H.strokeWidth,
		opacity: e.opacity ?? H.opacity,
		zIndex: e.zIndex ?? H.zIndex,
		icon: {
			...H.icon,
			...e.icon
		}
	};
}
function U(e = {}) {
	let { color: t, radius: n, strokeColor: r, strokeWidth: i, opacity: a, zIndex: o, icon: s } = le(e);
	if (s.src) {
		let e = V({
			src: s.src,
			anchor: s.anchor,
			rotation: s.rotation,
			opacity: a
		});
		return B(e, s.size ?? H.icon.size), {
			style: new S({
				image: e,
				zIndex: o
			}),
			icon: e
		};
	}
	let c = new y({ color: t }), l = new b({
		color: r,
		width: i
	}), u = new x({
		radius: n,
		fill: c,
		stroke: l
	});
	return u.setOpacity(a), {
		style: new S({
			image: u,
			zIndex: o
		}),
		circle: u,
		fill: c,
		stroke: l
	};
}
//#endregion
//#region src/context/feature/source.ts
var W = /* @__PURE__ */ new WeakMap();
function ue(e, t) {
	W.set(e, t);
}
function G(e) {
	W.delete(e);
}
function de(e) {
	return W.get(e);
}
//#endregion
//#region src/core/map/mapFeatures.ts
function fe(e) {
	function t(t, n) {
		let r = new C(_(t)), i = new m(r), a = U(n);
		return i.setStyle(a.style), e.addFeature(i), ue(i, e), i;
	}
	function n(e) {
		let t = de(e);
		return !t || !t.hasFeature(e) ? !1 : (t.removeFeature(e), G(e), !0);
	}
	function r() {
		e.getFeatures().forEach((e) => {
			G(e);
		}), e.clear();
	}
	return {
		addPoint: t,
		removeFeature: n,
		clearPoints: r
	};
}
//#endregion
//#region src/styles/select.ts
var K = {
	point: {
		color: "#ffd065",
		radius: 7,
		strokeColor: "#fff",
		strokeWidth: 2
	},
	line: {
		color: "#ffd065",
		width: 5
	},
	polygon: {
		fillColor: "rgb(255 208 101 / 0.3)",
		strokeColor: "#ffd065",
		strokeWidth: 3
	}
};
function pe(e, t) {
	let n = e.getGeometry();
	if (n) {
		if (n instanceof C) {
			let e = {
				...K.point,
				...t?.point
			};
			if (e.icon?.src) {
				let t = V(e.icon);
				return e.icon.size && B(t, e.icon.size), new S({ image: t });
			}
			return new S({ image: new x({
				radius: e.radius ?? 0,
				fill: new y({ color: e.color }),
				stroke: new b({
					color: e.strokeColor,
					width: e.strokeWidth
				})
			}) });
		}
		if (n instanceof T) {
			let e = {
				...K.line,
				...t?.line
			};
			return new S({ stroke: new b({
				color: e.color,
				width: e.width
			}) });
		}
		if (n instanceof E) {
			let e = {
				...K.polygon,
				...t?.polygon
			};
			return new S({
				fill: new y({ color: e.fillColor }),
				stroke: new b({
					color: e.strokeColor,
					width: e.strokeWidth
				})
			});
		}
		if (n instanceof D) {
			let e = {
				...K.polygon,
				...t?.polygon
			};
			return new S({
				fill: new y({ color: e.fillColor }),
				stroke: new b({
					color: e.strokeColor,
					width: e.strokeWidth
				})
			});
		}
	}
}
//#endregion
//#region src/context/feature/state.ts
var q = /* @__PURE__ */ new WeakMap();
function me(e) {
	let t = q.get(e);
	return t || (t = { selected: !1 }, q.set(e, t)), t;
}
function he(e) {
	return me(e).selected;
}
function J(e, t) {
	me(e).selected = t;
}
function ge(e) {
	q.delete(e);
}
//#endregion
//#region src/core/map/select.ts
var Y = /* @__PURE__ */ new WeakMap();
function _e(e, t) {
	let n;
	return e.forEachFeatureAtPixel(t, (e) => (n = e, !0)), n;
}
function ve(e) {
	let t = /* @__PURE__ */ new Set(), n = { multi: !1 };
	function r(e, r) {
		if (n.filter && !n.filter(e) || (n.multi || t.forEach((t) => {
			t !== e && i(t, r);
		}), t.has(e))) return;
		t.add(e), J(e, !0), Y.set(e, e.getStyle());
		let a = pe(e, n.style);
		a && e.setStyle(a), L(e)?.select?.(R(e, r));
	}
	function i(e, n) {
		if (!t.has(e)) return;
		t.delete(e), J(e, !1);
		let r = Y.get(e);
		e.setStyle(r), Y.delete(e), L(e)?.unselect?.(R(e, n));
	}
	function a(t) {
		let n = _e(e, t.pixel);
		if (n) {
			if (he(n)) {
				i(n, t);
				return;
			}
			r(n, t);
		}
	}
	let o = !1;
	function s(t = {}) {
		n = {
			multi: !1,
			...t
		}, !o && (e.on("click", a), o = !0);
	}
	function c() {
		o &&= (e.un("click", a), !1);
	}
	function l() {
		t.forEach((e) => {
			J(e, !1), e.setStyle(Y.get(e)), Y.delete(e);
		}), t.clear();
	}
	function u() {
		return o;
	}
	function d() {
		return [...t];
	}
	function f() {
		c(), l();
	}
	return {
		start: s,
		stop: c,
		clear: l,
		isActive: u,
		getSelectedFeatures: d,
		destroy: f
	};
}
//#endregion
//#region src/components/map/GMap/index.vue?vue&type=script&setup=true&lang.ts
var ye = 9999, be = 9998, xe = /* @__PURE__ */ ((e, t) => {
	let n = e.__vccOpts || e;
	for (let [e, r] of t) n[e] = r;
	return n;
})(/* @__PURE__ */ t({
	name: "GMap",
	__name: "index",
	props: { attribution: {
		type: Boolean,
		default: !0
	} },
	setup(t, { expose: n }) {
		let r = t, u = {
			LineString: "draw-linestring",
			Polygon: "draw-polygon",
			Circle: "draw-circle"
		}, m = c(), g = new d({ controls: h({ attribution: r.attribution }) });
		s(j, g);
		let _ = new p(), v = new f({
			source: _,
			zIndex: ye
		});
		g.addLayer(v);
		let y = fe(_), b = new p(), x = new f({
			source: b,
			zIndex: be
		});
		g.addLayer(x);
		let S = ve(g), C, w = ie(g, () => !!C), T;
		function E() {
			if (C) return Promise.reject(/* @__PURE__ */ Error("[GMap] point picking is already active"));
			C = "pick-point", N(!0);
			let e = se(g);
			return T = e.cancel, e.promise.finally(() => {
				T === e.cancel && (T = void 0), C = void 0, N(!1);
			});
		}
		function D(e) {
			if (C) return Promise.reject(/* @__PURE__ */ Error("[GMap] interaction is already active"));
			C = "pick-feature", N(!0);
			let t = ce(g, e);
			return T = t.cancel, t.promise.finally(() => {
				T === t.cancel && (T = void 0), C = void 0, N(!1);
			});
		}
		function O(e, t) {
			if (C) return Promise.reject(/* @__PURE__ */ Error("[GMap] interaction is already active"));
			C = u[e], N(!0);
			let n = oe(g, b, e, t);
			return T = n.cancel, n.promise.finally(() => {
				T === n.cancel && (T = void 0), C = void 0, N(!1);
			});
		}
		function k(e) {
			return O("LineString", e);
		}
		function A(e) {
			return O("Polygon", e);
		}
		function ee(e) {
			return O("Circle", e);
		}
		function M() {
			T?.();
		}
		function N(e) {
			m.value && (m.value.style.cursor = e ? "crosshair" : "");
		}
		function P(e) {
			C && M(), C = "select", S.start(e);
		}
		function F() {
			S.stop(), C === "select" && (C = void 0);
		}
		function I() {
			S.clear();
		}
		function te() {
			return S.getSelectedFeatures();
		}
		return a(() => {
			g.setTarget(m.value);
		}), i(() => {
			M(), w.destroy(), g.setTarget(void 0), C = void 0;
		}), n({
			addPoint: y.addPoint,
			removeFeature: y.removeFeature,
			clearPoints: y.clearPoints,
			pickPoint: E,
			pickFeature: D,
			drawLineString: k,
			drawPolygon: A,
			drawCircle: ee,
			cancelInteraction: M,
			selectFeature: P,
			stopSelect: F,
			clearSelection: I,
			getSelectedFeatures: te
		}), (t, n) => (o(), e("div", {
			ref_key: "mapElement",
			ref: m,
			class: "g-map"
		}, [l(t.$slots, "default", {}, void 0, !0)], 512));
	}
}), [["__scopeId", "data-v-aaaf2c93"]]), Se = /* @__PURE__ */ t({
	name: "GView",
	__name: "index",
	props: {
		center: { default: () => [0, 0] },
		zoom: { default: 2 },
		minZoom: {},
		maxZoom: {},
		rotation: {}
	},
	emits: ["update:center", "update:zoom"],
	setup(e, { emit: t }) {
		let r = e, a = t, o = n(j);
		if (!o) throw Error("[GView] must be used inside [GMap]");
		let c = new O({
			center: _(r.center),
			zoom: r.zoom,
			minZoom: r.minZoom,
			maxZoom: r.maxZoom,
			rotation: r.rotation
		});
		o.setView(c), s(ee, c);
		function d(e, t) {
			return e[0] === t[0] && e[1] === t[1];
		}
		u(() => r.center, (e) => {
			let t = c.getCenter();
			t && (d(v(t), e) || c.setCenter(_(e)));
		}), u(() => r.zoom, (e) => {
			let t = c.getZoom();
			t !== void 0 && t !== e && c.setZoom(e);
		});
		let f = c.on("change:center", () => {
			let e = c.getCenter();
			e && a("update:center", v(e));
		}), p = c.on("change:resolution", () => {
			let e = c.getZoom();
			e && a("update:zoom", e);
		});
		return i(() => {
			c.un("change:center", f.listener), c.un("change:resolution", p.listener), o.getView() === c && o.setView(null);
		}), (e, t) => l(e.$slots, "default");
	}
}), Ce = /* @__PURE__ */ t({
	name: "GTileLayer",
	__name: "index",
	setup(e) {
		let t = n(j);
		if (!t) throw Error("[GTileLayer] must be used inside [GMap]");
		let r = new k();
		return t.addLayer(r), s(M, r), i(() => {
			t.removeLayer(r);
		}), (e, t) => l(e.$slots, "default");
	}
}), we = /* @__PURE__ */ t({
	name: "GVectorLayer",
	__name: "index",
	setup(e) {
		let t = n(j);
		if (!t) throw Error("[GVectorLayer] must be used within a [GMap]");
		let r = new f({ zIndex: 100 });
		return t.addLayer(r), s(N, r), i(() => {
			t.removeLayer(r);
		}), (e, t) => l(e.$slots, "default");
	}
}), Te = /* @__PURE__ */ t({
	name: "GOsmSource",
	__name: "index",
	setup(e) {
		let t = n(M);
		if (!t) throw Error("[GOsmSource] must be used inside [GTileLayer]");
		let r = new A();
		return t.setSource(r), (e, t) => l(e.$slots, "default");
	}
}), Ee = /* @__PURE__ */ t({
	name: "GVectorSource",
	__name: "index",
	setup(e) {
		let t = n(N);
		if (!t) throw Error("[GVectorSource] must be used within a [GVectorLayer]");
		let r = new p();
		return t.setSource(r), s(P, r), (e, t) => l(e.$slots, "default");
	}
}), De = /* @__PURE__ */ t({
	name: "GFeature",
	__name: "index",
	props: {
		id: {},
		properties: {}
	},
	emits: [
		"click",
		"dblclick",
		"mouseenter",
		"mouseleave",
		"select",
		"unselect"
	],
	setup(e, { emit: t }) {
		let r = e, a = t, o = n(P);
		if (!o) throw Error("[GFeature] must be used within a [GVectorSource]");
		let c = new m();
		o.addFeature(c), ue(c, o), s(F, c);
		function d() {
			c.setId(r.id);
		}
		let f = {};
		function p(e) {
			Object.keys(f).forEach((t) => {
				t in e || c.unset(t);
			}), c.setProperties(e), f = { ...e };
		}
		return d(), p(r.properties ?? {}), u(() => r.id, (e) => {
			c.setId(e);
		}), u(() => r.properties, (e) => {
			p(e ?? {});
		}, { deep: !0 }), te(c, {
			singleclick: (e) => a("click", e),
			dblclick: (e) => a("dblclick", e),
			mouseenter: (e) => a("mouseenter", e),
			mouseleave: (e) => a("mouseleave", e),
			select: (e) => a("select", e),
			unselect: (e) => a("unselect", e)
		}), i(() => {
			o.hasFeature(c) && o.removeFeature(c), ne(c), G(c), ge(c);
		}), (e, t) => l(e.$slots, "default");
	}
}), Oe = /* @__PURE__ */ t({
	name: "GPoint",
	__name: "index",
	props: {
		coordinates: {},
		color: {},
		radius: {},
		strokeColor: {},
		strokeWidth: {},
		opacity: {},
		zIndex: {},
		icon: {}
	},
	emits: ["update:coordinates"],
	setup(t, { emit: s }) {
		let d = t, f = s;
		if (!n(j)) throw Error("[GPoint] must be used inside [GMap]");
		let p = n(F);
		if (!p) throw Error("[GPoint] must be used inside [GFeature]");
		if (p.getGeometry()) throw Error("[GPoint] A GFeature can only contain one geometry");
		let m = c();
		function h() {
			return !!m.value?.querySelector("svg");
		}
		function g() {
			let e = m.value?.querySelector("svg");
			if (!e) return;
			let t = e.cloneNode(!0);
			t.getAttribute("xmlns") || t.setAttribute("xmlns", "http://www.w3.org/2000/svg"), t.getAttribute("xmlns:xlink") || t.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
			let n = new XMLSerializer().serializeToString(t);
			return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(n)}`;
		}
		let y;
		function b() {
			return le(d);
		}
		let x = new C(_(d.coordinates));
		p.setGeometry(x);
		function w() {
			let e = x.getCoordinates();
			f("update:coordinates", v(e));
		}
		x.on("change", w);
		function T(e) {
			let t = _(e), n = x.getCoordinates();
			(n[0] !== t[0] || n[1] !== t[1]) && x.setCoordinates(t);
		}
		function E() {
			let e = b(), t = U({
				color: e.color,
				radius: e.radius,
				strokeColor: e.strokeColor,
				strokeWidth: e.strokeWidth,
				opacity: e.opacity,
				zIndex: e.zIndex
			});
			return t.fill, t.stroke, t.circle, t.style, t.style;
		}
		function D() {
			let e = b();
			if (!e.icon.src) return;
			let t = U({
				icon: {
					src: e.icon.src,
					size: e.icon.size,
					anchor: e.icon.anchor,
					anchorOrigin: e.icon.anchorOrigin,
					offset: e.icon.offset,
					rotation: e.icon.rotation
				},
				opacity: e.opacity,
				zIndex: e.zIndex
			});
			return t.icon, t.style, t.style;
		}
		function O() {
			let e = g();
			if (!e) return;
			let t = b(), n = V({
				src: e,
				anchor: t.icon.anchor,
				anchorOrigin: t.icon.anchorOrigin,
				offset: t.icon.offset,
				rotation: t.icon.rotation,
				opacity: t.opacity
			}), r = new S({
				image: n,
				zIndex: t.zIndex
			});
			return B(n, t.icon.size ?? 1), r;
		}
		function k() {
			return h() ? O() : d.icon?.src ? D() : E();
		}
		function A() {
			let e = k();
			p?.setStyle(e);
		}
		return A(), a(async () => {
			await r(), m.value && (y = new MutationObserver(() => {
				h() && A();
			}), y.observe(m.value, {
				childList: !0,
				subtree: !0
			}), h() && A());
		}), u(() => d.coordinates, (e) => {
			T(e);
		}), u([
			() => d.color,
			() => d.radius,
			() => d.strokeColor,
			() => d.strokeWidth,
			() => d.opacity,
			() => d.zIndex,
			() => d.icon
		], () => {
			A();
		}, { deep: !0 }), i(() => {
			x.un("change", w), y?.disconnect(), y = void 0, p.setGeometry(void 0), p.setStyle(void 0);
		}), (t, n) => t.$slots.icon ? (o(), e("div", {
			key: 0,
			ref_key: "iconContainer",
			ref: m,
			style: { display: "none" }
		}, [l(t.$slots, "icon")], 512)) : l(t.$slots, "default", {}, void 0, void 0, 1);
	}
}), X = {
	color: "#1677ff",
	width: 3,
	opacity: 1,
	lineCap: "round",
	lineJoin: "round",
	lineDash: void 0,
	zIndex: 0
};
function ke(e = {}) {
	return {
		color: e.color ?? X.color,
		width: e.width ?? X.width,
		opacity: e.opacity ?? X.opacity,
		lineCap: e.lineCap ?? X.lineCap,
		lineJoin: e.lineJoin ?? X.lineJoin,
		lineDash: e.lineDash ?? X.lineDash,
		zIndex: e.zIndex ?? X.zIndex
	};
}
function Ae(e = {}) {
	let { color: t, width: n, lineCap: r, lineJoin: i, lineDash: a, zIndex: o } = ke(e), s = new b({
		color: t,
		width: n,
		lineCap: r,
		lineJoin: i,
		lineDash: a
	});
	return {
		style: new S({
			stroke: s,
			zIndex: o
		}),
		stroke: s
	};
}
//#endregion
//#region src/components/feature/GLineString/index.ts
var je = /* @__PURE__ */ t({
	name: "GLineString",
	__name: "index",
	props: {
		coordinates: {},
		color: {},
		width: {},
		opacity: {},
		lineCap: {},
		lineJoin: {},
		lineDash: {},
		zIndex: {}
	},
	emits: ["update:coordinates"],
	setup(e, { emit: t }) {
		let r = e, a = t, o = n(F);
		if (!o) throw Error("[GLineString] must be used within [GFeature]");
		if (o.getGeometry()) throw Error("[GLineString] A GFeature can only contain one geometry");
		let s = new T(r.coordinates.map((e) => _(e)));
		o.setGeometry(s);
		function c() {
			let e = s.getCoordinates().map((e) => v(e));
			a("update:coordinates", e);
		}
		s.on("change", c);
		function d(e) {
			let t = e.map((e) => _(e)), n = s.getCoordinates();
			n.length === t.length && n.every((e, n) => e[0] === t?.[n]?.[0] && e[1] === t?.[n]?.[1]) || s.setCoordinates(t);
		}
		let f;
		function p() {
			let e = Ae(r);
			f = e.style, e.stroke, o?.setStyle(f);
		}
		return p(), u(() => r.coordinates, (e) => {
			d(e);
		}, { deep: !0 }), u([
			() => r.color,
			() => r.width,
			() => r.opacity,
			() => r.lineCap,
			() => r.lineJoin,
			() => r.lineDash,
			() => r.zIndex
		], () => {
			p();
		}, { deep: !0 }), i(() => {
			s.un("change", c), o.setGeometry(void 0);
		}), (e, t) => l(e.$slots, "default");
	}
}), Z = {
	fillColor: "rgba(22, 119, 255, 0.2)",
	strokeColor: "#1677ff",
	strokeWidth: 2,
	lineCap: "round",
	lineJoin: "round",
	lineDash: void 0,
	zIndex: 0
};
function Me(e = {}) {
	return {
		fillColor: e.fillColor ?? Z.fillColor,
		strokeColor: e.strokeColor ?? Z.strokeColor,
		strokeWidth: e.strokeWidth ?? Z.strokeWidth,
		lineCap: e.lineCap ?? Z.lineCap,
		lineJoin: e.lineJoin ?? Z.lineJoin,
		lineDash: e.lineDash ?? Z.lineDash,
		zIndex: e.zIndex ?? Z.zIndex
	};
}
function Ne(e = {}) {
	let { fillColor: t, strokeColor: n, strokeWidth: r, lineCap: i, lineJoin: a, lineDash: o, zIndex: s } = Me(e), c = new y({ color: t }), l = new b({
		color: n,
		width: r,
		lineCap: i,
		lineJoin: a,
		lineDash: o
	});
	return {
		style: new S({
			fill: c,
			stroke: l,
			zIndex: s
		}),
		fill: c,
		stroke: l
	};
}
//#endregion
//#region src/components/feature/GPolygon/index.ts
var Q = /* @__PURE__ */ t({
	name: "GPolygon",
	__name: "index",
	props: {
		coordinates: {},
		fillColor: {},
		strokeColor: {},
		strokeWidth: {},
		lineCap: {},
		lineJoin: {},
		lineDash: {},
		zIndex: {}
	},
	emits: ["update:coordinates"],
	setup(e, { emit: t }) {
		let r = e, a = t, o = n(F);
		if (!o) throw Error("[GPolygon] must be used winth in [GFeature]");
		if (o.getGeometry()) throw Error("[GPolygon] A GFeature can only contain one geometry");
		let s = new E(r.coordinates.map((e) => e.map((e) => _(e))));
		o.setGeometry(s);
		function c() {
			let e = s.getCoordinates().map((e) => e.map((e) => v(e)));
			a("update:coordinates", e);
		}
		s.on("change", c);
		function d(e) {
			let t = e.map((e) => e.map((e) => _(e))), n = s.getCoordinates();
			n.length === t.length && n.every((e, n) => e.length === t?.[n]?.length && e.every((e, r) => e[0] === t?.[n]?.[r]?.[0] && e[1] === t?.[n]?.[r]?.[1])) || s.setCoordinates(t);
		}
		function f() {
			let e = Ne(r);
			o?.setStyle(e.style);
		}
		return f(), u(() => r.coordinates, (e) => {
			d(e);
		}, { deep: !0 }), u([
			() => r.fillColor,
			() => r.strokeColor,
			() => r.strokeWidth,
			() => r.lineCap,
			() => r.lineJoin,
			() => r.lineDash,
			() => r.zIndex
		], () => {
			f();
		}, { deep: !0 }), i(() => {
			s.un("change", c), o.setGeometry(void 0), o.setStyle(void 0);
		}), (e, t) => l(e.$slots, "default");
	}
}), $ = {
	fillColor: "rgba(22, 119, 225, 0.2)",
	strokeColor: "#1677ff",
	strokeWidth: 2,
	zIndex: 0
};
function Pe(e = {}) {
	return {
		fillColor: e.fillColor || $.fillColor,
		strokeColor: e.strokeColor || $.strokeColor,
		strokeWidth: e.strokeWidth || $.strokeWidth,
		zIndex: e.zIndex || $.zIndex
	};
}
function Fe(e = {}) {
	let { fillColor: t, strokeColor: n, strokeWidth: r, zIndex: i } = Pe(e), a = new y({ color: t }), o = new b({
		color: n,
		width: r
	});
	return {
		style: new S({
			fill: a,
			stroke: o,
			zIndex: i
		}),
		fill: a,
		stroke: o
	};
}
//#endregion
//#region src/components/feature/GCircle/index.ts
var Ie = /* @__PURE__ */ t({
	name: "GCircle",
	__name: "index",
	props: {
		center: {},
		radius: {},
		fillColor: {},
		strokeColor: {},
		strokeWidth: {},
		zIndex: {}
	},
	emits: ["update:center", "update:radius"],
	setup(e, { emit: t }) {
		let r = e, a = t, o = n(F);
		if (!o) throw Error("[GCircle] must be used within [GFeature]");
		if (o.getGeometry()) throw Error("[GCircle] feature already has geometry");
		let s = new D(_(r.center), r.radius);
		o.setGeometry(s);
		function c() {
			let e = v(s.getCenter());
			a("update:center", e), a("update:radius", s.getRadius());
		}
		s.on("change", c);
		function d(e, t) {
			let n = _(e), r = s.getCenter();
			(r[0] !== n[0] || r[1] !== n[1]) && s.setCenter(n), s.getRadius() !== t && s.setRadius(t);
		}
		function f() {
			let e = Fe(r);
			o?.setStyle(e.style);
		}
		return f(), u(() => r.center, (e) => {
			d(e, r.radius);
		}, { deep: !0 }), u(() => r.radius, (e) => {
			d(r.center, e);
		}), u([
			() => r.fillColor,
			() => r.strokeColor,
			() => r.strokeWidth,
			() => r.zIndex
		], () => {
			f();
		}), i(() => {
			s.un("change", c), o.setGeometry(void 0), o.setStyle(void 0);
		}), (e, t) => l(e.$slots, "default");
	}
}), Le = [
	xe,
	Se,
	Ce,
	we,
	Te,
	Ee,
	De,
	Oe,
	je,
	Q,
	Ie
];
function Re(e) {
	Le.forEach((t) => {
		e.component(t.name, t);
	});
}
var ze = { install: Re };
//#endregion
export { Ie as GCircle, De as GFeature, je as GLineString, xe as GMap, ze as GMapPlugin, Te as GOsmSource, Oe as GPoint, Q as GPolygon, Ce as GTileLayer, we as GVectorLayer, Ee as GVectorSource, Se as GView, Re as install };

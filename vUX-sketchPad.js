/*
 * vUX JavaScript library v4.0.0
 * https://library.vilshub.com/lib/vUX/
 *
 *
 * Released under the MIT license
 * https://library.vilshub.com/lib/vUX/license
 *
 * Date: 2026-10-06
 *
 *
 */
// Import vUX core
import { validateElement, validateString, validateBoolean, validateFunction, validateObjectLiteral, validateArray } from "./src/helpers.js";
import "./src/vUX-core-4.0.0-beta.js";

/***************************SketchPad*****************************/
export function SketchPad(host) {
    /**
     * A canvas drawing surface: shapes, lines and curved connectors, freehand pen, text,
     * font icons and images, with selection, move/resize, undo/redo, pan/zoom and export.
     * Extracted from the Sketchpad app (Apps/sketch-app), which is now its first consumer.
     *
     * Architecture:
     *  - `elements` is the scene: a flat array of plain JSON objects, one per shape.
     *    Undo, load, export and the `elements` getter all work off this array, so a
     *    scene can be saved with JSON.stringify(pad.elements) and restored with load().
     *  - `camera` = {x, y, zoom} defines the view. Elements store world coordinates;
     *    every pointer position is converted screen -> world immediately.
     *  - Rendering is immediate mode: render() redraws the whole scene on any change.
     *  - Interaction is a small state machine held in `drag` (pan, move, resize,
     *    marquee, create, pen, connect, endpoint). New interactions are new drag kinds.
     *  - Undo/redo stores JSON snapshots of `elements`.
     */
    validateElement(host, "SketchPad(x) constructor argument must be an element (the box the drawing surface fills)");

    var self = this;
    var initialized = false, destroyed = false;

    const TOOLS = [
        "select", "pan", "rect", "ellipse", "diamond", "triangle", "pentagon", "hexagon", "star",
        "line", "arrow", "pen", "text", "icon", "stamp"
    ];
    const BOX_TYPES = new Set(["rect", "ellipse", "diamond", "triangle", "pentagon", "hexagon", "star", "image"]);
    const STYLE_KEYS = ["stroke", "fill", "strokeWidth", "fontSize", "lineStyle", "dashGap"];
    const LINE_STYLES = ["solid", "dashed", "dotted"];
    const KEYBOARD_SCOPES = ["element", "document", "none"];
    const HANDLE_SIZE = 8;   //screen px
    const ANCHOR_RADIUS = 8; //screen px within which border points appear
    //Shapes a connector may bind to. Lines, arrows and pen strokes are left out: a
    //connector bound to a connector would re-route in a loop.
    const CONNECT_TYPES = new Set(["rect", "ellipse", "diamond", "triangle", "pentagon", "hexagon", "star", "image", "text", "icon"]);

    var settings = {
        grid: true,
        gridColor: "#d4d4d8",
        accentColor: "#4f46e5",
        panZoom: true,
        bounded: false,
        maxElements: 0,
        historyLimit: 100,
        keyboardScope: "element",
        returnToSelect: true,
        minZoom: 0.1,
        maxZoom: 8
    };
    var shortcuts = {
        v: "select", h: "pan", r: "rect", o: "ellipse", d: "diamond",
        "3": "triangle", "5": "pentagon", "6": "hexagon", s: "star",
        l: "line", a: "arrow", p: "pen", t: "text"
    };
    var enabledTools = TOOLS.slice();
    var callbacks = { change: null, toolChange: null, zoomChange: null };
    var style = { stroke: "#1f2937", fill: "transparent", strokeWidth: 2, fontSize: 28, lineStyle: "solid", dashGap: 8 };

    var canvas = null, ctx = null;
    var elements = [];          //the scene
    var selection = new Set();  //ids of selected elements
    var tool = "select";
    var camera = { x: 0, y: 0, zoom: 1 };
    var history = [], future = [];
    var drag = null;            //active pointer interaction
    var editingEl = null, editor = null;
    var spaceDown = false;
    var nextId = 1;
    var hoverAnchor = null;     //{el, x, y}: border point under the idle cursor
    var icon = null;            //{family, char} armed for the icon tool
    var stamp = null;           //{dataUrl, ratio, mono} armed for the stamp tool
    var counterInvert = false;
    var imageCache = new Map();
    var listeners = [];         //[target, type, fn, options] for destroy()
    var resizeObserver = null;
    var hostState = null;       //what initialize() changed on the host, for destroy() to restore

    this.config = {};

    Object.defineProperties(this.config, {
        tools: { //the tools this pad offers; connectors need "arrow", double-click text needs "text"
            set: function(value) {
                validateArray(value, "sketchPadObj.config.tools property value must be an array of tool names");
                value.forEach(function(t) {
                    if (TOOLS.indexOf(t) == -1) throw new TypeError("sketchPadObj.config.tools names an unknown tool '" + t + "', the tools are: " + TOOLS.join(", "));
                });
                if (value.indexOf("select") == -1) throw new Error("sketchPadObj.config.tools must include 'select', the tool the pad returns to");
                enabledTools = value.slice();
                if (enabledTools.indexOf(tool) == -1) setTool("select");
            }
        },
        grid: {
            set: function(value) {
                validateBoolean(value, "sketchPadObj.config.grid property value must be a boolean");
                settings.grid = value;
                if (initialized) render();
            }
        },
        gridColor: {
            set: function(value) {
                validateString(value, "sketchPadObj.config.gridColor property value must be a CSS colour string");
                settings.gridColor = value;
                if (initialized) render();
            }
        },
        accentColor: { //selection outline, handles and connector points
            set: function(value) {
                validateString(value, "sketchPadObj.config.accentColor property value must be a CSS colour string");
                settings.accentColor = value;
                if (initialized) render();
            }
        },
        panZoom: { //false fixes the view: no wheel zoom, no panning
            set: function(value) {
                validateBoolean(value, "sketchPadObj.config.panZoom property value must be a boolean");
                settings.panZoom = value;
            }
        },
        bounded: { //true keeps drawing, moving and resizing inside the visible surface
            set: function(value) {
                validateBoolean(value, "sketchPadObj.config.bounded property value must be a boolean");
                settings.bounded = value;
            }
        },
        maxElements: { //0 = unlimited
            set: function(value) {
                if (!Number.isInteger(value) || value < 0) throw new TypeError("sketchPadObj.config.maxElements property value must be a whole number, 0 for no limit");
                settings.maxElements = value;
            }
        },
        historyLimit: {
            set: function(value) {
                if (!Number.isInteger(value) || value < 1) throw new TypeError("sketchPadObj.config.historyLimit property value must be a whole number of at least 1");
                settings.historyLimit = value;
                while (history.length > value) history.shift();
            }
        },
        keyboardScope: {
            set: function(value) {
                if (initialized) throw new Error("sketchPadObj.config.keyboardScope must be set before initialize()");
                if (KEYBOARD_SCOPES.indexOf(value) == -1) throw new TypeError("sketchPadObj.config.keyboardScope property value must be one of: " + KEYBOARD_SCOPES.join(", "));
                settings.keyboardScope = value;
            }
        },
        returnToSelect: { //go back to the select tool after drawing a shape
            set: function(value) {
                validateBoolean(value, "sketchPadObj.config.returnToSelect property value must be a boolean");
                settings.returnToSelect = value;
            }
        },
        shortcuts: { //{key: tool}, replaces the default map; {} turns tool keys off
            set: function(value) {
                validateObjectLiteral(value, "sketchPadObj.config.shortcuts property value must be an object of {key: toolName}");
                var map = {};
                Object.entries(value).forEach(function(entry) {
                    if (TOOLS.indexOf(entry[1]) == -1) throw new TypeError("sketchPadObj.config.shortcuts['" + entry[0] + "'] names an unknown tool '" + entry[1] + "', the tools are: " + TOOLS.join(", "));
                    map[entry[0].toLowerCase()] = entry[1];
                });
                shortcuts = map;
            }
        },
        style: { //default style for new elements; does not touch existing ones
            set: function(value) {
                Object.assign(style, checkStyle(value, "sketchPadObj.config.style"));
            }
        },
        callbacks: {
            set: function(value) {
                validateObjectLiteral(value, "sketchPadObj.config.callbacks property value must be an object");
                var valid = Object.keys(callbacks);
                Object.entries(value).forEach(function(entry) {
                    if (valid.indexOf(entry[0]) == -1) throw new Error("The callback '" + entry[0] + "' is not supported, the supported callbacks are: " + valid.join(", "));
                    validateFunction(entry[1], "sketchPadObj.config.callbacks." + entry[0] + " value must be a function");
                    callbacks[entry[0]] = entry[1];
                });
            }
        }
    });

    this.initialize = function() {
        if (destroyed) throw new Error("This SketchPad has been destroyed, create a new instance instead of re-initializing");
        if (initialized) return;

        hostState = { position: host.style.position, tabIndex: host.getAttribute("tabindex"), outline: host.style.outline };
        if (getComputedStyle(host).position == "static") host.style.position = "relative";

        //Styled inline rather than from a stylesheet: the surface has to be usable on the
        //first frame, and a linked sheet arrives asynchronously.
        canvas = document.createElement("canvas");
        canvas.className = "vSketchPad-canvas";
        //An explicit CSS size: a canvas's width/height attributes are device pixels, and inset
        //alone does not stretch a replaced element, so on a HiDPI screen it would draw at 2x.
        Object.assign(canvas.style, { position: "absolute", inset: "0", width: "100%", height: "100%", display: "block", touchAction: "none" });
        host.appendChild(canvas);
        ctx = canvas.getContext("2d");

        //The pointer events are the canvas's own, so a page can hold several pads. Keys go
        //to the host by default, which therefore has to be focusable.
        listen(canvas, "pointerdown", onPointerDown);
        listen(canvas, "pointermove", onPointerMove);
        listen(canvas, "pointerup", onPointerUp);
        listen(canvas, "pointercancel", onPointerUp);
        listen(canvas, "dblclick", onDoubleClick);
        listen(canvas, "wheel", onWheel, { passive: false });
        if (settings.keyboardScope == "element") {
            if (hostState.tabIndex == null) host.setAttribute("tabindex", "0");
            host.style.outline = "none";
            listen(host, "keydown", onKeyDown);
            listen(host, "keyup", onKeyUp);
        } else if (settings.keyboardScope == "document") {
            listen(window, "keydown", onKeyDown);
            listen(window, "keyup", onKeyUp);
        }

        resizeObserver = new ResizeObserver(resizeCanvas);
        resizeObserver.observe(host);
        initialized = true;
        resizeCanvas();
    }

    this.destroy = function() {
        if (destroyed) return;
        destroyed = true;
        if (!initialized) return;
        if (editor != null) editor.remove();
        for (const [target, type, fn, options] of listeners) target.removeEventListener(type, fn, options);
        listeners = [];
        resizeObserver.disconnect();
        canvas.remove();
        host.style.position = hostState.position;
        host.style.outline = hostState.outline;
        if (hostState.tabIndex == null) host.removeAttribute("tabindex");
        imageCache.clear();
        elements = []; history = []; future = []; selection.clear();
        drag = null; editingEl = null; editor = null; canvas = null; ctx = null;
        initialized = false;
    }

    //---------------------------------------------------------------- public API

    this.undo = function() { assertReady("undo"); undo(); }
    this.redo = function() { assertReady("redo"); redo(); }

    this.clear = function() {
        assertReady("clear");
        if (!elements.length) return;
        pushHistory();
        elements = [];
        selection.clear();
        render();
    }

    this.deleteSelected = function() { assertReady("deleteSelected"); deleteSelected(); }
    this.duplicateSelected = function() { assertReady("duplicateSelected"); duplicateSelected(); }

    this.selectAll = function() {
        assertReady("selectAll");
        selection = new Set(elements.map(el => el.id));
        render();
    }

    this.select = function(ids) {
        assertReady("select");
        validateArray(ids, "sketchPadObj.select(x) argument must be an array of element ids");
        var known = new Set(elements.map(el => el.id));
        selection = new Set(ids.filter(id => known.has(id)));
        render();
    }

    this.load = function(scene, options = {}) {
        //Replaces the scene. {history: true} makes the replacement undoable.
        assertReady("load");
        validateArray(scene, "sketchPadObj.load(x) argument 1 must be an array of elements, as returned by sketchPadObj.elements");
        scene.forEach(function(el, i) {
            if (el == null || typeof el != "object" || typeof el.type != "string") throw new TypeError("sketchPadObj.load(x) argument 1 entry " + i + " is not an element (an object with a 'type')");
        });
        if (options.history) pushHistory();
        elements = JSON.parse(JSON.stringify(scene));
        //Elements saved by other tools may lack ids; every id must be unique for selection.
        var seen = new Set();
        nextId = Math.max(0, ...elements.map(el => Number.isInteger(el.id) ? el.id : 0)) + 1;
        for (const el of elements) {
            if (!Number.isInteger(el.id) || seen.has(el.id)) el.id = nextId++;
            seen.add(el.id);
        }
        selection.clear();
        render();
    }

    this.setStyle = function(value) {
        //Sets the default style for new elements and applies the same properties to the
        //selection, as one undo step. Only the properties passed are touched.
        assertReady("setStyle");
        var changes = checkStyle(value, "sketchPadObj.setStyle(x) argument");
        Object.assign(style, changes);
        if (!selection.size) return;
        pushHistory();
        for (const el of selectedElements()) {
            if ("stroke" in changes) el.stroke = changes.stroke;
            if ("fill" in changes) {
                if ("fill" in el) el.fill = changes.fill;
                //Mono icons take the fill as their colour, and go back to black without one.
                else if (el.mono) retintImageEl(el, changes.fill == "transparent" ? "#000000" : changes.fill);
            }
            if ("strokeWidth" in changes && "strokeWidth" in el) el.strokeWidth = changes.strokeWidth;
            if ("lineStyle" in changes && "strokeWidth" in el && el.type != "text" && el.type != "icon") el.lineStyle = changes.lineStyle;
            if ("dashGap" in changes && "lineStyle" in el) el.dashGap = changes.dashGap;
            if ("fontSize" in changes) {
                if (el.type == "text") el.fontSize = changes.fontSize;
                if (el.type == "icon") el.size = changes.fontSize * 1.4;
            }
        }
        render();
    }

    this.zoomBy = function(factor) {
        assertReady("zoomBy");
        if (typeof factor != "number" || !(factor > 0)) throw new TypeError("sketchPadObj.zoomBy(x) argument must be a positive number");
        zoomAt(host.clientWidth / 2, host.clientHeight / 2, camera.zoom * factor);
    }

    this.resetView = function() {
        assertReady("resetView");
        camera = { x: 0, y: 0, zoom: 1 };
        fireZoom();
        render();
    }

    this.clientToWorld = function(clientX, clientY) {
        //Page coordinates (a drop or paste position) to scene coordinates.
        assertReady("clientToWorld");
        var r = canvas.getBoundingClientRect();
        return screenToWorld(clientX - r.left, clientY - r.top);
    }

    this.viewCenter = function() {
        assertReady("viewCenter");
        return screenToWorld(host.clientWidth / 2, host.clientHeight / 2);
    }

    this.insertImage = async function(dataUrl, options = {}) {
        //Places an image element and resolves with its id. {width} sets the size outright;
        //otherwise the image is fitted inside {maxSize} (640) keeping its aspect ratio.
        assertReady("insertImage");
        validateString(dataUrl, "sketchPadObj.insertImage(x) argument 1 must be an image URL (a data: URL keeps saved scenes self-contained)");
        var img = await loadImage(dataUrl);
        if (destroyed) throw new Error("This SketchPad was destroyed while the image was loading");
        if (atCapacity()) throw new Error("This SketchPad already holds config.maxElements (" + settings.maxElements + ") elements");
        var w, h;
        if (options.width > 0) {
            w = options.width;
            h = w * img.naturalHeight / img.naturalWidth;
        } else {
            var max = options.maxSize > 0 ? options.maxSize : 640;
            var scale = Math.min(1, max / img.naturalWidth, max / img.naturalHeight);
            w = img.naturalWidth * scale; h = img.naturalHeight * scale;
        }
        var at = options.at || self.viewCenter();
        pushHistory();
        var el = { id: nextId++, type: "image", x: at.x - w / 2, y: at.y - h / 2, w, h, dataUrl };
        if (options.mono) el.mono = true;
        elements.push(el);
        selection = new Set([el.id]);
        setTool("select");
        render();
        return el.id;
    }

    this.createStamp = async function(svgText) {
        //Turns SVG source into a stamp for the stamp tool: {dataUrl, ratio, mono}. A mono
        //stamp (black only) takes the fill colour once placed.
        validateString(svgText, "sketchPadObj.createStamp(x) argument must be a string of SVG source");
        var dataUrl = svgToDataUrl(svgText);
        var img = await loadImage(dataUrl);
        //Some SVGs have no intrinsic size; fall back to square.
        var ratio = img.naturalWidth && img.naturalHeight ? img.naturalHeight / img.naturalWidth : 1;
        return { dataUrl, ratio, mono: isMonoSvg(svgText) };
    }

    this.exportCanvas = function(options = {}) {
        //Renders the whole scene, cropped to its content, onto a new canvas; null when the
        //scene is empty. Never counter-inverted, so exports always come out as stored.
        assertReady("exportCanvas");
        if (!elements.length) return null;
        var margin = options.margin != undefined ? options.margin : 40;
        var scale = options.scale > 0 ? options.scale : 1;
        var u = unionBox(elements);
        var w = u.w + margin * 2, h = u.h + margin * 2;
        if (options.maxWidth > 0) scale = Math.min(scale, options.maxWidth / w);
        if (options.maxHeight > 0) scale = Math.min(scale, options.maxHeight / h);

        var off = document.createElement("canvas");
        off.width = Math.max(1, Math.round(w * scale));
        off.height = Math.max(1, Math.round(h * scale));
        var octx = off.getContext("2d");
        if (options.background && options.background != "transparent") {
            octx.fillStyle = options.background;
            octx.fillRect(0, 0, off.width, off.height);
        }
        octx.scale(scale, scale);
        octx.translate(margin - u.x, margin - u.y);
        for (const el of elements) drawElement(octx, el);
        return off;
    }

    this.refresh = function() {
        //Repaints; needed after a font that text or icon elements use finishes loading.
        assertReady("refresh");
        render();
    }

    Object.defineProperties(this, {
        tool: {
            get: function() { return tool; },
            set: function(value) {
                if (TOOLS.indexOf(value) == -1) throw new TypeError("sketchPadObj.tool must be one of: " + TOOLS.join(", "));
                if (enabledTools.indexOf(value) == -1) throw new Error("sketchPadObj.tool '" + value + "' is not in sketchPadObj.config.tools (" + enabledTools.join(", ") + ")");
                setTool(value);
            }
        },
        style: {
            get: function() { return Object.assign({}, style); }
        },
        elements: {
            get: function() { return JSON.parse(JSON.stringify(elements)); }
        },
        selection: {
            get: function() { return Array.from(selection); }
        },
        camera: {
            get: function() { return Object.assign({}, camera); },
            set: function(value) {
                validateObjectLiteral(value, "sketchPadObj.camera must be an object of {x, y, zoom}");
                for (const k of ["x", "y", "zoom"]) {
                    if (typeof value[k] != "number" || !isFinite(value[k])) throw new TypeError("sketchPadObj.camera." + k + " must be a finite number");
                }
                camera = { x: value.x, y: value.y, zoom: clamp(value.zoom, settings.minZoom, settings.maxZoom) };
                fireZoom();
                if (initialized) render();
            }
        },
        zoom: {
            get: function() { return camera.zoom; }
        },
        icon: { //{family, char}: the glyph the icon tool places; null disarms it
            get: function() { return icon ? Object.assign({}, icon) : null; },
            set: function(value) {
                if (value == null) { icon = null; return; }
                validateObjectLiteral(value, "sketchPadObj.icon must be an object of {family, char}, or null");
                validateString(value.family, "sketchPadObj.icon.family must be the font-family name the glyph is drawn with");
                validateString(value.char, "sketchPadObj.icon.char must be the glyph's character");
                icon = { family: value.family, char: value.char };
            }
        },
        stamp: { //{dataUrl, ratio, mono} from createStamp(): what the stamp tool places; null disarms it
            get: function() { return stamp ? Object.assign({}, stamp) : null; },
            set: function(value) {
                if (value == null) { stamp = null; return; }
                validateObjectLiteral(value, "sketchPadObj.stamp must be an object of {dataUrl, ratio, mono} (see createStamp()), or null");
                validateString(value.dataUrl, "sketchPadObj.stamp.dataUrl must be an image URL");
                if (typeof value.ratio != "number" || !(value.ratio > 0)) throw new TypeError("sketchPadObj.stamp.ratio must be a positive number (height / width)");
                stamp = { dataUrl: value.dataUrl, ratio: value.ratio, mono: !!value.mono };
            }
        },
        counterInvertImages: {
            //For pages that theme the surface with a CSS invert filter: images are drawn
            //pre-inverted so they keep their real colours. Mono stamps are left alone and
            //flip with the drawn shapes.
            get: function() { return counterInvert; },
            set: function(value) {
                validateBoolean(value, "sketchPadObj.counterInvertImages must be a boolean");
                counterInvert = value;
                if (initialized) render();
            }
        },
        editing: { //true while a text element is open for typing
            get: function() { return editingEl != null; }
        },
        canvas: {
            get: function() { return canvas; }
        },
        initialize: { writable: false },
        destroy: { writable: false },
        config: { writable: false }
    });

    //----------------------------------------------------------------- helpers

    function assertReady(method) {
        if (destroyed) throw new Error("sketchPadObj." + method + "() was called on a destroyed SketchPad");
        if (!initialized) throw new Error("sketchPadObj." + method + "() needs sketchPadObj.initialize() to be called first");
    }

    function listen(target, type, fn, options = false) {
        target.addEventListener(type, fn, options);
        listeners.push([target, type, fn, options]);
    }

    function checkStyle(value, name) {
        validateObjectLiteral(value, name + " must be an object of style properties: " + STYLE_KEYS.join(", "));
        var out = {};
        for (const [key, v] of Object.entries(value)) {
            if (STYLE_KEYS.indexOf(key) == -1) throw new Error(name + " has an unsupported property '" + key + "', the supported ones are: " + STYLE_KEYS.join(", "));
            if (key == "stroke" || key == "fill") validateString(v, name + "." + key + " must be a CSS colour string ('transparent' for no fill)");
            else if (key == "lineStyle") {
                if (LINE_STYLES.indexOf(v) == -1) throw new TypeError(name + ".lineStyle must be one of: " + LINE_STYLES.join(", "));
            } else if (typeof v != "number" || !(v > 0)) throw new TypeError(name + "." + key + " must be a positive number");
            out[key] = v;
        }
        return out;
    }

    function clamp(v, min, max) { return Math.min(max, Math.max(min, v)); }

    function toolEnabled(t) { return enabledTools.indexOf(t) != -1; }

    function atCapacity() {
        return settings.maxElements > 0 && elements.length >= settings.maxElements;
    }

    function fire(name, arg) {
        if (callbacks[name] != null) callbacks[name](arg, self);
    }
    function fireZoom() { fire("zoomChange", camera.zoom); }

    //---------------------------------------------------------------- geometry

    function screenToWorld(sx, sy) {
        return { x: sx / camera.zoom + camera.x, y: sy / camera.zoom + camera.y };
    }
    function worldToScreen(wx, wy) {
        return { x: (wx - camera.x) * camera.zoom, y: (wy - camera.y) * camera.zoom };
    }

    function normBox(x, y, w, h) {
        return { x: Math.min(x, x + w), y: Math.min(y, y + h), w: Math.abs(w), h: Math.abs(h) };
    }

    //The visible surface in world coordinates.
    function viewBox() {
        var a = screenToWorld(0, 0), b = screenToWorld(host.clientWidth, host.clientHeight);
        return { x: a.x, y: a.y, w: b.x - a.x, h: b.y - a.y };
    }

    function clampToView(p) {
        if (!settings.bounded) return p;
        var v = viewBox();
        return { x: clamp(p.x, v.x, v.x + v.w), y: clamp(p.y, v.y, v.y + v.h) };
    }

    //World-space bounding box of any element.
    function getBBox(el) {
        switch (el.type) {
            case "rect": case "ellipse": case "diamond": case "image":
            case "triangle": case "pentagon": case "hexagon": case "star":
                return normBox(el.x, el.y, el.w, el.h);
            case "line": case "arrow": {
                const xs = [el.x, el.x2], ys = [el.y, el.y2];
                for (const [px, py] of el.pts || []) { xs.push(px); ys.push(py); }
                const minX = Math.min(...xs), minY = Math.min(...ys);
                return { x: minX, y: minY, w: Math.max(...xs) - minX, h: Math.max(...ys) - minY };
            }
            case "pen": {
                let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
                for (const [px, py] of el.points) {
                    minX = Math.min(minX, px); maxX = Math.max(maxX, px);
                    minY = Math.min(minY, py); maxY = Math.max(maxY, py);
                }
                return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
            }
            case "text": {
                ctx.save();
                ctx.font = `${el.fontSize}px sans-serif`;
                const lines = el.text.split("\n");
                const w = Math.max(1, ...lines.map(l => ctx.measureText(l).width));
                ctx.restore();
                return { x: el.x, y: el.y, w, h: lines.length * el.fontSize * 1.25 };
            }
            case "icon": {
                ctx.save();
                ctx.font = `${el.size}px "${el.family}"`;
                const w = Math.max(el.size * 0.5, ctx.measureText(el.char).width);
                ctx.restore();
                return { x: el.x, y: el.y, w, h: el.size };
            }
        }
        return { x: el.x || 0, y: el.y || 0, w: 0, h: 0 }; //unknown type from a foreign scene
    }

    function unionBox(list) {
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        for (const el of list) {
            const b = getBBox(el);
            minX = Math.min(minX, b.x); minY = Math.min(minY, b.y);
            maxX = Math.max(maxX, b.x + b.w); maxY = Math.max(maxY, b.y + b.h);
        }
        return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
    }

    function boxesIntersect(a, b) {
        return a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
    }

    function distToSegment(px, py, x1, y1, x2, y2) {
        const dx = x2 - x1, dy = y2 - y1;
        const lenSq = dx * dx + dy * dy;
        let t = lenSq ? ((px - x1) * dx + (py - y1) * dy) / lenSq : 0;
        t = Math.max(0, Math.min(1, t));
        return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
    }

    function hitElement(el, x, y) {
        const pad = Math.max(6 / camera.zoom, el.strokeWidth || 0);
        if (el.type == "line" || el.type == "arrow") {
            const pts = [[el.x, el.y], ...(el.pts || []), [el.x2, el.y2]];
            for (let i = 1; i < pts.length; i++) {
                if (distToSegment(x, y, pts[i - 1][0], pts[i - 1][1], pts[i][0], pts[i][1]) <= pad) return true;
            }
            return false;
        }
        if (el.type == "pen") {
            for (let i = 1; i < el.points.length; i++) {
                const [ax, ay] = el.points[i - 1], [bx, by] = el.points[i];
                if (distToSegment(x, y, ax, ay, bx, by) <= pad) return true;
            }
            return false;
        }
        const b = getBBox(el);
        return x >= b.x - pad && x <= b.x + b.w + pad && y >= b.y - pad && y <= b.y + b.h + pad;
    }

    //Topmost element under the point, or null.
    function hitTest(x, y) {
        for (let i = elements.length - 1; i >= 0; i--) {
            if (hitElement(elements[i], x, y)) return elements[i];
        }
        return null;
    }

    //----------------------------------------------------------------- history

    function pushHistory() {
        history.push(JSON.stringify(elements));
        while (history.length > settings.historyLimit) history.shift();
        future = [];
    }
    function undo() {
        if (!history.length) return;
        future.push(JSON.stringify(elements));
        elements = JSON.parse(history.pop());
        selection.clear();
        render();
    }
    function redo() {
        if (!future.length) return;
        history.push(JSON.stringify(elements));
        elements = JSON.parse(future.pop());
        selection.clear();
        render();
    }

    //--------------------------------------------------------------- rendering

    function resizeCanvas() {
        if (!initialized) return;
        const dpr = window.devicePixelRatio || 1;
        canvas.width = Math.max(1, host.clientWidth * dpr);
        canvas.height = Math.max(1, host.clientHeight * dpr);
        render();
    }

    function render() {
        if (!initialized) return;
        const dpr = window.devicePixelRatio || 1;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, host.clientWidth, host.clientHeight);

        if (settings.grid) drawGrid();

        //enter world space
        ctx.save();
        ctx.scale(camera.zoom, camera.zoom);
        ctx.translate(-camera.x, -camera.y);
        for (const el of elements) {
            if (el === editingEl) continue; //hidden while its editor is open
            drawElement(ctx, el, counterInvert);
        }
        ctx.restore();

        drawSelectionUI();
        drawConnectUI();
        if (drag && drag.type == "marquee") drawMarquee();

        //every state change repaints, so this is the one change hook needed
        fire("change", self);
    }

    function drawGrid() {
        //dot grid in world space, thinned out as you zoom away
        let step = 24;
        while (step * camera.zoom < 14) step *= 2;
        while (step * camera.zoom > 60) step /= 2;

        const view = screenToWorld(host.clientWidth, host.clientHeight);
        ctx.fillStyle = settings.gridColor;
        const startX = Math.floor(camera.x / step) * step;
        const startY = Math.floor(camera.y / step) * step;
        for (let wx = startX; wx <= view.x; wx += step) {
            for (let wy = startY; wy <= view.y; wy += step) {
                const p = worldToScreen(wx, wy);
                ctx.fillRect(p.x - 1, p.y - 1, 2, 2);
            }
        }
    }

    //Vertices of a box-bounded polygon shape, normalized to fill its bbox.
    function polygonPoints(type, b) {
        let pts;
        if (type == "triangle") {
            pts = [[0.5, 0], [1, 1], [0, 1]];
        } else {
            const n = type == "pentagon" ? 5 : type == "hexagon" ? 6 : 10; //star = 10 alternating
            pts = [];
            for (let i = 0; i < n; i++) {
                const a = -Math.PI / 2 + (i * 2 * Math.PI) / n;
                const r = type == "star" && i % 2 ? 0.45 : 1;
                pts.push([Math.cos(a) * r, Math.sin(a) * r]);
            }
            const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
            const minX = Math.min(...xs), maxX = Math.max(...xs);
            const minY = Math.min(...ys), maxY = Math.max(...ys);
            pts = pts.map(([px, py]) => [(px - minX) / (maxX - minX), (py - minY) / (maxY - minY)]);
        }
        return pts.map(([px, py]) => [b.x + px * b.w, b.y + py * b.h]);
    }

    //setLineDash pattern for an element's lineStyle / dashGap.
    function dashPattern(el) {
        const w = el.strokeWidth || 2, gap = el.dashGap || 8;
        if (el.lineStyle == "dashed") return [Math.max(6, w * 3), gap];
        if (el.lineStyle == "dotted") return [0.1, gap + w];
        return [];
    }

    function drawElement(c, el, invertImages = false) {
        c.strokeStyle = el.stroke || "#1f2937";
        c.fillStyle = el.fill || "transparent";
        c.lineWidth = el.strokeWidth || 2;
        c.lineJoin = "round";
        c.lineCap = "round";
        c.setLineDash(dashPattern(el));

        const hasFill = el.fill && el.fill != "transparent";

        switch (el.type) {
            case "rect": {
                const b = normBox(el.x, el.y, el.w, el.h);
                const r = Math.min(8, b.w / 2, b.h / 2); //rounded corners
                c.beginPath();
                c.roundRect(b.x, b.y, b.w, b.h, r);
                if (hasFill) c.fill();
                c.stroke();
                break;
            }
            case "ellipse": {
                const b = normBox(el.x, el.y, el.w, el.h);
                c.beginPath();
                c.ellipse(b.x + b.w / 2, b.y + b.h / 2, b.w / 2, b.h / 2, 0, 0, Math.PI * 2);
                if (hasFill) c.fill();
                c.stroke();
                break;
            }
            case "diamond": {
                const b = normBox(el.x, el.y, el.w, el.h);
                c.beginPath();
                c.moveTo(b.x + b.w / 2, b.y);
                c.lineTo(b.x + b.w, b.y + b.h / 2);
                c.lineTo(b.x + b.w / 2, b.y + b.h);
                c.lineTo(b.x, b.y + b.h / 2);
                c.closePath();
                if (hasFill) c.fill();
                c.stroke();
                break;
            }
            case "triangle": case "pentagon": case "hexagon": case "star": {
                const b = normBox(el.x, el.y, el.w, el.h);
                const pts = polygonPoints(el.type, b);
                c.beginPath();
                c.moveTo(pts[0][0], pts[0][1]);
                for (let i = 1; i < pts.length; i++) c.lineTo(pts[i][0], pts[i][1]);
                c.closePath();
                if (hasFill) c.fill();
                c.stroke();
                break;
            }
            case "line":
            case "arrow": {
                //straight segments through the joints; each joint is rounded with an arc
                //so the curve lives only where two segments meet
                const pts = [[el.x, el.y], ...(el.pts || []), [el.x2, el.y2]];
                c.beginPath();
                c.moveTo(pts[0][0], pts[0][1]);
                for (let i = 1; i < pts.length - 1; i++) {
                    const [px, py] = pts[i - 1], [jx, jy] = pts[i], [nx, ny] = pts[i + 1];
                    const r = Math.min(24, Math.hypot(jx - px, jy - py) / 2, Math.hypot(nx - jx, ny - jy) / 2);
                    c.arcTo(jx, jy, nx, ny, r);
                }
                c.lineTo(el.x2, el.y2);
                c.stroke();
                if (el.type == "arrow") {
                    c.setLineDash([]); //head stays solid whatever the shaft style
                    //aim the head along the final straight segment
                    const from = pts[pts.length - 2];
                    const angle = Math.atan2(el.y2 - from[1], el.x2 - from[0]);
                    const len = 8 + (el.strokeWidth || 2) * 2;
                    c.beginPath();
                    for (const side of [-1, 1]) {
                        c.moveTo(el.x2, el.y2);
                        c.lineTo(el.x2 - len * Math.cos(angle + side * 0.45), el.y2 - len * Math.sin(angle + side * 0.45));
                    }
                    c.stroke();
                }
                break;
            }
            case "pen": {
                const pts = el.points;
                if (pts.length < 2) break;
                c.beginPath();
                c.moveTo(pts[0][0], pts[0][1]);
                //midpoint quadratic smoothing
                for (let i = 1; i < pts.length - 1; i++) {
                    const mx = (pts[i][0] + pts[i + 1][0]) / 2;
                    const my = (pts[i][1] + pts[i + 1][1]) / 2;
                    c.quadraticCurveTo(pts[i][0], pts[i][1], mx, my);
                }
                const last = pts[pts.length - 1];
                c.lineTo(last[0], last[1]);
                c.stroke();
                break;
            }
            case "text": {
                c.font = `${el.fontSize}px sans-serif`;
                c.textBaseline = "top";
                c.fillStyle = el.stroke || "#1f2937";
                el.text.split("\n").forEach((line, i) => {
                    c.fillText(line, el.x, el.y + i * el.fontSize * 1.25);
                });
                break;
            }
            case "icon": {
                c.font = `${el.size}px "${el.family}"`;
                c.textBaseline = "top";
                c.fillStyle = el.stroke || "#1f2937";
                c.fillText(el.char, el.x, el.y);
                break;
            }
            case "image": {
                const b = normBox(el.x, el.y, el.w, el.h);
                const img = getImage(el.dataUrl);
                if (img.complete && img.naturalWidth) {
                    if (invertImages && !el.mono) {
                        //pre-invert so the page's CSS inversion cancels out and photos keep
                        //their real colours on screen
                        c.save();
                        c.filter = "invert(100%) hue-rotate(180deg)";
                        c.drawImage(img, b.x, b.y, b.w, b.h);
                        c.restore();
                    } else {
                        c.drawImage(img, b.x, b.y, b.w, b.h);
                    }
                } else {
                    //still decoding: show a placeholder; onload re-renders
                    c.fillStyle = "#f3f4f6";
                    c.fillRect(b.x, b.y, b.w, b.h);
                    c.strokeRect(b.x, b.y, b.w, b.h);
                }
                break;
            }
        }

        c.setLineDash([]); //don't leak the dash into selection UI / next element
    }

    //Decoded bitmaps for image elements, keyed by their URL so duplicated elements share
    //one bitmap. Loading is async; onload repaints once the pixels are ready.
    function getImage(dataUrl) {
        let img = imageCache.get(dataUrl);
        if (!img) {
            img = new Image();
            img.onload = () => render();
            img.src = dataUrl;
            imageCache.set(dataUrl, img);
        }
        return img;
    }

    //Resolve once an image is decoded and drawable.
    function loadImage(dataUrl) {
        return new Promise((resolve, reject) => {
            const img = getImage(dataUrl);
            if (img.complete && img.naturalWidth) return resolve(img);
            img.addEventListener("load", () => resolve(img), { once: true });
            img.addEventListener("error", () => {
                imageCache.delete(dataUrl); //let a later attempt retry
                reject(new Error("could not decode the image"));
            }, { once: true });
        });
    }

    function selectedElements() {
        return elements.filter(el => selection.has(el.id));
    }

    function isLinear(el) { return el.type == "line" || el.type == "arrow"; }

    //Corner resize handles for a single selected element (screen space).
    function getHandles(el) {
        if (isLinear(el)) {
            const a = worldToScreen(el.x, el.y);
            const b = worldToScreen(el.x2, el.y2);
            return [{ name: "start", x: a.x, y: a.y }, { name: "end", x: b.x, y: b.y }];
        }
        const b = getBBox(el);
        const tl = worldToScreen(b.x, b.y);
        const br = worldToScreen(b.x + b.w, b.y + b.h);
        return [
            { name: "nw", x: tl.x, y: tl.y },
            { name: "ne", x: br.x, y: tl.y },
            { name: "sw", x: tl.x, y: br.y },
            { name: "se", x: br.x, y: br.y }
        ];
    }

    function handleAt(sx, sy) {
        const sel = selectedElements();
        if (sel.length != 1) return null;
        for (const h of getHandles(sel[0])) {
            if (Math.abs(sx - h.x) <= HANDLE_SIZE && Math.abs(sy - h.y) <= HANDLE_SIZE) return { el: sel[0], handle: h };
        }
        return null;
    }

    function drawSelectionUI() {
        const sel = selectedElements();
        ctx.strokeStyle = settings.accentColor;
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        for (const el of sel) {
            const b = getBBox(el);
            const tl = worldToScreen(b.x, b.y);
            ctx.strokeRect(tl.x - 4, tl.y - 4, b.w * camera.zoom + 8, b.h * camera.zoom + 8);
        }
        ctx.setLineDash([]);

        if (sel.length == 1) {
            ctx.fillStyle = "#ffffff";
            for (const h of getHandles(sel[0])) {
                ctx.beginPath();
                if (isLinear(sel[0])) {
                    ctx.arc(h.x, h.y, HANDLE_SIZE / 2 + 1, 0, Math.PI * 2);
                    ctx.fill(); ctx.stroke();
                } else {
                    ctx.fillRect(h.x - HANDLE_SIZE / 2, h.y - HANDLE_SIZE / 2, HANDLE_SIZE, HANDLE_SIZE);
                    ctx.strokeRect(h.x - HANDLE_SIZE / 2, h.y - HANDLE_SIZE / 2, HANDLE_SIZE, HANDLE_SIZE);
                }
            }
        }
    }

    function drawMarquee() {
        const a = worldToScreen(drag.start.x, drag.start.y);
        const b = worldToScreen(drag.current.x, drag.current.y);
        ctx.save();
        ctx.globalAlpha = 0.08;
        ctx.fillStyle = settings.accentColor;
        const r = normBox(a.x, a.y, b.x - a.x, b.y - a.y);
        ctx.fillRect(r.x, r.y, r.w, r.h);
        ctx.restore();
        ctx.strokeStyle = settings.accentColor;
        ctx.lineWidth = 1;
        ctx.strokeRect(r.x, r.y, r.w, r.h);
    }

    //-------------------------------------------------------------- connectors
    //
    //Hovering near a shape's border (select tool) reveals a source point; dragging from
    //it draws an arrow. Near another shape's border the end snaps to an acceptor point:
    //release (or click, in sticky mode) there to connect. Releasing over nothing keeps
    //the line following the pointer ("sticky") until an acceptor is clicked or a
    //double-click ends it in place; Escape cancels. Pressing Ctrl pins a joint, which
    //bends the connector into a curve at that point.

    //Nearest point on a bbox perimeter (works from inside and outside).
    function nearestBorderPoint(b, px, py) {
        const cx = Math.min(Math.max(px, b.x), b.x + b.w);
        const cy = Math.min(Math.max(py, b.y), b.y + b.h);
        if (cx != px || cy != py) return { x: cx, y: cy }; //outside: clamp = border
        const dl = px - b.x, dr = b.x + b.w - px, dt = py - b.y, db = b.y + b.h - py;
        const m = Math.min(dl, dr, dt, db);
        if (m == dl) return { x: b.x, y: py };
        if (m == dr) return { x: b.x + b.w, y: py };
        if (m == dt) return { x: px, y: b.y };
        return { x: px, y: b.y + b.h };
    }

    //Topmost connectable element whose border is near p, or null.
    function findAnchor(p, excludeEl) {
        const maxD = ANCHOR_RADIUS / camera.zoom;
        for (let i = elements.length - 1; i >= 0; i--) {
            const el = elements[i];
            if (el === excludeEl || !CONNECT_TYPES.has(el.type)) continue;
            const q = nearestBorderPoint(getBBox(el), p.x, p.y);
            if (Math.hypot(p.x - q.x, p.y - q.y) <= maxD) return { el, x: q.x, y: q.y };
        }
        return null;
    }

    //A binding pins a connector endpoint to a spot on another element's border, stored as
    //that element's id plus the spot in bbox-normalized coordinates, so it survives moves
    //and scales sensibly on resize.
    function makeBind(target, x, y) {
        const b = getBBox(target);
        return { id: target.id, tx: b.w ? (x - b.x) / b.w : 0.5, ty: b.h ? (y - b.y) / b.h : 0.5 };
    }

    //Re-route every bound connector endpoint from its target's current bbox. Bindings
    //whose target is gone are dropped (the connector stays put).
    function syncConnectors() {
        const byId = new Map(elements.map(el => [el.id, el]));
        for (const el of elements) {
            if (!isLinear(el)) continue;
            if (!el.startBind && !el.endBind) continue;
            const before = { x: el.x, y: el.y, x2: el.x2, y2: el.y2 };
            for (const [key, px, py] of [["startBind", "x", "y"], ["endBind", "x2", "y2"]]) {
                const bind = el[key];
                if (!bind) continue;
                const target = byId.get(bind.id);
                if (!target || !CONNECT_TYPES.has(target.type)) { delete el[key]; continue; }
                const b = getBBox(target);
                el[px] = b.x + bind.tx * b.w;
                el[py] = b.y + bind.ty * b.h;
            }
            if (el.pts && el.pts.length) { //carry the joints along with the endpoints
                const dx = ((el.x - before.x) + (el.x2 - before.x2)) / 2;
                const dy = ((el.y - before.y) + (el.y2 - before.y2)) / 2;
                for (const pt of el.pts) { pt[0] += dx; pt[1] += dy; }
            }
        }
    }

    function finishConnect() {
        if (drag.acceptor) drag.el.endBind = makeBind(drag.acceptor.el, drag.acceptor.x, drag.acceptor.y);
        const el = drag.el;
        if (Math.hypot(el.x2 - el.x, el.y2 - el.y) < 4) {
            elements.pop(); //degenerate click: discard
            history.pop();
        } else {
            selection = new Set([el.id]);
        }
        drag = null;
        render();
    }

    function cancelConnect() {
        elements.pop();
        history.pop();
        drag = null;
        render();
    }

    function drawConnectUI() {
        const dot = (wx, wy, fill) => {
            const s = worldToScreen(wx, wy);
            ctx.beginPath();
            ctx.arc(s.x, s.y, 5, 0, Math.PI * 2);
            ctx.fillStyle = fill;
            ctx.fill();
            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = 1.5;
            ctx.stroke();
        };
        if (!drag && hoverAnchor) dot(hoverAnchor.x, hoverAnchor.y, settings.accentColor);
        if (drag && (drag.type == "connect" || drag.type == "endpoint") && drag.acceptor) {
            dot(drag.acceptor.x, drag.acceptor.y, "#16a34a");
        }
    }

    //---------------------------------------------------------- transformation

    function moveElement(el, dx, dy) {
        switch (el.type) {
            case "line": case "arrow":
                el.x += dx; el.y += dy; el.x2 += dx; el.y2 += dy;
                if (el.pts) for (const pt of el.pts) { pt[0] += dx; pt[1] += dy; }
                break;
            case "pen":
                for (const p of el.points) { p[0] += dx; p[1] += dy; }
                break;
            default:
                el.x += dx; el.y += dy;
        }
    }

    //Map an element (from its snapshot `snap`) from oldBox into newBox.
    function transformElement(el, snap, oldBox, newBox) {
        const sx = oldBox.w ? newBox.w / oldBox.w : 1;
        const sy = oldBox.h ? newBox.h / oldBox.h : 1;
        const mapX = x => newBox.x + (x - oldBox.x) * sx;
        const mapY = y => newBox.y + (y - oldBox.y) * sy;

        switch (el.type) {
            case "rect": case "ellipse": case "diamond": case "image":
            case "triangle": case "pentagon": case "hexagon": case "star":
                el.x = mapX(snap.x); el.y = mapY(snap.y);
                el.w = snap.w * sx; el.h = snap.h * sy;
                break;
            case "line": case "arrow":
                el.x = mapX(snap.x); el.y = mapY(snap.y);
                el.x2 = mapX(snap.x2); el.y2 = mapY(snap.y2);
                if (snap.pts) el.pts = snap.pts.map(([px, py]) => [mapX(px), mapY(py)]);
                break;
            case "pen":
                el.points = snap.points.map(([px, py]) => [mapX(px), mapY(py)]);
                break;
            case "text":
                el.x = mapX(snap.x); el.y = mapY(snap.y);
                el.fontSize = Math.max(6, snap.fontSize * sy);
                break;
            case "icon":
                el.x = mapX(snap.x); el.y = mapY(snap.y);
                el.size = Math.max(6, snap.size * sy);
                break;
        }
    }

    function deleteSelected() {
        if (!selection.size) return;
        pushHistory();
        elements = elements.filter(el => !selection.has(el.id));
        selection.clear();
        syncConnectors(); //drop bindings that pointed at deleted elements
        render();
    }

    function duplicateSelected() {
        if (!selection.size) return;
        if (settings.maxElements > 0 && elements.length + selection.size > settings.maxElements) return;
        pushHistory();
        const idMap = new Map(); //original id -> copy id
        const copies = selectedElements().map(el => {
            const copy = JSON.parse(JSON.stringify(el));
            copy.id = nextId++;
            idMap.set(el.id, copy.id);
            moveElement(copy, 16, 16);
            return copy;
        });
        //keep bindings within the duplicated set; drop ones pointing outside, so offset
        //copies don't snap back onto the originals
        for (const copy of copies) {
            for (const key of ["startBind", "endBind"]) {
                if (!copy[key]) continue;
                if (idMap.has(copy[key].id)) copy[key].id = idMap.get(copy[key].id);
                else delete copy[key];
            }
        }
        elements.push(...copies);
        selection = new Set(copies.map(c => c.id));
        render();
    }

    //-------------------------------------------------------------- tool state

    function setTool(t) {
        var changed = t != tool;
        tool = t;
        if (hoverAnchor) { hoverAnchor = null; render(); }
        if (canvas) canvas.style.cursor = t == "pan" ? "grab" : t == "select" ? "default" : t == "text" ? "text" : "crosshair";
        if (changed) fire("toolChange", t);
    }

    function zoomAt(sx, sy, newZoom) {
        const before = screenToWorld(sx, sy);
        camera.zoom = clamp(newZoom, settings.minZoom, settings.maxZoom);
        const after = screenToWorld(sx, sy);
        camera.x += before.x - after.x;
        camera.y += before.y - after.y;
        fireZoom();
        render();
    }

    //----------------------------------------------------------------- pointer

    function onPointerDown(e) {
        if (editingEl) return; //the editor commits on its own blur

        //sticky connector: a click on an acceptor commits, elsewhere keep drawing
        if (drag && drag.type == "connect") {
            if (drag.acceptor && e.button == 0) finishConnect();
            return;
        }

        if (settings.keyboardScope == "element") host.focus({ preventScroll: true });
        canvas.setPointerCapture(e.pointerId);
        const raw = screenToWorld(e.offsetX, e.offsetY);
        const p = clampToView(raw);

        //pan: middle button, space+drag, or the hand tool
        if (settings.panZoom && (e.button == 1 || spaceDown || tool == "pan")) {
            drag = { type: "pan", startScreen: { x: e.offsetX, y: e.offsetY }, startCam: Object.assign({}, camera) };
            canvas.style.cursor = "grabbing";
            return;
        }
        if (e.button != 0 || tool == "pan") return;

        if (tool == "select") {
            //resize handle on the single selected element?
            const h = handleAt(e.offsetX, e.offsetY);
            if (h) {
                pushHistory();
                drag = {
                    type: isLinear(h.el) ? "endpoint" : "resize",
                    el: h.el, handle: h.handle.name,
                    startBox: getBBox(h.el),
                    snap: JSON.parse(JSON.stringify(h.el)),
                    moved: false, pushed: true
                };
                return;
            }

            //border source point under the cursor? start drawing a connector
            if (hoverAnchor && !atCapacity()) {
                pushHistory();
                const a = hoverAnchor;
                const el = {
                    id: nextId++, type: "arrow", x: a.x, y: a.y, x2: p.x, y2: p.y,
                    stroke: style.stroke, strokeWidth: style.strokeWidth,
                    lineStyle: style.lineStyle, dashGap: style.dashGap,
                    startBind: makeBind(a.el, a.x, a.y)
                };
                elements.push(el);
                selection.clear();
                hoverAnchor = null;
                drag = { type: "connect", el, sourceEl: a.el, cursor: { x: p.x, y: p.y }, acceptor: null, sticky: false };
                render();
                return;
            }

            const hit = hitTest(raw.x, raw.y);
            if (hit) {
                if (e.shiftKey) {
                    selection.has(hit.id) ? selection.delete(hit.id) : selection.add(hit.id);
                } else if (!selection.has(hit.id)) {
                    selection = new Set([hit.id]);
                }
                pushHistory();
                const sel = selectedElements();
                drag = {
                    type: "move", start: raw,
                    snaps: new Map(sel.map(el => [el.id, JSON.parse(JSON.stringify(el))])),
                    union: sel.length ? unionBox(sel) : null,
                    moved: false, pushed: true
                };
            } else {
                if (!e.shiftKey) selection.clear();
                drag = { type: "marquee", start: raw, current: raw };
            }
            render();
            return;
        }

        if (tool == "text") {
            //stop the canvas from taking focus on pointerdown, which would immediately
            //blur (and so destroy) the editor about to be shown
            e.preventDefault();
            if (!atCapacity()) createTextAt(p);
            return;
        }

        if (atCapacity()) return;

        if (tool == "pen") {
            pushHistory();
            const el = { id: nextId++, type: "pen", points: [[p.x, p.y]], stroke: style.stroke, strokeWidth: style.strokeWidth, lineStyle: style.lineStyle, dashGap: style.dashGap };
            elements.push(el);
            drag = { type: "pen", el };
            return;
        }

        if (tool == "icon") {
            if (!icon) return; //nothing armed
            pushHistory();
            const size = Math.max(24, style.fontSize * 1.4);
            elements.push({
                id: nextId++, type: "icon",
                x: p.x - size / 2, y: p.y - size / 2,
                size, char: icon.char, family: icon.family, stroke: style.stroke
            });
            render();
            return;
        }

        if (tool == "stamp") {
            if (!stamp) return; //nothing armed
            pushHistory();
            const w = Math.max(32, style.fontSize * 2);
            const h = w * stamp.ratio;
            const el = { id: nextId++, type: "image", x: p.x - w / 2, y: p.y - h / 2, w, h, dataUrl: stamp.dataUrl };
            if (stamp.mono) el.mono = true; //black icon: the fill colour retints it
            elements.push(el);
            render();
            return;
        }

        //shape tools: rect / ellipse / diamond / triangle / pentagon / hexagon / star / line / arrow
        pushHistory();
        let el;
        if (tool == "line" || tool == "arrow") {
            el = { id: nextId++, type: tool, x: p.x, y: p.y, x2: p.x, y2: p.y, stroke: style.stroke, strokeWidth: style.strokeWidth, lineStyle: style.lineStyle, dashGap: style.dashGap };
        } else {
            el = { id: nextId++, type: tool, x: p.x, y: p.y, w: 0, h: 0, stroke: style.stroke, fill: style.fill, strokeWidth: style.strokeWidth, lineStyle: style.lineStyle, dashGap: style.dashGap };
        }
        elements.push(el);
        drag = { type: "create", el, start: p };
    }

    function onPointerMove(e) {
        const raw = screenToWorld(e.offsetX, e.offsetY);
        const p = clampToView(raw);

        //idle in select mode: surface a connection source point near a border
        if (!drag && tool == "select" && !editingEl && !spaceDown && toolEnabled("arrow")) {
            const a = findAnchor(raw, null);
            const changed = !!a != !!hoverAnchor || (a && hoverAnchor && (a.x != hoverAnchor.x || a.y != hoverAnchor.y));
            hoverAnchor = a;
            if (changed) render();
        }

        updateCursor(e, raw);
        if (!drag) return;

        switch (drag.type) {
            case "connect": {
                drag.cursor = p; //where Ctrl would pin the next joint
                drag.acceptor = findAnchor(p, drag.sourceEl);
                drag.el.x2 = drag.acceptor ? drag.acceptor.x : p.x;
                drag.el.y2 = drag.acceptor ? drag.acceptor.y : p.y;
                break;
            }
            case "pan":
                camera.x = drag.startCam.x - (e.offsetX - drag.startScreen.x) / camera.zoom;
                camera.y = drag.startCam.y - (e.offsetY - drag.startScreen.y) / camera.zoom;
                break;

            case "move": {
                let dx = raw.x - drag.start.x, dy = raw.y - drag.start.y;
                if (settings.bounded && drag.union) {
                    //clamp the delta so the whole selection stays on the surface
                    const v = viewBox(), u = drag.union;
                    dx = clamp(dx, v.x - u.x, Math.max(v.x - u.x, v.x + v.w - (u.x + u.w)));
                    dy = clamp(dy, v.y - u.y, Math.max(v.y - u.y, v.y + v.h - (u.y + u.h)));
                }
                if (Math.abs(dx) + Math.abs(dy) > 0.5) drag.moved = true;
                for (const el of selectedElements()) {
                    const snap = drag.snaps.get(el.id);
                    //reset to snapshot then offset: avoids drift from repeated deltas
                    Object.assign(el, JSON.parse(JSON.stringify(snap)));
                    moveElement(el, dx, dy);
                }
                syncConnectors();
                break;
            }

            case "resize": {
                drag.moved = true;
                const b = drag.startBox;
                //anchor is the corner opposite the dragged handle
                const anchor = {
                    nw: { x: b.x + b.w, y: b.y + b.h },
                    ne: { x: b.x, y: b.y + b.h },
                    sw: { x: b.x + b.w, y: b.y },
                    se: { x: b.x, y: b.y }
                }[drag.handle];
                const newBox = normBox(anchor.x, anchor.y, p.x - anchor.x, p.y - anchor.y);
                if (newBox.w > 1 && newBox.h > 1) {
                    transformElement(drag.el, drag.snap, b, newBox);
                    syncConnectors();
                }
                break;
            }

            case "endpoint": {
                drag.moved = true;
                //endpoints snap to borders and re-bind there; elsewhere they detach
                drag.acceptor = findAnchor(p, null);
                const nx = drag.acceptor ? drag.acceptor.x : p.x;
                const ny = drag.acceptor ? drag.acceptor.y : p.y;
                if (drag.handle == "start") { drag.el.x = nx; drag.el.y = ny; }
                else { drag.el.x2 = nx; drag.el.y2 = ny; }
                break;
            }

            case "marquee": {
                drag.current = raw;
                const box = normBox(drag.start.x, drag.start.y, raw.x - drag.start.x, raw.y - drag.start.y);
                selection = new Set(elements.filter(el => boxesIntersect(getBBox(el), box)).map(el => el.id));
                break;
            }

            case "create": {
                const el = drag.el;
                if (isLinear(el)) { el.x2 = p.x; el.y2 = p.y; }
                else { el.w = p.x - drag.start.x; el.h = p.y - drag.start.y; }
                break;
            }

            case "pen":
                drag.el.points.push([p.x, p.y]);
                break;
        }
        render();
    }

    function onPointerUp(e) {
        if (!drag) return;

        if (drag.type == "connect") {
            if (e.type == "pointercancel") { cancelConnect(); return; }
            if (drag.acceptor) finishConnect();
            else drag.sticky = true; //keep following the pointer until committed
            return;
        }

        if (drag.type == "endpoint" && drag.moved) {
            const key = drag.handle == "start" ? "startBind" : "endBind";
            if (drag.acceptor) drag.el[key] = makeBind(drag.acceptor.el, drag.acceptor.x, drag.acceptor.y);
            else delete drag.el[key];
        }

        if (drag.type == "create") {
            const el = drag.el;
            const b = getBBox(el);
            if (b.w < 3 && b.h < 3) {
                //click without drag: discard the degenerate shape
                elements.pop();
                history.pop();
            } else {
                //store normalized (positive w/h) coordinates
                if (!isLinear(el)) Object.assign(el, b);
                selection = new Set([el.id]);
                if (settings.returnToSelect) setTool("select");
            }
        }

        if (drag.type == "pen" && drag.el.points.length < 2) {
            elements.pop();
            history.pop();
        }

        //drop the no-op history entry from a plain click on an element
        if (drag.pushed && !drag.moved) history.pop();

        drag = null;
        updateCursor(e, screenToWorld(e.offsetX, e.offsetY));
        render();
    }

    function onDoubleClick(e) {
        e.preventDefault();
        if (drag && drag.type == "connect") { finishConnect(); return; } //end in place
        if (!toolEnabled("text") || (tool != "select" && tool != "text")) return;
        const p = screenToWorld(e.offsetX, e.offsetY);
        const hit = hitTest(p.x, p.y);
        if (hit && hit.type == "text") startEditing(hit);
        else if (!hit && !atCapacity()) createTextAt(clampToView(p));
    }

    //zoom toward the cursor so the point under the pointer stays fixed
    function onWheel(e) {
        if (!settings.panZoom) return; //let the page scroll
        e.preventDefault();
        zoomAt(e.offsetX, e.offsetY, camera.zoom * Math.exp(-e.deltaY * 0.0015));
    }

    function updateCursor(e, p) {
        if (spaceDown || tool == "pan" || (drag && drag.type == "pan")) {
            canvas.style.cursor = drag && drag.type == "pan" ? "grabbing" : (settings.panZoom ? "grab" : "default");
            return;
        }
        if (drag && drag.type == "connect") { canvas.style.cursor = "crosshair"; return; }
        if (tool == "select") {
            if (hoverAnchor) { canvas.style.cursor = "crosshair"; return; }
            const h = handleAt(e.offsetX, e.offsetY);
            if (h) {
                canvas.style.cursor = isLinear(h.el) ? "move"
                    : (h.handle.name == "nw" || h.handle.name == "se") ? "nwse-resize" : "nesw-resize";
                return;
            }
            canvas.style.cursor = hitTest(p.x, p.y) ? "move" : "default";
            return;
        }
        canvas.style.cursor = tool == "text" ? "text" : "crosshair";
    }

    //----------------------------------------------------------------- text UI

    function createTextAt(p) {
        pushHistory();
        const el = {
            id: nextId++, type: "text",
            x: p.x, y: p.y - style.fontSize / 2,
            text: "", fontSize: style.fontSize, stroke: style.stroke
        };
        elements.push(el);
        startEditing(el, true);
    }

    function startEditing(el, isNew = false) {
        editingEl = el;
        selection.clear();
        render();

        const ta = document.createElement("textarea");
        editor = ta;
        ta.className = "vSketchPad-editor";
        ta.value = el.text;
        const pos = worldToScreen(el.x, el.y);
        Object.assign(ta.style, {
            position: "absolute",
            left: pos.x + "px",
            top: pos.y + "px",
            fontSize: el.fontSize * camera.zoom + "px",
            fontFamily: "sans-serif",
            lineHeight: "1.25",
            color: el.stroke,
            minWidth: "30px",
            margin: "0",
            padding: "0",
            border: "1px dashed " + settings.accentColor,
            outline: "none",
            background: "transparent",
            resize: "none",
            overflow: "hidden",
            whiteSpace: "pre",
            zIndex: "1"
        });
        host.appendChild(ta);
        //focus after the current pointer event fully settles: focusing synchronously inside
        //pointerdown gets undone by the browser
        requestAnimationFrame(() => {
            ta.focus();
            ta.setSelectionRange(ta.value.length, ta.value.length);
        });

        const fit = () => {
            ta.style.width = "auto";
            ta.style.height = "auto";
            ta.style.width = Math.max(30, ta.scrollWidth + 4) + "px";
            ta.style.height = ta.scrollHeight + "px";
        };
        fit();
        ta.addEventListener("input", fit);

        const commit = () => {
            if (editor !== ta) return; //destroyed or already committed
            const newText = ta.value.trimEnd();
            ta.remove();
            editor = null;
            editingEl = null;
            if (isNew) {
                //createTextAt() already pushed history; drop it if nothing was typed
                if (newText) el.text = newText;
                else { elements = elements.filter(x => x !== el); history.pop(); }
            } else if (newText != el.text) {
                pushHistory(); //snapshot before mutating the existing element
                if (newText) el.text = newText;
                else elements = elements.filter(x => x !== el);
            }
            if (settings.returnToSelect) setTool("select");
            render();
            if (settings.keyboardScope == "element") host.focus({ preventScroll: true });
        };
        ta.addEventListener("blur", commit);
        ta.addEventListener("keydown", ev => {
            ev.stopPropagation(); //typing must not reach the pad's own shortcuts
            if (ev.key == "Escape" || (ev.key == "Enter" && (ev.ctrlKey || ev.metaKey))) ta.blur();
        });
    }

    //---------------------------------------------------------------- keyboard

    function isTypingTarget(t) {
        return t != null && (t.tagName == "INPUT" || t.tagName == "TEXTAREA" || t.tagName == "SELECT" || t.isContentEditable);
    }

    function onKeyDown(e) {
        if (editingEl || isTypingTarget(e.target)) return;
        const mod = e.ctrlKey || e.metaKey;
        const key = e.key.toLowerCase();

        //while drawing a connector: Ctrl pins a joint (segments stay straight, the curve
        //lives at the joint), Escape cancels, everything else is off
        if (drag && drag.type == "connect") {
            if (e.key == "Control" && !e.repeat) {
                (drag.el.pts ||= []).push([drag.cursor.x, drag.cursor.y]);
                render();
            }
            if (e.key == "Escape") cancelConnect();
            return;
        }

        if (e.code == "Space" && settings.panZoom) {
            spaceDown = true;
            if (!drag) canvas.style.cursor = "grab";
            e.preventDefault();
            return;
        }

        if (mod && key == "z") { e.preventDefault(); e.shiftKey ? redo() : undo(); return; }
        if (mod && key == "y") { e.preventDefault(); redo(); return; }
        if (mod && key == "d") { e.preventDefault(); duplicateSelected(); return; }
        if (mod && key == "a") { e.preventDefault(); self.selectAll(); return; }

        if (e.key == "Delete" || e.key == "Backspace") {
            if (!selection.size) return;
            e.preventDefault();
            deleteSelected();
            return;
        }
        if (e.key == "Escape") {
            selection.clear();
            setTool("select");
            render();
            return;
        }

        const t = shortcuts[key];
        if (t && !mod && !e.altKey && toolEnabled(t)) setTool(t);
    }

    function onKeyUp(e) {
        if (e.code == "Space" && spaceDown) {
            spaceDown = false;
            if (!drag) setTool(tool); //restores the tool's own cursor
        }
    }

    //--------------------------------------------------------------- SVG stamps
    //
    //Mono SVGs (drawn only in black, like most general and tech-logo glyphs) are marked
    //mono when placed and take the fill colour: retinting rewrites every explicit fill
    //and stroke in the source and re-encodes the data URL, so the colour travels with
    //the element and stays undoable.

    function svgToDataUrl(text) {
        return "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(text)));
    }

    function isMonoSvg(text) {
        if (/url\(#/i.test(text)) return false; //gradients / patterns
        const ignored = new Set(["none", "transparent", "inherit", "currentcolor"]);
        const black = /^(#000(000)?|black|rgba?\(\s*0\s*,\s*0\s*,\s*0\s*(,\s*[\d.]+\s*)?\))$/;
        for (const m of text.matchAll(/\b(?:fill|stroke)\s*[:=]\s*["']?\s*([^"';<>)\s][^"';<>]*)/gi)) {
            const c = m[1].trim().toLowerCase();
            if (!ignored.has(c) && !black.test(c)) return false;
        }
        return true; //no explicit colours at all renders black too
    }

    function tintSvg(text, color) {
        let s = text
            .replace(/\b(fill|stroke)="(?!none")[^"]*"/gi, (_, a) => `${a}="${color}"`)
            .replace(/\b(fill|stroke)='(?!none')[^']*'/gi, (_, a) => `${a}='${color}'`)
            .replace(/\b(fill|stroke)\s*:\s*(?!none\b)[^;"'<}]+/gi, (_, a) => `${a}:${color}`);
        //shapes without their own fill default to black: tint those via the root
        if (!/<svg\b[^>]*\bfill\s*=/i.test(s)) s = s.replace(/<svg\b/i, `<svg fill="${color}"`);
        return s;
    }

    function retintImageEl(el, color) {
        const m = el.dataUrl.match(/^data:image\/svg\+xml;base64,(.*)$/);
        if (!m) return;
        const svg = decodeURIComponent(escape(atob(m[1])));
        el.dataUrl = svgToDataUrl(tintSvg(svg, color));
    }
}

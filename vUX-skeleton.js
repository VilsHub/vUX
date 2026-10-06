/*
 * vUX JavaScript library v4.0.0
 * https://library.vilshub.com/lib/vUX/
 *
 *
 * Released under the MIT license
 * https://library.vilshub.com/lib/vUX/license
 *
 * Date: 2026-10-05
 *
 *
 */
// Import vUX core
import {
    validateElement, validateNumber, validateString, validateBoolean, validateFunction,
    validateObjectLiteral, matchString
} from "./src/helpers.js";
import "./src/vUX-core-4.0.0-beta.js";

/***************************Skeleton*****************************/
export function Skeleton(container) {
    /**
     * Placeholder blocks shaped like the content that is about to arrive.
     *
     * Two modes, chosen by whether config.template is set:
     *
     *   Template mode - the skeleton is DERIVED from a template the consumer already
     *   wrote, typically the same <template> they hand to Component or DataView.
     *   Every data-v-field becomes a text bar, every image a media block, every
     *   control a filled block, and the rest of the markup - the card, its padding,
     *   its grid - is kept, so the placeholder has the layout of the real thing.
     *   config.count clones are placed in a LAYER: a shallow copy of the container
     *   inserted just before it, while the container itself is hidden. The consumer
     *   can therefore render into the container at any time without the skeleton's
     *   nodes being mistaken for rows by a reconcile.
     *
     *   Mask mode - no template. The container's own current content is masked in
     *   place by adding classes, and unmasked by removing them again. For content
     *   that is already on the page and about to be refreshed.
     *
     * Either way, 'data-skeleton' on any element of the markup overrides what the
     * element is inferred to be: text, text:N, circle, circle:<size>, rect,
     * rect:<w>/<h>, media, media:<w>/<h>, keep, or skip.
     *
     * Timing is part of the contract, because a skeleton that flashes for 40ms is
     * worse than none: show() waits config.delay before anything appears, and once
     * something has appeared hide() holds it for config.minDuration. hide() returns
     * a promise for that reason - render once it resolves.
     */
    validateElement(container, "Skeleton(x) constructor argument 1 must be an element (the container the content will be rendered into)");

    var self = this;
    var initialized = false, destroyed = false;
    var state = "idle";             //idle | pending | visible | hiding
    var showTimer = null, hideTimer = null, revealTimer = null;
    var shownAt = 0;
    var hideWaiters = [];
    var reshow = false;             //show() arrived while hiding: show again once the hide is done
    var activeWork = 0;             //overlapping during() calls; the skeleton stays up until the last one settles

    var template = null, protoNode = null;
    var count = 1;
    var animation = "shimmer";
    var delay = 120;
    var minDuration = 400;
    var colors = { base: null, highlight: null };
    var radius = null;
    var label = "Loading";
    var reveal = true;
    var onShow = null, onHide = null;

    //What the current build put into the page, so teardown removes exactly that.
    var built = null;
    var lineIndex = 0;              //walks WIDTHS across one build, so neighbouring bars differ

    this.initialize = function(){
        if (initialized) return;
        if (destroyed) throw new Error("This Skeleton has been destroyed, create a new instance instead of re-initializing");
        initialized = true;
    }

    this.show = function(){
        assertUsable("show");
        if (state == "pending" || state == "visible") return;
        if (state == "hiding"){
            //Let the hide that is in flight finish - something is awaiting it - and
            //start a fresh show afterwards, delay included.
            reshow = true;
            return;
        }

        //Checked here, synchronously, rather than inside the delayed build where a
        //throw would surface as an uncaught error from a timer.
        preflight("skeletonObj.show()");

        state = "pending";
        if (delay <= 0){
            appear();
        }else{
            showTimer = setTimeout(appear, delay);
        }
    }

    this.hide = function(){
        reshow = false;
        if (destroyed || state == "idle") return Promise.resolve();

        if (state == "pending"){
            //The work finished inside the delay: nothing was ever shown, and nothing will be.
            clearTimeout(showTimer);
            showTimer = null;
            state = "idle";
            return Promise.resolve();
        }

        var done = new Promise(function(resolve){ hideWaiters.push(resolve); });
        if (state == "visible"){
            state = "hiding";
            var wait = Math.max(0, minDuration - (now() - shownAt));
            if (wait == 0){
                finishHide();
            }else{
                hideTimer = setTimeout(finishHide, wait);
            }
        }
        return done;
    }

    this.during = function(work){
        assertUsable("during");
        if (typeof work == "function") work = work();
        if (work == null || typeof work.then != "function"){
            throw new TypeError("skeletonObj.during(x) argument 1 must be a promise, or a function returning one");
        }

        self.show();
        activeWork++;

        //The value or the rejection of 'work' is passed through untouched, but only
        //after the skeleton is down, so the caller can render as soon as they have it.
        return Promise.resolve(work).then(
            function(value){ return settle().then(function(){ return value; }); },
            function(error){ return settle().then(function(){ throw error; }); }
        );

        function settle(){
            activeWork--;
            return activeWork > 0 ? Promise.resolve() : self.hide();
        }
    }

    this.destroy = function(){
        if (destroyed) return;
        clearTimeout(showTimer);
        clearTimeout(hideTimer);
        clearTimeout(revealTimer);
        showTimer = hideTimer = revealTimer = null;
        teardown(false);
        container.classList.remove("vux-sk-revealed");
        state = "idle";
        reshow = false;

        //Anyone awaiting a hide is released: the skeleton is certainly gone.
        var waiters = hideWaiters;
        hideWaiters = [];
        for (var x = 0; x < waiters.length; x++) waiters[x]();

        protoNode = null;
        template = null;
        initialized = false;
        destroyed = true;
    }

    this.config = {}

    /*--------------------------- timing ---------------------------*/

    function appear(){
        showTimer = null;
        build();
        state = "visible";
        shownAt = now();
        if (onShow != null) onShow(self);
    }

    function finishHide(){
        hideTimer = null;
        teardown(reveal);
        state = "idle";
        if (onHide != null) onHide(self);

        var waiters = hideWaiters;
        hideWaiters = [];
        for (var x = 0; x < waiters.length; x++) waiters[x]();

        if (reshow){
            reshow = false;
            self.show();
        }
    }

    //A setter that changes what is drawn redraws a skeleton already on screen, so the
    //config can be played with live. shownAt is kept: a redraw is not a new showing.
    function redraw(){
        if (state != "visible" && state != "hiding") return;
        teardown(false);
        build();
    }

    function now(){
        return (window.performance && performance.now) ? performance.now() : Date.now();
    }

    /*--------------------------- building ---------------------------*/

    function preflight(methodName){
        if (protoNode != null){
            if (container.parentNode == null){
                throw new Error(methodName + ": the container must be in the document in template mode - the skeleton layer is inserted next to it");
            }
        }else{
            //Mask mode reads the container's own markup, which may have changed since
            //the last show, so its data-skeleton values are checked every time.
            var marked = container.querySelectorAll("[data-skeleton]");
            for (var x = 0; x < marked.length; x++) parseDirective(marked[x], methodName);
        }
    }

    function build(){
        built = { layer: null, status: null, host: null, records: [], containerDisplay: null, containerInert: false };
        lineIndex = 0;

        if (label != ""){
            var status = document.createElement("span");
            status.className = "vux-sk-sr";
            status.setAttribute("role", "status");
            status.textContent = label;
            built.status = status;
        }

        if (protoNode != null){
            buildLayer();
        }else{
            buildMask();
        }

        if (built.status != null) built.host.parentNode.insertBefore(built.status, built.host);
    }

    function buildLayer(){
        //A shallow copy of the container carries its classes and inline style, so a grid
        //or flex container lays the ghosts out exactly as it will lay out the real items.
        //Its id is not carried: two elements may not share one, and it is why a container
        //styled only through an id selector does not pass its layout on.
        var layer = container.cloneNode(false);
        stripAttributes(layer);
        layer.classList.add("vux-sk-host", "vux-sk-layer");
        layer.setAttribute("aria-hidden", "true");
        layer.inert = true;
        applyHostStyle(layer);

        for (var x = 0; x < count; x++){
            var ghost = protoNode.cloneNode(true);
            ghost = ghostify(ghost, true);
            if (ghost != null){
                ghost.classList.add("vux-sk-ghost");
                layer.appendChild(ghost);
            }
        }

        container.parentNode.insertBefore(layer, container);
        built.containerDisplay = container.style.display;
        container.style.display = "none";
        container.setAttribute("aria-busy", "true");
        built.layer = layer;
        built.host = layer;
    }

    function buildMask(){
        container.classList.add("vux-sk-host");
        applyHostStyle(container);
        container.setAttribute("aria-busy", "true");
        built.containerInert = container.inert;
        container.inert = true;

        var children = Array.prototype.slice.call(container.children);
        for (var x = 0; x < children.length; x++) mask(children[x]);
        built.host = container;
    }

    function applyHostStyle(host){
        host.classList.add("vux-sk-" + animation);
        if (colors.base != null) host.style.setProperty("--vux-sk-base", colors.base);
        if (colors.highlight != null) host.style.setProperty("--vux-sk-highlight", colors.highlight);
        if (radius != null) host.style.setProperty("--vux-sk-radius", radius);
    }

    function teardown(withReveal){
        if (built == null) return;

        if (built.status != null && built.status.parentNode != null) built.status.parentNode.removeChild(built.status);

        if (built.layer != null){
            if (built.layer.parentNode != null) built.layer.parentNode.removeChild(built.layer);
            container.style.display = built.containerDisplay;
            if (container.getAttribute("style") == "") container.removeAttribute("style");
        }else{
            for (var x = 0; x < built.records.length; x++) unmask(built.records[x]);
            container.classList.remove("vux-sk-host", "vux-sk-shimmer", "vux-sk-pulse", "vux-sk-none");
            container.style.removeProperty("--vux-sk-base");
            container.style.removeProperty("--vux-sk-highlight");
            container.style.removeProperty("--vux-sk-radius");
            if (container.getAttribute("style") == "") container.removeAttribute("style");
            container.inert = built.containerInert;
        }
        if (container.getAttribute("class") == "") container.removeAttribute("class");
        container.removeAttribute("aria-busy");
        built = null;

        if (withReveal){
            //Restarted on every hide: removing and re-adding the class in one frame would
            //not replay the animation, so a reflow is forced in between.
            container.classList.remove("vux-sk-revealed");
            void container.offsetWidth;
            container.classList.add("vux-sk-revealed");
            clearTimeout(revealTimer);
            revealTimer = setTimeout(function(){
                revealTimer = null;
                container.classList.remove("vux-sk-revealed");
                if (container.getAttribute("class") == "") container.removeAttribute("class");
            }, 400);
        }
    }

    /*--------------------------- classification ---------------------------*/

    /**
     * What an element is, for skeleton purposes. Returns null for an element that is
     * only structure - a card, a row, a wrapper - which is kept and descended into.
     */
    function classify(el){
        var directive = parseDirective(el, "Skeleton");
        if (directive != null) return directive;

        var tag = el.nodeName.toUpperCase();
        if (MEDIA_TAGS.indexOf(tag) != -1) return { kind: "media" };
        if (tag == "INPUT" && (el.getAttribute("type") || "").toLowerCase() == "hidden") return { kind: "skip" };
        if (CONTROL_TAGS.indexOf(tag) != -1 || el.getAttribute("role") == "button") return { kind: "rect" };
        if (el.hasAttribute("data-v-field")) return { kind: "text", lines: 1, field: true };
        if (hasOwnText(el)) return { kind: "text", lines: 1, field: false };
        return null;
    }

    function hasOwnText(el){
        for (var n = el.firstChild; n != null; n = n.nextSibling){
            if (n.nodeType == 3 && n.nodeValue.trim() != "") return true;
        }
        return false;
    }

    /*--------------------------- template mode ---------------------------*/

    //Turns a clone of the template into a ghost, in place. Returns the node that stands
    //in for 'el' - itself, a replacement, or null when it was removed.
    function ghostify(el, isRoot){
        var tag = el.nodeName.toUpperCase();
        if (tag == "TEMPLATE" || tag == "SCRIPT" || tag == "STYLE"){
            el.parentNode.removeChild(el);
            return null;
        }

        var shape = classify(el);
        stripAttributes(el);

        if (shape == null){
            var kids = Array.prototype.slice.call(el.children);
            for (var x = 0; x < kids.length; x++) ghostify(kids[x], false);
            return el;
        }

        switch (shape.kind){
            case "skip":
                if (isRoot) return el;  //skipping the whole thing would leave nothing to show
                el.parentNode.removeChild(el);
                return null;

            case "keep":
                stripTree(el);
                return el;

            case "media":
                //A replaced element cannot carry the shimmer (an <img> with no src paints a
                //broken-image icon, and pseudo-elements do not render on it), so it is swapped
                //for a <span> carrying the same class and style attributes.
                var stand = document.createElement("span");
                if (el.hasAttribute("class")) stand.setAttribute("class", el.getAttribute("class"));
                if (el.hasAttribute("style")) stand.setAttribute("style", el.getAttribute("style"));
                if (el.hasAttribute("width")) stand.style.width = el.getAttribute("width") + "px";
                if (el.hasAttribute("height")) stand.style.height = el.getAttribute("height") + "px";
                if (el.hasAttribute("width") && el.hasAttribute("height")){
                    stand.style.aspectRatio = el.getAttribute("width") + " / " + el.getAttribute("height");
                }
                stand.classList.add("vux-sk-media");
                block(stand, shape);
                if (el.parentNode != null) el.parentNode.replaceChild(stand, el);
                return stand;

            case "circle":
            case "rect":
                stripTree(el);
                if (el.nodeName.toUpperCase() == "INPUT" || el.nodeName.toUpperCase() == "TEXTAREA"){
                    el.removeAttribute("placeholder");
                    el.removeAttribute("value");
                    el.value = "";
                }else if (el.textContent.trim() == "" && el.children.length == 0 && shape.size == undefined){
                    //An empty field marked rect - a tag pill, a badge - would otherwise be a
                    //block of no width. It is given a word's worth of invisible filler.
                    el.textContent = filler(WIDTHS[lineIndex++ % WIDTHS.length] * 0.6);
                }
                block(el, shape);
                return el;

            case "text":
                if (shape.field || shape.lines > 1 || el.textContent.trim() == ""){
                    fillLines(el, shape.lines);
                }else{
                    //Static text of the template's own - a label, a heading - keeps its words,
                    //made transparent, so its bar is exactly as long as the text will be.
                    //Any field nested inside it gets filler of a plausible width.
                    var inner = el.querySelectorAll("*");
                    for (var y = 0; y < inner.length; y++){
                        if (MEDIA_TAGS.indexOf(inner[y].nodeName.toUpperCase()) != -1){
                            inner[y].style.visibility = "hidden";
                        }else if (inner[y].hasAttribute("data-v-field")){
                            inner[y].textContent = filler(WIDTHS[lineIndex++ % WIDTHS.length]);
                        }
                    }
                    stripTree(el);
                    if (wrapText(el) == null) el.classList.add("vux-sk-text", "vux-sk-bg");
                }
                return el;
        }
        return el;
    }

    /**
     * Moves an element's content into one inline <span> carrying the fill. An inline
     * background covers each line's run of text and nothing more, so every bar is as
     * long as the line it stands for - a short headline gets a short bar, and the last
     * line of a paragraph falls short where the words do. Returns the span, or null when
     * a child is not inline (a block inside an inline is not something to build), in
     * which case the caller falls back to striping the whole element.
     */
    function wrapText(el){
        for (var c = el.firstElementChild; c != null; c = c.nextElementSibling){
            if (INLINE_TAGS.indexOf(c.nodeName.toUpperCase()) == -1) return null;
        }
        var span = document.createElement("span");
        span.className = "vux-sk-inline vux-sk-bg";
        while (el.firstChild) span.appendChild(el.firstChild);
        el.appendChild(span);
        return span;
    }

    function block(el, shape){
        el.classList.add("vux-sk-block", "vux-sk-bg");
        if (shape.kind == "circle") el.classList.add("vux-sk-circle");
        if (shape.size != undefined){
            el.classList.add("vux-sk-sized");
            el.style.setProperty("--vux-sk-size", shape.size);
        }
        if (shape.ratio != undefined){
            el.classList.add("vux-sk-ratio");
            el.style.setProperty("--vux-sk-ratio", shape.ratio);
        }
    }

    //A field in a template is empty until data arrives, so it has no width of its own
    //to mask. It is given lines of explicit width instead: one line of a varying 'word'
    //width by default, or N lines where the last falls short, the way a paragraph does.
    function fillLines(el, lines){
        el.textContent = "";
        el.classList.add("vux-sk-field");
        el.appendChild(makeLines(lines));
    }

    function makeLines(lines){
        var out = document.createDocumentFragment();
        for (var x = 0; x < lines; x++){
            var line = document.createElement("span");
            //A single line sits inline, as the one word or name it stands for would: a
            //block here would push an author and a timestamp sharing a line onto two.
            line.className = lines == 1 ? "vux-sk-line vux-sk-line-1" : "vux-sk-line";
            var bar = document.createElement("i");
            bar.className = "vux-sk-bg";
            var width;
            if (lines == 1) width = WIDTHS[lineIndex++ % WIDTHS.length] + "em";
            else width = x == lines - 1 ? "62%" : "100%";
            bar.style.setProperty("--vux-sk-w", width);
            line.appendChild(bar);
            out.appendChild(line);
        }
        return out;
    }

    //Non-breaking spaces never collapse, so this has a real width, and it is invisible
    //even before the stylesheet has loaded - no stray characters ever flash on screen.
    function filler(em){
        return new Array(Math.round(em * 4) + 1).join(" ");
    }

    //Removes whatever would make a ghost behave like a live node: duplicate ids, form
    //names, links, focusability, inline handlers and the vUX bindings themselves.
    function stripAttributes(el){
        var names = [];
        for (var x = 0; x < el.attributes.length; x++) names.push(el.attributes[x].name);
        for (var y = 0; y < names.length; y++){
            var name = names[y];
            if (STRIP_ATTRIBUTES.indexOf(name) != -1 || name.indexOf("on") == 0 || name.indexOf("data-v-") == 0 || name == "data-skeleton"){
                el.removeAttribute(name);
            }
        }
    }

    function stripTree(el){
        var all = el.querySelectorAll("*");
        for (var x = 0; x < all.length; x++) stripAttributes(all[x]);
    }

    /*--------------------------- mask mode ---------------------------*/

    //Every change made here is recorded so unmask() can reverse it exactly: the
    //container is the consumer's live markup and must come back as it was.
    function mask(el){
        var shape = classify(el);

        if (shape == null){
            var kids = Array.prototype.slice.call(el.children);
            for (var x = 0; x < kids.length; x++) mask(kids[x]);
            return;
        }

        var record = { node: el, classes: [], props: [], filler: [], wrapper: null };

        switch (shape.kind){
            case "keep":
                return;
            case "skip":
                addClasses(record, ["vux-sk-skip"]);
                break;
            case "media":
                addClasses(record, ["vux-sk-media"]);
                maskBlock(record, shape);
                break;
            case "circle":
            case "rect":
                if (el.textContent.trim() == "" && el.children.length == 0 && shape.size == undefined && CONTROL_TAGS.indexOf(el.nodeName.toUpperCase()) == -1){
                    var body = document.createElement("span");
                    body.className = "vux-sk-filler-inline";
                    body.textContent = filler(WIDTHS[lineIndex++ % WIDTHS.length] * 0.6);
                    el.appendChild(body);
                    record.filler.push(body);
                }
                maskBlock(record, shape);
                break;
            case "text":
                if (el.textContent.trim() == ""){
                    //Nothing to mask yet - a field not filled in - so there is no text to
                    //take a width from. Lines are appended in a holder and removed on unmask;
                    //the element is never emptied, because it is the consumer's live markup.
                    addClasses(record, ["vux-sk-field"]);
                    var holder = document.createElement("span");
                    holder.className = "vux-sk-filler";
                    holder.appendChild(makeLines(shape.lines));
                    el.appendChild(holder);
                    record.filler.push(holder);
                }else{
                    record.wrapper = wrapText(el);
                    if (record.wrapper == null) addClasses(record, ["vux-sk-text", "vux-sk-bg"]);
                }
                break;
        }
        built.records.push(record);
    }

    function maskBlock(record, shape){
        addClasses(record, ["vux-sk-block", "vux-sk-bg"]);
        if (shape.kind == "circle") addClasses(record, ["vux-sk-circle"]);
        if (shape.size != undefined){
            addClasses(record, ["vux-sk-sized"]);
            setProp(record, "--vux-sk-size", shape.size);
        }
        if (shape.ratio != undefined){
            addClasses(record, ["vux-sk-ratio"]);
            setProp(record, "--vux-sk-ratio", shape.ratio);
        }
    }

    function addClasses(record, list){
        for (var x = 0; x < list.length; x++){
            //Only classes the element did not already have are recorded, so unmask never
            //removes a class the consumer put there.
            if (!record.node.classList.contains(list[x])){
                record.node.classList.add(list[x]);
                record.classes.push(list[x]);
            }
        }
    }

    function setProp(record, name, value){
        record.node.style.setProperty(name, value);
        record.props.push(name);
    }

    function unmask(record){
        var x;
        for (x = 0; x < record.classes.length; x++) record.node.classList.remove(record.classes[x]);
        for (x = 0; x < record.props.length; x++) record.node.style.removeProperty(record.props[x]);
        if (record.node.getAttribute("class") == "") record.node.removeAttribute("class");
        if (record.node.getAttribute("style") == "") record.node.removeAttribute("style");
        if (record.wrapper != null && record.wrapper.parentNode != null){
            //The very same text nodes go back, so nothing holding a reference to one
            //(a consumer's own code, a selection) notices they were away.
            while (record.wrapper.firstChild) record.wrapper.parentNode.insertBefore(record.wrapper.firstChild, record.wrapper);
            record.wrapper.parentNode.removeChild(record.wrapper);
        }
        for (x = 0; x < record.filler.length; x++){
            if (record.filler[x].parentNode != null) record.filler[x].parentNode.removeChild(record.filler[x]);
        }
    }

    /*--------------------------- data-skeleton ---------------------------*/

    function parseDirective(el, methodName){
        if (!el.hasAttribute("data-skeleton")) return null;
        var raw = el.getAttribute("data-skeleton").trim();
        var split = raw.indexOf(":");
        var kind = split == -1 ? raw : raw.slice(0, split).trim();
        var arg = split == -1 ? null : raw.slice(split + 1).trim();

        function bad(why){
            return new Error(methodName + ": data-skeleton=\"" + raw + "\" on <" + el.nodeName.toLowerCase() + "> " + why);
        }

        switch (kind){
            case "skip":
            case "keep":
                if (arg != null) throw bad("takes no argument");
                return { kind: kind };
            case "text":
                if (arg == null) return { kind: "text", lines: 1, field: true };
                if (!/^\d+$/.test(arg) || parseInt(arg) < 1 || parseInt(arg) > 50) throw bad("must give a line count from 1 to 50, as in text:3");
                return { kind: "text", lines: parseInt(arg), field: true };
            case "circle":
                if (arg == null) return { kind: "circle" };
                if (!LENGTH.test(arg)) throw bad("must give a size, as in circle:48 (px) or circle:3rem");
                return { kind: "circle", size: /^\d+(\.\d+)?$/.test(arg) ? arg + "px" : arg };
            case "rect":
            case "media":
                if (arg == null) return { kind: kind };
                if (!RATIO.test(arg)) throw bad("must give an aspect ratio, as in " + kind + ":16/9");
                return { kind: kind, ratio: arg.replace("/", " / ") };
            default:
                throw bad("is not a skeleton shape; use text, text:N, circle, circle:<size>, rect, rect:<w>/<h>, media, media:<w>/<h>, keep or skip");
        }
    }

    function assertUsable(method){
        if (destroyed) throw new Error("skeletonObj." + method + "() called on a destroyed Skeleton");
        if (!initialized) throw new Error("Please initialize using the 'initialize()' method, before calling skeletonObj." + method + "()");
    }

    Object.defineProperties(this, {
        initialize: { writable: false },
        show: { writable: false },
        hide: { writable: false },
        during: { writable: false },
        destroy: { writable: false },
        config: { writable: false },
        state: {
            get: function(){ return state; }
        }
    })

    Object.defineProperties(this.config, {
        template: {
            set: function(value){
                if (value === null){
                    template = null;
                    protoNode = null;
                    redraw();
                    return;
                }
                validateElement(value, "skeletonObj.config.template property value must be an element (a <template>, or markup to derive the skeleton from) or null for mask mode");
                var proto;
                if (value.nodeName == "TEMPLATE"){
                    if (value.content.firstElementChild == null) throw new Error("skeletonObj.config.template: the <template> holds no element to derive a skeleton from");
                    proto = value.content.firstElementChild.cloneNode(true);
                }else{
                    //Read, never moved: pointing this at a live, already-rendered card is a
                    //legitimate way to get a skeleton of it.
                    proto = value.cloneNode(true);
                }

                //Every data-skeleton value is checked now, while the call that set it is on
                //the stack, rather than when a delayed show() finally builds the ghost.
                var marked = proto.querySelectorAll("[data-skeleton]");
                parseDirective(proto, "skeletonObj.config.template");
                for (var x = 0; x < marked.length; x++) parseDirective(marked[x], "skeletonObj.config.template");

                template = value;
                protoNode = proto;
                redraw();
            }
        },
        count: {
            set: function(value){
                validateNumber(value, "skeletonObj.config.count property value must be a number");
                if (value % 1 != 0 || value < 1 || value > 200) throw new RangeError("skeletonObj.config.count property value must be a whole number from 1 to 200");
                count = value;
                redraw();
            }
        },
        animation: {
            set: function(value){
                matchString(value, ["shimmer", "pulse", "none"], "skeletonObj.config.animation property value must be \"shimmer\", \"pulse\" or \"none\"");
                animation = value;
                redraw();
            }
        },
        delay: {
            set: function(value){
                validateNumber(value, "skeletonObj.config.delay property value must be a number of milliseconds");
                if (!(value >= 0) || !isFinite(value)) throw new RangeError("skeletonObj.config.delay property value must be 0 or more milliseconds");
                delay = value;
            }
        },
        minDuration: {
            set: function(value){
                validateNumber(value, "skeletonObj.config.minDuration property value must be a number of milliseconds");
                if (!(value >= 0) || !isFinite(value)) throw new RangeError("skeletonObj.config.minDuration property value must be 0 or more milliseconds");
                minDuration = value;
            }
        },
        colors: {
            set: function(value){
                validateObjectLiteral(value, "skeletonObj.config.colors property value must be an object literal: { base, highlight }");
                var next = { base: null, highlight: null };
                for (var name in value){
                    if (name != "base" && name != "highlight") throw new Error("skeletonObj.config.colors: unknown key '" + name + "'; use base and highlight");
                    validateString(value[name], "skeletonObj.config.colors." + name + " must be a CSS colour string");
                    if (window.CSS && CSS.supports && !CSS.supports("color", value[name])){
                        throw new Error("skeletonObj.config.colors." + name + ": '" + value[name] + "' is not a CSS colour");
                    }
                    next[name] = value[name];
                }
                colors = next;
                redraw();
            }
        },
        radius: {
            set: function(value){
                if (typeof value == "number") value = value + "px";
                validateString(value, "skeletonObj.config.radius property value must be a number (px) or a CSS length string");
                if (!LENGTH.test(value)) throw new Error("skeletonObj.config.radius: '" + value + "' is not a length, as in 6 or \"0.5rem\"");
                radius = value;
                redraw();
            }
        },
        label: {
            set: function(value){
                validateString(value, "skeletonObj.config.label property value must be a string (\"\" for no announcement)");
                label = value;
            }
        },
        reveal: {
            set: function(value){
                validateBoolean(value, "skeletonObj.config.reveal property value must be a boolean");
                reveal = value;
            }
        },
        onShow: {
            set: function(value){
                validateFunction(value, "skeletonObj.config.onShow property value must be a function");
                onShow = value;
            }
        },
        onHide: {
            set: function(value){
                validateFunction(value, "skeletonObj.config.onHide property value must be a function");
                onHide = value;
            }
        }
    })
}

var MEDIA_TAGS = ["IMG", "VIDEO", "PICTURE", "SVG", "CANVAS", "IFRAME", "OBJECT", "EMBED"];
var CONTROL_TAGS = ["BUTTON", "INPUT", "SELECT", "TEXTAREA"];
var INLINE_TAGS = ["A", "ABBR", "B", "BDI", "BDO", "BR", "CITE", "CODE", "DATA", "DFN", "EM", "I", "KBD", "MARK", "Q", "S", "SAMP", "SMALL", "SPAN", "STRONG", "SUB", "SUP", "TIME", "U", "VAR", "WBR"];
var STRIP_ATTRIBUTES = ["id", "name", "for", "form", "href", "src", "srcset", "tabindex", "autofocus", "contenteditable", "draggable", "title", "alt", "aria-labelledby", "aria-describedby", "aria-controls"];
var WIDTHS = [9, 6.5, 11.5, 7.5, 13, 8.5, 10, 5.5];  //em; varied so a column of ghosts does not read as a ruled grid
var LENGTH = /^\d+(\.\d+)?(px|em|rem|%|vw|vh)?$/;
var RATIO = /^\d+(\.\d+)?\s*\/\s*\d+(\.\d+)?$/;

//Linked when the module is imported, and appended at once, rather than through
//vModel.core.functions.linkStyleSheet() from initialize() as other modules do. That
//helper waits 300ms before it appends, and a skeleton is by nature shown in the first
//moments of a page's life: it needs every millisecond of head start it can get.
(async function addVitalStyles() {
    try {
        var path = await processAssetPath();
        if (path instanceof Error) throw new Error(path);
        if (document.querySelector("link[data-id='skeleton']") != null) return;
        var link = document.createElement("link");
        link.setAttribute("rel", "stylesheet");
        link.setAttribute("type", "text/css");
        link.dataset.id = "skeleton";
        link.setAttribute("href", path + "css/skeleton.css");
        document.head.appendChild(link);
    } catch (error) {
        console.error(error)
    }
})();
/**********************************************************************/

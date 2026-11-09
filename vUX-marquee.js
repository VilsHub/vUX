/*
 * vUX JavaScript library v4.0.0
 * https://github.com/VilsHub/vUX
 *
 *
 * Released under the MIT license
 * https://github.com/VilsHub/vUX/blob/master/LICENSE
 *
 *
 */
// Import vUX core
import "./src/vUX-core-4.0.0.js";

/************************Marquee****************************/
export function Marquee(container) {
    /*
    container => the element whose children are the items. They are moved into a track the module
                 creates, cloned until the track is wider than the container, and the track is then
                 scrolled by exactly one set of items per loop, so the seam never shows.
    */
    validateElement(container, "'Marquee(x)' constructor argument 1 must be an HTML Element");

    var speed = 60, direction = "left", gap = 48, pauseOnHover = true, fade = 0, respectReducedMotion = true;
    var ready = 0, destroyed = false, paused = false, hovered = false;
    var track = null, items = [], clones = [];
    var animation = null, distance = 0;
    var resizeWatcher = null, motionQuery = null, lastWidth = -1;
    var addedClasses = [];
    var savedStyle = [];           //[property, previous value, previous priority] for the container's inline style

    function reducedMotion() {
        //Kept local; listed in the workspace's potentialUtilities.md as a candidate core helper
        return respectReducedMotion && typeof window.matchMedia == "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }

    function finiteNumber(value, msg) {
        validateNumber(value, msg);
        if (!isFinite(value)) throw new TypeError(msg);
    }

    async function addVitalStyles() {
        try {
            var path = await processAssetPath();
            if (!(path instanceof Error)) {
                vModel.core.functions.linkStyleSheet(path + "css/marquee.css", "marquee");
            } else {
                throw new Error(path);
            }
        } catch (error) {
            console.error(error);
        }
    }

    function setContainerStyle(name, value) {
        //The container's own inline value is saved once, and put back by destroy()
        if (!savedStyle.some(function(s) { return s[0] == name; })) {
            savedStyle.push([name, container.style.getPropertyValue(name), container.style.getPropertyPriority(name)]);
        }
        if (value == "") container.style.removeProperty(name); else container.style.setProperty(name, value);
    }

    function applyFade() {
        var mask = fade > 0 ? "linear-gradient(90deg, transparent, #000 " + fade + "px, #000 calc(100% - " + fade + "px), transparent)" : "";
        setContainerStyle("mask-image", mask);
        setContainerStyle("-webkit-mask-image", mask);
    }

    function removeClones() {
        for (var clone of clones) clone.remove();
        clones = [];
    }

    function makeClone(item) {
        //Clones are hidden from assistive tech, taken out of the tab order and stripped of ids, so a
        //screen reader reads each item once, Tab visits each link once, and no id appears twice.
        //They are not made inert: half of what is on screen is clones, and they must stay clickable.
        var clone = item.cloneNode(true);
        clone.setAttribute("aria-hidden", "true");
        clone.classList.remove("vMarqueeItem");
        clone.classList.add("vMarqueeClone");
        clone.removeAttribute("id");
        for (var node of clone.querySelectorAll("[id]")) node.removeAttribute("id");
        var focusable = "a[href], button, input, select, textarea, iframe, summary, [tabindex], [contenteditable]";
        if (clone.matches(focusable)) clone.setAttribute("tabindex", "-1");
        for (var node of clone.querySelectorAll(focusable)) node.setAttribute("tabindex", "-1");
        return clone;
    }

    function addCloneSet() {
        for (var item of items) {
            var clone = makeClone(item);
            track.appendChild(clone);
            clones.push(clone);
        }
    }

    function stopAnimation() {
        if (animation != null) {
            animation.cancel();
            animation = null;
        }
    }

    function startAnimation(progress) {
        stopAnimation();
        if (distance <= 0 || reducedMotion()) return;
        var frames = direction == "left"
            ? [{transform: "translate3d(0,0,0)"}, {transform: "translate3d(" + (-distance) + "px,0,0)"}]
            : [{transform: "translate3d(" + (-distance) + "px,0,0)"}, {transform: "translate3d(0,0,0)"}];
        var duration = distance / speed * 1000;
        animation = track.animate(frames, {duration: duration, iterations: Infinity, easing: "linear"});
        //a rebuild (resize, new gap, new speed) continues from the same point of the loop
        if (progress > 0) animation.currentTime = progress * duration;
        if (paused || hovered) animation.pause();
    }

    function currentProgress() {
        if (animation == null) return 0;
        var duration = animation.effect.getTiming().duration;
        return duration > 0 ? (animation.currentTime % duration) / duration : 0;
    }

    function build() {
        //Measures one set (the distance from the first item to its first clone, gap included), then
        //adds clone sets until the track covers the container plus one set, so the loop is seamless
        var progress = currentProgress();
        stopAnimation();
        removeClones();
        track.style.gap = gap + "px";
        distance = 0;
        lastWidth = container.clientWidth;
        if (items.length == 0 || lastWidth == 0) return;   //hidden: the ResizeObserver builds it once shown

        addCloneSet();
        distance = clones[0].offsetLeft - items[0].offsetLeft;
        if (distance <= 0) return;
        var sets = Math.ceil(lastWidth / distance);
        for (var x = 0; x < sets; x++) addCloneSet();
        startAnimation(progress);
    }

    function onResize() {
        //Item sizes change too (fonts loading, content edits), so any change of the track's own
        //set width also rebuilds, not just a container resize
        if (ready == 0) return;
        var setWidth = clones.length ? clones[0].offsetLeft - items[0].offsetLeft : 0;
        if (container.clientWidth != lastWidth || setWidth != distance) build();
    }

    function onEnter() {
        if (!pauseOnHover) return;
        hovered = true;
        if (animation != null) animation.pause();
    }

    function onLeave(e) {
        //focusout inside the strip is not leaving it
        if (e.type == "focusout" && container.contains(e.relatedTarget)) return;
        if (e.type == "focusout" && container.matches(":hover")) return;
        if (e.type == "mouseleave" && container.contains(document.activeElement)) return;
        hovered = false;
        if (animation != null && !paused) animation.play();
    }

    function onMotionChange() {
        if (ready == 1) startAnimation(currentProgress());
    }

    function adopt() {
        //Every element child of the container that is not the track becomes an item, appended to the
        //track in document order
        for (var child of Array.from(container.children)) {
            if (child == track) continue;
            child.classList.add("vMarqueeItem");
            track.appendChild(child);
            items.push(child);
        }
    }

    this.config = {};

    this.initialize = function() {
        if (ready == 1) return;
        if (destroyed) throw new Error("This Marquee has been destroyed, create a new instance instead of re-initializing");
        if (container.children.length == 0) throw new Error("Setup error: the Marquee container has no items, add its items as child elements before calling initialize()");

        for (var name of ["vMarquee"]) {
            if (!container.classList.contains(name)) {
                container.classList.add(name);
                addedClasses.push(name);
            }
        }
        //Structural styles are inline so the first measurement is right before marquee.css arrives
        setContainerStyle("overflow", "hidden");
        track = $$.ce("div", {class: "vMarqueeTrack", style: "display:flex;width:max-content;flex-wrap:nowrap;align-items:center;will-change:transform"});
        container.appendChild(track);
        adopt();
        applyFade();
        ready = 1;

        container.addEventListener("mouseenter", onEnter, false);
        container.addEventListener("mouseleave", onLeave, false);
        container.addEventListener("focusin", onEnter, false);
        container.addEventListener("focusout", onLeave, false);
        resizeWatcher = new ResizeObserver(onResize);
        resizeWatcher.observe(container);
        resizeWatcher.observe(track);
        if (typeof window.matchMedia == "function") {
            motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
            motionQuery.addEventListener("change", onMotionChange);
        }

        build();
        addVitalStyles();
    };

    this.pause = function() {
        paused = true;
        if (animation != null) animation.pause();
    };

    this.play = function() {
        paused = false;
        if (animation != null && !hovered) animation.play();
    };

    this.refresh = function() {
        //Picks up items appended to the container (or removed from the track) since initialize()
        if (destroyed) throw new Error("This Marquee has been destroyed, create a new instance instead of refreshing");
        if (ready == 0) throw new Error("Marquee.refresh() called before initialize(); call initialize() first");
        removeClones();
        items = items.filter(function(item) { return item.parentNode == track; });
        adopt();
        build();
    };

    this.destroy = function() {
        //Stops the loop, removes the clones and the track, puts the items back where they were and
        //restores the container's own classes and inline styles
        if (destroyed) return;
        destroyed = true;
        if (ready == 0) return;

        stopAnimation();
        removeClones();
        if (resizeWatcher != null) resizeWatcher.disconnect();
        resizeWatcher = null;
        if (motionQuery != null) motionQuery.removeEventListener("change", onMotionChange);
        container.removeEventListener("mouseenter", onEnter, false);
        container.removeEventListener("mouseleave", onLeave, false);
        container.removeEventListener("focusin", onEnter, false);
        container.removeEventListener("focusout", onLeave, false);

        for (var item of items) {
            item.classList.remove("vMarqueeItem");
            container.insertBefore(item, track);
        }
        track.remove();
        track = null;
        items = [];

        for (var name of addedClasses) container.classList.remove(name);
        addedClasses = [];
        for (var x = savedStyle.length - 1; x >= 0; x--) {
            var saved = savedStyle[x];
            if (saved[1] == "") container.style.removeProperty(saved[0]);
            else container.style.setProperty(saved[0], saved[1], saved[2]);
        }
        savedStyle = [];
        if (container.getAttribute("style") == "") container.removeAttribute("style");
        ready = 0;
    };

    Object.defineProperties(this.config, {
        speed: {
            set: function(value) {
                finiteNumber(value, "'config.speed' property value must be a number of pixels per second");
                if (value <= 0) throw new Error("'config.speed' property value must be greater than 0");
                speed = value;
                if (ready == 1) startAnimation(currentProgress());
            }
        },
        direction: {
            set: function(value) {
                validateString(value, "'config.direction' property value must be a string");
                matchString(value, ["left", "right"], "'config.direction' property value must be either 'left' or 'right'");
                if (value == direction) return;
                var progress = currentProgress();
                direction = value;
                //mirrored, so the strip reverses in place instead of jumping
                if (ready == 1) startAnimation(progress > 0 ? 1 - progress : 0);
            }
        },
        gap: {
            set: function(value) {
                finiteNumber(value, "'config.gap' property value must be a number of pixels");
                if (value < 0) throw new Error("'config.gap' property value must be 0 or more pixels");
                gap = value;
                if (ready == 1) build();
            }
        },
        pauseOnHover: {
            set: function(value) {
                validateBoolean(value, "'config.pauseOnHover' property value must be a boolean");
                pauseOnHover = value;
                if (!value && hovered) {
                    hovered = false;
                    if (animation != null && !paused) animation.play();
                }
            }
        },
        fade: {
            set: function(value) {
                finiteNumber(value, "'config.fade' property value must be a number of pixels");
                if (value < 0) throw new Error("'config.fade' property value must be 0 or more pixels");
                fade = value;
                if (ready == 1) applyFade();
            }
        },
        respectReducedMotion: {
            set: function(value) {
                validateBoolean(value, "'config.respectReducedMotion' property value must be a boolean");
                respectReducedMotion = value;
                if (ready == 1) startAnimation(currentProgress());
            }
        }
    });

    Object.defineProperties(this, {
        config: { writable: false },
        initialize: { writable: false },
        pause: { writable: false },
        play: { writable: false },
        refresh: { writable: false },
        destroy: { writable: false },
        paused: { get: function() { return paused; } },
        moving: { get: function() { return animation != null && animation.playState == "running"; } }
    });
}

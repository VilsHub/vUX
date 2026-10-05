/*
 * vUX JavaScript library v4.0.0
 * https://library.vilshub.com/lib/vUX/
 *
 *
 * Released under the MIT license
 * https://library.vilshub.com/lib/vUX/license
 *
 * Date: 2021-07-19=T22:30Z
 *
 *
 */
// Import vUX core
import "./src/vUX-core-4.0.0-beta.js";

/************************ListScroller****************************/
export function ListScroller(container, listParent) {
    /*
    listParent 	=> the ul element
    container	=> Element housing the ul element, it becomes the horizontal scroll viewport
    buttons[0]  => left button,
    buttons[1]  => Right button
    inactiveButtonClassName => class put on a button while it has nowhere to scroll (both buttons share it)
    */
    validateElement(container, "An HTML element needed as list parent container");
    validateElement(listParent, "List parent is not a valid HTML element");
    if (listParent == container || !container.contains(listParent)) {
        throw new Error("ListScroller() argument 2 (the list) must be inside argument 1 (the container)");
    }
    var paddingRight = 0, paddingLeft = 0, ready = 0, listening = 0, hasButtons = true;
    var buttons = [], scrollSize = 175,scrollSpeed = 290,inactiveButtonClassName = "",wrapperStyle = "width:100%";
    var destroyed = false;
    var animation = null;          //{frame, target} while a button scroll is running
    var resizeWatcher = null;      //ResizeObserver on the container and the list
    var addedClasses = {container:[], buttons:[[], []]};   //only what this instance added is removed again
    var savedWrapperStyle = [];    //[property, previous value, previous priority] per wrapperStyle property
    var savedCursor = [];          //the buttons' own inline cursor, restored by destroy()

    //Button scrolls are measured from the real scroll position, never from a remembered value, so the
    //buttons stay right after the user drags, wheels or swipes the list.
    function maxScroll() {
        return Math.max(0, container.scrollWidth - container.clientWidth);
    }

    function setInactive(id, inactive) {
        var button = buttons[id];
        if (button == undefined) return;
        button.classList.toggle(inactiveButtonClassName, inactive);
        button.style["cursor"] = inactive ? "not-allowed" : "pointer";
        button.setAttribute("aria-disabled", inactive ? "true" : "false");
    }

    function updateState() {
        if (!hasButtons || listening == 0) return;
        //1px of slack: at browser zoom levels scrollLeft can stop a fraction short of the end
        var position = container.scrollLeft;
        setInactive(0, position <= 1);
        setInactive(1, position >= maxScroll() - 1);
    }

    function stopAnimation() {
        if (animation != null) {
            cancelAnimationFrame(animation.frame);
            animation = null;
        }
    }

    function scrollList(distance) {
        //A click during a running scroll continues from where that scroll was heading, so two quick
        //clicks always travel two steps.
        var from = container.scrollLeft;
        var base = animation != null ? animation.target : from;
        var target = Math.min(Math.max(base + distance, 0), maxScroll());
        stopAnimation();
        if (target == from) return;

        if (scrollSpeed == 0) {
            container.scrollTo({left: target, behavior: "instant"});
            return;
        }
        var start = performance.now();
        animation = {target: target, frame: 0};
        animation.frame = requestAnimationFrame(function step(now) {
            var progress = Math.min(Math.max((now - start) / scrollSpeed, 0), 1);
            //behavior "instant" so a consumer's scroll-behavior:smooth cannot fight the frames
            container.scrollTo({left: from + (target - from) * progress, behavior: "instant"});
            if (progress < 1) {
                animation.frame = requestAnimationFrame(step);
            } else {
                animation = null;
            }
        });
    }

    function scrollLeftHandler() {
        if (listening == 1 && hasButtons) scrollList(-scrollSize);
    }

    function scrollRightHandler() {
        if (listening == 1 && hasButtons) scrollList(scrollSize);
    }

    function bindButtons() {
        //Listeners go on the buttons themselves, so a click on an icon inside a button still counts
        buttons[0].addEventListener("click", scrollLeftHandler, false);
        buttons[1].addEventListener("click", scrollRightHandler, false);
        setInactive(0, true);
        setInactive(1, true);
        updateState();
    }

    function unbindButtons() {
        for (var x = 0; x < buttons.length; x++) {
            buttons[x].removeEventListener("click", x == 0 ? scrollLeftHandler : scrollRightHandler, false);
            if (inactiveButtonClassName != "") buttons[x].classList.remove(inactiveButtonClassName);
            buttons[x].removeAttribute("aria-disabled");
            buttons[x].style["cursor"] = savedCursor[x];
        }
    }

    function releaseButtonClasses() {
        for (var x = 0; x < buttons.length; x++) {
            for (var name of addedClasses.buttons[x]) buttons[x].classList.remove(name);
            addedClasses.buttons[x] = [];
        }
    }

    function applyWrapperStyle() {
        //Merged into the container's own inline style rather than replacing it, and undone property
        //by property in destroy()
        var probe = document.createElement("div");
        probe.style.cssText = wrapperStyle;
        for (var x = 0; x < probe.style.length; x++) {
            var name = probe.style[x];
            savedWrapperStyle.push([name, container.style.getPropertyValue(name), container.style.getPropertyPriority(name)]);
            container.style.setProperty(name, probe.style.getPropertyValue(name), probe.style.getPropertyPriority(name));
        }
    }

    function removeWrapperStyle() {
        for (var x = savedWrapperStyle.length - 1; x >= 0; x--) {
            var saved = savedWrapperStyle[x];
            if (saved[1] == "") {
                container.style.removeProperty(saved[0]);
            } else {
                container.style.setProperty(saved[0], saved[1], saved[2]);
            }
        }
        savedWrapperStyle = [];
        if (container.getAttribute("style") == "") container.removeAttribute("style");
    }

    function applyPadding() {
        //Padding on the list (not its offset) so that the room after the last item is part of the
        //scroll range. "important" beats the list's own ul padding.
        listParent.style.setProperty("padding-left", paddingLeft + "px", "important");
        listParent.style.setProperty("padding-right", paddingRight + "px", "important");
    }

    async function addVitalStyles() {

        try {
            var path = await processAssetPath();

            if (!(path instanceof Error)){
                vModel.core.functions.linkStyleSheet(path+"css/listScroller.css", "listScroller");
            }else{
                throw new Error(path)
            }

        } catch (error) {
            console.error(error)
        }
    }

    function stylePlane() {
        //Applied synchronously, so that onScroller() called straight after initialize() measures
        //the laid-out list
        for (var name of ["vlistParentXContainer", "scroll", "bar-hide", "x"]) {
            if (!container.classList.contains(name)) {
                container.classList.add(name);
                addedClasses.container.push(name);
            }
        }
        applyWrapperStyle();

        listParent.classList.add("vlistCon", "noWrap", "vlistParentX");
        //max-content: the list is as wide as its items, so the scroll range ends at the last item
        listParent.style["width"] = "max-content";
        applyPadding();

        for (var list of listParent.children) {
            list.classList.add("vlist");
        }
    }

    function finiteNumber(value, msg) {
        validateNumber(value, msg);
        if (!isFinite(value)) throw new TypeError(msg);
    }

    this.config = {};

    this.initialize = function() {
        if (ready == 0) { //Not initialized
            if (destroyed) throw new Error("This ListScroller has been destroyed, create a new instance instead of re-initializing");

            if(hasButtons){
                if (inactiveButtonClassName == "") {
                    throw new Error("Setup error: Buttons class for inactive state not specified. Specify using the 'config.inactiveButtonClassName' property");
                }

                if (buttons.length == 0) {
                    throw new Error("Setup error: scroll buttons not specified. Specify using the 'config.buttons' property");
                }
            }

            stylePlane();
            ready = 1; //initialized
            if (hasButtons) bindButtons();

            container.addEventListener("scroll", updateState, false);
            //Catches window resizes, the container being resized on its own, items being added or
            //changing size, and the stylesheet arriving after initialize()
            resizeWatcher = new ResizeObserver(updateState);
            resizeWatcher.observe(container);
            resizeWatcher.observe(listParent);

            addVitalStyles();
        }
    };
    this.onScroller = function() {
        if (ready == 1) {
            listening = 1;
            //Items added since initialize() get the no-shrink class too
            for (var list of listParent.children) list.classList.add("vlist");
            updateState();
        }
    }
    this.offScroller = function() {
        if (ready == 1) {
            listening = 0;
            stopAnimation();
            if (hasButtons) {
                setInactive(0, true);
                setInactive(1, true);
            }
        }
    };
    this.destroy = function(){
        //Stops a running scroll, detaches the button, scroll and resize listeners, then strips the
        //classes and inline styles this instance applied, leaving the consumer's own in place.
        if (destroyed) return;

        stopAnimation();
        if (ready == 1) {
            if (hasButtons) unbindButtons();
            container.removeEventListener("scroll", updateState, false);
            if (resizeWatcher != null) resizeWatcher.disconnect();
            resizeWatcher = null;

            for (var name of addedClasses.container) container.classList.remove(name);
            addedClasses.container = [];
            removeWrapperStyle();

            listParent.classList.remove("vlistParentX", "vlistCon", "noWrap");
            for (var property of ["width", "padding-left", "padding-right"]) listParent.style.removeProperty(property);
            if (listParent.getAttribute("style") == "") listParent.removeAttribute("style");
            for (var list of listParent.children) list.classList.remove("vlist");
        } else {
            for (var x = 0; x < buttons.length; x++) buttons[x].style["cursor"] = savedCursor[x];
        }
        releaseButtonClasses();

        listening = 0;
        ready = 0;
        destroyed = true;
    };
    Object.defineProperties(this.config, {
        buttons: {
            set: function(value) {
                var temp = "ListScroller.config.buttons property value must be an array ";
                validateArray(value, temp);
                validateArrayLength(value, 2, temp + "of 2 Elements");
                validateArrayMembers(value, "HTMLElement", temp + "of HTMLElements");
                if (value[0] == value[1]) throw new Error(temp + "of 2 different Elements, one per direction");

                //Swapping buttons on a running scroller releases the old pair first
                if (ready == 1 && hasButtons) unbindButtons();
                releaseButtonClasses();

                var names = [["vListBt", "vListBt-Left"], ["vListBt", "vListBt-Right"]];
                for (var x = 0; x < 2; x++) {
                    for (var name of names[x]) {
                        if (!value[x].classList.contains(name)) {
                            value[x].classList.add(name);
                            addedClasses.buttons[x].push(name);
                        }
                    }
                }
                savedCursor = [value[0].style["cursor"], value[1].style["cursor"]];
                value[0].style["cursor"] = "not-allowed";
                value[1].style["cursor"] = "not-allowed";
                buttons = [value[0], value[1]];

                if (ready == 1 && hasButtons) bindButtons();
            }
        },
        scrollSize: {
            set: function(value) {
                finiteNumber(value, "Numeric value needed for scrollSize property");
                if (value <= 0) throw new Error("'config.scrollSize' property value must be greater than 0");
                scrollSize = value;
            }
        },
        paddingRight: {
            set: function(value) {
                finiteNumber(value, "Numeric value needed for 'paddingRight' property");
                paddingRight = value < 0 ? 0 : value;
                if (ready == 1) applyPadding();
            }
        },
        paddingLeft: {
            set: function(value) {
                finiteNumber(value, "Numeric value needed for 'paddingLeft' property");
                paddingLeft = value < 0 ? 0 : value;
                if (ready == 1) applyPadding();
            }
        },
        inactiveButtonClassName: {
            set: function(value) {
                validateString(value, "config.inactiveButtonClassName property expects a string as value");
                if (!/^\S+$/.test(value)) throw new Error("config.inactiveButtonClassName property expects a single class name, without spaces");
                if (ready == 1 && hasButtons) {
                    for (var button of buttons) button.classList.remove(inactiveButtonClassName);
                }
                inactiveButtonClassName = value;
                if (ready == 1 && hasButtons) {
                    if (listening == 1) {
                        updateState();
                    } else {
                        setInactive(0, true);
                        setInactive(1, true);
                    }
                }
            }
        },
        scrollSpeed: {
            set: function(value) {
                //Duration of one button scroll, in milliseconds. 0 jumps without animating.
                finiteNumber(value, "'config.scrollSpeed' property value must be a number of milliseconds");
                if (value < 0) throw new Error("'config.scrollSpeed' property value must be 0 or more milliseconds");
                scrollSpeed = value;
            }
        },
        wrapperStyle: {
            set: function(value) {
                validateString(value, "config.wrapperStyle property expects a string as value");
                if (ready == 1) removeWrapperStyle();
                wrapperStyle = value;
                if (ready == 1) applyWrapperStyle();
            }
        },
        hasButtons: {
            set: function(value){
                validateBoolean(value, "config.hasButtons property expects a boolean as value");
                if (ready == 1 && value != hasButtons) {
                    if (value) {
                        if (inactiveButtonClassName == "" || buttons.length == 0) {
                            throw new Error("Setup error: set 'config.buttons' and 'config.inactiveButtonClassName' before turning 'config.hasButtons' on");
                        }
                        hasButtons = true;
                        bindButtons();
                        return;
                    }
                    unbindButtons();
                }
                hasButtons = value;
            }
        }
    });
    Object.defineProperties(this, {
        config: { writable: false },
        initialize: { writable: false },
        onScroller: { writable: false },
        offScroller: { writable: false },
        destroy: { writable: false }
    });
}
/****************************************************************/
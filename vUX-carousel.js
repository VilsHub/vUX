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
import { TouchHandler } from "./vUX-touchHandler.js";

/***************************Carousel*****************************/
var carouselCount = 0; //numbers each instance so its generated button styles stay scoped to it

export function Carousel(container, viewport) {
    validateElement(container, "'Carousel(x,.)' constructor argument 1 must be an HTML Element");
    validateElement(viewport, "'Carousel(.,x)' constructor argument 2 must be an HTML Element");
    var self = this;
    //The viewport's direct <div> children are the slides. Read from children rather than through an
    //'#id > div' selector, so a viewport without an id attribute works too.
    var sliders = Array.prototype.filter.call(viewport.children, function(child){ return child.nodeName == "DIV"; });
    var instanceId = ++carouselCount;
    var current = 0, target = 0, pauseMode = 0, completed = 1, started = 0, delay = 4000, speed = 1000, initialized = 0, buttonStyle = null;
    var touchResponse = true, slideEffect = "linear", s = null;
    var destroyed = false, touchHdr = null, controlArea = null;   //touchHdr is held at instance scope so destroy() can tear it down too

    //Every lookup goes through this instance's own control strip, never the document, so two
    //carousels on one page cannot move each other's active button.
    function buttonFor(index) {
        return controlArea != null ? controlArea.querySelector(".vButton[data-ratio='" + index + "']") : null;
    }

    function markActive(index) {
        sliders.forEach(function(slide, i){
            slide.setAttribute("data-activeDisplay", i == index ? "1" : "0");
        });
        if (controlArea != null) {
            var previous = controlArea.querySelector(".vButton.active");
            if (previous != null) previous.classList.remove("active");
            var next = buttonFor(index);
            if (next != null) next.classList.add("active");
        }
    }

    //Moves the viewport to a slide. All three movers (autoplay, a button click, the end of a swipe)
    //go through here, so 'current' always matches the slide on screen.
    function goTo(index) {
        target = index;
        if (index == current && completed == 1) {
            settle(); //already there: no transition will run, so there will be no transitionend either
            return;
        }
        completed = 0;
        viewport.style["left"] = -(index * 100) + "%";
        if (speed == 0) settle(); //a 0ms transition never fires transitionend
    }

    function settle() {
        current = target;
        markActive(current);
        completed = 1;
    }

    function handleButtonClick(e) {
        if (e.target.classList.contains("vButton") && e.target.nodeName == "DIV" && !e.target.classList.contains("active")) {
            goTo(parseInt(e.target.getAttribute("data-ratio")));
        }
    }

    function handleMouseEnter() {
        pauseMode = 1;
    }

    function handleMouseLeave() {
        pauseMode = 0;
    }

    function handleTransitionEnd(e) {
        //Only the viewport's own 'left' transition counts. transitionend bubbles, so a transition on
        //anything inside a slide would otherwise end the slide early.
        if (e.target != viewport || e.propertyName != "left") return;
        //'posUpdate' marks the snap at the end of a swipe; TouchHandler reports that one through
        //touchEndCallBack instead.
        if (viewport.classList.contains("posUpdate")) return;
        settle();
    }

    function handleTransitionCancel(e) {
        //A slide in flight is cancelled when the carousel is hidden (display:none, e.g. an SPA route
        //swap) or detached. transitionend then never fires and autoplay would stall for good, so
        //settle here, unless a replacement transition is already running (a button clicked mid-slide).
        if (e.target != viewport || e.propertyName != "left") return;
        if (viewport.getAnimations().length == 0) settle();
    }

    function nextSlide() {
        if (pauseMode == 0 && completed == 1) {
            goTo((current + 1) % sliders.length);
        }
    }

    function createControls() {
        controlArea = $$.ce("DIV");
        var buttonsCons = $$.ce("DIV");

        controlArea.classList.add("vControlArea");
        buttonsCons.classList.add("vControlButtonsCon");

        for (var x = 0; x < sliders.length; x++) {
            var buttonsShell = $$.ce("DIV");
            var button = $$.ce("DIV");
            buttonsShell.classList.add("vControlButtonsShell");
            button.classList.add("vButton");
            if (x == 0) button.classList.add("active");
            button.setAttribute("data-ratio", x);
            buttonsShell.appendChild(button);
            buttonsCons.appendChild(buttonsShell);
        }

        controlArea.appendChild(buttonsCons);
        container.appendChild(controlArea);
        container.addEventListener("click", handleButtonClick, false);
    }

    function createControlStyles() {
        //Scoped to this container, and one selector more specific than carousel.css, which is linked
        //after this <style> and would otherwise win on equal specificity.
        if (buttonStyle != null) {
            var scope = "[data-vcarousel='" + instanceId + "'] .vControlArea ";
            var css = scope + ".vButton{" + buttonStyle[0] + "}"; //Normal button
            if (buttonStyle[1] != undefined) {
                css += scope + ".vButton.active{" + buttonStyle[1] + "}"; //active button
            }
            attachStyleSheet("carouselStyles-" + instanceId, css);
        }
    }

    function removeControlStyles() {
        var sheet = document.querySelector("style[data-id='carouselStyles-" + instanceId + "']");
        if (sheet != null) sheet.remove();
    }

    async function addVitalStyles() {
        try {
            var path = await processAssetPath();
            if (!(path instanceof Error)){
                vModel.core.functions.linkStyleSheet(path+"css/carousel.css", "carousel");
            }else{
                throw new Error(path)
            }
        } catch (error) {
            console.error(error)
        }
    }

    function startSlide() {
        clearInterval(s);
        s = setInterval(nextSlide, delay + speed);
    }

    function touchEndCallBack(node) {
        target = node;
        settle();
    }

    function touchTransition() {
        return "left " + speed + "ms " + slideEffect;
    }

    //Lets speed and slideEffect be changed on a carousel that is already running
    function applyTransition() {
        if (initialized == 0) return;
        viewport.style.removeProperty("transition"); //TouchHandler leaves a shorthand behind after a drag
        viewport.style["transition-duration"] = speed + "ms";
        viewport.style["transition-timing-function"] = slideEffect;
        if (touchHdr != null) touchHdr.config.viewPortTransition = touchTransition();
        if (s != null) startSlide(); //the interval spans delay + speed
    }

    this.initialize = function() {
        if (initialized == 0) {
            if (destroyed) throw new Error("This Carousel has been destroyed, create a new instance instead of re-initializing");
            addVitalStyles();
            container.setAttribute("data-vcarousel", instanceId);
            viewport.classList.add("vSliderViewPort");
            viewport.style["transition-duration"] = speed + "ms";
            viewport.style["transition-timing-function"] = slideEffect;

            //Place sliders in order
            sliders.forEach(function(itemContent, arrayIndex) {
                itemContent.style["left"] = (arrayIndex * 100) + "%";
                itemContent.setAttribute("data-ratio", arrayIndex);
            });

            //Listeners rather than on* properties, so the consumer's own container handlers survive
            container.addEventListener("mouseenter", handleMouseEnter, false);
            container.addEventListener("mouseleave", handleMouseLeave, false);
            viewport.addEventListener("transitionend", handleTransitionEnd, false);
            viewport.addEventListener("transitioncancel", handleTransitionCancel, false);

            //Enable touch if specified
            if (touchResponse) {
                touchHdr = new TouchHandler(container);
                touchHdr.config.slideCallBack = touchEndCallBack;
                touchHdr.config.viewPortTransition = touchTransition();
                touchHdr.initialize();
                touchHdr.enableTouch();
            }
            createControlStyles();
            createControls();
            markActive(0);
            initialized = 1;
        }
    }

    this.start = function() {
        if (started == 0) {
            if (destroyed) throw new Error("This Carousel has been destroyed, create a new instance instead of restarting it");
            if (initialized == 0) throw new Error("Call Carousel.initialize() before Carousel.start()");
            if (sliders.length > 1) startSlide(); //nothing to rotate through otherwise
            started = 1;
        }
    };
    this.destroy = function(){
        //Stops the autoplay interval (which otherwise keeps firing for the life of the page), detaches
        //the container and viewport listeners, tears down the nested TouchHandler and removes the
        //generated control strip and this instance's button styles. carousel.css stays linked, as
        //other carousels on the page may still use it.
        if (destroyed) return;

        clearInterval(s);
        s = null;

        container.removeEventListener("click", handleButtonClick, false);
        container.removeEventListener("mouseenter", handleMouseEnter, false);
        container.removeEventListener("mouseleave", handleMouseLeave, false);
        viewport.removeEventListener("transitionend", handleTransitionEnd, false);
        viewport.removeEventListener("transitioncancel", handleTransitionCancel, false);

        if (touchHdr != null){
            touchHdr.destroy();
            touchHdr = null;
        }

        if (controlArea != null) controlArea.remove();
        controlArea = null;
        removeControlStyles();
        container.removeAttribute("data-vcarousel");

        viewport.classList.remove("vSliderViewPort", "posUpdate");
        viewport.style.removeProperty("transition");
        viewport.style.removeProperty("transition-duration");
        viewport.style.removeProperty("transition-timing-function");
        viewport.style.removeProperty("left");

        sliders.forEach(function(itemContent){
            itemContent.removeAttribute("data-activeDisplay");
            itemContent.removeAttribute("data-ratio");
            itemContent.style.removeProperty("left");
        });

        started = 0;
        initialized = 0;
        destroyed = true;
    }
    this.config = {

    }
    Object.defineProperties(this, {
        initialize: {
            writable: false
        },
        start: {
            writable: false
        },
        destroy: {
            writable: false
        },
        config: {
            writable: false
        }
    });
    Object.defineProperties(this.config, {
        delay: {
            set: function(value) {
                validateNumber(value, "'config.delay' property value must be numeric");
                value < 0 ? value = 0 : null;
                delay = value;
                if (s != null) startSlide(); //takes effect on a running carousel
            }
        },
        speed: {
            set: function(value) {
                validateNumber(value, "'config.speed' property value must be numeric");
                value < 0 ? value = 0 : null;
                speed = value;
                applyTransition();
            }
        },
        slideEffect:{
            set: function(value) {
                validateString(value, "'config.slideEffect' property value must be a string");
                slideEffect = value;
                applyTransition();
            }
        },
        buttonStyle: {
            set: function(value) {
                //value = [a, b] => a = string styles for normal button state; b =>  string styles for active button state
                var temp = "'config.buttonStyle' property value must be an array";
                validateArray(value, temp);
                if (value.length < 1 || value.length > 2) {
                    throw new Error(temp + " of either 1 or 2 element(s)");
                }
                validateString(value[0], temp + " of strings");
                value[1] != undefined ? validateString(value[1], temp + " of strings") : null;
                buttonStyle = value;
                if (initialized == 1) { //restyle a live carousel
                    removeControlStyles();
                    createControlStyles();
                }
            }
        },
        touchResponse: {
            set: function(value) {
                validateBoolean(value, "config.touchResponse property expects a boolean");
                touchResponse = value;
                if (touchHdr != null) value ? touchHdr.enableTouch() : touchHdr.disableTouch();
            }
        }
    })
}
/****************************************************************/
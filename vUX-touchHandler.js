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

/***************************Touch handler*****************************/
export function TouchHandler(frame) {
    var initialTouchPos = {},slideCallBack = null,mode = "slider",hasMoved = false,lastTouchPos = {},lastPoint = { x: 0, y: 0 },usePoint = 0,initialized = false,rafPending = false,pan = "x",pressed = false,viewPort = null;
    var pointerDownName = 'pointerdown',slopeValue = 0,pointerUpName = 'pointerup',pointerMoveName = 'pointermove',pointerCancelName = "pointercancel",viewPortTransition = "";
    var moved = 0,node = 0,enableTouch = false,maxStop = 0,targetDirection = null,SLIDE_LEFT = 1,SLIDE_RIGHT = 2,SLIDE_TOP = 3,SLIDE_BOTTOM = 4,DEFAULT = 5;
    var destroyed = false;

    function addTouchEventHandler() {
        if (window.PointerEvent) {
            // Add Pointer Event Listener
            frame.addEventListener(pointerDownName, handleGestureStart, false);
            frame.addEventListener(pointerMoveName, handleGestureMove, false);
            frame.addEventListener(pointerUpName, handleGestureEnd, false);
            frame.addEventListener(pointerCancelName, handleGestureEnd, false);
        } else {
            // Add Touch Listener
            frame.addEventListener('touchstart', handleGestureStart, false);
            frame.addEventListener('touchmove', handleGestureMove, false);
            frame.addEventListener('touchend', handleGestureEnd, false);
            // frame.addEventListener('touchcancel', handleGestureCancel, false);

            // Add Mouse Listener
            frame.addEventListener('mousedown', handleGestureStart, false);
        }
        //Named rather than anonymous so that destroy() can detach them again.
        frame.addEventListener("transitionend", handleTransitionEnd, false);
        window.addEventListener("resize", handleResize, false);
    }

    function handleTransitionEnd(e) {
        if (mode == "slider") {
            if (e.target.classList.contains("posUpdate")) {
                e.target.classList.remove("posUpdate");
                viewPortTransition != "" ? viewPort.style.transition = viewPortTransition : null;
                hasMoved = false;
                slideCallBack != null ? slideCallBack(node) : null;
            }
        }
    }

    function handleResize() {
        calculateSlope();
    }

    async function addVitalStyles() {
        try {
            var path = await processAssetPath();
            if (!(path instanceof Error)){
                vModel.core.functions.linkStyleSheet(path+"css/touchHandler.css", "touchHandler");
            }else{
                throw new Error(path)
            }
        } catch (error) {
            console.error(error)
        }
    }

    function removeTouchEventHandler() {
        //Mirrors addTouchEventHandler(); the pointer/touch names are the ones checkSupport() settled on.
        frame.removeEventListener(pointerDownName, handleGestureStart, false);
        frame.removeEventListener(pointerMoveName, handleGestureMove, false);
        frame.removeEventListener(pointerUpName, handleGestureEnd, false);
        frame.removeEventListener(pointerCancelName, handleGestureEnd, false);
        frame.removeEventListener('touchstart', handleGestureStart, false);
        frame.removeEventListener('touchmove', handleGestureMove, false);
        frame.removeEventListener('touchend', handleGestureEnd, false);
        frame.removeEventListener('mousedown', handleGestureStart, false);
        frame.removeEventListener("transitionend", handleTransitionEnd, false);
        window.removeEventListener("resize", handleResize, false);
        document.removeEventListener(pointerUpName, handleGestureEnd, false);
    }

    function checkSupport() {
        /* // [START pointereventsupport] */
        if (window.navigator.msPointerEnabled) {
            pointerDownName = 'MSPointerDown';
            pointerUpName = 'MSPointerUp';
            pointerMoveName = 'MSPointerMove';
            pointerCancelName = 'MSPointerCancel';
        }

        // Simple way to check if some form of pointerevents is enabled or not
        window.PointerEventsSupport = false;
        if (window.PointerEvent || window.navigator.msPointerEnabled) {
            window.PointerEventsSupport = true;
        }
        /* // [END pointereventsupport] */
    }

    function handleGestureStart(e) {
        e.preventDefault();

        if (e.touches && e.touches.length > 1) {
            return;
        }
        if (enableTouch) {
            document.addEventListener(pointerUpName, handleGestureEnd, false);
            var prop = getCurrentPosition();
            usePoint = pan == "x" ? prop["x"] : prop["y"];
            node = prop["n"];

            frame.classList.add("grab");
            initialTouchPos = getPoints(e);
            viewPort.style.transition = 'initial';
            pressed = true;
        }
    }

    function getCurrentPosition() {
        var frameWidth = frame.clientWidth;
        var offset = viewPort.offsetLeft;
        var nPoint = Math.floor(Math.abs(offset / frameWidth));
        nPoint = nPoint > maxStop ? nPoint = maxStop : nPoint
        return {
            x: offset,
            y: 0,
            n: nPoint
        }
    }

    function handleGestureMove(e) {
        e.preventDefault();
        if (pressed) {

            if (!initialTouchPos) {
                return;
            }

            lastTouchPos = getPoints(e);

            if (rafPending) {
                return;
            }

            rafPending = true;

            window.requestAnimationFrame(move);
        }
    }

    function getPoints(e) {
        var point = {};
        if (e.targetTouches) {
            point.x = e.targetTouches[0].clientX;
            point.y = e.targetTouches[0].clientY;
        } else {
            // Either Mouse event or Pointer Event
            point.x = e.clientX;
            point.y = e.clientY;
        }

        return point;
    }

    function move() {
        if (!rafPending) {
            return;
        }
        if (pan == "x") {
            var diff = initialTouchPos.x - lastTouchPos.x;
        } else {
            var diff = initialTouchPos.y - lastTouchPos.y;
        }

        var newValue = (usePoint - diff);
        lastPoint = newValue;
        moved = diff;
        hasMoved = true;

        //use new value here
        viewPort.style.left = newValue + "px";
        rafPending = false;
    }

    function handleGestureEnd(e) {
        e.preventDefault();
        if (e.touches && e.touches.length > 0) {
            return;
        }
        rafPending = false;
        document.removeEventListener(pointerUpName, handleGestureEnd, false);
        if (hasMoved) {
            mode == "slider" ? updateSliderPosition() : updateListPosition();
        }
        hasMoved == false ? viewPort.style.transition = viewPortTransition : null;
        frame.classList.remove("grab");
        initialTouchPos = null;
    }

    function calculateSlope() {
        var frameWidth = frame.clientWidth;
        slopeValue = frameWidth * (1 / 4);
    }

    function updateSliderPosition() {
        viewPort.style.transition = "all .2s cubic-bezier(0,.99,0,.99) 0s";
        viewPort.classList.add("posUpdate");
        if (Math.abs(moved) > slopeValue) {
            //change position
            if (moved < 0) {
                targetDirection = pan == "x" ? SLIDE_RIGHT : SLIDE_BOTTOM;
            } else {
                targetDirection = pan == "x" ? SLIDE_LEFT : SLIDE_TOP;
            }
        } else {
            //return to default position
            targetDirection = DEFAULT;
        }

        //log current position
        logPosition("slider");

        var property = pan == "x" ? "left" : "top";
        if (targetDirection == DEFAULT) {
            viewPort.style[property] = usePoint + "px";
        } else if (targetDirection == SLIDE_RIGHT) {
            if (node == 0) { //no further movement
                viewPort.style[property] = "0px";
            } else { //slide right
                viewPort.style[property] = -(node * 100) + "%";
            }
        } else if (targetDirection == SLIDE_LEFT) {
            if (node == maxStop) { //no further movement
                viewPort.style[property] = -(maxStop * 100) + "%";
            } else { //slide left
                viewPort.style[property] = -(node * 100) + "%";;
            }
        }

    }

    function updateListPosition() {

    }

    function logPosition(mode) {
        if (mode == "slider") {
            var pWidth = frame.clientWidth;
            switch (targetDirection) {
                case SLIDE_LEFT:
                    node++;
                    node = node > maxStop ? node = maxStop : node;
                    var pxValue = ((node * 100) / 100) * pWidth;
                    usePoint = -1 * pxValue;
                    break;
                case SLIDE_RIGHT:
                    node--;
                    node = node < 0 ? node = 0 : node;
                    var pxValue = ((node * 100) / 100) * pWidth;
                    usePoint = -1 * pxValue;
                    break;
                default:
                    break;
            }
        } else {

        }
    }
    this.initialize = function() {
        if (destroyed) throw new Error("This TouchHandler has been destroyed, create a new instance instead of re-initializing");
        validateElement(frame, "Contructor argument must be a valid HTML element");
        viewPort = frame.children[0];
        var totalChildren = viewPort.childElementCount;
        maxStop = totalChildren - 1;
        addVitalStyles();
        checkSupport();
        calculateSlope();
        addTouchEventHandler();
        initialized = true;
    }
    this.enableTouch = function() {
        if (initialized == false) {
            throw new Error("Call Obj.initialize() method 1st before calling the obj.enableTouch() method");
        }
        enableTouch = true;
        frame.classList.add("vTouchHandler");
        frame.classList.toggle("vPanY", pan == "y"); //touchHandler.css picks the touch-action from this
    }
    this.disableTouch = function() {
        if (enableTouch == true) {
            enableTouch = false;
            frame.classList.remove("vTouchHandler");
        }
    }
    this.destroy = function(){
        //Detaches every gesture listener from the frame and from window, and clears the marker
        //classes. Call it when the frame's page is exited, otherwise the resize listener outlives it.
        if (destroyed) return;

        removeTouchEventHandler();
        frame.classList.remove("vTouchHandler", "grab", "vPanY");

        enableTouch = false;
        initialized = false;
        destroyed = true;
    }
    this.config = {}
    Object.defineProperties(this, {
        initialize: { writable: false },
        config: { writable: false },
        enable: { writable: false },
        disable: { writable: false },
        destroy: { writable: false }
    })
    Object.defineProperties(this.config, {
        pan: {
            set: function(value) {
                var temp = "config.pan property expects a string";
                value = value.toLowerCase();
                validateString(value, temp);
                if (value != "x" && value != "y") {
                    throw new Error(temp + " value of 'x' or 'y'");
                }
                pan = value;
            }
        },
        viewPortTransition: {
            set: function(value) {
                validateString(value, "config.viewPortTransition property expects a string as value");
                viewPortTransition = value;
            }
        },
        mode: {
            set: function(value) {
                var temp = "config.mode property expects a string value";
                validateString(value, temp);
                value = value.toLowerCase();
                if (value != "list" && value != "slider") {
                    throw new Error(temp + " of 'list' or 'slider'");
                }
                mode = value;
            }
        },
        slideCallBack: {
            set: function(value) {
                validateFunction(value, "config.slideCallBack property expects a function as value");
                slideCallBack = value;
            }
        }
    })
}
/**********************************************************************/
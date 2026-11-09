/*
 * vUX JavaScript library v4.0.0
 * https://github.com/VilsHub/vUX
 *
 *
 * Released under the MIT license
 * https://github.com/VilsHub/vUX/blob/master/LICENSE
 *
 * Date: 2021-07-19=T22:30Z
 * 
 * 
 */
// Import vUX core
import "./src/vUX-core-4.0.0.js";

/***********************Canvas Shapes**********************/
export function CShapes() {
    /*******************shared rectangle drawing********************/
    //Sizes the canvas backing store by devicePixelRatio and scales the context, so the line stays
    //sharp on high-density screens while every coordinate below stays in CSS pixels.
    //The backing store is only reallocated when the size or ratio changed, so a per-frame call
    //(the animated arc) does not reallocate it on every frame.
    function prepareCanvas(canvasElement) {
        var ratio = window.devicePixelRatio || 1;
        var width = canvasElement.clientWidth || canvasElement.scrollWidth;
        var height = canvasElement.clientHeight || canvasElement.scrollHeight;
        var w = Math.round(width * ratio), h = Math.round(height * ratio);
        if (canvasElement.width != w) canvasElement.width = w;
        if (canvasElement.height != h) canvasElement.height = h;
        var context = canvasElement.getContext("2d");
        context.setTransform(ratio, 0, 0, ratio, 0, 0);
        return {context: context, width: width, height: height};
    }

    //Strokes one closed rectangle, square or with rounded corners. beginPath() first, so a frame
    //never re-strokes the paths of earlier frames.
    //A square rectangle runs along the canvas edge with the full line width, as it always has, so
    //the canvas clips the outer half and half of lineWidth shows. A rounded one cannot do that: its
    //corners bend inward and would show the full width. It is drawn instead with half the width,
    //inset by a quarter, which shows the same thickness everywhere and nothing is clipped.
    function strokeRectangle(context, x, y, width, height, radius, lineWidth) {
        //the context keeps its state between draws on one canvas (it is no longer reset by resizing),
        //so a cap left by an arc on the same canvas is put back to the rectangles' butt ends
        context.lineCap = "butt";
        context.beginPath();
        if (radius <= 0) {
            context.lineWidth = lineWidth;
            context.rect(x, y, width, height);
            context.stroke();
            return;
        }
        var inset = lineWidth / 4;
        x += inset; y += inset; width -= 2 * inset; height -= 2 * inset;
        var r = Math.max(0, Math.min(radius - inset, width / 2, height / 2));
        context.lineWidth = lineWidth / 2;
        context.moveTo(x + r, y);
        context.arcTo(x + width, y, x + width, y + height, r);
        context.arcTo(x + width, y + height, x, y + height, r);
        context.arcTo(x, y + height, x, y, r);
        context.arcTo(x, y, x + width, y, r);
        context.closePath();
        context.stroke();
    }

    function validateCanvas(element, message) {
        if (!(element instanceof Element) || element.nodeName != "CANVAS") throw new TypeError(message);
    }

    function validateRadius(value, owner) {
        validateNumber(value, "'" + owner + ".config.radius' property value must be a number of pixels");
        if (!isFinite(value) || value < 0) throw new Error("'" + owner + ".config.radius' property value must be 0 or more pixels");
    }
    /*******************************************************************/

    /*******************fixed dashed rectangle starts********************/
    this.fixedRectangle = function() {
        var FRlinecolor = "black", FRlinewidth = 5,FRsegment = [10, 2],FROrigin = [0, 0],FRradius = 0;
        var body = {
            config: {},
            draw: function(canvasElement) {
                validateCanvas(canvasElement, "A canvas element is needed as the argument for the 'draw()' method");
                var canvas = prepareCanvas(canvasElement);
                var canObj = canvas.context;

                //Segment
                canObj.setLineDash(FRsegment);

                //lineColor
                canObj.strokeStyle = FRlinecolor;

                //origin
                var xOrigin = FROrigin[0];
                var yOrigin = FROrigin[1];
                canObj.clearRect(0, 0, canvas.width, canvas.height);
                strokeRectangle(canObj, xOrigin, yOrigin, canvas.width, canvas.height, FRradius, FRlinewidth);
            }
        }

        Object.defineProperties(body.config, {
            lineColor: {
                set: function(value) {
                    validateString(value, "'fixedRectangle.config.lineColor' property value must be a string of a valid CSS colour");
                    FRlinecolor = value;
                }
            },
            lineWidth: {
                set: function(value) {
                    validateNumber(value, "'fixedRectangle.config.lineWidth' property value must be a number of pixels");
                    FRlinewidth = value > 0 ? value : 1;
                }
            },
            segment: {
                set: function(value) {
                    var temp = "fixedRectangle.config.segment property value must be an array ";
                    validateArray(value, temp);
                    validateArrayLength(value, 2, temp + "of 2 Elements");
                    validateArrayMembers(value, "number", temp + "of numeric elements");
                    if (value[0] > 0 && value[1] > 0) {
                        FRsegment = value;
                    } else {
                        throw new Error("Array members for 'segment' property value must both be numbers above 0");
                    }
                }
            },
            origin: {
                set: function(value) {
                    var temp = "fixedRectangle.config.origin property value must be an array ";
                    validateArray(value, temp);
                    validateArrayLength(value, 2, temp + "of 2 Elements");
                    validateArrayMembers(value, "number", temp + "of numeric elements");
                    FROrigin = value;
                }
            },
            radius: {
                set: function(value) {
                    validateRadius(value, "fixedRectangle");
                    FRradius = value;
                }
            }
        });
        Object.defineProperties(body, {
            config: { writable: false },
            draw: { writable: false }
        })

        return body;
    };
    /*******************************************************************/

    /*******************animated dashed rectangle starts********************/
    this.animatedRectangle = function() {
        var ARlinecolor = "black",ARlinewidth = 5,ARsegment = [10, 2],AROrigin = [0, 0],ARclockWise = true,ARduration = 3000,AReasing = "linear",ARradius = 0,animationCount = 1,callback = null;
        var ARtarget = null;   //the canvas last drawn on, so destroy() can clear it
        var run = 0;           //bumped by draw(), stop() and destroy(); a frame from an older run exits

        var body = {
            config: {},
            draw: function(canvasElement) {
                validateCanvas(canvasElement, "A canvas element is needed as the argument for the 'draw()' method");
                //A new run token: the loop of any earlier draw() on this instance sees a different
                //token on its next frame and exits, so calling draw() again restarts the animation
                //instead of adding a second loop. The canvas no longer needs an id for this.
                run++;
                var token = run;
                ARtarget = canvasElement;

                var canObj, size, xOrigin, yOrigin, distance, cycle = 0, animationStart = 0;

                //Read the configuration and size the canvas at the start of every cycle, so a cycle
                //follows a resized canvas and config changes made since the last one.
                function startCycle() {
                    size = prepareCanvas(canvasElement);
                    canObj = size.context;
                    canObj.setLineDash(ARsegment);
                    xOrigin = AROrigin[0];
                    yOrigin = AROrigin[1];
                    //The dashes travel a whole number of dash periods per cycle (the nearest to 100px),
                    //so a repeating animation starts each cycle on the frame it ended on, without a jump
                    var period = ARsegment[0] + ARsegment[1];
                    distance = period * Math.max(1, Math.round(100 / period));
                    animationStart = Date.now();
                }

                function frame() {
                    if (token != run) return;   //stopped, destroyed or replaced by a newer draw()
                    var tf = ARduration > 0 ? timeFraction(animationStart, ARduration) : 1;
                    var progress = timing[AReasing](tf);

                    canObj.lineDashOffset = (ARclockWise ? -1 : 1) * progress * distance;
                    //read every frame, like lineWidth, so config.lineColor can be changed (or tweened)
                    //while the rectangle runs and shows on the next frame, not the next cycle
                    canObj.strokeStyle = ARlinecolor;
                    canObj.clearRect(0, 0, size.width, size.height);
                    strokeRectangle(canObj, xOrigin, yOrigin, size.width, size.height, ARradius, ARlinewidth);

                    if (tf < 1) {
                        requestAnimationFrame(frame);
                        return;
                    }
                    if (callback != null) callback();
                    if (token != run) return;   //the callback stopped or restarted it
                    cycle++;
                    //a 0ms cycle has nothing to animate: it paints once instead of looping every frame
                    if (ARduration > 0 && (animationCount == "infinite" || cycle < animationCount)) {
                        startCycle();
                        requestAnimationFrame(frame);
                    }
                }

                startCycle();
                //the first frame is painted now, so stop() straight after draw() leaves a still rectangle
                frame();
            },
            stop: function() {
                //Leaves the last frame painted
                run++;
            },
            destroy: function() {
                //stop() halts the loop at the next frame; destroy() additionally wipes the canvas, so
                //an animation torn down mid-cycle does not leave its last frame painted on a canvas
                //the consumer is about to reuse.
                run++;
                if (ARtarget != null){
                    var ctx = ARtarget.getContext("2d");
                    ctx.setTransform(1, 0, 0, 1, 0, 0);
                    ctx.clearRect(0, 0, ARtarget.width, ARtarget.height);
                    ARtarget = null;
                }
            }
        }
        Object.defineProperties(body.config, {
            lineColor: {
                set: function(value) {
                    validateString(value, "'config.lineColor' property value must be a string");
                    ARlinecolor = value;
                }
            },
            lineWidth: {
                set: function(value) {
                    validateNumber(value, "'animatedRectangle.config.lineWidth' property value must be a number of pixels");
                    if (value > 0) {
                        ARlinewidth = value;
                    } else {
                        ARlinewidth = 1;
                    }
                }
            },
            iterationCount: {
                set: function(value) {
                    if (typeof value == "number" || typeof value == "string") {
                        if (typeof value == "number") {
                            if (!validateInteger(value)) throw new Error("'iterationCount' property numeric value must be an integer")
                            if (value < 0) {
                                animationCount = 1;
                            } else {
                                animationCount = value;
                            }
                        } else if (typeof value == "string") {
                            if (value.toLowerCase() == "infinite") {
                                animationCount = value.toLowerCase();
                            } else {
                                throw new Error("'iterationCount' property string value can only be 'infinite'");
                            }
                        }
                    } else {
                        throw new Error("'iterationCount' property value must be a numeric or a string of value 'infinite'")
                    }
                }
            },
            segment: {
                set: function(value) {
                    var temp = "animatedRectangle.config.segment property value must be an array ";
                    validateArray(value, temp);
                    validateArrayLength(value, 2, temp + "of 2 Elements");
                    validateArrayMembers(value, "number", temp + "of numeric elements");
                    if (value[0] > 0 && value[1] > 0) {
                        ARsegment = value;
                    } else {
                        throw new Error("Array members for 'segment' property value must both be numbers above 0");
                    }
                }
            },
            origin: {
                set: function(value) {
                    var temp = "animatedRectangle.config.origin property value must be an array ";
                    validateArray(value, temp);
                    validateArrayLength(value, 2, temp + "of 2 Elements");
                    validateArrayMembers(value, "number", temp + "of numeric elements");
                    AROrigin = value;
                }
            },
            radius: {
                set: function(value) {
                    validateRadius(value, "animatedRectangle");
                    ARradius = value;
                }
            },
            easing: {
                set: function(value) {
                    validateString(value, "'animatedRectangle.config.easing' property value must be a string");
                    if (!Object.prototype.hasOwnProperty.call(timing, value)) throw new Error("'animatedRectangle.config.easing' property value must be one of: " + Object.keys(timing).join(", "));
                    AReasing = value;
                }
            },
            duration: {
                set: function(value) {
                    validateNumber(value, "'animatedRectangle.config.duration' property value must be a number of milliseconds");
                    if (value > 0) {
                        ARduration = value;
                    } else {
                        ARduration = 0;
                    }
                }
            },
            clockWise: {
                set: function(value) {
                    validateBoolean(value, "'animatedRectangle.config.clockWise' property value must be a boolean");
                    ARclockWise = value;
                }
            },
            callback: {
                set: function(value) {
                    validateFunction(value, "'config.callback' property value must be a function");
                    callback = value;
                }
            }
        });
        Object.defineProperties(body, {
            config: { writable: false },
            draw: { writable: false },
            stop: { writable: false },
            destroy: { writable: false }
        })

        return body;
    };
    /*******************************************************************/

    /*********************************arc*******************************/
    //A progress ring: a background circle, an arc for the percentage and, optionally, the
    //percentage and a label in its centre. draw() paints it at once, or animates to the new value
    //from the last one drawn when config.duration is above 0.
    this.arc = function(){
        var start = 12, clockWise = true, progressLabel = true, showPercentage = true, progressBackground = "#ddd", strokeWidth = 10,
            strokeColor = "black", radius = "auto", lineCap = "butt", percentageFontColor = "black", percentageFont = null,
            labelFontColor = "#555", labelFont = null, duration = 0, easing = "linear", callback = null;
        var startAngles = {12: -0.5 * Math.PI, 3: 0, 6: 0.5 * Math.PI, 9: Math.PI};
        var target = null;     //the canvas last drawn on
        var shown = 0;         //the progress currently painted on it, where an animated draw() starts from
        var run = 0;           //bumped by draw(), stop() and destroy(); a frame from an older run exits

        function paint(canvasElement, progress, label) {
            var size = prepareCanvas(canvasElement);
            var ctx = size.context;
            var x = size.width / 2, y = size.height / 2;
            //"auto" fills the canvas; a number is kept, but never so large that the ring is cut off
            var fit = Math.max(1, Math.min(size.width, size.height) / 2 - strokeWidth / 2 - 1);
            var r = radius == "auto" ? fit : Math.min(radius, fit);

            ctx.clearRect(0, 0, size.width, size.height);
            //solid line: dashes left by a rectangle drawn on this canvas earlier do not carry over
            ctx.setLineDash([]);
            ctx.lineDashOffset = 0;
            ctx.lineWidth = strokeWidth;
            ctx.lineCap = lineCap;

            ctx.beginPath();
            ctx.strokeStyle = progressBackground;
            ctx.arc(x, y, r, 0, 2 * Math.PI, false);
            ctx.stroke();

            if (progress > 0) {
                var from = startAngles[start];
                var sweep = (Math.min(progress, 100) / 100) * 2 * Math.PI;
                ctx.beginPath();
                ctx.strokeStyle = strokeColor;
                ctx.arc(x, y, r, from, clockWise ? from + sweep : from - sweep, !clockWise);
                ctx.stroke();
            }

            var hasLabel = progressLabel && label != "";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            if (showPercentage) {
                ctx.font = percentageFont != null ? percentageFont : "600 " + Math.max(8, Math.round(r * 0.42)) + "px system-ui, sans-serif";
                ctx.fillStyle = percentageFontColor;
                ctx.fillText(Math.round(progress) + "%", x, hasLabel ? y - r * 0.12 : y);
            }
            if (hasLabel) {
                ctx.font = labelFont != null ? labelFont : Math.max(8, Math.round(r * 0.2)) + "px system-ui, sans-serif";
                ctx.fillStyle = labelFontColor;
                ctx.fillText(label, x, showPercentage ? y + r * 0.3 : y);
            }
            shown = progress;
        }

        var body = {
            config:{},
            draw: function(canvasElement, progress, label = ""){
                validateCanvas(canvasElement, "arc.draw() method argument 1 must be the canvas element to draw on");
                if (typeof progress != "number" || !isFinite(progress)) throw new Error("arc.draw() method argument 2 must be a number from 0 to 100");
                if (progress < 0 || progress > 100) throw new Error("arc.draw() method argument 2 must be between 0 - 100");
                validateString(label, "arc.draw() method argument 3 must be a string");

                run++;
                var token = run;
                var from = canvasElement == target ? shown : 0;   //a new canvas starts from empty
                target = canvasElement;

                if (duration <= 0 || from == progress) {
                    paint(canvasElement, progress, label);
                    if (callback != null) callback(progress);
                    return;
                }
                var began = Date.now();
                function frame() {
                    if (token != run) return;   //stopped, destroyed or replaced by a newer draw()
                    var tf = timeFraction(began, duration);
                    //easings that overshoot are kept inside 0-100, so the text never reads 108% or -3%
                    paint(canvasElement, Math.min(100, Math.max(0, from + (progress - from) * timing[easing](tf))), label);
                    if (tf < 1) {
                        requestAnimationFrame(frame);
                        return;
                    }
                    paint(canvasElement, progress, label);   //easings that overshoot still end exactly on the value
                    if (callback != null) callback(progress);
                }
                frame();   //the first frame is painted now, like animatedRectangle
            },
            stop: function() {
                //Leaves the current frame painted; the next animated draw() starts from it
                run++;
            },
            destroy: function() {
                run++;
                if (target != null) {
                    var ctx = target.getContext("2d");
                    ctx.setTransform(1, 0, 0, 1, 0, 0);
                    ctx.clearRect(0, 0, target.width, target.height);
                    target = null;
                }
                shown = 0;
            }
        }

        function colour(name, set) {
            return {
                set: function(value) {
                    validateString(value, "arc.config." + name + " property value must be a string of a valid CSS colour");
                    set(value);
                }
            };
        }
        function font(name, set) {
            return {
                set: function(value) {
                    //null or "" goes back to the default, which scales with the radius
                    if (value == null || value === "") { set(null); return; }
                    validateString(value, "arc.config." + name + " property value must be a string of a valid CSS font value, such as '600 24px system-ui'");
                    set(value);
                }
            };
        }
        function flag(name, set) {
            return {
                set: function(value) {
                    validateBoolean(value, "arc.config." + name + " property value must be a boolean");
                    set(value);
                }
            };
        }

        Object.defineProperties(body.config, {
            start:{
                set: function(value){
                    if (typeof value != "number" || startAngles[value] == undefined) throw new Error("arc.config.start property value must be 12, 3, 6 or 9: the clock position the arc starts from");
                    start = value;
                }
            },
            clockWise: flag("clockWise", function(v){ clockWise = v; }),
            progressLabel: flag("progressLabel", function(v){ progressLabel = v; }),
            showPercentage: flag("showPercentage", function(v){ showPercentage = v; }),
            progressBackground: colour("progressBackground", function(v){ progressBackground = v; }),
            strokeColor: colour("strokeColor", function(v){ strokeColor = v; }),
            percentageFontColor: colour("percentageFontColor", function(v){ percentageFontColor = v; }),
            labelFontColor: colour("labelFontColor", function(v){ labelFontColor = v; }),
            percentageFont: font("percentageFont", function(v){ percentageFont = v; }),
            labelFont: font("labelFont", function(v){ labelFont = v; }),
            strokeWidth:{
                set: function(value){
                    if (typeof value != "number" || !isFinite(value) || value <= 0) throw new Error("arc.config.strokeWidth property value must be a number of pixels above 0");
                    strokeWidth = value;
                }
            },
            radius:{
                set: function(value){
                    if (value === "auto") { radius = value; return; }
                    if (typeof value != "number" || !isFinite(value) || value <= 0) throw new Error("arc.config.radius property value must be 'auto' or a number of pixels above 0");
                    radius = value;
                }
            },
            lineCap:{
                set: function(value){
                    if (value != "butt" && value != "round") throw new Error("arc.config.lineCap property value must be 'butt' or 'round'");
                    lineCap = value;
                }
            },
            duration:{
                set: function(value){
                    validateNumber(value, "arc.config.duration property value must be a number of milliseconds");
                    duration = value > 0 ? value : 0;
                }
            },
            easing:{
                set: function(value){
                    validateString(value, "arc.config.easing property value must be a string");
                    if (!Object.prototype.hasOwnProperty.call(timing, value)) throw new Error("arc.config.easing property value must be one of: " + Object.keys(timing).join(", "));
                    easing = value;
                }
            },
            callback:{
                set: function(value){
                    validateFunction(value, "arc.config.callback property value must be a function");
                    callback = value;
                }
            }
        });
        Object.defineProperties(body, {
            config:{writable:false},
            draw:{writable:false},
            stop:{writable:false},
            destroy:{writable:false}
        });

        return body;
    }
    /*******************************************************************/
    Object.defineProperty(this, "animatedRectangle", { writable: false });
    Object.defineProperty(this, "fixedRectangle", { writable: false });
    Object.defineProperty(this, "arc", { writable: false });
}
/****************************************************************/
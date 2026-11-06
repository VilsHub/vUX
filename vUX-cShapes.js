/*
 * vUX JavaScript library v4.0.0
 * https://library.vilshub.net/lib/vUX/
 *
 *
 * Released under the MIT license
 * https://library.vilshub.net/lib/vUX/license
 *
 * Date: 2021-07-19=T22:30Z
 * 
 * 
 */
// Import vUX core
import "./src/vUX-core-4.0.0-beta.js";

/***********************Canvas Shapes**********************/
export function CShapes() {
    /*******************shared rectangle drawing********************/
    //Sizes the canvas backing store by devicePixelRatio and scales the context, so the line stays
    //sharp on high-density screens while every coordinate below stays in CSS pixels.
    function prepareCanvas(canvasElement) {
        var ratio = window.devicePixelRatio || 1;
        var width = canvasElement.clientWidth || canvasElement.scrollWidth;
        var height = canvasElement.clientHeight || canvasElement.scrollHeight;
        canvasElement.width = Math.round(width * ratio);
        canvasElement.height = Math.round(height * ratio);
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
                validateElement(canvasElement, "A valid HTML element needed as argument for 'draw()' method");
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
                    if (validateString(value)) {
                        FRlinecolor = value;
                    }
                }
            },
            lineWidth: {
                set: function(value) {
                    if (validateNumber(value)) {
                        if (value > 0) {
                            FRlinewidth = value;
                        } else {
                            FRlinewidth = 1;
                        }
                    }
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
                        throw new Error("Array members for 'segment' property value must all be positive integers");
                    }
                }
            },
            origin: {
                set: function(value) {
                    var temp = "fixedRectangle.config.origin property value must be an array";
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
                validateElement(canvasElement, "A valid HTML element needed as argument for 'draw()' method");
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
                    if (animationCount == "infinite" || cycle < animationCount) {
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
                    validateNumber(value);
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
                        throw new Error("Array members for 'segment' property value must all be positive integers");
                    }
                }
            },
            origin: {
                set: function(value) {
                    var temp = "animatedRectangle.config.origin property value must be an array";
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
                    validateString(value);
                    validateObjectMember(timing, value);
                    AReasing = value;
                }
            },
            duration: {
                set: function(value) {
                    validateNumber(value);
                    if (value > 0) {
                        ARduration = value;
                    } else {
                        ARduration = 0;
                    }
                }
            },
            clockWise: {
                set: function(value) {
                    validateBoolean(value);
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
    this.arc = function(){
        var canvasObj = canvasElement.getContext('2d'); //initialization
        var start =12,progressLabel = true, progressBackground	= "#ccc",strokeWidth	= 10, strokeColor	="yellow", radius	= 50, percentageFontColor	= "white",
        percentageFont = "normal normal 2.1vw Verdana", LabelFontColor = "white", LabelFont	= "normal normal .9vw Verdana";
        
        var body = {
            config:{},
            draw: function(progress, label){
                if (!validateInteger(progress)) throw new Error("circularProgress.draw() method argument 1 must be an integer");

                if(progress < 0 || progress >100) throw new Error("circularProgress.draw() method argument 1 must be between 0 - 100");
                

                validateString(label, "circularProgress.draw() method argument 2 must be a string");

                var startPoint = 0;
                var fprog = parseInt(progress);
                if(start == 12){
                    startPoint = -0.5*Math.PI;
                }else if(start == 3){
                    startPoint = 0*Math.PI;
                }else{
                    startPoint = 0*Math.PI;
                }

                var x = (50/100) * canvasElement.scrollWidth;
                var y = (50/100) * canvasElement.scrollHeight;
                if(progressLabel == true){
                    var fontY = (46/100) * canvasElement.scrollHeight;
                    var labelY = (55/100) * canvasElement.scrollHeight;
                }else{
                    var fontY = y;
                }

                //Draw
                canvasObj.clearRect(0,0, canvasElement.width, canvasElement.height);

                //Progress Background
                canvasObj.beginPath();
                canvasObj.lineWidth = strokeWidth;
                canvasObj.strokeStyle  = progressBackground;
                canvasObj.arc(x,y,radius,0,2*Math.PI, false);
                canvasObj.stroke();


                //Progress Text
                canvasObj.textAlign = "center";
                canvasObj.textBaseline = "middle";
                canvasObj.font = percentageFont;
                canvasObj.fillStyle = percentageFontColor;
                canvasObj.fillText(fprog+"%", x, fontY);
                if(progressLabel == true){ //label
                    canvasObj.font = LabelFont;
                    canvasObj.fillStyle = LabelFontColor;
                    canvasObj.fillText(label, x, labelY);
                }

                //Progress point
                canvasObj.beginPath();
                canvasObj.lineWidth = strokeWidth;
                canvasObj.strokeStyle  =strokeColor;
                canvasObj.arc(x,y,radius,startPoint,percentageToAngle(progress, start), false);
                canvasObj.stroke();
            }
        }

        Object.defineProperties(body, {
            config:{writable:false},
            show:{writable:false}
        });
        Object.defineProperties(body.config, {
            start:{
                set: function(value){
                    if(validateNumber(value, "'start' property value must be numeric")){
                        start = value;
                    }
                }
            },
            progressLabel:{
                set: function(value){
                    if(validateBoolean(value, "'progressLabel' property value must be boolean")){
                        progressLabel = value;
                    }
                }
            },
            progressBackground:{
                set: function(value){
                    if(validateString(value, "'progressBackground' property value must be string of valid CSS color")){
                        progressBackground = value;
                    }
                }
            },
            strokeWidth:{
                set: function(value){
                    validateNumber(value, "'strokeWidth' property value must be numeric");
                    if(!validateInteger(value)) throw new Error ("'strokeWidth' property value must be integer");		strokeWidth = value;
                }
            },
            strokeColor:{
                set: function(value){
                    if(validateString(value, "'strokeColor' property value must be string of valid CSS color")){
                        strokeColor = value;
                    }
                }
            },
            radius:{
                set: function(value){
                    if(validateNumber(value, "'radius' property value must be numeric")){
                        if(!validateInteger(value)) throw new Error ("'radius' property value must be integer");
                        radius = value;
                    }
                }
            },
            percentageFontColor:{
                set: function(value){
                    if(validateString(value, "'percentageFontColor' property value must be string of valid CSS color")){
                        percentageFontColor = value;
                    }
                }
            },
            percentageFont:{
                set: function(value){
                    validateString(value, "'percentageFont' property value must be string of valid CSS font property value");
                    percentageFont = value;
                }
            },
            labelFontColor:{
                set: function(value){
                    validateString(value, "'labelFontColor' property value must be string of valid CSS color");
                    LabelFontColor = value;
                }
            },
            labelFont:{
                    set: function(value){
                        if(validateString(value, "'labelFont' property value must be string of valid CSS font property value")){
                            LabelFont = value;
                        }
                    }
                }
        })
    }
     /*******************************************************************/
    Object.defineProperty(this, "animatedRectangle", { writable: false });
    Object.defineProperty(this, "fixedRectangle", { writable: false });
}
/****************************************************************/
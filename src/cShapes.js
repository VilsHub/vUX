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


/***********************Canvas Shapes**********************/
function CShapes() {
    /*******************fixed dashed rectangle starts********************/
    this.fixedRectangle = function() {
        var FRlinecolor = "black", FRlinewidth = 5,FRsegment = [10, 2],FROrigin = [0, 0];
        var body = {
            config: {},
            draw: function(canvasElement) {
                validateElement(canvasElement, "A valid HTML element needed as argument for 'draw()' method");
                canvasElement.width = canvasElement.scrollWidth;
                canvasElement.height = canvasElement.scrollHeight;
                var canObj = canvasElement.getContext("2d");

                //Segment
                canObj.setLineDash(FRsegment);

                //lineColor
                canObj.strokeStyle = FRlinecolor;

                //lineWidth
                canObj.lineWidth = FRlinewidth;

                //origin
                var xOrigin = FROrigin[0];
                var yOrigin = FROrigin[1]
                canObj.clearRect(xOrigin, yOrigin, canvasElement.width, canvasElement.height);
                canObj.rect(xOrigin, yOrigin, canvasElement.width, canvasElement.height);
                canObj.stroke();
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
        var ARlinecolor = "black",ARlinewidth = 5,ARsegment = [10, 2],AROrigin = [0, 0],ARclockWise = true,ARduration = 3000,AReasing = "linear",ARactive = "",ARstop = 0,animationCount = 1,cycle = 0,fn = null;

        var body = {
            config: {},
            draw: function(canvasElement) {
                validateElement(canvasElement, "A valid HTML element needed as argument for 'draw()' method");
                if (canvasElement.getAttribute("id") == null) {
                    throw new Error("Canvas element must have an ID set");
                }
                //Set ID
                ARactive = canvasElement.id;
                ARstop = 0;

                //Reset canvas size
                canvasElement.width = canvasElement.scrollWidth;
                canvasElement.height = canvasElement.scrollHeight;
                var canObj = canvasElement.getContext("2d");

                //Segment
                canObj.setLineDash(ARsegment);

                //lineColor
                canObj.strokeStyle = ARlinecolor;

                //lineWidth
                canObj.lineWidth = ARlinewidth;

                //origin
                var xOrigin = AROrigin[0];
                var yOrigin = AROrigin[1];

                //easing
                var easing = AReasing;

                //duration
                var duration = ARduration;

                //direction
                var direction = ARclockWise; //clockwise

                var animationStart = Date.now();
                requestAnimationFrame(function animate() {
                    var tf = timeFraction(animationStart, duration);
                    var progress = timing[easing](tf);

                    if (direction == true) { //clockwise
                        canObj.lineDashOffset = -1 * (progress * 100);
                    } else { //anti clockwise
                        canObj.lineDashOffset = progress * 100;
                    }
                    canObj.clearRect(xOrigin, yOrigin, canvasElement.width, canvasElement.height);
                    canObj.rect(xOrigin, yOrigin, canvasElement.width, canvasElement.height);
                    canObj.stroke();
                    if (ARstop == 0 && ARactive == canvasElement.id && progress < 1) {
                        requestAnimationFrame(animate);
                    } else if (progress == 1) {
                        fn != null ? fn() : null;
                        if (animationCount != "infinite") {
                            cycle++;
                            if (cycle < animationCount) {
                                body.draw(canvasElement);
                            } else {
                                cycle = 0
                            }
                        } else {
                            body.draw(canvasElement);
                        }
                    }
                })
            },
            stop: function() {
                ARstop = 1;
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
                            if (!validateinteger(value)) throw new Error("'iterationCount' property numeric value must be an integer")
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
            easing: {
                set: function(value) {
                    if (validateString(value)) {
                        if (validateObjectMember(timing, value)) {
                            AReasing = value;
                        }
                    }
                }
            },
            duration: {
                set: function(value) {
                    if (validateNumber(value)) {
                        if (value > 0) {
                            ARduration = value;
                        } else {
                            ARduration = 0;
                        }
                    }
                }
            },
            clockWise: {
                set: function(value) {
                    if (validateBoolean(value)) {
                        ARclockWise = value;
                    }
                }
            },
            fn: {
                set: function(value) {
                    if (validateFunction(value, "'config.fn' property value must be a function")) {
                        fn = value;
                    }
                }
            }
        });
        Object.defineProperties(body, {
            config: { writable: false },
            draw: { writable: false },
            stop: { writable: false }
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
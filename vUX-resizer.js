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
import "./src/vUX-core-4.0.0.beta.js";

/***************************Resizer*****************************/
export function Resizer(elementSelector){
    validateString(elementSelector, "Resizer() constructor argument must be a string of target element selector");
    var pin=false, self=this, myResizeHandler=null, targetDirection=null, targetElementWidth=0,targetElementHeight=0,targetElement=$$.ss(elementSelector);
    var resizeHandlerProperties = {
            parent:null,
            styles:{
                x:"",
                y:"",
                both:""
            },
            position:{
                x:"right",
                y:"bottom"
            },
            direction:"x"
    }
    var thresholdValues = {
        minHeight:0,
        minWidth:0,
        maxHeight:0,
        maxWidth:0
    }
    function resize(e){
        if(pin){
            if(targetDirection == "x"){
                var newWidth = targetElementWidth + (e.clientX - targetElementWidth);
                var maxWidth = thresholdValues.maxWidth;
                var minWidth = thresholdValues.minWidth;
                if(maxWidth != 0){
                    newWidth = newWidth > maxWidth? maxWidth:newWidth;
                }
                if(minWidth != 0){
                    newWidth = newWidth < minWidth? minWidth:newWidth;
                }
                
                targetElement.style["width"] = newWidth+"px";
                targetElementWidth = newWidth;
            }else{
                var newHeight = targetElementHeight + (e.clientY - targetElementHeight);
                var maxHeight = thresholdValues.maxHeight;
                var minHeight = thresholdValues.minHeight;
                if(maxHeight != 0){
                    newHeight = newHeight > maxHeight? maxHeight:newHeight;
                }
                if(minHeight != 0){
                    newHeight = newHeight < minHeight? minHeight:newHeight;
                }
                
                targetElement.style["height"] = newHeight+"px";
                targetElementHeight = newHeight;
            }
            
            if(callBack != null) callBack(self);
        }
    }
    function addEventHanler(){
        if(myResizeHandler == null){
            if(resizeHandlerProperties.parent == null) throw new Error("Specify the resizeHandler parent using 'resizerObj.config.resizeHandlerProperties' property or you specify your resizeHanler using 'resizerObj.config.myResizeHandler' property");
            createResizeHandler(resizeHandlerProperties.parent);
        }
        $$.attachEventHandler("mousedown", "resizeHandle", pinPoint);
        addEventListener("mouseup", unPin);
        addEventListener("mousemove", resize);
    }
    function pinPoint(e){
        if(!pin){
            targetElementleWidth = parseInt($$.sm(targetElement).cssStyle("width"));
            targetElementleHeight = parseInt($$.sm(targetElement).cssStyle("height"));
            e.target.classList.toggle("on");
            if(e.target.classList.contains("x")){
                targetDirection = "x";
            }else{
                targetDirection = "y";
            }
            targetDirection
            pin=true;
        }
    }
    function unPin(){
        if(pin){
            pin=false;
            $$.ss(".resizeHandle").classList.toggle("on");
        }
    }
    function createResizeHandler(parent){
        if (!$$.sm(parent).isPositioned()) parent.style["position"] = "relative";
        var direction = resizeHandlerProperties.direction;
        var xPosition = resizeHandlerProperties.position.x;
        var yPosition = resizeHandlerProperties.position.y;
        var xhandler  = null;
        var yhandler  = null;
        var xStyle    = resizeHandlerProperties.styles.x;
        var yStyle    = resizeHandlerProperties.styles.y;

        if(direction == "both"){
            xhandler = $$.ce("DIV", {class: "resizeHandle x "+xPosition});
            yhandler = $$.ce("DIV", {class: "resizeHandle y "+yPosition});
        }else{
            if(direction == "x"){
                xhandler = $$.ce("DIV", {class: "resizeHandle x "+xPosition});
            }else{
                yhandler = $$.ce("DIV", {class: "resizeHandle y "+yPosition});
            }
        }

        if(xhandler != null){
            var css = ".resizeHandle:hover{"+xStyle+"}";
            css += ".resizeHandle.on{"+xStyle+"}";
            if(xStyle != "") attachStyleSheet("xResizehandler", css);
            parent.appendChild(xhandler);
        }

        if(yhandler != null){
            var css = ".resizeHandle:hover{"+yStyle+"}";
            css += ".resizeHandle.on{"+yStyle+"}";
            if(yhandler != "") attachStyleSheet("yResizehandler", css);
            parent.appendChild(yhandler);
        }
    }
    this.initialize = function(){
        addEventHanler();
    }
    this.config = {

    }
    Object.defineProperties(this, {
        resizedWidth:{
            get:function(){
                return targetElementWidth;
            }
        },
        resizedHeight:{
            get:function(){
                return targetElementHeight;
            }
        }
    })
    Object.defineProperties(this.config, {
        thresholdValues:{
            set: function(value) {
                validateObjectLiteral(value, "resizerObj.config.thresholdValues property value must be an object literal");
                var validKeys = Object.keys(thresholdValues);
                var sourceEntries = Object.entries(value);
                var totalSourceEntries = sourceEntries.length;

                if(totalSourceEntries > 4) throw new Error("resizerObj.config.thresholdValues keys must not be more than 4 entries, here are the available keys to set: "+ validKeys.join(", "));

                sourceEntries.forEach(function(key){
                    if(validKeys.indexOf(key[0]) == -1) throw new Error("resizerObj.config.thresholdValues keys must be one of the followings: "+ validKeys.join(", ") + " '"+key[0] + "' is not one of them");
                    validateNumber(key[1], "resizerObj.config.thresholdValues."+key[0]+" property must be a number;")
                    if (key[1] < 0) key[1] = 0;
                    thresholdValues[key[0]] = key[1];
                });
            }
        },
        myResizeHandler:{
            set: function(value) {
                validateString(value, "resizerObj.config.myResizeHandler property value must be a string");
                myResizeHandler = value;
            }
        },
        resizeHandlerProperties:{
            set: function(value) {
                validateObjectLiteral(value, "resizerObj.config.resizeHandlerProperties property must be an object literal");
                var validKeys = Object.keys(resizeHandlerProperties);
                var targetConfig = Object.entries(value);
                var totalTargetKeys = targetConfig[0].length;
                var validPositions = {
                    x:["left", "right"],
                    y:["top", "bottom"]
                }
                
                if(totalTargetKeys > 4 || totalTargetKeys == 0) throw new Error("resizerObj.config.resizeHandlerProperties keys must be at least 1 but not more than 4, here are the available keys to set: "+ validKeys.join(", "));
                
                targetConfig.forEach(function (config){
                    config[0] != config[0].toLowerCase();
                    if(config[0] == "styles"){
                        validateObjectLiteral(config[1], "resizerObj.config.resizeHandlerProperties.position property must be an object literal");
                        var target = Object.entries(config[1]);
                        var totalPositionKeys = target.length;
                        if(totalPositionKeys > 3 ) throw new Error ("resizerObj.config.resizeHandlerProperties.position keys must not be more than 3");

                        target.forEach(function (element){
                            element[0] = element[0].toLowerCase();
                            if (element[0] != "x" && element[0] != "y" && element[0] != "both") throw new Error ("resizerObj.config.resizeHandlerProperties.position keys can either be 'x', 'y' or 'both'");
                            validateString(element[1], "resizerObj.config.resizeHandlerProperties.position."+element[0]+" property value must be a string");
                            resizeHandlerProperties.styles[element[0]] = element[1];
                        });
                    }else if(config[0] == "position"){
                        validateObjectLiteral(config[1], "resizerObj.config.resizeHandlerProperties.position property must be an object literal");
                        var target = Object.entries(config[1]);
                        var totalPositionKeys = target.length;
                        if(totalPositionKeys > 2 ) throw new Error ("resizerObj.config.resizeHandlerProperties.position keys must not be more than 2");
                        target.forEach(function (element){
                            element[0] = element[0].toLowerCase();
                            if (element[0] != "x" && element[0] != "y") throw new Error ("resizerObj.config.resizeHandlerProperties.position keys can either be 'x' or 'y'");
                            
                            if(element[0] == "x"){
                                if (validPositions.x.indexOf(element[1]) == -1) throw new Error("resizerObj.config.resizeHandlerProperties.position.x value must either ber 'left' or 'right'");
                            }else{
                                if (validPositions.y.indexOf(element[1]) == -1) throw new Error("resizerObj.config.resizeHandlerProperties.position.y value must either ber 'top' or 'bottom'");
                            }
                            
                            resizeHandlerProperties.position[element[0]] = element[1];
                        });
                    }else if(config[0] == "parent"){
                        validateElement(config[1], "resizerObj.config.resizeHandlerProperties.parent property value must be a valid HTML Element");
                        resizeHandlerProperties[config[0]] = config[1];
                    }else if(config[0] == "direction"){
                        validateString(config[1],"resizerObj.config.resizeHandlerProperties.direction property value must be a string");
                        config[1] = config[1].toLowerCase();
                        if (config[1] != "x" && config[1] != "y" && config[1] != "both") throw new Error("resizerObj.config.resizeHandlerProperties.direction property value must be a string of either 'x', 'y' or 'both'");
                        resizeHandlerProperties[config[0]] = config[1];
                    }
                });
            }
        },
        callBack:{
            set:function(value){
                validateFunction(value, "resizerObj.config.callBack property must be a function");
                callBack = value;
            }
        }
    })
}
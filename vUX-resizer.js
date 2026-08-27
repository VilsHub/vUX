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

/***************************Resizer*****************************/
export function Resizer(elementSelector){
    validateString(elementSelector, "Resizer() constructor argument must be a string of target element selector");
    var pin=false, self=this, initialized=false, myResizeHandler=null, callBack=null, handlerClass="resizeHandle";
    var targetDirection=null, targetEdge=null, activeHandle=null, createdHandlers=[];
    var targetElementWidth=0, targetElementHeight=0, targetElement=null;
    //Drag origin: the pointer position and the element size at the moment the handle was grabbed.
    //Every mousemove is measured against these, so the box grows by how far the pointer travelled
    //rather than jumping to wherever the pointer happens to be.
    var startPointerX=0, startPointerY=0, startWidth=0, startHeight=0;
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
    async function addVitalStyles() {
        try {
            var path = await processAssetPath();

            if (!(path instanceof Error)){
                vModel.core.functions.linkStyleSheet(path+"css/resizer.css", "resizer");
            }else{
                throw new Error(path)
            }

        } catch (error) {
            console.error(error)
        }
    }
    function resize(e){
        if(pin){
            if(targetDirection == "x"){
                //A handle sitting on the left edge grows the element when the pointer moves left,
                //so the travelled distance is inverted for that edge.
                var delta = (targetEdge == "left")? (startPointerX - e.clientX) : (e.clientX - startPointerX);
                var newWidth = startWidth + delta;
                var maxWidth = thresholdValues.maxWidth;
                var minWidth = thresholdValues.minWidth;
                if(maxWidth != 0){
                    newWidth = newWidth > maxWidth? maxWidth:newWidth;
                }
                if(minWidth != 0){
                    newWidth = newWidth < minWidth? minWidth:newWidth;
                }
                if(newWidth < 0) newWidth = 0;

                targetElement.style["width"] = newWidth+"px";
                targetElementWidth = newWidth;
            }else{
                var delta = (targetEdge == "top")? (startPointerY - e.clientY) : (e.clientY - startPointerY);
                var newHeight = startHeight + delta;
                var maxHeight = thresholdValues.maxHeight;
                var minHeight = thresholdValues.minHeight;
                if(maxHeight != 0){
                    newHeight = newHeight > maxHeight? maxHeight:newHeight;
                }
                if(minHeight != 0){
                    newHeight = newHeight < minHeight? minHeight:newHeight;
                }
                if(newHeight < 0) newHeight = 0;

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
        //Bound as named listeners rather than through $$.attachEventHandler() so that destroy()
        //can detach them again, and so that a mousedown landing on a child of the handle still counts.
        document.addEventListener("mousedown", pinPoint);
        document.addEventListener("mouseup", unPin);
        document.addEventListener("mousemove", resize);
    }
    function resolveHandler(node){
        if(node == null || node.classList == null) return null;
        if(node.classList.contains(handlerClass)) return node;
        return (typeof node.closest == "function")? node.closest("."+handlerClass) : null;
    }
    function resolveDirection(handler){
        if(handler.classList.contains("x")) return "x";
        if(handler.classList.contains("y")) return "y";
        //A consumer-supplied handler need not carry the axis marker class as long as the
        //configured direction leaves only one possibility.
        if(resizeHandlerProperties.direction != "both") return resizeHandlerProperties.direction;
        throw new Error("Resizer cannot tell which axis the handler resizes, give the handler element an 'x' or a 'y' class, or set 'resizerObj.config.resizeHandlerProperties.direction' to 'x' or 'y'");
    }
    function resolveEdge(handler, direction){
        var edges = (direction == "x")? ["left", "right"] : ["top", "bottom"];
        if(handler.classList.contains(edges[0])) return edges[0];
        if(handler.classList.contains(edges[1])) return edges[1];
        return resizeHandlerProperties.position[direction];
    }
    function pinPoint(e){
        if(!pin){
            var handler = resolveHandler(e.target);
            if(handler == null) return;
            e.preventDefault(); //keeps the drag from turning into a text selection
            targetDirection = resolveDirection(handler);
            targetEdge = resolveEdge(handler, targetDirection);
            startWidth = parseInt($$.sm(targetElement).cssStyle("width"));
            startHeight = parseInt($$.sm(targetElement).cssStyle("height"));
            //A computed size of "auto" parses to NaN, fall back to the rendered box.
            if(isNaN(startWidth)) startWidth = targetElement.offsetWidth;
            if(isNaN(startHeight)) startHeight = targetElement.offsetHeight;
            targetElementWidth = startWidth;
            targetElementHeight = startHeight;
            startPointerX = e.clientX;
            startPointerY = e.clientY;
            activeHandle = handler;
            handler.classList.add("on");
            pin=true;
        }
    }
    function unPin(){
        if(pin){
            pin=false;
            //Clear the handler that was actually grabbed, not simply the first one in the document.
            if(activeHandle != null) activeHandle.classList.remove("on");
            activeHandle=null;
        }
    }
    function buildHandler(parent, axis, position, style){
        var handler = $$.ce("DIV", {class: handlerClass+" "+axis+" "+position});
        if(style != ""){
            //Scoped to the axis, otherwise the x and y rules overwrite one another.
            var selector = "."+handlerClass+"."+axis;
            var css = selector+":hover{"+style+"}";
            css += selector+".on{"+style+"}";
            //Replaced rather than appended: attachStyleSheet() appends unconditionally, so a
            //Resizer torn down and rebuilt would leave a dead <style> behind on every cycle.
            var previous = $$.ss("style[data-id='"+axis+"Resizehandler']");
            if(previous != null && previous.parentNode != null) previous.parentNode.removeChild(previous);
            attachStyleSheet(axis+"Resizehandler", css);
        }
        parent.appendChild(handler);
        createdHandlers.push(handler);
    }
    function createResizeHandler(parent){
        if (!$$.sm(parent).isPositioned()) parent.style["position"] = "relative";
        var direction = resizeHandlerProperties.direction;
        var styles    = resizeHandlerProperties.styles;

        if(direction == "x" || direction == "both"){
            buildHandler(parent, "x", resizeHandlerProperties.position.x, (styles.x != "")? styles.x : styles.both);
        }
        if(direction == "y" || direction == "both"){
            buildHandler(parent, "y", resizeHandlerProperties.position.y, (styles.y != "")? styles.y : styles.both);
        }
    }
    this.initialize = function(){
        if(initialized) return;
        //Resolved here rather than in the constructor so a target added to the DOM after
        //construction still works, and so a missing target reports itself instead of failing later.
        targetElement = $$.ss(elementSelector);
        validateElement(targetElement, "Resizer() found no element matching the selector '"+elementSelector+"'");
        addVitalStyles();
        addEventHanler();
        initialized = true;
    }
    this.destroy = function(){
        if(!initialized) return;
        unPin();
        document.removeEventListener("mousedown", pinPoint);
        document.removeEventListener("mouseup", unPin);
        document.removeEventListener("mousemove", resize);
        for(var i=0; i<createdHandlers.length; i++){
            if(createdHandlers[i].parentNode != null) createdHandlers[i].parentNode.removeChild(createdHandlers[i]);
        }
        createdHandlers = [];
        initialized = false;
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
                //The consumer names their own handler class, drop a leading dot so both
                //"handle" and ".handle" are accepted.
                handlerClass = value.replace(/^\./, "");
            }
        },
        resizeHandlerProperties:{
            set: function(value) {
                validateObjectLiteral(value, "resizerObj.config.resizeHandlerProperties property must be an object literal");
                var validKeys = Object.keys(resizeHandlerProperties);
                var targetConfig = Object.entries(value);
                var totalTargetKeys = targetConfig.length;
                var validPositions = {
                    x:["left", "right"],
                    y:["top", "bottom"]
                }
                
                if(totalTargetKeys > 4 || totalTargetKeys == 0) throw new Error("resizerObj.config.resizeHandlerProperties keys must be at least 1 but not more than 4, here are the available keys to set: "+ validKeys.join(", "));
                
                targetConfig.forEach(function (config){
                    config[0] = config[0].toLowerCase();
                    if(config[0] == "styles"){
                        validateObjectLiteral(config[1], "resizerObj.config.resizeHandlerProperties.styles property must be an object literal");
                        var target = Object.entries(config[1]);
                        var totalStyleKeys = target.length;
                        if(totalStyleKeys > 3 ) throw new Error ("resizerObj.config.resizeHandlerProperties.styles keys must not be more than 3");

                        target.forEach(function (element){
                            element[0] = element[0].toLowerCase();
                            if (element[0] != "x" && element[0] != "y" && element[0] != "both") throw new Error ("resizerObj.config.resizeHandlerProperties.styles keys can either be 'x', 'y' or 'both'");
                            validateString(element[1], "resizerObj.config.resizeHandlerProperties.styles."+element[0]+" property value must be a string");
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
                    }else{
                        throw new Error("resizerObj.config.resizeHandlerProperties keys must be one of the followings: "+ validKeys.join(", ") + " '"+config[0] + "' is not one of them");
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

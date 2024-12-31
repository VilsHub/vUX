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
import { validateBoolean, validateFunction, validateString } from "./src/helpers.js";
import "./src/vUX-core-4.0.0-beta.js";

/***************************Touch handler*****************************/
export function DOMDrawer() {
    let drawOrigin = {x:0,y:0, xBar:0, yBar:0}, mousePointOrigin = {x:0,y:0}, className="", canvas=null, clicked=false;

    var styles = {
        dom:""
    }

    var callbacks = {
        postDraw:null
    }

    var states = {
        drawing:false,
        clicked:false,
        enabled:false
    }

    this.initialize = function(){
        if (className == "" ) throw new Error("DOMDrawerObj.config.className property must be set");

        addStyleSheet();
        addEventHanler();
    }

    this.config = {}

    Object.defineProperties(this.config, {
        className:{ //Sets the class name to be used to set which element could be drawn over
            set: function(value) {
                validateString(value, "DOMDrawerObj.config.className property value must be a string");
                className = value;
            }
        },
        styles:{
            set: function(value) {
                
                var validOptions = Object.keys(styles);
                validateObjectLiteral(value, "'config.dataAttributeNames' property value must be an object");
                var entries = Object.entries(value);

                if(entries.length <= 1){
                    entries.forEach(function(entry){
                        if(validOptions.indexOf(entry[0]) == -1) throw new Error("The style '"+ entry[0] +"' specified is not supported, the suported specifiers are: "+ validOptions.join(", "));

             
                        //Validate rest of string values
                        validateString(entry[1], "config.styles."+entry[0]+"' value must be a string of valid CSS. The supplied value '"+entry[1]+"' is not a string");
                        

                        styles[entry[0]] = entry[1];
                    });
                }else{
                    throw new Error("'config.styles' object value contains more than 1 entries");
                }
            }
        },
        callbacks:{
            set: function(value) {
                
                var validOptions = Object.keys(callbacks);
                validateObjectLiteral(value, "'config.callbacks' property value must be an object");
                var entries = Object.entries(value);

                if(entries.length <= 1){
                    entries.forEach(function(entry){
                        if(validOptions.indexOf(entry[0]) == -1) throw new Error("The style '"+ entry[0] +"' specified is not supported, the suported specifiers are: "+ validOptions.join(", "));

             
                        //Validate funtions
                        validateFunction(entry[1], "config.callbacks."+entry[0]+"' value must be a function. The supplied value '"+entry[1]+"' is not a function");
                        

                        callbacks[entry[0]] = entry[1];
                    });
                }else{
                    throw new Error("'config.callbacks' object value contains more than 1 entries");
                }

            }
        }

    })

    Object.defineProperties(this, {
        getDrawnPoints: {
            get: function (){
                return 
            }
        },
        enabled: {
            set: function(value) {
                validateBoolean(value, "'config.enabled' property expects a booleean value");

                if(value){
                    enableDrawing();
                }else{
                    disableDrawing();
                }

                states.enabled = value;
            }
        }
    })

    function addEventHanler(){
   
        $$.attachEventHandler("mousedown", className, pinPoint);
        $$.attachEventHandler("mousemove", [className, "dItem"], draw);
        document.addEventListener("mouseup", release, false);

    }

    function pinPoint(e){
        if (states.enabled){
            let points = getPoints(e);
            canvas = e.target;
            drawOrigin.x = points.x;
            drawOrigin.y = points.y; 
            drawOrigin.xBar = points.xBar; 
            drawOrigin.yBar = points.yBar; 
    
            canvas.classList.add("draw-mode", "d-mode");
            states.clicked = true;
            addItem(points);
        }
    }

    function draw(e){
        if (states.enabled && states.clicked){
            states.drawing = true;
            let item = canvas.querySelector(".dItem");
            let movedPoints = getMovedPoints(e);
            let x = movedPoints.x < 0? (-1 * movedPoints.x):movedPoints.x;
            let y = movedPoints.y < 0? (-1 * movedPoints.y):movedPoints.y;
            
            //set origin
            //Y-AXIS
            if (movedPoints.y <= 0){ //draw upward
                item.style["bottom"] = drawOrigin.yBar+"px";
                item.style["top"] = "auto";
            }else if(movedPoints.y > 0){// draw downward
                item.style["top"] = drawOrigin.y+"px";
                item.style["bottom"] = "auto";
            }
            
            //X-AXIS
            if (movedPoints.x <= 0){ //draw leftward
                item.style["right"] = drawOrigin.xBar+"px";
                item.style["left"] = "auto";
            }else if (movedPoints.x > 0){ //draw rightward
                item.style["left"] = drawOrigin.x+"px";
                item.style["right"] = "auto";
            }
            

            //Draw
            item.style.width = `${x}px`;
            item.style.height = `${y}px`;
        }
    }

    function release(){

        if (states.drawing){
            disableDrawing();
            states.clicked = false;
            states.drawing = false;

            //execute callback
            if (callbacks.postDraw != null) callbacks.postDraw();
        }
    }

    function enableDrawing(){
        var drawnElement = $$.ss(".v"+className);

        if(drawnElement != null){
        //     get parent
            var canvas = drawnElement.parentNode;
            canvas.classList.add("drw-mode");
        }
    }

    function disableDrawing(){
        var drawnElement = $$.ss(".v"+className);

        if(drawnElement != null){
            //get parent
            var canvas = drawnElement.parentNode;
            canvas.classList.remove("drw-mode");
        }
    }

    function getPoints(e){
        let cardGeoPoints = $$.ss("."+className).getBoundingClientRect(), borderSize=1;
        let mouseX = e.clientX;
        let mouseY = e.clientY;
        
        mousePointOrigin.x = mouseX;
        mousePointOrigin.y = mouseY;

        let startX = mouseX - cardGeoPoints.x - borderSize;
        let startY = mouseY - cardGeoPoints.y - borderSize;

        startX = startX < 0 ? 0 : startX;
        startY = startY < 0 ? 0 : startY;

        return {x:startX, y:startY, xBar:(cardGeoPoints.width - startX), yBar:(cardGeoPoints.height - startY)}
    }

    function getMovedPoints(e){
        let moveX = e.clientX - mousePointOrigin.x;
        let moveY = e.clientY - mousePointOrigin.y;

        return {x:moveX, y:moveY}
    }

    function addItem(points, shape="square"){

        let itemExist = canvas.querySelector(".dItem");
        if(itemExist == null){
            let item = $$.ce("DIV", {class: "dItem "+shape+ " v"+className, style: `left: ${points.x}px; top: ${points.y}px`});
            canvas.classList.add("dItem-Area");
            canvas.appendChild(item);
        }
        
    }

    async function addStyleSheet() {

        try {
            var path = await processAssetPath();

            if (!(path instanceof Error)){
                vModel.core.functions.linkStyleSheet(path+"css/domDrawer.css", "domDrawer");

                if (styles.dom != "") {

                    if ($$.ss("style[data-id='v" + className + "']") == null) {
      
                        var css = "";
                        css += ".v" + className + "{ "+styles.dom+" }";
                        attachStyleSheet("v" + className, css);
                    }

                }
            }else{
                throw new Error(path)
            }
           
        } catch (error) {
            console.error(error)
        }
    }

}
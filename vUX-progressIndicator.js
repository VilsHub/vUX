/*
 * vUX JavaScript library v4.0.0
 * https://library.vilshub.com/lib/vUX/
 *
 *
 * Released under the MIT license
 * https://library.vilshub.com/lib/vUX/license
 *
 * Date: 2022-05-17=T09:20Z
 * 
 * 
 */
// Import vUX core
import { validateNumber, validateString } from "./src/helpers.js";
import "./src/vUX-core-4.0.0-beta.js";

/***************************progress Indicator*****************************/
export function ProgressIndicator(defaultProgressSpace=null) {
    let progressSpeed=1.8,progressType="linear", initialized=false,cShapes=null,gbr,cShapesObj;
    let network         = "online";
    let smallIncrement  = null;
    let dataAttributes = {
        progressSpaceId:""// The data attribute to hold the ID of the element on which progress should show on. the data attribute value can be the ID of the target element or 'self' refering to it self. If this attribute takes mor priority than the default progress space element
    };
    let progressStyle = {
        linear:{
            trackColor:"#ccc", //valid css color
            progressColor:"purple", //valid css color
            location:"top", // top | center | bottom | offset eg. : top:44px
            style:3 // the linear progress type: 1, 2, or 3
        },
        circular:{
            icon:"",
            overlay:"",
            labelContent:"",
            labelStyle:""
        },
        grid:{
            gridGab:5,
			gridColor:"red"
        },
        custom:"" //CSS style for custom progress indicator type
    }
    this.showProgress = function (element){
        if (!initialized) throw new Error("Please initialize using the 'initialize()' method, before trying to show progress");
        validateElement(element, "progressIndicatorObj.showProgress(x) argument 1 must be a valid HTML element");
        showLoader(element);
    },

    this.hideProgress = function (element){
        let targetSpace = getProgressSpaceElement(element).querySelector(".vProgressItem");

        if(progressType == "linear"){
            if(progressStyle.linear.style == 3){
                clearInterval(tinyIncrement);
                let progress = targetSpace.querySelector(".progress");
                progress.classList.add("completed");
                progress.classList.remove("halted", "tiny", "slow");
                progress.style.transitionDuration = ".2s";
                progress.style.width = "100%" 
            }
            targetSpace.classList.add("done");
        }else{//others
            if(targetSpace != null) targetSpace.classList.add("done");
            if(progressType == "grid") gbr.stop();
        }
    }

    this.initialize = function (){
        if(!initialized){
            addEvents();
            addVitalStyles();
            initialized = true;
        }
    }

    this.config = {}

    async function addVitalStyles(){
        try {
            var path = await processAssetPath();

            if (!(path instanceof Error)){
                vModel.core.functions.linkStyleSheet(path+"css/progressIndicator.css", "progressIndicator");
            }else{
                throw new Error(path)
            }
           
        } catch (error) {
            console.error(error)
        }
       
        if(progressType != "linear"){
            if(progressStyle.circular.icon.length > 0) {
                let css = `.vProgressItem .spinner::before{${progressStyle.circular.icon}}`;
                attachStyleSheet(dataAttributes["progressSpaceId"], css);
            }
        }
    }

    function buildProgressBlock(element){
        let targetSpace = getProgressSpaceElement(element);
        setTemplate(targetSpace).then(animationController);
    }
    
    function addEvents(){
        addEventListener("online", function(){
            network = true;
        })

        addEventListener("offline", function(){
            network = false;
        })

        addEventListener("transitionend", function(e){
            if(e.target.classList.contains("style3")){
                if(!e.target.classList.contains("slow") && !e.target.classList.contains("halted")){
                    if(!e.target.classList.contains("completed")) slowMo();
                }
                if(e.target.classList.contains("slow")){
                    e.target.classList.add("halted", "tiny"); 
                    tinyIncrement();
                }
                if(e.target.classList.contains("completed")){
                    e.target.parentNode.parentNode.classList.add("done");
                    e.target.classList.remove("completed")
                }
            }
        }, false)
    }

    function showLoader(element){
        buildProgressBlock(element);
    }

    function animationController(){
        if(progressType == "linear" && progressStyle.linear.style == 3){
            let element = $$.ss(".vProgressItem .style3");
            element.style.width = "57%";
        }else if(progressType == "grid"){
            let TargetCanvas = $$.ss(".vProgressItem canvas");

            cShapes.then(function(module){
                cShapesObj = new module.CShapes();
                gbr = cShapesObj.animatedRectangle();
                gbr.config.easing = "linear";
                gbr.config.duration = 5000;
                gbr.config.segment = [12, 5];
                gbr.config.lineColor = "red";
                gbr.config.lineWidth = 5;
                // gbr.config.fn = function(){
                //     colorCycler();
                //     gbr.config.lineColor = colors[activeColor];
                // };
                gbr.config.iterationCount = "infinite";
                gbr.draw(TargetCanvas);
            })
        }
    }

    function slowMo(){
        let element = $$.ss(".vProgressItem .style3");
        element.classList.add("slow");
        element.style.transitionDuration = "10s";
        element.style.width = "85%";
    }

    function tinyIncrement(){
        let element = $$.ss(".vProgressItem .style3");
        element.classList.remove("slow", "tiny");
        let add = 1.7;
        let start = 85
        smallIncrement = setInterval(() => {
            if (network == "online"){ //increment if online
                start = start+add;
                element.style.width = start+"%";
                let small = 5/(new Date()).getMilliseconds();
                add = (add > 1) ? add - 0.3:(small < 0)?-1*small:small;
                add = (add > 0.09)? 0.09:add;
                if(start > 90) element.style.transitionDuration = ".6s";
            }
        }, 1000);
    }

    function getProgressSpaceElement(element){
        let targetSpace;
        if(defaultProgressSpace == null){
            // check if element has target progress space element
            let id = element.dataset[hyphenatedToCamel(dataAttributes["progressSpaceId"])];
            if(id == "self"){
                targetSpace = element;
            }else if(id != undefined){ // query for the element with target ID
                let elementWithId = $$.ss("#"+id);
                if(elementWithId == null) throw new Error("No element found with the ID '"+id+"', passed to the progressIdicatorObj.showProgress()");
                targetSpace = elementWithId;
            }else{
                targetSpace = element;
            }

            return targetSpace;
        }
    }

    function getComputedlocation(location){
        let computed = null;
        if(location == "top"){
            computed = "top:0px;bottom:auto";
        }else if(location == "center"){
            computed = "top:50%;margin-top:-1.5px;";
        }else if (location == "bottom"){
            computed = "bottom:0px;top:auto";
        }else{
            computed = location;//custom style
        }
        return computed;
    }

    function setTemplate(spaceEle){
        let template;
        let exist = spaceEle.querySelector(".vProgressItem"); 
        
        if(exist == null){
            if(progressType == "linear"){
                let style3Properties    = progressStyle.linear.style == 3?"width:0%; transition: width .8s cubic-bezier(0,.53,0,.3);":"";
                let trackColor          = progressStyle.linear.trackColor;
                let progressColor       = progressStyle.linear.progressColor;
                let location            = getComputedlocation(progressStyle.linear.location);
                let overflow            = progressStyle.linear.style == 3?"visible":"hidden";

                template = `
                    <div class="vProgressItem linear" style="${location};overflow:${overflow}"><div class="track" style="background-color:${trackColor}"><div class="progress style${progressStyle.linear.style}" style="${style3Properties} background-color:${progressColor};"></div></div></div>
                `;
            }else if(progressType == "circular"){
                let ovlerlayStyle = progressStyle.circular.overlay;
                let label = "";
                if (!$$.sm(spaceEle).isPositioned()) spaceEle.style.position = "relative";
               
                if(progressStyle.circular.labelContent.length > 0){
                    label += `<div style="margin-top:50px;${progressStyle.circular.labelStyle}">${progressStyle.circular.labelContent}</div>`;
                }

                template = `
                    <div class="vProgressItem circular" style="${ovlerlayStyle}">
                        <div class="spinner"></div>
                        ${label}
                    </div>
                `;

               
            }else if(progressType == "grid"){
                if (!$$.sm(spaceEle).isPositioned()) spaceEle.style.position = "relative";
                template = `
                    <div class="vProgressItem grid">
                        <canvas id="vProgressItem-grid"></canvas>
                    </div>
                `;
            }
            
            spaceEle.innerHTML   += template;
        }else{
            exist.classList.remove("done");
        }
        return new Promise((s, r)=>s())
    }

    Object.defineProperties(this, {
        showProgress: { writable: false },
        hideProgress: { writable: false },
        initialize: {writable:false}
    })

    Object.defineProperties(this.config, {
        progressSpeed: {
            set: function(value) {
                progressSpeed = value;
            }
        },
        progressStyle: {
            set: function(value) {
                validateObjectLiteral(value, "config.progressStyle property value must be a literal object");
                const validProgressArray    = Object.entries(progressStyle);
                const validProgressStyles   = validProgressArray.map((a)=> a[0]);
                const totalValid            = validProgressArray.length;
                const sourceProgressStyles  = Object.entries(value);
                const totalSourceItems      = sourceProgressStyles.length;
                
                //Check length
                if (totalSourceItems > totalValid) throw new Error("'config.progressStyle' property value, must be an object with at max 4 properties.");

                for (let x = 0; x < totalSourceItems; x++) {                    
                    // source properties
                    const targetProgressType    = sourceProgressStyles[x][0].toLowerCase();
                    if (!validProgressStyles.has(targetProgressType)) throw new Error(`'config.progressStyle' object property '${targetProgressType}' is not valid. Here are the available properties: `+ validProgressStyles.join(", "));

                    if (targetProgressType != "custom"){
                        validateObjectLiteral(sourceProgressStyles[x][1], `'config.progressStyle' object property '${targetProgressType}' value must be a literal object`);
                    }else{
                        validateString(sourceProgressStyles[x][1], `'config.progressStyle' object property '${targetProgressType}' value must be a string`);
                    }
                    
                    const targetInnerProps      = Object.keys(sourceProgressStyles[x][1]);
                    const totalTargetInnerProps = targetInnerProps.length;

                    if(targetProgressType != "custom" && totalTargetInnerProps > 0){
                        const validInnerProgressStyles   = Object.keys(progressStyle[targetProgressType]);
                        for (let y=0; y<totalTargetInnerProps; y++){
                            if (!validInnerProgressStyles.has(targetInnerProps[y])) throw new Error(`'config.progressStyle' object property '${targetProgressType}' config key '${targetInnerProps[y]}' is not valid. Here are the available config keys: `+ validInnerProgressStyles.join(", "));
                            
                            const targetInnerPropValue = sourceProgressStyles[x][1][targetInnerProps[y]];
                           
                            if(targetInnerProps[y] != "style" && targetInnerProps[y] != "gridGab"){
                                validateString(targetInnerPropValue, `'config.progressStyle' object property '${targetProgressType}' config key '${targetInnerProps[y]}' value must be a string`);
                            }else{
                                validateNumber(targetInnerPropValue, `'config.progressStyle' object property '${targetProgressType}' config key '${targetInnerProps[y]}' value must be a number`);
                               
                                if(targetInnerProps[y] == "style"){
                                    if(targetInnerPropValue > 3 || targetInnerPropValue < 0) throw new Error(`'config.progressStyle' object property '${targetProgressType}' config key '${targetInnerProps[y]}' value must be either 1, 2 or 3`);
                                }else{
                                    if(targetInnerPropValue < 0) throw new Error(`'config.progressStyle' object property '${targetProgressType}' config key '${targetInnerProps[y]}' value must be greater than 0`);
                                }
                                
                            }

                            //Assign values
                            progressStyle[targetProgressType][targetInnerProps[y]] = sourceProgressStyles[x][1][targetInnerProps[y]];
                        }
                    }
                }    
            }
        },
        progressType: {
            set: function(value) {
                const validProgressTypes = Object.keys(progressStyle);
                validateString(value, "config.progressType property value must be a string");
                if(!validProgressTypes.has(value)) throw new Error("The specified progress type '"+ value +"' is not supported, the suported progress types are: "+ validProgressTypes.join(", "));
                progressType = value.toLowerCase();
                if(progressType == "grid"){
                    cShapes = import("./vUX-cShapes.js");
                }
            }
        },
        dataAttributeNames:{
            set: function(value) {
                // The trigger element will hold the defined attributes
                var validOptions = Object.keys(dataAttributes);
                validateObjectLiteral(value, "'config.dataAttributeNames' property value must be an object");
                var entries = Object.entries(value);
                if(entries.length <= 1){
                    entries.forEach(function(entry){
                        if(validOptions.indexOf(entry[0]) == -1) throw new Error("The data attribute '"+ entry[0] +"' specified is not supported, the suported specifiers are: "+ validOptions.join(", "));
                        dataAttributes[entry[0]] = entry[1];
                    });
                }else{
                    throw new Error("'config.dataAttributeNames' object value contains more than 7 entries");
                }
            }
        },
    })
}
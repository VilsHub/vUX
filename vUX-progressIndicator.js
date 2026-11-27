/*
 * vUX JavaScript library v4.1.0
 * https://github.com/VilsHub/vUX
 *
 *
 * Released under the MIT license
 * https://github.com/VilsHub/vUX/blob/master/LICENSE
 *
 * Date: 2022-05-17=T09:20Z
 * 
 * 
 */
// Import vUX core
import { validateNumber, validateString } from "./src/helpers.js";
import "./src/vUX-core-4.1.0.js";

/***************************progress Indicator*****************************/
export function ProgressIndicator(defaultProgressSpace=null) {
    if (defaultProgressSpace != null) validateElement(defaultProgressSpace, "ProgressIndicator(x) constructor argument 1 must either be null or an element (the default progress space)");

    let progressSpeed=1.8,progressType="linear", initialized=false,cShapes=null,gbr,cShapesObj;
    let network         = "online";
    let crawlTimers     = new Map(); //style 3 bar -> its crawl interval, one per bar so bars in different spaces never stop each other
    let hideTimers      = new Map(); //style 3 bar -> the fallback timer that hides it after the fill to 100%
    let destroyed       = false;
    let managedSpaces   = [];   //every element a progress block was built into, so destroy() can clear them
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
    this.showProgress = function (element=null){
        if (!initialized) throw new Error("Please initialize using the 'initialize()' method, before trying to show progress");
        if (element != null){
            validateElement(element, "progressIndicatorObj.showProgress(x) argument 1 must be a valid HTML element");
        }else if (defaultProgressSpace == null){
            throw new Error("progressIndicatorObj.showProgress(x) requires an element when no default progress space was passed to the constructor");
        }
        showLoader(element);
    },

    this.hideProgress = function (element=null){
        if (element != null){
            validateElement(element, "progressIndicatorObj.hideProgress(x) argument 1 must be a valid HTML element");
        }else if (defaultProgressSpace == null){
            throw new Error("progressIndicatorObj.hideProgress(x) requires an element when no default progress space was passed to the constructor");
        }
        let targetSpace = ownBlock(getProgressSpaceElement(element));
        if (targetSpace == null) return; //nothing was shown in this space yet, so there is nothing to hide

        if(progressType == "linear"){
            let progress = targetSpace.querySelector(".progress");
            if(progressStyle.linear.style == 3 && progress != null && !targetSpace.classList.contains("done")){
                stopCrawl(progress);
                progress.classList.add("completed");
                progress.classList.remove("halted", "tiny", "slow");
                progress.style.transitionDuration = ".2s";
                progress.style.width = "100%";
                //the bar fills to 100% first and handleTransitionEnd() hides it once the fill ends; the
                //timer is the fallback for a fill that fires no transitionend (already at 100%, for one)
                clearTimeout(hideTimers.get(progress));
                hideTimers.set(progress, setTimeout(function(){
                    hideTimers.delete(progress);
                    if (progress.classList.contains("completed")){
                        progress.classList.remove("completed");
                        targetSpace.classList.add("done");
                    }
                }, 400));
            }else{
                targetSpace.classList.add("done");
            }
        }else{//others
            targetSpace.classList.add("done");
            if(progressType == "grid" && gbr != null) gbr.stop(); //gbr is set once the cShapes import resolves
        }
    }

    this.initialize = function (){
        if(!initialized){
            if (destroyed) throw new Error("This ProgressIndicator has been destroyed, create a new instance instead of re-initializing");
            addEvents();
            addVitalStyles();
            initialized = true;
        }
    }

    this.destroy = function (){
        //Clears the incremental timer and the grid animation, detaches the three window listeners
        //and removes every progress block this instance injected. Without it the 'online', 'offline'
        //and 'transitionend' listeners stay bound to window for the life of the page.
        if (destroyed) return;

        crawlTimers.forEach(function(id){ clearInterval(id); });
        crawlTimers.clear();
        hideTimers.forEach(function(id){ clearTimeout(id); });
        hideTimers.clear();

        //destroy() stops the animation and clears the canvas; the grid indicator's canvas is removed
        //with its progress block below, but clearing first keeps a reused space from flashing the last frame.
        if (gbr != null && typeof gbr.destroy == "function") gbr.destroy();

        removeEventListener("online", handleOnline);
        removeEventListener("offline", handleOffline);
        removeEventListener("transitionend", handleTransitionEnd, false);

        for (let x = 0; x < managedSpaces.length; x++){
            let block = ownBlock(managedSpaces[x]);
            if (block != null) block.remove();
        }
        managedSpaces = [];

        initialized = false;
        destroyed = true;
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
        if (managedSpaces.indexOf(targetSpace) == -1) managedSpaces.push(targetSpace);
        setTemplate(targetSpace).then(function(){ animationController(targetSpace); });
    }

    //True when the element belongs to a block this instance built: the block's parent is one of its
    //spaces. The transitionend listener is on window, so without this check every instance on the page
    //would drive every other one's bar, including a bar in a space nested inside one of its own.
    function ownsElement(element){
        let block = element.closest(".vProgressItem");
        return block != null && managedSpaces.indexOf(block.parentNode) != -1;
    }

    //The space's own progress block: a direct child only, so a space nested inside it (with another
    //instance's block) is never mistaken for this one's.
    function ownBlock(space){
        for (let x = 0; x < space.children.length; x++){
            if (space.children[x].classList.contains("vProgressItem")) return space.children[x];
        }
        return null;
    }

    function stopCrawl(bar){
        clearInterval(crawlTimers.get(bar));
        crawlTimers.delete(bar);
    }
    
    function addEvents(){
        //Named rather than anonymous so that destroy() can detach them from window again.
        addEventListener("online", handleOnline)
        addEventListener("offline", handleOffline)
        addEventListener("transitionend", handleTransitionEnd, false)
    }

    function handleOnline(){
        network = "online";
    }

    function handleOffline(){
        network = "offline";
    }

    function handleTransitionEnd(e){
        if(e.target.classList.contains("style3") && ownsElement(e.target)){
            if(!e.target.classList.contains("slow") && !e.target.classList.contains("halted")){
                if(!e.target.classList.contains("completed")){
                    slowMo(e.target);
                    return; //the slow phase starts its own transition; the next transitionend continues
                }
            }
            if(e.target.classList.contains("slow")){
                e.target.classList.add("halted", "tiny"); 
                tinyIncrement(e.target);
            }
            if(e.target.classList.contains("completed")){
                e.target.parentNode.parentNode.classList.add("done");
                e.target.classList.remove("completed")
            }
        }
    }

    function showLoader(element){
        buildProgressBlock(element);
    }

    function animationController(space){
        //every query is scoped to the space being shown, so a second indicator on the page is never
        //the one that moves
        if(progressType == "linear" && progressStyle.linear.style == 3){
            let element = ownBlock(space).querySelector(".style3");
            element.style.width = "57%";
        }else if(progressType == "grid"){
            let TargetCanvas = ownBlock(space).querySelector("canvas");

            cShapes.then(function(module){
                //hidden (or destroyed) before the import resolved: drawing now would loop on a hidden canvas
                let block = ownBlock(space);
                if (block == null || block.classList.contains("done")) return;
                cShapesObj = new module.CShapes();
                gbr = cShapesObj.animatedRectangle();
                gbr.config.easing = "linear";
                gbr.config.duration = 5000;
                gbr.config.segment = [12, progressStyle.grid.gridGab];
                gbr.config.lineColor = progressStyle.grid.gridColor;
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

    function slowMo(element){
        element.classList.add("slow");
        element.style.transitionDuration = "10s";
        element.style.width = "85%";
    }

    function tinyIncrement(element){
        stopCrawl(element); //a re-shown bar never runs two timers
        element.classList.remove("slow", "tiny");
        let add = 1.7;
        let start = 85
        crawlTimers.set(element, setInterval(() => {
            if (network == "online"){ //increment if online
                start = start+add;
                element.style.width = start+"%";
                let small = 5/(new Date()).getMilliseconds();
                add = (add > 1) ? add - 0.3:(small < 0)?-1*small:small;
                add = (add > 0.09)? 0.09:add;
                if(start > 90) element.style.transitionDuration = ".6s";
            }
        }, 1000));
    }

    function getProgressSpaceElement(element){
        let targetSpace;

        // the element's progressSpaceId data attribute takes priority over the default progress space
        let id = element != null ? element.dataset[hyphenatedToCamel(dataAttributes["progressSpaceId"])] : undefined;

        if(id == "self"){
            targetSpace = element;
        }else if(id != undefined){ // query for the element with target ID
            let elementWithId = $$.ss("#"+id);
            if(elementWithId == null) throw new Error("No element found with the ID '"+id+"', passed to the progressIdicatorObj.showProgress()");
            targetSpace = elementWithId;
        }else if(defaultProgressSpace != null){
            targetSpace = defaultProgressSpace;
        }else{
            targetSpace = element;
        }

        return targetSpace;
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
        let exist = ownBlock(spaceEle);
        
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
            
            //insertAdjacentHTML, not innerHTML +=: re-parsing the space would replace its own content
            //(buttons, inputs) with copies that have lost their listeners and state
            spaceEle.insertAdjacentHTML("beforeend", template);
            //flush styles so the bar's first width change animates from its 0% start; without it the
            //browser first sees the target width, no transition runs and a style 3 bar never moves on
            //to its slow and crawl phases
            void spaceEle.offsetWidth;
        }else{
            exist.classList.remove("done");

            //reset a finished style 3 bar so it restarts from 0% instead of animating backwards from 100%
            let progress = exist.querySelector(".progress");
            if (progress != null && progress.classList.contains("style3")){
                stopCrawl(progress);
                clearTimeout(hideTimers.get(progress)); //a pending hide from the last cycle must not cut this one short
                hideTimers.delete(progress);
                progress.classList.remove("completed", "halted", "slow", "tiny");
                //jump to 0% with no transition (a bar re-shown mid-fill would otherwise shrink back from
                //near 100%), flush, then restore the fill duration so the move to 57% animates
                progress.style.transitionDuration = "0s";
                progress.style.width = "0%";
                void exist.offsetWidth;
                progress.style.transitionDuration = ".8s";
            }
        }
        return new Promise((s, r)=>s())
    }

    Object.defineProperties(this, {
        showProgress: { writable: false },
        hideProgress: { writable: false },
        initialize: {writable:false},
        destroy: {writable:false}
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
                                    if([1, 2, 3].indexOf(targetInnerPropValue) == -1) throw new Error(`'config.progressStyle' object property '${targetProgressType}' config key '${targetInnerProps[y]}' value must be either 1, 2 or 3`);
                                }else{
                                    if(targetInnerPropValue <= 0) throw new Error(`'config.progressStyle' object property '${targetProgressType}' config key '${targetInnerProps[y]}' value must be greater than 0`);
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
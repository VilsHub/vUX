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
import "./src/vUX-core-4.0.0.beta.js";

/***************************progress Indicator*****************************/
export function ProgressIndicator(defaultProgressSpace=null) {
    let progressSpeed=1.8,progressType="linear", initialized=false;
    let network         = "online";
    let smallIncrement  = null;
    let dataAttributes = {
        progressSpaceId:""// The data attribute to hold the ID of the element on which progress should show on. the data attribute value can be the ID of the target element or 'self' refering to it self. If this attribute takes mor priority than the default progress space element
    };
    let progressStyle = {
        linear:{
            trackColor:"#ccc", //valid css color
            progressColor:"purple", //valid css color
            location:"top", // top | middle | bottom
            custom:"",
            style:3
        },
        circular:{

        },
        grid:{

        },
        custom:{

        }
    }
    this.showProgress = function (element){
        if (!initialized) throw new Error("Please initialize using the 'initialize()' method, before trying to show progress");
        validateElement(element, "progressIndicatorObj.showProgress(x) argument 1 must be a valid HTML element");
        showLoader(element);
    },

    this.hideProgress = function (element){
        let targetSpace = getProgressSpaceElement(element).querySelector(".vProgressItem");
        
        if(progressType == "linear"){
            clearInterval(tinyIncrement);
            let progress = targetSpace.querySelector(".progress");
            progress.classList.add("completed");
            progress.classList.remove("halted", "tiny", "slow");
            progress.style.transitionDuration = ".2s";
            progress.style.width = "100%"            
        }else{//others

        }
    }

    this.initialize = function (){
        if(!initialized){
            addEvents();
            addVitalStyles();
            // buildProgressBlock();
            initialized = true;
        }
    }

    this.config = {}

    async function addVitalStyles(){
        let path = await processAssetPath();
        vModel.core.functions.linkStyleSheet(path+"css/progressIndicator.css", "progressIndicator");
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
        let element = $$.ss(".vProgressItem .style3");
        if(progressType == "linear" && progressStyle.linear.style == 3){
            element.style.width = "57%";
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

    function setTemplate(spaceEle){
        let template;
        let exist = spaceEle.querySelector(".vProgressItem");
        if(exist == null){
            if(progressType == "linear"){
                let style3Properties = progressStyle.linear.style == 3?"width:0%; transition: width .8s cubic-bezier(0,.53,0,.3)":"";
                template = `
                    <div class="vProgressItem"><div class="track"><div class="progress style3" style="${style3Properties}"></div></div></div>
                `;
            }
            
            spaceEle.innerHTML   += template;
        }else{
            exist.classList.remove("done");
        }
        return new Promise((s, r)=>{s()})
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
                const validProgressTypes = Object.entries(progressStyle);
                const totalValid = validProgressTypes.length;
                const sourceProgressStyles = Object.entries(value);
                console.log(sourceProgressStyles)
                // const totalSourceItems = sourceProgressStyles[0].length;
                // console.log(sourceProgressStyles[0]);
                //Check length
                // if (totalSourceItems > totalValid) throw new Error("config.progressStyle property value, must be an object with at max 4 properties.");
               

                for (let x = 0; x < 0; x++) {
                    //valid properties
                    // const validProgressType     = validProgressTypes;
                    const validInnerProperties  = Object.keys(validProgressTypes[x][1]);
                    const totalInnerProperties  = validInnerProperties.length;

                    //source properties
                    const targetProgressType    = validInnerProperties[x][0].toLowerCase();
                    const targetInnerProps      = Object.keys(validInnerProperties[x][1]);
                    const totalTargetInnerProps = targetInnerProps.length;
                    console.log(validInnerProperties)
                    if (!validProgressTypes.has(targetProgressType)) throw new Error(`config.progressStyle object property ${targetProgressType} is not valid. Here are the available properties`+ validProgressTypes.join(", "));
                    console.log(validProgressTypes.has(targetProgressType))
                    // if (totalTargetInnerProps > totalInnerProperties) throw new Error("config.progressStyle property value, must be an object with at max 4 properties.");
                    
                    // if () throw new Error("config.progressStyle property value, must be an object with at max 4 properties.");
                    
                    // let keyExist = progressStyle[element][]
                    
                    // console.log(totalTargetInnerProps)
                    // console.log(totalInnerProperties)

                    // if(element =! "grid"){

                    // }else{

                    // }
                }

                // if (validProgressTypes) throw new Error()
                console.log(validProgressTypes);
                // progressStyle = value;
                
            }
        },
        progressType: {
            set: function(value) {
                const validProgressTypes = Object.keys(progressStyle);
                validateString(value, "config.progressType property value must be a string");
                if(!validProgressTypes.has(value)) throw new Error("The specified progress type '"+ value +"' is not supported, the suported progress types are: "+ validProgressTypes.join(", "));
                progressType = value.toLowerCase();
            }
        },
        dataAttributes:{
            set: function(value) {
                // The trigger element will hold the defined attributes
                var validOptions = Object.keys(dataAttributes);
                validateObjectLiteral(value, "'config.dataAttributes' property value must be an object");
                var entries = Object.entries(value);
                if(entries.length <= 1){
                    entries.forEach(function(entry){
                        if(validOptions.indexOf(entry[0]) == -1) throw new Error("The data attribute '"+ entry[0] +"' specified is not supported, the suported specifiers are: "+ validOptions.join(", "));
                        dataAttributes[entry[0]] = entry[1];
                    });
                }else{
                    throw new Error("'config.dataAttributes' object value contains more than 7 entries");
                }
            }
        },
    })
}
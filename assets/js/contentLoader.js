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

/***************************content loader*****************************/
function ContentLoader() {
    var customStyle = "",initialize = false,tempStoarage = {};
    var callBackFn = null, loaderItemClass="", switchPoint=null;
    var dataAttributes = {
        containerId:"",
        url:"",
        trigger:"",
        loaderMode:""
    }
    function loadFrom(element) {
        var containerID = element.getAttribute(dataAttributes.containerId);
        var container = $$.ss("#"+containerID);
        var url = element.getAttribute(dataAttributes.url).toLowerCase();
        var cache = element.getAttribute(dataAttributes.cache);
        var linkID = element.getAttribute("data-link");
        cache = cache == null?cache=false:cache.toLowerCase();
        if(container == null)console.error(element);
        validateElement(container, "No container found with the ID '"+containerID+"' for the element above");

        container.setAttribute("data-state", "receiving");
        if(cache == "true") { //Attempt load from storage
            if (typeof(Storage) !== "undefined") { //Supports web storage
                if (sessionStorage.pageLink != undefined) { //atleast a page has been cached
                    var existingLinks = JSON.parse(sessionStorage.getItem("pageLink"));
                    var urlArr = Object.values(existingLinks);
                    if (urlArr.indexOf(url) != -1) { //link exist, so get content
                        var index = urlArr.indexOf(url);
                        var content = JSON.parse(sessionStorage.getItem("linkContent"))
                        var arrContent = Object.values(content);
                        insertContent(container, arrContent[index], linkID);
                        
                        //show content
                        showRuntime(container);

                        callBackFn != null ? callBackFn(element) : null;
                    } else { //link does not exist, get from server
                        getContent(url, container, element, cache);
                    }
                } else { //pageContent has no data, load from server and create data
                    getContent(url, container, element, cache);
                }
            } else { //Does not support web storage, use object
                if (tempStoarage.pageLink != undefined) { //atleast a page has been cached
                    var existingLinks = JSON.parse(tempStoarage["pageLink"]);
                    var urlArr = Object.values(existingLinks);
                    if (urlArr.indexOf(url) != -1) { //link exist, so get content
                        var index = urlArr.indexOf(url);
                        var content = JSON.parse(tempStoarage["linkContent"]);
                        var arrContent = Object.values(content);
                        insertContent(container, arrContent[index], linkID);
                        
                        //show content
                        showRuntime(container);

                        callBackFn != null ? callBackFn(element) : null;
                    } else { //link does not exist, get from server
                        getContent(url, container, element, cache);
                    }
                } else { //pageContent has no data, load from server and create data
                    getContent(url, container, element, cache);
                }
            }
        } else { //Load from server
            getContent(url, container, element, cache);
        }
    }
    this.initialize = function() {
        if (initialize == false) {
            if (customStyle != "") { //Custom style set
                addCustomStyle();
            }

            if (Object.keys(dataAttributes).length <= 3) throw new Error("Setup Incomplete: All required attributes to be used must be supplied. Supply using the config.dataAttributes property");
            if (loaderItemClass == "") throw new Error("Setup Incomplete: Item class not specified. Supply using the config.loaderItemClass property");

            runSetup();
            initialize = true;
        }
    }
    this.config = {}

    function runSetup(){
        var allItems = $$.sa("."+loaderItemClass);
        allItems.forEach(function(element){
            element.classList.add("vLoaderItem");
            
            //Execute autoload
            autoLoadContent(element);
        });

        addEventhandlers();
    }

    function autoLoadContent(element){
        var autoBuildStatus = element.getAttribute(dataAttributes.trigger);//trigger method attribute, whether to load on click, load or both
        if(autoBuildStatus == null){
            console.warn("This ContentLoader item element ", element, "has no load trigger set, specify using the attribute '"+dataAttributes.trigger+"'");
        }

        if(autoBuildStatus == "load" || autoBuildStatus == "both"){
            if(switchPoint != null && dataAttributes.loaderMode != ""){
                var loaderMode = element.getAttribute(dataAttributes.loaderMode).toLowerCase();
                if(loaderMode != "mobile" && loaderMode != "desktop"){
                    console.error(element);
                    throw new Error("The above element attribute '"+dataAttributes.loaderMode+"' must be set to either 'mobile' or 'desktop'");
                }
                if(innerWidth <= switchPoint){//mobile
                    if(loaderMode == "mobile"){
                        loadFrom(element);
                    }
                }else{//desktop
                    if(loaderMode == "desktop"){
                        loadFrom(element);
                    }
                }
            }else{ //assumed only one content loader
                loadFrom(element);
            }
        }
        element.setAttribute("data-link", $$.randomString());
    }

    function addEventhandlers(){
        $$.attachEventHandler("click", "vLoaderItem", function(e){
            var triggerType = e.target.getAttribute(dataAttributes.trigger).toLowerCase();
            var elementLink = e.target.getAttribute("data-link");
            var container = $$.ss("#"+e.target.getAttribute(dataAttributes.containerId));
            var containerID = container.getAttribute("data-link");

            if(triggerType == "click" || triggerType == "both"){
                if(containerID != elementLink){
                    loadFrom(e.target);
                }
            }
        })
    }

    function  getContent(url, container, element, cache) {
        var xhr = $$.ajax({method:"GET", url:url}, "html");
        var runtime = container.querySelector(".runTime");
        xhr.addEventListener("load", function() {
            if(container.getAttribute("data-state") == "receiving"){
                if (cache) { //insert and cache data
                    //cache
                    if (typeof(Storage) !== "undefined") { //Supports web storage
                        if (sessionStorage.pageLink == undefined) {
                            sessionStorage.pageLink = JSON.stringify({});
                            sessionStorage.linkContent = JSON.stringify({});
                        }
                        var pageLink = JSON.parse(sessionStorage.pageLink);
                        var linkContent = JSON.parse(sessionStorage.linkContent);
    
                        var length = Object.keys(pageLink).length;
    
                        pageLink[length] = url;
                        linkContent[length] = xhr.responseText;
    
                        //rebuild
                        sessionStorage.pageLink = JSON.stringify(pageLink);
                        sessionStorage.linkContent = JSON.stringify(linkContent);
                    } else { //Does not support web storage, use object
                        if (tempStoarage.pageLink == undefined) {
                            tempStoarage.pageLink = JSON.stringify({});
                            tempStoarage.linkContent = JSON.stringify({});
                        }
                        var pageLink = JSON.parse(tempStoarage.pageLink);
                        var linkContent = JSON.parse(tempStoarage.linkContent);
    
                        var length = Object.keys(pageLink).length;
    
                        pageLink[length] = url;
                        linkContent[length] = xhr.responseText;
    
                        //rebuild
                        tempStoarage.pageLink = JSON.stringify(pageLink);
                        tempStoarage.linkContent = JSON.stringify(linkContent);
                    }
                }
    
                insertContent(container, xhr.responseText);
                hideLoader(container);
    
                //show content
                showRuntime(container);
    
    
                //call callback function if enable
                callBackFn != null ? callBackFn(element) : null; 
                
                container.setAttribute("data-state", "received");  
                container.setAttribute("data-link", element.getAttribute("data-link"));  
            }        
        });
       
        //show loader here
        if(runtime != null) runtime.classList.remove("xShow");
        insertLoader(container);
        xhr.send();
    }

    function showRuntime(container){
        var runtime = container.querySelector(".runTime");
        runtime.scrollHeight;
        runtime.classList.add("xShow");
    }

    function insertLoader(container) {
        var existing = container.querySelector(".loaderCon");
        if(existing == null){
            if(!$$.sm(container).isPositioned()) container.style["position"] = "relative";
            container.style["height"] = "100%";
            var con = $$.ce("DIV");
            con.classList.add("loaderCon");
            var spinner = $$.ce("DIV");
            spinner.setAttribute("id", "xSpin");
            $$.sm(spinner).center();
            con.appendChild(spinner);
            container.appendChild(con);
        }else{
            $$.sm(existing).unHide();
        }
    }

    function insertContent(container, content, linkID){
        var runtimeContainer = container.querySelector(".runTime");
        if(runtimeContainer == null){
            //create runtimeContainer
            var runtimeContainerElement = $$.ce("DIV", {class:"runTime"});
            container.appendChild(runtimeContainerElement);
            runtimeContainer = container.querySelector(".runTime");
        }
        runtimeContainer.innerHTML = content;
        container.setAttribute("data-link", linkID); 
    }

    function hideLoader(container){
        var parent = container.parentNode;
        var spinner = parent.querySelector(".loaderCon");
        $$.sm(spinner).hide();
    }


    function addCustomStyle() {
        var css = "";
        if (customStyle[0] != "") { //overlay style
            css += ".loaderCon{" + customStyle[0] + "}";
        }
        if (customStyle[1] != "") { //loaderBox style
            css += ".loaderCon #xSpin{" + customStyle[1] + "}";
        }
        if (customStyle[2] != "") { //loaderIcon style
            css += ".loaderCon #xSpin::before{" + customStyle[2] + "}";
        }
        attachStyleSheet("contentLoader", css);
    }
    Object.defineProperties(this, {
        loadFrom: { writable: false },
        config: { writable: false },
        initialize: { writable: false },
        switch: { writable: false },
    })
    Object.defineProperties(this.config, {
        customStyle: {
            set: function(value) {
                var temp1 = "config.customStyle property";
                var temp2 = temp1 + " value must ";

                function temp3(n) { return " array value element " + n + " must be a string or null" }
                validateArray(value, temp2 + " be an array");
                validateArrayLength(value, 3, temp2 + "be an array of 3 members");
                if (value[0] != null) { //has overlay style
                    validateString(value[0], temp1 + temp3(1));
                }
                if (value[1] != null) { //has loaderBox style
                    validateString(value[1], temp1 + temp3(2));
                }
                if (value[2] != null) { //has loaderIcon style
                    validateString(value[2], temp1 + temp3(2));
                }
                customStyle = value;
            }
        },
        callback: {
            set: function(value) {
                validateFunction(value, "config.callback property value must be a function");
                callBackFn = value;
            }
        },
        loaderItemClass:{
            set: function(value) {
                //The class value will register a content loader element
                validateString(value, "config.loaderItemClass property value expects a string");
                loaderItemClass = value;
            } 
        },
        dataAttributes:{
            set: function(value) {
                // The trigger element will hold the defined attributes


                var validOptions = ["containerId", "url", "trigger", "loaderMode", "cache"];
                validateObjectLiteral(value, "'config.dataAttributes' property value must be an object");
                var entries = Object.entries(value);
                if(entries.length < 6){
                    entries.forEach(function(entry){
                        if(validOptions.indexOf(entry[0]) == -1) throw new Error("The data attribute specifier is not supported, the suported specifiers are: "+ validOptions.join(", "));
                        dataAttributes[entry[0]] = entry[1];
                    });
                }else{
                    throw new Error("'config.dataAttributes' object value contains more than 5 entries");
                }
            }
        },
        switchPoint:{
            set:function(value){ //for switching between two contentloader (for mobile and desktop view)
                switchPoint = value;
            }

        }
    })
}
/**********************************************************************/
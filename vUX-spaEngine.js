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

/***************************SPA Engine*****************************/
export function SPAEngine(defaultURL=null, defaultContentNode=null) {
    if(defaultURL != null) validateString(defaultURL, "SPAEngine(x.) contructor argument 1 must be a string or null");
    if (defaultContentNode != null) validateElement(defaultContentNode, "SPAEngine(.x) contructor argument 2, an element (the contentNode) must be either be null or an element");
   
    var customStyle = "",initialize = false,tempStoarage = {}, dataLink, preClickCallback=null;
    var loadCallBack = null, historyCallback=null, loadtoNode = true;
    var dataAttributes = { //data attributes name should be specified without the data- prefix. only plain words or hyphenated words is allowed
        contentNodeId:"", //The element to hold the return data, only ID name, if not the default content node is used
        url:"",//the URL to be called
        urlPath:"", //The URL that will be appended to the base page, needed for pushstate
        cache:"",
        viewMode:"", //attribute to set if link is for mobile or desktop (only needed for app with 2 navigation systems: one for destop and ther other for mobile). if attribute exist then check if view state is mobile or desktop in order to select the right menu. Attribute value can only be "desktop" or "mobile". Example data-viewport = "mobile"
        addToHistory:"", // attribute to set if to use history or not, default = true
        loadIntoNode:"",// attribute to set if content is to be loaded into contentNode. Default=true
        pageTitle:"",//The title for the link content, only used when history is enable for the link
        loadCallback:"callback-load", //if exist override the default 
		historyCallback:"callback-history", //if exist override the default 
    }
    var classes = {
        spaLink:"" //Must be specified, as it is used in registering SPA links
    }
    this.initialize = function() {
        if (!initialize) {
            if (customStyle != "") addCustomStyle(); //Custom style set
            if (classes.spaLink == "") throw new Error("Setup Incomplete: The class name for SPA links has not been specified. Supply using the config.classes.spaLink property");
            runSetup();
            initialize = true;
        }
    }
    this.config = {}

    function runSetup(){
        registerEventhandlers();
        boot(); //handle other pages other than the default onload
    }

    function loadFrom(element) {
      
        var loadIntoNode = element.dataset[hyphenatedToCamel(dataAttributes.loadIntoNode)];
        var url = element.dataset[hyphenatedToCamel(dataAttributes.url)];
        loadtoNode = Boolean(loadIntoNode == undefined? true: loadIntoNode?true:false);

        if(loadtoNode){ //Load content into node
            var nodeId              = element.dataset[hyphenatedToCamel(dataAttributes.contentNodeId)];
            var ownLoadCallback     = element.dataset[hyphenatedToCamel(dataAttributes.loadCallback)];
            var cache               = element.dataset[hyphenatedToCamel(dataAttributes.cache)];   
            var contentNode         = null;
            var usedloadCallBack    = null; 
            
            //Check NodeId
            if(nodeId != undefined){
                contentNode = $$.ss("#"+nodeId);
                validateElement(contentNode, "No container found with the ID '"+nodeId+"'");
            }else{ //set to the default content Node
                if(defaultContentNode == null) throw new Error("No content node has been specified. ");
                contentNode = defaultContentNode;
            }

            //Check loadCllback
            if(ownLoadCallback != undefined){
                validateFunction(window[ownLoadCallback], "No function with name'"+ownLoadCallback+"'");
                usedloadCallBack = window[ownLoadCallback];
            }else{ //set to the default content Node
                usedloadCallBack = (loadCallBack != null)? loadCallBack:null;
                validateFunction(usedloadCallBack, "'config.loadCallback' property value must be a function");
            }

            dataLink = linkId(element, "link") //for mapping last click link to container
            
            
            cache = Boolean(cache == null?false:cache);

            if(contentNode.dataset.link != dataLink){
                contentNode.dataset.state = "receiving";
                contentNode.dataset.link = dataLink; //content node linked to the last click link (this is to avoid later overiding by already previously clicked link)
                
                if(cache) { //Attempt load from storage
                    if (typeof(Storage) !== "undefined") { //Supports web storage
                        if (sessionStorage.pageLink != undefined) { //atleast a page has been cached
                            var existingLinks = JSON.parse(sessionStorage.getItem("pageLink"));
                            var urlArr = Object.values(existingLinks);
                            if (urlArr.has(url)) { //link exist, so get content
                                var index = urlArr.indexOf(url);
                                var content = JSON.parse(sessionStorage.getItem("linkContent"))
                                var arrContent = Object.values(content);
                                insertContent(contentNode, arrContent[index], dataLink);                                
                                usedloadCallBack != null ? usedloadCallBack(element): null;
                            } else { //link does not exist, get from server
                                getContent(url, contentNode, element, cache);
                            }
                        } else { //pageContent has no data, load from server and create data
                            getContent(url, contentNode, element, cache);
                        }
                    } else { //Does not support web storage, use object
                        if (tempStoarage.pageLink != undefined) { //atleast a page has been cached
                            var existingLinks = JSON.parse(tempStoarage["pageLink"]);
                            var urlArr = Object.values(existingLinks);
                            if (urlArr.indexOf(url) != -1) { //link exist, so get content
                                var index = urlArr.indexOf(url);
                                var content = JSON.parse(tempStoarage["linkContent"]);
                                var arrContent = Object.values(content);
                                insertContent(contentNode, arrContent[index], dataLink);        
                                loadCallBack != null ? usedloadCallBack(element) : null;
                            } else { //link does not exist, get from server
                                getContent(url, contentNode, element, cache);
                            }
                        } else { //pageContent has no data, load from server and create data
                            getContent(url, contentNode, element, cache);
                        }
                    }
                }else{
                     //ignore cache storage and Load from server
                    getContent(url, contentNode, element, cache);
                }
            }

        }else { //just get only content
            getContent(url, null, element);
        }
    }

    function registerEventhandlers(){
        $$.attachEventHandler("click", classes.spaLink, function(e){
            loadFrom(e.target);
        })
        if(historyCallback != null) {
            addEventListener("popstate", function(e){
                if(e.state != null){
                    let data                = e.state.data;
                    let ele                 = $$.ss("[data-link-id='"+e.state.linkId+"']");
                    let ownHistoryCallback  = ele.dataset[hyphenatedToCamel(dataAttributes.historyCallback)];
                    let usedHistoryCallback = null;   
                    let contentNodeId       = ele.dataset[hyphenatedToCamel(dataAttributes.contentNodeId)];
                    let contentNode         = (contentNodeId != undefined)? $$.ss("#"+contentNodeId) : defaultContentNode
                    
                    //Check historyCallback
                    if(ownHistoryCallback != undefined){
                        validateFunction(ownLoadCallback, "No function with name'"+ownHistoryCallback+"'");
                        usedHistoryCallback = ownHistoryCallback;
                    }else{ //set to the default content Node
                        usedHistoryCallback = (historyCallback != null)? historyCallback:null;
                    }
                    
                    contentNode.innerHTML = data;
                    usedHistoryCallback(ele);
                }
            }, false);
        }
    }

    function linkId(element, dataAttribute){
        var id = null;
        if(element.dataset[dataAttribute] != null){//for mapping last click link to container
            id = element.dataset[dataAttribute];
        }else{
            id = $$.randomString();
            element.dataset[dataAttribute] = id;
        }
        return id
    }

    function getContent(url, container=null, element=null, cache=null) {
        if (preClickCallback != null) preClickCallback(element);
        
        var xhr = $$.ajax({method:"GET", url:url}, "html");       
        
        xhr.addEventListener("load", function() {
            var ownLoadCallback     = element.dataset[hyphenatedToCamel(dataAttributes.loadCallback)];
            var usedloadCallBack    = null; 

            //Check loadCllback
            if(ownLoadCallback != undefined){
                validateFunction(window[ownLoadCallback], "No function with name'"+ownLoadCallback+"'");
                usedloadCallBack = window[ownLoadCallback];
            }else{ //set to the default content Node
                usedloadCallBack = (loadCallBack != null)? loadCallBack:null;
                validateFunction(usedloadCallBack, "'config.loadCallback' property value must be a function");
            }

            if(xhr.status == 200){
                if(container != null){ //content is to loaded in

                    if(element != null){
                        var useHistory = element.dataset[hyphenatedToCamel(dataAttributes.addToHistory)];
                        var addHistory = useHistory == undefined? true: Boolean(useHistory)
                    }

                    if(container.dataset.state == "receiving"){

                        if (element != null && cache != null){
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
                        }
        
                        insertContent(container, xhr.responseText, element);

                        usedloadCallBack != null ? usedloadCallBack(element): null;
                        
                        container.dataset.state = "received";  
        
                        if(element != null){
                            // container.setAttribute("data-link", element.getAttribute("data-link"));  
                            //store page details in history state                
                            if (addHistory) createState(element, xhr.responseText);
                        }
                    }

                }else{//get and return only content
                     //call callback function if enable
                      usedloadCallBack != null ? usedloadCallBack(element): null;
                }
            }else{
                //message box to show error
                alert("404 not found\nThe resource URL "+url+ " cannot be found on this server");
            }
        });
        
        xhr.send(); //auto load its content
    }

    function insertContent(container, content, element){
        if(element.dataset.link == container.dataset.link){//content for the last element clicked
            document.querySelector("#entryPoint").innerHTML = content;
        }else{
        }
    }

    function boot(){
        //get element with path
        var urlPath = location.pathname;
        var element = getElementWithPath(urlPath);

        if(element != null){ //load from element
            loadFrom(element);
        }else{//get content into container
            getContent(location.pathname, defaultContentNode, null, null);
        }
    }

    function getElementWithPath(path){
        
        var element = $$.ss("[data-"+dataAttributes["urlPath"]+"='"+path+"']");

        if(element == null){ // Trail back to get element
            var segments = path.xTrim().split("/");
            var totalSegment = segments.length;
            var n = totalSegment-1;
            for (var x = 0; x < totalSegment; x++) {
                segments.splice(n)
                var trail = "/"+segments.join("/"); 
                element = $$.ss("["+dataAttributes["urlPath"]+"='"+trail+"']");
                if(element != null){
                    n--;
                    break;
                }                
            }
            return element;
        }else{
            return element
        }
    }

    function createState(element, data){
        var pathUrl     = element.dataset[hyphenatedToCamel(dataAttributes["urlPath"])];
        var title       = element.dataset[hyphenatedToCamel(dataAttributes["pageTitle"])]; 
        var elementId   = linkId(element, "linkId");
       
        if(pathUrl != undefined){
            title = title == undefined?$$.ss("title").innerText:title;
            var historyObj = {
                url:pathUrl,
                data:data,
                title:title,
                linkId:elementId
            }
            history.pushState(historyObj, title, pathUrl);
        }else{
            console.warn("The SPA link :", element,"has no path URL set, history not enabled for it.");
        }
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
        attachStyleSheet("spaEngine", css);
    }

    Object.defineProperties(this, {
        config: { writable: false },
        initialize: { writable: false }
    })

    Object.defineProperties(this.config, {
        loadCallback: {
            set: function(value) {
                validateFunction(value, "config.loadCallback property value must be a function");
                loadCallBack = value;
            }
        },
        preClickCallback: {
            set: function(value) {
                validateFunction(value, "config.preClickCallback property value must be a function");
                preClickCallback = value;
            }
        },
        historyCallback: {
            set: function(value) {
                validateFunction(value, "config.historyCallback property value must be a function");
                historyCallback = value;
            }
        },
        dataAttributes:{
            set: function(value) {
                // The trigger element will hold the defined attributes
                var validOptions = Object.keys(dataAttributes);
                validateObjectLiteral(value, "'config.dataAttributes' property value must be an object");
                var entries = Object.entries(value);
                if(entries.length <= 7){
                    entries.forEach(function(entry){
                        if(validOptions.indexOf(entry[0]) == -1) throw new Error("The data attribute '"+ entry[0] +"' specified is not supported, the suported specifiers are: "+ validOptions.join(", "));
                        dataAttributes[entry[0]] = entry[1];
                    });
                }else{
                    throw new Error("'config.dataAttributes' object value contains more than 7 entries");
                }
            }
        },
        classes:{
            set: function(value) {
                var validOptions = Object.keys(classes);
                var totalOptions = validOptions.length;
                validateObjectLiteral(value, "'config.classes' property value must be an object");
                var entries = Object.entries(value);
                if(entries.length <= totalOptions){
                    entries.forEach(function(entry){
                        if(validOptions.indexOf(entry[0]) == -1) throw new Error("The class attribute '"+ entry[0] +"' specified is not supported, the suported specifiers are: "+ validOptions.join(", "));
                        classes[entry[0]] = entry[1];
                    });
                }else{
                    throw new Error("'config.classes' object value contains more than "+totalOptions+" entries");
                }
            }
        }
    })
}
/**********************************************************************/
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

/***************************SPA Engine*****************************/
export function SPAEngine(defaultContentNode=null) {
    if (defaultContentNode != null) validateElement(defaultContentNode, "SPAEngine(x) contructor argument 2, an element (the contentNode) must be either be null or an element");
   
    var initialize = false,tempStoarage = {}, dataLink, preClickCallback=null, functions={}, bootCallback=null;
    var loadCallBack = null, historyCallback=null, loadtoNode = true;
    var dataAttributes = { //data attributes name should be specified without the data- prefix. only plain words or hyphenated words is allowed
        contentNodeId:"", //The element to hold the return data, only ID name, if not the default content node is used
        url:"",//the URL to be called
        urlPath:"", //The URL that will be appended to the base page, needed for pushstate
        cache:"",
        addToHistory:"", // attribute to set if to use history or not, default = true
        loadIntoNode:"",// attribute to set if content is to be loaded into contentNode. Default=true
        pageTitle:"",//The title for the SPA link returned content, only used when history is enable for the link
        loadCallback:"callback-load", //if exist override the default 
		historyCallback:"callback-history", //if exist override the default 
    }
    var classes = {
        spaLink:"" //Must be specified, as it is used in registering SPA links
    }
    var routeConfigs = null;
    this.initialize = function() {
        if (!initialize) {
            if (classes.spaLink == "") throw new Error("Setup Incomplete: The class name for SPA links has not been specified. Supply using the config.classes.spaLink property");
            if (routeConfigs == null) throw new Error("Setup Incomplete: The route configs has not been supplied. Supply using the config.routeConfigs property");
            
            boot();

            // runSetup();
            initialize = true;
        }
    }
    this.config = {}

    function runSetup(){
        registerEventhandlers();
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
                validateFunction(functions[ownLoadCallback], "No function with name'"+ownLoadCallback+"'");
                usedloadCallBack = functions[ownLoadCallback];
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
                                getLinkContent(url, contentNode, element, cache);
                            }
                        } else { //pageContent has no data, load from server and create data
                            getLinkContent(url, contentNode, element, cache);
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
                                getLinkContent(url, contentNode, element, cache);
                            }
                        } else { //pageContent has no data, load from server and create data
                            getLinkContent(url, contentNode, element, cache);
                        }
                    }
                }else{
                     //ignore cache storage and Load from server
                    getLinkContent(url, contentNode, element, cache);
                }
            }

        }else { //just get only content
            getLinkContent(url, null, element);
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
                    let nodeLink            = ele.dataset.link;
                    
                    //Check historyCallback
                    if(ownHistoryCallback != undefined){
                        validateFunction(functions[ownLoadCallback], "No function with name'"+ownHistoryCallback+"'");
                        usedHistoryCallback = functions[ownHistoryCallback];
                    }else{ //set to the default content Node
                        usedHistoryCallback = (historyCallback != null)? historyCallback:null;
                    }

                    //Set page title
                    let title   = ele.dataset[hyphenatedToCamel(dataAttributes["pageTitle"])]; 
                    title == undefined? $$.ss("title").innerText : $$.ss("title").innerText = title;

                    contentNode.dataset.link = nodeLink;
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

    function getLinkContent(url, container=null, element=null, cache=null) {
        if (preClickCallback != null) preClickCallback(element);
        
        var xhr = $$.ajax({method:"GET", url:url}, "html");       
        
        xhr.addEventListener("load", function() {
            var ownLoadCallback     = element.dataset[hyphenatedToCamel(dataAttributes.loadCallback)];
            var usedloadCallBack    = null; 

            //Check loadCllback
            if(ownLoadCallback != undefined){
                validateFunction(functions[ownLoadCallback], "No function with name'"+ownLoadCallback+"'");
                usedloadCallBack = functions[ownLoadCallback];
            }else{ //set to the default content Node
                usedloadCallBack = (loadCallBack != null)? loadCallBack:null;
                validateFunction(usedloadCallBack, "'config.loadCallback' property value must be a function");
            }

            if(xhr.status == 200){
                if(container != null){ //content is to be loaded in

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

    async function getPageContent(name, url){

        var getFromServer = false;
        var content = "";
        var status = false;

        if (sessionStorage.pageContents == undefined) {
            sessionStorage.pageContents = JSON.stringify({});
            getFromServer = true;
        }else{
            var allPageContents = sessionStorage.getIterable("pageContents");
            if (allPageContents[name] != undefined){
                getFromServer = false;
            }
        }

        if (getFromServer){
            const response = await fetch(url);

            if (response.ok){
                status= true
                content = await response.text();

                // Save data
                saveSectionData("pageContents", name, content);
            }else{
                console.error("404 not found\nThe resource URL "+url+ " cannot be found on this server");
            }

        }else{
            status=true;
            content = allPageContents[name];
        }

        return{
            status:status,
            content:content
        }
    }

    function insertContent(container, content, element){
        if (element != null){
            if(element.dataset.link == container.dataset.link){//content for the last element clicked

                //set page title is set
                let title   = element.dataset[hyphenatedToCamel(dataAttributes["pageTitle"])]; 
                title == undefined?$$.ss("title").innerText:$$.ss("title").innerText = title;
    
                //set Content
                container.innerHTML = content;
    
            }
        }else{
            //set Content
            container.innerHTML = content;
        }
    }

    function boot(){

        // Check if route exist and if protected
        let route           = location.pathname;

        let routes          = Object.entries(routeConfigs.routes);
        let routeProperties = routeExist(route, routes);


        // Check if route exist
        if (routeProperties.status){

            // Check if route is protected
            if (routeProperties.properties.protected){
                // check if logged in
                if (isLoggedIn()){
                    renderContent(routeConfigs, routeProperties);
                }else{
                    // Redirect to Auth page
                    location.assign(routeProperties.authURL);
                }

            }else{
                renderContent(routeConfigs, routeProperties);
            }

        }else{
            document.querySelector("body").innerText = "404";
        }

    }

    function runApp(){
        //get element with path
        var urlPath = location.pathname;
        var element = getElementWithPath(urlPath);

        if(element != null){ //load from element
            loadFrom(element);
        }else{//get content into container
            getLinkContent(location.pathname, defaultContentNode, null, null);
        }
    }

    function loadPageContents(){

        let route = location.pathname;
        var content = null;
        if(routeConfigs.routes.default.pattern == route){
            // load the default content
            if(routeConfigs.routes.default.protected){
                if (isLoggedIn()){
                    content = getPageContent("default", routeConfigs.routes.default.target);
                }else{
                    // Redirect to Auth page
                    location.assign(routeConfigs.routes.default.authURL);
                }
            }else{
                content = getPageContent("default", routeConfigs.routes.default.target);
            }

            content.then(function(data){
                if(data.status){
                    if(defaultContentNode != null){
                        defaultContentNode.innerHTML = data.content;
                        if (bootCallback != null) bootCallback();
                    }
                }
            })            
        }else{
            // non default route
            let routes          = Object.entries(routeConfigs.routes);
            let routeProperties = routeExist(route, routes);
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

    function routeExist(sourceRoute, targetRoutes){
        /**
         * @param string sourceRoute: The route to check
         * @param array targetRoutes: The route instance from the defined routes to check against
         */
            let totalElements   = targetRoutes.length;
            let state           = {
                status: false,
                properties: null
            };
    
            for (let index = 0; index < totalElements; index++) {
                const targetRoute = targetRoutes[index];
    
                if (sourceRoute == targetRoute[1]["pattern"]) {
                    state.status        = true;
                    state.properties    = targetRoute;
                    break;
                }
                
            }
    
            return state;
    }

    function isLoggedIn(){
        let status=null;
        if (sessionStorage.userProperties == undefined) {
            status = false;
        }else{
            if (sessionStorage.userProperties.auth){
                status = true;
            }
        }
    }

    function renderContent(configs, routeProperties){
        // load all block sections
        let contentBlockSections    = configs.blockSections;

        // Block sections
        let allBlockSections        = Object.entries(contentBlockSections);
        let totalBlockSections      = allBlockSections.length;      

       
        var  sectionPromises = [];

        if (totalBlockSections > 0){

            // store all block section promises in the sectionPromises array
            sectionPromises = allBlockSections.map((element) => {
                let name        = element[0];
                let url         = element[1].source;
                let mountPoint  = element[1].mountPoint;
                
                // Returns a promise
                return getSectionContents("blockSections", name, url, mountPoint);
            });

        }

        // load all page sections
        if (configs.pageSections[routeProperties.properties[0]] != undefined){
            
            // Page sections
            let contentPageSections     = configs.pageSections[routeProperties.properties[0]];
            var allPageSections         = Object.entries(contentPageSections);
            let totalPageSections       = allPageSections.length;

            if(totalPageSections > 0){
                
                // store all page section promises in the sectionPromises array
                var tmpSectionPromises = allPageSections.map((element) => {

                    let name        = element[0];
                    let url         = element[1].source;
                    let mountPoint  = element[1].mountPoint;
                    let replace     = element[1].replaceOld;
                    
                    // Assuming getSectionContents is a function that returns a promise
                    return getSectionContents("pageSections", name, url, mountPoint, replace);
                });
                    

                // Concatenate page section to block section if possible
                if(tmpSectionPromises !== undefined && tmpSectionPromises.length > 0){
                    sectionPromises = sectionPromises.concat(tmpSectionPromises);
                }
            }

        }
        
        // Use Promise.all to wait for all promises then load page content
        Promise.all(sectionPromises)
        .then((results) => {
            loadPageContents();
        })
        .catch((error) => {
            console.error("Error processing sections:", error);
        });
        
    }

    function saveSectionData(sectionType, key, data){

         /**
         *  @param string $sectionType: blockSections | pageSections 
         * 
         */ 

        if (typeof(Storage) !== "undefined") {
            //storage is supported

            if(sessionStorage[sectionType] !== undefined){
                let sectionData = sessionStorage.getIterable(sectionType);
                sectionData[key] = data;
                sessionStorage.setIterable(sectionType, sectionData);
            }else{
                let sectionData = {};
                sectionData[key] = data;
                sessionStorage.setIterable(sectionType, sectionData);
            }
            
        }
    }

    function sectionDataExist(sectionType, key){

        /**
         *  @param string $sectionType: blockSections | pageSections 
         * 
         */ 

        if (typeof(Storage) !== "undefined") {
            //storage is supported

            if(sessionStorage[sectionType] == undefined){
                // Not saved
                return false;
            }else{
                // Exist, check if key exist
                let sectionData = sessionStorage.getIterable(sectionType);
                if (sectionData[key] !== undefined){
                    return true;
                }else{
                    return false;
                }
            }

        } else {
            // Sorry! No Web Storage support..
            return false;
        }
            
    }

    async function getSectionContents(sectionType, name, url, mountPoint, replace=true) {
        let  html = "";

        // check if its cached
        const section = sectionDataExist(sectionType, name);

        if(section){
            // get saved data
            let blockSections = sessionStorage.getIterable(sectionType);
            html = blockSections[name];
        }else{
            const response = await fetch(url);
            html = await response.text();

            parseScriptElements(html);

            // Save the data
            saveSectionData(sectionType, name, html);
        }
    
        if(replace){
            $$.ss(mountPoint).innerHTML = html;
        }else{
            // Append 
            $$.ss(mountPoint).insertAdjacentHTML('beforeend', html);
        }
        
    }

    async function parseScriptElements(data){
        const parser = new DOMParser();
        const doc = parser.parseFromString(data, 'text/html');

        // Get all <script> tags
        const scripts = doc.querySelectorAll('script');

        // Dynamically load each script
        scripts.forEach(script => {
            const newScript = document.createElement('script');
            newScript.type = script.type || 'text/javascript';

            // Copy attributes from the original <script>
            Array.from(script.attributes).forEach(attr => {
                newScript.setAttribute(attr.name, attr.value);
            });

            newScript.dataset.parsed = true;

            // Append the new <script> to the document's <head>
            document.head.appendChild(newScript);
        });
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
        bootCallback: {
            set: function(value) {
                validateFunction(value, "config.bootCallback property value must be a function");
                bootCallback = value;
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
        dataAttributeNames:{
            set: function(value) {
                // The trigger element will hold the defined attributes
                var validOptions = Object.keys(dataAttributes);
                validateObjectLiteral(value, "'config.dataAttributeNames' property value must be an object");
                var entries = Object.entries(value);
                if(entries.length <= 7){
                    entries.forEach(function(entry){
                        if(validOptions.indexOf(entry[0]) == -1) throw new Error("The data attribute '"+ entry[0] +"' specified is not supported, the suported specifiers are: "+ validOptions.join(", "));
                        dataAttributes[entry[0]] = entry[1];
                    });
                }else{
                    throw new Error("'config.dataAttributeNames' object value contains more than 7 entries");
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
        },
        functions:{
            set: function(value) {
                validateObjectLiteral(value, "'config.functions' property value must be an object");
                functions = value;
            }
        },
        routeConfigs: {
            set: function(value){
                routeConfigs = value;
            }
        }
    })
}
/**********************************************************************/
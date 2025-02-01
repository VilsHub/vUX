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
import { validateString } from "./src/helpers.js";
import "./src/vUX-core-4.0.0-beta.js";

/***************************SPA Engine*****************************/
export function SPAEngine(defaultContentNode=null) {
    if (defaultContentNode != null) validateElement(defaultContentNode, "SPAEngine(x) contructor argument 2, an element (the contentNode) must be either be null or an element");
   
    var initialize = false,tempStorage = {}, dataLink, preClickCallback=null, functions={}, bootCallback=null;
    var clickLoadCallback = null, loadIntoNode = true, cacheBuilderTracker={},addToHistory=true,savedPageSection={},routeProperties=null;
    var dataAttributes = { //data attributes name should be specified without the data- prefix. only plain words or hyphenated words is allowed
        contentNodeId:"", //The element to hold the return data, only ID name, if not the default content node is used
        cache:"",
        addToHistory:"", // attribute to set if to use history or not, default = true
        loadIntoNode:"",// attribute to set if content is to be loaded into contentNode. Default=true
        pageTitle:"",//The title for the SPA link returned content, only used when history is enable for the link
        clickLoadCallback:"click-callback", //the data attribute name that will set the key to hold the target function in the route.clickLoadCallbacks property
		historyCallback:"history-callback", //the data attribute name that will set the key to hold the target function in the route.historyCallbacks property
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
            startRouter();
            // SetPageState() //links state and page title
            startCacheBuilder();
            initialize = true;
        }
    }
    this.config = {}

    function loadFrom(element) {

        // Check if route exist and if protected
        let route           = element.getAttribute("href");
        // let routes          = Object.entries(routeConfigs.routes);

        // Set routeProperties
        routeProperties     = routeExist(route);

        // Check if route exist
        if (routeProperties.status){

            // Check if route is protected
            if (routeProperties.properties.protected){
                // check if logged in
                if (isLoggedIn()){
                    getLinkContent(element);
                }else{
                    // Redirect to Auth page
                    location.assign(routeProperties.authURL);
                }

            }else{
                getLinkContent(element);
            }

        }else{
            document.querySelector("body").innerText = "404";
        }
        
    }

    function startRouter(){

        // Register Listeners

        $$.attachEventHandler("click", classes.spaLink, function(e){
            e.preventDefault();
            loadFrom(e.target);
        })


        addEventListener("popstate", function(e){
            if(e.state != null){

                let parsedData          = JSON.parse(e.state);
                let routeProperties     = parsedData.routeProperties;
                let routeName           = routeProperties.name;
                let ele                 = parsedData.elementId; //Element must have an ID
                let usedHistoryCallback = null;   
                let contentNode         = defaultContentNode
                let title               = routeConfigs.routes[routeName].pageTitle;
                let element             = null;
                let callbackKey         = null;

                if(ele != null){
                    
                    element             = $$.ss("#"+ele);
                    callbackKey         = element.dataset[hyphenatedToCamel(dataAttributes.historyCallback)];
                    let contentNodeId   = element.dataset[hyphenatedToCamel(dataAttributes.contentNodeId)];
                    
                    // Select the content node using the contentNodeId
                    if(contentNodeId != undefined){
                        contentNode     = $$.ss("#"+contentNodeId);
                    }
                    
                    //Check historyCallback
                    if(callbackKey != undefined){
                        if (routeConfigs.routes[routeName].historyCallbacks[callbackKey] != undefined){
                            usedHistoryCallback = routeConfigs.routes[routeName].historyCallbacks[callbackKey];
                        }else{
                            console.warn("No function set for the key 'routes['"+routeName+"'].historyCallbacks['"+callbackKey+"']'");
                        } 
            
                    }
                }else if(routeConfigs.routes[routeName].historyCallbacks != undefined){
                    if(routeConfigs.routes[routeName].historyCallbacks["default"] != undefined){
                        usedHistoryCallback = routeConfigs.routes[routeName].historyCallbacks["default"];
                    }
                }

                //Set page title
                $$.ss("title").innerText = title;
  
                // Set contents
                contentNode.innerHTML = parsedData.contents;
       
                // Set page sections
                loadPageSections(routeProperties, routeName);
                
                // Flush other page section content
                flushElements(routeProperties.properties.flush);

                // Call history Callback  
                // Work on progress object inclusion  
                if (usedHistoryCallback != null )  setTimeout(function(){usedHistoryCallback(element, routeName, callbackKey)}, 200);        

            }
        }, false);

    }

    function saveState(contents, elementId){
 
        var routeName   = routeProperties.name;
        let historyData = {
            routeProperties: routeProperties,
            contents: contents,
            elementId: elementId
        }

        let path = routeConfigs.routes[routeName].path;
        let title = routeConfigs.routes[routeName].pageTitle;

        //store page details in history state                
        history.pushState(JSON.stringify(historyData), title, path);
    }

    function setPageTitle(element){
        // Set Page title
        let title = ""
        if(dataAttributes["pageTitle"] != "" && element != null){//Get title from element
            if(element.dataset[hyphenatedToCamel(dataAttributes["pageTitle"])] != undefined){
                title  = element.dataset[hyphenatedToCamel(dataAttributes["pageTitle"])]; 
            }
        }else{ //Get title from route

            if (routeProperties.properties != undefined){
                title = routeProperties.properties.pageTitle;
            }
            
        }

        title == undefined?$$.ss("title").innerText:$$.ss("title").innerText = title;
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

    function fetchData(container=null, element=null, cache=null) {
  
        var urlTarget   = routeProperties.properties["target"];
        var routeName   = routeProperties.name;

        if (preClickCallback != null) preClickCallback(element);

        var xhr = $$.ajax({method:"GET", url:urlTarget}, "html");       
        
        xhr.addEventListener("load", function() {

            var callbackKey         = element.dataset[hyphenatedToCamel(dataAttributes.clickLoadCallback)];
            var usedloadCallBack    = null; 

            //Check loadCllback
            if(callbackKey != undefined){
                if (routeConfigs.routes[routeName].clickLoadCallbacks[callbackKey] != undefined){
                    usedloadCallBack = routeConfigs.routes[routeName].clickLoadCallbacks[callbackKey];
                }else{
                    console.warn("No function set for the key 'routes['"+routeName+"'].clickLoadCallbacks['"+callbackKey+"']'");
                } 
            }else{
                if(clickLoadCallback != null){
                    usedloadCallBack = clickLoadCallback;
                }
            }

            if(xhr.status == 200){
                if(container != null){ //content is to be loaded in

                    if(container.dataset.state == "receiving"){

                        if (element != null && cache != null){
                            if (cache) { //insert and cache data

                                //cache
                                if (typeof(Storage) !== "undefined") { //Supports web storage

                                    if (sessionStorage.linkContents == undefined) {
                                        sessionStorage.linkContents = JSON.stringify({});
                                    }
                                    
                                    var linkContents = sessionStorage.getIterable("linkContents");
                                    linkContents[routeName] = xhr.responseText; 
                                    
                                    //rebuild
                                    sessionStorage.setIterable("linkContents", linkContents);

                                } else { //Does not support web storage, use object

                                    if (tempStorage.linkContents == undefined) {
                                        tempStorage.linkContents = JSON.stringify({});
                                    }

                                    var linkContents = JSON.parse(tempStorage.linkContents);
                
                                    linkContents[routeName] = xhr.responseText;
                          
                                }
                            }
                        }
        
                        insertContent(container, xhr.responseText, element);

                        // Pass: element, routeid, callbackKey
                        usedloadCallBack != null ? setTimeout(function(){usedloadCallBack(element, routeName, callbackKey)}, 200): null;

                        container.dataset.state = "received";  
                        
                        saveState(xhr.responseText, element.id);
        
                    }

                }else{//get and return only content
                     //call callback function if enable
                     usedloadCallBack != null ? setTimeout(function(){usedloadCallBack(element, routeName, callbackKey)}, 200): null;
                }
            }else{
                //message box to show error
                alert("404 not found\nThe resource URL "+url+ " cannot be found on this server");
            }
        });
        
        xhr.send(); //auto load its content
        
    }

    function insertContent(container, content, element){
        if (element != null){
            if(element.dataset.link == container.dataset.link){//content for the last element clicked                
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

        // let routes          = Object.entries(routeConfigs.routes);
        routeProperties     = routeExist(route);


        // Check if route exist
        if (routeProperties.status){
  
            // Check if route is protected
            if (routeProperties.properties.protected){
                // check if logged in
                if (isLoggedIn()){
                    renderContent();
                }else{
                    // Redirect to Auth page
                    location.assign(routeProperties.authURL);
                }

            }else{
                renderContent();
            }

        }else{
            document.querySelector("body").innerText = "404";
        }

    }

    function loadPageContents(){

        let route = location.pathname;
        var content = null;

        if(routeConfigs.routes.default.pattern == route){

            routeProperties = {
                status: true,
                name: "default",
                properties: routeConfigs.routes.default,
                data: {}
            };
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

            
        }else{
            // non default route
            routeProperties = routeExist(route);
            if (routeProperties.status){
                content = getPageContent(routeProperties.name, routeProperties.properties.target);
            }
        }

        content.then(function(data){
            if(data.status){
                if(defaultContentNode != null){
                    defaultContentNode.innerHTML = data.content;

                    // Set page title
                    setPageTitle(null);

                    //store page details in history state 
                    saveState(data.content, null);

                    if (bootCallback != null) bootCallback(routeProperties.name);
                }
            }
        })            
    }

    async function getLinkContent(element){

        if (element.dataset[hyphenatedToCamel(dataAttributes.loadIntoNode)] != undefined){
            loadIntoNode = Boolean(element.dataset[hyphenatedToCamel(dataAttributes.loadIntoNode)]);
        }

        if (element.dataset[hyphenatedToCamel(dataAttributes.addToHistory)] != undefined){
            addToHistory = Boolean(element.dataset[hyphenatedToCamel(dataAttributes.addToHistory)]);
        }

        var routeName   = routeProperties.name;

        // Load links contents
        if(loadIntoNode){ //Load content into node
            var nodeId              = element.dataset[hyphenatedToCamel(dataAttributes.contentNodeId)];
            var callbackKey         = element.dataset[hyphenatedToCamel(dataAttributes.clickLoadCallback)]; //Attribute 
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

            //Check loadCallback
            if(callbackKey != undefined){
                if (routeConfigs.routes[routeName].clickLoadCallbacks[callbackKey] != undefined){
                    usedloadCallBack = routeConfigs.routes[routeName].clickLoadCallbacks[callbackKey];
                }else{
                    console.warn("No function set for the key 'routes['"+routeName+"'].clickLoadCallbacks['"+callbackKey+"']'");
                }
            }else{
                if(clickLoadCallback != null){
                    usedloadCallBack = clickLoadCallback;
                }
            }

            dataLink = linkId(element, "link") //for mapping last click link to container
            
            cache = Boolean(cache == null?true:cache); //The default is set to true, and content loaded will be cached 

            if(contentNode.dataset.link != dataLink){
                contentNode.dataset.state = "receiving";
                contentNode.dataset.link = dataLink; //content node linked to the last click link (this is to avoid later overiding by already previously clicked link)
                
                if(cache) { //Attempt load from storage

                    var existingLinksContents = {};

                    if (typeof(Storage) !== "undefined") { //Supports web storage
                        if (sessionStorage.linkContents != undefined) { //atleast a page has been cached
                            existingLinksContents = sessionStorage.getIterable("linkContents");
                        }
                    }else{
                        if (tempStorage.linkContents != undefined) { //atleast a page has been cached
                            existingLinksContents = JSON.parse(tempStorage["linkContents"]);
                        }
                    }

                    if (existingLinksContents[routeName] != undefined) { //link exist, so get content from cache
                        insertContent(contentNode, existingLinksContents[routeName] , element);           

                        saveState(existingLinksContents[routeName], element.id);

                        contentNode.dataset.state = "received";
                        usedloadCallBack != null ? setTimeout(function(){usedloadCallBack(element, routeName, callbackKey)}, 200): null;

                    } else { //link does not exist, get from server
                        fetchData(contentNode, element, cache);
                    }

                }else{
                     //ignore cache storage and Load from server
                    fetchData(contentNode, element, cache);
                }
            }

        }else { //just get only content
            fetchData(null, element, cache);
        }

        // Load page sections
        loadPageSections(routeProperties, routeName);

        // Flush other page section content
        flushElements(routeProperties.properties.flush);

        // Set Page title
        setPageTitle(element);
    }

    async function loadPageSections(targetRouteProperties, routeName){

         // Load page sections
         let pageSections           = null;
         pageSections               = Object.entries(targetRouteProperties.properties.pageSections);
         let totalPageSections      = pageSections.length;
         
         for (let z = 0; z < totalPageSections; z++) {
 
             let sectionId           = routeName+"-"+pageSections[z][0];
             let mountPoint          = pageSections[z][1].mountPoint;
             let replace             = pageSections[z][1].replaceOld;
             let cachedPageSections  = sessionStorage.getIterable("pageSections");
 
             if(cachedPageSections[sectionId] != undefined){ //get from cache and mount

                 let targetSection = cachedPageSections[sectionId];
                 if(replace){
                     $$.ss(mountPoint).innerHTML = targetSection;
                 }else{
                     $$.ss(mountPoint).insertAdjacentHTML('beforeend', targetSection);
                 }
             }else{ //get from server mount and cache

                 let url = routeConfigs.routes[routeName].pageSections[pageSections[z][0]];
 
                 const response = await fetch(url);
                 content = await response.text();
                 
                 if (response.ok){
                     if (response.headers.get('X-Fallback') === 'true') {
                         // Handle invalid route
                         throw new Error('404: File '+url+' not found');
                     }else{
                         // Save data
                         if(!savedPageSection[sectionId]){
                            saveSectionData("pageSections", sectionId, content);
                            savedPageSection[sectionId] = true;
                         }
                         
                     }
                     
                 }else{
                     console.error("404 not found\nThe resource URL "+url+ " cannot be found on this server");
                 }
             }
             
         }
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
            }else{
                getFromServer = true;
            }
        }

        if (getFromServer){
            const response = await fetch(url);
            content = await response.text();
            
            if (response.ok){
                if (response.headers.get('X-Fallback') === 'true') {
                    // Handle invalid route
                    throw new Error('404: File '+url+' not found');
    
                }else{
                    status= true
                    // Save data
                    saveSectionData("pageContents", name, content);
                }
                
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

    function routeExist(sourceRoute){
        /**
         * @param string sourceRoute: The route to check
         * @param array targetRoutes: The route instance from the defined routes to check against
         */

            let state           = {
                status: false,
                name: null,
                properties: null,
                data: {}
            };

            let targetRoutes = Object.entries(routeConfigs.routes);
    
            for (const index in targetRoutes) {
                if (Object.prototype.hasOwnProperty.call(targetRoutes, index)) { 

                    const targetRoute   = targetRoutes[index];
                    const isDynamic     = isDynamicRoute(targetRoute[1]["pattern"]);

                    if(!isDynamic){
                        if (sourceRoute == targetRoute[1]["pattern"]) {
                            state.status        = true;
                            state.name          = targetRoute[0];
                            state.properties    = routeConfigs.routes[targetRoute[0]];
                            break;
                        }
                    }else{
                        // is dynamic
                        
                        let dynamicData = getDynamicData(targetRoute[1]["pattern"], sourceRoute);
    
                        if (dynamicData.status){
                            state.data          = dynamicData.data;
                            state.name          = targetRoute[0];
                            state.properties    = routeConfigs.routes[targetRoute[0]];;
                            state.status        = true;
                            break;
                        }
                        
                    }
                }
            }
    
            return state;
    }

    function getDynamicData(pattern, route){
        // Remove / from both ends of pattern and route
        pattern = pattern.xTrim("/");
        route = route.xTrim("/");

        let routeSegments = route.split("/");
        let patternSegments = pattern.split("/");
        let totalRouteSegments = routeSegments.length;
        let totalPatternSegment = patternSegments.length;
        let state = {
            status: true,
            data:{}
        };

        if(totalRouteSegments == totalPatternSegment){

            for (let x = 0; x < totalPatternSegment; x++){

                if (segmentIsRegex(patternSegments[x])){
                    // remove the colon : character
                    let parsedPattern = new RegExp(patternSegments[x].trimChar(":"));
    
                    if(!parsedPattern.test(routeSegments[x])){
                        state.status = false;
                        break;
                    }else{
                        state.data[x+1] = routeSegments[x];
                    }
                    
                }else{
                   
                    if (segmentIsData(patternSegments[x])){
                        state.data[x+1] = routeSegments[x];
                    }else if (routeSegments[x] != patternSegments[x]) {
                        state.status = false;
                        break;   
                    }
                    
                }                
            }

        }else{
            status = false;
        }
  
        return state;
    }

    function segmentIsRegex(segment){
        if (segment[0] == ":") {
           return true;
        }else{
            return false;
        }
    }

    function segmentIsData(segment){
        if (segment[0] == ";") {
           return true;
        }else{
            return false;
        }
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

    function renderContent(){
        // load all block sections
        let contentBlockSections    = routeConfigs.blockSections;

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
                let replace     = element[1].replaceOld;
                
                // Returns a promise
                return getSectionContents("blockSections", name, url, mountPoint, replace);
            });

        }

        // load all page sections
        if (routeProperties.properties.pageSections != undefined){
  
            // Page sections
            let contentPageSections     = routeProperties.properties.pageSections;
            var allPageSections         = Object.entries(contentPageSections);
            let totalPageSections       = allPageSections.length;
            let routeName               = routeProperties.name;


            if(totalPageSections > 0){
                
                // store all page section promises in the sectionPromises array
                var tmpSectionPromises = allPageSections.map((element) => {

                    let name        = routeName+"-"+element[0];
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

    function flushElements(flushElements){
        flushElements.forEach(element => {
            $$.ss(element).innerHTML = "";
        });
    }

    async function aGet(url){
        const response = await fetch(url);
        return await response.text();
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

            // Save the data
            saveSectionData(sectionType, name, html);
        }

        if(replace){
            $$.ss(mountPoint).innerHTML = "";
            $$.ss(mountPoint).innerHTML = html;
        }else{
            // Append 
            $$.ss(mountPoint).insertAdjacentHTML('beforeend', html);
        }
        
    }

    async function preloadStyles(data){
        const parser = new DOMParser();
        const doc = parser.parseFromString(data, 'text/html');

        // Get all link tags
        const styles = doc.querySelectorAll('link');

        // Dynamically load each styles

        styles.forEach(style => {
            fetch(style.href);
        });
    }

    function startCacheBuilder(){
        let routesEntries   = Object.entries(routeConfigs.routes);
        let totalRoutes     = routesEntries.length;
        
        setTimeout(function(){
            for (let x = 0; x < totalRoutes; x++) {
                const routeName             = routesEntries[x][0];
                const skipInCacheBuilder    = routesEntries[x][1].skipInCacheBuilder;
                
                
                // load and cache router sections content if meant to cache
                if(!skipInCacheBuilder){
                    
                    const pageSections          = Object.entries(routesEntries[x][1].pageSections);
                    const totalPageSections     = pageSections.length;
    
                    for (let y = 0; y < totalPageSections; y++) {
                        const sectionId     = routeName+"-"+pageSections[y][0];
                        const sectionSource = pageSections[y][1].source;
    
                        if (cacheBuilderTracker[sectionId] == undefined){
                            // load and cache router sections
                            const html = aGet(sectionSource);
                            html.then(function(data){
                                
                                // Save the data
                                const activeCache = sessionStorage.getIterable("pageSections");
                                if(activeCache[sectionId] == undefined){
                                    saveSectionData("pageSections", sectionId, data);
                                    preloadStyles(data);
                                    cacheBuilderTracker[sectionId] = true;
                                }
                            })    
                        }
                    
                    }

                }
                
            }
            
        }, 400)

    }

    function isDynamicRoute(route){
        let status  = false;

        if (route.includes(":") || route.includes(";")) {
            status =  true;
        }
        return status;
    }

    Object.defineProperties(this, {
        config: { writable: false },
        initialize: { writable: false }
    })

    Object.defineProperties(this.config, {
        clickLoadCallback: {
            set: function(value) {
                validateFunction(value, "config.clickLoadCallback property value must be a function");
                clickLoadCallback = value;
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
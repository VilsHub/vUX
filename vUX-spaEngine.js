/*
 * vUX JavaScript library v4.0.0
 * https://github.com/VilsHub/vUX
 *
 *
 * Released under the MIT license
 * https://github.com/VilsHub/vUX/blob/master/LICENSE
 *
 * Date: 2021-07-19=T22:30Z
 * 
 * 
 */
// Import vUX core
import { validateString } from "./src/helpers.js";
import "./src/vUX-core-4.0.0.js";

/***************************SPA Engine*****************************/
export function SPAEngine(defaultContentNode=null) {
    if (defaultContentNode != null) validateElement(defaultContentNode, "SPAEngine(x) contructor argument 2, an element (the contentNode) must be either be null or an element");
   
    var initialize = false,tempStorage = {}, dataLink, preClickCallback=null, functions={}, bootCallback=null;
    var clickLoadCallback = null, loadIntoNode = true, cacheBuilderTracker={},addToHistory=true,savedPageSection={},routeProperties=null;
    var exitCallback=null, activeRoute=null;
    //Teardown state: the detach handle for the delegated link listener, the popstate listener held at
    //instance scope so destroy() can remove it, and the cache builder's timer id.
    var destroyed=false, spaLinkHandle=null, handlePopState=null, cacheBuilderTimer=null;
    //Release-scoped caching: the sessionStorage keys holding fetched HTML, the key recording which
    //cacheVersion that HTML was fetched under, and the version this engine was configured with.
    var CACHE_KEYS = ["linkContents", "pageContents", "pageSections", "blockSections"];
    var CACHE_VERSION_KEY = "spaCacheVersion";
    var cacheVersion = null;
    //Whether the app has a signed-in user, read by protected routes. The engine can't know this on
    //its own: the app sets spa.loggedIn before initialize() on every page load (it lives in memory),
    //to true after a successful sign-in, and to false on sign-out.
    var loggedIn = false;
    //Style-gated mounting: a fragment is parsed off-screen and mounted only once the stylesheets it
    //carries have loaded (or styleTimeout ms have passed), so nothing paints unstyled. Each
    //navigation takes a token, and a staged fragment whose navigation was superseded is dropped.
    //stagedLinks holds the stylesheet links a staged fragment is waiting on or keeping.
    var styleTimeout = 3000, navigationToken = 0, activeStages = [], stagedLinks = new WeakSet(), pendingContent = null;
    //Scroll restoration: the engine swaps content in place, so the browser cannot put back the scroll
    //position of a history entry. Each entry the engine owns stores its own scrollY in its state;
    //back/forward and reload scroll back to it. scrollSaveTimer debounces saving while scrolling,
    //handleScroll is the listener (held for destroy()), and previousScrollRestoration is the
    //browser setting put back on destroy().
    var restoreScroll = true, scrollSaveTimer = null, handleScroll = null, previousScrollRestoration = null;
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
            if (destroyed) throw new Error("This SPAEngine has been destroyed, create a new instance instead of re-initializing");
            if (classes.spaLink == "") throw new Error("Setup Incomplete: The class name for SPA links has not been specified. Supply using the config.classes.spaLink property");
            if (routeConfigs == null) throw new Error("Setup Incomplete: The route configs has not been supplied. Supply using the config.routeConfigs property");
            
            //must run before boot(): boot mounts from the cache, and the cache builder fills it
            syncCacheVersion();
            boot();
            startRouter();
            // SetPageState() //links state and page title
            startCacheBuilder();
            initialize = true;
        }
    }
    this.destroy = function() {
        //Detaches the delegated link listener and the popstate listener, and cancels the cache
        //builder if it has not run yet. The cached page sections are dropped with it, so a new
        //engine on the same page starts from an empty cache rather than another instance's.
        //Browser history itself is left untouched: entries this engine pushed are the user's.
        if (destroyed) return;

        if (spaLinkHandle != null){
            spaLinkHandle.detach();
            spaLinkHandle = null;
        }
        if (handlePopState != null){
            removeEventListener("popstate", handlePopState, false);
            handlePopState = null;
        }
        if (handleScroll != null){
            removeEventListener("scroll", handleScroll, false);
            handleScroll = null;
        }
        clearTimeout(scrollSaveTimer);
        scrollSaveTimer = null;
        if (previousScrollRestoration != null){
            history.scrollRestoration = previousScrollRestoration;
            previousScrollRestoration = null;
        }
        clearTimeout(cacheBuilderTimer);
        cacheBuilderTimer = null;

        //Fragments still waiting on their stylesheets are never mounted
        beginNavigation();

        cacheBuilderTracker = {};
        savedPageSection = {};
        activeRoute = null;
        routeProperties = null;

        initialize = false;
        destroyed = true;
    }
    this.clearCache = clearCache;
    function clearCache() {
        //Drops every piece of HTML the engine has cached, so the next navigation to any route
        //fetches it from the server again. Only the engine's own keys are emptied: sessionStorage
        //may also hold the app's own state, which a sessionStorage.clear() would wipe.
        //The keys are reset to empty objects rather than removed, because the read paths parse
        //them with getIterable() and JSON.parse(undefined) throws.
        if (typeof(Storage) !== "undefined") {
            CACHE_KEYS.forEach(function(key){
                sessionStorage.setIterable(key, {});
            });
        }
        tempStorage = {};

        //In-memory "already cached" flags would otherwise stop the refetched content being stored
        savedPageSection = {};
        cacheBuilderTracker = {};
    }
    this.config = {}

    function syncCacheVersion() {
        //Clears the cache when it was built under a different cacheVersion than the one configured.
        //A cache with no recorded version predates cacheVersion being set, so it is cleared too.
        if (cacheVersion == null || typeof(Storage) === "undefined") return;

        if (sessionStorage.getItem(CACHE_VERSION_KEY) !== cacheVersion) {
            clearCache();
            sessionStorage.setItem(CACHE_VERSION_KEY, cacheVersion);
        }
    }

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
                    location.assign(routeProperties.properties.authURL);
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

        spaLinkHandle = $$.attachEventHandler("click", classes.spaLink, function(e){
            e.preventDefault();
            loadFrom(e.target);
        })

        if (restoreScroll){
            //The browser's own restoration would scroll the old content before the entry's content
            //is mounted, so the engine takes it over
            if ("scrollRestoration" in history){
                previousScrollRestoration = history.scrollRestoration;
                history.scrollRestoration = "manual";
            }
            handleScroll = function(){
                clearTimeout(scrollSaveTimer);
                scrollSaveTimer = setTimeout(rememberScroll, 100);
            };
            addEventListener("scroll", handleScroll, {passive: true});
        }


        handlePopState = function(e){
            //a save still pending belongs to the entry being left, and history.state is already the
            //new entry, so it is dropped rather than written into the wrong one
            clearTimeout(scrollSaveTimer);

            if(e.state != null){

                let parsedData          = JSON.parse(e.state);
                let savedScroll         = typeof parsedData.scrollY == "number" ? parsedData.scrollY : null;
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

                //Mount the stored content and the route's sections together, once their stylesheets apply
                let token           = beginNavigation();
                let route           = {name: routeName, data: routeProperties.data};
                let contentStage    = stageHtml(contentNode, parsedData.contents, true);

                mountWhenStyled(token, stagePageSections(routeProperties, routeName), contentStage, routeProperties.properties.flush, route).then(function(mounted){
                    if (!mounted) return;

                    //The node now shows a history entry, not the last clicked link's content, so
                    //clicking that link again loads it
                    delete contentNode.dataset.link;
                    contentNode.dataset.state = "received";

                    //back where the visitor left this entry; again after the history callback, in case
                    //it renders content that the position depends on, but only if the visitor has not
                    //scrolled since (a moved position is theirs, not the callback's)
                    scrollToSaved(savedScroll);
                    let restoredAt = Math.round(window.scrollY);

                    // Call history Callback
                    // Work on progress object inclusion
                    if (usedHistoryCallback != null )  setTimeout(function(){
                        usedHistoryCallback(element, routeName, callbackKey, routeProperties.data);
                        if (Math.round(window.scrollY) == restoredAt) scrollToSaved(savedScroll);
                    }, 200);
                });

            }
        };

        addEventListener("popstate", handlePopState, false);

    }

    function saveState(contents, elementId, boot=false, scrollY=null){
        //boot: record the entry page in the history entry the browser already made for it
        //(replaceState, keeping the URL as typed, query and hash included) instead of pushing a
        //second entry for the same page, which made the first Back press appear to do nothing.

        if (!addToHistory && !boot) return; //link opted out of history via the addToHistory data attribute

        var routeName   = routeProperties.name;
        let historyData = {
            routeProperties: routeProperties,
            contents: contents,
            elementId: elementId
        }
        //a pushed entry starts with the position the new route opened at (the app has placed it by
        //now), so it has one to return to even if the visitor never scrolls on it
        if (scrollY == null && !boot && restoreScroll) scrollY = Math.round(window.scrollY);
        if (scrollY != null) historyData.scrollY = scrollY;

        //push the actual requested route so dynamic URLs (e.g "/user/7") survive in the address bar
        let path = routeProperties.route != undefined ? routeProperties.route : routeConfigs.routes[routeName].path;
        let title = routeConfigs.routes[routeName].pageTitle;

        //store page details in history state
        if (boot) history.replaceState(JSON.stringify(historyData), title, location.pathname + location.search + location.hash);
        else history.pushState(JSON.stringify(historyData), title, path);
    }

    function readSavedScroll(state){
        //The scrollY an engine history entry recorded, or null
        try {
            let data = typeof state == "string" ? JSON.parse(state) : null;
            return data != null && typeof data.scrollY == "number" ? data.scrollY : null;
        } catch (error) {
            return null;
        }
    }

    function rememberScroll(){
        //Writes the current scroll position into the history entry on screen, if the engine owns it
        if (!restoreScroll || typeof history.state != "string") return;
        try {
            let data = JSON.parse(history.state);
            if (data == null || data.routeProperties == undefined) return;
            data.scrollY = Math.round(window.scrollY);
            history.replaceState(JSON.stringify(data), "", location.href);
        } catch (error) {
            //not the engine's state, or the browser is rate-limiting replaceState: skip this save
        }
    }

    function scrollToSaved(scrollY){
        //"instant", not "auto": a page with scroll-behavior: smooth would otherwise glide there
        if (!restoreScroll || scrollY == null) return;
        window.scrollTo({top: scrollY, left: 0, behavior: "instant"});
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

    function parseBooleanAttribute(value){
        //HTML-friendly boolean: "false" and "0" disable, any other value (including bare presence) enables
        return !(value === "false" || value === "0");
    }

    function fetchData(container=null, element=null, cache=null, show=null) {
        //show(html) mounts the content for the navigation that asked for it (see getLinkContent)

        var urlTarget   = routeProperties.properties["target"];
        var routeName   = routeProperties.name;
        var routeData   = routeProperties.data;

        if (preClickCallback != null) preClickCallback(element);

        //the link this request is for; a newer click changes the node's link, not this one
        var requestedLink = container != null ? container.dataset.link : null;
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
        
                        show(xhr.responseText).then(function(mounted){
                            if (!mounted) return; //a newer navigation took over

                            // Pass: element, routeid, callbackKey
                            usedloadCallBack != null ? setTimeout(function(){usedloadCallBack(element, routeName, callbackKey, routeData)}, 200): null;

                            container.dataset.state = "received";

                            saveState(xhr.responseText, element.id);
                        });

                    }

                }else{//get and return only content
                     //call callback function if enable
                     usedloadCallBack != null ? setTimeout(function(){usedloadCallBack(element, routeName, callbackKey, routeProperties.data)}, 200): null;
                }
            }else{
                releaseFailed("404 not found\nThe resource URL "+urlTarget+ " cannot be found on this server");
            }
        });

        //Reported in the console, as a failed page or section fetch is; a blocking alert is no way to
        //tell a visitor. The node is released so clicking the link again refetches. A request with
        //no response at all (offline, DNS, aborted) never fires "load", so those end here too.
        function releaseFailed(message){
            console.error(message);
            if (container != null && container.dataset.link == requestedLink){
                container.dataset.state = "received";
                delete container.dataset.link;
            }
            if (pendingContent != null && pendingContent.link == requestedLink) pendingContent = null;
        }
        ["error", "timeout", "abort"].forEach(function(type){
            xhr.addEventListener(type, function(){
                releaseFailed("The resource URL "+urlTarget+" could not be loaded ("+type+")");
            });
        });
        
        xhr.send(); //auto load its content
        
    }

    function fireExitCallback(){
        // Notify the outgoing route before its content is replaced, so pages can release timers/listeners
        if (activeRoute == null) return;

        let usedExitCallback    = null;
        let outgoingRoute       = routeConfigs.routes[activeRoute.name];

        if (outgoingRoute != undefined && outgoingRoute.exitCallback != undefined){
            usedExitCallback = outgoingRoute.exitCallback;
        }else if (exitCallback != null){
            usedExitCallback = exitCallback;
        }

        if (usedExitCallback != null) usedExitCallback(activeRoute.name, activeRoute.data);
    }

    function isStylesheet(node){
        return node.nodeName == "LINK" && node.relList.contains("stylesheet") && !node.relList.contains("alternate");
    }

    function sameStylesheet(mounted, link){
        //mounted is live in the document, link is still in a template, so resolve its href by hand
        let href = new URL(link.getAttribute("href") || "", document.baseURI).href;
        return mounted.href == href && (mounted.getAttribute("media") || "") == (link.getAttribute("media") || "");
    }

    function waitForStylesheet(link){
        //Settles when the stylesheet has loaded or failed, or after styleTimeout ms, so a slow or
        //broken stylesheet delays a route by at most that long instead of blocking it
        return new Promise(function(resolve){
            let timer = setTimeout(done, styleTimeout);
            function done(){
                clearTimeout(timer);
                link.removeEventListener("load", done);
                link.removeEventListener("error", done);
                resolve();
            }
            link.addEventListener("load", done);
            link.addEventListener("error", done);
        });
    }

    function stageHtml(mountPoint, html, replace, hold=true){
        //Parses a fragment off-screen and starts loading the stylesheets it carries, without showing
        //it. Mounting with innerHTML paints the markup before those stylesheets arrive, so until
        //they do it shows unstyled (an image with no size of its own fills the screen).
        //The fragment's top-level stylesheet links go into the mount point at once. With hold they
        //sit behind media="not all", so they load without restyling the route still on screen;
        //at boot nothing is on screen yet, so they apply as they arrive (a held stylesheet is also
        //fetched at the lowest priority). commit() takes the old content out, switches the links
        //on and inserts the rest, in one task. Only links whose media matches are waited for.
        //A link already mounted there with the same href and media is kept instead of fetched
        //again, as long as that leaves the new links in their written order.
        let template        = document.createElement("template");
        template.innerHTML  = html;

        let newLinks    = Array.from(template.content.children).filter(isStylesheet);
        let oldLinks    = replace ? Array.from(mountPoint.children).filter(function(node){ return isStylesheet(node) && !stagedLinks.has(node); }) : [];
        let kept        = [];
        let lastIndex   = -1;

        //Reuse a leading run of the new links, in order, from the links already mounted
        for (let x = 0; x < newLinks.length; x++){
            let index = oldLinks.findIndex(function(old, i){ return i > lastIndex && sameStylesheet(old, newLinks[x]); });
            if (index == -1) break;
            kept.push(oldLinks[index]);
            lastIndex = index;
            newLinks[x].remove();
        }

        let added       = newLinks.slice(kept.length);
        let media       = added.map(function(link){ return link.getAttribute("media"); });
        let settled     = false;

        kept.forEach(function(link){ stagedLinks.add(link); });
        let ready = Promise.all(added.map(function(link, i){
            let loaded = media[i] == null || matchMedia(media[i]).matches ? waitForStylesheet(link) : null;
            if (hold) link.setAttribute("media", "not all");
            stagedLinks.add(link);
            mountPoint.appendChild(link);
            return loaded;
        }));

        function release(){
            settled = true;
            kept.concat(added).forEach(function(link){ stagedLinks.delete(link); });
        }

        let stage = {
            ready: ready,
            commit: function(){
                if (settled) return;
                if (replace){
                    //Links staged by another fragment stay: that fragment commits or cancels them
                    Array.from(mountPoint.childNodes).forEach(function(node){
                        if (!stagedLinks.has(node)) node.remove();
                    });
                }
                added.forEach(function(link, i){
                    media[i] == null ? link.removeAttribute("media") : link.setAttribute("media", media[i]);
                });
                let before = kept.concat(added).find(function(link){ return link.parentNode == mountPoint; });
                mountPoint.insertBefore(template.content, before || null);
                release();
            },
            cancel: function(){
                if (settled) return;
                added.forEach(function(link){ link.remove(); });
                release();
            }
        };
        activeStages.push(stage);
        return stage;
    }

    function beginNavigation(){
        //A newer navigation supersedes every fragment still waiting on its stylesheets
        activeStages.forEach(function(stage){ stage.cancel(); });
        activeStages = [];
        return ++navigationToken;
    }

    async function mountWhenStyled(token, sectionStages, contentStage, flush, route){
        //Waits for the stylesheets of every staged fragment, then mounts them all in one task, so a
        //route's content and sections appear together and already styled. Resolves false, mounting
        //nothing, when a newer navigation began in the meantime.
        let stages = (await sectionStages).slice();
        if (contentStage != null) stages.push(contentStage);

        await Promise.all(stages.map(function(stage){ return stage.ready; }));

        activeStages = activeStages.filter(function(stage){ return stages.indexOf(stage) == -1; });
        if (token != navigationToken){
            stages.forEach(function(stage){ stage.cancel(); });
            return false;
        }

        if (flush != undefined) flushElements(flush);
        if (contentStage != null){
            fireExitCallback();
            contentStage.commit();
            activeRoute = route;
        }
        stages.forEach(function(stage){
            if (stage != contentStage) stage.commit();
        });
        return true;
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
                    location.assign(routeProperties.properties.authURL);
                }

            }else{
                renderContent();
            }

        }else{
            document.querySelector("body").innerText = "404";
        }

    }

    function loadPageContents(token, sectionStages, uncloak){

        let route = location.pathname;
        var content = null;
        //a reload keeps the entry's state, so the position the visitor had is still in it
        let savedScroll = readSavedScroll(history.state);

        if(routeConfigs.routes.default.pattern == route){

            routeProperties = {
                status: true,
                name: "default",
                properties: routeConfigs.routes.default,
                route: route,
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

        if (content == null) return uncloak(); //sent to the auth page

        content.then(function(data){
            let contentStage    = data.status && defaultContentNode != null ? stageHtml(defaultContentNode, data.content, true, false) : null;
            let route           = {name: routeProperties.name, data: routeProperties.data};

            //The sections and the content appear together, once their stylesheets apply
            return mountWhenStyled(token, sectionStages, contentStage, undefined, route).then(function(mounted){
                uncloak();
                if (!mounted || contentStage == null) return;

                // Set page title
                setPageTitle(null);

                //store page details in the entry page's own history entry
                saveState(data.content, null, true, savedScroll);

                if (bootCallback != null) bootCallback(routeProperties.name, routeProperties.data);
                scrollToSaved(savedScroll);
            });
        }).catch(function(error){
            uncloak();
            throw error;
        })
    }

    async function getLinkContent(element){

        //reset per-link flags so one link's attributes don't leak into the next navigation
        loadIntoNode = true;
        addToHistory = true;

        if (element.dataset[hyphenatedToCamel(dataAttributes.loadIntoNode)] != undefined){
            loadIntoNode = parseBooleanAttribute(element.dataset[hyphenatedToCamel(dataAttributes.loadIntoNode)]);
        }

        if (element.dataset[hyphenatedToCamel(dataAttributes.addToHistory)] != undefined){
            addToHistory = parseBooleanAttribute(element.dataset[hyphenatedToCamel(dataAttributes.addToHistory)]);
        }

        //The entry being left keeps where the visitor was, for when Back returns to it. Saved now,
        //before the new content (and any scroll the app does for it) changes the position.
        if (addToHistory && loadIntoNode){
            clearTimeout(scrollSaveTimer);
            rememberScroll();
        }

        var routeName   = routeProperties.name;
        var route       = {name: routeName, data: routeProperties.data};
        var flush       = routeProperties.properties.flush;
        var token       = null;

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
            
            cache = cache == null ? true : parseBooleanAttribute(cache); //The default is set to true, and content loaded will be cached

            //Clicking again a link whose content is still on its way changes nothing
            if (pendingContent != null && pendingContent.node == contentNode && pendingContent.link == dataLink && pendingContent.token == navigationToken) return;

            token = beginNavigation();
            var sectionStages = stagePageSections(routeProperties, routeName);

            if(contentNode.dataset.link != dataLink){
                contentNode.dataset.state = "receiving";
                contentNode.dataset.link = dataLink; //content node linked to the last click link (this is to avoid later overiding by already previously clicked link)
                pendingContent = {node: contentNode, link: dataLink, token: token};

                //Mounts the content with the route's sections, once their stylesheets apply
                var show = function(html){
                    return mountWhenStyled(token, sectionStages, stageHtml(contentNode, html, true), flush, route);
                };

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
                        let html = existingLinksContents[routeName];

                        show(html).then(function(mounted){
                            if (!mounted) return; //a newer navigation took over

                            saveState(html, element.id);

                            contentNode.dataset.state = "received";
                            usedloadCallBack != null ? setTimeout(function(){usedloadCallBack(element, routeName, callbackKey, route.data)}, 200): null;
                        });

                    } else { //link does not exist, get from server
                        fetchData(contentNode, element, cache, show);
                    }

                }else{
                     //ignore cache storage and Load from server
                    fetchData(contentNode, element, cache, show);
                }
            }else{
                //The node already holds this link's content: only the sections are reloaded
                mountWhenStyled(token, sectionStages, null, flush, route);
            }

        }else { //just get only content
            token = beginNavigation();
            fetchData(null, element, cache);
            mountWhenStyled(token, stagePageSections(routeProperties, routeName), null, flush, route);
        }

        // Set Page title
        setPageTitle(element);
    }

    function stagePageSections(targetRouteProperties, routeName, atBoot=false){
        //Stages every page section of a route, fetching the uncached ones in parallel. Resolves to
        //the stages, leaving out sections that could not be fetched.
        //An omitted replaceOld replaces at boot and appends on navigation, as it always has.
        let pageSections = Object.entries(targetRouteProperties.properties.pageSections || {});

        return Promise.all(pageSections.map(function(section){
            let replace = section[1].replaceOld === undefined ? atBoot : section[1].replaceOld;
            return stageSection("pageSections", routeName+"-"+section[0], section[1].source, section[1].mountPoint, replace, !atBoot);
        })).then(function(stages){
            return stages.filter(function(stage){ return stage != null; });
        });
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
                route: sourceRoute, //the actual requested route, e.g "/user/7" for the pattern "/user/;id"
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
                        // ";name" captures the segment, ";name:regex" validates it against the regex first
                        let spec            = patternSegments[x].slice(1);
                        let separatorIndex  = spec.indexOf(":");
                        let name            = separatorIndex == -1 ? spec : spec.slice(0, separatorIndex);
                        let segmentPattern  = separatorIndex == -1 ? null : spec.slice(separatorIndex + 1);

                        if (segmentPattern != null && !(new RegExp(segmentPattern)).test(routeSegments[x])){
                            state.status = false;
                            break;
                        }

                        state.data[name != "" ? name : x+1] = routeSegments[x];
                    }else if (routeSegments[x] != patternSegments[x]) {
                        state.status = false;
                        break;
                    }

                }
            }

        }else{
            state.status = false; //segment count mismatch: this route does not match the pattern
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
        return loggedIn;
    }

    function renderContent(){
        //Stage the block sections and the entry route's page sections; loadPageContents() mounts
        //them with the route's content once all their stylesheets apply.
        //The shell around the mount points is often styled by those same fragments' stylesheets,
        //so the page is hidden until then rather than painted half-styled.
        let uncloak         = cloakPage();
        let token           = beginNavigation();
        let blockSections   = Object.entries(routeConfigs.blockSections || {});

        let blockStages     = blockSections.map(function(section){
            return stageSection("blockSections", section[0], section[1].source, section[1].mountPoint, section[1].replaceOld, false);
        });
        let sectionStages   = Promise.all(blockStages.concat([stagePageSections(routeProperties, routeProperties.name, true)]))
            .then(function(stages){
                return stages.flat().filter(function(stage){ return stage != null; });
            });

        loadPageContents(token, sectionStages, uncloak);
    }

    function cloakPage(){
        //Hides the whole page and returns the function that shows it again
        let root        = document.documentElement;
        let previous    = root.style.visibility;
        let hadStyle    = root.hasAttribute("style");
        root.style.visibility = "hidden";
        return function(){
            root.style.visibility = previous;
            if (!hadStyle && root.getAttribute("style") == "") root.removeAttribute("style");
        };
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
            //Keeps the stylesheets a staged fragment is loading or keeping in the element
            Array.from($$.ss(element).childNodes).forEach(node => {
                if (!stagedLinks.has(node)) node.remove();
            });
        });
    }

    async function aGet(url){
        const response = await fetch(url);
        return await response.text();
    }

    async function stageSection(sectionType, name, url, mountPoint, replace=true, hold=true) {
        //Gets a section's HTML from the cache, or from the server (and caches it), and stages it in
        //its mount point. Resolves null when it can't be fetched, so the route still mounts.
        let html = null;

        if(sectionDataExist(sectionType, name)){
            html = sessionStorage.getIterable(sectionType)[name];
        }else{
            try{
                const response  = await fetch(url);
                const content   = await response.text();

                if (!response.ok){
                    console.error("404 not found\nThe resource URL "+url+ " cannot be found on this server");
                }else if (response.headers.get('X-Fallback') === 'true'){
                    console.error('404: File '+url+' not found');
                }else{
                    html = content;
                    saveSectionData(sectionType, name, html);
                }
            }catch(error){
                console.error("Could not fetch "+url, error);
            }
        }

        return html == null ? null : stageHtml($$.ss(mountPoint), html, replace, hold);
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
        
        cacheBuilderTimer = setTimeout(function(){
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
                                const activeCache = sessionStorage.pageSections != undefined ? sessionStorage.getIterable("pageSections") : {};
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
        initialize: { writable: false },
        destroy: { writable: false },
        clearCache: { writable: false },
        loggedIn: {
            set: function(value) {
                validateBoolean(value, "SPAEngine.loggedIn property value must be a boolean");
                loggedIn = value;
            },
            get: function() {
                return loggedIn;
            }
        }
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
        exitCallback: {
            set: function(value) {
                validateFunction(value, "config.exitCallback property value must be a function");
                exitCallback = value;
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
        },
        cacheVersion: {
            set: function(value){
                //Any string or number that changes per release, e.g. the build id from a version.json.
                //Set before initialize(), a mismatch clears the cache before the first route mounts;
                //set on a running engine, it clears at once, so the next navigation fetches fresh.
                if (!((typeof value == "string" && value.trim() != "") || (typeof value == "number" && isFinite(value)))) {
                    throw new TypeError("config.cacheVersion property value must be a non-empty string or a finite number");
                }
                cacheVersion = String(value);
                if (initialize) syncCacheVersion();
            },
            get: function(){
                return cacheVersion;
            }
        },
        restoreScroll: {
            set: function(value){
                //Whether back/forward and reload return to the scroll position each history entry had.
                //Applied at initialize() (the scroll listener and the browser setting), so it is
                //fixed from then on.
                if (typeof value != "boolean") {
                    throw new TypeError("config.restoreScroll property value must be a boolean");
                }
                if (initialize) throw new Error("config.restoreScroll must be set before initialize()");
                restoreScroll = value;
            },
            get: function(){
                return restoreScroll;
            }
        },
        styleTimeout: {
            set: function(value){
                //How long, in ms, a fragment waits for its stylesheets before it is mounted anyway.
                //0 mounts as soon as the HTML is in, without waiting.
                if (typeof value != "number" || !isFinite(value) || value < 0) {
                    throw new TypeError("config.styleTimeout property value must be a finite number of milliseconds, 0 or more");
                }
                styleTimeout = value;
            },
            get: function(){
                return styleTimeout;
            }
        }
    })
}
/**********************************************************************/
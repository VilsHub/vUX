import {SPAEngine} from "/lib/vUX/vUX-spaEngine.js";
import {ProgressIndicator} from "/lib/vUX/vUX-progressIndicator.js";
import {TablePage} from "/pages/table.js";

function demoLog(msg){
    document.querySelector("#log").textContent += msg + "\n";
}

function run(){
    var spa = new SPAEngine($$.ss("#contentBoundary"));
    var tablePage = new TablePage(demoLog);

    // Progress indicator: shown while a route fetch is in flight, completed on mount
    var progressSpace = $$.ss("#progressSpace");
    var progress = new ProgressIndicator(progressSpace);
    progress.config.progressType = "linear";
    progress.config.progressStyle = {
        linear: { progressColor: "darkturquoise", trackColor: "#eee", location: "top", style: 3 }
    };
    progress.initialize();

    function showLoadProgress(){
        progress.showProgress();
        demoLog("[progress] shown");
    }
    function completeLoadProgress(){
        if (progressSpace.querySelector(".vProgressItem") != null){ // cache hits never showed a bar
            progress.hideProgress();
            demoLog("[progress] completed");
        }
    }

    // Log everything a callback receives, and render the route param on the user page
    function reportParamRecovery(context, element, routeName, callbackKey, params){
        demoLog("=== " + context + " ===");
        demoLog("routeName arg        : " + routeName);
        demoLog("callbackKey arg      : " + callbackKey);
        demoLog("params arg           : " + JSON.stringify(params));
        demoLog("element arg          : " + (element ? "#" + element.id : element));
        demoLog("location.pathname    : " + location.pathname);

        var uid = document.querySelector("#uid");
        if (uid && params) uid.textContent = params.id;
    }

    var routeConfigs = {
        blockSections: {},
        routes: {
            default: {
                pattern: "/",
                target: "/display/home.html",
                protected: false,
                authURL: "",
                skipInCacheBuilder: true,
                path: "/",
                group: "",
                pageTitle: "Home | vUX SPA example",
                pageSections: {},
                flush: []
            },
            user: {
                pattern: "/user/;id:[0-9]+", // named param "id", validated by regex
                target: "/display/user.html",
                protected: false,
                authURL: "",
                skipInCacheBuilder: true,
                path: "/user",
                group: "",
                pageTitle: "User | vUX SPA example",
                pageSections: {},
                flush: [],
                clickLoadCallbacks: {
                    showUser: function(element, routeName, callbackKey, params){
                        completeLoadProgress();
                        reportParamRecovery("clickLoadCallback 'showUser'", element, routeName, callbackKey, params);
                    }
                },
                historyCallbacks: {}
            },
            table: {
                pattern: "/table",
                target: "/display/table.html",
                protected: false,
                authURL: "",
                skipInCacheBuilder: true,
                path: "/table",
                group: "",
                pageTitle: "Live table | vUX SPA example",
                pageSections: {},
                flush: [],
                clickLoadCallbacks: {
                    showTable: function(element, routeName, callbackKey, params){
                        completeLoadProgress();
                        tablePage.mount();
                    }
                },
                historyCallbacks: {},
                // exit hook: fired before this route's content is replaced by another route
                exitCallback: function(routeName, params){
                    demoLog("[exit] leaving route '" + routeName + "'");
                    tablePage.destroy();
                }
            }
        }
    };

    spa.config.classes = { spaLink: "spa-link" };
    spa.config.dataAttributeNames = {
        clickLoadCallback: "click-callback",
        historyCallback: "history-callback",
        cache: "cache",
        addToHistory: "add-to-history"
    };
    spa.config.preClickCallback = function(element){
        showLoadProgress();
    };
    spa.config.clickLoadCallback = function(element, routeName, callbackKey, params){
        // fallback for links with no dedicated click-callback (e.g. the Home link)
        completeLoadProgress();
    };
    spa.config.exitCallback = function(routeName, params){
        // fallback for routes with no dedicated exitCallback
        demoLog("[exit] leaving route '" + routeName + "'");
    };
    spa.config.bootCallback = function(routeName, params){
        demoLog("=== bootCallback ===");
        demoLog("arguments received   : " + JSON.stringify([routeName, params]));
        reportParamRecovery("bootCallback", null, routeName, undefined, params);
        if (routeName === "table") tablePage.mount(); // direct load of /table
    };
    spa.config.routeConfigs = routeConfigs;
    spa.initialize();

    // ?autorun clicks through the links automatically — used for headless testing
    if (location.pathname === "/" && new URLSearchParams(location.search).has("autorun")) {
        function auto(delay, label, selector){
            setTimeout(function(){
                demoLog("[auto] " + label);
                document.querySelector(selector).click();
            }, delay);
        }
        auto(800,  "clicking /user/7", "#userLink");
        auto(3000, "clicking /user/8 (addToHistory=false, cache=false)", "#user8Link");
        auto(5200, "clicking /table", "#tableLink");
        auto(7200, "sort by price", "#btnSortPrice");
        auto(7600, "filter price > 500", "#btnFilter");
        auto(8000, "start ticker", "#btnTicker");
        auto(8400, "benchmark", "#btnBench");
        auto(9500, "clicking / (should fire the table exit hook)", "#homeLink");
    }
}

run();

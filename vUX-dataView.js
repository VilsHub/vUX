/*
 * vUX JavaScript library v4.0.0
 * https://library.vilshub.com/lib/vUX/
 *
 *
 * Released under the MIT license
 * https://library.vilshub.com/lib/vUX/license
 *
 * Date: 2026-07-25
 *
 *
 */
// Import vUX core
import { validateElement, validateFunction, validateObjectLiteral, validateString } from "./src/helpers.js";
import {
    resolveTemplate, patchBindings, destroyInstance, reconcileList
} from "./src/componentEngine.js";
import "./src/vUX-core-4.0.0-beta.js";

/***************************Data View*****************************/
export function DataView(container) {
    /**
     * Keyed data-to-DOM binding for large, frequently updated views (tables, dashboards, feeds).
     * The view keeps a JSON model in memory and maps every model row to a DOM node by key, so
     * updates translate into targeted DOM operations (one textContent write per changed cell,
     * node moves for sorts) instead of rebuilding or diffing the whole view.
     *
     * Template contract: the container must hold one element marked with the 'data-v-row'
     * attribute; inside it, elements marked 'data-v-field="<fieldName>"' render that field of
     * each row object. The template is detached on initialize() and cloned per row.
     *
     * The instancing itself lives in src/componentEngine.js, shared with vUX-component.js, so
     * rows also accept the rest of that engine's bindings - 'data-v-bind' for attributes,
     * 'data-v-on' for events, 'data-v-ref' for named nodes, 'data-v-show' and 'data-v-class'
     * for truthiness toggles. A row binding an event needs config.handlers set, as the
     * component module does.
     */
    validateElement(container, "DataView(x) constructor argument 1 must be an element (the container holding the row template)");

    var self = this;
    var initialized = false, destroyed = false, key = "id", model = [], rowTemplate = null, rowParent = null;
    var rows = new Map(); // row key -> engine entry {data, node, bindings, ...}
    var activeFilter = null;
    var handlers = null, formatters = null;

    //Read live by the engine, so config set after initialize() still applies to the next build.
    var spec = {
        methodName: "DataView",
        itemNoun: "row object",
        get formatters(){ return formatters; },
        get handlers(){ return handlers; },
        owner: function(){ return self; }
    };

    this.initialize = function(){
        if(!initialized){
            if (destroyed) throw new Error("This DataView has been destroyed, create a new instance instead of re-initializing");
            var marked = container.querySelector("[data-v-row]");
            if (marked == null) throw new Error("Setup Incomplete: no row template found. Mark the template element inside the container with the 'data-v-row' attribute");

            //The parent is read before the template is lifted out of it: it is where every
            //row is appended, and resolveTemplate() detaches the marked element.
            rowParent = marked.parentNode;
            rowTemplate = resolveTemplate(marked, "DataView(x) row template");
            rowTemplate.removeAttribute("data-v-row");

            initialized = true;
            if (model.length > 0) reconcile(model);
        }
    }

    this.setData = function(newData){
        assertUsable("setData");
        if (!Array.isArray(newData)) throw new Error("dataViewObj.setData(x) argument 1 must be an array of row objects");
        reconcile(newData);
    }

    this.updateRow = function(rowKey, fields){
        assertUsable("updateRow");
        validateObjectLiteral(fields, "dataViewObj.updateRow(x, y) argument 2 must be a literal object of fields to update");
        let entry = rows.get(rowKey);
        if (entry == undefined) throw new Error("dataViewObj.updateRow(x, y): no row found with "+key+" '"+rowKey+"'");

        //Merged rather than replaced so the row keeps the fields the caller did not name;
        //patchBindings() then writes only the ones whose value actually moved.
        let merged = Object.assign({}, entry.data, fields);
        patchBindings(entry, merged, spec);

        //The model holds the same row objects the caller handed in, so it is updated to match.
        for (let x = 0; x < model.length; x++){
            if (model[x][key] === rowKey){
                model[x] = merged;
                break;
            }
        }
    }

    this.sort = function(compareFn){
        assertUsable("sort");
        validateFunction(compareFn, "dataViewObj.sort(x) argument 1 must be a compare function like Array.prototype.sort takes");
        model.sort(compareFn);

        // re-appending existing nodes moves them, preserving their focus/input/selection state
        let fragment = document.createDocumentFragment();
        for (let x = 0; x < model.length; x++) fragment.appendChild(rows.get(model[x][key]).node);
        rowParent.appendChild(fragment);
    }

    this.filter = function(predicate=null){
        assertUsable("filter");
        if (predicate != null) validateFunction(predicate, "dataViewObj.filter(x) argument 1 must be a predicate function, or null to clear the filter");
        activeFilter = predicate;
        applyFilter();
    }

    this.getData = function(){
        return model.slice();
    }

    this.destroy = function(){
        // release the model, the key->node map and all managed rows; call when the view's page is exited
        rows.forEach(function(entry){ destroyInstance(entry); });
        rows = new Map();
        model = [];
        rowTemplate = null;
        rowParent = null;
        activeFilter = null;
        //Cleared so that the 'has been destroyed' guard in initialize() is actually reachable:
        //while this stayed true, re-initializing a destroyed view silently did nothing instead.
        initialized = false;
        destroyed = true;
    }

    this.config = {}

    function assertUsable(method){
        if (destroyed) throw new Error("dataViewObj."+method+"() called on a destroyed DataView");
        if (!initialized) throw new Error("Please initialize using the 'initialize()' method, before calling dataViewObj."+method+"()");
    }

    function reconcile(newData){
        let result = reconcileList(rowParent, newData, rows, rowTemplate, key, spec);
        rows = result.entries;
        model = newData.slice();
        if (activeFilter != null) applyFilter();
    }

    function applyFilter(){
        //Written straight onto the row's own display, which is why a row template should not
        //also carry a 'data-v-show' binding on its outermost element: the two would contend.
        for (let x = 0; x < model.length; x++){
            let entry = rows.get(model[x][key]);
            entry.node.style.display = (activeFilter == null || activeFilter(entry.data)) ? "" : "none";
        }
    }

    Object.defineProperties(this, {
        initialize: { writable: false },
        setData: { writable: false },
        updateRow: { writable: false },
        sort: { writable: false },
        filter: { writable: false },
        getData: { writable: false },
        destroy: { writable: false },
        config: { writable: false }
    })

    Object.defineProperties(this.config, {
        key: {
            set: function(value) {
                validateString(value, "config.key property value must be a string naming the unique key field of each row object");
                key = value;
            }
        },
        data: {
            set: function(value) {
                if (!Array.isArray(value)) throw new Error("config.data property value must be an array of row objects");
                if (initialized){
                    reconcile(value);
                }else{
                    model = value.slice();
                }
            }
        },
        handlers: {
            set: function(value) {
                validateObjectLiteral(value, "config.handlers property value must be a literal object of functions, keyed by the name used in a data-v-on binding");
                handlers = value;
            }
        },
        formatters: {
            set: function(value) {
                validateObjectLiteral(value, "config.formatters property value must be a literal object of functions, keyed by field name");
                formatters = value;
            }
        }
    })
}
/**********************************************************************/

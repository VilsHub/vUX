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
import { validateElement, validateString, validateFunction, validateObjectLiteral } from "./src/helpers.js";
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
     */
    validateElement(container, "DataView(x) constructor argument 1 must be an element (the container holding the row template)");

    var initialized = false, destroyed = false, key = "id", model = [], rowTemplate = null, rowParent = null;
    var rows = new Map(); // row key -> {data, node, cells}
    var activeFilter = null;

    this.initialize = function(){
        if(!initialized){
            if (destroyed) throw new Error("This DataView has been destroyed, create a new instance instead of re-initializing");
            rowTemplate = container.querySelector("[data-v-row]");
            if (rowTemplate == null) throw new Error("Setup Incomplete: no row template found. Mark the template element inside the container with the 'data-v-row' attribute");
            rowParent = rowTemplate.parentNode;
            rowTemplate.remove();
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

        for (let field in fields){
            if (entry.data[field] !== fields[field]){
                entry.data[field] = fields[field];
                if (entry.cells[field] != undefined) entry.cells[field].textContent = fields[field];
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
        rows.forEach(function(entry){ entry.node.remove(); });
        rows = new Map();
        model = [];
        rowTemplate = null;
        rowParent = null;
        activeFilter = null;
        destroyed = true;
    }

    this.config = {}

    function assertUsable(method){
        if (destroyed) throw new Error("dataViewObj."+method+"() called on a destroyed DataView");
        if (!initialized) throw new Error("Please initialize using the 'initialize()' method, before calling dataViewObj."+method+"()");
    }

    function buildRow(rowData){
        let node = rowTemplate.cloneNode(true);
        let cells = {};
        let cellNodes = node.querySelectorAll("[data-v-field]");

        for (let x = 0; x < cellNodes.length; x++){
            cells[cellNodes[x].dataset.vField] = cellNodes[x];
        }

        let entry = {data: rowData, node: node, cells: cells};
        for (let field in cells) cells[field].textContent = rowData[field] != undefined ? rowData[field] : "";
        return entry;
    }

    function reconcile(newData){
        let seen = new Map();
        let fragment = document.createDocumentFragment();

        for (let x = 0; x < newData.length; x++){
            let rowData = newData[x];
            let rowKey  = rowData[key];
            if (rowKey == undefined) throw new Error("DataView: the row object at index "+x+" has no value for the key field '"+key+"'");

            let entry = rows.get(rowKey);
            if (entry == undefined){ // new key: build a fresh row
                entry = buildRow(rowData);
            }else{ // existing key: patch only the fields that changed
                for (let field in entry.cells){
                    if (entry.data[field] !== rowData[field]){
                        entry.cells[field].textContent = rowData[field] != undefined ? rowData[field] : "";
                    }
                }
                entry.data = rowData;
            }
            seen.set(rowKey, entry);
            fragment.appendChild(entry.node); // moves already-mounted nodes, keeping their state
        }

        // drop rows whose key is gone from the new data
        rows.forEach(function(entry, rowKey){
            if (!seen.has(rowKey)) entry.node.remove();
        });

        rows = seen;
        model = newData.slice();
        rowParent.appendChild(fragment);
        if (activeFilter != null) applyFilter();
    }

    function applyFilter(){
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
        }
    })
}
/**********************************************************************/

/*
 * vUX JavaScript library v4.0.0
 * https://library.vilshub.com/lib/vUX/
 *
 *
 * Released under the MIT license
 * https://library.vilshub.com/lib/vUX/license
 *
 * Date: 2026-09-17
 *
 *
 */
// Import vUX core
import { validateElement, validateFunction, validateArray } from "./src/helpers.js";
import {
    resolveTemplate, buildInstance, patchBindings, destroyInstance, reconcileList,
    validateHandlers, validateFormatters, validateKeyName
} from "./src/componentEngine.js";
import "./src/vUX-core-4.0.0-beta.js";

/***************************Component*****************************/
export function Component(template) {
    /**
     * A reusable component of the consumer's own: markup they wrote, marked up with
     * data-v-* bindings, cloned and managed by vUX.
     *
     * Two objects are involved. A Component is the definition - configured once,
     * initialized once - and mount() returns an Instance, one per node placed in the
     * page. The definition owns the handlers and formatters; the instance owns a node,
     * its data, and whatever was mounted inside it.
     *
     * Binding contract, all of which live on the template's own markup:
     *   data-v-field="name"              textContent from the field
     *   data-v-bind="src:avatar, alt:name"   attributes from fields
     *   data-v-on="click:follow"         events to config.handlers entries
     *   data-v-ref="submitBtn"           named node, read back with instance.ref()
     *   data-v-show="verified"           toggles display on truthiness ('!' negates)
     *   data-v-class="active:isOpen"     toggles a class on truthiness ('!' negates)
     *
     * Every binding value is a field name, never an expression. There is no data-v-if
     * and no data-v-for: this is a binding layer, not a template language. Anything
     * conditional beyond a truthiness check goes in config.formatters or in the
     * onUpdate callback, where it is ordinary JavaScript.
     */
    validateElement(template, "Component(x) constructor argument 1 must be an element (a <template>, or the markup to use as the component template)");

    var self = this;
    var initialized = false, destroyed = false;
    var protoNode = null, key = null;
    var handlers = null, formatters = null;
    var onMount = null, onUpdate = null, onDestroy = null;
    var instances = [];                 //every live instance, in mount order
    var listEntries = new Map();        //key -> engine entry, for sync()
    var listContainer = null;

    //Passed to the engine on every call. It reads the CURRENT values rather than a
    //snapshot, so config set between two mounts takes effect on the second.
    var spec = {
        methodName: "componentObj",
        get formatters(){ return formatters; },
        get handlers(){ return handlers; },
        owner: function(){ return self; }
    };

    this.initialize = function(){
        if (initialized) return;
        if (destroyed) throw new Error("This Component has been destroyed, create a new instance instead of re-initializing");

        //Resolved here rather than in the constructor so that a template added to the
        //DOM after construction still works, and so an in-place template is not lifted
        //out of the page until the consumer actually asks for it.
        protoNode = resolveTemplate(template, "Component(x) constructor argument 1");
        initialized = true;
    }

    this.mount = function(container, data, position = "append"){
        assertUsable("mount");
        validateElement(container, "componentObj.mount(x, y) argument 1 must be an element (the container to mount into)");
        if (data == undefined || data == null || typeof data != "object" || Array.isArray(data)){
            throw new Error("componentObj.mount(x, y) argument 2 must be an object of the fields this component binds");
        }

        var entry = buildInstance(protoNode, data, spec);
        place(container, entry.node, position);

        var instance = makeInstance(entry);
        instances.push(instance);
        if (onMount != null) onMount(instance);
        return instance;
    }

    this.sync = function(container, dataArray){
        assertUsable("sync");
        validateElement(container, "componentObj.sync(x, y) argument 1 must be an element (the container to sync into)");
        validateArray(dataArray, "componentObj.sync(x, y) argument 2 must be an array of objects");
        if (key == null) throw new Error("componentObj.sync(x, y): config.key must be set to the name of a unique field before syncing a list");

        //A container can only be synced by one component at a time: the reconcile owns
        //every child it manages, and two components sharing a container would each treat
        //the other's nodes as rows that had disappeared.
        if (listContainer != null && listContainer !== container){
            throw new Error("componentObj.sync(x, y): this component is already syncing a different container; use a second Component for a second list");
        }
        listContainer = container;

        var result = reconcileList(container, dataArray, listEntries, protoNode, key, {
            methodName: "componentObj.sync(x, y)",
            formatters: formatters,
            handlers: handlers,
            owner: spec.owner,
            //The Instance is made whether or not onMount is set: sync()'s return value,
            //instances() and destroyAll() all reach a row through entry.instance.
            onMount: function(entry){ var instance = makeInstance(entry); if (onMount != null) onMount(instance); },
            onUpdate: function(entry, changed){ if (onUpdate != null) onUpdate(entry.instance, changed); },
            onDestroy: function(entry){ if (onDestroy != null) onDestroy(entry.instance); }
        });

        listEntries = result.entries;

        var out = [];
        for (var x = 0; x < result.order.length; x++) out.push(result.order[x].instance);
        return out;
    }

    this.instances = function(){
        var live = [];
        for (var x = 0; x < instances.length; x++){
            if (!instances[x].destroyed) live.push(instances[x]);
        }
        listEntries.forEach(function(entry){
            if (entry.instance != undefined && !entry.instance.destroyed) live.push(entry.instance);
        });
        return live;
    }

    this.destroyAll = function(){
        var live = self.instances();
        for (var x = 0; x < live.length; x++) live[x].destroy();
        instances = [];
        listEntries = new Map();
        listContainer = null;
    }

    this.destroy = function(){
        //Tears down every instance this definition produced. The template element itself
        //is left alone when it is a <template> - it is the consumer's markup and was only
        //ever read from. An in-place template was removed from the page by initialize()
        //and is not put back: it was lifted precisely because the consumer wanted it gone.
        if (destroyed) return;
        self.destroyAll();
        protoNode = null;
        initialized = false;
        destroyed = true;
    }

    this.config = {}

    /**
     * Wraps an engine entry in the public Instance object, and back-links the two so
     * that a reconcile can find the instance belonging to a row it just patched.
     */
    function makeInstance(entry){
        var instance = {};

        Object.defineProperties(instance, {
            node: {
                get: function(){ return entry.node; }
            },
            data: {
                //A copy, so that mutating what you read cannot put the instance's bindings
                //out of step with the data they were last rendered from. Use update() to change it.
                get: function(){ return Object.assign({}, entry.data); }
            },
            destroyed: {
                get: function(){ return entry.destroyed; }
            },
            update: {
                value: function(fields){
                    if (entry.destroyed) throw new Error("instanceObj.update(x) called on a destroyed instance");
                    if (fields == undefined || fields == null || typeof fields != "object" || Array.isArray(fields)){
                        throw new Error("instanceObj.update(x) argument 1 must be an object of the fields to change");
                    }
                    var merged = Object.assign({}, entry.data, fields);
                    var changed = patchBindings(entry, merged, spec);
                    if (onUpdate != null && changed.length > 0) onUpdate(instance, changed);
                    return changed;
                },
                writable: false
            },
            ref: {
                value: function(name){
                    var node = entry.bindings.refs[name];
                    if (node == undefined){
                        var known = Object.keys(entry.bindings.refs);
                        throw new Error("instanceObj.ref(x): no node marked data-v-ref=\"" + name + "\" in this component" +
                            (known.length > 0 ? "; it has " + known.join(", ") : "; it has no data-v-ref nodes at all"));
                    }
                    return node;
                },
                writable: false
            },
            mount: {
                //A child mounted through the parent is OWNED by it: destroying the parent
                //destroys the child. This is the seam that makes nesting safe to tear down,
                //and the reason every vUX component now has a destroy() to call from onDestroy.
                value: function(childComponent, container, data, position = "append"){
                    if (entry.destroyed) throw new Error("instanceObj.mount(x, y, z) called on a destroyed instance");
                    if (childComponent == null || typeof childComponent.mount != "function"){
                        throw new Error("instanceObj.mount(x, y, z) argument 1 must be a Component object");
                    }
                    var child = childComponent.mount(container, data, position);
                    entry.children.push(child);
                    return child;
                },
                writable: false
            },
            destroy: {
                value: function(){
                    if (entry.destroyed) return;

                    //Children first, so a child's onDestroy still sees its parent's node in place.
                    for (var x = 0; x < entry.children.length; x++) entry.children[x].destroy();
                    entry.children = [];

                    if (onDestroy != null) onDestroy(instance);
                    destroyInstance(entry);
                },
                writable: false
            }
        })

        entry.instance = instance;
        return instance;
    }

    function place(container, node, position){
        if (position == "append"){
            container.appendChild(node);
        }else if (position == "prepend"){
            container.insertBefore(node, container.firstChild);
        }else if (validateElement(position, "bool")){
            if (position.parentNode !== container){
                throw new Error("componentObj.mount(x, y, z) argument 3 must be a child of the container it is inserted before");
            }
            container.insertBefore(node, position);
        }else{
            throw new Error("componentObj.mount(x, y, z) argument 3 must be \"append\", \"prepend\", or an element of the container to insert before");
        }
    }

    function assertUsable(method){
        if (destroyed) throw new Error("componentObj." + method + "() called on a destroyed Component");
        if (!initialized) throw new Error("Please initialize using the 'initialize()' method, before calling componentObj." + method + "()");
    }

    Object.defineProperties(this, {
        initialize: { writable: false },
        mount: { writable: false },
        sync: { writable: false },
        instances: { writable: false },
        destroyAll: { writable: false },
        destroy: { writable: false },
        config: { writable: false }
    })

    Object.defineProperties(this.config, {
        key: {
            set: function(value){
                validateKeyName(value, "componentObj.config.key");
                key = value;
            }
        },
        handlers: {
            set: function(value){
                validateHandlers(value, "componentObj.config.handlers");
                handlers = value;
            }
        },
        formatters: {
            set: function(value){
                validateFormatters(value, "componentObj.config.formatters");
                formatters = value;
            }
        },
        onMount: {
            set: function(value){
                validateFunction(value, "componentObj.config.onMount property value must be a function");
                onMount = value;
            }
        },
        onUpdate: {
            set: function(value){
                validateFunction(value, "componentObj.config.onUpdate property value must be a function");
                onUpdate = value;
            }
        },
        onDestroy: {
            set: function(value){
                validateFunction(value, "componentObj.config.onDestroy property value must be a function");
                onDestroy = value;
            }
        }
    })
}
/**********************************************************************/

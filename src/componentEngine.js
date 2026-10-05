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
// Shared template-instancing engine.
//
// This is the machinery behind both vUX-component.js (a consumer's own reusable
// component) and vUX-dataView.js (a keyed list of rows). Neither of them is a
// framework: there is no observation, no scheduler and no diffing of a virtual
// tree. A binding is read when an instance is built and again when it is patched,
// and nothing else happens in between.
//
// The value of every binding attribute is a FIELD NAME, optionally negated with
// '!'. It is never an expression. Anything conditional beyond a truthiness check
// belongs in a formatter or in the consumer's own callback, where it is ordinary
// JavaScript they can debug, rather than in a string this file has to interpret.

import { validateElement, validateString, validateObjectLiteral, validateFunction } from "./helpers.js";

export var BINDING_ATTRIBUTES = ["data-v-field", "data-v-bind", "data-v-on", "data-v-ref", "data-v-show", "data-v-class"];

/**
 * Resolves the element a component is built from into a detached prototype node.
 *
 * A <template> is inert, so its content is simply cloned out of it and the
 * template itself is left in the page. Any other element is markup the consumer
 * wrote inline: it is removed from the document and kept as the prototype, which
 * is how DataView has always treated its '[data-v-row]' element. The second form
 * renders as a visible placeholder until initialize() lifts it.
 */
export function resolveTemplate(element, methodName){
    validateElement(element, methodName + " must be an element (a <template>, or the markup to use as the component template)");

    if (element.nodeName == "TEMPLATE"){
        var fromTemplate = element.content.firstElementChild;
        if (fromTemplate == null) throw new Error(methodName + ": the <template> holds no element to use as the component root");
        return fromTemplate.cloneNode(true);
    }

    var proto = element;
    if (proto.parentNode != null) proto.parentNode.removeChild(proto);
    return proto;
}

//Collects the root and its descendants carrying 'attribute'. querySelectorAll alone
//would miss the root, and a component whose only binding sits on its outermost
//element is an ordinary thing to write.
function matching(root, attribute){
    var found = [];
    if (root.hasAttribute(attribute)) found.push(root);
    var inner = root.querySelectorAll("[" + attribute + "]");
    for (var x = 0; x < inner.length; x++) found.push(inner[x]);
    return found;
}

//"a:b, c:d" => [["a","b"],["c","d"]]. Used by data-v-bind, data-v-on and data-v-class.
function pairs(value, attribute, methodName){
    var out = [];
    var entries = value.split(",");
    for (var x = 0; x < entries.length; x++){
        var entry = entries[x].trim();
        if (entry == "") continue;
        var split = entry.indexOf(":");
        if (split < 1 || split == entry.length - 1){
            throw new Error(methodName + ": the " + attribute + " value '" + entry + "' is not a '<name>:<field>' pair");
        }
        out.push([entry.slice(0, split).trim(), entry.slice(split + 1).trim()]);
    }
    return out;
}

//A field reference is a name, optionally negated: "verified" or "!verified".
function readField(data, reference, formatters){
    var negated = reference.charAt(0) == "!";
    var name = negated ? reference.slice(1).trim() : reference;
    var value = data == null ? undefined : data[name];
    if (formatters != null && formatters[name] != undefined) value = formatters[name](value, data);
    return { name: name, value: value, negated: negated };
}

function truthy(read){
    return read.negated ? !read.value : !!read.value;
}

function displayText(value){
    return (value == undefined || value == null) ? "" : value;
}

/**
 * Reads every binding out of a freshly cloned node.
 *
 * The result is the instance's binding map. It is read once per instance rather
 * than once per update, so a patch is a walk over this map and not another pass
 * over the DOM.
 */
function collectBindings(node, spec){
    var map = { fields: [], binds: [], shows: [], classes: [], refs: {} };
    var x, y, target, parsed;

    var fieldNodes = matching(node, "data-v-field");
    for (x = 0; x < fieldNodes.length; x++){
        map.fields.push({ node: fieldNodes[x], field: fieldNodes[x].getAttribute("data-v-field").trim() });
    }

    var bindNodes = matching(node, "data-v-bind");
    for (x = 0; x < bindNodes.length; x++){
        parsed = pairs(bindNodes[x].getAttribute("data-v-bind"), "data-v-bind", spec.methodName);
        for (y = 0; y < parsed.length; y++){
            map.binds.push({ node: bindNodes[x], attribute: parsed[y][0], field: parsed[y][1] });
        }
    }

    var showNodes = matching(node, "data-v-show");
    for (x = 0; x < showNodes.length; x++){
        target = showNodes[x];
        map.shows.push({ node: target, field: target.getAttribute("data-v-show").trim(), initialDisplay: target.style.display });
    }

    var classNodes = matching(node, "data-v-class");
    for (x = 0; x < classNodes.length; x++){
        parsed = pairs(classNodes[x].getAttribute("data-v-class"), "data-v-class", spec.methodName);
        for (y = 0; y < parsed.length; y++){
            map.classes.push({ node: classNodes[x], className: parsed[y][0], field: parsed[y][1] });
        }
    }

    var refNodes = matching(node, "data-v-ref");
    for (x = 0; x < refNodes.length; x++){
        map.refs[refNodes[x].getAttribute("data-v-ref").trim()] = refNodes[x];
    }

    return map;
}

//Event wiring is separate from the binding map because it happens once, at build
//time, and is undone at destroy time - it is never revisited by a patch.
function bindEvents(entry, spec){
    var eventNodes = matching(entry.node, "data-v-on");

    for (var x = 0; x < eventNodes.length; x++){
        var parsed = pairs(eventNodes[x].getAttribute("data-v-on"), "data-v-on", spec.methodName);

        for (var y = 0; y < parsed.length; y++){
            var eventName = parsed[y][0];
            var handlerName = parsed[y][1];
            var handler = spec.handlers == null ? undefined : spec.handlers[handlerName];

            if (handler == undefined){
                throw new Error(spec.methodName + ": the template binds the '" + eventName + "' event to the handler '" + handlerName + "', but config.handlers has no '" + handlerName + "'");
            }

            //Bound through a wrapper so the handler receives the instance's CURRENT data:
            //entry.data is replaced wholesale by a patch, so closing over the value here
            //would hand the handler whatever the row held when it was first built.
            (function(node, eventName, handler){
                var listener = function(e){
                    handler(entry.data, node, e, spec.owner());
                };
                node.addEventListener(eventName, listener, false);
                entry.listeners.push({ node: node, eventName: eventName, listener: listener });
            })(eventNodes[x], eventName, handler);
        }
    }
}

/**
 * Applies every binding in the map from entry.data. Used for the first render.
 */
export function applyBindings(entry, spec){
    var map = entry.bindings, x, read;

    for (x = 0; x < map.fields.length; x++){
        read = readField(entry.data, map.fields[x].field, spec.formatters);
        map.fields[x].node.textContent = displayText(read.value);
    }
    for (x = 0; x < map.binds.length; x++){
        read = readField(entry.data, map.binds[x].field, spec.formatters);
        applyAttribute(map.binds[x].node, map.binds[x].attribute, read.value);
    }
    for (x = 0; x < map.shows.length; x++){
        read = readField(entry.data, map.shows[x].field, spec.formatters);
        map.shows[x].node.style.display = truthy(read) ? map.shows[x].initialDisplay : "none";
    }
    for (x = 0; x < map.classes.length; x++){
        read = readField(entry.data, map.classes[x].field, spec.formatters);
        truthy(read) ? map.classes[x].node.classList.add(map.classes[x].className)
                     : map.classes[x].node.classList.remove(map.classes[x].className);
    }
}

function applyAttribute(node, attribute, value){
    //An absent value removes the attribute rather than writing "undefined" into it,
    //so a row without an avatar yields <img> with no src, not a request for "undefined".
    if (value == undefined || value == null){
        node.removeAttribute(attribute);
    }else{
        node.setAttribute(attribute, value);
    }
}

/**
 * Patches an already built instance to 'newData', touching only what changed.
 *
 * Returns the list of field names whose value actually moved, which is what the
 * onUpdate callback is handed - a caller that wants to know whether anything
 * happened can check its length rather than diffing the data itself.
 */
export function patchBindings(entry, newData, spec){
    var map = entry.bindings, x, previous = entry.data, changed = [], read, before;
    entry.data = newData;

    for (x = 0; x < map.fields.length; x++){
        read = readField(newData, map.fields[x].field, spec.formatters);
        before = readField(previous, map.fields[x].field, spec.formatters);
        if (before.value !== read.value){
            map.fields[x].node.textContent = displayText(read.value);
            if (changed.indexOf(read.name) == -1) changed.push(read.name);
        }
    }
    for (x = 0; x < map.binds.length; x++){
        read = readField(newData, map.binds[x].field, spec.formatters);
        before = readField(previous, map.binds[x].field, spec.formatters);
        if (before.value !== read.value){
            applyAttribute(map.binds[x].node, map.binds[x].attribute, read.value);
            if (changed.indexOf(read.name) == -1) changed.push(read.name);
        }
    }
    for (x = 0; x < map.shows.length; x++){
        read = readField(newData, map.shows[x].field, spec.formatters);
        before = readField(previous, map.shows[x].field, spec.formatters);
        if (truthy(before) !== truthy(read)){
            map.shows[x].node.style.display = truthy(read) ? map.shows[x].initialDisplay : "none";
            if (changed.indexOf(read.name) == -1) changed.push(read.name);
        }
    }
    for (x = 0; x < map.classes.length; x++){
        read = readField(newData, map.classes[x].field, spec.formatters);
        before = readField(previous, map.classes[x].field, spec.formatters);
        if (truthy(before) !== truthy(read)){
            truthy(read) ? map.classes[x].node.classList.add(map.classes[x].className)
                         : map.classes[x].node.classList.remove(map.classes[x].className);
            if (changed.indexOf(read.name) == -1) changed.push(read.name);
        }
    }

    return changed;
}

/**
 * Clones the prototype, reads its bindings, wires its events and renders 'data'.
 *
 * 'spec' carries the definition-level settings: { methodName, formatters,
 * handlers, owner } where owner() returns the object to hand callbacks as the
 * instance. The node is returned detached; placing it is the caller's job.
 */
export function buildInstance(protoNode, data, spec){
    var entry = {
        node: protoNode.cloneNode(true),
        data: data,
        listeners: [],
        children: [],
        destroyed: false
    };

    entry.bindings = collectBindings(entry.node, spec);
    bindEvents(entry, spec);
    applyBindings(entry, spec);
    return entry;
}

/**
 * Unbinds an instance's listeners and drops its node.
 *
 * Removing the node would be enough for the browser to reclaim the listeners with
 * it, but they are detached explicitly so that a consumer who keeps the node -
 * to re-insert it, or to read something off it - is not left with handlers that
 * still fire against a destroyed instance.
 */
export function destroyInstance(entry){
    if (entry.destroyed) return;
    entry.destroyed = true;

    for (var x = 0; x < entry.listeners.length; x++){
        var bound = entry.listeners[x];
        bound.node.removeEventListener(bound.eventName, bound.listener, false);
    }
    entry.listeners = [];

    if (entry.node.parentNode != null) entry.node.parentNode.removeChild(entry.node);
}

/**
 * Keyed reconcile of a container against an array of data objects.
 *
 * Instances are matched to data by key, so an update is a patch of the instances
 * that survived plus a build of the ones that are new; instances whose key has
 * gone are destroyed. Surviving nodes are re-appended rather than recreated,
 * which moves them and preserves focus, text selection and input state.
 *
 * 'entries' is the live key -> instance Map and is replaced, not mutated.
 * 'spec.itemNoun' names the thing being keyed in error messages ("object" by default,
 * "row object" for DataView, whose wording predates this engine).
 */
export function reconcileList(container, newData, entries, protoNode, key, spec){
    var noun = spec.itemNoun != undefined ? spec.itemNoun : "object";
    var seen = new Map();
    var fragment = document.createDocumentFragment();
    var order = [];

    for (var x = 0; x < newData.length; x++){
        var rowData = newData[x];
        var rowKey = rowData[key];
        if (rowKey == undefined) throw new Error(spec.methodName + ": the " + noun + " at index " + x + " has no value for the key field '" + key + "'");
        if (seen.has(rowKey)) throw new Error(spec.methodName + ": two " + noun + "s share the key '" + rowKey + "' on the field '" + key + "'; keys must be unique");

        var entry = entries.get(rowKey);
        if (entry == undefined){
            entry = buildInstance(protoNode, rowData, spec);
            if (spec.onMount != null) spec.onMount(entry);
        }else{
            var changed = patchBindings(entry, rowData, spec);
            if (spec.onUpdate != null && changed.length > 0) spec.onUpdate(entry, changed);
        }
        seen.set(rowKey, entry);
        order.push(entry);
        fragment.appendChild(entry.node);
    }

    entries.forEach(function(entry, rowKey){
        if (!seen.has(rowKey)){
            if (spec.onDestroy != null) spec.onDestroy(entry);
            destroyInstance(entry);
        }
    });

    container.appendChild(fragment);
    return { entries: seen, order: order };
}

/**
 * Shared validation for the definition-level settings both consumers accept.
 */
export function validateHandlers(value, methodName){
    validateObjectLiteral(value, methodName + " property value must be a literal object of functions, keyed by the name used in a data-v-on binding");
    var names = Object.keys(value);
    for (var x = 0; x < names.length; x++){
        validateFunction(value[names[x]], methodName + " property: the entry '" + names[x] + "' must be a function");
    }
}

export function validateFormatters(value, methodName){
    validateObjectLiteral(value, methodName + " property value must be a literal object of functions, keyed by field name");
    var names = Object.keys(value);
    for (var x = 0; x < names.length; x++){
        validateFunction(value[names[x]], methodName + " property: the entry '" + names[x] + "' must be a function");
    }
}

export function validateKeyName(value, methodName){
    validateString(value, methodName + " property value must be a string naming the unique key field of each object");
}

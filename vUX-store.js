/*
 * vUX JavaScript library v4.1.0
 * https://github.com/VilsHub/vUX
 *
 *
 * Released under the MIT license
 * https://github.com/VilsHub/vUX/blob/master/LICENSE
 *
 * Date: 2026-11-26
 *
 *
 */
// Import vUX core
import { validateElement, validateFunction, validateArray, validateString } from "./src/helpers.js";
import "./src/vUX-core-4.1.0.js";

/***************************Store*****************************/
export function Store(initialState) {
    /**
     * Shared state for the parts of a page that show the same data.
     *
     * A Store holds one flat object of named fields. Anything that wants to follow a
     * field subscribes to it, and set() tells exactly the subscribers whose fields
     * changed. bind() and bindList() connect a store straight to a Component instance,
     * a DataView or a keyed Component list, so the page stops calling update() by hand
     * in every place that shows the same value.
     *
     * Rules that keep it predictable:
     *   - Every field is declared in the initial state. set() refuses a name it does
     *     not know, so a typo throws instead of quietly creating a field nobody reads.
     *   - A change is a new value. Fields are compared with Object.is, so pushing into
     *     an array the store holds changes nothing: set a new array instead.
     *   - Nothing is observed. Mutating an object read from get() does nothing; only
     *     set(), reset() and batch() change the store.
     */
    if (!isPlainObject(initialState)) {
        throw new TypeError("Store(x) constructor argument 1 must be a plain object of the store's fields and their starting values");
    }

    if (Object.prototype.hasOwnProperty.call(initialState, "__proto__")){
        //Object.assign would treat it as the prototype setter, not a field (it can arrive from JSON.parse)
        throw new Error("Store(x): '__proto__' cannot be a field name");
    }

    var initialized = false, destroyed = false;
    var initial = Object.assign({}, initialState);
    var state = Object.assign({}, initialState);
    var computed = null;                //name -> function(state), fixed at initialize()
    var computedValues = {};
    var subscribers = [];               //{ fn, fields, active }
    var pending = [];                   //changed field names waiting to be announced
    var batchDepth = 0;
    var notifying = false;
    var batchOrigin = null;             //name -> value before a batch first changed it
    var MAX_ROUNDS = 100;               //subscribers setting the store again, round after round

    this.initialize = function(){
        if (initialized) return;
        if (destroyed) throw new Error("This Store has been destroyed, create a new instance instead of re-initializing");

        //Computed fields are worked out now, from the starting state, so the first get()
        //already carries them and a subscriber can name them.
        computedValues = computeAll(state);
        initialized = true;
    }

    this.get = function(field){
        assertUsable("get");
        if (field === undefined) return snapshot();
        validateString(field, "storeObj.get(x) argument 1 must be the name of a field, or left out to read every field");
        assertKnown(field, "storeObj.get(x)");
        return Object.prototype.hasOwnProperty.call(state, field) ? state[field] : computedValues[field];
    }

    this.set = function(fields){
        assertUsable("set");
        if (typeof fields == "function"){
            //The updater form, for a value that depends on the current one:
            //store.set(s => ({ count: s.count + 1 }))
            fields = fields(snapshot());
            if (!isPlainObject(fields)){
                throw new TypeError("storeObj.set(x): the updater function must return a plain object of the fields to change");
            }
        }else if (!isPlainObject(fields)){
            throw new TypeError("storeObj.set(x) argument 1 must be a plain object of the fields to change, or a function that returns one");
        }

        var names = Object.keys(fields);
        for (var x = 0; x < names.length; x++) assertSettable(names[x], "storeObj.set(x)");
        return commit(Object.assign({}, state, fields));
    }

    this.reset = function(fields){
        assertUsable("reset");
        var next = Object.assign({}, state);
        if (fields === undefined){
            next = Object.assign({}, initial);
        }else{
            validateArray(fields, "storeObj.reset(x) argument 1 must be an array of field names, or left out to reset every field");
            for (var x = 0; x < fields.length; x++){
                validateString(fields[x], "storeObj.reset(x): every member of argument 1 must be a field name");
                assertSettable(fields[x], "storeObj.reset(x)");
                next[fields[x]] = initial[fields[x]];
            }
        }
        return commit(next);
    }

    this.batch = function(fn){
        assertUsable("batch");
        validateFunction(fn, "storeObj.batch(x) argument 1 must be a function that makes the changes");

        //Every set() inside fn changes the store at once (get() sees it), but the
        //subscribers hear about all of it together, once, when fn returns.
        var error = null, result;
        if (batchDepth == 0) batchOrigin = Object.create(null);
        batchDepth++;
        try { result = fn(); } catch (e) { error = e; }
        batchDepth--;

        if (batchDepth == 0){
            //A field set and set back inside the batch has not changed: it is not announced.
            var origin = batchOrigin;
            batchOrigin = null;
            pending = pending.filter(function(n){
                return !Object.prototype.hasOwnProperty.call(origin, n) || !Object.is(origin[n], currentValue(n));
            });
        }
        if (batchDepth == 0 && !notifying && pending.length > 0){
            //An error from fn is the one worth reporting; a subscriber error after it is secondary.
            try { flush(); } catch (e) { if (error == null) error = e; }
        }
        if (error != null) throw error;
        return result;
    }

    this.subscribe = function(callback, fields = null){
        assertUsable("subscribe");
        validateFunction(callback, "storeObj.subscribe(x, y) argument 1 must be a function, called with (state, changed)");
        var watched = readFieldList(fields, "storeObj.subscribe(x, y)");
        return addSubscriber(callback, watched);
    }

    this.bind = function(target, select, fields = null){
        assertUsable("bind");
        var kind = targetKind(target);
        if (kind != "instance" && kind != "dataView"){
            throw new TypeError("storeObj.bind(x, y, z) argument 1 must be a Component instance (what mount() returns) or a DataView; use bindList() for a Component list");
        }
        validateFunction(select, "storeObj.bind(x, y, z) argument 2 must be a function that takes the state and returns " +
            (kind == "instance" ? "the fields to give the instance" : "the array of rows to give the DataView"));
        var watched = readFieldList(fields, "storeObj.bind(x, y, z)");
        if (target.destroyed) throw new Error("storeObj.bind(x, y, z) argument 1 has been destroyed; bind a live " + (kind == "instance" ? "instance" : "DataView"));

        var off = null;
        var apply = function(state){
            //A target torn down elsewhere unbinds itself here, instead of throwing on every change after.
            if (target.destroyed){ off(); return; }
            var value = select(state);
            if (kind == "instance"){
                if (!isPlainObject(value)) throw new TypeError("storeObj.bind(x, y, z): the select function must return a plain object of fields for the instance");
                target.update(value);
            }else{
                if (!Array.isArray(value)) throw new TypeError("storeObj.bind(x, y, z): the select function must return an array of rows for the DataView");
                target.setData(value);
            }
        };
        return connect(apply, watched, function(unsubscribe){ off = unsubscribe; });
    }

    this.bindList = function(component, container, select, fields = null){
        assertUsable("bindList");
        if (targetKind(component) != "component"){
            throw new TypeError("storeObj.bindList(w, x, y, z) argument 1 must be a Component (the definition, not an instance)");
        }
        validateElement(container, "storeObj.bindList(w, x, y, z) argument 2 must be an element (the container the list is synced into)");
        validateFunction(select, "storeObj.bindList(w, x, y, z) argument 3 must be a function that takes the state and returns the array of rows");
        var watched = readFieldList(fields, "storeObj.bindList(w, x, y, z)");
        if (component.destroyed) throw new Error("storeObj.bindList(w, x, y, z) argument 1 has been destroyed; bind a live Component");

        var off = null;
        var apply = function(state){
            if (component.destroyed){ off(); return; }
            var rows = select(state);
            if (!Array.isArray(rows)) throw new TypeError("storeObj.bindList(w, x, y, z): the select function must return an array of rows");
            component.sync(container, rows);
        };
        return connect(apply, watched, function(unsubscribe){ off = unsubscribe; });
    }

    this.destroy = function(){
        if (destroyed) return;
        for (var x = 0; x < subscribers.length; x++) subscribers[x].active = false;
        subscribers = [];
        pending = [];
        state = {};
        computedValues = {};
        initialized = false;
        destroyed = true;
    }

    this.config = {}

    /*------------------------------ internals ------------------------------*/

    function isPlainObject(value){
        if (value === null || typeof value != "object" || Array.isArray(value)) return false;
        var proto = Object.getPrototypeOf(value);
        return proto === Object.prototype || proto === null;
    }

    function snapshot(){
        //A fresh copy for every reader, so one subscriber writing into what it was handed
        //cannot change what the next one sees. The copy is shallow: nested objects and
        //arrays are the store's own, and must be replaced through set(), never mutated.
        return Object.assign({}, state, computedValues);
    }

    function currentValue(name){
        return Object.prototype.hasOwnProperty.call(state, name) ? state[name] : computedValues[name];
    }

    function fieldNames(){
        return Object.keys(state).concat(Object.keys(computedValues));
    }

    function assertUsable(method){
        if (destroyed) throw new Error("storeObj." + method + "() called on a destroyed Store");
        if (!initialized) throw new Error("Please initialize using the 'initialize()' method, before calling storeObj." + method + "()");
    }

    function assertKnown(name, method){
        if (Object.prototype.hasOwnProperty.call(state, name)) return;
        if (Object.prototype.hasOwnProperty.call(computedValues, name)) return;
        var known = fieldNames();
        throw new Error(method + ": '" + name + "' is not a field of this store; " +
            (known.length > 0 ? "its fields are " + known.join(", ") : "it has no fields") +
            ". Declare every field in the initial state (null is a fine starting value)");
    }

    function assertSettable(name, method){
        if (Object.prototype.hasOwnProperty.call(computedValues, name)){
            throw new Error(method + ": '" + name + "' is a computed field; it follows the fields it is computed from and cannot be set");
        }
        if (!Object.prototype.hasOwnProperty.call(state, name)) assertKnown(name, method);
    }

    function readFieldList(fields, method){
        if (fields === null || fields === undefined) return null;
        validateArray(fields, method + " fields argument must be an array of field names, or null to hear every change");
        if (fields.length == 0) throw new Error(method + ": the fields array is empty, so nothing would ever be announced; pass null to hear every change");
        for (var x = 0; x < fields.length; x++){
            validateString(fields[x], method + ": every member of the fields array must be a field name");
            assertKnown(fields[x], method);
        }
        return fields.slice();
    }

    function computeAll(source){
        if (computed == null) return {};
        var out = {}, names = Object.keys(computed);
        //A copy per function, so one that writes into its argument cannot change what the next reads.
        for (var x = 0; x < names.length; x++) out[names[x]] = computed[names[x]](Object.assign({}, source));
        return out;
    }

    function commit(next){
        //Computed fields are worked out before anything is kept: if one throws, the
        //store is left exactly as it was rather than half changed.
        var nextComputed = computeAll(next);
        var changed = [], name;

        var keys = Object.keys(next), x;
        for (x = 0; x < keys.length; x++){
            if (!Object.is(state[keys[x]], next[keys[x]])) changed.push(keys[x]);
        }
        keys = Object.keys(nextComputed);
        for (x = 0; x < keys.length; x++){
            if (!Object.is(computedValues[keys[x]], nextComputed[keys[x]])) changed.push(keys[x]);
        }

        if (batchOrigin != null){
            //Remember each field's value from before the batch first touched it. A name
            //already pending (queued before this batch) keeps its announcement regardless.
            for (x = 0; x < changed.length; x++){
                name = changed[x];
                if (pending.indexOf(name) == -1 && !Object.prototype.hasOwnProperty.call(batchOrigin, name)){
                    batchOrigin[name] = Object.prototype.hasOwnProperty.call(state, name) ? state[name] : computedValues[name];
                }
            }
        }

        state = next;
        computedValues = nextComputed;
        if (changed.length == 0) return changed;

        for (x = 0; x < changed.length; x++){
            if (pending.indexOf(changed[x]) == -1) pending.push(changed[x]);
        }
        if (batchDepth == 0 && !notifying) flush();
        return changed;
    }

    function flush(){
        //A subscriber may set() the store while it is being told about a change. That
        //change is queued, not announced inside the current round, so every subscriber
        //in a round hears the same state; the next round announces what they changed.
        notifying = true;
        var rounds = 0, firstError = null;
        try {
            while (pending.length > 0){
                if (++rounds > MAX_ROUNDS){
                    pending = [];
                    throw new Error("Store: subscribers kept changing the store for more than " + MAX_ROUNDS +
                        " rounds; a subscriber is probably setting a field it watches to a new value every time");
                }
                var changed = pending;
                pending = [];
                var list = subscribers.slice();
                var roundState = snapshot();
                for (var x = 0; x < list.length; x++){
                    var sub = list[x];
                    if (!sub.active) continue;          //unsubscribed earlier in this round
                    var hit = sub.fields == null ? changed.slice() : changed.filter(function(n){ return sub.fields.indexOf(n) != -1; });
                    if (hit.length == 0) continue;
                    //One failing subscriber must not starve the rest: the first error is
                    //kept and thrown once everyone has been told.
                    try { sub.fn(Object.assign({}, roundState), hit); } catch (e) { if (firstError == null) firstError = e; }
                }
            }
        } finally {
            notifying = false;
        }
        if (firstError != null) throw firstError;
    }

    function addSubscriber(fn, fields){
        var sub = { fn: fn, fields: fields, active: true };
        subscribers.push(sub);
        return function unsubscribe(){
            if (!sub.active) return;
            sub.active = false;
            var at = subscribers.indexOf(sub);
            if (at != -1) subscribers.splice(at, 1);
        };
    }

    function connect(apply, fields, keep){
        var off = addSubscriber(function(state){ apply(state); }, fields);
        keep(off);

        //Applied once now, so the target shows the store before the first change. It runs
        //as a round: a set() made from inside it (an onUpdate, a formatter) is queued and
        //announced afterwards, instead of re-entering the target's update() or sync().
        var wasNotifying = notifying;
        notifying = true;
        try { apply(snapshot()); }
        catch (e) { notifying = wasNotifying; off(); throw e; }
        notifying = wasNotifying;
        if (!notifying && batchDepth == 0 && pending.length > 0) flush();
        return off;
    }

    function targetKind(target){
        if (target === null || typeof target != "object") return null;
        if (typeof target.sync == "function" && typeof target.mount == "function") return "component";
        if (typeof target.update == "function" && typeof target.ref == "function" && "destroyed" in target) return "instance";
        if (typeof target.setData == "function" && typeof target.updateRow == "function") return "dataView";
        return null;
    }

    Object.defineProperties(this, {
        initialize: { writable: false },
        get: { writable: false },
        set: { writable: false },
        reset: { writable: false },
        batch: { writable: false },
        subscribe: { writable: false },
        bind: { writable: false },
        bindList: { writable: false },
        destroy: { writable: false },
        config: { writable: false },
        destroyed: { get: function(){ return destroyed; } }
    })

    Object.defineProperties(this.config, {
        computed: {
            set: function(value){
                if (initialized || destroyed){
                    throw new Error("storeObj.config.computed must be set before initialize(); computed fields are fixed once the store starts");
                }
                if (!isPlainObject(value)){
                    throw new TypeError("storeObj.config.computed property value must be a plain object of field names to functions");
                }
                var names = Object.keys(value);
                for (var x = 0; x < names.length; x++){
                    validateFunction(value[names[x]], "storeObj.config.computed." + names[x] + " must be a function that takes the state and returns the value");
                    if (Object.prototype.hasOwnProperty.call(initial, names[x])){
                        throw new Error("storeObj.config.computed: '" + names[x] + "' is already a field of the initial state; a computed field needs its own name");
                    }
                }
                computed = Object.assign({}, value);
            }
        }
    })
}
/**********************************************************************/

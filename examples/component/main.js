/* ============================================================================
   vUX Component example — bring your own component.

   Importing any vUX-*.js module boots the whole core, so $$ and the validateX
   helpers are globals by the time this file's body runs. ToolTip is imported for
   section 4, where a board attaches one in onMount and destroys it in onDestroy.
   ========================================================================== */
import { Component } from "../../vUX-component.js";
import { ToolTip } from "../../vUX-toolTip.js";

/* ---------------------------------------------------------------------------
   Sample data. Kept in this file rather than fetched so the page runs offline.
   ------------------------------------------------------------------------- */
const PEOPLE = [
    { name:"Ada Lovelace",   role:"analyst",  bio:"Wrote the first algorithm intended for a machine.",            verified:true  },
    { name:"Grace Hopper",   role:"compiler", bio:"Built the first compiler, and argued that English could be a programming language.", verified:true },
    { name:"Alan Turing",    role:"theory",   bio:"Asked what a machine could compute, then answered it.",        verified:false },
    { name:"Karen Sparck J", role:"retrieval",bio:"Gave search engines the weighting they still use.",            verified:true  },
    { name:"Barbara Liskov", role:"systems",  bio:"Substitutability, and the abstractions that make it hold.",    verified:false },
    { name:"Radia Perlman",  role:"networks", bio:"Stopped networks looping forever with a spanning tree.",       verified:true  }
];

let nextId = 1;
function person(){
    const p = PEOPLE[(nextId - 1) % PEOPLE.length];
    return {
        id: nextId++,
        name: p.name,
        role: p.role,
        bio: p.bio,
        initial: p.name.charAt(0),
        verified: p.verified,
        inactive: false,
        pinned: false
    };
}

const say = (el, text, cls) => {
    const node = $$.ss(el);
    node.className = "status" + (cls ? " " + cls : "");
    node.lastElementChild.textContent = text;
};

/* ===========================================================================
   SECTION 1 — instances of one template
   ========================================================================= */

const grid = $$.ss("#cardGrid");

/* The constructor takes the ELEMENT, not a name or a selector. That is why no
   registry exists in this module: there is nothing to look a component up by,
   which in turn means no name collisions and no module-level global state. */
const card = new Component($$.ss("#userCardTpl"));

/* Formatters transform a field for display only. They never touch the data, so
   instance.data still reports what you actually set. Putting the "clamp the bio"
   rule here rather than in the template is deliberate: a binding value is always
   a plain field name, and anything computed is ordinary JavaScript you can debug. */
card.config.formatters = {
    role: (v) => String(v || "").toUpperCase(),
    bio:  (v) => { const s = String(v || ""); return s.length > 90 ? s.slice(0, 90).trimEnd() + "…" : s; }
};

/* Handlers are named in the template by data-v-on="click:pin". Each is called
   with (data, node, event, component) — 'data' being the instance's CURRENT data,
   not whatever it held when the node was first built. */
card.config.handlers = {
    pin: (data) => {
        const instance = cards.find(i => !i.destroyed && i.data.id === data.id);
        if (instance) instance.update({ pinned: !instance.data.pinned });
    },
    remove: (data) => {
        const instance = cards.find(i => !i.destroyed && i.data.id === data.id);
        if (instance) instance.destroy();
        refreshCount();
    }
};

card.config.onMount   = () => refreshCount();
card.config.onDestroy = () => setTimeout(refreshCount, 0); //count after the node has gone

card.initialize();

/* We keep our own list of mounted instances. componentObj.instances() would do the
   same job, but holding the array here makes the "random one" and "the last one"
   controls below read the way a real app's would. */
const cards = [];

function mountCard(){
    if (cards.filter(i => !i.destroyed).length >= 6){
        say("#status1", "six is enough for a demo — destroy one first", "err");
        return;
    }
    cards.push(card.mount(grid, person()));
    say("#status1", "mounted — " + liveCards().length + " live", "run");
}

const liveCards = () => cards.filter(i => !i.destroyed);

function refreshCount(){
    //Read from the component, not from this page's array: onMount fires from inside
    //mount(), before the caller has had a chance to store what mount() returns.
    $$.ss("#countPill").textContent = card.instances().length + " mounted";
}

$$.ss("#addOne").onclick = mountCard;
$$.ss("#heroAdd").onclick = () => { mountCard(); grid.scrollIntoView({ block:"center" }); };

$$.ss("#patchRandom").onclick = () => {
    const live = liveCards();
    if (live.length === 0) return say("#status1", "nothing mounted", "err");
    const pick = live[Math.floor(Math.random() * live.length)];
    //update() merges: fields you do not name keep their current value.
    const changed = pick.update({ role: ["lead","staff","principal","fellow"][Math.floor(Math.random()*4)] });
    say("#status1", "update() wrote " + (changed.length ? changed.join(", ") : "nothing — same value"), "run");
};

$$.ss("#heroPatch").onclick = () => {
    liveCards().forEach(i => i.update({ pinned: !i.data.pinned }));
    say("#status1", "patched " + liveCards().length + " instances", "run");
};

$$.ss("#toggleVerified").onclick = () => {
    liveCards().forEach(i => i.update({ verified: !i.data.verified }));
    say("#status1", "data-v-show toggled on every instance", "run");
};

$$.ss("#destroyLast").onclick = () => {
    const live = liveCards();
    if (live.length === 0) return say("#status1", "nothing to destroy", "err");
    live[live.length - 1].destroy();
    refreshCount();
    say("#status1", "destroyed — " + liveCards().length + " live", "run");
};

const clearCards = () => {
    //destroyAll() goes through every instance the definition produced, so it also
    //catches any this page forgot to keep a reference to.
    card.destroyAll();
    cards.length = 0;
    refreshCount();
    say("#status1", "destroyAll() — grid empty", "run");
};
$$.ss("#destroyAll").onclick = clearCards;
$$.ss("#heroClear").onclick  = clearCards;

//Three to start, so the page is never empty on first paint.
mountCard(); mountCard(); mountCard();


/* ===========================================================================
   SECTION 2 — every binding, live

   A second Component over the SAME template element. Two definitions can read one
   template because a <template> is only ever cloned out of, never consumed.
   ========================================================================= */

const solo = new Component($$.ss("#userCardTpl"));
solo.config.formatters = {
    role: (v) => String(v || "").toUpperCase(),
    bio:  (v) => { const s = String(v || ""); return s.length > 90 ? s.slice(0, 90).trimEnd() + "…" : s; }
};
solo.config.handlers = {
    pin:    () => $$.ss("#fPinned").click(),
    remove: () => say("#status1", "the playground card cannot be removed", "err")
};
solo.initialize();

const soloData = {
    id: 0, name:"Ada Lovelace", role:"analyst", initial:"A",
    bio:"Wrote the first algorithm intended for a machine, and the first note on what a machine could not do.",
    verified:true, inactive:false, pinned:false
};
const soloInstance = solo.mount($$.ss("#oneStage"), soloData);

/* Every control writes exactly one field. The pill reports update()'s return value,
   which is the list of fields whose value actually moved — set a field to what it
   already holds and the list comes back empty, because no DOM write was needed. */
function writeField(field, value){
    const changed = soloInstance.update({ [field]: value });
    $$.ss("#patchPill").textContent = changed.length ? "patched: " + changed.join(", ") : "no change";
    renderCode();
}

$$.ss("#fName").oninput  = (e) => {
    //Two fields from one control: the avatar letter is derived rather than bound to
    //an expression, because a binding value is always a plain field name.
    writeField("name", e.target.value);
    writeField("initial", (e.target.value || "?").charAt(0));
};
$$.ss("#fRole").oninput  = (e) => writeField("role", e.target.value);
$$.ss("#fBio").oninput   = (e) => writeField("bio", e.target.value);
$$.ss("#fVerified").onchange = (e) => writeField("verified", e.target.checked);
$$.ss("#fInactive").onchange = (e) => writeField("inactive", e.target.checked);
$$.ss("#fPinned").onchange   = (e) => writeField("pinned",  e.target.checked);

/* ref() hands back a node the template marked with data-v-ref. It is the supported
   way into an instance's internals: querySelector on instance.node would work too,
   but ref() fails loudly and lists the names that do exist when you get it wrong. */
$$.ss("#refFocus").onclick = () => {
    const btn = soloInstance.ref("pinBtn");
    btn.focus();
    say("#status1", "focused the node marked data-v-ref=\"pinBtn\"", "run");
};

//The equivalent code panel, rebuilt on every change so the page doubles as a recipe.
function renderCode(){
    const d = soloInstance.data;
    const esc = (s) => String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;");
    $$.ss("#codePanel").innerHTML =
`<span class="c">// the definition, configured once</span>
<span class="k">const</span> card = <span class="k">new</span> Component($$.ss(<span class="s">"#userCardTpl"</span>));
card.config.formatters = { role: v <span class="k">=></span> v.toUpperCase() };
card.config.handlers   = { pin: onPin, remove: onRemove };
card.initialize();

<span class="c">// one instance, and a patch</span>
<span class="k">const</span> a = card.mount(container, {
  name: <span class="s">"${esc(d.name)}"</span>,
  role: <span class="s">"${esc(d.role)}"</span>,
  verified: <span class="p">${d.verified}</span>, inactive: <span class="p">${d.inactive}</span>, pinned: <span class="p">${d.pinned}</span>
});
a.update({ name: <span class="s">"${esc(d.name)}"</span> });
a.ref(<span class="s">"pinBtn"</span>).focus();`;
}
renderCode();


/* ===========================================================================
   SECTION 3 — keyed lists keep their nodes
   ========================================================================= */

const ROWS = [
    { id:11, name:"packet loss",    score:12, hot:false },
    { id:12, name:"queue depth",    score:48, hot:true  },
    { id:13, name:"cache hit rate", score:91, hot:false },
    { id:14, name:"retry budget",   score:33, hot:false }
];
let rowData = ROWS.map(r => Object.assign({}, r));
let nextRowId = 20;

let rowComp = null;
function buildRowComponent(){
    const c = new Component($$.ss("#rowTpl"));
    //sync() needs to know which field identifies a row; without it there is no way
    //to tell "the same row, changed" from "a different row".
    c.config.key = "id";
    c.initialize();
    return c;
}
rowComp = buildRowComponent();

function syncRows(message){
    rowComp.sync($$.ss("#rowList"), rowData);
    $$.ss("#syncPill").textContent = rowData.length + " rows";
    if (message) say("#status3", message, "run");
}
syncRows();

$$.ss("#sortScore").onclick = () => {
    rowData.sort((a, b) => b.score - a.score);
    syncRows("sorted by score — surviving rows were moved, not rebuilt");
};
$$.ss("#sortName").onclick = () => {
    rowData.sort((a, b) => a.name.localeCompare(b.name));
    syncRows("sorted by name");
};
$$.ss("#bumpScores").onclick = () => {
    rowData = rowData.map(r => Object.assign({}, r, { score: Math.floor(Math.random() * 100) }));
    syncRows("scores patched — one textContent write per changed cell");
};
$$.ss("#addRow").onclick = () => {
    const names = ["p99 latency","error rate","open sockets","disk pressure","gc pause"];
    rowData.push({ id: nextRowId++, name: names[Math.floor(Math.random()*names.length)], score: Math.floor(Math.random()*100), hot:false });
    syncRows("row added — only the new key was built");
};
$$.ss("#dropRow").onclick = () => {
    if (rowData.length === 0) return say("#status3", "nothing to drop", "err");
    rowData = rowData.slice(1);
    syncRows("row dropped — its instance was destroyed and its listeners unbound");
};

/* The counter-demonstration. Destroying the component and building a new one throws
   every instance away, so the browser state living inside the rows - typed text,
   focus, selection - goes with them. This is what keying buys you. */
$$.ss("#rebuildRows").onclick = () => {
    rowComp.destroy();
    $$.ss("#rowList").innerHTML = "";
    rowComp = buildRowComponent();
    syncRows("rebuilt from scratch — every node is new, and your typing is gone");
};


/* ===========================================================================
   SECTION 4 — nesting, and letting go cleanly
   ========================================================================= */

const logLines = [];
function life(text){
    logLines.unshift(new Date().toLocaleTimeString() + "  " + text);
    if (logLines.length > 40) logLines.pop();
    $$.ss("#lifeLog").textContent = logLines.join("\n");
    $$.ss("#livePill").textContent = boards.filter(b => !b.destroyed).length + " live";
}

const chip = new Component($$.ss("#chipTpl"));
chip.config.onMount   = (i) => life("  ↳ chip mounted: " + i.data.label);
chip.config.onDestroy = (i) => life("  ↳ chip destroyed: " + i.data.label);
chip.initialize();

const board = new Component($$.ss("#boardTpl"));
board.config.handlers = {
    close: (data) => {
        const b = boards.find(x => !x.destroyed && x.data.id === data.id);
        if (b) b.destroy();
    }
};

/* onMount is where a component of yours attaches vUX components to its own nodes.
   ToolTip is class-driven, so every chip inside this board carries the class and one
   ToolTip instance serves them all; refresh() picks up chips added later. */
board.config.onMount = (instance) => {
    life("board mounted: " + instance.data.title);

    const tip = new ToolTip();
    tip.config.className = "chip";
    tip.initialize();

    //Stashed on the instance so onDestroy can reach it again. The instance object is
    //ours to annotate; only node/data/destroyed and the methods are defined by vUX.
    instance.tip = tip;
};

/* onDestroy is the mirror. Anything attached in onMount is released here — which is
   the reason every vUX component gained a destroy() before this module was written.
   Children mounted through instance.mount() need no handling: they are owned by the
   parent and torn down before this callback runs. */
board.config.onDestroy = (instance) => {
    if (instance.tip) instance.tip.destroy();
    life("board destroyed: " + instance.data.title + " (its children went first)");
};
board.initialize();

const boards = [];
let boardN = 0;
const BOARD_NAMES = ["Backlog", "In review", "Shipped", "Archive"];

$$.ss("#addBoard").onclick = () => {
    if (boards.filter(b => !b.destroyed).length >= 3) return life("three boards is plenty");
    const id = ++boardN;
    boards.push(board.mount($$.ss("#boards"), { id, title: BOARD_NAMES[(id - 1) % BOARD_NAMES.length] }));
};

$$.ss("#addChip").onclick = () => {
    const live = boards.filter(b => !b.destroyed);
    if (live.length === 0) return life("mount a board first");
    const parent = live[live.length - 1];
    const labels = ["design","api","copy","a11y","perf","infra","docs"];
    const label = labels[Math.floor(Math.random() * labels.length)];

    /* instance.mount() rather than chip.mount(): mounting THROUGH the parent makes the
       child owned by it, so destroying the board destroys its chips too. Calling
       chip.mount() directly would leave orphans behind when the board goes. */
    parent.mount(chip, parent.ref("slot"), { label, hint: "added to " + parent.data.title });

    //The chips are new elements, so the board's ToolTip needs to be told about them.
    if (parent.tip) parent.tip.refresh();
};

$$.ss("#addBoard").click();
$$.ss("#addChip").click();
$$.ss("#addChip").click();


/* ===========================================================================
   SECTION 5 — failure modes

   Each case really does misuse the API; the thrown Error is printed as it comes.
   ========================================================================= */

const errCases = {
    ctorString: () => new Component("#userCardTpl"),

    ctorEmpty: () => {
        const t = $$.ce("template");
        document.body.appendChild(t);
        try { new Component(t).initialize(); } finally { t.remove(); }
    },

    notInit: () => {
        const c = new Component($$.ss("#chipTpl"));
        c.mount($$.ss("#boards"), { label:"x" });
    },

    destroyedUse: () => {
        const c = new Component($$.ss("#chipTpl"));
        c.initialize();
        c.destroy();
        c.mount($$.ss("#boards"), { label:"x" });
    },

    noHandler: () => {
        //A template binding an event the page never supplied a handler for. The error
        //names both the event and the handler key, so the typo is obvious.
        const t = $$.ce("template");
        t.innerHTML = '<b data-v-on="click:doesNotExist">x</b>';
        document.body.appendChild(t);
        const c = new Component(t);
        c.initialize();
        try { c.mount($$.ss("#boards"), {}); } finally { t.remove(); }
    },

    badPair: () => {
        const t = $$.ce("template");
        t.innerHTML = '<img data-v-bind="srcavatar">';
        document.body.appendChild(t);
        const c = new Component(t);
        c.initialize();
        try { c.mount($$.ss("#boards"), {}); } finally { t.remove(); }
    },

    badRef: () => soloInstance.ref("nope"),

    noKey: () => {
        const c = new Component($$.ss("#chipTpl"));
        c.initialize();
        c.sync($$.ss("#boards"), []);
    },

    dupKey: () => {
        const c = new Component($$.ss("#chipTpl"));
        c.config.key = "id";
        c.initialize();
        const holder = $$.ce("div");
        document.body.appendChild(holder);
        try { c.sync(holder, [{ id:1, label:"a" }, { id:1, label:"b" }]); } finally { holder.remove(); }
    },

    missingKey: () => {
        const c = new Component($$.ss("#chipTpl"));
        c.config.key = "id";
        c.initialize();
        const holder = $$.ce("div");
        document.body.appendChild(holder);
        try { c.sync(holder, [{ label:"no id here" }]); } finally { holder.remove(); }
    },

    updateDestroyed: () => {
        const c = new Component($$.ss("#chipTpl"));
        c.initialize();
        const holder = $$.ce("div");
        document.body.appendChild(holder);
        const i = c.mount(holder, { label:"temp" });
        i.destroy();
        holder.remove();
        i.update({ label:"too late" });
    }
};

$$.sa("[data-err]").forEach(function(button){
    button.onclick = function(){
        const name = button.getAttribute("data-err");
        try {
            errCases[name]();
            $$.ss("#errOut").textContent = "No error was raised — that case is no longer a failure mode.";
        } catch (error) {
            $$.ss("#errOut").textContent = error.name + ": " + error.message;
        }
    };
});

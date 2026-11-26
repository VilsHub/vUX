/* ============================================================================
   vUX Store example: shared state.

   Importing any vUX-*.js module boots the whole core, so $$ and the validateX
   helpers are globals by the time this file's body runs. Store is the subject;
   Component draws every piece of the shop. The components never talk to each
   other: each one is bound to the store, and the store tells it when to redraw.
   ========================================================================== */
import { Store } from "../../vUX-store.js";
import { Component } from "../../vUX-component.js";

const escapeHtml = (s) => String(s).replace(/[&<>]/g, (c) => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;" }[c]));
const say = (sel, text) => { $$.ss(sel).textContent = text; };
const flash = (node, cls, ms = 600) => {
    node.classList.remove(cls);
    void node.offsetWidth;              //restart the animation if it is already running
    node.classList.add(cls);
    setTimeout(() => node.classList.remove(cls), ms);
};

/* ===========================================================================
   00. THE SHOP

   The catalogue is fixed, so it is plain data, not store state. The store only
   holds what changes: what is in the cart, and the currency to show it in.
   ========================================================================= */

const PRODUCTS = [
    { id:1, name:"Stoneware mug",    price:  6500, colour:"#ffb454" },
    { id:2, name:"Pour-over kettle", price: 38000, colour:"#5ccfe6" },
    { id:3, name:"Linen apron",      price: 14500, colour:"#a7e05f" },
    { id:4, name:"Glazed bowl",      price:  9000, colour:"#c8a2ff" },
    { id:5, name:"Oak tray",         price: 21000, colour:"#ff8a5c" },
    { id:6, name:"Tea tin",          price:  4800, colour:"#ff6b7f" }
];
const byId = new Map(PRODUCTS.map((p) => [p.id, p]));
const RATES = { NGN: 1, USD: 1 / 1500, EUR: 1 / 1650 };
const FREE_OVER = 50000, SHIPPING = 3500;   //in NGN, like the prices

/* Every field the store will ever hold is declared here. set({ itms }) would
   throw, which is the point: a typo in a shared field is a bug you want loud. */
const cart = new Store({
    items: [],            // [{ id, qty }]: replaced on every change, never pushed into
    currency: "NGN"
});

/* Computed fields are worked out from the others after every change. Subscribers
   and bindings can watch them by name, exactly like real fields. Because they are
   compared like any field, "count" only announces itself when the count moves:
   changing the currency does not tell the badge anything. */
cart.config.computed = {
    //A computed function is handed the plain fields only, not the other computed
    //ones, so shared arithmetic lives in ordinary helpers below.
    count:    (s) => s.items.reduce((n, i) => n + i.qty, 0),
    subtotal: (s) => itemsTotal(s.items),
    shipping: (s) => shippingFor(s.items),
    total:    (s) => itemsTotal(s.items) + shippingFor(s.items)
};
function itemsTotal(items){ return items.reduce((t, i) => t + i.qty * byId.get(i.id).price, 0); }
function shippingFor(items){ return (items.length === 0 || itemsTotal(items) >= FREE_OVER) ? 0 : SHIPPING; }

cart.initialize();

/* The one write path for quantities. Using the updater form, set(s => ...),
   because the new array depends on the current one. */
function changeQty(id, delta){
    return cart.set((s) => {
        const found = s.items.find((i) => i.id === id);
        if (!found) return delta > 0 ? { items: [...s.items, { id, qty: delta }] } : {};
        const qty = found.qty + delta;
        return { items: qty <= 0 ? s.items.filter((i) => i.id !== id)
                                 : s.items.map((i) => i.id === id ? { id, qty } : i) };
    });
}

const money = (ngn, currency) => {
    const v = ngn * RATES[currency];
    return new Intl.NumberFormat("en", { style:"currency", currency, maximumFractionDigits: currency === "NGN" ? 0 : 2 }).format(v);
};

/* ---------- badge: one instance, bound to one computed field ---------- */
const badge = new Component($$.ss("#badgeTpl"));
badge.initialize();
const badgeInstance = badge.mount($$.ss("#badgeSlot"), { count: 0, hasItems: false });

/* bind(target, select, fields): select maps the store to the fields the template
   binds. ["count"] means select only runs when the count changes. */
cart.bind(badgeInstance, (s) => ({ count: s.count, hasItems: s.count > 0 }), ["count"]);

//A plain subscriber for the bit of behaviour a binding cannot express: a bump.
cart.subscribe(() => flash(badgeInstance.node, "bump", 400), ["count"]);

/* ---------- product grid: a keyed list ---------- */
const product = new Component($$.ss("#productTpl"));
product.config.key = "id";
product.config.handlers = {
    //Handlers write to the STORE, never to another component. The cart drawer,
    //the badge and the totals all hear about it from there.
    add: (data) => changeQty(data.id, +1),
    dec: (data) => changeQty(data.id, -1)
};
product.initialize();

/* bindList(component, container, select, fields): the list is re-synced by key,
   so a card that keeps its id keeps its node; only its changed bindings are written. */
cart.bindList(product, $$.ss("#products"), (s) => PRODUCTS.map((p) => {
    const line = s.items.find((i) => i.id === p.id);
    return {
        id: p.id,
        name: p.name,
        initial: p.name.charAt(0),
        swatch: "background:" + p.colour,
        priceLabel: money(p.price, s.currency),
        inCart: !!line,
        qtyLabel: line ? "x" + line.qty : ""
    };
}), ["items", "currency"]);

/* ---------- cart drawer: another keyed list over the same field ---------- */
const cartRow = new Component($$.ss("#cartRowTpl"));
cartRow.config.key = "id";
cartRow.config.handlers = {
    inc: (data) => changeQty(data.id, +1),
    dec: (data) => changeQty(data.id, -1)
};
cartRow.initialize();

cart.bindList(cartRow, $$.ss("#cart"), (s) => s.items.map((i) => ({
    id: i.id,
    name: byId.get(i.id).name,
    qty: i.qty,
    lineLabel: money(i.qty * byId.get(i.id).price, s.currency)
})), ["items", "currency"]);

/* ---------- totals: one instance fed by four computed fields ---------- */
const totals = new Component($$.ss("#totalsTpl"));
totals.initialize();
const totalsInstance = totals.mount($$.ss("#totalsSlot"), {});
cart.bind(totalsInstance, (s) => ({
    count: s.count,
    subtotal: money(s.subtotal, s.currency),
    shipping: s.count === 0 ? "-" : (s.shipping === 0 ? "free" : money(s.shipping, s.currency)),
    freeShipping: s.count > 0 && s.shipping === 0,
    total: money(s.total, s.currency),
    hint: s.count === 0 ? "" : s.subtotal >= FREE_OVER ? "Shipping is on us."
        : "Add " + money(FREE_OVER - s.subtotal, s.currency) + " more for free shipping."
}), ["count", "subtotal", "shipping", "total", "currency"]);

/* ---------- currency switch: not a component, just a subscriber ---------- */
const curButtons = $$.sa("#curSwitch button");
const showCurrency = (cur) => curButtons.forEach((b) => b.classList.toggle("on", b.dataset.cur === cur));
showCurrency(cart.get("currency"));
cart.subscribe((s) => showCurrency(s.currency), ["currency"]);

curButtons.forEach((b) => b.addEventListener("click", () => reportSet(cart.set({ currency: b.dataset.cur }))));

/* ---------- hero buttons ---------- */
$$.ss("#heroAdd").onclick = () => reportSet(changeQty(PRODUCTS[Math.floor(Math.random() * PRODUCTS.length)].id, +1));
$$.ss("#heroCur").onclick = () => {
    const order = ["NGN", "USD", "EUR"];
    reportSet(cart.set((s) => ({ currency: order[(order.indexOf(s.currency) + 1) % order.length] })));
};
$$.ss("#heroReset").onclick = () => reportSet(cart.reset());

//set() and reset() return the names that changed; an empty array means nobody was told.
function reportSet(changed){
    say("#setPill", changed.length ? "changed: " + changed.join(", ") : "no change: nobody told");
    $$.ss("#setPill").classList.toggle("on", changed.length > 0);
}

/* ---------- inspector: one subscriber with no fields hears everything ---------- */
const stateView = $$.ss("#stateView");
const changeLog = $$.ss("#changeLog");

function renderState(state, changed = []){
    //Built by hand rather than JSON.stringify(state, null, 2) so the fields that
    //just changed can be lit up.
    const lines = Object.keys(state).map((k) => {
        const line = "  " + k + ": " + escapeHtml(JSON.stringify(state[k]));
        return changed.includes(k) ? '<span class="flash">' + line + "</span>" : line;
    });
    stateView.innerHTML = "{\n" + lines.join(",\n") + "\n}";
}
renderState(cart.get());

let changeNo = 0;
cart.subscribe((state, changed) => {
    renderState(state, changed);
    changeLog.textContent = "#" + (++changeNo) + "  changed: " + changed.join(", ") + "\n" + changeLog.textContent;
});
$$.ss("#clearLog").onclick = () => { changeLog.textContent = ""; };


/* ===========================================================================
   01. WHO HEARS WHAT

   A separate, tiny store, so the shop's subscribers do not muddy the picture.
   ========================================================================= */

const abc = new Store({ a: 0, b: 0, c: "x" });
abc.config.computed = { sum: (s) => s.a + s.b };
abc.initialize();

const SUBS = [
    { name: "S1", watch: ["a"] },
    { name: "S2", watch: ["b"] },
    { name: "S3", watch: ["a", "c"] },
    { name: "S4", watch: ["sum"] }
];
const FIELDS = ["a", "b", "c", "sum"];
const subsBox = $$.ss("#subs");

SUBS.forEach((sub) => {
    const card = $$.ce("div");
    card.className = "sub";
    card.innerHTML = "<h3>" + sub.name + "</h3><div class=\"w\"></div><div class=\"heard\">waiting</div>";
    const boxes = card.querySelector(".w");
    FIELDS.forEach((f) => {
        const label = $$.ce("label");
        label.className = "switch";
        label.innerHTML = '<input type="checkbox"' + (sub.watch.includes(f) ? " checked" : "") + "> " + f;
        label.firstChild.addEventListener("change", () => resubscribe(sub, card));
        boxes.appendChild(label);
    });
    subsBox.appendChild(card);
    resubscribe(sub, card);
});

function resubscribe(sub, card){
    //subscribe() returns its own unsubscribe function: keep it, call it before
    //subscribing again, or the old subscription would keep firing too.
    if (sub.off) sub.off();
    const watch = FIELDS.filter((f, i) => card.querySelectorAll("input")[i].checked);
    //No box ticked means "every change": an empty array throws on purpose (it
    //would never fire), so null is what is passed.
    sub.off = abc.subscribe((state, changed) => {
        card.querySelector(".heard").textContent = "heard " + changed.join(", ") + "  (a=" + state.a + " b=" + state.b + " c=" + state.c + " sum=" + state.sum + ")";
        flash(card, "ping", 700);
    }, watch.length ? watch : null);
    card.querySelector(".heard").textContent = watch.length ? "watching " + watch.join(", ") : "watching every change";
}

const abcSet = (fields) => {
    const changed = abc.set(fields);
    say("#subPill", changed.length ? "set() returned " + changed.join(", ") : "set() returned []: nobody told");
};
$$.ss("#setA").onclick   = () => abcSet((s) => ({ a: s.a + 1 }));
$$.ss("#setB").onclick   = () => abcSet((s) => ({ b: s.b + 1 }));
$$.ss("#setC").onclick   = () => abcSet((s) => ({ c: s.c === "x" ? "y" : "x" }));
$$.ss("#setAB").onclick  = () => abcSet((s) => ({ a: s.a + 1, b: s.b + 1 }));
$$.ss("#setSame").onclick = () => abcSet((s) => ({ a: s.a }));


/* ===========================================================================
   02. BATCH
   ========================================================================= */

const counterStore = new Store({ n: 0, label: "" });
counterStore.initialize();
let heardCount = 0;
counterStore.subscribe(() => { heardCount++; });

function tenSets(){
    for (let i = 0; i < 10; i++) counterStore.set((s) => ({ n: s.n + 1, label: "step " + (s.n + 1) }));
}
const showCount = (sel) => { $$.ss(sel).firstChild.nodeValue = String(heardCount); };

$$.ss("#runLoose").onclick = () => { heardCount = 0; tenSets(); showCount("#loose"); };
$$.ss("#runTight").onclick = () => {
    heardCount = 0;
    //Inside batch() every set() is applied at once (s.n above really climbs to +10),
    //but the single subscriber is called once, when the function returns.
    counterStore.batch(tenSets);
    showCount("#tight");
};


/* ===========================================================================
   03. RE-ENTRANCY
   ========================================================================= */

const temp = new Store({ celsius: 20, fahrenheit: 68 });
temp.initialize();
const roundLog = $$.ss("#roundLog");
const roundLine = (text) => { roundLog.textContent += text + "\n"; roundLog.scrollTop = roundLog.scrollHeight; };

//A: follows celsius and keeps fahrenheit in step with its own set().
temp.subscribe((s, changed) => {
    const f = Math.round(s.celsius * 9 / 5 + 32);
    roundLine("A heard [" + changed + "]  c=" + s.celsius + " f=" + s.fahrenheit + "  -> set({ fahrenheit: " + f + " })");
    temp.set({ fahrenheit: f });
}, ["celsius"]);

//B: hears everything. In the first round it is handed the same state A was,
//so it sees the old fahrenheit; the second round brings the new one.
temp.subscribe((s, changed) => {
    roundLine("B heard [" + changed + "]  c=" + s.celsius + " f=" + s.fahrenheit);
    say("#tempPill", "celsius " + s.celsius + " · fahrenheit " + s.fahrenheit);
});

$$.ss("#warm").onclick = () => { roundLine("--- set({ celsius: " + (temp.get("celsius") + 5) + " })"); temp.set((s) => ({ celsius: s.celsius + 5 })); };
$$.ss("#cool").onclick = () => { roundLine("--- set({ celsius: " + (temp.get("celsius") - 5) + " })"); temp.set((s) => ({ celsius: s.celsius - 5 })); };

$$.ss("#runaway").onclick = () => {
    //A store of its own, destroyed afterwards, so the runaway cannot outlive the demo.
    const loop = new Store({ x: 0 });
    loop.initialize();
    loop.subscribe((s) => loop.set({ x: s.x + 1 }), ["x"]);
    roundLine("--- a subscriber that sets x to x + 1 every time it hears x");
    try { loop.set({ x: 1 }); }
    catch (e) { roundLine("thrown: " + e.message + "\nx stopped at " + loop.get("x")); }
    loop.destroy();
};


/* ===========================================================================
   04. BINDINGS AND TEARDOWN
   ========================================================================= */

const clock = new Store({ tick: 0, other: 0 });
clock.initialize();
const widget = new Component($$.ss("#widgetTpl"));
widget.initialize();
const bindLog = $$.ss("#bindLog");
let widgetInstance = null, unbind = null, selectRuns = 0;

$$.ss("#wMount").onclick = () => {
    if (widgetInstance && !widgetInstance.destroyed) return say("#bindPill", "already mounted");
    widgetInstance = widget.mount($$.ss("#widgetSlot"), { label: "" });
    //bind() applies once right now, so the widget never shows an empty label.
    unbind = clock.bind(widgetInstance, (s) => {
        bindLog.textContent = "select #" + (++selectRuns) + "  tick=" + s.tick + "\n" + bindLog.textContent;
        return { label: "tick " + s.tick };
    }, ["tick"]);
    say("#bindPill", "bound to tick");
};

$$.ss("#wTick").onclick = () => {
    const before = selectRuns;
    clock.set((s) => ({ tick: s.tick + 1 }));
    if (widgetInstance && widgetInstance.destroyed && selectRuns === before){
        say("#bindPill", "no select ran: the binding dropped itself");
    }
};
$$.ss("#wOther").onclick = () => {
    const before = selectRuns;
    clock.set((s) => ({ other: s.other + 1 }));
    say("#bindPill", selectRuns === before ? "other changed, select not run" : "select ran");
};
$$.ss("#wDestroy").onclick = () => {
    if (!widgetInstance || widgetInstance.destroyed) return say("#bindPill", "nothing mounted");
    //Destroyed without unbinding first. The store notices on the next tick.
    widgetInstance.destroy();
    say("#bindPill", "destroyed, still subscribed until the next tick");
};
$$.ss("#wUnbind").onclick = () => {
    if (!unbind) return say("#bindPill", "nothing to unbind");
    //The tidy way: what you would call from a Component's onDestroy.
    unbind();
    unbind = null;
    say("#bindPill", "unbound: the widget stays, frozen at its last value");
};
$$.ss("#wClear").onclick = () => { bindLog.textContent = ""; };


/* ===========================================================================
   05. FAILURE MODES

   Each case really does misuse the API; the thrown Error is printed as it comes.
   ========================================================================= */

const errCases = {
    ctorArray:   () => new Store([]),
    notInit:     () => new Store({ a: 1 }).get(),
    typo:        () => cart.set({ itms: [] }),
    setComputed: () => cart.set({ total: 0 }),
    badUpdater:  () => cart.set(() => 42),
    emptyFields: () => cart.subscribe(() => {}, []),
    watchTypo:   () => cart.subscribe(() => {}, ["totl"]),
    computedLate: () => { cart.config.computed = { other: () => 1 }; },
    computedClash: () => {
        const s = new Store({ total: 0 });
        s.config.computed = { total: () => 1 };
    },
    bindWrong:   () => cart.bind(product, () => ({})),
    bindDead:    () => {
        const t = widget.mount($$.ce("div"), { label: "" });
        t.destroy();
        cart.bind(t, () => ({ label: "x" }));
    },
    badSelect:   () => {
        const host = $$.ce("div");
        const t = widget.mount(host, { label: "" });
        try { cart.bind(t, () => "text"); } finally { t.destroy(); }
    },
    destroyed:   () => {
        const s = new Store({ a: 1 });
        s.initialize();
        s.destroy();
        s.set({ a: 2 });
    }
};

$$.ss("#errGrid").addEventListener("click", (e) => {
    const button = e.target.closest("button[data-case]");
    if (!button) return;
    const out = $$.ss("#errOut");
    try {
        errCases[button.dataset.case]();
        out.textContent = "no error thrown (that would be a bug)";
    } catch (error) {
        out.textContent = error.name + ": " + error.message;
    }
});

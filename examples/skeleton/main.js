/* ============================================================================
   vUX Skeleton example — placeholders shaped like the real thing.

   Importing any vUX-*.js module boots the whole core, so $$ and the validateX
   helpers are globals by the time this file's body runs. Component is imported
   because the page renders its real content with it: the point of section 01 is
   that ONE <template> feeds both modules.
   ========================================================================== */
import { Skeleton } from "../../vUX-skeleton.js";
import { Component } from "../../vUX-component.js";

/* ---------------------------------------------------------------------------
   Sample data and a fake network. Kept in this file so the page runs offline;
   'latency' is the only thing a real fetch would add.
   ------------------------------------------------------------------------- */
const TITLES = [
    ["engineering", "Why our queue stopped dropping jobs on Tuesdays", "A retry storm, a clock that drifted four seconds, and the one-line fix that took a week to find."],
    ["design", "Skeletons that match the layout, not a guess at it", "Placeholder screens only help if they look like what replaces them. Ours are now derived, not drawn."],
    ["product", "Shipping the offline mode nobody asked for", "Usage doubled in the regions with the worst networks. Here is what we learned building it."],
    ["research", "What a thousand session replays taught us about waiting", "People forgive a slow page. They do not forgive one that jumps under their thumb."],
    ["engineering", "Moving 40 million rows without a maintenance window", "Dual writes, a backfill that could pause, and the dashboard that told us when to stop."],
    ["culture", "The review checklist we finally threw away", "It had grown to forty items. We replaced it with three questions and better tests."],
    ["design", "Dark mode is a palette, not an inversion", "Every token got a second value. Some of them needed a third."],
    ["product", "Pricing pages are the most-read docs we have", "So we started writing them like documentation."],
];
const AUTHORS = ["Ada Okafor", "Tomás Reyes", "Mei Lin", "Sven Adler", "Priya Nair", "Jonah Weiss"];
const COMMENTS = [
    "This matches what we saw last quarter — the fix was almost identical.",
    "Could you share the dashboard query? I'd like to try it on ours.",
    "Great write-up. The part about clock drift saved me an afternoon.",
    "We tried dual writes and hit ordering issues; how did you handle those?",
    "Bookmarking this for the next on-call rotation.",
];
const HUES = [["#5ccfe6", "#1d4c6b"], ["#ffb454", "#6b3a1d"], ["#c8a2ff", "#3a2466"], ["#a7e05f", "#2c4a1c"], ["#ff6b7f", "#5a1d2b"]];

let serial = 1;

/* Covers are generated SVG data URIs so the page needs no image files and no
   network. Each one is a gradient with a couple of shapes. */
function cover(i){
    const [a, b] = HUES[i % HUES.length];
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 90">
        <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs>
        <rect width="160" height="90" fill="url(#g)"/>
        <circle cx="${30 + (i * 37) % 100}" cy="${20 + (i * 23) % 50}" r="${14 + (i * 7) % 18}" fill="#080b11" opacity=".22"/>
        <rect x="${(i * 53) % 110}" y="58" width="60" height="60" rx="8" fill="#ffffff" opacity=".12" transform="rotate(-12 80 80)"/>
    </svg>`;
    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}

function posts(n){
    return Array.from({ length: n }, () => {
        const i = serial++;
        const [tag, title, excerpt] = TITLES[i % TITLES.length];
        const author = AUTHORS[i % AUTHORS.length];
        return { id: i, tag, title, excerpt, author, initial: author.charAt(0), time: (i % 9 + 1) + "h ago", cover: cover(i) };
    });
}

function comments(n){
    return Array.from({ length: n }, () => {
        const i = serial++;
        const author = AUTHORS[(i * 5) % AUTHORS.length];
        return { id: i, author, initial: author.charAt(0), time: (i % 50 + 2) + "m", text: COMMENTS[i % COMMENTS.length] };
    });
}

const fakeFetch = (ms, make) => new Promise(resolve => setTimeout(() => resolve(make()), ms));

const say = (el, text, cls) => {
    const node = $$.ss(el);
    node.className = "status" + (cls ? " " + cls : "");
    node.lastElementChild.textContent = text;
};

/* The page is dark, and the skeleton's default colours are for a light page.
   They are set through config.colors rather than by overriding the CSS custom
   properties, so each instance can differ - section 02 changes its own live. */
const DARK = { base: "#1b2638", highlight: "#2c3d58" };

const postTpl = $$.ss("#postTpl");
const rowTpl  = $$.ss("#rowTpl");

/* ===========================================================================
   HERO — a feed that loads
   ========================================================================= */

const feed = $$.ss("#feed");
const postCard = new Component(postTpl);
postCard.config.key = "id";
postCard.initialize();

const heroSkeleton = new Skeleton(feed);
heroSkeleton.config.template = postTpl;   // the SAME element Component was given
heroSkeleton.config.count = 6;
heroSkeleton.config.colors = DARK;
heroSkeleton.config.label = "Loading posts";
heroSkeleton.initialize();

let heroLatency = 900;

async function loadFeed(){
    const started = performance.now();
    say("#heroStatus", "loading… (" + heroLatency + "ms simulated)", "run");

    /* during() shows the skeleton, waits for the promise, holds the skeleton for
       its minDuration if it did appear, takes it down, and only THEN resolves -
       so the sync below never renders underneath a skeleton still on screen.
       The old cards stay in place until then: in template mode the skeleton sits
       in a layer beside the container, and the container is only hidden while
       the skeleton is actually showing. A fast load therefore never blanks it. */
    let shown = false;
    heroSkeleton.config.onShow = () => { shown = true; };
    const data = await heroSkeleton.during(fakeFetch(heroLatency, () => posts(6)));
    postCard.sync(feed, data);

    const total = Math.round(performance.now() - started);
    say("#heroStatus", shown
        ? "loaded in " + total + "ms — skeleton shown"
        : "loaded in " + total + "ms — under the 120ms delay, so no skeleton at all");
}

$$.ss("#heroReload").addEventListener("click", loadFeed);
$$.sa("#heroLatency button").forEach(b => b.addEventListener("click", () => {
    $$.sa("#heroLatency button").forEach(x => x.classList.toggle("on", x === b));
    heroLatency = Number(b.dataset.ms);
    loadFeed();
}));

/* ===========================================================================
   SECTION 1 — derived from your template
   ========================================================================= */

/* The source is printed from the template's own innerHTML, so what you read is
   what the skeleton was given, not a copy that could drift from it. */
(function printTemplate(){
    const lines = postTpl.innerHTML.replace(/^\n/, "").replace(/\s+$/, "").split("\n");
    const indent = Math.min(...lines.filter(l => l.trim()).map(l => l.match(/^\s*/)[0].length));
    const esc = s => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    $$.ss("#tplSource").innerHTML = lines.map(l => esc(l.slice(indent))
        .replace(/(data-skeleton)="([^"]*)"/g, '<span class="a">$1</span>=<span class="s">"$2"</span>')
        .replace(/(data-v-\w+)="([^"]*)"/g, '<span class="p">$1</span>=<span class="s">"$2"</span>')
        .replace(/&lt;(\/?)(\w+)/g, '&lt;$1<span class="t">$2</span>')
    ).join("\n");
})();

postCard.mount($$.ss("#realOne"), posts(1)[0]);

/* A skeleton that never lifts: delay 0 so it appears synchronously, and
   nothing ever calls hide(). Its container stays empty and hidden. */
const ghostOne = new Skeleton($$.ss("#ghostOne"));
ghostOne.config.template = postTpl;
ghostOne.config.colors = DARK;
ghostOne.config.delay = 0;
ghostOne.config.label = "";        // decorative here: nothing is actually loading
ghostOne.initialize();
ghostOne.show();

/* ===========================================================================
   SECTION 2 — playground
   ========================================================================= */

const playOut = $$.ss("#playOut");
/* One Component per template. A container belongs to one component's sync()
   at a time, so switching templates destroys the other's instances first. */
const playComponents = { post: new Component(postTpl), row: new Component(rowTpl) };
for (const c of Object.values(playComponents)){ c.config.key = "id"; c.initialize(); }

const play = new Skeleton(playOut);
const p = { template: "post", count: 3, animation: "shimmer", delay: 120, minDuration: 400,
            base: "#1b2638", highlight: "#2c3d58", radius: 6, label: "Loading comments", reveal: true, latency: 1200 };

const log = (msg) => {
    const el = $$.ss("#pLog");
    const t = (performance.now() / 1000).toFixed(2).padStart(7);
    el.textContent += t + "s  " + msg + "\n";
    el.scrollTop = el.scrollHeight;
};
let shownAt = 0;
play.config.onShow = (sk) => { shownAt = performance.now(); log("onShow   state=" + sk.state); };
play.config.onHide = (sk) => { log("onHide   state=" + sk.state + "   on screen " + Math.round(performance.now() - shownAt) + "ms"); };

function applyPlay(){
    /* Every setter validates and redraws a skeleton that is on screen, which is
       why this function can simply set everything on every input event. */
    play.config.template    = p.template == "post" ? postTpl : rowTpl;
    play.config.count       = p.count;
    play.config.animation   = p.animation;
    play.config.delay       = p.delay;
    play.config.minDuration = p.minDuration;
    play.config.colors      = { base: p.base, highlight: p.highlight };
    play.config.radius      = p.radius;
    play.config.label       = p.label;
    play.config.reveal      = p.reveal;
    playOut.className = p.template == "post" ? "feed" : "rows";
    $$.ss("#pCode").innerHTML = code();
}

function code(){
    const k = s => `<span class="k">${s}</span>`, s = v => `<span class="s">${v}</span>`, c = v => `<span class="c">${v}</span>`;
    return [
        `${k("const")} sk = ${k("new")} Skeleton(container);`,
        `sk.config.template    = $$.ss(${s(`"#${p.template}Tpl"`)});`,
        `sk.config.count       = ${p.count};`,
        `sk.config.animation   = ${s(`"${p.animation}"`)};`,
        `sk.config.delay       = ${p.delay};       ${c("// ms before anything appears")}`,
        `sk.config.minDuration = ${p.minDuration};       ${c("// ms it stays once it has")}`,
        `sk.config.colors      = { base: ${s(`"${p.base}"`)}, highlight: ${s(`"${p.highlight}"`)} };`,
        `sk.config.radius      = ${p.radius};`,
        `sk.config.label       = ${s(JSON.stringify(p.label))};`,
        `sk.config.reveal      = ${p.reveal};`,
        `sk.initialize();`,
        ``,
        `${k("const")} data = ${k("await")} sk.during(fetchJSON(url));`,
        `component.sync(container, data);`
    ].join("\n");
}

function bindRange(id, valId, key, unit = ""){
    const input = $$.ss(id);
    input.addEventListener("input", () => {
        p[key] = Number(input.value);
        $$.ss(valId).textContent = input.value + unit;
        applyPlay();
    });
}
bindRange("#pCount", "#vCount", "count");
bindRange("#pDelay", "#vDelay", "delay", "ms");
bindRange("#pMin", "#vMin", "minDuration", "ms");
bindRange("#pRadius", "#vRadius", "radius", "px");
bindRange("#pLat", "#vLat", "latency", "ms");
$$.ss("#pAnimation").addEventListener("change", e => { p.animation = e.target.value; applyPlay(); });
$$.ss("#pBase").addEventListener("input", e => { p.base = e.target.value; applyPlay(); });
$$.ss("#pHigh").addEventListener("input", e => { p.highlight = e.target.value; applyPlay(); });
$$.ss("#pLabel").addEventListener("input", e => { p.label = e.target.value; applyPlay(); });
$$.ss("#pReveal").addEventListener("change", e => { p.reveal = e.target.checked; applyPlay(); });
$$.ss("#pTemplate").addEventListener("change", e => {
    p.template = e.target.value;
    for (const c of Object.values(playComponents)) c.destroyAll();
    applyPlay();
});

$$.ss("#pLoad").addEventListener("click", async () => {
    const make = () => p.template == "post" ? posts(p.count) : comments(p.count);
    const data = await play.during(fakeFetch(p.latency, make));
    const other = p.template == "post" ? "row" : "post";
    playComponents[other].destroyAll();
    playComponents[p.template].sync(playOut, data);
    log("rendered " + data.length + " item(s)");
});
$$.ss("#pShow").addEventListener("click", () => { play.show(); log("show()   state=" + play.state); });
$$.ss("#pHide").addEventListener("click", async () => {
    log("hide()   state=" + play.state);
    await play.hide();
    log("hide() resolved");
});
$$.ss("#pClearLog").addEventListener("click", () => { $$.ss("#pLog").textContent = ""; });

/* The state pill is polled rather than driven by the callbacks, because
   'pending' and 'hiding' have no callback of their own - they are exactly the
   windows in which nothing visible happens. */
setInterval(() => {
    const pill = $$.ss("#pState");
    pill.textContent = play.state;
    pill.classList.toggle("on", play.state != "idle");
}, 60);

play.initialize();
applyPlay();

/* ===========================================================================
   SECTION 3 — timing
   ========================================================================= */

function lane(id, delay, minDuration){
    const root = $$.ss(id);
    const out = root.querySelector(".lane-out");
    const comp = new Component(rowTpl);
    comp.config.key = "id";
    comp.initialize();
    const sk = new Skeleton(out);
    sk.config.template = rowTpl;
    sk.config.count = 2;
    sk.config.colors = DARK;
    sk.config.delay = delay;
    sk.config.minDuration = minDuration;
    sk.config.reveal = false;     // so what you see is the skeleton's timing alone
    sk.initialize();
    comp.sync(out, comments(2));

    return async function run(ms){
        let on = null, off = null;
        const t0 = performance.now();
        sk.config.onShow = () => { on = performance.now() - t0; };
        sk.config.onHide = () => { off = performance.now() - t0; };
        const data = await sk.during(fakeFetch(ms, () => comments(2)));
        const done = performance.now() - t0;
        comp.sync(out, data);

        // Draw the bar on a scale long enough for both the load and the skeleton.
        const span = Math.max(done, off || 0) * 1.08;
        root.querySelector(".seg-load").style.width = (ms / span * 100) + "%";
        const skBar = root.querySelector(".seg-sk");
        const verdict = root.querySelector(".verdict");
        root.querySelector(".axis-end").textContent = Math.round(span) + "ms";
        if (on == null){
            skBar.style.width = "0";
            verdict.className = "verdict good";
            verdict.textContent = "never shown — the data beat the delay";
        }else{
            const dur = Math.round(off - on);
            skBar.style.left = (on / span * 100) + "%";
            skBar.style.width = Math.max(0.6, (off - on) / span * 100) + "%";
            skBar.classList.toggle("flash", dur < 150);
            verdict.className = "verdict " + (dur < 150 ? "bad" : "good");
            verdict.textContent = dur < 150
                ? "flashed for " + dur + "ms — a blink the eye reads as a glitch"
                : "on screen " + dur + "ms" + (off > ms + 5 ? ", held " + Math.round(off - ms) + "ms past the data" : "");
        }
    };
}

const naive = lane("#laneNaive", 0, 0);
const tuned = lane("#laneTuned", 120, 400);
$$.sa("section .row button[data-ms]").forEach(b => b.addEventListener("click", () => {
    const ms = Number(b.dataset.ms);
    naive(ms);
    tuned(ms);
}));

/* ===========================================================================
   SECTION 4 — mask mode
   ========================================================================= */

const maskTarget = $$.ss("#maskTarget");
const masker = new Skeleton(maskTarget);  // no template: mask mode
masker.config.colors = DARK;
masker.config.label = "Refreshing metrics";
masker.initialize();

const HEADLINES = [
    ["Throughput is up for the third week running", "The new queue absorbed Tuesday's spike without shedding a single job, and p95 latency stayed under the line all week."],
    ["A quieter week: fewer jobs, faster ones", "Volume dipped with the holiday, and the headroom showed up as the lowest latency we have recorded this quarter."],
    ["One slow dependency, contained", "A partner API degraded on Thursday. The circuit breaker opened within a minute and the success rate barely moved."],
];
let refreshes = 0;

$$.ss("#mRefresh").addEventListener("click", async () => {
    const before = maskTarget.innerHTML;
    say("#mStatus", "refreshing…", "run");

    await masker.during(fakeFetch(1400, () => null));

    /* The comparison is made BEFORE the new values are written: it checks that
       taking the mask off put back exactly the markup that was there. */
    const restored = maskTarget.innerHTML === before;

    const [title, text] = HEADLINES[++refreshes % HEADLINES.length];
    $$.ss("#mTitle").textContent = title;
    $$.ss("#mText").textContent = text;
    $$.ss("#mN1").textContent = (9000 + Math.round(Math.random() * 6000)).toLocaleString();
    $$.ss("#mN2").textContent = (120 + Math.round(Math.random() * 120)) + "ms";
    $$.ss("#mN3").textContent = (99.9 + Math.random() * 0.09).toFixed(2) + "%";

    say("#mStatus", restored
        ? "markup restored byte-for-byte after unmask (" + before.length + " chars compared), then updated"
        : "markup differs after unmask", restored ? "" : "err");
});

/* ===========================================================================
   SECTION 5 — validation
   ========================================================================= */

const scratch = document.createElement("div");
document.body.appendChild(scratch);
scratch.hidden = true;

function bad(markup){
    const t = document.createElement("template");
    t.innerHTML = markup;
    return t;
}

const MISUSES = [
    ["new Skeleton(\"#feed\")",               () => new Skeleton("#feed")],
    ["show() before initialize()",          () => new Skeleton(scratch).show()],
    ["config.count = 0",                    () => { new Skeleton(scratch).config.count = 0; }],
    ["config.count = 2.5",                  () => { new Skeleton(scratch).config.count = 2.5; }],
    ["config.animation = \"wave\"",          () => { new Skeleton(scratch).config.animation = "wave"; }],
    ["config.delay = -50",                  () => { new Skeleton(scratch).config.delay = -50; }],
    ["config.colors = { bg: … }",           () => { new Skeleton(scratch).config.colors = { bg: "#000" }; }],
    ["config.colors.base = \"nope\"",        () => { new Skeleton(scratch).config.colors = { base: "nope" }; }],
    ["config.radius = \"round\"",            () => { new Skeleton(scratch).config.radius = "round"; }],
    ["data-skeleton=\"blob\"",               () => { new Skeleton(scratch).config.template = bad('<div><b data-skeleton="blob"></b></div>'); }],
    ["data-skeleton=\"text:0\"",             () => { new Skeleton(scratch).config.template = bad('<div><p data-skeleton="text:0"></p></div>'); }],
    ["data-skeleton=\"rect:wide\"",          () => { new Skeleton(scratch).config.template = bad('<div><i data-skeleton="rect:wide"></i></div>'); }],
    ["empty <template>",                    () => { new Skeleton(scratch).config.template = bad(''); }],
    ["template mode, detached container",   () => {
        const sk = new Skeleton(document.createElement("div"));
        sk.config.template = rowTpl; sk.initialize(); sk.show();
    }],
    ["during(42)",                          () => { const sk = new Skeleton(scratch); sk.initialize(); sk.during(42); }],
    ["show() after destroy()",              () => { const sk = new Skeleton(scratch); sk.initialize(); sk.destroy(); sk.show(); }],
];

const errGrid = $$.ss("#errGrid");
for (const [label, fn] of MISUSES){
    const b = document.createElement("button");
    b.textContent = label;
    b.addEventListener("click", () => {
        try{
            fn();
            $$.ss("#errOut").textContent = "(no error thrown)";
        }catch(e){
            $$.ss("#errOut").textContent = e.name + ": " + e.message;
        }
    });
    errGrid.appendChild(b);
}

/* ---------------------------------------------------------------------------
   First paint: load the hero feed so the page opens on the skeleton at work.
   ------------------------------------------------------------------------- */
loadFeed();

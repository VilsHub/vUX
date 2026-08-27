/*
 * vUX AutoWriter — runnable example.
 *
 * Every writer on this page is a plain `new AutoWriter()`. There is no initialize()
 * call: unlike the trigger-driven components, AutoWriter is driven by method calls.
 */
import { AutoWriter } from "../../vUX-autoWriter.js";

const $ = (sel, root = document) => root.querySelector(sel);
const $$$ = (sel, root = document) => root.querySelectorAll(sel);

/* ------------------------------------------------------------------ *
 * 1. Hero — a headline, and a subject line that rewrites itself
 * ------------------------------------------------------------------ */

const heroWriter = new AutoWriter();
heroWriter.config.typingSpeed = [38, 105];
heroWriter.config.showCursor = true;
heroWriter.config.cursorStyle = { width: "3px", color: "#ffb454" };

//the trailing pause leaves the caret blinking once the words have landed
heroWriter.writeText($("#heroLine"), "Type it. Pause it. Take it back.~1200~");

const subWriter = new AutoWriter();
subWriter.config.typingSpeed = [45, 95];
subWriter.config.showCursor = true;
subWriter.config.cursorStyle = { width: "2px", color: "#5ccfe6" };

const AUDIENCE = ["hero sections.", "terminals.", "onboarding.", "404 pages.", "you."];
let audienceAt = 0;

//Each cycle is ONE writeText call: type the word, hold, then backspace exactly what was
//typed. Because the erase is part of the string it stays in step with the typing — a
//separate deleteText() call would be a second animation competing for the same node.
function cycleAudience() {
    const word = AUDIENCE[audienceAt];
    audienceAt = (audienceAt + 1) % AUDIENCE.length;
    subWriter.writeText($("#heroSub"), word + "~1600~*" + word.length + "*", cycleAudience);
}
cycleAudience();

/* ------------------------------------------------------------------ *
 * 2. Playground
 * ------------------------------------------------------------------ */

const PRESETS = {
    basic:   "Hello.~700~ I type one character at a time.",
    rewrite: "This is a first draft.~900~*14*finished thought.~600~|Nothing above was re-rendered.",
    poem:    "Roses are red,|violets are blue,~800~|this is one string|and one call to writeText.",
    boot:    "$ vux --serve~700~|loading core.........~500~ok|linking autoWriter.css...~500~ok|ready~400~|$ _~4000~"
};

const playWriter = new AutoWriter();
const stage = $("#playStage");

const ui = {
    script: $("#script"), spdMin: $("#spdMin"), spdMax: $("#spdMax"), blink: $("#blink"),
    cursor: $("#cursor"), color: $("#cursorColor"), width: $("#cursorWidth"),
    status: $("#status"), statusText: $("#statusText"), snippet: $("#snippet")
};

ui.script.value = PRESETS.basic;

function setStatus(state, text) {
    ui.status.className = "status" + (state ? " " + state : "");
    ui.statusText.textContent = text;
}

//config is write-only across vUX, so the page keeps its own copy of what it set
function currentConfig() {
    const min = Number(ui.spdMin.value);
    const max = Number(ui.spdMax.value);
    return {
        //a slider pushed past the other must not produce an inverted range
        typingSpeed: [Math.min(min, max), Math.max(min, max)],
        showCursor: ui.cursor.checked,
        cursorStyle: { style: "solid", width: ui.width.value, color: ui.color.value },
        cursorBlinkDelay: Number(ui.blink.value)
    };
}

function applyConfig(writer) {
    const c = currentConfig();
    writer.config.typingSpeed = c.typingSpeed;
    writer.config.showCursor = c.showCursor;
    writer.config.cursorStyle = c.cursorStyle;
    writer.config.cursorBlinkDelay = c.cursorBlinkDelay;
    return c;
}

const esc = s => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function renderSnippet() {
    const c = currentConfig();
    const cursorLines = c.showCursor
        ? `<span class="p">writer</span>.config.showCursor       = <span class="k">true</span>;
<span class="p">writer</span>.config.cursorStyle      = { style: <span class="s">"solid"</span>, width: <span class="s">"${c.cursorStyle.width}"</span>, color: <span class="s">"${c.cursorStyle.color}"</span> };
<span class="p">writer</span>.config.cursorBlinkDelay = ${c.cursorBlinkDelay};
`
        : `<span class="p">writer</span>.config.showCursor       = <span class="k">false</span>;\n`;

    ui.snippet.innerHTML =
`<span class="k">const</span> <span class="p">writer</span> = <span class="k">new</span> AutoWriter();

<span class="p">writer</span>.config.typingSpeed      = [${c.typingSpeed[0]}, ${c.typingSpeed[1]}];
${cursorLines}
<span class="p">writer</span>.writeText(stage, <span class="s">"${esc(ui.script.value).replace(/\n/g, "\\n")}"</span>);`;
}

function run() {
    applyConfig(playWriter);
    try {
        setStatus("run", "typing…");
        //writeText validates the whole string up front, so a bad directive throws HERE
        playWriter.writeText(stage, ui.script.value, () => setStatus("", "done — callback fired"));
    } catch (error) {
        setStatus("err", error.message);
    }
}

$("#run").addEventListener("click", run);

$("#stop").addEventListener("click", () => {
    playWriter.stop();                       //cancels the run and clears its timers
    setStatus("", "stopped — text left as it was, no callback");
});

$("#del").addEventListener("click", () => {
    applyConfig(playWriter);
    try {
        //the same element given to writeText: deleteText erases the text it typed
        playWriter.deleteText(5, stage, () => setStatus("", "deleteText done"));
        setStatus("run", "erasing 5 units…");
    } catch (error) {
        setStatus("err", error.message);
    }
});

$("#clear").addEventListener("click", () => {
    playWriter.stop();
    //a fresh run empties the span anyway; this just blanks it now
    playWriter.writeText(stage, "");
    setStatus("", "idle");
});

$$$("[data-preset]").forEach(button => {
    button.addEventListener("click", () => {
        ui.script.value = PRESETS[button.dataset.preset];
        renderSnippet();
        run();
    });
});

[ui.spdMin, ui.spdMax, ui.blink].forEach(slider => {
    slider.addEventListener("input", () => {
        $("#spdMinV").textContent = ui.spdMin.value;
        $("#spdMaxV").textContent = ui.spdMax.value;
        $("#blinkV").textContent = ui.blink.value;
        renderSnippet();
    });
});
[ui.cursor, ui.color, ui.width, ui.script].forEach(el => el.addEventListener("input", renderSnippet));

renderSnippet();

/* ------------------------------------------------------------------ *
 * 3. Directive cards — each gets its own writer and its own target
 * ------------------------------------------------------------------ */

const DEMOS = {
    br:   "Roses are red|violets are blue",
    del:  "I am almost done*4*certain",
    wait: "Thinking~1500~ done."
};

//two writers must never share a target, so each card keeps its own
Object.keys(DEMOS).forEach(key => {
    const writer = new AutoWriter();
    writer.config.typingSpeed = [42, 95];
    writer.config.showCursor = true;
    writer.config.cursorStyle = { width: "2px", color: "#5ccfe6" };

    $(`[data-play="${key}"]`).addEventListener("click", () => {
        writer.writeText($(`[data-mini="${key}"]`), DEMOS[key]);
    });
});

/* ------------------------------------------------------------------ *
 * 4. Collection mode — one call, three elements, typed in sequence
 * ------------------------------------------------------------------ */

const seqWriter = new AutoWriter();
seqWriter.config.typingSpeed = [26, 62];
seqWriter.config.showCursor = true;
seqWriter.config.cursorStyle = { width: "2px", color: "#ffb454" };

$("#seqRun").addEventListener("click", () => {
    const lines = $$$(".seq-line");                //a live NodeList
    const cards = $$$(".seq-card");
    cards.forEach(card => card.classList.remove("on"));
    $("#seqNote").textContent = "typing…";

    //One call, one callback at the end. Highlighting is driven off a timer here only
    //because the component reports no per-element progress.
    seqWriter.writeText(
        lines,
        ["new AutoWriter()", "config.typingSpeed", "writeText(el, str)"],
        () => { $("#seqNote").textContent = "callback fired once, after the last element"; }
    );

    let at = 0;
    const mark = () => {
        if (at >= cards.length) return;
        cards[at].classList.add("on");
        at++;
        setTimeout(mark, 900);
    };
    mark();
});

/* ------------------------------------------------------------------ *
 * 5. Validation — every one of these throws synchronously
 * ------------------------------------------------------------------ */

const BAD = {
    unterminated: () => new AutoWriter().writeText($("#playStage"), "wait~500"),
    nondigit:     () => new AutoWriter().writeText($("#playStage"), "a~xy~b"),
    mismatch:     () => new AutoWriter().writeText($$$(".seq-line"), ["one", "two"]),
    fraction:     () => new AutoWriter().deleteText(2.5, $("#playStage")),
    type:         () => new AutoWriter().writeText($("#playStage"), 42)
};

$$$("[data-bad]").forEach(button => {
    button.addEventListener("click", () => {
        try {
            BAD[button.dataset.bad]();
            $("#errOut").textContent = "No error thrown — that should not happen.";
        } catch (error) {
            $("#errOut").textContent = error.constructor.name + ": " + error.message;
        }
    });
});

/* expose the writers for console poking */
window.playWriter = playWriter;
window.heroWriter = heroWriter;
window.seqWriter = seqWriter;

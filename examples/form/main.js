/*
 * vUX FormComponents — runnable example, exercising all six builders.
 *
 * Each builder hides the native input and draws a widget in front of it. The colours
 * below are the example page's dark palette, passed in as config CSS strings: the
 * component ships structure, the consuming page supplies the look.
 */
import { FormComponents } from "../../vUX-formComponents.js";

const $ = sel => document.querySelector(sel);
const $$$ = sel => document.querySelectorAll(sel);

const fc = new FormComponents();

/* the page's design tokens, so widget config and stylesheet cannot drift apart */
const T = {
    ink:"#080b11", panel:"#0f1520", panel2:"#141c2a", line:"#1f2a3a",
    fg:"#d7e0ec", muted:"#7b8ba3", edge:"#3a4a60",
    amber:"#ffb454", onAmber:"#20160a", cyan:"#5ccfe6"
};

/* ------------------------------------------------------------------ *
 * select
 * ------------------------------------------------------------------ */
const select = fc.select();
select.config.className = "demo-select";
select.config.sizeAttribute = "data-size";      // FULL attribute name, "width,height"
select.config.selectFieldStyle = `background:${T.ink}; color:${T.fg}; border:solid 1px ${T.line}; border-radius:8px;`;
select.config.searchIconStyle = `content:'\\2315'; color:${T.muted};`;
select.config.optionStyle = `padding:0 12px; height:34px; line-height:34px; cursor:pointer; color:${T.fg};`;
select.config.optionGroupStyle = `background:${T.panel2}; color:${T.cyan};`;
select.config.optionStateStyle = [
    `background:${T.panel2};`,                   // hovered
    `background:${T.amber}; color:${T.onAmber};`  // selected
];
select.config.selectFieldToolTip = true;         // full list tooltip on the multiple select
select.autoBuild();

/* mutate the native select, then rebuild only that widget */
let extra = 0;
$("#addOption").addEventListener("click", () => {
    const native = $("select[name='fruit']");
    const option = document.createElement("option");
    option.textContent = "Extra fruit " + (++extra);
    native.appendChild(option);
    select.refreshSelect(native);                //new markup is never converted automatically
    log("option added → refreshSelect() rebuilt that one widget");
});

/* ------------------------------------------------------------------ *
 * radio
 * ------------------------------------------------------------------ */
const radio = fc.radio();
radio.config.className = "demo-radio";
radio.config.radioButtonSize = ["18px", "18px"];
radio.config.axisClass = ["h-group", "v-group"]; // [xAxisClass, yAxisClass] on group containers
radio.config.selectedRadioStyle = `background-color:${T.amber};`;
radio.config.deselectedRadioStyle = `background-color:${T.ink}; border:solid 1px ${T.edge};`;
radio.config.mouseEffectStyle = [`border-color:${T.cyan};`, `background-color:${T.panel2};`]; // [hover, active]
radio.autoBuild();

/* ------------------------------------------------------------------ *
 * checkbox
 * ------------------------------------------------------------------ */
// the static stylesheet draws no glyph of its own, so "checked" supplies one via content
const checkbox = fc.checkbox();
checkbox.config.className = "demo-check";
checkbox.config.checkboxSize = ["18px", "18px"];
checkbox.config.checkedCheckboxStyle = `content:'\\2714'; color:${T.onAmber}; background:${T.amber}; border:solid 1px ${T.amber}; border-radius:4px; font-size:13px; line-height:18px;`;
checkbox.config.uncheckedCheckboxStyle = `background:${T.ink}; border:solid 1px ${T.edge}; border-radius:4px;`;
checkbox.config.mouseEffectStyle = [`border-color:${T.cyan};`, `background:${T.panel2};`];
checkbox.autoBuild();

/* ------------------------------------------------------------------ *
 * datePicker
 * ------------------------------------------------------------------ */
const datePicker = fc.datePicker();
datePicker.config.className = "demo-date";
datePicker.config.sizeAttribute = "data-size";
datePicker.config.validationAttribute = "data-complete";  // mirrored by the state lines below
datePicker.config.inputIconStyle = [`content:'\\1F4C5'; font-size:15px;`]; // calendar glyph
datePicker.config.selectionStyle = `background-color:${T.amber}; color:${T.onAmber};`;
datePicker.config.labelProperties = [T.panel2, T.fg, `solid 1px ${T.line}`]; // [background, fontColor, border]
datePicker.config.daysToolTip = true;                     // weekday names on day cells
datePicker.autoBuild();

/* The picker writes the ISO value and the completeness flag onto the native input's
 * attributes and does NOT fire change, so these lines watch attribute mutations. */
function mirrorDateState(name, targetId) {
    const native = $("input[name='" + name + "']");
    const target = $("#" + targetId);
    const show = () => {
        target.textContent = "value: " + (native.getAttribute("value") || "—") +
                             "  |  complete: " + native.getAttribute("data-complete");
    };
    new MutationObserver(show).observe(native, { attributes: true, attributeFilter: ["value", "data-complete"] });
    show();
}
mirrorDateState("dob", "dateState");
mirrorDateState("meeting", "dtState");

/* ------------------------------------------------------------------ *
 * slideSwitch
 * ------------------------------------------------------------------ */
const slideSwitch = fc.slideSwitch();
slideSwitch.config.className = "demo-switch";
slideSwitch.config.dataAttributeNames = { size: "dim", label: "labels" }; // names WITHOUT the data- prefix
slideSwitch.config.styles = {
    wrapper: ["", `background:${T.amber}; border-color:${T.amber};`, `background:#2a3546;`], // [normal, on, off]
    handle:  [`border:solid 1px ${T.panel}; box-shadow:0 1px 3px rgba(0,0,0,.6);`, "", ""],
    label:   [`color:${T.onAmber}; line-height:28px; padding-left:10px;`,                    // [on, off]
              `color:${T.fg}; line-height:28px; padding-left:34px;`]
};
slideSwitch.autoBuild();

/* inject brand-new switch markup after the initial build, then refresh() converts it */
let injected = 0;
$("#injectSwitch").addEventListener("click", () => {
    const container = $("#switches");
    const row = document.createElement("div");
    row.className = "switch-row";
    //the checkbox must be the LAST element child of its own wrapper DIV
    row.innerHTML = "<label>Injected " + (++injected) + "</label>" +
        "<div><input type='checkbox' name='injected" + injected + "' class='demo-switch' " +
        "data-dim='70px,30px' data-labels='On,Off'></div>";
    container.insertBefore(row, $("#injectSwitch"));
    slideSwitch.refresh(container);
    log("switch injected → slideSwitch.refresh() converted it");
});

/* ------------------------------------------------------------------ *
 * file
 * ------------------------------------------------------------------ */
const file = fc.file();
file.config.className = "demo-file";
file.config.dataAttributeNames = { size: "dim" };
file.config.fileLabel = "No file chosen";
file.config.buttonLabel = "Browse…";
file.config.fileToolTip = true;                  // full file name as a tooltip
file.config.enableButtonIcon = true;
file.config.styles = {
    toolTip: { arrowColor: T.amber, fontColor: T.onAmber },
    fileLabel: `background:${T.ink}; color:${T.fg}; border:solid 1px ${T.line}; border-right:none; border-radius:8px 0 0 8px;`,
    inputButton: `background:${T.amber}; color:${T.onAmber}; border:none; cursor:pointer; border-radius:0 8px 8px 0;`,
    buttonIcon: "content:'\\1F4C2';"
};
file.autoBuild();

/* ------------------------------------------------------------------ *
 * Native change log
 * ------------------------------------------------------------------ */
function log(message) {
    const box = $("#log");
    box.textContent += message + "\n";
    box.scrollTop = box.scrollHeight;
}
$("#clearLog").addEventListener("click", () => { $("#log").textContent = ""; });

/* One delegated listener (change bubbles): every entry here was fired by a hidden
 * NATIVE input, i.e. caused by interacting with a widget. Delegation also covers
 * natives injected after load. */
document.addEventListener("change", event => {
    const native = event.target;
    if (!native.name) return;
    let value;
    if (native.type === "checkbox" || native.type === "radio") {
        value = (native.checked ? "checked" : "unchecked") + (native.value !== "on" ? " (" + native.value + ")" : "");
    } else if (native.type === "file") {
        value = native.files.length > 0 ? native.files[0].name : "(none)";
    } else if (native.multiple) {
        value = [...native.selectedOptions].map(option => option.textContent).join(", ") || "(none)";
    } else {
        value = native.value;
    }
    log("change  <" + native.nodeName.toLowerCase() + " name='" + native.name + "'>  →  " + value);
});

/* ------------------------------------------------------------------ *
 * Validation — every one of these throws
 * ------------------------------------------------------------------ */
const BAD = {
    className:    () => { fc.select().config.className = 42; },
    radioSize:    () => { fc.radio().config.radioButtonSize = ["18px"]; },
    radioDim:     () => { fc.radio().config.radioButtonSize = ["18px", "tall"]; },
    checkSize:    () => { fc.checkbox().config.checkboxSize = "18px"; },
    labelProps:   () => { fc.datePicker().config.labelProperties = ["a", "b", "c", "d"]; },
    switchStyle:  () => { fc.slideSwitch().config.styles = { wrapper: "x" }; },
    unknownStyle: () => { fc.slideSwitch().config.styles = { glow: [] }; },
    //autoBuild() refuses an incomplete setup: the size is checked before the class name
    incomplete:   () => { fc.radio().autoBuild(); }
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

/* exposed for the console */
window.demoForm = { select, radio, checkbox, datePicker, slideSwitch, file };

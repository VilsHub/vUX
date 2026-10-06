# Changelog
## v4.0.0-beta
## Added
- domDrawer module
- $$.styleElement() feature
- slideSwitch sub module to custom form module
- blur overlayType to modalDisplayer module
- optionStateStyle to selectCustom input
- wrapAttribute property to both custom select and datepicker
- utility namespace ($$), with some modules moved to it
- return datatype option to Ajax.Create() static method
- Resizer module
- Slide utility
- SPAEngine module for redering SPA (Single Page Application) with CSR (Client server rendering)
- $$.getURLParams()
- DataView module (vUX-dataView.js) — keyed data-to-DOM binding for hot-update views (targeted cell updates, node-moving sort/filter)
- Modal stacking in ModalDisplayer — a trigger inside a displayed modal opens a new layer on top; one stack shared across instances; closeAll() to unwind it
- SPAEngine named route params (;name and ;name:regex pattern segments), with route params/data passed to boot, click, history and fallback callbacks
- SPAEngine route exit hook (routes.<name>.exitCallback, falling back to config.exitCallback) fired before a route's content is replaced
- Documentation set under doc/ — index plus SPA engine, progress indicator, data view, modal displayer and form components guides
- Runnable examples: SPA app with bundled dev server (examples/spa/), modal demo exercising all four effects, stacking and both overlay modes (examples/modal/), form components demo exercising all six builders (examples/form/)
- Live table page in the SPA example demonstrating DataView and the route exit hook
- CLAUDE.md project instructions and the per-change logging convention under changelog/<feature>/
- AutoWriter.stop() — cancels a run in progress and clears its timers
- Auto writer guide (doc/auto-writer.md) and runnable example (examples/autowriter/) with a live playground over every config property
- Example page design standard in CLAUDE.md — module examples are designed pages, not bare demos — and the requirement to record every change in ChangeLog.md
- Shared example design system (examples/shared/example.css) — one palette and one set of primitives across every example page
- Live config controls, a hero that leads with the working component, and a validation section printing real thrown errors, on the modal, form and SPA example pages
- Resizer.destroy() — removes the module's listeners and any resize handlers it injected, and releases a drag in progress
- Runnable Resizer example (examples/resizer/) — both axes at once, a playground over every config property, a consumer-supplied drag handle, all four edges, teardown, and the validation errors
- Resizer guide (doc/resizer.md) — the handle contract, edge growth, bounds, styling and specificity, teardown, and the module's mouse-only and keyboard limits
- destroy() on every component — AutoWriter, Carousel, DOMDrawer, FormValidator, ListScroller, ModalDisplayer, ProgressIndicator, SPAEngine, TimeLineList, ToolTip and TouchHandler, plus each of the six FormComponents widgets — detaching the listeners, timers and animations the component started and removing the DOM it injected, so a component can be torn down without leaving anything bound to the page
- $$.attachEventHandler() now returns a handle whose detach() removes the delegated listener again; calls that ignore the return value are unaffected
- destroy() on the object returned by CShapes().animatedRectangle() — stops the animation and clears the canvas, where stop() leaves the last frame painted
- ToolTip.destroy() restores the original title attribute on every element it took one from
- Component module (vUX-component.js) — build your own reusable component from your own markup: a `<template>` marked with `data-v-*` bindings, cloned and managed by vUX, with `mount()`, `update()`, `destroy()` and keyed `sync()`
- Component bindings: `data-v-field` (text), `data-v-bind` (attributes), `data-v-on` (events), `data-v-ref` (named nodes), `data-v-show` and `data-v-class` (truthiness toggles) — every value a plain field name, never an expression
- Component nesting: a child mounted with `instance.mount()` is owned by its parent and destroyed with it, and `config.onMount`/`onUpdate`/`onDestroy` are where nested vUX components are attached and released
- DataView rows now accept the full binding set — `data-v-bind`, `data-v-on`, `data-v-ref`, `data-v-show` and `data-v-class` work alongside `data-v-field` — with `config.handlers` and `config.formatters` to drive them
- Component guide (doc/component.md) — the binding contract, both template forms, keyed lists, nesting, the custom-element recipe, and the full error list
- Runnable Component example (examples/component/) — every binding under live control, keyed lists keeping their nodes through a sort, nesting with a ToolTip attached and released, and every validation error raised on demand
- Carousel config changes on a live carousel — delay, speed, slideEffect, buttonStyle and touchResponse now take effect after initialize() and start() instead of only before them
- Carousel guide (doc/carousel.md) — the required consumer CSS, every config property, the generated markup, and the error list
- Runnable Carousel example (examples/carousel/) — a live playground over every config property, two carousels with independent dot styles, swipe and hover pause, and the validation errors
- TimeLineList guide (doc/timeline-list.md) — the attribute contract, the three specificity tiers, centring custom markers, the generated markup, limits, and the error list
- Runnable TimeLineList example (examples/timelinelist/) — a live playground over every data attribute, three differently-styled lists on one instance, refresh() for lists that arrive later, and the validation errors
- ListScroller config.scrollSpeed and config.paddingRight now work: scrollSpeed is the duration of one button scroll in milliseconds (0 jumps), and paddingRight leaves room after the last item inside the scroll range
- ListScroller buttons, inactiveButtonClassName, wrapperStyle, hasButtons and the paddings can be changed on a running scroller
- ListScroller buttons get aria-disabled matching their inactive state
- ListScroller guide (doc/list-scroller.md) — the container, list and button contract, every config property, the markup it produces, limits and the error list
- Runnable ListScroller example (examples/listscroller/) — a live playground over every config property, button state following swipes, resizes and new items, a buttonless row, and the validation errors
- Skeleton module (vUX-skeleton.js) — placeholder screens derived from the template you already wrote for the real content: fields become text bars, images media blocks, controls filled blocks, and your card, padding and grid are kept, so the skeleton has the layout of what replaces it
- Skeleton `data-skeleton` attribute — `text:N`, `circle`, `circle:<size>`, `rect`, `rect:<w>/<h>`, `media`, `keep` and `skip` override what an element is inferred to be
- Skeleton timing — `config.delay` keeps a fast load from flashing a skeleton at all, `config.minDuration` keeps a slow one from flickering off, and `hide()` returns a promise so you render once it is down; `during(promise)` wraps the whole flow
- Skeleton mask mode — with no template, masks the container's existing content in place for a refresh, and puts the same nodes back afterwards
- Skeleton guide (doc/skeleton.md) — the two modes, what becomes what, `data-skeleton`, timing, styling through custom properties, accessibility, limits and the error list
- Runnable Skeleton example (examples/skeleton/) — a feed reloading at three speeds, a template beside its rendered card and derived skeleton, a playground over every config property, a with/without timing comparison, mask mode with a byte-for-byte check, and the validation errors
- SketchPad module (vUX-sketchPad.js) — a canvas drawing surface, extracted from the Sketchpad whiteboard app: rectangles, ellipses, diamonds, triangles, pentagons, hexagons, stars, lines, arrows, freehand pen, text, font icons and images, with selection, marquee, move, resize, duplicate, delete, undo/redo, wheel zoom and pan
- SketchPad connectors — drag from a shape's border to another shape's to draw an arrow bound at both ends that re-routes when either shape moves or resizes; pressing Ctrl while drawing pins a joint, which curves the connector at that point
- SketchPad scene as data — `elements` returns the scene as plain JSON and `load()` restores it (optionally as an undoable step); `exportCanvas()` renders it cropped to its content at any scale and background for PNG export or thumbnails
- SketchPad constrained mode — `config.tools` limits the tools offered, `config.panZoom = false` fixes the view, `config.bounded` keeps every shape inside the surface and `config.maxElements` caps the scene, for a pad that marks out one region over an image
- SketchPad stamps and icons — `createStamp()` turns SVG source into a stamp the stamp tool places, with black-only SVGs retinted by the fill colour; `icon` arms the icon tool with a glyph from any loaded font
- SketchPad works with touch and pen as well as the mouse, and several pads can share a page: pointer events are the canvas's own and keyboard shortcuts go to the focused pad (or the whole document, with `config.keyboardScope`)
- SketchPad guide (doc/sketch-pad.md) and runnable example (examples/sketchpad/)

## Fixed
- modal multiple display bug
- draw() call on backward compatibility (> ver 2.0)
- datepicker auto place issue
- 404 on loading core.css error
- SPAEngine boolean link attributes ("false"/"0" no longer read as true), addToHistory opt-out actually enforced, and per-link flags no longer leaking into subsequent navigations
- SPAEngine history storing the configured path literal instead of the actual requested URL, so dynamic routes now survive refresh/bookmark
- SPAEngine dynamic pattern matching treating any route with a different segment count as a match (undeclared status variable)
- ProgressIndicator default progress space never resolving; showProgress/hideProgress now callable without an element when a default space exists
- ProgressIndicator crawl timer leaking in hideProgress, and a finished style 3 bar animating backwards from 100% on re-show
- ModalDisplayer nesting destroying the first modal's state and leaving the page frozen (per-modal state now lives on stack layers, nothing addressed by global id)
- ModalDisplayer: ReferenceError on tall modals, tall modals unreachable below the fold, overlayStyle assigned to a read-only style object, openProcessor firing zero or two times depending on effect, per-trigger widths and blur leaking past close, host page scroll-behavior rewritten permanently, backface-visibility typo in the flip effect
- Page behind an open modal reflowing dramatically on every open/close (body no longer taken out of flow)
- Modal overlay missing its left:0 horizontal anchor
- Module registry: deduplicated spaEngine entry; added missing formValidator, progressIndicator, toolTip, domDrawer and dataView entries
- datePicker missing FormValidator and ListScroller imports (crash on opening default-range pickers and on building datetime-local pickers)
- datePicker daysToolTip broken by handler variable typo
- datePicker February day count in leap years (and upgraded to the full Gregorian leap-year rule)
- datePicker decade-series scroll buttons dead (wrong ListScroller config property name, nonexistent properties, missing vListBt button classes); the setup error also broke the open picker's z-index raise
- datePicker daysToolTipProperties validation never running
- select config.optionGroupStyle throwing on set; the style is now applied to optgroup label rows
- select and datePicker sizeAttribute/wrapAttribute setters validating the message instead of the value
- select dropdown and datePicker panel auto-placement using the last-built widget's dimensions instead of each widget's own
- slideSwitch.refresh() and file.refreshFile() referencing functions from other builders
- slideSwitch crash when the label data attribute is absent; missing labels now default to "On"/"Off" instead of rendering "undefined"
- file input crash on selecting a file with fileToolTip disabled, and on cancelling the file dialog
- radio build crash when the input has no sibling element
- checkbox widgets collapsing to zero height (static height:auto overriding the generated size)
- radio buttons invisible (missing content on the circle-drawing ::before rule)
- configured component styles silently losing CSS-cascade ties to formComponents.css defaults; generated stylesheets are now anchored to the wrapper base class so configured styles override defaults
- checkbox size error message naming the radio property; README FormComponents import example pointing at vUX-formValidator.js
- AutoWriter '~n~' delay directive throwing and halting typing under the default configuration (it dereferenced a caret node that only exists when showCursor is on)
- AutoWriter freezing and then crashing the tab on an unterminated '~' or '*' directive (unbounded scanners); directives are now validated when writeText() is called, not when they are reached
- AutoWriter instances unusable twice — a second writeText() ignored its arguments, wrote the literal string "undefined" and retyped the previous string into the previous element
- AutoWriter collection mode unreachable — writeText() validated argument 1 as an element before consulting the type test, so every NodeList was rejected and the whole "multiple" path had never run
- AutoWriter deleteText() erasing n+1 units, accepting a non-integer count and then erasing for ever, and (on a cursor-enabled target) removing the caret instead of the text
- AutoWriter erasing by popping innerHTML characters, which shredded tags a byte at a time; typing and erasing now work on DOM nodes
- AutoWriter inline '*n*' racing its own erasing, a trailing directive writing the literal string "undefined", and '~n~' miscounting a delay written with leading zeros
- AutoWriter partial config.cursorStyle blanking the members it did not name; callback-less runs relying on setTimeout(null); blink and erase timers leaking on teardown
- Resizer resizing nothing at all — a mousedown on a handle threw before any state was set (two misspelled variable names), so the component never responded to a drag
- Resizer sizing the element to the pointer's distance from the viewport edge rather than to how far the pointer had travelled: the element snapped to the cursor on the first move, ignored where inside the handle it was grabbed, and was skewed by its own position on the page
- Resizer handles on the left or top edge shrinking the element when dragged outward; both axes now grow in the direction the handle faces
- Resizer config.callBack throwing on assignment, and breaking every drag even when left unset (the callback variable was never declared)
- Resizer config.myResizeHandler being validated and stored but never used — a consumer-supplied handle now actually drives the resize, and needs no vUX marker classes when direction is 'x' or 'y'
- Resizer handles having no size, position or cursor — assets/css/resizer.css is now loaded by the module instead of never being linked
- Resizer x and y handle styles overwriting one another, an empty y style blanking a configured x style, and resizeHandlerProperties.styles.both being accepted but ignored
- Resizer clearing the drag highlight from the first handle in the document rather than the one being dragged, and tracking it with toggle() so it drifted out of step over successive drags
- Resizer silently ignoring unknown or miscased resizeHandlerProperties keys, never enforcing its key-count limit, throwing a bare TypeError on an empty object, and naming 'position' in every error raised while validating 'styles'
- Resizer reporting a missing target selector only later as an internal TypeError, and appending duplicate handles, listeners and stylesheets when initialize() was called twice
- Resizer leaving a dead <style> element behind on every rebuild when a handle style is configured through config.resizeHandlerProperties.styles
- Carousel crashing with "TouchHandler is not defined" on its default path; touch support is enabled by default, so initialize() failed on any page that did not explicitly turn it off
- FormValidator crashing with "Cannot read properties of null" in initialize() under the default configuration, because the progress loader was centred before being inserted into the page
- ModalDisplayer's shared Escape, away-click, resize and transition handlers staying bound to the document after every displayer on the page had been torn down
- Carousel's autoplay interval continuing to run after the carousel was removed from the page
- ProgressIndicator's crawl interval continuing to write to a progress bar that had been removed
- DataView.destroy() leaving the view marked as initialized, so re-initializing a destroyed view silently did nothing instead of reporting that it had been destroyed
- Carousel dots having no height, so they were invisible and unclickable by default — assets/css/carousel.css is now loaded by the module instead of never being linked
- Carousel autoplay jumping back after a dot click or a swipe while marking a different slide active, so the slide on screen, the active slide and the active dot drifted apart
- Carousel dot clicks on one carousel moving the active dot of another carousel on the same page
- Carousel finding no slides, and building no dots, when its viewport had no id attribute
- Carousel swipe and drag throwing on every gesture, because TouchHandler moved an undefined `viewport` instead of the frame's viewport
- Carousel swipes being taken over by page scrolling on phones, and the grab cursor never showing — TouchHandler now links assets/css/touchHandler.css, which also sets touch-action on the swipe area
- Carousel autoplay stopping for good when config.speed was 0, or when the carousel was hidden partway through a slide
- Carousel pressing or hovering over a slide in motion marking it finished early, which let autoplay start the next slide from the wrong place
- Carousel config.buttonStyle applying only to the first carousel on a page, and being overridden by the default dot colours
- Carousel config.buttonStyle errors reading " of strings" or " of either 1 or 2 element(s)" without naming the property, and an empty array being accepted
- Carousel replacing the container's own onclick, onmouseenter and onmouseleave handlers
- Carousel start() before initialize() throwing on every autoplay tick; it now reports the misuse once
- TimeLineList autoBuild() throwing a SyntaxError, and the resize handler throwing on every resize, whenever config.dataAttributes had no smallView entry
- TimeLineList markers, labels and the label column never appearing: assets/css/timeLineList.css is now loaded by the module instead of never being linked
- TimeLineList labels drawn off the left edge of the page; the default stylesheet now gives the list room for its 100px label column, and drops that margin in the stacked layout
- TimeLineList lists picking up another list's styles: two instances on a page both used vtl0, vtl1…, and a list built by refresh() reused the class of the first list built
- TimeLineList lists added through refresh() getting no styles of their own, and not stacking at narrow widths until the window was next resized
- TimeLineList writing "{null}" rules for every list missing an attribute, and for attributes that were never configured
- TimeLineList resize handling re-evaluating every timeline on the page, including lists built by other instances
- TimeLineList refresh() building lists before autoBuild() had run, or after destroy(), without the resize listener and leaving them out of teardown; it now reports the misuse
- TimeLineList config.dataAttributes accepting non-string attribute names, half-applying an assignment that failed partway, and reporting "more than 4 entries" for a limit of 5
- TimeLineList config.className accepting a value with a leading dot or spaces, which later failed as an invalid selector inside refresh()
- TimeLineList error messages misspelling "incomplete", "supplied" and "supported"
- ListScroller moving less than a full step, or not at all, after reaching the end of the row or after two quick presses; every press now starts from the real scroll position and two presses always move two steps
- ListScroller rows extending into empty space past the last item; the list is now as wide as its items instead of item count × scrollSize
- ListScroller containers collapsing to zero height unless the consumer gave them one; the list now sits in normal flow
- ListScroller button state going stale when the container was resized on its own, when items were added, or when its stylesheet arrived after onScroller()
- ListScroller ignoring clicks on an icon or other element inside a button
- ListScroller re-enabling the buttons after offScroller() whenever the row was scrolled by touch or trackpad
- ListScroller offScroller() throwing when config.hasButtons was false
- ListScroller replacing the container's whole inline style with wrapperStyle, and its stylesheet forcing the container to width 100% so a wrapperStyle width had no effect
- ListScroller destroy() leaving the scroll classes on the container, wrapperStyle in place, and its classes and cursor on the buttons
- ListScroller accepting a list outside its container, the same button twice, a scrollSize of 0, negative or NaN, a negative scrollSpeed and an inactive class name with spaces, each of which failed later instead of at the assignment
- ListScroller config.scrollSpeed's error saying it "must be an array"
- FormComponents datePicker destroy() now also tears down its decade-series scroller
- FormComponents datePicker decade arrows dead on every picker but the first one opened when several pickers with long date ranges share one builder; picking a decade or going Back on a later picker also parked or re-armed the first picker's arrows instead of its own
- Component sync() without config.onMount now returns the instances it mounted, and instances() and destroyAll() reach rows it mounted; before, sync() returned undefined for each new row and destroyAll() left those rows in the page

## Removed
- colorOverlayStyle in modalDisplayerObj
- config.smallView property, to be set using attributes for individual elements, leading to the addition of config/smallViewAttribute property for setting the attribute to be used
- loadProgressIndicator Removed, as IO.dowload() send download status, to be used by user for their needs
- imageManipulator module removed, now handled by $$.sm.filter()
- validator.config.progressIndicatorStyle
- DOMDrawer module (vUX-domDrawer.js and assets/css/domDrawer.css) — replaced by SketchPad, whose rect tool with `config.tools = ["select", "rect"]`, `config.maxElements = 1` and `config.bounded` does what DOMDrawer did, plus move, resize, delete, undo and touch input

## Changed
- DataView is now built on the shared template-instancing engine (src/componentEngine.js) that backs the Component module; its API, behaviour and error messages are unchanged
- DataView.updateRow() now writes a merged copy back into the model rather than mutating the row object in place, so an array held from getData() is no longer changed underneath you
- AutoWriter '|' now inserts a real <br> element, erasable as a single unit, instead of a parsed "<br/>" string
- AutoWriter deleteText() now erases from the '.vAutoWriter' span when the target holds one, so the same element can be given to writeText() and deleteText()
- All four example pages redesigned onto the shared system; the SPA dev server additionally maps /shared/ to examples/shared/
- SPA example now states what to run when it is served without its dev server, instead of rendering as a blank unstyled page; its stylesheet resolves under both a repository-root server and its own
- SPA example route content aligning with the rest of the page (injected fragments bypassed the page's width constraint), and its table header pinning to the top of its own scroll box
- Modal scroll lock mechanism from position:fixed to body overflow:hidden — the page keeps its layout and scroll position; user scrolling is blocked but programmatic scrollTo() is not
- modalDisplayerObj overlayType property changed to overlayBackgroundType
- Size of custom element changed to using specified attribute value
- modalDisplayer workflow changed
- formValidator wrapperDataAtrribute property changed to wrapperClassAtrribute
- formValidator format.fullName() changed to format.wordSeperator(), and accepts arguments 2 and 3, 2 for specifying the seperator and 3 for specifying the number of times to repeat the seperator
- formValidator format.toCurrency() changed to format.currencyField()
- ToBaseGridMultiple changed to vRhythm (vertical Rhythm)
- GridBorderRectangle() constructor changed to CShapes() => Canvas Shapes
- CircularProgress() changed to arc()
- ResourceIO module changed to IO
- Carousel dot buttons no longer carry id="b1", id="b2"…, which duplicated across carousels and could collide with page ids; select them by .vButton[data-ratio] within the container
- TimeLineList per-list classes are now vtl<instance>-<n> instead of vtl<n>, and each instance's generated stylesheet has data-id "v<className>-<instance>" instead of "v<className>"
- TimeLineList autoBuild() called again now builds lists added since the first call, the same as refresh(), instead of doing nothing
- ListScroller no longer adds a window resize listener or a delegated document click listener; it listens on its own buttons and container and uses a ResizeObserver
- ListScroller sets the list's width to max-content and its paddings inline, instead of an item-count width and a left offset; listScroller.css no longer positions the list absolutely or forces the container's width
- ListScroller button scrolls take config.scrollSpeed's default of 290ms instead of a fixed 200ms
- ListScroller marks both buttons inactive at initialize(), until onScroller() arms them

## Optimised
- Optimized $$.cssStyle() static method functionality


## v3.0.0
### Fixed
- validator module bugs
- date picker bug (setting future date)
- multiple style sheet creation for modules depending on style sheets
- Modal overflow smooth scroll
- date picker bug (wrong format of date in date only mode)
- Multiple select field with one custom builder instance bug
- carousel dependent id name (no more ID dependent)
- Tool tip arrow color and box style not updating

### Added
- Away clicked to exit modal, in modal displayer module
- Animator module, for non CSS and CSS animation 
- Event handler attacher module, with support for appended elements
- content Loader module
- hasParent module
- reset functionality to date picker module
- Auto positioning of potential custom select element parent
- Option to change font color and background color of datePicker label and day tool tip
- TouchHandler module
- getParent Module
- Added spaceError property to listScroller

### Removed
- set() method from toolTip module, only on() and off() methods used

### Optimised
- ToolTip  module


### Changed
- DatePicker module now in customFormComponent namespace
- All constructor functions renamed to standard convention

## v2.0.0
### Optimised
- Protected all unprotected properties
- Optimized codes

### Added
- screen break points checker
- browser Resize Property handler
- DOM Element properties getter
- Custom form component builder
  - Select input
  - Radio input
  - checkBox input
- Form validator
- Modal display
- window vertical scroll Handler
- Date picker
- Tool tip creator
- IterationCount option to 	animatedRectangle module
- Callback option to animatedRectangle module
- Horizontal and vertical element centralizer
- Carousel

### Changed
- Changed method call, from: 	Object.fixedRectangle.draw(CanvasObject, canvasElement) to Object.fixedRectangle.draw(canvasElement)
- Placed all configurable properties of module under the namespace 'config' and Changed all 'options' object to 'config' object
- Changed Obj.animatedRectangle.stop property to Obj.animatedRectangle.stop() method;
- Changed imageManipulator() constructor argument 1 from canvas Object to canvas element
- Changed method call, from: 	Object.loadProgressIndicator(canvasElement, canvasObj) to Object.progressIndicator(canvasElement)
- Changed progressIndicator.circularProgress.config.progressLabel property from string to boolean property
- Changed resourceLoader() module to resourceIO

### Removed
- Remove imageManipulatorOBJ.dimension property. No more need to specify dimension

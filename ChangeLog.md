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

## Removed
- colorOverlayStyle in modalDisplayerObj
- config.smallView property, to be set using attributes for individual elements, leading to the addition of config/smallViewAttribute property for setting the attribute to be used
- loadProgressIndicator Removed, as IO.dowload() send download status, to be used by user for their needs
- imageManipulator module removed, now handled by $$.sm.filter()
- validator.config.progressIndicatorStyle

## Changed
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

"use strict";
(self["webpackChunkkimai"] = self["webpackChunkkimai"] || []).push([["dashboard"],{

/***/ "./assets/dashboard.js":
/*!*****************************!*\
  !*** ./assets/dashboard.js ***!
  \*****************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var gridstack__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! gridstack */ "./node_modules/gridstack/dist/gridstack.js");
/* harmony import */ var gridstack__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(gridstack__WEBPACK_IMPORTED_MODULE_0__);
/**
 * https://gridstackjs.com
 * https://github.com/gridstack/gridstack.js/tree/master/doc
 */
__webpack_require__(/*! gridstack/dist/gridstack.min.css */ "./node_modules/gridstack/dist/gridstack.min.css");
__webpack_require__(/*! gridstack/dist/gridstack-extra.min.css */ "./node_modules/gridstack/dist/gridstack-extra.min.css");

__webpack_require__.g.GridStack = gridstack__WEBPACK_IMPORTED_MODULE_0__.GridStack;

/***/ }),

/***/ "./node_modules/gridstack/dist/dd-base-impl.js":
/*!*****************************************************!*\
  !*** ./node_modules/gridstack/dist/dd-base-impl.js ***!
  \*****************************************************/
/***/ (function(__unused_webpack_module, exports) {


/**
 * dd-base-impl.ts 7.3.0
 * Copyright (c) 2021-2022 Alain Dumesny - see GridStack root license
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DDBaseImplement = void 0;
class DDBaseImplement {
    constructor() {
        /** @internal */
        this._eventRegister = {};
    }
    /** returns the enable state, but you have to call enable()/disable() to change (as other things need to happen) */
    get disabled() { return this._disabled; }
    on(event, callback) {
        this._eventRegister[event] = callback;
    }
    off(event) {
        delete this._eventRegister[event];
    }
    enable() {
        this._disabled = false;
    }
    disable() {
        this._disabled = true;
    }
    destroy() {
        delete this._eventRegister;
    }
    triggerEvent(eventName, event) {
        if (!this.disabled && this._eventRegister && this._eventRegister[eventName])
            return this._eventRegister[eventName](event);
    }
}
exports.DDBaseImplement = DDBaseImplement;
//# sourceMappingURL=dd-base-impl.js.map

/***/ }),

/***/ "./node_modules/gridstack/dist/dd-draggable.js":
/*!*****************************************************!*\
  !*** ./node_modules/gridstack/dist/dd-draggable.js ***!
  \*****************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


/**
 * dd-draggable.ts 7.3.0
 * Copyright (c) 2021-2022 Alain Dumesny - see GridStack root license
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DDDraggable = void 0;
const dd_manager_1 = __webpack_require__(/*! ./dd-manager */ "./node_modules/gridstack/dist/dd-manager.js");
const utils_1 = __webpack_require__(/*! ./utils */ "./node_modules/gridstack/dist/utils.js");
const dd_base_impl_1 = __webpack_require__(/*! ./dd-base-impl */ "./node_modules/gridstack/dist/dd-base-impl.js");
const dd_touch_1 = __webpack_require__(/*! ./dd-touch */ "./node_modules/gridstack/dist/dd-touch.js");
// let count = 0; // TEST
class DDDraggable extends dd_base_impl_1.DDBaseImplement {
    constructor(el, option = {}) {
        super();
        this.el = el;
        this.option = option;
        // get the element that is actually supposed to be dragged by
        let handleName = option.handle.substring(1);
        this.dragEl = el.classList.contains(handleName) ? el : el.querySelector(option.handle) || el;
        // create var event binding so we can easily remove and still look like TS methods (unlike anonymous functions)
        this._mouseDown = this._mouseDown.bind(this);
        this._mouseMove = this._mouseMove.bind(this);
        this._mouseUp = this._mouseUp.bind(this);
        this.enable();
    }
    on(event, callback) {
        super.on(event, callback);
    }
    off(event) {
        super.off(event);
    }
    enable() {
        if (this.disabled === false)
            return;
        super.enable();
        this.dragEl.addEventListener('mousedown', this._mouseDown);
        if (dd_touch_1.isTouch) {
            this.dragEl.addEventListener('touchstart', dd_touch_1.touchstart);
            this.dragEl.addEventListener('pointerdown', dd_touch_1.pointerdown);
            // this.dragEl.style.touchAction = 'none'; // not needed unlike pointerdown doc comment
        }
        this.el.classList.remove('ui-draggable-disabled');
        this.el.classList.add('ui-draggable');
    }
    disable(forDestroy = false) {
        if (this.disabled === true)
            return;
        super.disable();
        this.dragEl.removeEventListener('mousedown', this._mouseDown);
        if (dd_touch_1.isTouch) {
            this.dragEl.removeEventListener('touchstart', dd_touch_1.touchstart);
            this.dragEl.removeEventListener('pointerdown', dd_touch_1.pointerdown);
        }
        this.el.classList.remove('ui-draggable');
        if (!forDestroy)
            this.el.classList.add('ui-draggable-disabled');
    }
    destroy() {
        if (this.dragTimeout)
            window.clearTimeout(this.dragTimeout);
        delete this.dragTimeout;
        if (this.dragging)
            this._mouseUp(this.mouseDownEvent);
        this.disable(true);
        delete this.el;
        delete this.helper;
        delete this.option;
        super.destroy();
    }
    updateOption(opts) {
        Object.keys(opts).forEach(key => this.option[key] = opts[key]);
        return this;
    }
    /** @internal call when mouse goes down before a dragstart happens */
    _mouseDown(e) {
        // don't let more than one widget handle mouseStart
        if (dd_manager_1.DDManager.mouseHandled)
            return;
        if (e.button !== 0)
            return true; // only left click
        // make sure we are not clicking on known object that handles mouseDown (TODO: make this extensible ?) #2054
        const skipMouseDown = ['input', 'textarea', 'button', 'select', 'option'];
        const name = e.target.nodeName.toLowerCase();
        if (skipMouseDown.find(skip => skip === name))
            return true;
        // also check for content editable
        if (e.target.closest('[contenteditable="true"]'))
            return true;
        // REMOVE: why would we get the event if it wasn't for us or child ?
        // make sure we are clicking on a drag handle or child of it...
        // Note: we don't need to check that's handle is an immediate child, as mouseHandled will prevent parents from also handling it (lowest wins)
        // let className = this.option.handle.substring(1);
        // let el = e.target as HTMLElement;
        // while (el && !el.classList.contains(className)) { el = el.parentElement; }
        // if (!el) return;
        this.mouseDownEvent = e;
        delete this.dragging;
        delete dd_manager_1.DDManager.dragElement;
        delete dd_manager_1.DDManager.dropElement;
        // document handler so we can continue receiving moves as the item is 'fixed' position, and capture=true so WE get a first crack
        document.addEventListener('mousemove', this._mouseMove, true); // true=capture, not bubble
        document.addEventListener('mouseup', this._mouseUp, true);
        if (dd_touch_1.isTouch) {
            this.dragEl.addEventListener('touchmove', dd_touch_1.touchmove);
            this.dragEl.addEventListener('touchend', dd_touch_1.touchend);
        }
        e.preventDefault();
        // preventDefault() prevents blur event which occurs just after mousedown event.
        // if an editable content has focus, then blur must be call
        if (document.activeElement)
            document.activeElement.blur();
        dd_manager_1.DDManager.mouseHandled = true;
        return true;
    }
    /** @internal method to call actual drag event */
    _callDrag(e) {
        if (!this.dragging)
            return;
        const ev = utils_1.Utils.initEvent(e, { target: this.el, type: 'drag' });
        if (this.option.drag) {
            this.option.drag(ev, this.ui());
        }
        this.triggerEvent('drag', ev);
    }
    /** @internal called when the main page (after successful mousedown) receives a move event to drag the item around the screen */
    _mouseMove(e) {
        var _a;
        // console.log(`${count++} move ${e.x},${e.y}`)
        let s = this.mouseDownEvent;
        if (this.dragging) {
            this._dragFollow(e);
            // delay actual grid handling drag until we pause for a while if set
            if (dd_manager_1.DDManager.pauseDrag) {
                const pause = Number.isInteger(dd_manager_1.DDManager.pauseDrag) ? dd_manager_1.DDManager.pauseDrag : 100;
                if (this.dragTimeout)
                    window.clearTimeout(this.dragTimeout);
                this.dragTimeout = window.setTimeout(() => this._callDrag(e), pause);
            }
            else {
                this._callDrag(e);
            }
        }
        else if (Math.abs(e.x - s.x) + Math.abs(e.y - s.y) > 3) {
            /**
             * don't start unless we've moved at least 3 pixels
             */
            this.dragging = true;
            dd_manager_1.DDManager.dragElement = this;
            // if we're dragging an actual grid item, set the current drop as the grid (to detect enter/leave)
            let grid = (_a = this.el.gridstackNode) === null || _a === void 0 ? void 0 : _a.grid;
            if (grid) {
                dd_manager_1.DDManager.dropElement = grid.el.ddElement.ddDroppable;
            }
            else {
                delete dd_manager_1.DDManager.dropElement;
            }
            this.helper = this._createHelper(e);
            this._setupHelperContainmentStyle();
            this.dragOffset = this._getDragOffset(e, this.el, this.helperContainment);
            const ev = utils_1.Utils.initEvent(e, { target: this.el, type: 'dragstart' });
            this._setupHelperStyle(e);
            if (this.option.start) {
                this.option.start(ev, this.ui());
            }
            this.triggerEvent('dragstart', ev);
        }
        e.preventDefault(); // needed otherwise we get text sweep text selection as we drag around
        return true;
    }
    /** @internal call when the mouse gets released to drop the item at current location */
    _mouseUp(e) {
        var _a;
        document.removeEventListener('mousemove', this._mouseMove, true);
        document.removeEventListener('mouseup', this._mouseUp, true);
        if (dd_touch_1.isTouch) {
            this.dragEl.removeEventListener('touchmove', dd_touch_1.touchmove, true);
            this.dragEl.removeEventListener('touchend', dd_touch_1.touchend, true);
        }
        if (this.dragging) {
            delete this.dragging;
            // reset the drop target if dragging over ourself (already parented, just moving during stop callback below)
            if (((_a = dd_manager_1.DDManager.dropElement) === null || _a === void 0 ? void 0 : _a.el) === this.el.parentElement) {
                delete dd_manager_1.DDManager.dropElement;
            }
            this.helperContainment.style.position = this.parentOriginStylePosition || null;
            if (this.helper === this.el) {
                this._removeHelperStyle();
            }
            else {
                this.helper.remove();
            }
            const ev = utils_1.Utils.initEvent(e, { target: this.el, type: 'dragstop' });
            if (this.option.stop) {
                this.option.stop(ev); // NOTE: destroy() will be called when removing item, so expect NULL ptr after!
            }
            this.triggerEvent('dragstop', ev);
            // call the droppable method to receive the item
            if (dd_manager_1.DDManager.dropElement) {
                dd_manager_1.DDManager.dropElement.drop(e);
            }
        }
        delete this.helper;
        delete this.mouseDownEvent;
        delete dd_manager_1.DDManager.dragElement;
        delete dd_manager_1.DDManager.dropElement;
        delete dd_manager_1.DDManager.mouseHandled;
        e.preventDefault();
    }
    /** @internal create a clone copy (or user defined method) of the original drag item if set */
    _createHelper(event) {
        let helper = this.el;
        if (typeof this.option.helper === 'function') {
            helper = this.option.helper(event);
        }
        else if (this.option.helper === 'clone') {
            helper = utils_1.Utils.cloneNode(this.el);
        }
        if (!document.body.contains(helper)) {
            utils_1.Utils.appendTo(helper, this.option.appendTo === 'parent' ? this.el.parentNode : this.option.appendTo);
        }
        if (helper === this.el) {
            this.dragElementOriginStyle = DDDraggable.originStyleProp.map(prop => this.el.style[prop]);
        }
        return helper;
    }
    /** @internal set the fix position of the dragged item */
    _setupHelperStyle(e) {
        this.helper.classList.add('ui-draggable-dragging');
        // TODO: set all at once with style.cssText += ... ? https://stackoverflow.com/questions/3968593
        const style = this.helper.style;
        style.pointerEvents = 'none'; // needed for over items to get enter/leave
        // style.cursor = 'move'; //  TODO: can't set with pointerEvents=none ! (done in CSS as well)
        style['min-width'] = 0; // since we no longer relative to our parent and we don't resize anyway (normally 100/#column %)
        style.width = this.dragOffset.width + 'px';
        style.height = this.dragOffset.height + 'px';
        style.willChange = 'left, top';
        style.position = 'fixed'; // let us drag between grids by not clipping as parent .grid-stack is position: 'relative'
        this._dragFollow(e); // now position it
        style.transition = 'none'; // show up instantly
        setTimeout(() => {
            if (this.helper) {
                style.transition = null; // recover animation
            }
        }, 0);
        return this;
    }
    /** @internal restore back the original style before dragging */
    _removeHelperStyle() {
        var _a;
        this.helper.classList.remove('ui-draggable-dragging');
        let node = (_a = this.helper) === null || _a === void 0 ? void 0 : _a.gridstackNode;
        // don't bother restoring styles if we're gonna remove anyway...
        if (!(node === null || node === void 0 ? void 0 : node._isAboutToRemove) && this.dragElementOriginStyle) {
            let helper = this.helper;
            // don't animate, otherwise we animate offseted when switching back to 'absolute' from 'fixed'.
            // TODO: this also removes resizing animation which doesn't have this issue, but others.
            // Ideally both would animate ('move' would immediately restore 'absolute' and adjust coordinate to match,
            // then trigger a delay (repaint) to restore to final dest with animate) but then we need to make sure 'resizestop'
            // is called AFTER 'transitionend' event is received (see https://github.com/gridstack/gridstack.js/issues/2033)
            let transition = this.dragElementOriginStyle['transition'] || null;
            helper.style.transition = this.dragElementOriginStyle['transition'] = 'none'; // can't be NULL #1973
            DDDraggable.originStyleProp.forEach(prop => helper.style[prop] = this.dragElementOriginStyle[prop] || null);
            setTimeout(() => helper.style.transition = transition, 50); // recover animation from saved vars after a pause (0 isn't enough #1973)
        }
        delete this.dragElementOriginStyle;
        return this;
    }
    /** @internal updates the top/left position to follow the mouse */
    _dragFollow(e) {
        let containmentRect = { left: 0, top: 0 };
        // if (this.helper.style.position === 'absolute') { // we use 'fixed'
        //   const { left, top } = this.helperContainment.getBoundingClientRect();
        //   containmentRect = { left, top };
        // }
        const style = this.helper.style;
        const offset = this.dragOffset;
        style.left = e.clientX + offset.offsetLeft - containmentRect.left + 'px';
        style.top = e.clientY + offset.offsetTop - containmentRect.top + 'px';
    }
    /** @internal */
    _setupHelperContainmentStyle() {
        this.helperContainment = this.helper.parentElement;
        if (this.helper.style.position !== 'fixed') {
            this.parentOriginStylePosition = this.helperContainment.style.position;
            if (window.getComputedStyle(this.helperContainment).position.match(/static/)) {
                this.helperContainment.style.position = 'relative';
            }
        }
        return this;
    }
    /** @internal */
    _getDragOffset(event, el, parent) {
        // in case ancestor has transform/perspective css properties that change the viewpoint
        let xformOffsetX = 0;
        let xformOffsetY = 0;
        if (parent) {
            const testEl = document.createElement('div');
            utils_1.Utils.addElStyles(testEl, {
                opacity: '0',
                position: 'fixed',
                top: 0 + 'px',
                left: 0 + 'px',
                width: '1px',
                height: '1px',
                zIndex: '-999999',
            });
            parent.appendChild(testEl);
            const testElPosition = testEl.getBoundingClientRect();
            parent.removeChild(testEl);
            xformOffsetX = testElPosition.left;
            xformOffsetY = testElPosition.top;
            // TODO: scale ?
        }
        const targetOffset = el.getBoundingClientRect();
        return {
            left: targetOffset.left,
            top: targetOffset.top,
            offsetLeft: -event.clientX + targetOffset.left - xformOffsetX,
            offsetTop: -event.clientY + targetOffset.top - xformOffsetY,
            width: targetOffset.width,
            height: targetOffset.height
        };
    }
    /** @internal TODO: set to public as called by DDDroppable! */
    ui() {
        const containmentEl = this.el.parentElement;
        const containmentRect = containmentEl.getBoundingClientRect();
        const offset = this.helper.getBoundingClientRect();
        return {
            position: {
                top: offset.top - containmentRect.top,
                left: offset.left - containmentRect.left
            }
            /* not used by GridStack for now...
            helper: [this.helper], //The object arr representing the helper that's being dragged.
            offset: { top: offset.top, left: offset.left } // Current offset position of the helper as { top, left } object.
            */
        };
    }
}
exports.DDDraggable = DDDraggable;
/** @internal properties we change during dragging, and restore back */
DDDraggable.originStyleProp = ['transition', 'pointerEvents', 'position', 'left', 'top', 'minWidth', 'willChange'];
//# sourceMappingURL=dd-draggable.js.map

/***/ }),

/***/ "./node_modules/gridstack/dist/dd-droppable.js":
/*!*****************************************************!*\
  !*** ./node_modules/gridstack/dist/dd-droppable.js ***!
  \*****************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


/**
 * dd-droppable.ts 7.3.0
 * Copyright (c) 2021-2022 Alain Dumesny - see GridStack root license
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DDDroppable = void 0;
const dd_manager_1 = __webpack_require__(/*! ./dd-manager */ "./node_modules/gridstack/dist/dd-manager.js");
const dd_base_impl_1 = __webpack_require__(/*! ./dd-base-impl */ "./node_modules/gridstack/dist/dd-base-impl.js");
const utils_1 = __webpack_require__(/*! ./utils */ "./node_modules/gridstack/dist/utils.js");
const dd_touch_1 = __webpack_require__(/*! ./dd-touch */ "./node_modules/gridstack/dist/dd-touch.js");
// let count = 0; // TEST
class DDDroppable extends dd_base_impl_1.DDBaseImplement {
    constructor(el, opts = {}) {
        super();
        this.el = el;
        this.option = opts;
        // create var event binding so we can easily remove and still look like TS methods (unlike anonymous functions)
        this._mouseEnter = this._mouseEnter.bind(this);
        this._mouseLeave = this._mouseLeave.bind(this);
        this.enable();
        this._setupAccept();
    }
    on(event, callback) {
        super.on(event, callback);
    }
    off(event) {
        super.off(event);
    }
    enable() {
        if (this.disabled === false)
            return;
        super.enable();
        this.el.classList.add('ui-droppable');
        this.el.classList.remove('ui-droppable-disabled');
        this.el.addEventListener('mouseenter', this._mouseEnter);
        this.el.addEventListener('mouseleave', this._mouseLeave);
        if (dd_touch_1.isTouch) {
            this.el.addEventListener('pointerenter', dd_touch_1.pointerenter);
            this.el.addEventListener('pointerleave', dd_touch_1.pointerleave);
        }
    }
    disable(forDestroy = false) {
        if (this.disabled === true)
            return;
        super.disable();
        this.el.classList.remove('ui-droppable');
        if (!forDestroy)
            this.el.classList.add('ui-droppable-disabled');
        this.el.removeEventListener('mouseenter', this._mouseEnter);
        this.el.removeEventListener('mouseleave', this._mouseLeave);
        if (dd_touch_1.isTouch) {
            this.el.removeEventListener('pointerenter', dd_touch_1.pointerenter);
            this.el.removeEventListener('pointerleave', dd_touch_1.pointerleave);
        }
    }
    destroy() {
        this.disable(true);
        this.el.classList.remove('ui-droppable');
        this.el.classList.remove('ui-droppable-disabled');
        super.destroy();
    }
    updateOption(opts) {
        Object.keys(opts).forEach(key => this.option[key] = opts[key]);
        this._setupAccept();
        return this;
    }
    /** @internal called when the cursor enters our area - prepare for a possible drop and track leaving */
    _mouseEnter(e) {
        // console.log(`${count++} Enter ${this.el.id || (this.el as GridHTMLElement).gridstack.opts.id}`); // TEST
        if (!dd_manager_1.DDManager.dragElement)
            return;
        if (!this._canDrop(dd_manager_1.DDManager.dragElement.el))
            return;
        e.preventDefault();
        e.stopPropagation();
        // make sure when we enter this, that the last one gets a leave FIRST to correctly cleanup as we don't always do
        if (dd_manager_1.DDManager.dropElement && dd_manager_1.DDManager.dropElement !== this) {
            dd_manager_1.DDManager.dropElement._mouseLeave(e);
        }
        dd_manager_1.DDManager.dropElement = this;
        const ev = utils_1.Utils.initEvent(e, { target: this.el, type: 'dropover' });
        if (this.option.over) {
            this.option.over(ev, this._ui(dd_manager_1.DDManager.dragElement));
        }
        this.triggerEvent('dropover', ev);
        this.el.classList.add('ui-droppable-over');
        // console.log('tracking'); // TEST
    }
    /** @internal called when the item is leaving our area, stop tracking if we had moving item */
    _mouseLeave(e) {
        var _a;
        // console.log(`${count++} Leave ${this.el.id || (this.el as GridHTMLElement).gridstack.opts.id}`); // TEST
        if (!dd_manager_1.DDManager.dragElement || dd_manager_1.DDManager.dropElement !== this)
            return;
        e.preventDefault();
        e.stopPropagation();
        const ev = utils_1.Utils.initEvent(e, { target: this.el, type: 'dropout' });
        if (this.option.out) {
            this.option.out(ev, this._ui(dd_manager_1.DDManager.dragElement));
        }
        this.triggerEvent('dropout', ev);
        if (dd_manager_1.DDManager.dropElement === this) {
            delete dd_manager_1.DDManager.dropElement;
            // console.log('not tracking'); // TEST
            // if we're still over a parent droppable, send it an enter as we don't get one from leaving nested children
            let parentDrop;
            let parent = this.el.parentElement;
            while (!parentDrop && parent) {
                parentDrop = (_a = parent.ddElement) === null || _a === void 0 ? void 0 : _a.ddDroppable;
                parent = parent.parentElement;
            }
            if (parentDrop) {
                parentDrop._mouseEnter(e);
            }
        }
    }
    /** item is being dropped on us - called by the drag mouseup handler - this calls the client drop event */
    drop(e) {
        e.preventDefault();
        const ev = utils_1.Utils.initEvent(e, { target: this.el, type: 'drop' });
        if (this.option.drop) {
            this.option.drop(ev, this._ui(dd_manager_1.DDManager.dragElement));
        }
        this.triggerEvent('drop', ev);
    }
    /** @internal true if element matches the string/method accept option */
    _canDrop(el) {
        return el && (!this.accept || this.accept(el));
    }
    /** @internal */
    _setupAccept() {
        if (!this.option.accept)
            return this;
        if (typeof this.option.accept === 'string') {
            this.accept = (el) => el.matches(this.option.accept);
        }
        else {
            this.accept = this.option.accept;
        }
        return this;
    }
    /** @internal */
    _ui(drag) {
        return Object.assign({ draggable: drag.el }, drag.ui());
    }
}
exports.DDDroppable = DDDroppable;
//# sourceMappingURL=dd-droppable.js.map

/***/ }),

/***/ "./node_modules/gridstack/dist/dd-element.js":
/*!***************************************************!*\
  !*** ./node_modules/gridstack/dist/dd-element.js ***!
  \***************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


/**
 * dd-elements.ts 7.3.0
 * Copyright (c) 2021 Alain Dumesny - see GridStack root license
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DDElement = void 0;
const dd_resizable_1 = __webpack_require__(/*! ./dd-resizable */ "./node_modules/gridstack/dist/dd-resizable.js");
const dd_draggable_1 = __webpack_require__(/*! ./dd-draggable */ "./node_modules/gridstack/dist/dd-draggable.js");
const dd_droppable_1 = __webpack_require__(/*! ./dd-droppable */ "./node_modules/gridstack/dist/dd-droppable.js");
class DDElement {
    constructor(el) {
        this.el = el;
    }
    static init(el) {
        if (!el.ddElement) {
            el.ddElement = new DDElement(el);
        }
        return el.ddElement;
    }
    on(eventName, callback) {
        if (this.ddDraggable && ['drag', 'dragstart', 'dragstop'].indexOf(eventName) > -1) {
            this.ddDraggable.on(eventName, callback);
        }
        else if (this.ddDroppable && ['drop', 'dropover', 'dropout'].indexOf(eventName) > -1) {
            this.ddDroppable.on(eventName, callback);
        }
        else if (this.ddResizable && ['resizestart', 'resize', 'resizestop'].indexOf(eventName) > -1) {
            this.ddResizable.on(eventName, callback);
        }
        return this;
    }
    off(eventName) {
        if (this.ddDraggable && ['drag', 'dragstart', 'dragstop'].indexOf(eventName) > -1) {
            this.ddDraggable.off(eventName);
        }
        else if (this.ddDroppable && ['drop', 'dropover', 'dropout'].indexOf(eventName) > -1) {
            this.ddDroppable.off(eventName);
        }
        else if (this.ddResizable && ['resizestart', 'resize', 'resizestop'].indexOf(eventName) > -1) {
            this.ddResizable.off(eventName);
        }
        return this;
    }
    setupDraggable(opts) {
        if (!this.ddDraggable) {
            this.ddDraggable = new dd_draggable_1.DDDraggable(this.el, opts);
        }
        else {
            this.ddDraggable.updateOption(opts);
        }
        return this;
    }
    cleanDraggable() {
        if (this.ddDraggable) {
            this.ddDraggable.destroy();
            delete this.ddDraggable;
        }
        return this;
    }
    setupResizable(opts) {
        if (!this.ddResizable) {
            this.ddResizable = new dd_resizable_1.DDResizable(this.el, opts);
        }
        else {
            this.ddResizable.updateOption(opts);
        }
        return this;
    }
    cleanResizable() {
        if (this.ddResizable) {
            this.ddResizable.destroy();
            delete this.ddResizable;
        }
        return this;
    }
    setupDroppable(opts) {
        if (!this.ddDroppable) {
            this.ddDroppable = new dd_droppable_1.DDDroppable(this.el, opts);
        }
        else {
            this.ddDroppable.updateOption(opts);
        }
        return this;
    }
    cleanDroppable() {
        if (this.ddDroppable) {
            this.ddDroppable.destroy();
            delete this.ddDroppable;
        }
        return this;
    }
}
exports.DDElement = DDElement;
//# sourceMappingURL=dd-element.js.map

/***/ }),

/***/ "./node_modules/gridstack/dist/dd-gridstack.js":
/*!*****************************************************!*\
  !*** ./node_modules/gridstack/dist/dd-gridstack.js ***!
  \*****************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


/**
 * dd-gridstack.ts 7.3.0
 * Copyright (c) 2021 Alain Dumesny - see GridStack root license
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DDGridStack = void 0;
const utils_1 = __webpack_require__(/*! ./utils */ "./node_modules/gridstack/dist/utils.js");
const dd_manager_1 = __webpack_require__(/*! ./dd-manager */ "./node_modules/gridstack/dist/dd-manager.js");
const dd_element_1 = __webpack_require__(/*! ./dd-element */ "./node_modules/gridstack/dist/dd-element.js");
// let count = 0; // TEST
/**
 * HTML Native Mouse and Touch Events Drag and Drop functionality.
 */
class DDGridStack {
    resizable(el, opts, key, value) {
        this._getDDElements(el).forEach(dEl => {
            if (opts === 'disable' || opts === 'enable') {
                dEl.ddResizable && dEl.ddResizable[opts](); // can't create DD as it requires options for setupResizable()
            }
            else if (opts === 'destroy') {
                dEl.ddResizable && dEl.cleanResizable();
            }
            else if (opts === 'option') {
                dEl.setupResizable({ [key]: value });
            }
            else {
                const grid = dEl.el.gridstackNode.grid;
                let handles = dEl.el.getAttribute('gs-resize-handles') ? dEl.el.getAttribute('gs-resize-handles') : grid.opts.resizable.handles;
                let autoHide = !grid.opts.alwaysShowResizeHandle;
                dEl.setupResizable(Object.assign(Object.assign(Object.assign({}, grid.opts.resizable), { handles, autoHide }), {
                    start: opts.start,
                    stop: opts.stop,
                    resize: opts.resize
                }));
            }
        });
        return this;
    }
    draggable(el, opts, key, value) {
        this._getDDElements(el).forEach(dEl => {
            if (opts === 'disable' || opts === 'enable') {
                dEl.ddDraggable && dEl.ddDraggable[opts](); // can't create DD as it requires options for setupDraggable()
            }
            else if (opts === 'destroy') {
                dEl.ddDraggable && dEl.cleanDraggable();
            }
            else if (opts === 'option') {
                dEl.setupDraggable({ [key]: value });
            }
            else {
                const grid = dEl.el.gridstackNode.grid;
                dEl.setupDraggable(Object.assign(Object.assign({}, grid.opts.draggable), {
                    // containment: (grid.parentGridItem && !grid.opts.dragOut) ? grid.el.parentElement : (grid.opts.draggable.containment || null),
                    start: opts.start,
                    stop: opts.stop,
                    drag: opts.drag
                }));
            }
        });
        return this;
    }
    dragIn(el, opts) {
        this._getDDElements(el).forEach(dEl => dEl.setupDraggable(opts));
        return this;
    }
    droppable(el, opts, key, value) {
        if (typeof opts.accept === 'function' && !opts._accept) {
            opts._accept = opts.accept;
            opts.accept = (el) => opts._accept(el);
        }
        this._getDDElements(el).forEach(dEl => {
            if (opts === 'disable' || opts === 'enable') {
                dEl.ddDroppable && dEl.ddDroppable[opts]();
            }
            else if (opts === 'destroy') {
                if (dEl.ddDroppable) { // error to call destroy if not there
                    dEl.cleanDroppable();
                }
            }
            else if (opts === 'option') {
                dEl.setupDroppable({ [key]: value });
            }
            else {
                dEl.setupDroppable(opts);
            }
        });
        return this;
    }
    /** true if element is droppable */
    isDroppable(el) {
        return !!(el && el.ddElement && el.ddElement.ddDroppable && !el.ddElement.ddDroppable.disabled);
    }
    /** true if element is draggable */
    isDraggable(el) {
        return !!(el && el.ddElement && el.ddElement.ddDraggable && !el.ddElement.ddDraggable.disabled);
    }
    /** true if element is draggable */
    isResizable(el) {
        return !!(el && el.ddElement && el.ddElement.ddResizable && !el.ddElement.ddResizable.disabled);
    }
    on(el, name, callback) {
        this._getDDElements(el).forEach(dEl => dEl.on(name, (event) => {
            callback(event, dd_manager_1.DDManager.dragElement ? dd_manager_1.DDManager.dragElement.el : event.target, dd_manager_1.DDManager.dragElement ? dd_manager_1.DDManager.dragElement.helper : null);
        }));
        return this;
    }
    off(el, name) {
        this._getDDElements(el).forEach(dEl => dEl.off(name));
        return this;
    }
    /** @internal returns a list of DD elements, creating them on the fly by default */
    _getDDElements(els, create = true) {
        let hosts = utils_1.Utils.getElements(els);
        if (!hosts.length)
            return [];
        let list = hosts.map(e => e.ddElement || (create ? dd_element_1.DDElement.init(e) : null));
        if (!create) {
            list.filter(d => d);
        } // remove nulls
        return list;
    }
}
exports.DDGridStack = DDGridStack;
//# sourceMappingURL=dd-gridstack.js.map

/***/ }),

/***/ "./node_modules/gridstack/dist/dd-manager.js":
/*!***************************************************!*\
  !*** ./node_modules/gridstack/dist/dd-manager.js ***!
  \***************************************************/
/***/ (function(__unused_webpack_module, exports) {


/**
 * dd-manager.ts 7.3.0
 * Copyright (c) 2021 Alain Dumesny - see GridStack root license
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DDManager = void 0;
/**
 * globals that are shared across Drag & Drop instances
 */
class DDManager {
}
exports.DDManager = DDManager;
//# sourceMappingURL=dd-manager.js.map

/***/ }),

/***/ "./node_modules/gridstack/dist/dd-resizable-handle.js":
/*!************************************************************!*\
  !*** ./node_modules/gridstack/dist/dd-resizable-handle.js ***!
  \************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


/**
 * dd-resizable-handle.ts 7.3.0
 * Copyright (c) 2021-2022 Alain Dumesny - see GridStack root license
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DDResizableHandle = void 0;
const dd_touch_1 = __webpack_require__(/*! ./dd-touch */ "./node_modules/gridstack/dist/dd-touch.js");
class DDResizableHandle {
    constructor(host, direction, option) {
        /** @internal true after we've moved enough pixels to start a resize */
        this.moving = false;
        this.host = host;
        this.dir = direction;
        this.option = option;
        // create var event binding so we can easily remove and still look like TS methods (unlike anonymous functions)
        this._mouseDown = this._mouseDown.bind(this);
        this._mouseMove = this._mouseMove.bind(this);
        this._mouseUp = this._mouseUp.bind(this);
        this._init();
    }
    /** @internal */
    _init() {
        const el = document.createElement('div');
        el.classList.add('ui-resizable-handle');
        el.classList.add(`${DDResizableHandle.prefix}${this.dir}`);
        el.style.zIndex = '100';
        el.style.userSelect = 'none';
        this.el = el;
        this.host.appendChild(this.el);
        this.el.addEventListener('mousedown', this._mouseDown);
        if (dd_touch_1.isTouch) {
            this.el.addEventListener('touchstart', dd_touch_1.touchstart);
            this.el.addEventListener('pointerdown', dd_touch_1.pointerdown);
            // this.el.style.touchAction = 'none'; // not needed unlike pointerdown doc comment
        }
        return this;
    }
    /** call this when resize handle needs to be removed and cleaned up */
    destroy() {
        if (this.moving)
            this._mouseUp(this.mouseDownEvent);
        this.el.removeEventListener('mousedown', this._mouseDown);
        if (dd_touch_1.isTouch) {
            this.el.removeEventListener('touchstart', dd_touch_1.touchstart);
            this.el.removeEventListener('pointerdown', dd_touch_1.pointerdown);
        }
        this.host.removeChild(this.el);
        delete this.el;
        delete this.host;
        return this;
    }
    /** @internal called on mouse down on us: capture move on the entire document (mouse might not stay on us) until we release the mouse */
    _mouseDown(e) {
        this.mouseDownEvent = e;
        document.addEventListener('mousemove', this._mouseMove, true); // capture, not bubble
        document.addEventListener('mouseup', this._mouseUp, true);
        if (dd_touch_1.isTouch) {
            this.el.addEventListener('touchmove', dd_touch_1.touchmove);
            this.el.addEventListener('touchend', dd_touch_1.touchend);
        }
        e.stopPropagation();
        e.preventDefault();
    }
    /** @internal */
    _mouseMove(e) {
        let s = this.mouseDownEvent;
        if (this.moving) {
            this._triggerEvent('move', e);
        }
        else if (Math.abs(e.x - s.x) + Math.abs(e.y - s.y) > 2) {
            // don't start unless we've moved at least 3 pixels
            this.moving = true;
            this._triggerEvent('start', this.mouseDownEvent);
            this._triggerEvent('move', e);
        }
        e.stopPropagation();
        e.preventDefault();
    }
    /** @internal */
    _mouseUp(e) {
        if (this.moving) {
            this._triggerEvent('stop', e);
        }
        document.removeEventListener('mousemove', this._mouseMove, true);
        document.removeEventListener('mouseup', this._mouseUp, true);
        if (dd_touch_1.isTouch) {
            this.el.removeEventListener('touchmove', dd_touch_1.touchmove);
            this.el.removeEventListener('touchend', dd_touch_1.touchend);
        }
        delete this.moving;
        delete this.mouseDownEvent;
        e.stopPropagation();
        e.preventDefault();
    }
    /** @internal */
    _triggerEvent(name, event) {
        if (this.option[name])
            this.option[name](event);
        return this;
    }
}
exports.DDResizableHandle = DDResizableHandle;
/** @internal */
DDResizableHandle.prefix = 'ui-resizable-';
//# sourceMappingURL=dd-resizable-handle.js.map

/***/ }),

/***/ "./node_modules/gridstack/dist/dd-resizable.js":
/*!*****************************************************!*\
  !*** ./node_modules/gridstack/dist/dd-resizable.js ***!
  \*****************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


/**
 * dd-resizable.ts 7.3.0
 * Copyright (c) 2021-2022 Alain Dumesny - see GridStack root license
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DDResizable = void 0;
const dd_resizable_handle_1 = __webpack_require__(/*! ./dd-resizable-handle */ "./node_modules/gridstack/dist/dd-resizable-handle.js");
const dd_base_impl_1 = __webpack_require__(/*! ./dd-base-impl */ "./node_modules/gridstack/dist/dd-base-impl.js");
const utils_1 = __webpack_require__(/*! ./utils */ "./node_modules/gridstack/dist/utils.js");
const dd_manager_1 = __webpack_require__(/*! ./dd-manager */ "./node_modules/gridstack/dist/dd-manager.js");
class DDResizable extends dd_base_impl_1.DDBaseImplement {
    constructor(el, opts = {}) {
        super();
        /** @internal */
        this._ui = () => {
            const containmentEl = this.el.parentElement;
            const containmentRect = containmentEl.getBoundingClientRect();
            const newRect = {
                width: this.originalRect.width,
                height: this.originalRect.height + this.scrolled,
                left: this.originalRect.left,
                top: this.originalRect.top - this.scrolled
            };
            const rect = this.temporalRect || newRect;
            return {
                position: {
                    left: rect.left - containmentRect.left,
                    top: rect.top - containmentRect.top
                },
                size: {
                    width: rect.width,
                    height: rect.height
                }
                /* Gridstack ONLY needs position set above... keep around in case.
                element: [this.el], // The object representing the element to be resized
                helper: [], // TODO: not support yet - The object representing the helper that's being resized
                originalElement: [this.el],// we don't wrap here, so simplify as this.el //The object representing the original element before it is wrapped
                originalPosition: { // The position represented as { left, top } before the resizable is resized
                  left: this.originalRect.left - containmentRect.left,
                  top: this.originalRect.top - containmentRect.top
                },
                originalSize: { // The size represented as { width, height } before the resizable is resized
                  width: this.originalRect.width,
                  height: this.originalRect.height
                }
                */
            };
        };
        this.el = el;
        this.option = opts;
        // create var event binding so we can easily remove and still look like TS methods (unlike anonymous functions)
        this._mouseOver = this._mouseOver.bind(this);
        this._mouseOut = this._mouseOut.bind(this);
        this.enable();
        this._setupAutoHide(this.option.autoHide);
        this._setupHandlers();
    }
    on(event, callback) {
        super.on(event, callback);
    }
    off(event) {
        super.off(event);
    }
    enable() {
        super.enable();
        this.el.classList.add('ui-resizable');
        this.el.classList.remove('ui-resizable-disabled');
        this._setupAutoHide(this.option.autoHide);
    }
    disable() {
        super.disable();
        this.el.classList.add('ui-resizable-disabled');
        this.el.classList.remove('ui-resizable');
        this._setupAutoHide(false);
    }
    destroy() {
        this._removeHandlers();
        this._setupAutoHide(false);
        this.el.classList.remove('ui-resizable');
        delete this.el;
        super.destroy();
    }
    updateOption(opts) {
        let updateHandles = (opts.handles && opts.handles !== this.option.handles);
        let updateAutoHide = (opts.autoHide && opts.autoHide !== this.option.autoHide);
        Object.keys(opts).forEach(key => this.option[key] = opts[key]);
        if (updateHandles) {
            this._removeHandlers();
            this._setupHandlers();
        }
        if (updateAutoHide) {
            this._setupAutoHide(this.option.autoHide);
        }
        return this;
    }
    /** @internal turns auto hide on/off */
    _setupAutoHide(auto) {
        if (auto) {
            this.el.classList.add('ui-resizable-autohide');
            // use mouseover and not mouseenter to get better performance and track for nested cases
            this.el.addEventListener('mouseover', this._mouseOver);
            this.el.addEventListener('mouseout', this._mouseOut);
        }
        else {
            this.el.classList.remove('ui-resizable-autohide');
            this.el.removeEventListener('mouseover', this._mouseOver);
            this.el.removeEventListener('mouseout', this._mouseOut);
            if (dd_manager_1.DDManager.overResizeElement === this) {
                delete dd_manager_1.DDManager.overResizeElement;
            }
        }
        return this;
    }
    /** @internal */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _mouseOver(e) {
        // console.log(`${count++} pre-enter ${(this.el as GridItemHTMLElement).gridstackNode._id}`)
        // already over a child, ignore. Ideally we just call e.stopPropagation() but see https://github.com/gridstack/gridstack.js/issues/2018
        if (dd_manager_1.DDManager.overResizeElement || dd_manager_1.DDManager.dragElement)
            return;
        dd_manager_1.DDManager.overResizeElement = this;
        // console.log(`${count++} enter ${(this.el as GridItemHTMLElement).gridstackNode._id}`)
        this.el.classList.remove('ui-resizable-autohide');
    }
    /** @internal */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _mouseOut(e) {
        // console.log(`${count++} pre-leave ${(this.el as GridItemHTMLElement).gridstackNode._id}`)
        if (dd_manager_1.DDManager.overResizeElement !== this)
            return;
        delete dd_manager_1.DDManager.overResizeElement;
        // console.log(`${count++} leave ${(this.el as GridItemHTMLElement).gridstackNode._id}`)
        this.el.classList.add('ui-resizable-autohide');
    }
    /** @internal */
    _setupHandlers() {
        let handlerDirection = this.option.handles || 'e,s,se';
        if (handlerDirection === 'all') {
            handlerDirection = 'n,e,s,w,se,sw,ne,nw';
        }
        this.handlers = handlerDirection.split(',')
            .map(dir => dir.trim())
            .map(dir => new dd_resizable_handle_1.DDResizableHandle(this.el, dir, {
            start: (event) => {
                this._resizeStart(event);
            },
            stop: (event) => {
                this._resizeStop(event);
            },
            move: (event) => {
                this._resizing(event, dir);
            }
        }));
        return this;
    }
    /** @internal */
    _resizeStart(event) {
        this.originalRect = this.el.getBoundingClientRect();
        this.scrollEl = utils_1.Utils.getScrollElement(this.el);
        this.scrollY = this.scrollEl.scrollTop;
        this.scrolled = 0;
        this.startEvent = event;
        this._setupHelper();
        this._applyChange();
        const ev = utils_1.Utils.initEvent(event, { type: 'resizestart', target: this.el });
        if (this.option.start) {
            this.option.start(ev, this._ui());
        }
        this.el.classList.add('ui-resizable-resizing');
        this.triggerEvent('resizestart', ev);
        return this;
    }
    /** @internal */
    _resizing(event, dir) {
        this.scrolled = this.scrollEl.scrollTop - this.scrollY;
        this.temporalRect = this._getChange(event, dir);
        this._applyChange();
        const ev = utils_1.Utils.initEvent(event, { type: 'resize', target: this.el });
        if (this.option.resize) {
            this.option.resize(ev, this._ui());
        }
        this.triggerEvent('resize', ev);
        return this;
    }
    /** @internal */
    _resizeStop(event) {
        const ev = utils_1.Utils.initEvent(event, { type: 'resizestop', target: this.el });
        if (this.option.stop) {
            this.option.stop(ev); // Note: ui() not used by gridstack so don't pass
        }
        this.el.classList.remove('ui-resizable-resizing');
        this.triggerEvent('resizestop', ev);
        this._cleanHelper();
        delete this.startEvent;
        delete this.originalRect;
        delete this.temporalRect;
        delete this.scrollY;
        delete this.scrolled;
        return this;
    }
    /** @internal */
    _setupHelper() {
        this.elOriginStyleVal = DDResizable._originStyleProp.map(prop => this.el.style[prop]);
        this.parentOriginStylePosition = this.el.parentElement.style.position;
        if (window.getComputedStyle(this.el.parentElement).position.match(/static/)) {
            this.el.parentElement.style.position = 'relative';
        }
        this.el.style.position = 'absolute';
        this.el.style.opacity = '0.8';
        return this;
    }
    /** @internal */
    _cleanHelper() {
        DDResizable._originStyleProp.forEach((prop, i) => {
            this.el.style[prop] = this.elOriginStyleVal[i] || null;
        });
        this.el.parentElement.style.position = this.parentOriginStylePosition || null;
        return this;
    }
    /** @internal */
    _getChange(event, dir) {
        const oEvent = this.startEvent;
        const newRect = {
            width: this.originalRect.width,
            height: this.originalRect.height + this.scrolled,
            left: this.originalRect.left,
            top: this.originalRect.top - this.scrolled
        };
        const offsetX = event.clientX - oEvent.clientX;
        const offsetY = event.clientY - oEvent.clientY;
        if (dir.indexOf('e') > -1) {
            newRect.width += offsetX;
        }
        else if (dir.indexOf('w') > -1) {
            newRect.width -= offsetX;
            newRect.left += offsetX;
        }
        if (dir.indexOf('s') > -1) {
            newRect.height += offsetY;
        }
        else if (dir.indexOf('n') > -1) {
            newRect.height -= offsetY;
            newRect.top += offsetY;
        }
        const constrain = this._constrainSize(newRect.width, newRect.height);
        if (Math.round(newRect.width) !== Math.round(constrain.width)) { // round to ignore slight round-off errors
            if (dir.indexOf('w') > -1) {
                newRect.left += newRect.width - constrain.width;
            }
            newRect.width = constrain.width;
        }
        if (Math.round(newRect.height) !== Math.round(constrain.height)) {
            if (dir.indexOf('n') > -1) {
                newRect.top += newRect.height - constrain.height;
            }
            newRect.height = constrain.height;
        }
        return newRect;
    }
    /** @internal constrain the size to the set min/max values */
    _constrainSize(oWidth, oHeight) {
        const maxWidth = this.option.maxWidth || Number.MAX_SAFE_INTEGER;
        const minWidth = this.option.minWidth || oWidth;
        const maxHeight = this.option.maxHeight || Number.MAX_SAFE_INTEGER;
        const minHeight = this.option.minHeight || oHeight;
        const width = Math.min(maxWidth, Math.max(minWidth, oWidth));
        const height = Math.min(maxHeight, Math.max(minHeight, oHeight));
        return { width, height };
    }
    /** @internal */
    _applyChange() {
        let containmentRect = { left: 0, top: 0, width: 0, height: 0 };
        if (this.el.style.position === 'absolute') {
            const containmentEl = this.el.parentElement;
            const { left, top } = containmentEl.getBoundingClientRect();
            containmentRect = { left, top, width: 0, height: 0 };
        }
        if (!this.temporalRect)
            return this;
        Object.keys(this.temporalRect).forEach(key => {
            const value = this.temporalRect[key];
            this.el.style[key] = value - containmentRect[key] + 'px';
        });
        return this;
    }
    /** @internal */
    _removeHandlers() {
        this.handlers.forEach(handle => handle.destroy());
        delete this.handlers;
        return this;
    }
}
exports.DDResizable = DDResizable;
/** @internal */
DDResizable._originStyleProp = ['width', 'height', 'position', 'left', 'top', 'opacity', 'zIndex'];
//# sourceMappingURL=dd-resizable.js.map

/***/ }),

/***/ "./node_modules/gridstack/dist/dd-touch.js":
/*!*************************************************!*\
  !*** ./node_modules/gridstack/dist/dd-touch.js ***!
  \*************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


/**
 * touch.ts 7.3.0
 * Copyright (c) 2021 Alain Dumesny - see GridStack root license
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.pointerleave = exports.pointerenter = exports.pointerdown = exports.touchend = exports.touchmove = exports.touchstart = exports.isTouch = void 0;
const dd_manager_1 = __webpack_require__(/*! ./dd-manager */ "./node_modules/gridstack/dist/dd-manager.js");
/**
 * Detect touch support - Windows Surface devices and other touch devices
 * should we use this instead ? (what we had for always showing resize handles)
 * /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
 */
exports.isTouch = typeof window !== 'undefined' && typeof document !== 'undefined' &&
    ('ontouchstart' in document
        || 'ontouchstart' in window
        // || !!window.TouchEvent // true on Windows 10 Chrome desktop so don't use this
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        || (window.DocumentTouch && document instanceof window.DocumentTouch)
        || navigator.maxTouchPoints > 0
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        || navigator.msMaxTouchPoints > 0);
// interface TouchCoord {x: number, y: number};
class DDTouch {
}
/**
* Get the x,y position of a touch event
*/
// function getTouchCoords(e: TouchEvent): TouchCoord {
//   return {
//     x: e.changedTouches[0].pageX,
//     y: e.changedTouches[0].pageY
//   };
// }
/**
 * Simulate a mouse event based on a corresponding touch event
 * @param {Object} e A touch event
 * @param {String} simulatedType The corresponding mouse event
 */
function simulateMouseEvent(e, simulatedType) {
    // Ignore multi-touch events
    if (e.touches.length > 1)
        return;
    // Prevent "Ignored attempt to cancel a touchmove event with cancelable=false" errors
    if (e.cancelable)
        e.preventDefault();
    const touch = e.changedTouches[0], simulatedEvent = document.createEvent('MouseEvents');
    // Initialize the simulated mouse event using the touch event's coordinates
    simulatedEvent.initMouseEvent(simulatedType, // type
    true, // bubbles
    true, // cancelable
    window, // view
    1, // detail
    touch.screenX, // screenX
    touch.screenY, // screenY
    touch.clientX, // clientX
    touch.clientY, // clientY
    false, // ctrlKey
    false, // altKey
    false, // shiftKey
    false, // metaKey
    0, // button
    null // relatedTarget
    );
    // Dispatch the simulated event to the target element
    e.target.dispatchEvent(simulatedEvent);
}
/**
 * Simulate a mouse event based on a corresponding Pointer event
 * @param {Object} e A pointer event
 * @param {String} simulatedType The corresponding mouse event
 */
function simulatePointerMouseEvent(e, simulatedType) {
    // Prevent "Ignored attempt to cancel a touchmove event with cancelable=false" errors
    if (e.cancelable)
        e.preventDefault();
    const simulatedEvent = document.createEvent('MouseEvents');
    // Initialize the simulated mouse event using the touch event's coordinates
    simulatedEvent.initMouseEvent(simulatedType, // type
    true, // bubbles
    true, // cancelable
    window, // view
    1, // detail
    e.screenX, // screenX
    e.screenY, // screenY
    e.clientX, // clientX
    e.clientY, // clientY
    false, // ctrlKey
    false, // altKey
    false, // shiftKey
    false, // metaKey
    0, // button
    null // relatedTarget
    );
    // Dispatch the simulated event to the target element
    e.target.dispatchEvent(simulatedEvent);
}
/**
 * Handle the touchstart events
 * @param {Object} e The widget element's touchstart event
 */
function touchstart(e) {
    // Ignore the event if another widget is already being handled
    if (DDTouch.touchHandled)
        return;
    DDTouch.touchHandled = true;
    // Simulate the mouse events
    // simulateMouseEvent(e, 'mouseover');
    // simulateMouseEvent(e, 'mousemove');
    simulateMouseEvent(e, 'mousedown');
}
exports.touchstart = touchstart;
/**
 * Handle the touchmove events
 * @param {Object} e The document's touchmove event
 */
function touchmove(e) {
    // Ignore event if not handled by us
    if (!DDTouch.touchHandled)
        return;
    simulateMouseEvent(e, 'mousemove');
}
exports.touchmove = touchmove;
/**
 * Handle the touchend events
 * @param {Object} e The document's touchend event
 */
function touchend(e) {
    // Ignore event if not handled
    if (!DDTouch.touchHandled)
        return;
    // cancel delayed leave event when we release on ourself which happens BEFORE we get this!
    if (DDTouch.pointerLeaveTimeout) {
        window.clearTimeout(DDTouch.pointerLeaveTimeout);
        delete DDTouch.pointerLeaveTimeout;
    }
    const wasDragging = !!dd_manager_1.DDManager.dragElement;
    // Simulate the mouseup event
    simulateMouseEvent(e, 'mouseup');
    // simulateMouseEvent(event, 'mouseout');
    // If the touch interaction did not move, it should trigger a click
    if (!wasDragging) {
        simulateMouseEvent(e, 'click');
    }
    // Unset the flag to allow other widgets to inherit the touch event
    DDTouch.touchHandled = false;
}
exports.touchend = touchend;
/**
 * Note we don't get touchenter/touchleave (which are deprecated)
 * see https://stackoverflow.com/questions/27908339/js-touch-equivalent-for-mouseenter
 * so instead of PointerEvent to still get enter/leave and send the matching mouse event.
 */
function pointerdown(e) {
    // console.log("pointer down")
    e.target.releasePointerCapture(e.pointerId); // <- Important!
}
exports.pointerdown = pointerdown;
function pointerenter(e) {
    // ignore the initial one we get on pointerdown on ourself
    if (!dd_manager_1.DDManager.dragElement) {
        // console.log('pointerenter ignored');
        return;
    }
    // console.log('pointerenter');
    simulatePointerMouseEvent(e, 'mouseenter');
}
exports.pointerenter = pointerenter;
function pointerleave(e) {
    // ignore the leave on ourself we get before releasing the mouse over ourself
    // by delaying sending the event and having the up event cancel us
    if (!dd_manager_1.DDManager.dragElement) {
        // console.log('pointerleave ignored');
        return;
    }
    DDTouch.pointerLeaveTimeout = window.setTimeout(() => {
        delete DDTouch.pointerLeaveTimeout;
        // console.log('pointerleave delayed');
        simulatePointerMouseEvent(e, 'mouseleave');
    }, 10);
}
exports.pointerleave = pointerleave;
//# sourceMappingURL=dd-touch.js.map

/***/ }),

/***/ "./node_modules/gridstack/dist/gridstack-engine.js":
/*!*********************************************************!*\
  !*** ./node_modules/gridstack/dist/gridstack-engine.js ***!
  \*********************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


/**
 * gridstack-engine.ts 7.3.0
 * Copyright (c) 2021-2022 Alain Dumesny - see GridStack root license
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GridStackEngine = void 0;
const utils_1 = __webpack_require__(/*! ./utils */ "./node_modules/gridstack/dist/utils.js");
/**
 * Defines the GridStack engine that does most no DOM grid manipulation.
 * See GridStack methods and vars for descriptions.
 *
 * NOTE: values should not be modified directly - call the main GridStack API instead
 */
class GridStackEngine {
    constructor(opts = {}) {
        this.addedNodes = [];
        this.removedNodes = [];
        this.column = opts.column || 12;
        this.maxRow = opts.maxRow;
        this._float = opts.float;
        this.nodes = opts.nodes || [];
        this.onChange = opts.onChange;
    }
    batchUpdate(flag = true) {
        if (!!this.batchMode === flag)
            return this;
        this.batchMode = flag;
        if (flag) {
            this._prevFloat = this._float;
            this._float = true; // let things go anywhere for now... will restore and possibly reposition later
            this.saveInitial(); // since begin update (which is called multiple times) won't do this
        }
        else {
            this._float = this._prevFloat;
            delete this._prevFloat;
            this._packNodes()._notify();
        }
        return this;
    }
    // use entire row for hitting area (will use bottom reverse sorted first) if we not actively moving DOWN and didn't already skip
    _useEntireRowArea(node, nn) {
        return (!this.float || this.batchMode && !this._prevFloat) && !this._hasLocked && (!node._moving || node._skipDown || nn.y <= node.y);
    }
    /** @internal fix collision on given 'node', going to given new location 'nn', with optional 'collide' node already found.
     * return true if we moved. */
    _fixCollisions(node, nn = node, collide, opt = {}) {
        this.sortNodes(-1); // from last to first, so recursive collision move items in the right order
        collide = collide || this.collide(node, nn); // REAL area collide for swap and skip if none...
        if (!collide)
            return false;
        // swap check: if we're actively moving in gravity mode, see if we collide with an object the same size
        if (node._moving && !opt.nested && !this.float) {
            if (this.swap(node, collide))
                return true;
        }
        // during while() collisions MAKE SURE to check entire row so larger items don't leap frog small ones (push them all down starting last in grid)
        let area = nn;
        if (this._useEntireRowArea(node, nn)) {
            area = { x: 0, w: this.column, y: nn.y, h: nn.h };
            collide = this.collide(node, area, opt.skip); // force new hit
        }
        let didMove = false;
        let newOpt = { nested: true, pack: false };
        while (collide = collide || this.collide(node, area, opt.skip)) { // could collide with more than 1 item... so repeat for each
            let moved;
            // if colliding with a locked item OR moving down with top gravity (and collide could move up) -> skip past the collide,
            // but remember that skip down so we only do this once (and push others otherwise).
            if (collide.locked || node._moving && !node._skipDown && nn.y > node.y && !this.float &&
                // can take space we had, or before where we're going
                (!this.collide(collide, Object.assign(Object.assign({}, collide), { y: node.y }), node) || !this.collide(collide, Object.assign(Object.assign({}, collide), { y: nn.y - collide.h }), node))) {
                node._skipDown = (node._skipDown || nn.y > node.y);
                moved = this.moveNode(node, Object.assign(Object.assign(Object.assign({}, nn), { y: collide.y + collide.h }), newOpt));
                if (collide.locked && moved) {
                    utils_1.Utils.copyPos(nn, node); // moving after lock become our new desired location
                }
                else if (!collide.locked && moved && opt.pack) {
                    // we moved after and will pack: do it now and keep the original drop location, but past the old collide to see what else we might push way
                    this._packNodes();
                    nn.y = collide.y + collide.h;
                    utils_1.Utils.copyPos(node, nn);
                }
                didMove = didMove || moved;
            }
            else {
                // move collide down *after* where we will be, ignoring where we are now (don't collide with us)
                moved = this.moveNode(collide, Object.assign(Object.assign(Object.assign({}, collide), { y: nn.y + nn.h, skip: node }), newOpt));
            }
            if (!moved) {
                return didMove;
            } // break inf loop if we couldn't move after all (ex: maxRow, fixed)
            collide = undefined;
        }
        return didMove;
    }
    /** return the nodes that intercept the given node. Optionally a different area can be used, as well as a second node to skip */
    collide(skip, area = skip, skip2) {
        return this.nodes.find(n => n !== skip && n !== skip2 && utils_1.Utils.isIntercepted(n, area));
    }
    collideAll(skip, area = skip, skip2) {
        return this.nodes.filter(n => n !== skip && n !== skip2 && utils_1.Utils.isIntercepted(n, area));
    }
    /** does a pixel coverage collision based on where we started, returning the node that has the most coverage that is >50% mid line */
    directionCollideCoverage(node, o, collides) {
        if (!o.rect || !node._rect)
            return;
        let r0 = node._rect; // where started
        let r = Object.assign({}, o.rect); // where we are
        // update dragged rect to show where it's coming from (above or below, etc...)
        if (r.y > r0.y) {
            r.h += r.y - r0.y;
            r.y = r0.y;
        }
        else {
            r.h += r0.y - r.y;
        }
        if (r.x > r0.x) {
            r.w += r.x - r0.x;
            r.x = r0.x;
        }
        else {
            r.w += r0.x - r.x;
        }
        let collide;
        collides.forEach(n => {
            if (n.locked || !n._rect)
                return;
            let r2 = n._rect; // overlapping target
            let yOver = Number.MAX_VALUE, xOver = Number.MAX_VALUE, overMax = 0.5; // need >50%
            // depending on which side we started from, compute the overlap % of coverage
            // (ex: from above/below we only compute the max horizontal line coverage)
            if (r0.y < r2.y) { // from above
                yOver = ((r.y + r.h) - r2.y) / r2.h;
            }
            else if (r0.y + r0.h > r2.y + r2.h) { // from below
                yOver = ((r2.y + r2.h) - r.y) / r2.h;
            }
            if (r0.x < r2.x) { // from the left
                xOver = ((r.x + r.w) - r2.x) / r2.w;
            }
            else if (r0.x + r0.w > r2.x + r2.w) { // from the right
                xOver = ((r2.x + r2.w) - r.x) / r2.w;
            }
            let over = Math.min(xOver, yOver);
            if (over > overMax) {
                overMax = over;
                collide = n;
            }
        });
        o.collide = collide; // save it so we don't have to find it again
        return collide;
    }
    /** does a pixel coverage returning the node that has the most coverage by area */
    /*
    protected collideCoverage(r: GridStackPosition, collides: GridStackNode[]): {collide: GridStackNode, over: number} {
      let collide: GridStackNode;
      let overMax = 0;
      collides.forEach(n => {
        if (n.locked || !n._rect) return;
        let over = Utils.areaIntercept(r, n._rect);
        if (over > overMax) {
          overMax = over;
          collide = n;
        }
      });
      return {collide, over: overMax};
    }
    */
    /** called to cache the nodes pixel rectangles used for collision detection during drag */
    cacheRects(w, h, top, right, bottom, left) {
        this.nodes.forEach(n => n._rect = {
            y: n.y * h + top,
            x: n.x * w + left,
            w: n.w * w - left - right,
            h: n.h * h - top - bottom
        });
        return this;
    }
    /** called to possibly swap between 2 nodes (same size or column, not locked, touching), returning true if successful */
    swap(a, b) {
        if (!b || b.locked || !a || a.locked)
            return false;
        function _doSwap() {
            let x = b.x, y = b.y;
            b.x = a.x;
            b.y = a.y; // b -> a position
            if (a.h != b.h) {
                a.x = x;
                a.y = b.y + b.h; // a -> goes after b
            }
            else if (a.w != b.w) {
                a.x = b.x + b.w;
                a.y = y; // a -> goes after b
            }
            else {
                a.x = x;
                a.y = y; // a -> old b position
            }
            a._dirty = b._dirty = true;
            return true;
        }
        let touching; // remember if we called it (vs undefined)
        // same size and same row or column, and touching
        if (a.w === b.w && a.h === b.h && (a.x === b.x || a.y === b.y) && (touching = utils_1.Utils.isTouching(a, b)))
            return _doSwap();
        if (touching === false)
            return; // IFF ran test and fail, bail out
        // check for taking same columns (but different height) and touching
        if (a.w === b.w && a.x === b.x && (touching || (touching = utils_1.Utils.isTouching(a, b)))) {
            if (b.y < a.y) {
                let t = a;
                a = b;
                b = t;
            } // swap a <-> b vars so a is first
            return _doSwap();
        }
        if (touching === false)
            return;
        // check if taking same row (but different width) and touching
        if (a.h === b.h && a.y === b.y && (touching || (touching = utils_1.Utils.isTouching(a, b)))) {
            if (b.x < a.x) {
                let t = a;
                a = b;
                b = t;
            } // swap a <-> b vars so a is first
            return _doSwap();
        }
        return false;
    }
    isAreaEmpty(x, y, w, h) {
        let nn = { x: x || 0, y: y || 0, w: w || 1, h: h || 1 };
        return !this.collide(nn);
    }
    /** re-layout grid items to reclaim any empty space */
    compact() {
        if (this.nodes.length === 0)
            return this;
        this.batchUpdate()
            .sortNodes();
        let copyNodes = this.nodes;
        this.nodes = []; // pretend we have no nodes to conflict layout to start with...
        copyNodes.forEach(node => {
            if (!node.locked) {
                node.autoPosition = true;
            }
            this.addNode(node, false); // 'false' for add event trigger
            node._dirty = true; // will force attr update
        });
        return this.batchUpdate(false);
    }
    /** enable/disable floating widgets (default: `false`) See [example](http://gridstackjs.com/demo/float.html) */
    set float(val) {
        if (this._float === val)
            return;
        this._float = val || false;
        if (!val) {
            this._packNodes()._notify();
        }
    }
    /** float getter method */
    get float() { return this._float || false; }
    /** sort the nodes array from first to last, or reverse. Called during collision/placement to force an order */
    sortNodes(dir) {
        this.nodes = utils_1.Utils.sort(this.nodes, dir, this.column);
        return this;
    }
    /** @internal called to top gravity pack the items back OR revert back to original Y positions when floating */
    _packNodes() {
        if (this.batchMode) {
            return this;
        }
        this.sortNodes(); // first to last
        if (this.float) {
            // restore original Y pos
            this.nodes.forEach(n => {
                if (n._updating || n._orig === undefined || n.y === n._orig.y)
                    return;
                let newY = n.y;
                while (newY > n._orig.y) {
                    --newY;
                    let collide = this.collide(n, { x: n.x, y: newY, w: n.w, h: n.h });
                    if (!collide) {
                        n._dirty = true;
                        n.y = newY;
                    }
                }
            });
        }
        else {
            // top gravity pack
            this.nodes.forEach((n, i) => {
                if (n.locked)
                    return;
                while (n.y > 0) {
                    let newY = i === 0 ? 0 : n.y - 1;
                    let canBeMoved = i === 0 || !this.collide(n, { x: n.x, y: newY, w: n.w, h: n.h });
                    if (!canBeMoved)
                        break;
                    // Note: must be dirty (from last position) for GridStack::OnChange CB to update positions
                    // and move items back. The user 'change' CB should detect changes from the original
                    // starting position instead.
                    n._dirty = (n.y !== newY);
                    n.y = newY;
                }
            });
        }
        return this;
    }
    /**
     * given a random node, makes sure it's coordinates/values are valid in the current grid
     * @param node to adjust
     * @param resizing if out of bound, resize down or move into the grid to fit ?
     */
    prepareNode(node, resizing) {
        node = node || {};
        node._id = node._id || GridStackEngine._idSeq++;
        // if we're missing position, have the grid position us automatically (before we set them to 0,0)
        if (node.x === undefined || node.y === undefined || node.x === null || node.y === null) {
            node.autoPosition = true;
        }
        // assign defaults for missing required fields
        let defaults = { x: 0, y: 0, w: 1, h: 1 };
        utils_1.Utils.defaults(node, defaults);
        if (!node.autoPosition) {
            delete node.autoPosition;
        }
        if (!node.noResize) {
            delete node.noResize;
        }
        if (!node.noMove) {
            delete node.noMove;
        }
        // check for NaN (in case messed up strings were passed. can't do parseInt() || defaults.x above as 0 is valid #)
        if (typeof node.x == 'string') {
            node.x = Number(node.x);
        }
        if (typeof node.y == 'string') {
            node.y = Number(node.y);
        }
        if (typeof node.w == 'string') {
            node.w = Number(node.w);
        }
        if (typeof node.h == 'string') {
            node.h = Number(node.h);
        }
        if (isNaN(node.x)) {
            node.x = defaults.x;
            node.autoPosition = true;
        }
        if (isNaN(node.y)) {
            node.y = defaults.y;
            node.autoPosition = true;
        }
        if (isNaN(node.w)) {
            node.w = defaults.w;
        }
        if (isNaN(node.h)) {
            node.h = defaults.h;
        }
        return this.nodeBoundFix(node, resizing);
    }
    /** part2 of preparing a node to fit inside our grid - checks for x,y,w from grid dimensions */
    nodeBoundFix(node, resizing) {
        let before = node._orig || utils_1.Utils.copyPos({}, node);
        if (node.maxW) {
            node.w = Math.min(node.w, node.maxW);
        }
        if (node.maxH) {
            node.h = Math.min(node.h, node.maxH);
        }
        if (node.minW && node.minW <= this.column) {
            node.w = Math.max(node.w, node.minW);
        }
        if (node.minH) {
            node.h = Math.max(node.h, node.minH);
        }
        // if user loaded a larger than allowed widget for current # of columns (or force 1 column mode),
        // remember it's position & width so we can restore back (1 -> 12 column) #1655 #1985
        // IFF we're not in the middle of column resizing!
        const saveOrig = this.column === 1 || node.x + node.w > this.column;
        if (saveOrig && this.column < 12 && !this._inColumnResize && node._id && this.findCacheLayout(node, 12) === -1) {
            let copy = Object.assign({}, node); // need _id + positions
            if (copy.autoPosition) {
                delete copy.x;
                delete copy.y;
            }
            else
                copy.x = Math.min(11, copy.x);
            copy.w = Math.min(12, copy.w);
            this.cacheOneLayout(copy, 12);
        }
        if (node.w > this.column) {
            node.w = this.column;
        }
        else if (node.w < 1) {
            node.w = 1;
        }
        if (this.maxRow && node.h > this.maxRow) {
            node.h = this.maxRow;
        }
        else if (node.h < 1) {
            node.h = 1;
        }
        if (node.x < 0) {
            node.x = 0;
        }
        if (node.y < 0) {
            node.y = 0;
        }
        if (node.x + node.w > this.column) {
            if (resizing) {
                node.w = this.column - node.x;
            }
            else {
                node.x = this.column - node.w;
            }
        }
        if (this.maxRow && node.y + node.h > this.maxRow) {
            if (resizing) {
                node.h = this.maxRow - node.y;
            }
            else {
                node.y = this.maxRow - node.h;
            }
        }
        if (!utils_1.Utils.samePos(node, before)) {
            node._dirty = true;
        }
        return node;
    }
    /** returns a list of modified nodes from their original values */
    getDirtyNodes(verify) {
        // compare original x,y,w,h instead as _dirty can be a temporary state
        if (verify) {
            return this.nodes.filter(n => n._dirty && !utils_1.Utils.samePos(n, n._orig));
        }
        return this.nodes.filter(n => n._dirty);
    }
    /** @internal call this to call onChange callback with dirty nodes so DOM can be updated */
    _notify(removedNodes) {
        if (this.batchMode || !this.onChange)
            return this;
        let dirtyNodes = (removedNodes || []).concat(this.getDirtyNodes());
        this.onChange(dirtyNodes);
        return this;
    }
    /** @internal remove dirty and last tried info */
    cleanNodes() {
        if (this.batchMode)
            return this;
        this.nodes.forEach(n => {
            delete n._dirty;
            delete n._lastTried;
        });
        return this;
    }
    /** @internal called to save initial position/size to track real dirty state.
     * Note: should be called right after we call change event (so next API is can detect changes)
     * as well as right before we start move/resize/enter (so we can restore items to prev values) */
    saveInitial() {
        this.nodes.forEach(n => {
            n._orig = utils_1.Utils.copyPos({}, n);
            delete n._dirty;
        });
        this._hasLocked = this.nodes.some(n => n.locked);
        return this;
    }
    /** @internal restore all the nodes back to initial values (called when we leave) */
    restoreInitial() {
        this.nodes.forEach(n => {
            if (utils_1.Utils.samePos(n, n._orig))
                return;
            utils_1.Utils.copyPos(n, n._orig);
            n._dirty = true;
        });
        this._notify();
        return this;
    }
    /** find the first available empty spot for the given node width/height, updating the x,y attributes. return true if found.
     * optionally you can pass your own existing node list and column count, otherwise defaults to that engine data.
     */
    findEmptyPosition(node, nodeList = this.nodes, column = this.column) {
        nodeList = utils_1.Utils.sort(nodeList, -1, column);
        let found = false;
        for (let i = 0; !found; ++i) {
            let x = i % column;
            let y = Math.floor(i / column);
            if (x + node.w > column) {
                continue;
            }
            let box = { x, y, w: node.w, h: node.h };
            if (!nodeList.find(n => utils_1.Utils.isIntercepted(box, n))) {
                node.x = x;
                node.y = y;
                delete node.autoPosition;
                found = true;
            }
        }
        return found;
    }
    /** call to add the given node to our list, fixing collision and re-packing */
    addNode(node, triggerAddEvent = false) {
        let dup = this.nodes.find(n => n._id === node._id);
        if (dup)
            return dup; // prevent inserting twice! return it instead.
        // skip prepareNode if we're in middle of column resize (not new) but do check for bounds!
        node = this._inColumnResize ? this.nodeBoundFix(node) : this.prepareNode(node);
        delete node._temporaryRemoved;
        delete node._removeDOM;
        if (node.autoPosition && this.findEmptyPosition(node)) {
            delete node.autoPosition; // found our slot
        }
        this.nodes.push(node);
        if (triggerAddEvent) {
            this.addedNodes.push(node);
        }
        this._fixCollisions(node);
        if (!this.batchMode) {
            this._packNodes()._notify();
        }
        return node;
    }
    removeNode(node, removeDOM = true, triggerEvent = false) {
        if (!this.nodes.find(n => n === node)) {
            // TEST console.log(`Error: GridStackEngine.removeNode() node._id=${node._id} not found!`)
            return this;
        }
        if (triggerEvent) { // we wait until final drop to manually track removed items (rather than during drag)
            this.removedNodes.push(node);
        }
        if (removeDOM)
            node._removeDOM = true; // let CB remove actual HTML (used to set _id to null, but then we loose layout info)
        // don't use 'faster' .splice(findIndex(),1) in case node isn't in our list, or in multiple times.
        this.nodes = this.nodes.filter(n => n !== node);
        return this._packNodes()
            ._notify([node]);
    }
    removeAll(removeDOM = true) {
        delete this._layouts;
        if (this.nodes.length === 0)
            return this;
        removeDOM && this.nodes.forEach(n => n._removeDOM = true); // let CB remove actual HTML (used to set _id to null, but then we loose layout info)
        this.removedNodes = this.nodes;
        this.nodes = [];
        return this._notify(this.removedNodes);
    }
    /** checks if item can be moved (layout constrain) vs moveNode(), returning true if was able to move.
     * In more complicated cases (maxRow) it will attempt at moving the item and fixing
     * others in a clone first, then apply those changes if still within specs. */
    moveNodeCheck(node, o) {
        // if (node.locked) return false;
        if (!this.changedPosConstrain(node, o))
            return false;
        o.pack = true;
        // simpler case: move item directly...
        if (!this.maxRow) {
            return this.moveNode(node, o);
        }
        // complex case: create a clone with NO maxRow (will check for out of bounds at the end)
        let clonedNode;
        let clone = new GridStackEngine({
            column: this.column,
            float: this.float,
            nodes: this.nodes.map(n => {
                if (n === node) {
                    clonedNode = Object.assign({}, n);
                    return clonedNode;
                }
                return Object.assign({}, n);
            })
        });
        if (!clonedNode)
            return false;
        // check if we're covering 50% collision and could move
        let canMove = clone.moveNode(clonedNode, o) && clone.getRow() <= this.maxRow;
        // else check if we can force a swap (float=true, or different shapes) on non-resize
        if (!canMove && !o.resizing && o.collide) {
            let collide = o.collide.el.gridstackNode; // find the source node the clone collided with at 50%
            if (this.swap(node, collide)) { // swaps and mark dirty
                this._notify();
                return true;
            }
        }
        if (!canMove)
            return false;
        // if clone was able to move, copy those mods over to us now instead of caller trying to do this all over!
        // Note: we can't use the list directly as elements and other parts point to actual node, so copy content
        clone.nodes.filter(n => n._dirty).forEach(c => {
            let n = this.nodes.find(a => a._id === c._id);
            if (!n)
                return;
            utils_1.Utils.copyPos(n, c);
            n._dirty = true;
        });
        this._notify();
        return true;
    }
    /** return true if can fit in grid height constrain only (always true if no maxRow) */
    willItFit(node) {
        delete node._willFitPos;
        if (!this.maxRow)
            return true;
        // create a clone with NO maxRow and check if still within size
        let clone = new GridStackEngine({
            column: this.column,
            float: this.float,
            nodes: this.nodes.map(n => { return Object.assign({}, n); })
        });
        let n = Object.assign({}, node); // clone node so we don't mod any settings on it but have full autoPosition and min/max as well! #1687
        this.cleanupNode(n);
        delete n.el;
        delete n._id;
        delete n.content;
        delete n.grid;
        clone.addNode(n);
        if (clone.getRow() <= this.maxRow) {
            node._willFitPos = utils_1.Utils.copyPos({}, n);
            return true;
        }
        return false;
    }
    /** true if x,y or w,h are different after clamping to min/max */
    changedPosConstrain(node, p) {
        // first make sure w,h are set for caller
        p.w = p.w || node.w;
        p.h = p.h || node.h;
        if (node.x !== p.x || node.y !== p.y)
            return true;
        // check constrained w,h
        if (node.maxW) {
            p.w = Math.min(p.w, node.maxW);
        }
        if (node.maxH) {
            p.h = Math.min(p.h, node.maxH);
        }
        if (node.minW) {
            p.w = Math.max(p.w, node.minW);
        }
        if (node.minH) {
            p.h = Math.max(p.h, node.minH);
        }
        return (node.w !== p.w || node.h !== p.h);
    }
    /** return true if the passed in node was actually moved (checks for no-op and locked) */
    moveNode(node, o) {
        var _a, _b;
        if (!node || /*node.locked ||*/ !o)
            return false;
        let wasUndefinedPack;
        if (o.pack === undefined) {
            wasUndefinedPack = o.pack = true;
        }
        // constrain the passed in values and check if we're still changing our node
        if (typeof o.x !== 'number') {
            o.x = node.x;
        }
        if (typeof o.y !== 'number') {
            o.y = node.y;
        }
        if (typeof o.w !== 'number') {
            o.w = node.w;
        }
        if (typeof o.h !== 'number') {
            o.h = node.h;
        }
        let resizing = (node.w !== o.w || node.h !== o.h);
        let nn = utils_1.Utils.copyPos({}, node, true); // get min/max out first, then opt positions next
        utils_1.Utils.copyPos(nn, o);
        nn = this.nodeBoundFix(nn, resizing);
        utils_1.Utils.copyPos(o, nn);
        if (utils_1.Utils.samePos(node, o))
            return false;
        let prevPos = utils_1.Utils.copyPos({}, node);
        // check if we will need to fix collision at our new location
        let collides = this.collideAll(node, nn, o.skip);
        let needToMove = true;
        if (collides.length) {
            let activeDrag = node._moving && !o.nested;
            // check to make sure we actually collided over 50% surface area while dragging
            let collide = activeDrag ? this.directionCollideCoverage(node, o, collides) : collides[0];
            // if we're enabling creation of sub-grids on the fly, see if we're covering 80% of either one, if we didn't already do that
            if (activeDrag && collide && ((_b = (_a = node.grid) === null || _a === void 0 ? void 0 : _a.opts) === null || _b === void 0 ? void 0 : _b.subGridDynamic) && !node.grid._isTemp) {
                let over = utils_1.Utils.areaIntercept(o.rect, collide._rect);
                let a1 = utils_1.Utils.area(o.rect);
                let a2 = utils_1.Utils.area(collide._rect);
                let perc = over / (a1 < a2 ? a1 : a2);
                if (perc > .8) {
                    collide.grid.makeSubGrid(collide.el, undefined, node);
                    collide = undefined;
                }
            }
            if (collide) {
                needToMove = !this._fixCollisions(node, nn, collide, o); // check if already moved...
            }
            else {
                needToMove = false; // we didn't cover >50% for a move, skip...
                if (wasUndefinedPack)
                    delete o.pack;
            }
        }
        // now move (to the original ask vs the collision version which might differ) and repack things
        if (needToMove) {
            node._dirty = true;
            utils_1.Utils.copyPos(node, nn);
        }
        if (o.pack) {
            this._packNodes()
                ._notify();
        }
        return !utils_1.Utils.samePos(node, prevPos); // pack might have moved things back
    }
    getRow() {
        return this.nodes.reduce((row, n) => Math.max(row, n.y + n.h), 0);
    }
    beginUpdate(node) {
        if (!node._updating) {
            node._updating = true;
            delete node._skipDown;
            if (!this.batchMode)
                this.saveInitial();
        }
        return this;
    }
    endUpdate() {
        let n = this.nodes.find(n => n._updating);
        if (n) {
            delete n._updating;
            delete n._skipDown;
        }
        return this;
    }
    /** saves a copy of the largest column layout (eg 12 even when rendering oneColumnMode) so we don't loose orig layout,
     * returning a list of widgets for serialization */
    save(saveElement = true) {
        var _a;
        // use the highest layout for any saved info so we can have full detail on reload #1849
        let len = (_a = this._layouts) === null || _a === void 0 ? void 0 : _a.length;
        let layout = len && this.column !== (len - 1) ? this._layouts[len - 1] : null;
        let list = [];
        this.sortNodes();
        this.nodes.forEach(n => {
            let wl = layout === null || layout === void 0 ? void 0 : layout.find(l => l._id === n._id);
            let w = Object.assign({}, n);
            // use layout info instead if set
            if (wl) {
                w.x = wl.x;
                w.y = wl.y;
                w.w = wl.w;
            }
            utils_1.Utils.removeInternalForSave(w, !saveElement);
            list.push(w);
        });
        return list;
    }
    /** @internal called whenever a node is added or moved - updates the cached layouts */
    layoutsNodesChange(nodes) {
        if (!this._layouts || this._inColumnResize)
            return this;
        // remove smaller layouts - we will re-generate those on the fly... larger ones need to update
        this._layouts.forEach((layout, column) => {
            if (!layout || column === this.column)
                return this;
            if (column < this.column) {
                this._layouts[column] = undefined;
            }
            else {
                // we save the original x,y,w (h isn't cached) to see what actually changed to propagate better.
                // NOTE: we don't need to check against out of bound scaling/moving as that will be done when using those cache values. #1785
                let ratio = column / this.column;
                nodes.forEach(node => {
                    if (!node._orig)
                        return; // didn't change (newly added ?)
                    let n = layout.find(l => l._id === node._id);
                    if (!n)
                        return; // no cache for new nodes. Will use those values.
                    // Y changed, push down same amount
                    // TODO: detect doing item 'swaps' will help instead of move (especially in 1 column mode)
                    if (node.y !== node._orig.y) {
                        n.y += (node.y - node._orig.y);
                    }
                    // X changed, scale from new position
                    if (node.x !== node._orig.x) {
                        n.x = Math.round(node.x * ratio);
                    }
                    // width changed, scale from new width
                    if (node.w !== node._orig.w) {
                        n.w = Math.round(node.w * ratio);
                    }
                    // ...height always carries over from cache
                });
            }
        });
        return this;
    }
    /**
     * @internal Called to scale the widget width & position up/down based on the column change.
     * Note we store previous layouts (especially original ones) to make it possible to go
     * from say 12 -> 1 -> 12 and get back to where we were.
     *
     * @param prevColumn previous number of columns
     * @param column  new column number
     * @param nodes different sorted list (ex: DOM order) instead of current list
     * @param layout specify the type of re-layout that will happen (position, size, etc...).
     * Note: items will never be outside of the current column boundaries. default (moveScale). Ignored for 1 column
     */
    updateNodeWidths(prevColumn, column, nodes, layout = 'moveScale') {
        var _a;
        if (!this.nodes.length || !column || prevColumn === column)
            return this;
        // cache the current layout in case they want to go back (like 12 -> 1 -> 12) as it requires original data
        this.cacheLayout(this.nodes, prevColumn);
        this.batchUpdate(); // do this EARLY as it will call saveInitial() so we can detect where we started for _dirty and collision
        let newNodes = [];
        // if we're going to 1 column and using DOM order rather than default sorting, then generate that layout
        let domOrder = false;
        if (column === 1 && (nodes === null || nodes === void 0 ? void 0 : nodes.length)) {
            domOrder = true;
            let top = 0;
            nodes.forEach(n => {
                n.x = 0;
                n.w = 1;
                n.y = Math.max(n.y, top);
                top = n.y + n.h;
            });
            newNodes = nodes;
            nodes = [];
        }
        else {
            nodes = utils_1.Utils.sort(this.nodes, -1, prevColumn); // current column reverse sorting so we can insert last to front (limit collision)
        }
        // see if we have cached previous layout IFF we are going up in size (restore) otherwise always
        // generate next size down from where we are (looks more natural as you gradually size down).
        let cacheNodes = [];
        if (column > prevColumn) {
            cacheNodes = this._layouts[column] || [];
            // ...if not, start with the largest layout (if not already there) as down-scaling is more accurate
            // by pretending we came from that larger column by assigning those values as starting point
            let lastIndex = this._layouts.length - 1;
            if (!cacheNodes.length && prevColumn !== lastIndex && ((_a = this._layouts[lastIndex]) === null || _a === void 0 ? void 0 : _a.length)) {
                prevColumn = lastIndex;
                this._layouts[lastIndex].forEach(cacheNode => {
                    let n = nodes.find(n => n._id === cacheNode._id);
                    if (n) {
                        // still current, use cache info positions
                        n.x = cacheNode.x;
                        n.y = cacheNode.y;
                        n.w = cacheNode.w;
                    }
                });
            }
        }
        // if we found cache re-use those nodes that are still current
        cacheNodes.forEach(cacheNode => {
            let j = nodes.findIndex(n => n._id === cacheNode._id);
            if (j !== -1) {
                // still current, use cache info positions
                if (cacheNode.autoPosition || isNaN(cacheNode.x) || isNaN(cacheNode.y)) {
                    this.findEmptyPosition(cacheNode, newNodes);
                }
                if (!cacheNode.autoPosition) {
                    nodes[j].x = cacheNode.x;
                    nodes[j].y = cacheNode.y;
                    nodes[j].w = cacheNode.w;
                    newNodes.push(nodes[j]);
                }
                nodes.splice(j, 1);
            }
        });
        // ...and add any extra non-cached ones
        if (nodes.length) {
            if (typeof layout === 'function') {
                layout(column, prevColumn, newNodes, nodes);
            }
            else if (!domOrder) {
                let ratio = column / prevColumn;
                let move = (layout === 'move' || layout === 'moveScale');
                let scale = (layout === 'scale' || layout === 'moveScale');
                nodes.forEach(node => {
                    // NOTE: x + w could be outside of the grid, but addNode() below will handle that
                    node.x = (column === 1 ? 0 : (move ? Math.round(node.x * ratio) : Math.min(node.x, column - 1)));
                    node.w = ((column === 1 || prevColumn === 1) ? 1 :
                        scale ? (Math.round(node.w * ratio) || 1) : (Math.min(node.w, column)));
                    newNodes.push(node);
                });
                nodes = [];
            }
        }
        // finally re-layout them in reverse order (to get correct placement)
        if (!domOrder)
            newNodes = utils_1.Utils.sort(newNodes, -1, column);
        this._inColumnResize = true; // prevent cache update
        this.nodes = []; // pretend we have no nodes to start with (add() will use same structures) to simplify layout
        newNodes.forEach(node => {
            this.addNode(node, false); // 'false' for add event trigger
            delete node._orig; // make sure the commit doesn't try to restore things back to original
        });
        this.batchUpdate(false);
        delete this._inColumnResize;
        return this;
    }
    /**
     * call to cache the given layout internally to the given location so we can restore back when column changes size
     * @param nodes list of nodes
     * @param column corresponding column index to save it under
     * @param clear if true, will force other caches to be removed (default false)
     */
    cacheLayout(nodes, column, clear = false) {
        let copy = [];
        nodes.forEach((n, i) => {
            n._id = n._id || GridStackEngine._idSeq++; // make sure we have an id in case this is new layout, else re-use id already set
            copy[i] = { x: n.x, y: n.y, w: n.w, _id: n._id }; // only thing we change is x,y,w and id to find it back
        });
        this._layouts = clear ? [] : this._layouts || []; // use array to find larger quick
        this._layouts[column] = copy;
        return this;
    }
    /**
     * call to cache the given node layout internally to the given location so we can restore back when column changes size
     * @param node single node to cache
     * @param column corresponding column index to save it under
     */
    cacheOneLayout(n, column) {
        n._id = n._id || GridStackEngine._idSeq++;
        let l = { x: n.x, y: n.y, w: n.w, _id: n._id };
        if (n.autoPosition) {
            delete l.x;
            delete l.y;
            l.autoPosition = true;
        }
        this._layouts = this._layouts || [];
        this._layouts[column] = this._layouts[column] || [];
        let index = this.findCacheLayout(n, column);
        if (index === -1)
            this._layouts[column].push(l);
        else
            this._layouts[column][index] = l;
        return this;
    }
    findCacheLayout(n, column) {
        var _a, _b, _c;
        return (_c = (_b = (_a = this._layouts) === null || _a === void 0 ? void 0 : _a[column]) === null || _b === void 0 ? void 0 : _b.findIndex(l => l._id === n._id)) !== null && _c !== void 0 ? _c : -1;
    }
    /** called to remove all internal values but the _id */
    cleanupNode(node) {
        for (let prop in node) {
            if (prop[0] === '_' && prop !== '_id')
                delete node[prop];
        }
        return this;
    }
}
exports.GridStackEngine = GridStackEngine;
/** @internal unique global internal _id counter NOT starting at 0 */
GridStackEngine._idSeq = 1;
//# sourceMappingURL=gridstack-engine.js.map

/***/ }),

/***/ "./node_modules/gridstack/dist/gridstack.js":
/*!**************************************************!*\
  !*** ./node_modules/gridstack/dist/gridstack.js ***!
  \**************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GridStack = void 0;
/*!
 * GridStack 7.3.0
 * https://gridstackjs.com/
 *
 * Copyright (c) 2021-2022 Alain Dumesny
 * see root license https://github.com/gridstack/gridstack.js/tree/master/LICENSE
 */
const gridstack_engine_1 = __webpack_require__(/*! ./gridstack-engine */ "./node_modules/gridstack/dist/gridstack-engine.js");
const utils_1 = __webpack_require__(/*! ./utils */ "./node_modules/gridstack/dist/utils.js");
const types_1 = __webpack_require__(/*! ./types */ "./node_modules/gridstack/dist/types.js");
/*
 * and include D&D by default
 * TODO: while we could generate a gridstack-static.js at smaller size - saves about 31k (41k -> 72k)
 * I don't know how to generate the DD only code at the remaining 31k to delay load as code depends on Gridstack.ts
 * also it caused loading issues in prod - see https://github.com/gridstack/gridstack.js/issues/2039
 */
const dd_gridstack_1 = __webpack_require__(/*! ./dd-gridstack */ "./node_modules/gridstack/dist/dd-gridstack.js");
const dd_touch_1 = __webpack_require__(/*! ./dd-touch */ "./node_modules/gridstack/dist/dd-touch.js");
const dd_manager_1 = __webpack_require__(/*! ./dd-manager */ "./node_modules/gridstack/dist/dd-manager.js");
/** global instance */
const dd = new dd_gridstack_1.DDGridStack;
// export all dependent file as well to make it easier for users to just import the main file
__exportStar(__webpack_require__(/*! ./types */ "./node_modules/gridstack/dist/types.js"), exports);
__exportStar(__webpack_require__(/*! ./utils */ "./node_modules/gridstack/dist/utils.js"), exports);
__exportStar(__webpack_require__(/*! ./gridstack-engine */ "./node_modules/gridstack/dist/gridstack-engine.js"), exports);
__exportStar(__webpack_require__(/*! ./dd-gridstack */ "./node_modules/gridstack/dist/dd-gridstack.js"), exports);
/**
 * Main gridstack class - you will need to call `GridStack.init()` first to initialize your grid.
 * Note: your grid elements MUST have the following classes for the CSS layout to work:
 * @example
 * <div class="grid-stack">
 *   <div class="grid-stack-item">
 *     <div class="grid-stack-item-content">Item 1</div>
 *   </div>
 * </div>
 */
class GridStack {
    /**
     * Construct a grid item from the given element and options
     * @param el
     * @param opts
     */
    constructor(el, opts = {}) {
        var _a, _b;
        /** @internal */
        this._gsEventHandler = {};
        /** @internal extra row added when dragging at the bottom of the grid */
        this._extraDragRow = 0;
        this.el = el; // exposed HTML element to the user
        opts = opts || {}; // handles null/undefined/0
        if (!el.classList.contains('grid-stack')) {
            this.el.classList.add('grid-stack');
        }
        // if row property exists, replace minRow and maxRow instead
        if (opts.row) {
            opts.minRow = opts.maxRow = opts.row;
            delete opts.row;
        }
        let rowAttr = utils_1.Utils.toNumber(el.getAttribute('gs-row'));
        // flag only valid in sub-grids (handled by parent, not here)
        if (opts.column === 'auto') {
            delete opts.column;
        }
        // 'minWidth' legacy support in 5.1
        /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
        let anyOpts = opts;
        if (anyOpts.minWidth !== undefined) {
            opts.oneColumnSize = opts.oneColumnSize || anyOpts.minWidth;
            delete anyOpts.minWidth;
        }
        // save original setting so we can restore on save
        if (opts.alwaysShowResizeHandle !== undefined) {
            opts._alwaysShowResizeHandle = opts.alwaysShowResizeHandle;
        }
        // elements DOM attributes override any passed options (like CSS style) - merge the two together
        let defaults = Object.assign(Object.assign({}, utils_1.Utils.cloneDeep(types_1.gridDefaults)), { column: utils_1.Utils.toNumber(el.getAttribute('gs-column')) || types_1.gridDefaults.column, minRow: rowAttr ? rowAttr : utils_1.Utils.toNumber(el.getAttribute('gs-min-row')) || types_1.gridDefaults.minRow, maxRow: rowAttr ? rowAttr : utils_1.Utils.toNumber(el.getAttribute('gs-max-row')) || types_1.gridDefaults.maxRow, staticGrid: utils_1.Utils.toBool(el.getAttribute('gs-static')) || types_1.gridDefaults.staticGrid, draggable: {
                handle: (opts.handleClass ? '.' + opts.handleClass : (opts.handle ? opts.handle : '')) || types_1.gridDefaults.draggable.handle,
            }, removableOptions: {
                accept: opts.itemClass ? '.' + opts.itemClass : types_1.gridDefaults.removableOptions.accept,
            } });
        if (el.getAttribute('gs-animate')) { // default to true, but if set to false use that instead
            defaults.animate = utils_1.Utils.toBool(el.getAttribute('gs-animate'));
        }
        this.opts = utils_1.Utils.defaults(opts, defaults);
        opts = null; // make sure we use this.opts instead
        this._initMargin(); // part of settings defaults...
        // Now check if we're loading into 1 column mode FIRST so we don't do un-necessary work (like cellHeight = width / 12 then go 1 column)
        if (this.opts.column !== 1 && !this.opts.disableOneColumnMode && this._widthOrContainer() <= this.opts.oneColumnSize) {
            this._prevColumn = this.getColumn();
            this.opts.column = 1;
        }
        if (this.opts.rtl === 'auto') {
            this.opts.rtl = (el.style.direction === 'rtl');
        }
        if (this.opts.rtl) {
            this.el.classList.add('grid-stack-rtl');
        }
        // check if we're been nested, and if so update our style and keep pointer around (used during save)
        let parentGridItem = (_a = utils_1.Utils.closestUpByClass(this.el, types_1.gridDefaults.itemClass)) === null || _a === void 0 ? void 0 : _a.gridstackNode;
        if (parentGridItem) {
            parentGridItem.subGrid = this;
            this.parentGridItem = parentGridItem;
            this.el.classList.add('grid-stack-nested');
            parentGridItem.el.classList.add('grid-stack-sub-grid');
        }
        this._isAutoCellHeight = (this.opts.cellHeight === 'auto');
        if (this._isAutoCellHeight || this.opts.cellHeight === 'initial') {
            // make the cell content square initially (will use resize/column event to keep it square)
            this.cellHeight(undefined, false);
        }
        else {
            // append unit if any are set
            if (typeof this.opts.cellHeight == 'number' && this.opts.cellHeightUnit && this.opts.cellHeightUnit !== types_1.gridDefaults.cellHeightUnit) {
                this.opts.cellHeight = this.opts.cellHeight + this.opts.cellHeightUnit;
                delete this.opts.cellHeightUnit;
            }
            this.cellHeight(this.opts.cellHeight, false);
        }
        // see if we need to adjust auto-hide
        if (this.opts.alwaysShowResizeHandle === 'mobile') {
            this.opts.alwaysShowResizeHandle = dd_touch_1.isTouch;
        }
        this._styleSheetClass = 'grid-stack-instance-' + gridstack_engine_1.GridStackEngine._idSeq++;
        this.el.classList.add(this._styleSheetClass);
        this._setStaticClass();
        let engineClass = this.opts.engineClass || GridStack.engineClass || gridstack_engine_1.GridStackEngine;
        this.engine = new engineClass({
            column: this.getColumn(),
            float: this.opts.float,
            maxRow: this.opts.maxRow,
            onChange: (cbNodes) => {
                let maxH = 0;
                this.engine.nodes.forEach(n => { maxH = Math.max(maxH, n.y + n.h); });
                cbNodes.forEach(n => {
                    let el = n.el;
                    if (!el)
                        return;
                    if (n._removeDOM) {
                        if (el)
                            el.remove();
                        delete n._removeDOM;
                    }
                    else {
                        this._writePosAttr(el, n);
                    }
                });
                this._updateStyles(false, maxH); // false = don't recreate, just append if need be
            }
        });
        if (this.opts.auto) {
            this.batchUpdate(); // prevent in between re-layout #1535 TODO: this only set float=true, need to prevent collision check...
            this.getGridItems().forEach(el => this._prepareElement(el));
            this.batchUpdate(false);
        }
        // load any passed in children as well, which overrides any DOM layout done above
        if (this.opts.children) {
            let children = this.opts.children;
            delete this.opts.children;
            if (children.length)
                this.load(children); // don't load empty
        }
        this.setAnimation(this.opts.animate);
        this._updateStyles();
        if (this.opts.column != 12) {
            this.el.classList.add('grid-stack-' + this.opts.column);
        }
        // legacy support to appear 'per grid` options when really global.
        if (this.opts.dragIn)
            GridStack.setupDragIn(this.opts.dragIn, this.opts.dragInOptions);
        delete this.opts.dragIn;
        delete this.opts.dragInOptions;
        // dynamic grids require pausing during drag to detect over to nest vs push
        if (this.opts.subGridDynamic && !dd_manager_1.DDManager.pauseDrag)
            dd_manager_1.DDManager.pauseDrag = true;
        if (((_b = this.opts.draggable) === null || _b === void 0 ? void 0 : _b.pause) !== undefined)
            dd_manager_1.DDManager.pauseDrag = this.opts.draggable.pause;
        this._setupRemoveDrop();
        this._setupAcceptWidget();
        this._updateWindowResizeEvent();
    }
    /**
     * initializing the HTML element, or selector string, into a grid will return the grid. Calling it again will
     * simply return the existing instance (ignore any passed options). There is also an initAll() version that support
     * multiple grids initialization at once. Or you can use addGrid() to create the entire grid from JSON.
     * @param options grid options (optional)
     * @param elOrString element or CSS selector (first one used) to convert to a grid (default to '.grid-stack' class selector)
     *
     * @example
     * let grid = GridStack.init();
     *
     * Note: the HTMLElement (of type GridHTMLElement) will store a `gridstack: GridStack` value that can be retrieve later
     * let grid = document.querySelector('.grid-stack').gridstack;
     */
    static init(options = {}, elOrString = '.grid-stack') {
        let el = GridStack.getGridElement(elOrString);
        if (!el) {
            if (typeof elOrString === 'string') {
                console.error('GridStack.initAll() no grid was found with selector "' + elOrString + '" - element missing or wrong selector ?' +
                    '\nNote: ".grid-stack" is required for proper CSS styling and drag/drop, and is the default selector.');
            }
            else {
                console.error('GridStack.init() no grid element was passed.');
            }
            return null;
        }
        if (!el.gridstack) {
            el.gridstack = new GridStack(el, utils_1.Utils.cloneDeep(options));
        }
        return el.gridstack;
    }
    /**
     * Will initialize a list of elements (given a selector) and return an array of grids.
     * @param options grid options (optional)
     * @param selector elements selector to convert to grids (default to '.grid-stack' class selector)
     *
     * @example
     * let grids = GridStack.initAll();
     * grids.forEach(...)
     */
    static initAll(options = {}, selector = '.grid-stack') {
        let grids = [];
        GridStack.getGridElements(selector).forEach(el => {
            if (!el.gridstack) {
                el.gridstack = new GridStack(el, utils_1.Utils.cloneDeep(options));
                delete options.dragIn;
                delete options.dragInOptions; // only need to be done once (really a static global thing, not per grid)
            }
            grids.push(el.gridstack);
        });
        if (grids.length === 0) {
            console.error('GridStack.initAll() no grid was found with selector "' + selector + '" - element missing or wrong selector ?' +
                '\nNote: ".grid-stack" is required for proper CSS styling and drag/drop, and is the default selector.');
        }
        return grids;
    }
    /**
     * call to create a grid with the given options, including loading any children from JSON structure. This will call GridStack.init(), then
     * grid.load() on any passed children (recursively). Great alternative to calling init() if you want entire grid to come from
     * JSON serialized data, including options.
     * @param parent HTML element parent to the grid
     * @param opt grids options used to initialize the grid, and list of children
     */
    static addGrid(parent, opt = {}) {
        if (!parent)
            return null;
        // create the grid element, but check if the passed 'parent' already has grid styling and should be used instead
        let el = parent;
        const parentIsGrid = parent.classList.contains('grid-stack');
        if (!parentIsGrid || opt.addRemoveCB) {
            if (opt.addRemoveCB) {
                el = opt.addRemoveCB(parent, opt, true, true);
            }
            else {
                let doc = document.implementation.createHTMLDocument(''); // IE needs a param
                doc.body.innerHTML = `<div class="grid-stack ${opt.class || ''}"></div>`;
                el = doc.body.children[0];
                parent.appendChild(el);
            }
        }
        // create grid class and load any children
        let grid = GridStack.init(opt, el);
        return grid;
    }
    /** call this method to register your engine instead of the default one.
     * See instead `GridStackOptions.engineClass` if you only need to
     * replace just one instance.
     */
    static registerEngine(engineClass) {
        GridStack.engineClass = engineClass;
    }
    /** @internal create placeholder DIV as needed */
    get placeholder() {
        if (!this._placeholder) {
            let placeholderChild = document.createElement('div'); // child so padding match item-content
            placeholderChild.className = 'placeholder-content';
            if (this.opts.placeholderText) {
                placeholderChild.innerHTML = this.opts.placeholderText;
            }
            this._placeholder = document.createElement('div');
            this._placeholder.classList.add(this.opts.placeholderClass, types_1.gridDefaults.itemClass, this.opts.itemClass);
            this.placeholder.appendChild(placeholderChild);
        }
        return this._placeholder;
    }
    /**
     * add a new widget and returns it.
     *
     * Widget will be always placed even if result height is more than actual grid height.
     * You need to use `willItFit()` before calling addWidget for additional check.
     * See also `makeWidget()`.
     *
     * @example
     * let grid = GridStack.init();
     * grid.addWidget({w: 3, content: 'hello'});
     * grid.addWidget('<div class="grid-stack-item"><div class="grid-stack-item-content">hello</div></div>', {w: 3});
     *
     * @param el  GridStackWidget (which can have content string as well), html element, or string definition to add
     * @param options widget position/size options (optional, and ignore if first param is already option) - see GridStackWidget
     */
    addWidget(els, options) {
        function isGridStackWidget(w) {
            return w.el !== undefined || w.x !== undefined || w.y !== undefined || w.w !== undefined || w.h !== undefined || w.content !== undefined ? true : false;
        }
        let el;
        let node;
        if (typeof els === 'string') {
            let doc = document.implementation.createHTMLDocument(''); // IE needs a param
            doc.body.innerHTML = els;
            el = doc.body.children[0];
        }
        else if (arguments.length === 0 || arguments.length === 1 && isGridStackWidget(els)) {
            node = options = els;
            if (node === null || node === void 0 ? void 0 : node.el) {
                el = node.el; // re-use element stored in the node
            }
            else if (this.opts.addRemoveCB) {
                el = this.opts.addRemoveCB(this.el, options, true, false);
            }
            else {
                let content = (options === null || options === void 0 ? void 0 : options.content) || '';
                let doc = document.implementation.createHTMLDocument(''); // IE needs a param
                doc.body.innerHTML = `<div class="grid-stack-item ${this.opts.itemClass || ''}"><div class="grid-stack-item-content">${content}</div></div>`;
                el = doc.body.children[0];
            }
        }
        else {
            el = els;
        }
        if (!el)
            return;
        // Tempting to initialize the passed in opt with default and valid values, but this break knockout demos
        // as the actual value are filled in when _prepareElement() calls el.getAttribute('gs-xyz') before adding the node.
        // So make sure we load any DOM attributes that are not specified in passed in options (which override)
        let domAttr = this._readAttr(el);
        options = utils_1.Utils.cloneDeep(options) || {}; // make a copy before we modify in case caller re-uses it
        utils_1.Utils.defaults(options, domAttr);
        node = this.engine.prepareNode(options);
        this._writeAttr(el, options);
        if (this._insertNotAppend) {
            this.el.prepend(el);
        }
        else {
            this.el.appendChild(el);
        }
        // similar to makeWidget() that doesn't read attr again and worse re-create a new node and loose any _id
        this._prepareElement(el, true, options);
        this._updateContainerHeight();
        // see if there is a sub-grid to create
        if (node.subGrid) {
            this.makeSubGrid(node.el, undefined, undefined, false); //node.subGrid will be used as option in method, no need to pass
        }
        // if we're adding an item into 1 column (_prevColumn is set only when going to 1) make sure
        // we don't override the larger 12 column layout that was already saved. #1985
        if (this._prevColumn && this.opts.column === 1) {
            this._ignoreLayoutsNodeChange = true;
        }
        this._triggerAddEvent();
        this._triggerChangeEvent();
        delete this._ignoreLayoutsNodeChange;
        return el;
    }
    /**
     * Convert an existing gridItem element into a sub-grid with the given (optional) options, else inherit them
     * from the parent's subGrid options.
     * @param el gridItem element to convert
     * @param ops (optional) sub-grid options, else default to node, then parent settings, else defaults
     * @param nodeToAdd (optional) node to add to the newly created sub grid (used when dragging over existing regular item)
     * @returns newly created grid
     */
    makeSubGrid(el, ops, nodeToAdd, saveContent = true) {
        var _a, _b, _c;
        let node = el.gridstackNode;
        if (!node) {
            node = this.makeWidget(el).gridstackNode;
        }
        if ((_a = node.subGrid) === null || _a === void 0 ? void 0 : _a.el)
            return node.subGrid; // already done
        // find the template subGrid stored on a parent as fallback...
        let subGridTemplate; // eslint-disable-next-line @typescript-eslint/no-this-alias
        let grid = this;
        while (grid && !subGridTemplate) {
            subGridTemplate = (_b = grid.opts) === null || _b === void 0 ? void 0 : _b.subGrid;
            grid = (_c = grid.parentGridItem) === null || _c === void 0 ? void 0 : _c.grid;
        }
        //... and set the create options
        ops = utils_1.Utils.cloneDeep(Object.assign(Object.assign(Object.assign({}, (subGridTemplate || {})), { children: undefined }), (ops || node.subGrid)));
        node.subGrid = ops;
        // if column special case it set, remember that flag and set default
        let autoColumn;
        if (ops.column === 'auto') {
            autoColumn = true;
            ops.column = Math.max(node.w || 1, (nodeToAdd === null || nodeToAdd === void 0 ? void 0 : nodeToAdd.w) || 1);
            ops.disableOneColumnMode = true; // driven by parent
        }
        // if we're converting an existing full item, move over the content to be the first sub item in the new grid
        let content = node.el.querySelector('.grid-stack-item-content');
        let newItem;
        let newItemOpt;
        if (saveContent) {
            this._removeDD(node.el); // remove D&D since it's set on content div
            newItemOpt = Object.assign(Object.assign({}, node), { x: 0, y: 0 });
            utils_1.Utils.removeInternalForSave(newItemOpt);
            delete newItemOpt.subGrid;
            if (node.content) {
                newItemOpt.content = node.content;
                delete node.content;
            }
            if (this.opts.addRemoveCB) {
                newItem = this.opts.addRemoveCB(this.el, newItemOpt, true, false);
            }
            else {
                let doc = document.implementation.createHTMLDocument(''); // IE needs a param
                doc.body.innerHTML = `<div class="grid-stack-item"></div>`;
                newItem = doc.body.children[0];
                newItem.appendChild(content);
                doc.body.innerHTML = `<div class="grid-stack-item-content"></div>`;
                content = doc.body.children[0];
                node.el.appendChild(content);
            }
            this._prepareDragDropByNode(node); // ... and restore original D&D
        }
        // if we're adding an additional item, make the container large enough to have them both
        if (nodeToAdd) {
            let w = autoColumn ? ops.column : node.w;
            let h = node.h + nodeToAdd.h;
            let style = node.el.style;
            style.transition = 'none'; // show up instantly so we don't see scrollbar with nodeToAdd
            this.update(node.el, { w, h });
            setTimeout(() => style.transition = null); // recover animation
        }
        if (this.opts.addRemoveCB) {
            ops.addRemoveCB = ops.addRemoveCB || this.opts.addRemoveCB;
        }
        let subGrid = node.subGrid = GridStack.addGrid(content, ops);
        if (nodeToAdd === null || nodeToAdd === void 0 ? void 0 : nodeToAdd._moving)
            subGrid._isTemp = true; // prevent re-nesting as we add over
        if (autoColumn)
            subGrid._autoColumn = true;
        // add the original content back as a child of hte newly created grid
        if (saveContent) {
            subGrid.addWidget(newItem, newItemOpt);
        }
        // now add any additional node
        if (nodeToAdd) {
            if (nodeToAdd._moving) {
                // create an artificial event even for the just created grid to receive this item
                window.setTimeout(() => utils_1.Utils.simulateMouseEvent(nodeToAdd._event, 'mouseenter', subGrid.el), 0);
            }
            else {
                subGrid.addWidget(node.el, node);
            }
        }
        return subGrid;
    }
    /**
     * called when an item was converted into a nested grid to accommodate a dragged over item, but then item leaves - return back
     * to the original grid-item. Also called to remove empty sub-grids when last item is dragged out (since re-creating is simple)
     */
    removeAsSubGrid(nodeThatRemoved) {
        var _a;
        let pGrid = (_a = this.parentGridItem) === null || _a === void 0 ? void 0 : _a.grid;
        if (!pGrid)
            return;
        pGrid.batchUpdate();
        pGrid.removeWidget(this.parentGridItem.el, true, true);
        this.engine.nodes.forEach(n => {
            // migrate any children over and offsetting by our location
            n.x += this.parentGridItem.x;
            n.y += this.parentGridItem.y;
            pGrid.addWidget(n.el, n);
        });
        pGrid.batchUpdate(false);
        if (this.parentGridItem)
            delete this.parentGridItem.subGrid;
        delete this.parentGridItem;
        // create an artificial event for the original grid now that this one is gone (got a leave, but won't get enter)
        if (nodeThatRemoved) {
            window.setTimeout(() => utils_1.Utils.simulateMouseEvent(nodeThatRemoved._event, 'mouseenter', pGrid.el), 0);
        }
    }
    /**
    /**
     * saves the current layout returning a list of widgets for serialization which might include any nested grids.
     * @param saveContent if true (default) the latest html inside .grid-stack-content will be saved to GridStackWidget.content field, else it will
     * be removed.
     * @param saveGridOpt if true (default false), save the grid options itself, so you can call the new GridStack.addGrid()
     * to recreate everything from scratch. GridStackOptions.children would then contain the widget list instead.
     * @returns list of widgets or full grid option, including .children list of widgets
     */
    save(saveContent = true, saveGridOpt = false) {
        // return copied nodes we can modify at will...
        let list = this.engine.save(saveContent);
        // check for HTML content and nested grids
        list.forEach(n => {
            var _a;
            if (saveContent && n.el && !n.subGrid) { // sub-grid are saved differently, not plain content
                let sub = n.el.querySelector('.grid-stack-item-content');
                n.content = sub ? sub.innerHTML : undefined;
                if (!n.content)
                    delete n.content;
            }
            else {
                if (!saveContent) {
                    delete n.content;
                }
                // check for nested grid
                if ((_a = n.subGrid) === null || _a === void 0 ? void 0 : _a.el) {
                    const listOrOpt = n.subGrid.save(saveContent, saveGridOpt);
                    n.subGrid = (saveGridOpt ? listOrOpt : { children: listOrOpt });
                }
            }
            delete n.el;
        });
        // check if save entire grid options (needed for recursive) + children...
        if (saveGridOpt) {
            let o = utils_1.Utils.cloneDeep(this.opts);
            // delete default values that will be recreated on launch
            if (o.marginBottom === o.marginTop && o.marginRight === o.marginLeft && o.marginTop === o.marginRight) {
                o.margin = o.marginTop;
                delete o.marginTop;
                delete o.marginRight;
                delete o.marginBottom;
                delete o.marginLeft;
            }
            if (o.rtl === (this.el.style.direction === 'rtl')) {
                o.rtl = 'auto';
            }
            if (this._isAutoCellHeight) {
                o.cellHeight = 'auto';
            }
            if (this._autoColumn) {
                o.column = 'auto';
                delete o.disableOneColumnMode;
            }
            const origShow = o._alwaysShowResizeHandle;
            delete o._alwaysShowResizeHandle;
            if (origShow !== undefined) {
                o.alwaysShowResizeHandle = origShow;
            }
            else {
                delete o.alwaysShowResizeHandle;
            }
            utils_1.Utils.removeInternalAndSame(o, types_1.gridDefaults);
            o.children = list;
            return o;
        }
        return list;
    }
    /**
     * load the widgets from a list. This will call update() on each (matching by id) or add/remove widgets that are not there.
     *
     * @param layout list of widgets definition to update/create
     * @param addAndRemove boolean (default true) or callback method can be passed to control if and how missing widgets can be added/removed, giving
     * the user control of insertion.
     *
     * @example
     * see http://gridstackjs.com/demo/serialization.html
     **/
    load(layout, addRemove = this.opts.addRemoveCB || true) {
        let items = GridStack.Utils.sort([...layout], -1, this._prevColumn || this.getColumn()); // make copy before we mod/sort
        this._insertNotAppend = true; // since create in reverse order...
        // if we're loading a layout into for example 1 column (_prevColumn is set only when going to 1) and items don't fit, make sure to save
        // the original wanted layout so we can scale back up correctly #1471
        if (this._prevColumn && this._prevColumn !== this.opts.column && items.some(n => (n.x + n.w) > this.opts.column)) {
            this._ignoreLayoutsNodeChange = true; // skip layout update
            this.engine.cacheLayout(items, this._prevColumn, true);
        }
        // if given a different callback, temporally set it as global option to creating will use it
        const prevCB = this.opts.addRemoveCB;
        if (typeof (addRemove) === 'function')
            this.opts.addRemoveCB = addRemove;
        let removed = [];
        this.batchUpdate();
        // see if any items are missing from new layout and need to be removed first
        if (addRemove) {
            let copyNodes = [...this.engine.nodes]; // don't loop through array you modify
            copyNodes.forEach(n => {
                let item = items.find(w => n.id === w.id);
                if (!item) {
                    if (this.opts.addRemoveCB)
                        this.opts.addRemoveCB(this.el, n, false, false);
                    removed.push(n); // batch keep track
                    this.removeWidget(n.el, true, false);
                }
            });
        }
        // now add/update the widgets
        items.forEach(w => {
            let item = (w.id || w.id === 0) ? this.engine.nodes.find(n => n.id === w.id) : undefined;
            if (item) {
                this.update(item.el, w);
                if (w.subGrid && w.subGrid.children) { // update any sub grid as well
                    let sub = item.el.querySelector('.grid-stack');
                    if (sub && sub.gridstack) {
                        sub.gridstack.load(w.subGrid.children); // TODO: support updating grid options ?
                        this._insertNotAppend = true; // got reset by above call
                    }
                }
            }
            else if (addRemove) {
                this.addWidget(w);
            }
        });
        this.engine.removedNodes = removed;
        this.batchUpdate(false);
        // after commit, clear that flag
        delete this._ignoreLayoutsNodeChange;
        delete this._insertNotAppend;
        prevCB ? this.opts.addRemoveCB = prevCB : delete this.opts.addRemoveCB;
        return this;
    }
    /**
     * use before calling a bunch of `addWidget()` to prevent un-necessary relayouts in between (more efficient)
     * and get a single event callback. You will see no changes until `batchUpdate(false)` is called.
     */
    batchUpdate(flag = true) {
        this.engine.batchUpdate(flag);
        if (!flag) {
            this._triggerRemoveEvent();
            this._triggerAddEvent();
            this._triggerChangeEvent();
        }
        return this;
    }
    /**
     * Gets current cell height.
     */
    getCellHeight(forcePixel = false) {
        if (this.opts.cellHeight && this.opts.cellHeight !== 'auto' &&
            (!forcePixel || !this.opts.cellHeightUnit || this.opts.cellHeightUnit === 'px')) {
            return this.opts.cellHeight;
        }
        // else get first cell height
        let el = this.el.querySelector('.' + this.opts.itemClass);
        if (el) {
            let height = utils_1.Utils.toNumber(el.getAttribute('gs-h'));
            return Math.round(el.offsetHeight / height);
        }
        // else do entire grid and # of rows (but doesn't work if min-height is the actual constrain)
        let rows = parseInt(this.el.getAttribute('gs-current-row'));
        return rows ? Math.round(this.el.getBoundingClientRect().height / rows) : this.opts.cellHeight;
    }
    /**
     * Update current cell height - see `GridStackOptions.cellHeight` for format.
     * This method rebuilds an internal CSS style sheet.
     * Note: You can expect performance issues if call this method too often.
     *
     * @param val the cell height. If not passed (undefined), cells content will be made square (match width minus margin),
     * if pass 0 the CSS will be generated by the application instead.
     * @param update (Optional) if false, styles will not be updated
     *
     * @example
     * grid.cellHeight(100); // same as 100px
     * grid.cellHeight('70px');
     * grid.cellHeight(grid.cellWidth() * 1.2);
     */
    cellHeight(val, update = true) {
        // if not called internally, check if we're changing mode
        if (update && val !== undefined) {
            if (this._isAutoCellHeight !== (val === 'auto')) {
                this._isAutoCellHeight = (val === 'auto');
                this._updateWindowResizeEvent();
            }
        }
        if (val === 'initial' || val === 'auto') {
            val = undefined;
        }
        // make item content be square
        if (val === undefined) {
            let marginDiff = -this.opts.marginRight - this.opts.marginLeft
                + this.opts.marginTop + this.opts.marginBottom;
            val = this.cellWidth() + marginDiff;
        }
        let data = utils_1.Utils.parseHeight(val);
        if (this.opts.cellHeightUnit === data.unit && this.opts.cellHeight === data.h) {
            return this;
        }
        this.opts.cellHeightUnit = data.unit;
        this.opts.cellHeight = data.h;
        if (update) {
            this._updateStyles(true); // true = force re-create for current # of rows
        }
        return this;
    }
    /** Gets current cell width. */
    cellWidth() {
        return this._widthOrContainer() / this.getColumn();
    }
    /** return our expected width (or parent) for 1 column check */
    _widthOrContainer() {
        // use `offsetWidth` or `clientWidth` (no scrollbar) ?
        // https://stackoverflow.com/questions/21064101/understanding-offsetwidth-clientwidth-scrollwidth-and-height-respectively
        return (this.el.clientWidth || this.el.parentElement.clientWidth || window.innerWidth);
    }
    /** re-layout grid items to reclaim any empty space */
    compact() {
        this.engine.compact();
        this._triggerChangeEvent();
        return this;
    }
    /**
     * set the number of columns in the grid. Will update existing widgets to conform to new number of columns,
     * as well as cache the original layout so you can revert back to previous positions without loss.
     * Requires `gridstack-extra.css` or `gridstack-extra.min.css` for [2-11],
     * else you will need to generate correct CSS (see https://github.com/gridstack/gridstack.js#change-grid-columns)
     * @param column - Integer > 0 (default 12).
     * @param layout specify the type of re-layout that will happen (position, size, etc...).
     * Note: items will never be outside of the current column boundaries. default (moveScale). Ignored for 1 column
     */
    column(column, layout = 'moveScale') {
        if (column < 1 || this.opts.column === column)
            return this;
        let oldColumn = this.getColumn();
        // if we go into 1 column mode (which happens if we're sized less than minW unless disableOneColumnMode is on)
        // then remember the original columns so we can restore.
        if (column === 1) {
            this._prevColumn = oldColumn;
        }
        else {
            delete this._prevColumn;
        }
        this.el.classList.remove('grid-stack-' + oldColumn);
        this.el.classList.add('grid-stack-' + column);
        this.opts.column = this.engine.column = column;
        // update the items now - see if the dom order nodes should be passed instead (else default to current list)
        let domNodes;
        if (column === 1 && this.opts.oneColumnModeDomSort) {
            domNodes = [];
            this.getGridItems().forEach(el => {
                if (el.gridstackNode) {
                    domNodes.push(el.gridstackNode);
                }
            });
            if (!domNodes.length) {
                domNodes = undefined;
            }
        }
        this.engine.updateNodeWidths(oldColumn, column, domNodes, layout);
        if (this._isAutoCellHeight)
            this.cellHeight();
        // and trigger our event last...
        this._ignoreLayoutsNodeChange = true; // skip layout update
        this._triggerChangeEvent();
        delete this._ignoreLayoutsNodeChange;
        return this;
    }
    /**
     * get the number of columns in the grid (default 12)
     */
    getColumn() {
        return this.opts.column;
    }
    /** returns an array of grid HTML elements (no placeholder) - used to iterate through our children in DOM order */
    getGridItems() {
        return Array.from(this.el.children)
            .filter((el) => el.matches('.' + this.opts.itemClass) && !el.matches('.' + this.opts.placeholderClass));
    }
    /**
     * Destroys a grid instance. DO NOT CALL any methods or access any vars after this as it will free up members.
     * @param removeDOM if `false` grid and items HTML elements will not be removed from the DOM (Optional. Default `true`).
     */
    destroy(removeDOM = true) {
        if (!this.el)
            return; // prevent multiple calls
        this._updateWindowResizeEvent(true);
        this.setStatic(true, false); // permanently removes DD but don't set CSS class (we're going away)
        this.setAnimation(false);
        if (!removeDOM) {
            this.removeAll(removeDOM);
            this.el.classList.remove(this._styleSheetClass);
        }
        else {
            this.el.parentNode.removeChild(this.el);
        }
        this._removeStylesheet();
        this.el.removeAttribute('gs-current-row');
        if (this.parentGridItem)
            delete this.parentGridItem.subGrid;
        delete this.parentGridItem;
        delete this.opts;
        delete this._placeholder;
        delete this.engine;
        delete this.el.gridstack; // remove circular dependency that would prevent a freeing
        delete this.el;
        return this;
    }
    /**
     * enable/disable floating widgets (default: `false`) See [example](http://gridstackjs.com/demo/float.html)
     */
    float(val) {
        if (this.opts.float !== val) {
            this.opts.float = this.engine.float = val;
            this._triggerChangeEvent();
        }
        return this;
    }
    /**
     * get the current float mode
     */
    getFloat() {
        return this.engine.float;
    }
    /**
     * Get the position of the cell under a pixel on screen.
     * @param position the position of the pixel to resolve in
     * absolute coordinates, as an object with top and left properties
     * @param useDocRelative if true, value will be based on document position vs parent position (Optional. Default false).
     * Useful when grid is within `position: relative` element
     *
     * Returns an object with properties `x` and `y` i.e. the column and row in the grid.
     */
    getCellFromPixel(position, useDocRelative = false) {
        let box = this.el.getBoundingClientRect();
        // console.log(`getBoundingClientRect left: ${box.left} top: ${box.top} w: ${box.w} h: ${box.h}`)
        let containerPos;
        if (useDocRelative) {
            containerPos = { top: box.top + document.documentElement.scrollTop, left: box.left };
            // console.log(`getCellFromPixel scrollTop: ${document.documentElement.scrollTop}`)
        }
        else {
            containerPos = { top: this.el.offsetTop, left: this.el.offsetLeft };
            // console.log(`getCellFromPixel offsetTop: ${containerPos.left} offsetLeft: ${containerPos.top}`)
        }
        let relativeLeft = position.left - containerPos.left;
        let relativeTop = position.top - containerPos.top;
        let columnWidth = (box.width / this.getColumn());
        let rowHeight = (box.height / parseInt(this.el.getAttribute('gs-current-row')));
        return { x: Math.floor(relativeLeft / columnWidth), y: Math.floor(relativeTop / rowHeight) };
    }
    /** returns the current number of rows, which will be at least `minRow` if set */
    getRow() {
        return Math.max(this.engine.getRow(), this.opts.minRow);
    }
    /**
     * Checks if specified area is empty.
     * @param x the position x.
     * @param y the position y.
     * @param w the width of to check
     * @param h the height of to check
     */
    isAreaEmpty(x, y, w, h) {
        return this.engine.isAreaEmpty(x, y, w, h);
    }
    /**
     * If you add elements to your grid by hand, you have to tell gridstack afterwards to make them widgets.
     * If you want gridstack to add the elements for you, use `addWidget()` instead.
     * Makes the given element a widget and returns it.
     * @param els widget or single selector to convert.
     *
     * @example
     * let grid = GridStack.init();
     * grid.el.appendChild('<div id="gsi-1" gs-w="3"></div>');
     * grid.makeWidget('#gsi-1');
     */
    makeWidget(els) {
        let el = GridStack.getElement(els);
        this._prepareElement(el, true);
        this._updateContainerHeight();
        this._triggerAddEvent();
        this._triggerChangeEvent();
        return el;
    }
    /**
     * Event handler that extracts our CustomEvent data out automatically for receiving custom
     * notifications (see doc for supported events)
     * @param name of the event (see possible values) or list of names space separated
     * @param callback function called with event and optional second/third param
     * (see README documentation for each signature).
     *
     * @example
     * grid.on('added', function(e, items) { log('added ', items)} );
     * or
     * grid.on('added removed change', function(e, items) { log(e.type, items)} );
     *
     * Note: in some cases it is the same as calling native handler and parsing the event.
     * grid.el.addEventListener('added', function(event) { log('added ', event.detail)} );
     *
     */
    on(name, callback) {
        // check for array of names being passed instead
        if (name.indexOf(' ') !== -1) {
            let names = name.split(' ');
            names.forEach(name => this.on(name, callback));
            return this;
        }
        if (name === 'change' || name === 'added' || name === 'removed' || name === 'enable' || name === 'disable') {
            // native CustomEvent handlers - cash the generic handlers so we can easily remove
            let noData = (name === 'enable' || name === 'disable');
            if (noData) {
                this._gsEventHandler[name] = (event) => callback(event);
            }
            else {
                this._gsEventHandler[name] = (event) => callback(event, event.detail);
            }
            this.el.addEventListener(name, this._gsEventHandler[name]);
        }
        else if (name === 'drag' || name === 'dragstart' || name === 'dragstop' || name === 'resizestart' || name === 'resize' || name === 'resizestop' || name === 'dropped') {
            // drag&drop stop events NEED to be call them AFTER we update node attributes so handle them ourself.
            // do same for start event to make it easier...
            this._gsEventHandler[name] = callback;
        }
        else {
            console.log('GridStack.on(' + name + ') event not supported, but you can still use $(".grid-stack").on(...) while jquery-ui is still used internally.');
        }
        return this;
    }
    /**
     * unsubscribe from the 'on' event below
     * @param name of the event (see possible values)
     */
    off(name) {
        // check for array of names being passed instead
        if (name.indexOf(' ') !== -1) {
            let names = name.split(' ');
            names.forEach(name => this.off(name));
            return this;
        }
        if (name === 'change' || name === 'added' || name === 'removed' || name === 'enable' || name === 'disable') {
            // remove native CustomEvent handlers
            if (this._gsEventHandler[name]) {
                this.el.removeEventListener(name, this._gsEventHandler[name]);
            }
        }
        delete this._gsEventHandler[name];
        return this;
    }
    /**
     * Removes widget from the grid.
     * @param el  widget or selector to modify
     * @param removeDOM if `false` DOM element won't be removed from the tree (Default? true).
     * @param triggerEvent if `false` (quiet mode) element will not be added to removed list and no 'removed' callbacks will be called (Default? true).
     */
    removeWidget(els, removeDOM = true, triggerEvent = true) {
        GridStack.getElements(els).forEach(el => {
            if (el.parentElement && el.parentElement !== this.el)
                return; // not our child!
            let node = el.gridstackNode;
            // For Meteor support: https://github.com/gridstack/gridstack.js/pull/272
            if (!node) {
                node = this.engine.nodes.find(n => el === n.el);
            }
            if (!node)
                return;
            // remove our DOM data (circular link) and drag&drop permanently
            delete el.gridstackNode;
            this._removeDD(el);
            this.engine.removeNode(node, removeDOM, triggerEvent);
            if (removeDOM && el.parentElement) {
                el.remove(); // in batch mode engine.removeNode doesn't call back to remove DOM
            }
        });
        if (triggerEvent) {
            this._triggerRemoveEvent();
            this._triggerChangeEvent();
        }
        return this;
    }
    /**
     * Removes all widgets from the grid.
     * @param removeDOM if `false` DOM elements won't be removed from the tree (Default? `true`).
     */
    removeAll(removeDOM = true) {
        // always remove our DOM data (circular link) before list gets emptied and drag&drop permanently
        this.engine.nodes.forEach(n => {
            delete n.el.gridstackNode;
            this._removeDD(n.el);
        });
        this.engine.removeAll(removeDOM);
        this._triggerRemoveEvent();
        return this;
    }
    /**
     * Toggle the grid animation state.  Toggles the `grid-stack-animate` class.
     * @param doAnimate if true the grid will animate.
     */
    setAnimation(doAnimate) {
        if (doAnimate) {
            this.el.classList.add('grid-stack-animate');
        }
        else {
            this.el.classList.remove('grid-stack-animate');
        }
        return this;
    }
    /**
     * Toggle the grid static state, which permanently removes/add Drag&Drop support, unlike disable()/enable() that just turns it off/on.
     * Also toggle the grid-stack-static class.
     * @param val if true the grid become static.
     * @param updateClass true (default) if css class gets updated
     * @param recurse true (default) if sub-grids also get updated
     */
    setStatic(val, updateClass = true, recurse = true) {
        if (this.opts.staticGrid === val)
            return this;
        this.opts.staticGrid = val;
        this._setupRemoveDrop();
        this._setupAcceptWidget();
        this.engine.nodes.forEach(n => {
            this._prepareDragDropByNode(n); // either delete or init Drag&drop
            if (n.subGrid && recurse)
                n.subGrid.setStatic(val, updateClass, recurse);
        });
        if (updateClass) {
            this._setStaticClass();
        }
        return this;
    }
    /**
     * Updates widget position/size and other info. Note: if you need to call this on all nodes, use load() instead which will update what changed.
     * @param els  widget or selector of objects to modify (note: setting the same x,y for multiple items will be indeterministic and likely unwanted)
     * @param opt new widget options (x,y,w,h, etc..). Only those set will be updated.
     */
    update(els, opt) {
        // support legacy call for now ?
        if (arguments.length > 2) {
            console.warn('gridstack.ts: `update(el, x, y, w, h)` is deprecated. Use `update(el, {x, w, content, ...})`. It will be removed soon');
            // eslint-disable-next-line prefer-rest-params
            let a = arguments, i = 1;
            opt = { x: a[i++], y: a[i++], w: a[i++], h: a[i++] };
            return this.update(els, opt);
        }
        GridStack.getElements(els).forEach(el => {
            if (!el || !el.gridstackNode)
                return;
            let n = el.gridstackNode;
            let w = utils_1.Utils.cloneDeep(opt); // make a copy we can modify in case they re-use it or multiple items
            delete w.autoPosition;
            // move/resize widget if anything changed
            let keys = ['x', 'y', 'w', 'h'];
            let m;
            if (keys.some(k => w[k] !== undefined && w[k] !== n[k])) {
                m = {};
                keys.forEach(k => {
                    m[k] = (w[k] !== undefined) ? w[k] : n[k];
                    delete w[k];
                });
            }
            // for a move as well IFF there is any min/max fields set
            if (!m && (w.minW || w.minH || w.maxW || w.maxH)) {
                m = {}; // will use node position but validate values
            }
            // check for content changing
            if (w.content) {
                let sub = el.querySelector('.grid-stack-item-content');
                if (sub && sub.innerHTML !== w.content) {
                    sub.innerHTML = w.content;
                }
                delete w.content;
            }
            // any remaining fields are assigned, but check for dragging changes, resize constrain
            let changed = false;
            let ddChanged = false;
            for (const key in w) {
                if (key[0] !== '_' && n[key] !== w[key]) {
                    n[key] = w[key];
                    changed = true;
                    ddChanged = ddChanged || (!this.opts.staticGrid && (key === 'noResize' || key === 'noMove' || key === 'locked'));
                }
            }
            // finally move the widget
            if (m) {
                this.engine.cleanNodes()
                    .beginUpdate(n)
                    .moveNode(n, m);
                this._updateContainerHeight();
                this._triggerChangeEvent();
                this.engine.endUpdate();
            }
            if (changed) { // move will only update x,y,w,h so update the rest too
                this._writeAttr(el, n);
            }
            if (ddChanged) {
                this._prepareDragDropByNode(n);
            }
        });
        return this;
    }
    /**
     * Updates the margins which will set all 4 sides at once - see `GridStackOptions.margin` for format options (CSS string format of 1,2,4 values or single number).
     * @param value margin value
     */
    margin(value) {
        let isMultiValue = (typeof value === 'string' && value.split(' ').length > 1);
        // check if we can skip re-creating our CSS file... won't check if multi values (too much hassle)
        if (!isMultiValue) {
            let data = utils_1.Utils.parseHeight(value);
            if (this.opts.marginUnit === data.unit && this.opts.margin === data.h)
                return;
        }
        // re-use existing margin handling
        this.opts.margin = value;
        this.opts.marginTop = this.opts.marginBottom = this.opts.marginLeft = this.opts.marginRight = undefined;
        this._initMargin();
        this._updateStyles(true); // true = force re-create
        return this;
    }
    /** returns current margin number value (undefined if 4 sides don't match) */
    getMargin() { return this.opts.margin; }
    /**
     * Returns true if the height of the grid will be less than the vertical
     * constraint. Always returns true if grid doesn't have height constraint.
     * @param node contains x,y,w,h,auto-position options
     *
     * @example
     * if (grid.willItFit(newWidget)) {
     *   grid.addWidget(newWidget);
     * } else {
     *   alert('Not enough free space to place the widget');
     * }
     */
    willItFit(node) {
        // support legacy call for now
        if (arguments.length > 1) {
            console.warn('gridstack.ts: `willItFit(x,y,w,h,autoPosition)` is deprecated. Use `willItFit({x, y,...})`. It will be removed soon');
            // eslint-disable-next-line prefer-rest-params
            let a = arguments, i = 0, w = { x: a[i++], y: a[i++], w: a[i++], h: a[i++], autoPosition: a[i++] };
            return this.willItFit(w);
        }
        return this.engine.willItFit(node);
    }
    /** @internal */
    _triggerChangeEvent() {
        if (this.engine.batchMode)
            return this;
        let elements = this.engine.getDirtyNodes(true); // verify they really changed
        if (elements && elements.length) {
            if (!this._ignoreLayoutsNodeChange) {
                this.engine.layoutsNodesChange(elements);
            }
            this._triggerEvent('change', elements);
        }
        this.engine.saveInitial(); // we called, now reset initial values & dirty flags
        return this;
    }
    /** @internal */
    _triggerAddEvent() {
        if (this.engine.batchMode)
            return this;
        if (this.engine.addedNodes && this.engine.addedNodes.length > 0) {
            if (!this._ignoreLayoutsNodeChange) {
                this.engine.layoutsNodesChange(this.engine.addedNodes);
            }
            // prevent added nodes from also triggering 'change' event (which is called next)
            this.engine.addedNodes.forEach(n => { delete n._dirty; });
            this._triggerEvent('added', this.engine.addedNodes);
            this.engine.addedNodes = [];
        }
        return this;
    }
    /** @internal */
    _triggerRemoveEvent() {
        if (this.engine.batchMode)
            return this;
        if (this.engine.removedNodes && this.engine.removedNodes.length > 0) {
            this._triggerEvent('removed', this.engine.removedNodes);
            this.engine.removedNodes = [];
        }
        return this;
    }
    /** @internal */
    _triggerEvent(type, data) {
        let event = data ? new CustomEvent(type, { bubbles: false, detail: data }) : new Event(type);
        this.el.dispatchEvent(event);
        return this;
    }
    /** @internal called to delete the current dynamic style sheet used for our layout */
    _removeStylesheet() {
        if (this._styles) {
            utils_1.Utils.removeStylesheet(this._styleSheetClass);
            delete this._styles;
        }
        return this;
    }
    /** @internal updated/create the CSS styles for row based layout and initial margin setting */
    _updateStyles(forceUpdate = false, maxH) {
        // call to delete existing one if we change cellHeight / margin
        if (forceUpdate) {
            this._removeStylesheet();
        }
        if (!maxH)
            maxH = this.getRow();
        this._updateContainerHeight();
        // if user is telling us they will handle the CSS themselves by setting heights to 0. Do we need this opts really ??
        if (this.opts.cellHeight === 0) {
            return this;
        }
        let cellHeight = this.opts.cellHeight;
        let cellHeightUnit = this.opts.cellHeightUnit;
        let prefix = `.${this._styleSheetClass} > .${this.opts.itemClass}`;
        // create one as needed
        if (!this._styles) {
            // insert style to parent (instead of 'head' by default) to support WebComponent
            let styleLocation = this.opts.styleInHead ? undefined : this.el.parentNode;
            this._styles = utils_1.Utils.createStylesheet(this._styleSheetClass, styleLocation, {
                nonce: this.opts.nonce,
            });
            if (!this._styles)
                return this;
            this._styles._max = 0;
            // these are done once only
            utils_1.Utils.addCSSRule(this._styles, prefix, `min-height: ${cellHeight}${cellHeightUnit}`);
            // content margins
            let top = this.opts.marginTop + this.opts.marginUnit;
            let bottom = this.opts.marginBottom + this.opts.marginUnit;
            let right = this.opts.marginRight + this.opts.marginUnit;
            let left = this.opts.marginLeft + this.opts.marginUnit;
            let content = `${prefix} > .grid-stack-item-content`;
            let placeholder = `.${this._styleSheetClass} > .grid-stack-placeholder > .placeholder-content`;
            utils_1.Utils.addCSSRule(this._styles, content, `top: ${top}; right: ${right}; bottom: ${bottom}; left: ${left};`);
            utils_1.Utils.addCSSRule(this._styles, placeholder, `top: ${top}; right: ${right}; bottom: ${bottom}; left: ${left};`);
            // resize handles offset (to match margin)
            utils_1.Utils.addCSSRule(this._styles, `${prefix} > .ui-resizable-ne`, `right: ${right}`);
            utils_1.Utils.addCSSRule(this._styles, `${prefix} > .ui-resizable-e`, `right: ${right}`);
            utils_1.Utils.addCSSRule(this._styles, `${prefix} > .ui-resizable-se`, `right: ${right}; bottom: ${bottom}`);
            utils_1.Utils.addCSSRule(this._styles, `${prefix} > .ui-resizable-nw`, `left: ${left}`);
            utils_1.Utils.addCSSRule(this._styles, `${prefix} > .ui-resizable-w`, `left: ${left}`);
            utils_1.Utils.addCSSRule(this._styles, `${prefix} > .ui-resizable-sw`, `left: ${left}; bottom: ${bottom}`);
        }
        // now update the height specific fields
        maxH = maxH || this._styles._max;
        if (maxH > this._styles._max) {
            let getHeight = (rows) => (cellHeight * rows) + cellHeightUnit;
            for (let i = this._styles._max + 1; i <= maxH; i++) { // start at 1
                let h = getHeight(i);
                utils_1.Utils.addCSSRule(this._styles, `${prefix}[gs-y="${i - 1}"]`, `top: ${getHeight(i - 1)}`); // start at 0
                utils_1.Utils.addCSSRule(this._styles, `${prefix}[gs-h="${i}"]`, `height: ${h}`);
                utils_1.Utils.addCSSRule(this._styles, `${prefix}[gs-min-h="${i}"]`, `min-height: ${h}`);
                utils_1.Utils.addCSSRule(this._styles, `${prefix}[gs-max-h="${i}"]`, `max-height: ${h}`);
            }
            this._styles._max = maxH;
        }
        return this;
    }
    /** @internal */
    _updateContainerHeight() {
        if (!this.engine || this.engine.batchMode)
            return this;
        let row = this.getRow() + this._extraDragRow; // checks for minRow already
        // check for css min height
        // Note: we don't handle %,rem correctly so comment out, beside we don't need need to create un-necessary
        // rows as the CSS will make us bigger than our set height if needed... not sure why we had this.
        // let cssMinHeight = parseInt(getComputedStyle(this.el)['min-height']);
        // if (cssMinHeight > 0) {
        //   let minRow = Math.round(cssMinHeight / this.getCellHeight(true));
        //   if (row < minRow) {
        //     row = minRow;
        //   }
        // }
        this.el.setAttribute('gs-current-row', String(row));
        if (row === 0) {
            this.el.style.removeProperty('min-height');
            return this;
        }
        let cellHeight = this.opts.cellHeight;
        let unit = this.opts.cellHeightUnit;
        if (!cellHeight)
            return this;
        this.el.style.minHeight = row * cellHeight + unit;
        return this;
    }
    /** @internal */
    _prepareElement(el, triggerAddEvent = false, node) {
        el.classList.add(this.opts.itemClass);
        node = node || this._readAttr(el);
        el.gridstackNode = node;
        node.el = el;
        node.grid = this;
        let copy = Object.assign({}, node);
        node = this.engine.addNode(node, triggerAddEvent);
        // write node attr back in case there was collision or we have to fix bad values during addNode()
        if (!utils_1.Utils.same(node, copy)) {
            this._writeAttr(el, node);
        }
        this._prepareDragDropByNode(node);
        return this;
    }
    /** @internal call to write position x,y,w,h attributes back to element */
    _writePosAttr(el, n) {
        if (n.x !== undefined && n.x !== null) {
            el.setAttribute('gs-x', String(n.x));
        }
        if (n.y !== undefined && n.y !== null) {
            el.setAttribute('gs-y', String(n.y));
        }
        if (n.w) {
            el.setAttribute('gs-w', String(n.w));
        }
        if (n.h) {
            el.setAttribute('gs-h', String(n.h));
        }
        return this;
    }
    /** @internal call to write any default attributes back to element */
    _writeAttr(el, node) {
        if (!node)
            return this;
        this._writePosAttr(el, node);
        let attrs /*: GridStackWidget but strings */ = {
            autoPosition: 'gs-auto-position',
            minW: 'gs-min-w',
            minH: 'gs-min-h',
            maxW: 'gs-max-w',
            maxH: 'gs-max-h',
            noResize: 'gs-no-resize',
            noMove: 'gs-no-move',
            locked: 'gs-locked',
            id: 'gs-id',
        };
        for (const key in attrs) {
            if (node[key]) { // 0 is valid for x,y only but done above already and not in list anyway
                el.setAttribute(attrs[key], String(node[key]));
            }
            else {
                el.removeAttribute(attrs[key]);
            }
        }
        return this;
    }
    /** @internal call to read any default attributes from element */
    _readAttr(el) {
        let node = {};
        node.x = utils_1.Utils.toNumber(el.getAttribute('gs-x'));
        node.y = utils_1.Utils.toNumber(el.getAttribute('gs-y'));
        node.w = utils_1.Utils.toNumber(el.getAttribute('gs-w'));
        node.h = utils_1.Utils.toNumber(el.getAttribute('gs-h'));
        node.maxW = utils_1.Utils.toNumber(el.getAttribute('gs-max-w'));
        node.minW = utils_1.Utils.toNumber(el.getAttribute('gs-min-w'));
        node.maxH = utils_1.Utils.toNumber(el.getAttribute('gs-max-h'));
        node.minH = utils_1.Utils.toNumber(el.getAttribute('gs-min-h'));
        node.autoPosition = utils_1.Utils.toBool(el.getAttribute('gs-auto-position'));
        node.noResize = utils_1.Utils.toBool(el.getAttribute('gs-no-resize'));
        node.noMove = utils_1.Utils.toBool(el.getAttribute('gs-no-move'));
        node.locked = utils_1.Utils.toBool(el.getAttribute('gs-locked'));
        node.id = el.getAttribute('gs-id');
        // remove any key not found (null or false which is default)
        for (const key in node) {
            if (!node.hasOwnProperty(key))
                return;
            if (!node[key] && node[key] !== 0) { // 0 can be valid value (x,y only really)
                delete node[key];
            }
        }
        return node;
    }
    /** @internal */
    _setStaticClass() {
        let classes = ['grid-stack-static'];
        if (this.opts.staticGrid) {
            this.el.classList.add(...classes);
            this.el.setAttribute('gs-static', 'true');
        }
        else {
            this.el.classList.remove(...classes);
            this.el.removeAttribute('gs-static');
        }
        return this;
    }
    /**
     * called when we are being resized by the window - check if the one Column Mode needs to be turned on/off
     * and remember the prev columns we used, or get our count from parent, as well as check for auto cell height (square)
     */
    onParentResize() {
        if (!this.el || !this.el.clientWidth)
            return; // return if we're gone or no size yet (will get called again)
        let changedColumn = false;
        // see if we're nested and take our column count from our parent....
        if (this._autoColumn && this.parentGridItem) {
            if (this.opts.column !== this.parentGridItem.w) {
                changedColumn = true;
                this.column(this.parentGridItem.w, 'none');
            }
        }
        else {
            // else check for 1 column in/out behavior
            let oneColumn = !this.opts.disableOneColumnMode && this.el.clientWidth <= this.opts.oneColumnSize;
            if ((this.opts.column === 1) !== oneColumn) {
                changedColumn = true;
                if (this.opts.animate) {
                    this.setAnimation(false);
                } // 1 <-> 12 is too radical, turn off animation
                this.column(oneColumn ? 1 : this._prevColumn);
                if (this.opts.animate) {
                    this.setAnimation(true);
                }
            }
        }
        // make the cells content square again
        if (this._isAutoCellHeight) {
            if (!changedColumn && this.opts.cellHeightThrottle) {
                if (!this._cellHeightThrottle) {
                    this._cellHeightThrottle = utils_1.Utils.throttle(() => this.cellHeight(), this.opts.cellHeightThrottle);
                }
                this._cellHeightThrottle();
            }
            else {
                // immediate update if we've changed column count or have no threshold
                this.cellHeight();
            }
        }
        // finally update any nested grids
        this.engine.nodes.forEach(n => {
            if (n.subGrid) {
                n.subGrid.onParentResize();
            }
        });
        return this;
    }
    /** add or remove the window size event handler */
    _updateWindowResizeEvent(forceRemove = false) {
        // only add event if we're not nested (parent will call us) and we're auto sizing cells or supporting oneColumn (i.e. doing work)
        const workTodo = (this._isAutoCellHeight || !this.opts.disableOneColumnMode) && !this.parentGridItem;
        if (!forceRemove && workTodo && !this._windowResizeBind) {
            this._windowResizeBind = this.onParentResize.bind(this); // so we can properly remove later
            window.addEventListener('resize', this._windowResizeBind);
        }
        else if ((forceRemove || !workTodo) && this._windowResizeBind) {
            window.removeEventListener('resize', this._windowResizeBind);
            delete this._windowResizeBind; // remove link to us so we can free
        }
        return this;
    }
    /** @internal convert a potential selector into actual element */
    static getElement(els = '.grid-stack-item') { return utils_1.Utils.getElement(els); }
    /** @internal */
    static getElements(els = '.grid-stack-item') { return utils_1.Utils.getElements(els); }
    /** @internal */
    static getGridElement(els) { return GridStack.getElement(els); }
    /** @internal */
    static getGridElements(els) { return utils_1.Utils.getElements(els); }
    /** @internal initialize margin top/bottom/left/right and units */
    _initMargin() {
        let data;
        let margin = 0;
        // support passing multiple values like CSS (ex: '5px 10px 0 20px')
        let margins = [];
        if (typeof this.opts.margin === 'string') {
            margins = this.opts.margin.split(' ');
        }
        if (margins.length === 2) { // top/bot, left/right like CSS
            this.opts.marginTop = this.opts.marginBottom = margins[0];
            this.opts.marginLeft = this.opts.marginRight = margins[1];
        }
        else if (margins.length === 4) { // Clockwise like CSS
            this.opts.marginTop = margins[0];
            this.opts.marginRight = margins[1];
            this.opts.marginBottom = margins[2];
            this.opts.marginLeft = margins[3];
        }
        else {
            data = utils_1.Utils.parseHeight(this.opts.margin);
            this.opts.marginUnit = data.unit;
            margin = this.opts.margin = data.h;
        }
        // see if top/bottom/left/right need to be set as well
        if (this.opts.marginTop === undefined) {
            this.opts.marginTop = margin;
        }
        else {
            data = utils_1.Utils.parseHeight(this.opts.marginTop);
            this.opts.marginTop = data.h;
            delete this.opts.margin;
        }
        if (this.opts.marginBottom === undefined) {
            this.opts.marginBottom = margin;
        }
        else {
            data = utils_1.Utils.parseHeight(this.opts.marginBottom);
            this.opts.marginBottom = data.h;
            delete this.opts.margin;
        }
        if (this.opts.marginRight === undefined) {
            this.opts.marginRight = margin;
        }
        else {
            data = utils_1.Utils.parseHeight(this.opts.marginRight);
            this.opts.marginRight = data.h;
            delete this.opts.margin;
        }
        if (this.opts.marginLeft === undefined) {
            this.opts.marginLeft = margin;
        }
        else {
            data = utils_1.Utils.parseHeight(this.opts.marginLeft);
            this.opts.marginLeft = data.h;
            delete this.opts.margin;
        }
        this.opts.marginUnit = data.unit; // in case side were spelled out, use those units instead...
        if (this.opts.marginTop === this.opts.marginBottom && this.opts.marginLeft === this.opts.marginRight && this.opts.marginTop === this.opts.marginRight) {
            this.opts.margin = this.opts.marginTop; // makes it easier to check for no-ops in setMargin()
        }
        return this;
    }
    /* ===========================================================================================
     * drag&drop methods that used to be stubbed out and implemented in dd-gridstack.ts
     * but caused loading issues in prod - see https://github.com/gridstack/gridstack.js/issues/2039
     * ===========================================================================================
     */
    /** get the global (but static to this code) DD implementation */
    static getDD() {
        return dd;
    }
    /**
     * call to setup dragging in from the outside (say toolbar), by specifying the class selection and options.
     * Called during GridStack.init() as options, but can also be called directly (last param are used) in case the toolbar
     * is dynamically create and needs to be set later.
     * @param dragIn string selector (ex: '.sidebar .grid-stack-item')
     * @param dragInOptions options - see DDDragInOpt. (default: {handle: '.grid-stack-item-content', appendTo: 'body'}
     **/
    static setupDragIn(dragIn, dragInOptions) {
        if ((dragInOptions === null || dragInOptions === void 0 ? void 0 : dragInOptions.pause) !== undefined) {
            dd_manager_1.DDManager.pauseDrag = dragInOptions.pause;
        }
        if (typeof dragIn === 'string') {
            dragInOptions = Object.assign(Object.assign({}, types_1.dragInDefaultOptions), (dragInOptions || {}));
            utils_1.Utils.getElements(dragIn).forEach(el => {
                if (!dd.isDraggable(el))
                    dd.dragIn(el, dragInOptions);
            });
        }
    }
    /**
     * Enables/Disables dragging by the user of specific grid element. If you want all items, and have it affect future items, use enableMove() instead. No-op for static grids.
     * IF you are looking to prevent an item from moving (due to being pushed around by another during collision) use locked property instead.
     * @param els widget or selector to modify.
     * @param val if true widget will be draggable.
     */
    movable(els, val) {
        if (this.opts.staticGrid)
            return this; // can't move a static grid!
        GridStack.getElements(els).forEach(el => {
            let node = el.gridstackNode;
            if (!node)
                return;
            if (val)
                delete node.noMove;
            else
                node.noMove = true;
            this._prepareDragDropByNode(node); // init DD if need be, and adjust
        });
        return this;
    }
    /**
     * Enables/Disables user resizing of specific grid element. If you want all items, and have it affect future items, use enableResize() instead. No-op for static grids.
     * @param els  widget or selector to modify
     * @param val  if true widget will be resizable.
     */
    resizable(els, val) {
        if (this.opts.staticGrid)
            return this; // can't resize a static grid!
        GridStack.getElements(els).forEach(el => {
            let node = el.gridstackNode;
            if (!node)
                return;
            if (val)
                delete node.noResize;
            else
                node.noResize = true;
            this._prepareDragDropByNode(node); // init DD if need be, and adjust
        });
        return this;
    }
    /**
     * Temporarily disables widgets moving/resizing.
     * If you want a more permanent way (which freezes up resources) use `setStatic(true)` instead.
     * Note: no-op for static grid
     * This is a shortcut for:
     * @example
     *  grid.enableMove(false);
     *  grid.enableResize(false);
     * @param recurse true (default) if sub-grids also get updated
     */
    disable(recurse = true) {
        if (this.opts.staticGrid)
            return;
        this.enableMove(false, recurse);
        this.enableResize(false, recurse); // @ts-ignore
        this._triggerEvent('disable');
        return this;
    }
    /**
     * Re-enables widgets moving/resizing - see disable().
     * Note: no-op for static grid.
     * This is a shortcut for:
     * @example
     *  grid.enableMove(true);
     *  grid.enableResize(true);
     * @param recurse true (default) if sub-grids also get updated
     */
    enable(recurse = true) {
        if (this.opts.staticGrid)
            return;
        this.enableMove(true, recurse);
        this.enableResize(true, recurse); // @ts-ignore
        this._triggerEvent('enable');
        return this;
    }
    /**
     * Enables/disables widget moving. No-op for static grids.
     * @param recurse true (default) if sub-grids also get updated
     */
    enableMove(doEnable, recurse = true) {
        if (this.opts.staticGrid)
            return this; // can't move a static grid!
        this.opts.disableDrag = !doEnable; // FIRST before we update children as grid overrides #1658
        this.engine.nodes.forEach(n => {
            this.movable(n.el, doEnable);
            if (n.subGrid && recurse)
                n.subGrid.enableMove(doEnable, recurse);
        });
        return this;
    }
    /**
     * Enables/disables widget resizing. No-op for static grids.
     * @param recurse true (default) if sub-grids also get updated
     */
    enableResize(doEnable, recurse = true) {
        if (this.opts.staticGrid)
            return this; // can't size a static grid!
        this.opts.disableResize = !doEnable; // FIRST before we update children as grid overrides #1658
        this.engine.nodes.forEach(n => {
            this.resizable(n.el, doEnable);
            if (n.subGrid && recurse)
                n.subGrid.enableResize(doEnable, recurse);
        });
        return this;
    }
    /** @internal removes any drag&drop present (called during destroy) */
    _removeDD(el) {
        dd.draggable(el, 'destroy').resizable(el, 'destroy');
        if (el.gridstackNode) {
            delete el.gridstackNode._initDD; // reset our DD init flag
        }
        delete el.ddElement;
        return this;
    }
    /** @internal called to add drag over to support widgets being added externally */
    _setupAcceptWidget() {
        // check if we need to disable things
        if (this.opts.staticGrid || (!this.opts.acceptWidgets && !this.opts.removable)) {
            dd.droppable(this.el, 'destroy');
            return this;
        }
        // vars shared across all methods
        let cellHeight, cellWidth;
        let onDrag = (event, el, helper) => {
            let node = el.gridstackNode;
            if (!node)
                return;
            helper = helper || el;
            let parent = this.el.getBoundingClientRect();
            let { top, left } = helper.getBoundingClientRect();
            left -= parent.left;
            top -= parent.top;
            let ui = { position: { top, left } };
            if (node._temporaryRemoved) {
                node.x = Math.max(0, Math.round(left / cellWidth));
                node.y = Math.max(0, Math.round(top / cellHeight));
                delete node.autoPosition;
                this.engine.nodeBoundFix(node);
                // don't accept *initial* location if doesn't fit #1419 (locked drop region, or can't grow), but maybe try if it will go somewhere
                if (!this.engine.willItFit(node)) {
                    node.autoPosition = true; // ignore x,y and try for any slot...
                    if (!this.engine.willItFit(node)) {
                        dd.off(el, 'drag'); // stop calling us
                        return; // full grid or can't grow
                    }
                    if (node._willFitPos) {
                        // use the auto position instead #1687
                        utils_1.Utils.copyPos(node, node._willFitPos);
                        delete node._willFitPos;
                    }
                }
                // re-use the existing node dragging method
                this._onStartMoving(helper, event, ui, node, cellWidth, cellHeight);
            }
            else {
                // re-use the existing node dragging that does so much of the collision detection
                this._dragOrResize(helper, event, ui, node, cellWidth, cellHeight);
            }
        };
        dd.droppable(this.el, {
            accept: (el) => {
                let node = el.gridstackNode;
                // set accept drop to true on ourself (which we ignore) so we don't get "can't drop" icon in HTML5 mode while moving
                if ((node === null || node === void 0 ? void 0 : node.grid) === this)
                    return true;
                if (!this.opts.acceptWidgets)
                    return false;
                // check for accept method or class matching
                let canAccept = true;
                if (typeof this.opts.acceptWidgets === 'function') {
                    canAccept = this.opts.acceptWidgets(el);
                }
                else {
                    let selector = (this.opts.acceptWidgets === true ? '.grid-stack-item' : this.opts.acceptWidgets);
                    canAccept = el.matches(selector);
                }
                // finally check to make sure we actually have space left #1571
                if (canAccept && node && this.opts.maxRow) {
                    let n = { w: node.w, h: node.h, minW: node.minW, minH: node.minH }; // only width/height matters and autoPosition
                    canAccept = this.engine.willItFit(n);
                }
                return canAccept;
            }
        })
            /**
             * entering our grid area
             */
            .on(this.el, 'dropover', (event, el, helper) => {
            // console.log(`over ${this.el.gridstack.opts.id} ${count++}`); // TEST
            let node = el.gridstackNode;
            // ignore drop enter on ourself (unless we temporarily removed) which happens on a simple drag of our item
            if ((node === null || node === void 0 ? void 0 : node.grid) === this && !node._temporaryRemoved) {
                // delete node._added; // reset this to track placeholder again in case we were over other grid #1484 (dropout doesn't always clear)
                return false; // prevent parent from receiving msg (which may be a grid as well)
            }
            // fix #1578 when dragging fast, we may not get a leave on the previous grid so force one now
            if ((node === null || node === void 0 ? void 0 : node.grid) && node.grid !== this && !node._temporaryRemoved) {
                // console.log('dropover without leave'); // TEST
                let otherGrid = node.grid;
                otherGrid._leave(el, helper);
            }
            // cache cell dimensions (which don't change), position can animate if we removed an item in otherGrid that affects us...
            cellWidth = this.cellWidth();
            cellHeight = this.getCellHeight(true);
            // load any element attributes if we don't have a node
            if (!node) { // @ts-ignore private read only on ourself
                node = this._readAttr(el);
            }
            if (!node.grid) {
                node._isExternal = true;
                el.gridstackNode = node;
            }
            // calculate the grid size based on element outer size
            helper = helper || el;
            let w = node.w || Math.round(helper.offsetWidth / cellWidth) || 1;
            let h = node.h || Math.round(helper.offsetHeight / cellHeight) || 1;
            // if the item came from another grid, make a copy and save the original info in case we go back there
            if (node.grid && node.grid !== this) {
                // copy the node original values (min/max/id/etc...) but override width/height/other flags which are this grid specific
                // console.log('dropover cloning node'); // TEST
                if (!el._gridstackNodeOrig)
                    el._gridstackNodeOrig = node; // shouldn't have multiple nested!
                el.gridstackNode = node = Object.assign(Object.assign({}, node), { w, h, grid: this });
                this.engine.cleanupNode(node)
                    .nodeBoundFix(node);
                // restore some internal fields we need after clearing them all
                node._initDD =
                    node._isExternal = // DOM needs to be re-parented on a drop
                        node._temporaryRemoved = true; // so it can be inserted onDrag below
            }
            else {
                node.w = w;
                node.h = h;
                node._temporaryRemoved = true; // so we can insert it
            }
            // clear any marked for complete removal (Note: don't check _isAboutToRemove as that is cleared above - just do it)
            this._itemRemoving(node.el, false);
            dd.on(el, 'drag', onDrag);
            // make sure this is called at least once when going fast #1578
            onDrag(event, el, helper);
            return false; // prevent parent from receiving msg (which may be a grid as well)
        })
            /**
             * Leaving our grid area...
             */
            .on(this.el, 'dropout', (event, el, helper) => {
            // console.log(`out ${this.el.gridstack.opts.id} ${count++}`); // TEST
            let node = el.gridstackNode;
            if (!node)
                return false;
            // fix #1578 when dragging fast, we might get leave after other grid gets enter (which calls us to clean)
            // so skip this one if we're not the active grid really..
            if (!node.grid || node.grid === this) {
                this._leave(el, helper);
                // if we were created as temporary nested grid, go back to before state
                if (this._isTemp) {
                    this.removeAsSubGrid(node);
                }
            }
            return false; // prevent parent from receiving msg (which may be grid as well)
        })
            /**
             * end - releasing the mouse
             */
            .on(this.el, 'drop', (event, el, helper) => {
            var _a, _b;
            let node = el.gridstackNode;
            // ignore drop on ourself from ourself that didn't come from the outside - dragend will handle the simple move instead
            if ((node === null || node === void 0 ? void 0 : node.grid) === this && !node._isExternal)
                return false;
            let wasAdded = !!this.placeholder.parentElement; // skip items not actually added to us because of constrains, but do cleanup #1419
            this.placeholder.remove();
            // notify previous grid of removal
            // console.log('drop delete _gridstackNodeOrig') // TEST
            let origNode = el._gridstackNodeOrig;
            delete el._gridstackNodeOrig;
            if (wasAdded && (origNode === null || origNode === void 0 ? void 0 : origNode.grid) && origNode.grid !== this) {
                let oGrid = origNode.grid;
                oGrid.engine.removedNodes.push(origNode);
                oGrid._triggerRemoveEvent()._triggerChangeEvent();
                // if it's an empty sub-grid that got auto-created, nuke it
                if (oGrid.parentGridItem && !oGrid.engine.nodes.length && oGrid.opts.subGridDynamic) {
                    oGrid.removeAsSubGrid();
                }
            }
            if (!node)
                return false;
            // use existing placeholder node as it's already in our list with drop location
            if (wasAdded) {
                this.engine.cleanupNode(node); // removes all internal _xyz values
                node.grid = this;
            }
            dd.off(el, 'drag');
            // if we made a copy ('helper' which is temp) of the original node then insert a copy, else we move the original node (#1102)
            // as the helper will be nuked by jquery-ui otherwise. TODO: update old code path
            if (helper !== el) {
                helper.remove();
                el.gridstackNode = origNode; // original item (left behind) is re-stored to pre dragging as the node now has drop info
                if (wasAdded) {
                    el = el.cloneNode(true);
                }
            }
            else {
                el.remove(); // reduce flicker as we change depth here, and size further down
                this._removeDD(el);
            }
            if (!wasAdded)
                return false;
            el.gridstackNode = node;
            node.el = el;
            let subGrid = (_b = (_a = node.subGrid) === null || _a === void 0 ? void 0 : _a.el) === null || _b === void 0 ? void 0 : _b.gridstack; // set when actual sub-grid present
            // @ts-ignore
            utils_1.Utils.copyPos(node, this._readAttr(this.placeholder)); // placeholder values as moving VERY fast can throw things off #1578
            utils_1.Utils.removePositioningStyles(el); // @ts-ignore
            this._writeAttr(el, node);
            el.classList.add(types_1.gridDefaults.itemClass, this.opts.itemClass);
            this.el.appendChild(el); // @ts-ignore // TODO: now would be ideal time to _removeHelperStyle() overriding floating styles (native only)
            if (subGrid) {
                subGrid.parentGridItem = node;
                if (!subGrid.opts.styleInHead)
                    subGrid._updateStyles(true); // re-create sub-grid styles now that we've moved
            }
            this._updateContainerHeight();
            this.engine.addedNodes.push(node); // @ts-ignore
            this._triggerAddEvent(); // @ts-ignore
            this._triggerChangeEvent();
            this.engine.endUpdate();
            if (this._gsEventHandler['dropped']) {
                this._gsEventHandler['dropped'](Object.assign(Object.assign({}, event), { type: 'dropped' }), origNode && origNode.grid ? origNode : undefined, node);
            }
            // wait till we return out of the drag callback to set the new drag&resize handler or they may get messed up
            window.setTimeout(() => {
                // IFF we are still there (some application will use as placeholder and insert their real widget instead and better call makeWidget())
                if (node.el && node.el.parentElement) {
                    this._prepareDragDropByNode(node);
                }
                else {
                    this.engine.removeNode(node);
                }
                delete node.grid._isTemp;
            });
            return false; // prevent parent from receiving msg (which may be grid as well)
        });
        return this;
    }
    /** @internal mark item for removal */
    _itemRemoving(el, remove) {
        let node = el ? el.gridstackNode : undefined;
        if (!node || !node.grid)
            return;
        remove ? node._isAboutToRemove = true : delete node._isAboutToRemove;
        remove ? el.classList.add('grid-stack-item-removing') : el.classList.remove('grid-stack-item-removing');
    }
    /** @internal called to setup a trash drop zone if the user specifies it */
    _setupRemoveDrop() {
        if (!this.opts.staticGrid && typeof this.opts.removable === 'string') {
            let trashEl = document.querySelector(this.opts.removable);
            if (!trashEl)
                return this;
            // only register ONE drop-over/dropout callback for the 'trash', and it will
            // update the passed in item and parent grid because the 'trash' is a shared resource anyway,
            // and Native DD only has 1 event CB (having a list and technically a per grid removableOptions complicates things greatly)
            if (!dd.isDroppable(trashEl)) {
                dd.droppable(trashEl, this.opts.removableOptions)
                    .on(trashEl, 'dropover', (event, el) => this._itemRemoving(el, true))
                    .on(trashEl, 'dropout', (event, el) => this._itemRemoving(el, false));
            }
        }
        return this;
    }
    /** @internal prepares the element for drag&drop **/
    _prepareDragDropByNode(node) {
        let el = node.el;
        const noMove = node.noMove || this.opts.disableDrag;
        const noResize = node.noResize || this.opts.disableResize;
        // check for disabled grid first
        if (this.opts.staticGrid || (noMove && noResize)) {
            if (node._initDD) {
                this._removeDD(el); // nukes everything instead of just disable, will add some styles back next
                delete node._initDD;
            }
            el.classList.add('ui-draggable-disabled', 'ui-resizable-disabled'); // add styles one might depend on #1435
            return this;
        }
        if (!node._initDD) {
            // variables used/cashed between the 3 start/move/end methods, in addition to node passed above
            let cellWidth;
            let cellHeight;
            /** called when item starts moving/resizing */
            let onStartMoving = (event, ui) => {
                // trigger any 'dragstart' / 'resizestart' manually
                if (this._gsEventHandler[event.type]) {
                    this._gsEventHandler[event.type](event, event.target);
                }
                cellWidth = this.cellWidth();
                cellHeight = this.getCellHeight(true); // force pixels for calculations
                this._onStartMoving(el, event, ui, node, cellWidth, cellHeight);
            };
            /** called when item is being dragged/resized */
            let dragOrResize = (event, ui) => {
                this._dragOrResize(el, event, ui, node, cellWidth, cellHeight);
            };
            /** called when the item stops moving/resizing */
            let onEndMoving = (event) => {
                this.placeholder.remove();
                delete node._moving;
                delete node._event;
                delete node._lastTried;
                // if the item has moved to another grid, we're done here
                let target = event.target;
                if (!target.gridstackNode || target.gridstackNode.grid !== this)
                    return;
                node.el = target;
                if (node._isAboutToRemove) {
                    let gridToNotify = el.gridstackNode.grid;
                    if (gridToNotify._gsEventHandler[event.type]) {
                        gridToNotify._gsEventHandler[event.type](event, target);
                    }
                    this._removeDD(el);
                    gridToNotify.engine.removedNodes.push(node);
                    gridToNotify._triggerRemoveEvent();
                    // break circular links and remove DOM
                    delete el.gridstackNode;
                    delete node.el;
                    el.remove();
                }
                else {
                    utils_1.Utils.removePositioningStyles(target);
                    if (node._temporaryRemoved) {
                        // got removed - restore item back to before dragging position
                        utils_1.Utils.copyPos(node, node._orig); // @ts-ignore
                        this._writePosAttr(target, node);
                        this.engine.addNode(node);
                    }
                    else {
                        // move to new placeholder location
                        this._writePosAttr(target, node);
                    }
                    if (this._gsEventHandler[event.type]) {
                        this._gsEventHandler[event.type](event, target);
                    }
                }
                // @ts-ignore
                this._extraDragRow = 0; // @ts-ignore
                this._updateContainerHeight(); // @ts-ignore
                this._triggerChangeEvent();
                this.engine.endUpdate();
            };
            dd.draggable(el, {
                start: onStartMoving,
                stop: onEndMoving,
                drag: dragOrResize
            }).resizable(el, {
                start: onStartMoving,
                stop: onEndMoving,
                resize: dragOrResize
            });
            node._initDD = true; // we've set DD support now
        }
        // finally fine tune move vs resize by disabling any part...
        dd.draggable(el, noMove ? 'disable' : 'enable')
            .resizable(el, noResize ? 'disable' : 'enable');
        return this;
    }
    /** @internal handles actual drag/resize start **/
    _onStartMoving(el, event, ui, node, cellWidth, cellHeight) {
        this.engine.cleanNodes()
            .beginUpdate(node);
        // @ts-ignore
        this._writePosAttr(this.placeholder, node);
        this.el.appendChild(this.placeholder);
        // console.log('_onStartMoving placeholder') // TEST
        node.el = this.placeholder;
        node._lastUiPosition = ui.position;
        node._prevYPix = ui.position.top;
        node._moving = (event.type === 'dragstart'); // 'dropover' are not initially moving so they can go exactly where they enter (will push stuff out of the way)
        delete node._lastTried;
        if (event.type === 'dropover' && node._temporaryRemoved) {
            // console.log('engine.addNode x=' + node.x); // TEST
            this.engine.addNode(node); // will add, fix collisions, update attr and clear _temporaryRemoved
            node._moving = true; // AFTER, mark as moving object (wanted fix location before)
        }
        // set the min/max resize info
        this.engine.cacheRects(cellWidth, cellHeight, this.opts.marginTop, this.opts.marginRight, this.opts.marginBottom, this.opts.marginLeft);
        if (event.type === 'resizestart') {
            dd.resizable(el, 'option', 'minWidth', cellWidth * (node.minW || 1))
                .resizable(el, 'option', 'minHeight', cellHeight * (node.minH || 1));
            if (node.maxW) {
                dd.resizable(el, 'option', 'maxWidth', cellWidth * node.maxW);
            }
            if (node.maxH) {
                dd.resizable(el, 'option', 'maxHeight', cellHeight * node.maxH);
            }
        }
    }
    /** @internal handles actual drag/resize **/
    _dragOrResize(el, event, ui, node, cellWidth, cellHeight) {
        let p = Object.assign({}, node._orig); // could be undefined (_isExternal) which is ok (drag only set x,y and w,h will default to node value)
        let resizing;
        let mLeft = this.opts.marginLeft, mRight = this.opts.marginRight, mTop = this.opts.marginTop, mBottom = this.opts.marginBottom;
        // if margins (which are used to pass mid point by) are large relative to cell height/width, reduce them down #1855
        let mHeight = Math.round(cellHeight * 0.1), mWidth = Math.round(cellWidth * 0.1);
        mLeft = Math.min(mLeft, mWidth);
        mRight = Math.min(mRight, mWidth);
        mTop = Math.min(mTop, mHeight);
        mBottom = Math.min(mBottom, mHeight);
        if (event.type === 'drag') {
            if (node._temporaryRemoved)
                return; // handled by dropover
            let distance = ui.position.top - node._prevYPix;
            node._prevYPix = ui.position.top;
            if (this.opts.draggable.scroll !== false) {
                utils_1.Utils.updateScrollPosition(el, ui.position, distance);
            }
            // get new position taking into account the margin in the direction we are moving! (need to pass mid point by margin)
            let left = ui.position.left + (ui.position.left > node._lastUiPosition.left ? -mRight : mLeft);
            let top = ui.position.top + (ui.position.top > node._lastUiPosition.top ? -mBottom : mTop);
            p.x = Math.round(left / cellWidth);
            p.y = Math.round(top / cellHeight);
            // @ts-ignore// if we're at the bottom hitting something else, grow the grid so cursor doesn't leave when trying to place below others
            let prev = this._extraDragRow;
            if (this.engine.collide(node, p)) {
                let row = this.getRow();
                let extra = Math.max(0, (p.y + node.h) - row);
                if (this.opts.maxRow && row + extra > this.opts.maxRow) {
                    extra = Math.max(0, this.opts.maxRow - row);
                } // @ts-ignore
                this._extraDragRow = extra; // @ts-ignore
            }
            else
                this._extraDragRow = 0; // @ts-ignore
            if (this._extraDragRow !== prev)
                this._updateContainerHeight();
            if (node.x === p.x && node.y === p.y)
                return; // skip same
            // DON'T skip one we tried as we might have failed because of coverage <50% before
            // if (node._lastTried && node._lastTried.x === x && node._lastTried.y === y) return;
        }
        else if (event.type === 'resize') {
            if (p.x < 0)
                return;
            // Scrolling page if needed
            utils_1.Utils.updateScrollResize(event, el, cellHeight);
            // get new size
            p.w = Math.round((ui.size.width - mLeft) / cellWidth);
            p.h = Math.round((ui.size.height - mTop) / cellHeight);
            if (node.w === p.w && node.h === p.h)
                return;
            if (node._lastTried && node._lastTried.w === p.w && node._lastTried.h === p.h)
                return; // skip one we tried (but failed)
            // if we size on left/top side this might move us, so get possible new position as well
            let left = ui.position.left + mLeft;
            let top = ui.position.top + mTop;
            p.x = Math.round(left / cellWidth);
            p.y = Math.round(top / cellHeight);
            resizing = true;
        }
        node._event = event;
        node._lastTried = p; // set as last tried (will nuke if we go there)
        let rect = {
            x: ui.position.left + mLeft,
            y: ui.position.top + mTop,
            w: (ui.size ? ui.size.width : node.w * cellWidth) - mLeft - mRight,
            h: (ui.size ? ui.size.height : node.h * cellHeight) - mTop - mBottom
        };
        if (this.engine.moveNodeCheck(node, Object.assign(Object.assign({}, p), { cellWidth, cellHeight, rect, resizing }))) {
            node._lastUiPosition = ui.position;
            this.engine.cacheRects(cellWidth, cellHeight, mTop, mRight, mBottom, mLeft);
            delete node._skipDown;
            if (resizing && node.subGrid) {
                node.subGrid.onParentResize();
            } // @ts-ignore
            this._extraDragRow = 0; // @ts-ignore
            this._updateContainerHeight();
            let target = event.target; // @ts-ignore
            this._writePosAttr(target, node);
            if (this._gsEventHandler[event.type]) {
                this._gsEventHandler[event.type](event, target);
            }
        }
    }
    /** @internal called when item leaving our area by either cursor dropout event
     * or shape is outside our boundaries. remove it from us, and mark temporary if this was
     * our item to start with else restore prev node values from prev grid it came from.
     **/
    _leave(el, helper) {
        let node = el.gridstackNode;
        if (!node)
            return;
        dd.off(el, 'drag'); // no need to track while being outside
        // this gets called when cursor leaves and shape is outside, so only do this once
        if (node._temporaryRemoved)
            return;
        node._temporaryRemoved = true;
        this.engine.removeNode(node); // remove placeholder as well, otherwise it's a sign node is not in our list, which is a bigger issue
        node.el = node._isExternal && helper ? helper : el; // point back to real item being dragged
        if (this.opts.removable === true) { // boolean vs a class string
            // item leaving us and we are supposed to remove on leave (no need to drag onto trash) mark it so
            this._itemRemoving(el, true);
        }
        // finally if item originally came from another grid, but left us, restore things back to prev info
        if (el._gridstackNodeOrig) {
            // console.log('leave delete _gridstackNodeOrig') // TEST
            el.gridstackNode = el._gridstackNodeOrig;
            delete el._gridstackNodeOrig;
        }
        else if (node._isExternal) {
            // item came from outside (like a toolbar) so nuke any node info
            delete node.el;
            delete el.gridstackNode;
            // and restore all nodes back to original
            this.engine.restoreInitial();
        }
    }
    // legacy method removed
    commit() { utils_1.obsolete(this, this.batchUpdate(false), 'commit', 'batchUpdate', '5.2'); return this; }
}
exports.GridStack = GridStack;
/** scoping so users can call GridStack.Utils.sort() for example */
GridStack.Utils = utils_1.Utils;
/** scoping so users can call new GridStack.Engine(12) for example */
GridStack.Engine = gridstack_engine_1.GridStackEngine;
GridStack.GDRev = '7.3.0';
//# sourceMappingURL=gridstack.js.map

/***/ }),

/***/ "./node_modules/gridstack/dist/types.js":
/*!**********************************************!*\
  !*** ./node_modules/gridstack/dist/types.js ***!
  \**********************************************/
/***/ (function(__unused_webpack_module, exports) {


/**
 * types.ts 7.3.0
 * Copyright (c) 2021 Alain Dumesny - see GridStack root license
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.dragInDefaultOptions = exports.gridDefaults = void 0;
// default values for grid options - used during init and when saving out
exports.gridDefaults = {
    alwaysShowResizeHandle: 'mobile',
    animate: true,
    auto: true,
    cellHeight: 'auto',
    cellHeightThrottle: 100,
    cellHeightUnit: 'px',
    column: 12,
    draggable: { handle: '.grid-stack-item-content', appendTo: 'body', scroll: true },
    handle: '.grid-stack-item-content',
    itemClass: 'grid-stack-item',
    margin: 10,
    marginUnit: 'px',
    maxRow: 0,
    minRow: 0,
    oneColumnSize: 768,
    placeholderClass: 'grid-stack-placeholder',
    placeholderText: '',
    removableOptions: { accept: '.grid-stack-item' },
    resizable: { handles: 'se' },
    rtl: 'auto',
};
/** default dragIn options */
exports.dragInDefaultOptions = {
    handle: '.grid-stack-item-content',
    appendTo: 'body',
};
//# sourceMappingURL=types.js.map

/***/ }),

/***/ "./node_modules/gridstack/dist/utils.js":
/*!**********************************************!*\
  !*** ./node_modules/gridstack/dist/utils.js ***!
  \**********************************************/
/***/ (function(__unused_webpack_module, exports) {


/**
 * utils.ts 7.3.0
 * Copyright (c) 2021 Alain Dumesny - see GridStack root license
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Utils = exports.obsoleteAttr = exports.obsoleteOptsDel = exports.obsoleteOpts = exports.obsolete = void 0;
/** checks for obsolete method names */
// eslint-disable-next-line
function obsolete(self, f, oldName, newName, rev) {
    let wrapper = (...args) => {
        console.warn('gridstack.js: Function `' + oldName + '` is deprecated in ' + rev + ' and has been replaced ' +
            'with `' + newName + '`. It will be **removed** in a future release');
        return f.apply(self, args);
    };
    wrapper.prototype = f.prototype;
    return wrapper;
}
exports.obsolete = obsolete;
/** checks for obsolete grid options (can be used for any fields, but msg is about options) */
function obsoleteOpts(opts, oldName, newName, rev) {
    if (opts[oldName] !== undefined) {
        opts[newName] = opts[oldName];
        console.warn('gridstack.js: Option `' + oldName + '` is deprecated in ' + rev + ' and has been replaced with `' +
            newName + '`. It will be **removed** in a future release');
    }
}
exports.obsoleteOpts = obsoleteOpts;
/** checks for obsolete grid options which are gone */
function obsoleteOptsDel(opts, oldName, rev, info) {
    if (opts[oldName] !== undefined) {
        console.warn('gridstack.js: Option `' + oldName + '` is deprecated in ' + rev + info);
    }
}
exports.obsoleteOptsDel = obsoleteOptsDel;
/** checks for obsolete Jquery element attributes */
function obsoleteAttr(el, oldName, newName, rev) {
    let oldAttr = el.getAttribute(oldName);
    if (oldAttr !== null) {
        el.setAttribute(newName, oldAttr);
        console.warn('gridstack.js: attribute `' + oldName + '`=' + oldAttr + ' is deprecated on this object in ' + rev + ' and has been replaced with `' +
            newName + '`. It will be **removed** in a future release');
    }
}
exports.obsoleteAttr = obsoleteAttr;
/**
 * Utility methods
 */
class Utils {
    /** convert a potential selector into actual list of html elements */
    static getElements(els) {
        if (typeof els === 'string') {
            let list = document.querySelectorAll(els);
            if (!list.length && els[0] !== '.' && els[0] !== '#') {
                list = document.querySelectorAll('.' + els);
                if (!list.length) {
                    list = document.querySelectorAll('#' + els);
                }
            }
            return Array.from(list);
        }
        return [els];
    }
    /** convert a potential selector into actual single element */
    static getElement(els) {
        if (typeof els === 'string') {
            if (!els.length)
                return null;
            if (els[0] === '#') {
                return document.getElementById(els.substring(1));
            }
            if (els[0] === '.' || els[0] === '[') {
                return document.querySelector(els);
            }
            // if we start with a digit, assume it's an id (error calling querySelector('#1')) as class are not valid CSS
            if (!isNaN(+els[0])) { // start with digit
                return document.getElementById(els);
            }
            // finally try string, then id then class
            let el = document.querySelector(els);
            if (!el) {
                el = document.getElementById(els);
            }
            if (!el) {
                el = document.querySelector('.' + els);
            }
            return el;
        }
        return els;
    }
    /** returns true if a and b overlap */
    static isIntercepted(a, b) {
        return !(a.y >= b.y + b.h || a.y + a.h <= b.y || a.x + a.w <= b.x || a.x >= b.x + b.w);
    }
    /** returns true if a and b touch edges or corners */
    static isTouching(a, b) {
        return Utils.isIntercepted(a, { x: b.x - 0.5, y: b.y - 0.5, w: b.w + 1, h: b.h + 1 });
    }
    /** returns the area a and b overlap */
    static areaIntercept(a, b) {
        let x0 = (a.x > b.x) ? a.x : b.x;
        let x1 = (a.x + a.w < b.x + b.w) ? a.x + a.w : b.x + b.w;
        if (x1 <= x0)
            return 0; // no overlap
        let y0 = (a.y > b.y) ? a.y : b.y;
        let y1 = (a.y + a.h < b.y + b.h) ? a.y + a.h : b.y + b.h;
        if (y1 <= y0)
            return 0; // no overlap
        return (x1 - x0) * (y1 - y0);
    }
    /** returns the area */
    static area(a) {
        return a.w * a.h;
    }
    /**
     * Sorts array of nodes
     * @param nodes array to sort
     * @param dir 1 for asc, -1 for desc (optional)
     * @param width width of the grid. If undefined the width will be calculated automatically (optional).
     **/
    static sort(nodes, dir, column) {
        column = column || nodes.reduce((col, n) => Math.max(n.x + n.w, col), 0) || 12;
        if (dir === -1)
            return nodes.sort((a, b) => (b.x + b.y * column) - (a.x + a.y * column));
        else
            return nodes.sort((b, a) => (b.x + b.y * column) - (a.x + a.y * column));
    }
    /**
     * creates a style sheet with style id under given parent
     * @param id will set the 'gs-style-id' attribute to that id
     * @param parent to insert the stylesheet as first child,
     * if none supplied it will be appended to the document head instead.
     */
    static createStylesheet(id, parent, options) {
        let style = document.createElement('style');
        const nonce = options === null || options === void 0 ? void 0 : options.nonce;
        if (nonce)
            style.nonce = nonce;
        style.setAttribute('type', 'text/css');
        style.setAttribute('gs-style-id', id);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (style.styleSheet) { // TODO: only CSSImportRule have that and different beast ??
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            style.styleSheet.cssText = '';
        }
        else {
            style.appendChild(document.createTextNode('')); // WebKit hack
        }
        if (!parent) {
            // default to head
            parent = document.getElementsByTagName('head')[0];
            parent.appendChild(style);
        }
        else {
            parent.insertBefore(style, parent.firstChild);
        }
        return style.sheet;
    }
    /** removed the given stylesheet id */
    static removeStylesheet(id) {
        let el = document.querySelector('STYLE[gs-style-id=' + id + ']');
        if (el && el.parentNode)
            el.remove();
    }
    /** inserts a CSS rule */
    static addCSSRule(sheet, selector, rules) {
        if (typeof sheet.addRule === 'function') {
            sheet.addRule(selector, rules);
        }
        else if (typeof sheet.insertRule === 'function') {
            sheet.insertRule(`${selector}{${rules}}`);
        }
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static toBool(v) {
        if (typeof v === 'boolean') {
            return v;
        }
        if (typeof v === 'string') {
            v = v.toLowerCase();
            return !(v === '' || v === 'no' || v === 'false' || v === '0');
        }
        return Boolean(v);
    }
    static toNumber(value) {
        return (value === null || value.length === 0) ? undefined : Number(value);
    }
    static parseHeight(val) {
        let h;
        let unit = 'px';
        if (typeof val === 'string') {
            let match = val.match(/^(-[0-9]+\.[0-9]+|[0-9]*\.[0-9]+|-[0-9]+|[0-9]+)(px|em|rem|vh|vw|%)?$/);
            if (!match) {
                throw new Error('Invalid height');
            }
            unit = match[2] || 'px';
            h = parseFloat(match[1]);
        }
        else {
            h = val;
        }
        return { h, unit };
    }
    /** copies unset fields in target to use the given default sources values */
    // eslint-disable-next-line
    static defaults(target, ...sources) {
        sources.forEach(source => {
            for (const key in source) {
                if (!source.hasOwnProperty(key))
                    return;
                if (target[key] === null || target[key] === undefined) {
                    target[key] = source[key];
                }
                else if (typeof source[key] === 'object' && typeof target[key] === 'object') {
                    // property is an object, recursively add it's field over... #1373
                    this.defaults(target[key], source[key]);
                }
            }
        });
        return target;
    }
    /** given 2 objects return true if they have the same values. Checks for Object {} having same fields and values (just 1 level down) */
    static same(a, b) {
        if (typeof a !== 'object')
            return a == b;
        if (typeof a !== typeof b)
            return false;
        // else we have object, check just 1 level deep for being same things...
        if (Object.keys(a).length !== Object.keys(b).length)
            return false;
        for (const key in a) {
            if (a[key] !== b[key])
                return false;
        }
        return true;
    }
    /** copies over b size & position (GridStackPosition), and optionally min/max as well */
    static copyPos(a, b, doMinMax = false) {
        a.x = b.x;
        a.y = b.y;
        a.w = b.w;
        a.h = b.h;
        if (doMinMax) {
            if (b.minW)
                a.minW = b.minW;
            if (b.minH)
                a.minH = b.minH;
            if (b.maxW)
                a.maxW = b.maxW;
            if (b.maxH)
                a.maxH = b.maxH;
        }
        return a;
    }
    /** true if a and b has same size & position */
    static samePos(a, b) {
        return a && b && a.x === b.x && a.y === b.y && a.w === b.w && a.h === b.h;
    }
    /** removes field from the first object if same as the second objects (like diffing) and internal '_' for saving */
    static removeInternalAndSame(a, b) {
        if (typeof a !== 'object' || typeof b !== 'object')
            return;
        for (let key in a) {
            let val = a[key];
            if (key[0] === '_' || val === b[key]) {
                delete a[key];
            }
            else if (val && typeof val === 'object' && b[key] !== undefined) {
                for (let i in val) {
                    if (val[i] === b[key][i] || i[0] === '_') {
                        delete val[i];
                    }
                }
                if (!Object.keys(val).length) {
                    delete a[key];
                }
            }
        }
    }
    /** removes internal fields '_' and default values for saving */
    static removeInternalForSave(n, removeEl = true) {
        for (let key in n) {
            if (key[0] === '_' || n[key] === null || n[key] === undefined)
                delete n[key];
        }
        delete n.grid;
        if (removeEl)
            delete n.el;
        // delete default values (will be re-created on read)
        if (!n.autoPosition)
            delete n.autoPosition;
        if (!n.noResize)
            delete n.noResize;
        if (!n.noMove)
            delete n.noMove;
        if (!n.locked)
            delete n.locked;
        if (n.w === 1 || n.w === n.minW)
            delete n.w;
        if (n.h === 1 || n.h === n.minH)
            delete n.h;
    }
    /** return the closest parent (or itself) matching the given class */
    static closestUpByClass(el, name) {
        while (el) {
            if (el.classList.contains(name))
                return el;
            el = el.parentElement;
        }
        return null;
    }
    /** delay calling the given function for given delay, preventing new calls from happening while waiting */
    static throttle(func, delay) {
        let isWaiting = false;
        return (...args) => {
            if (!isWaiting) {
                isWaiting = true;
                setTimeout(() => { func(...args); isWaiting = false; }, delay);
            }
        };
    }
    static removePositioningStyles(el) {
        let style = el.style;
        if (style.position) {
            style.removeProperty('position');
        }
        if (style.left) {
            style.removeProperty('left');
        }
        if (style.top) {
            style.removeProperty('top');
        }
        if (style.width) {
            style.removeProperty('width');
        }
        if (style.height) {
            style.removeProperty('height');
        }
    }
    /** @internal returns the passed element if scrollable, else the closest parent that will, up to the entire document scrolling element */
    static getScrollElement(el) {
        if (!el)
            return document.scrollingElement || document.documentElement; // IE support
        const style = getComputedStyle(el);
        const overflowRegex = /(auto|scroll)/;
        if (overflowRegex.test(style.overflow + style.overflowY)) {
            return el;
        }
        else {
            return this.getScrollElement(el.parentElement);
        }
    }
    /** @internal */
    static updateScrollPosition(el, position, distance) {
        // is widget in view?
        let rect = el.getBoundingClientRect();
        let innerHeightOrClientHeight = (window.innerHeight || document.documentElement.clientHeight);
        if (rect.top < 0 ||
            rect.bottom > innerHeightOrClientHeight) {
            // set scrollTop of first parent that scrolls
            // if parent is larger than el, set as low as possible
            // to get entire widget on screen
            let offsetDiffDown = rect.bottom - innerHeightOrClientHeight;
            let offsetDiffUp = rect.top;
            let scrollEl = this.getScrollElement(el);
            if (scrollEl !== null) {
                let prevScroll = scrollEl.scrollTop;
                if (rect.top < 0 && distance < 0) {
                    // moving up
                    if (el.offsetHeight > innerHeightOrClientHeight) {
                        scrollEl.scrollTop += distance;
                    }
                    else {
                        scrollEl.scrollTop += Math.abs(offsetDiffUp) > Math.abs(distance) ? distance : offsetDiffUp;
                    }
                }
                else if (distance > 0) {
                    // moving down
                    if (el.offsetHeight > innerHeightOrClientHeight) {
                        scrollEl.scrollTop += distance;
                    }
                    else {
                        scrollEl.scrollTop += offsetDiffDown > distance ? distance : offsetDiffDown;
                    }
                }
                // move widget y by amount scrolled
                position.top += scrollEl.scrollTop - prevScroll;
            }
        }
    }
    /**
     * @internal Function used to scroll the page.
     *
     * @param event `MouseEvent` that triggers the resize
     * @param el `HTMLElement` that's being resized
     * @param distance Distance from the V edges to start scrolling
     */
    static updateScrollResize(event, el, distance) {
        const scrollEl = this.getScrollElement(el);
        const height = scrollEl.clientHeight;
        // #1727 event.clientY is relative to viewport, so must compare this against position of scrollEl getBoundingClientRect().top
        // #1745 Special situation if scrollEl is document 'html': here browser spec states that
        // clientHeight is height of viewport, but getBoundingClientRect() is rectangle of html element;
        // this discrepancy arises because in reality scrollbar is attached to viewport, not html element itself.
        const offsetTop = (scrollEl === this.getScrollElement()) ? 0 : scrollEl.getBoundingClientRect().top;
        const pointerPosY = event.clientY - offsetTop;
        const top = pointerPosY < distance;
        const bottom = pointerPosY > height - distance;
        if (top) {
            // This also can be done with a timeout to keep scrolling while the mouse is
            // in the scrolling zone. (will have smoother behavior)
            scrollEl.scrollBy({ behavior: 'smooth', top: pointerPosY - distance });
        }
        else if (bottom) {
            scrollEl.scrollBy({ behavior: 'smooth', top: distance - (height - pointerPosY) });
        }
    }
    /** single level clone, returning a new object with same top fields. This will share sub objects and arrays */
    static clone(obj) {
        if (obj === null || obj === undefined || typeof (obj) !== 'object') {
            return obj;
        }
        // return Object.assign({}, obj);
        if (obj instanceof Array) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return [...obj];
        }
        return Object.assign({}, obj);
    }
    /**
     * Recursive clone version that returns a full copy, checking for nested objects and arrays ONLY.
     * Note: this will use as-is any key starting with double __ (and not copy inside) some lib have circular dependencies.
     */
    static cloneDeep(obj) {
        // list of fields we will skip during cloneDeep (nested objects, other internal)
        const skipFields = ['parentGrid', 'el', 'grid', 'subGrid', 'engine'];
        // return JSON.parse(JSON.stringify(obj)); // doesn't work with date format ?
        const ret = Utils.clone(obj);
        for (const key in ret) {
            // NOTE: we don't support function/circular dependencies so skip those properties for now...
            if (ret.hasOwnProperty(key) && typeof (ret[key]) === 'object' && key.substring(0, 2) !== '__' && !skipFields.find(k => k === key)) {
                ret[key] = Utils.cloneDeep(obj[key]);
            }
        }
        return ret;
    }
    /** deep clone the given HTML node, removing teh unique id field */
    static cloneNode(el) {
        const node = el.cloneNode(true);
        node.removeAttribute('id');
        return node;
    }
    static appendTo(el, parent) {
        let parentNode;
        if (typeof parent === 'string') {
            parentNode = document.querySelector(parent);
        }
        else {
            parentNode = parent;
        }
        if (parentNode) {
            parentNode.appendChild(el);
        }
    }
    // public static setPositionRelative(el: HTMLElement): void {
    //   if (!(/^(?:r|a|f)/).test(window.getComputedStyle(el).position)) {
    //     el.style.position = "relative";
    //   }
    // }
    static addElStyles(el, styles) {
        if (styles instanceof Object) {
            for (const s in styles) {
                if (styles.hasOwnProperty(s)) {
                    if (Array.isArray(styles[s])) {
                        // support fallback value
                        styles[s].forEach(val => {
                            el.style[s] = val;
                        });
                    }
                    else {
                        el.style[s] = styles[s];
                    }
                }
            }
        }
    }
    static initEvent(e, info) {
        const evt = { type: info.type };
        const obj = {
            button: 0,
            which: 0,
            buttons: 1,
            bubbles: true,
            cancelable: true,
            target: info.target ? info.target : e.target
        };
        // don't check for `instanceof DragEvent` as Safari use MouseEvent #1540
        if (e.dataTransfer) {
            evt['dataTransfer'] = e.dataTransfer; // workaround 'readonly' field.
        }
        ['altKey', 'ctrlKey', 'metaKey', 'shiftKey'].forEach(p => evt[p] = e[p]); // keys
        ['pageX', 'pageY', 'clientX', 'clientY', 'screenX', 'screenY'].forEach(p => evt[p] = e[p]); // point info
        return Object.assign(Object.assign({}, evt), obj);
    }
    /** copies the MouseEvent properties and sends it as another event to the given target */
    static simulateMouseEvent(e, simulatedType, target) {
        const simulatedEvent = document.createEvent('MouseEvents');
        simulatedEvent.initMouseEvent(simulatedType, // type
        true, // bubbles
        true, // cancelable
        window, // view
        1, // detail
        e.screenX, // screenX
        e.screenY, // screenY
        e.clientX, // clientX
        e.clientY, // clientY
        e.ctrlKey, // ctrlKey
        e.altKey, // altKey
        e.shiftKey, // shiftKey
        e.metaKey, // metaKey
        0, // button
        e.target // relatedTarget
        );
        (target || e.target).dispatchEvent(simulatedEvent);
    }
}
exports.Utils = Utils;
//# sourceMappingURL=utils.js.map

/***/ }),

/***/ "./node_modules/gridstack/dist/gridstack-extra.min.css":
/*!*************************************************************!*\
  !*** ./node_modules/gridstack/dist/gridstack-extra.min.css ***!
  \*************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ }),

/***/ "./node_modules/gridstack/dist/gridstack.min.css":
/*!*******************************************************!*\
  !*** ./node_modules/gridstack/dist/gridstack.min.css ***!
  \*******************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ })

},
/******/ function(__webpack_require__) { // webpackRuntimeModules
/******/ var __webpack_exec__ = function(moduleId) { return __webpack_require__(__webpack_require__.s = moduleId); }
/******/ var __webpack_exports__ = (__webpack_exec__("./assets/dashboard.js"));
/******/ }
]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0EsdUZBQXVGO0FBQ3ZGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxtQ0FBbUMsZUFBZSxvQkFBb0I7QUFDdEU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMEVBQTBFO0FBQzFFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnQ0FBZ0MsaURBQWlEO0FBQ2pGO0FBQ0E7QUFDQSxnQ0FBZ0MsNERBQTREO0FBQzVGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esa0NBQWtDO0FBQ2xDO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsK0JBQStCO0FBQy9CO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxtREFBbUQ7QUFDbkQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx5QkFBeUI7QUFDekI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esc0JBQXNCO0FBQ3RCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esa0RBQWtEO0FBQ2xEO0FBQ0Esa0ZBQWtGO0FBQ2xGLG9HQUFvRztBQUNwRyw2Q0FBNkM7QUFDN0M7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYixpQzs7Ozs7Ozs7Ozs7QUMvZ0JBOzs7Ozs7Ozs7Ozs7QUNBQSIsInNvdXJjZXMiOlsid2VicGFjazovL2tpbWFpLy4vYXNzZXRzL2Rhc2hib2FyZC5qcyIsIndlYnBhY2s6Ly9raW1haS8uL25vZGVfbW9kdWxlcy9ncmlkc3RhY2svZGlzdC9kZC1iYXNlLWltcGwuanMiLCJ3ZWJwYWNrOi8va2ltYWkvLi9ub2RlX21vZHVsZXMvZ3JpZHN0YWNrL2Rpc3QvZGQtZHJhZ2dhYmxlLmpzIiwid2VicGFjazovL2tpbWFpLy4vbm9kZV9tb2R1bGVzL2dyaWRzdGFjay9kaXN0L2RkLWRyb3BwYWJsZS5qcyIsIndlYnBhY2s6Ly9raW1haS8uL25vZGVfbW9kdWxlcy9ncmlkc3RhY2svZGlzdC9kZC1lbGVtZW50LmpzIiwid2VicGFjazovL2tpbWFpLy4vbm9kZV9tb2R1bGVzL2dyaWRzdGFjay9kaXN0L2RkLWdyaWRzdGFjay5qcyIsIndlYnBhY2s6Ly9raW1haS8uL25vZGVfbW9kdWxlcy9ncmlkc3RhY2svZGlzdC9kZC1tYW5hZ2VyLmpzIiwid2VicGFjazovL2tpbWFpLy4vbm9kZV9tb2R1bGVzL2dyaWRzdGFjay9kaXN0L2RkLXJlc2l6YWJsZS1oYW5kbGUuanMiLCJ3ZWJwYWNrOi8va2ltYWkvLi9ub2RlX21vZHVsZXMvZ3JpZHN0YWNrL2Rpc3QvZGQtcmVzaXphYmxlLmpzIiwid2VicGFjazovL2tpbWFpLy4vbm9kZV9tb2R1bGVzL2dyaWRzdGFjay9kaXN0L2RkLXRvdWNoLmpzIiwid2VicGFjazovL2tpbWFpLy4vbm9kZV9tb2R1bGVzL2dyaWRzdGFjay9kaXN0L2dyaWRzdGFjay1lbmdpbmUuanMiLCJ3ZWJwYWNrOi8va2ltYWkvLi9ub2RlX21vZHVsZXMvZ3JpZHN0YWNrL2Rpc3QvZ3JpZHN0YWNrLmpzIiwid2VicGFjazovL2tpbWFpLy4vbm9kZV9tb2R1bGVzL2dyaWRzdGFjay9kaXN0L3R5cGVzLmpzIiwid2VicGFjazovL2tpbWFpLy4vbm9kZV9tb2R1bGVzL2dyaWRzdGFjay9kaXN0L3V0aWxzLmpzIiwid2VicGFjazovL2tpbWFpLy4vbm9kZV9tb2R1bGVzL2dyaWRzdGFjay9kaXN0L2dyaWRzdGFjay1leHRyYS5taW4uY3NzP2NlODEiLCJ3ZWJwYWNrOi8va2ltYWkvLi9ub2RlX21vZHVsZXMvZ3JpZHN0YWNrL2Rpc3QvZ3JpZHN0YWNrLm1pbi5jc3M/ZjA1YyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogaHR0cHM6Ly9ncmlkc3RhY2tqcy5jb21cclxuICogaHR0cHM6Ly9naXRodWIuY29tL2dyaWRzdGFjay9ncmlkc3RhY2suanMvdHJlZS9tYXN0ZXIvZG9jXHJcbiAqL1xyXG5yZXF1aXJlKCdncmlkc3RhY2svZGlzdC9ncmlkc3RhY2subWluLmNzcycpO1xyXG5yZXF1aXJlKCdncmlkc3RhY2svZGlzdC9ncmlkc3RhY2stZXh0cmEubWluLmNzcycpO1xyXG5pbXBvcnQgeyBHcmlkU3RhY2sgfSBmcm9tICdncmlkc3RhY2snO1xyXG5nbG9iYWwuR3JpZFN0YWNrID0gR3JpZFN0YWNrOyIsIlwidXNlIHN0cmljdFwiO1xyXG4vKipcclxuICogZGQtYmFzZS1pbXBsLnRzIDcuMy4wXHJcbiAqIENvcHlyaWdodCAoYykgMjAyMS0yMDIyIEFsYWluIER1bWVzbnkgLSBzZWUgR3JpZFN0YWNrIHJvb3QgbGljZW5zZVxyXG4gKi9cclxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xyXG5leHBvcnRzLkREQmFzZUltcGxlbWVudCA9IHZvaWQgMDtcclxuY2xhc3MgRERCYXNlSW1wbGVtZW50IHtcclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIC8qKiBAaW50ZXJuYWwgKi9cclxuICAgICAgICB0aGlzLl9ldmVudFJlZ2lzdGVyID0ge307XHJcbiAgICB9XHJcbiAgICAvKiogcmV0dXJucyB0aGUgZW5hYmxlIHN0YXRlLCBidXQgeW91IGhhdmUgdG8gY2FsbCBlbmFibGUoKS9kaXNhYmxlKCkgdG8gY2hhbmdlIChhcyBvdGhlciB0aGluZ3MgbmVlZCB0byBoYXBwZW4pICovXHJcbiAgICBnZXQgZGlzYWJsZWQoKSB7IHJldHVybiB0aGlzLl9kaXNhYmxlZDsgfVxyXG4gICAgb24oZXZlbnQsIGNhbGxiYWNrKSB7XHJcbiAgICAgICAgdGhpcy5fZXZlbnRSZWdpc3RlcltldmVudF0gPSBjYWxsYmFjaztcclxuICAgIH1cclxuICAgIG9mZihldmVudCkge1xyXG4gICAgICAgIGRlbGV0ZSB0aGlzLl9ldmVudFJlZ2lzdGVyW2V2ZW50XTtcclxuICAgIH1cclxuICAgIGVuYWJsZSgpIHtcclxuICAgICAgICB0aGlzLl9kaXNhYmxlZCA9IGZhbHNlO1xyXG4gICAgfVxyXG4gICAgZGlzYWJsZSgpIHtcclxuICAgICAgICB0aGlzLl9kaXNhYmxlZCA9IHRydWU7XHJcbiAgICB9XHJcbiAgICBkZXN0cm95KCkge1xyXG4gICAgICAgIGRlbGV0ZSB0aGlzLl9ldmVudFJlZ2lzdGVyO1xyXG4gICAgfVxyXG4gICAgdHJpZ2dlckV2ZW50KGV2ZW50TmFtZSwgZXZlbnQpIHtcclxuICAgICAgICBpZiAoIXRoaXMuZGlzYWJsZWQgJiYgdGhpcy5fZXZlbnRSZWdpc3RlciAmJiB0aGlzLl9ldmVudFJlZ2lzdGVyW2V2ZW50TmFtZV0pXHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9ldmVudFJlZ2lzdGVyW2V2ZW50TmFtZV0oZXZlbnQpO1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydHMuRERCYXNlSW1wbGVtZW50ID0gRERCYXNlSW1wbGVtZW50O1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kZC1iYXNlLWltcGwuanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbi8qKlxyXG4gKiBkZC1kcmFnZ2FibGUudHMgNy4zLjBcclxuICogQ29weXJpZ2h0IChjKSAyMDIxLTIwMjIgQWxhaW4gRHVtZXNueSAtIHNlZSBHcmlkU3RhY2sgcm9vdCBsaWNlbnNlXHJcbiAqL1xyXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XHJcbmV4cG9ydHMuREREcmFnZ2FibGUgPSB2b2lkIDA7XHJcbmNvbnN0IGRkX21hbmFnZXJfMSA9IHJlcXVpcmUoXCIuL2RkLW1hbmFnZXJcIik7XHJcbmNvbnN0IHV0aWxzXzEgPSByZXF1aXJlKFwiLi91dGlsc1wiKTtcclxuY29uc3QgZGRfYmFzZV9pbXBsXzEgPSByZXF1aXJlKFwiLi9kZC1iYXNlLWltcGxcIik7XHJcbmNvbnN0IGRkX3RvdWNoXzEgPSByZXF1aXJlKFwiLi9kZC10b3VjaFwiKTtcclxuLy8gbGV0IGNvdW50ID0gMDsgLy8gVEVTVFxyXG5jbGFzcyBERERyYWdnYWJsZSBleHRlbmRzIGRkX2Jhc2VfaW1wbF8xLkREQmFzZUltcGxlbWVudCB7XHJcbiAgICBjb25zdHJ1Y3RvcihlbCwgb3B0aW9uID0ge30pIHtcclxuICAgICAgICBzdXBlcigpO1xyXG4gICAgICAgIHRoaXMuZWwgPSBlbDtcclxuICAgICAgICB0aGlzLm9wdGlvbiA9IG9wdGlvbjtcclxuICAgICAgICAvLyBnZXQgdGhlIGVsZW1lbnQgdGhhdCBpcyBhY3R1YWxseSBzdXBwb3NlZCB0byBiZSBkcmFnZ2VkIGJ5XHJcbiAgICAgICAgbGV0IGhhbmRsZU5hbWUgPSBvcHRpb24uaGFuZGxlLnN1YnN0cmluZygxKTtcclxuICAgICAgICB0aGlzLmRyYWdFbCA9IGVsLmNsYXNzTGlzdC5jb250YWlucyhoYW5kbGVOYW1lKSA/IGVsIDogZWwucXVlcnlTZWxlY3RvcihvcHRpb24uaGFuZGxlKSB8fCBlbDtcclxuICAgICAgICAvLyBjcmVhdGUgdmFyIGV2ZW50IGJpbmRpbmcgc28gd2UgY2FuIGVhc2lseSByZW1vdmUgYW5kIHN0aWxsIGxvb2sgbGlrZSBUUyBtZXRob2RzICh1bmxpa2UgYW5vbnltb3VzIGZ1bmN0aW9ucylcclxuICAgICAgICB0aGlzLl9tb3VzZURvd24gPSB0aGlzLl9tb3VzZURvd24uYmluZCh0aGlzKTtcclxuICAgICAgICB0aGlzLl9tb3VzZU1vdmUgPSB0aGlzLl9tb3VzZU1vdmUuYmluZCh0aGlzKTtcclxuICAgICAgICB0aGlzLl9tb3VzZVVwID0gdGhpcy5fbW91c2VVcC5iaW5kKHRoaXMpO1xyXG4gICAgICAgIHRoaXMuZW5hYmxlKCk7XHJcbiAgICB9XHJcbiAgICBvbihldmVudCwgY2FsbGJhY2spIHtcclxuICAgICAgICBzdXBlci5vbihldmVudCwgY2FsbGJhY2spO1xyXG4gICAgfVxyXG4gICAgb2ZmKGV2ZW50KSB7XHJcbiAgICAgICAgc3VwZXIub2ZmKGV2ZW50KTtcclxuICAgIH1cclxuICAgIGVuYWJsZSgpIHtcclxuICAgICAgICBpZiAodGhpcy5kaXNhYmxlZCA9PT0gZmFsc2UpXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICBzdXBlci5lbmFibGUoKTtcclxuICAgICAgICB0aGlzLmRyYWdFbC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCB0aGlzLl9tb3VzZURvd24pO1xyXG4gICAgICAgIGlmIChkZF90b3VjaF8xLmlzVG91Y2gpIHtcclxuICAgICAgICAgICAgdGhpcy5kcmFnRWwuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIGRkX3RvdWNoXzEudG91Y2hzdGFydCk7XHJcbiAgICAgICAgICAgIHRoaXMuZHJhZ0VsLmFkZEV2ZW50TGlzdGVuZXIoJ3BvaW50ZXJkb3duJywgZGRfdG91Y2hfMS5wb2ludGVyZG93bik7XHJcbiAgICAgICAgICAgIC8vIHRoaXMuZHJhZ0VsLnN0eWxlLnRvdWNoQWN0aW9uID0gJ25vbmUnOyAvLyBub3QgbmVlZGVkIHVubGlrZSBwb2ludGVyZG93biBkb2MgY29tbWVudFxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmVsLmNsYXNzTGlzdC5yZW1vdmUoJ3VpLWRyYWdnYWJsZS1kaXNhYmxlZCcpO1xyXG4gICAgICAgIHRoaXMuZWwuY2xhc3NMaXN0LmFkZCgndWktZHJhZ2dhYmxlJyk7XHJcbiAgICB9XHJcbiAgICBkaXNhYmxlKGZvckRlc3Ryb3kgPSBmYWxzZSkge1xyXG4gICAgICAgIGlmICh0aGlzLmRpc2FibGVkID09PSB0cnVlKVxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgc3VwZXIuZGlzYWJsZSgpO1xyXG4gICAgICAgIHRoaXMuZHJhZ0VsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIHRoaXMuX21vdXNlRG93bik7XHJcbiAgICAgICAgaWYgKGRkX3RvdWNoXzEuaXNUb3VjaCkge1xyXG4gICAgICAgICAgICB0aGlzLmRyYWdFbC5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgZGRfdG91Y2hfMS50b3VjaHN0YXJ0KTtcclxuICAgICAgICAgICAgdGhpcy5kcmFnRWwucmVtb3ZlRXZlbnRMaXN0ZW5lcigncG9pbnRlcmRvd24nLCBkZF90b3VjaF8xLnBvaW50ZXJkb3duKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5lbC5jbGFzc0xpc3QucmVtb3ZlKCd1aS1kcmFnZ2FibGUnKTtcclxuICAgICAgICBpZiAoIWZvckRlc3Ryb3kpXHJcbiAgICAgICAgICAgIHRoaXMuZWwuY2xhc3NMaXN0LmFkZCgndWktZHJhZ2dhYmxlLWRpc2FibGVkJyk7XHJcbiAgICB9XHJcbiAgICBkZXN0cm95KCkge1xyXG4gICAgICAgIGlmICh0aGlzLmRyYWdUaW1lb3V0KVxyXG4gICAgICAgICAgICB3aW5kb3cuY2xlYXJUaW1lb3V0KHRoaXMuZHJhZ1RpbWVvdXQpO1xyXG4gICAgICAgIGRlbGV0ZSB0aGlzLmRyYWdUaW1lb3V0O1xyXG4gICAgICAgIGlmICh0aGlzLmRyYWdnaW5nKVxyXG4gICAgICAgICAgICB0aGlzLl9tb3VzZVVwKHRoaXMubW91c2VEb3duRXZlbnQpO1xyXG4gICAgICAgIHRoaXMuZGlzYWJsZSh0cnVlKTtcclxuICAgICAgICBkZWxldGUgdGhpcy5lbDtcclxuICAgICAgICBkZWxldGUgdGhpcy5oZWxwZXI7XHJcbiAgICAgICAgZGVsZXRlIHRoaXMub3B0aW9uO1xyXG4gICAgICAgIHN1cGVyLmRlc3Ryb3koKTtcclxuICAgIH1cclxuICAgIHVwZGF0ZU9wdGlvbihvcHRzKSB7XHJcbiAgICAgICAgT2JqZWN0LmtleXMob3B0cykuZm9yRWFjaChrZXkgPT4gdGhpcy5vcHRpb25ba2V5XSA9IG9wdHNba2V5XSk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbiAgICAvKiogQGludGVybmFsIGNhbGwgd2hlbiBtb3VzZSBnb2VzIGRvd24gYmVmb3JlIGEgZHJhZ3N0YXJ0IGhhcHBlbnMgKi9cclxuICAgIF9tb3VzZURvd24oZSkge1xyXG4gICAgICAgIC8vIGRvbid0IGxldCBtb3JlIHRoYW4gb25lIHdpZGdldCBoYW5kbGUgbW91c2VTdGFydFxyXG4gICAgICAgIGlmIChkZF9tYW5hZ2VyXzEuRERNYW5hZ2VyLm1vdXNlSGFuZGxlZClcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIGlmIChlLmJ1dHRvbiAhPT0gMClcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7IC8vIG9ubHkgbGVmdCBjbGlja1xyXG4gICAgICAgIC8vIG1ha2Ugc3VyZSB3ZSBhcmUgbm90IGNsaWNraW5nIG9uIGtub3duIG9iamVjdCB0aGF0IGhhbmRsZXMgbW91c2VEb3duIChUT0RPOiBtYWtlIHRoaXMgZXh0ZW5zaWJsZSA/KSAjMjA1NFxyXG4gICAgICAgIGNvbnN0IHNraXBNb3VzZURvd24gPSBbJ2lucHV0JywgJ3RleHRhcmVhJywgJ2J1dHRvbicsICdzZWxlY3QnLCAnb3B0aW9uJ107XHJcbiAgICAgICAgY29uc3QgbmFtZSA9IGUudGFyZ2V0Lm5vZGVOYW1lLnRvTG93ZXJDYXNlKCk7XHJcbiAgICAgICAgaWYgKHNraXBNb3VzZURvd24uZmluZChza2lwID0+IHNraXAgPT09IG5hbWUpKVxyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAvLyBhbHNvIGNoZWNrIGZvciBjb250ZW50IGVkaXRhYmxlXHJcbiAgICAgICAgaWYgKGUudGFyZ2V0LmNsb3Nlc3QoJ1tjb250ZW50ZWRpdGFibGU9XCJ0cnVlXCJdJykpXHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIC8vIFJFTU9WRTogd2h5IHdvdWxkIHdlIGdldCB0aGUgZXZlbnQgaWYgaXQgd2Fzbid0IGZvciB1cyBvciBjaGlsZCA/XHJcbiAgICAgICAgLy8gbWFrZSBzdXJlIHdlIGFyZSBjbGlja2luZyBvbiBhIGRyYWcgaGFuZGxlIG9yIGNoaWxkIG9mIGl0Li4uXHJcbiAgICAgICAgLy8gTm90ZTogd2UgZG9uJ3QgbmVlZCB0byBjaGVjayB0aGF0J3MgaGFuZGxlIGlzIGFuIGltbWVkaWF0ZSBjaGlsZCwgYXMgbW91c2VIYW5kbGVkIHdpbGwgcHJldmVudCBwYXJlbnRzIGZyb20gYWxzbyBoYW5kbGluZyBpdCAobG93ZXN0IHdpbnMpXHJcbiAgICAgICAgLy8gbGV0IGNsYXNzTmFtZSA9IHRoaXMub3B0aW9uLmhhbmRsZS5zdWJzdHJpbmcoMSk7XHJcbiAgICAgICAgLy8gbGV0IGVsID0gZS50YXJnZXQgYXMgSFRNTEVsZW1lbnQ7XHJcbiAgICAgICAgLy8gd2hpbGUgKGVsICYmICFlbC5jbGFzc0xpc3QuY29udGFpbnMoY2xhc3NOYW1lKSkgeyBlbCA9IGVsLnBhcmVudEVsZW1lbnQ7IH1cclxuICAgICAgICAvLyBpZiAoIWVsKSByZXR1cm47XHJcbiAgICAgICAgdGhpcy5tb3VzZURvd25FdmVudCA9IGU7XHJcbiAgICAgICAgZGVsZXRlIHRoaXMuZHJhZ2dpbmc7XHJcbiAgICAgICAgZGVsZXRlIGRkX21hbmFnZXJfMS5ERE1hbmFnZXIuZHJhZ0VsZW1lbnQ7XHJcbiAgICAgICAgZGVsZXRlIGRkX21hbmFnZXJfMS5ERE1hbmFnZXIuZHJvcEVsZW1lbnQ7XHJcbiAgICAgICAgLy8gZG9jdW1lbnQgaGFuZGxlciBzbyB3ZSBjYW4gY29udGludWUgcmVjZWl2aW5nIG1vdmVzIGFzIHRoZSBpdGVtIGlzICdmaXhlZCcgcG9zaXRpb24sIGFuZCBjYXB0dXJlPXRydWUgc28gV0UgZ2V0IGEgZmlyc3QgY3JhY2tcclxuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCB0aGlzLl9tb3VzZU1vdmUsIHRydWUpOyAvLyB0cnVlPWNhcHR1cmUsIG5vdCBidWJibGVcclxuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgdGhpcy5fbW91c2VVcCwgdHJ1ZSk7XHJcbiAgICAgICAgaWYgKGRkX3RvdWNoXzEuaXNUb3VjaCkge1xyXG4gICAgICAgICAgICB0aGlzLmRyYWdFbC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaG1vdmUnLCBkZF90b3VjaF8xLnRvdWNobW92ZSk7XHJcbiAgICAgICAgICAgIHRoaXMuZHJhZ0VsLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgZGRfdG91Y2hfMS50b3VjaGVuZCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAvLyBwcmV2ZW50RGVmYXVsdCgpIHByZXZlbnRzIGJsdXIgZXZlbnQgd2hpY2ggb2NjdXJzIGp1c3QgYWZ0ZXIgbW91c2Vkb3duIGV2ZW50LlxyXG4gICAgICAgIC8vIGlmIGFuIGVkaXRhYmxlIGNvbnRlbnQgaGFzIGZvY3VzLCB0aGVuIGJsdXIgbXVzdCBiZSBjYWxsXHJcbiAgICAgICAgaWYgKGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQpXHJcbiAgICAgICAgICAgIGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQuYmx1cigpO1xyXG4gICAgICAgIGRkX21hbmFnZXJfMS5ERE1hbmFnZXIubW91c2VIYW5kbGVkID0gdHJ1ZTtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuICAgIC8qKiBAaW50ZXJuYWwgbWV0aG9kIHRvIGNhbGwgYWN0dWFsIGRyYWcgZXZlbnQgKi9cclxuICAgIF9jYWxsRHJhZyhlKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLmRyYWdnaW5nKVxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgY29uc3QgZXYgPSB1dGlsc18xLlV0aWxzLmluaXRFdmVudChlLCB7IHRhcmdldDogdGhpcy5lbCwgdHlwZTogJ2RyYWcnIH0pO1xyXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbi5kcmFnKSB7XHJcbiAgICAgICAgICAgIHRoaXMub3B0aW9uLmRyYWcoZXYsIHRoaXMudWkoKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMudHJpZ2dlckV2ZW50KCdkcmFnJywgZXYpO1xyXG4gICAgfVxyXG4gICAgLyoqIEBpbnRlcm5hbCBjYWxsZWQgd2hlbiB0aGUgbWFpbiBwYWdlIChhZnRlciBzdWNjZXNzZnVsIG1vdXNlZG93bikgcmVjZWl2ZXMgYSBtb3ZlIGV2ZW50IHRvIGRyYWcgdGhlIGl0ZW0gYXJvdW5kIHRoZSBzY3JlZW4gKi9cclxuICAgIF9tb3VzZU1vdmUoZSkge1xyXG4gICAgICAgIHZhciBfYTtcclxuICAgICAgICAvLyBjb25zb2xlLmxvZyhgJHtjb3VudCsrfSBtb3ZlICR7ZS54fSwke2UueX1gKVxyXG4gICAgICAgIGxldCBzID0gdGhpcy5tb3VzZURvd25FdmVudDtcclxuICAgICAgICBpZiAodGhpcy5kcmFnZ2luZykge1xyXG4gICAgICAgICAgICB0aGlzLl9kcmFnRm9sbG93KGUpO1xyXG4gICAgICAgICAgICAvLyBkZWxheSBhY3R1YWwgZ3JpZCBoYW5kbGluZyBkcmFnIHVudGlsIHdlIHBhdXNlIGZvciBhIHdoaWxlIGlmIHNldFxyXG4gICAgICAgICAgICBpZiAoZGRfbWFuYWdlcl8xLkRETWFuYWdlci5wYXVzZURyYWcpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHBhdXNlID0gTnVtYmVyLmlzSW50ZWdlcihkZF9tYW5hZ2VyXzEuRERNYW5hZ2VyLnBhdXNlRHJhZykgPyBkZF9tYW5hZ2VyXzEuRERNYW5hZ2VyLnBhdXNlRHJhZyA6IDEwMDtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmRyYWdUaW1lb3V0KVxyXG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5jbGVhclRpbWVvdXQodGhpcy5kcmFnVGltZW91dCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRyYWdUaW1lb3V0ID0gd2luZG93LnNldFRpbWVvdXQoKCkgPT4gdGhpcy5fY2FsbERyYWcoZSksIHBhdXNlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2NhbGxEcmFnKGUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKE1hdGguYWJzKGUueCAtIHMueCkgKyBNYXRoLmFicyhlLnkgLSBzLnkpID4gMykge1xyXG4gICAgICAgICAgICAvKipcclxuICAgICAgICAgICAgICogZG9uJ3Qgc3RhcnQgdW5sZXNzIHdlJ3ZlIG1vdmVkIGF0IGxlYXN0IDMgcGl4ZWxzXHJcbiAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICB0aGlzLmRyYWdnaW5nID0gdHJ1ZTtcclxuICAgICAgICAgICAgZGRfbWFuYWdlcl8xLkRETWFuYWdlci5kcmFnRWxlbWVudCA9IHRoaXM7XHJcbiAgICAgICAgICAgIC8vIGlmIHdlJ3JlIGRyYWdnaW5nIGFuIGFjdHVhbCBncmlkIGl0ZW0sIHNldCB0aGUgY3VycmVudCBkcm9wIGFzIHRoZSBncmlkICh0byBkZXRlY3QgZW50ZXIvbGVhdmUpXHJcbiAgICAgICAgICAgIGxldCBncmlkID0gKF9hID0gdGhpcy5lbC5ncmlkc3RhY2tOb2RlKSA9PT0gbnVsbCB8fCBfYSA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2EuZ3JpZDtcclxuICAgICAgICAgICAgaWYgKGdyaWQpIHtcclxuICAgICAgICAgICAgICAgIGRkX21hbmFnZXJfMS5ERE1hbmFnZXIuZHJvcEVsZW1lbnQgPSBncmlkLmVsLmRkRWxlbWVudC5kZERyb3BwYWJsZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGRlbGV0ZSBkZF9tYW5hZ2VyXzEuRERNYW5hZ2VyLmRyb3BFbGVtZW50O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuaGVscGVyID0gdGhpcy5fY3JlYXRlSGVscGVyKGUpO1xyXG4gICAgICAgICAgICB0aGlzLl9zZXR1cEhlbHBlckNvbnRhaW5tZW50U3R5bGUoKTtcclxuICAgICAgICAgICAgdGhpcy5kcmFnT2Zmc2V0ID0gdGhpcy5fZ2V0RHJhZ09mZnNldChlLCB0aGlzLmVsLCB0aGlzLmhlbHBlckNvbnRhaW5tZW50KTtcclxuICAgICAgICAgICAgY29uc3QgZXYgPSB1dGlsc18xLlV0aWxzLmluaXRFdmVudChlLCB7IHRhcmdldDogdGhpcy5lbCwgdHlwZTogJ2RyYWdzdGFydCcgfSk7XHJcbiAgICAgICAgICAgIHRoaXMuX3NldHVwSGVscGVyU3R5bGUoZSk7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbi5zdGFydCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5vcHRpb24uc3RhcnQoZXYsIHRoaXMudWkoKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy50cmlnZ2VyRXZlbnQoJ2RyYWdzdGFydCcsIGV2KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpOyAvLyBuZWVkZWQgb3RoZXJ3aXNlIHdlIGdldCB0ZXh0IHN3ZWVwIHRleHQgc2VsZWN0aW9uIGFzIHdlIGRyYWcgYXJvdW5kXHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcbiAgICAvKiogQGludGVybmFsIGNhbGwgd2hlbiB0aGUgbW91c2UgZ2V0cyByZWxlYXNlZCB0byBkcm9wIHRoZSBpdGVtIGF0IGN1cnJlbnQgbG9jYXRpb24gKi9cclxuICAgIF9tb3VzZVVwKGUpIHtcclxuICAgICAgICB2YXIgX2E7XHJcbiAgICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgdGhpcy5fbW91c2VNb3ZlLCB0cnVlKTtcclxuICAgICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgdGhpcy5fbW91c2VVcCwgdHJ1ZSk7XHJcbiAgICAgICAgaWYgKGRkX3RvdWNoXzEuaXNUb3VjaCkge1xyXG4gICAgICAgICAgICB0aGlzLmRyYWdFbC5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaG1vdmUnLCBkZF90b3VjaF8xLnRvdWNobW92ZSwgdHJ1ZSk7XHJcbiAgICAgICAgICAgIHRoaXMuZHJhZ0VsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgZGRfdG91Y2hfMS50b3VjaGVuZCwgdHJ1ZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLmRyYWdnaW5nKSB7XHJcbiAgICAgICAgICAgIGRlbGV0ZSB0aGlzLmRyYWdnaW5nO1xyXG4gICAgICAgICAgICAvLyByZXNldCB0aGUgZHJvcCB0YXJnZXQgaWYgZHJhZ2dpbmcgb3ZlciBvdXJzZWxmIChhbHJlYWR5IHBhcmVudGVkLCBqdXN0IG1vdmluZyBkdXJpbmcgc3RvcCBjYWxsYmFjayBiZWxvdylcclxuICAgICAgICAgICAgaWYgKCgoX2EgPSBkZF9tYW5hZ2VyXzEuRERNYW5hZ2VyLmRyb3BFbGVtZW50KSA9PT0gbnVsbCB8fCBfYSA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2EuZWwpID09PSB0aGlzLmVsLnBhcmVudEVsZW1lbnQpIHtcclxuICAgICAgICAgICAgICAgIGRlbGV0ZSBkZF9tYW5hZ2VyXzEuRERNYW5hZ2VyLmRyb3BFbGVtZW50O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuaGVscGVyQ29udGFpbm1lbnQuc3R5bGUucG9zaXRpb24gPSB0aGlzLnBhcmVudE9yaWdpblN0eWxlUG9zaXRpb24gfHwgbnVsbDtcclxuICAgICAgICAgICAgaWYgKHRoaXMuaGVscGVyID09PSB0aGlzLmVsKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9yZW1vdmVIZWxwZXJTdHlsZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5oZWxwZXIucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc3QgZXYgPSB1dGlsc18xLlV0aWxzLmluaXRFdmVudChlLCB7IHRhcmdldDogdGhpcy5lbCwgdHlwZTogJ2RyYWdzdG9wJyB9KTtcclxuICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9uLnN0b3ApIHtcclxuICAgICAgICAgICAgICAgIHRoaXMub3B0aW9uLnN0b3AoZXYpOyAvLyBOT1RFOiBkZXN0cm95KCkgd2lsbCBiZSBjYWxsZWQgd2hlbiByZW1vdmluZyBpdGVtLCBzbyBleHBlY3QgTlVMTCBwdHIgYWZ0ZXIhXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy50cmlnZ2VyRXZlbnQoJ2RyYWdzdG9wJywgZXYpO1xyXG4gICAgICAgICAgICAvLyBjYWxsIHRoZSBkcm9wcGFibGUgbWV0aG9kIHRvIHJlY2VpdmUgdGhlIGl0ZW1cclxuICAgICAgICAgICAgaWYgKGRkX21hbmFnZXJfMS5ERE1hbmFnZXIuZHJvcEVsZW1lbnQpIHtcclxuICAgICAgICAgICAgICAgIGRkX21hbmFnZXJfMS5ERE1hbmFnZXIuZHJvcEVsZW1lbnQuZHJvcChlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBkZWxldGUgdGhpcy5oZWxwZXI7XHJcbiAgICAgICAgZGVsZXRlIHRoaXMubW91c2VEb3duRXZlbnQ7XHJcbiAgICAgICAgZGVsZXRlIGRkX21hbmFnZXJfMS5ERE1hbmFnZXIuZHJhZ0VsZW1lbnQ7XHJcbiAgICAgICAgZGVsZXRlIGRkX21hbmFnZXJfMS5ERE1hbmFnZXIuZHJvcEVsZW1lbnQ7XHJcbiAgICAgICAgZGVsZXRlIGRkX21hbmFnZXJfMS5ERE1hbmFnZXIubW91c2VIYW5kbGVkO1xyXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgIH1cclxuICAgIC8qKiBAaW50ZXJuYWwgY3JlYXRlIGEgY2xvbmUgY29weSAob3IgdXNlciBkZWZpbmVkIG1ldGhvZCkgb2YgdGhlIG9yaWdpbmFsIGRyYWcgaXRlbSBpZiBzZXQgKi9cclxuICAgIF9jcmVhdGVIZWxwZXIoZXZlbnQpIHtcclxuICAgICAgICBsZXQgaGVscGVyID0gdGhpcy5lbDtcclxuICAgICAgICBpZiAodHlwZW9mIHRoaXMub3B0aW9uLmhlbHBlciA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgICAgICBoZWxwZXIgPSB0aGlzLm9wdGlvbi5oZWxwZXIoZXZlbnQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICh0aGlzLm9wdGlvbi5oZWxwZXIgPT09ICdjbG9uZScpIHtcclxuICAgICAgICAgICAgaGVscGVyID0gdXRpbHNfMS5VdGlscy5jbG9uZU5vZGUodGhpcy5lbCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghZG9jdW1lbnQuYm9keS5jb250YWlucyhoZWxwZXIpKSB7XHJcbiAgICAgICAgICAgIHV0aWxzXzEuVXRpbHMuYXBwZW5kVG8oaGVscGVyLCB0aGlzLm9wdGlvbi5hcHBlbmRUbyA9PT0gJ3BhcmVudCcgPyB0aGlzLmVsLnBhcmVudE5vZGUgOiB0aGlzLm9wdGlvbi5hcHBlbmRUbyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChoZWxwZXIgPT09IHRoaXMuZWwpIHtcclxuICAgICAgICAgICAgdGhpcy5kcmFnRWxlbWVudE9yaWdpblN0eWxlID0gREREcmFnZ2FibGUub3JpZ2luU3R5bGVQcm9wLm1hcChwcm9wID0+IHRoaXMuZWwuc3R5bGVbcHJvcF0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gaGVscGVyO1xyXG4gICAgfVxyXG4gICAgLyoqIEBpbnRlcm5hbCBzZXQgdGhlIGZpeCBwb3NpdGlvbiBvZiB0aGUgZHJhZ2dlZCBpdGVtICovXHJcbiAgICBfc2V0dXBIZWxwZXJTdHlsZShlKSB7XHJcbiAgICAgICAgdGhpcy5oZWxwZXIuY2xhc3NMaXN0LmFkZCgndWktZHJhZ2dhYmxlLWRyYWdnaW5nJyk7XHJcbiAgICAgICAgLy8gVE9ETzogc2V0IGFsbCBhdCBvbmNlIHdpdGggc3R5bGUuY3NzVGV4dCArPSAuLi4gPyBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8zOTY4NTkzXHJcbiAgICAgICAgY29uc3Qgc3R5bGUgPSB0aGlzLmhlbHBlci5zdHlsZTtcclxuICAgICAgICBzdHlsZS5wb2ludGVyRXZlbnRzID0gJ25vbmUnOyAvLyBuZWVkZWQgZm9yIG92ZXIgaXRlbXMgdG8gZ2V0IGVudGVyL2xlYXZlXHJcbiAgICAgICAgLy8gc3R5bGUuY3Vyc29yID0gJ21vdmUnOyAvLyAgVE9ETzogY2FuJ3Qgc2V0IHdpdGggcG9pbnRlckV2ZW50cz1ub25lICEgKGRvbmUgaW4gQ1NTIGFzIHdlbGwpXHJcbiAgICAgICAgc3R5bGVbJ21pbi13aWR0aCddID0gMDsgLy8gc2luY2Ugd2Ugbm8gbG9uZ2VyIHJlbGF0aXZlIHRvIG91ciBwYXJlbnQgYW5kIHdlIGRvbid0IHJlc2l6ZSBhbnl3YXkgKG5vcm1hbGx5IDEwMC8jY29sdW1uICUpXHJcbiAgICAgICAgc3R5bGUud2lkdGggPSB0aGlzLmRyYWdPZmZzZXQud2lkdGggKyAncHgnO1xyXG4gICAgICAgIHN0eWxlLmhlaWdodCA9IHRoaXMuZHJhZ09mZnNldC5oZWlnaHQgKyAncHgnO1xyXG4gICAgICAgIHN0eWxlLndpbGxDaGFuZ2UgPSAnbGVmdCwgdG9wJztcclxuICAgICAgICBzdHlsZS5wb3NpdGlvbiA9ICdmaXhlZCc7IC8vIGxldCB1cyBkcmFnIGJldHdlZW4gZ3JpZHMgYnkgbm90IGNsaXBwaW5nIGFzIHBhcmVudCAuZ3JpZC1zdGFjayBpcyBwb3NpdGlvbjogJ3JlbGF0aXZlJ1xyXG4gICAgICAgIHRoaXMuX2RyYWdGb2xsb3coZSk7IC8vIG5vdyBwb3NpdGlvbiBpdFxyXG4gICAgICAgIHN0eWxlLnRyYW5zaXRpb24gPSAnbm9uZSc7IC8vIHNob3cgdXAgaW5zdGFudGx5XHJcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmhlbHBlcikge1xyXG4gICAgICAgICAgICAgICAgc3R5bGUudHJhbnNpdGlvbiA9IG51bGw7IC8vIHJlY292ZXIgYW5pbWF0aW9uXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LCAwKTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuICAgIC8qKiBAaW50ZXJuYWwgcmVzdG9yZSBiYWNrIHRoZSBvcmlnaW5hbCBzdHlsZSBiZWZvcmUgZHJhZ2dpbmcgKi9cclxuICAgIF9yZW1vdmVIZWxwZXJTdHlsZSgpIHtcclxuICAgICAgICB2YXIgX2E7XHJcbiAgICAgICAgdGhpcy5oZWxwZXIuY2xhc3NMaXN0LnJlbW92ZSgndWktZHJhZ2dhYmxlLWRyYWdnaW5nJyk7XHJcbiAgICAgICAgbGV0IG5vZGUgPSAoX2EgPSB0aGlzLmhlbHBlcikgPT09IG51bGwgfHwgX2EgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9hLmdyaWRzdGFja05vZGU7XHJcbiAgICAgICAgLy8gZG9uJ3QgYm90aGVyIHJlc3RvcmluZyBzdHlsZXMgaWYgd2UncmUgZ29ubmEgcmVtb3ZlIGFueXdheS4uLlxyXG4gICAgICAgIGlmICghKG5vZGUgPT09IG51bGwgfHwgbm9kZSA9PT0gdm9pZCAwID8gdm9pZCAwIDogbm9kZS5faXNBYm91dFRvUmVtb3ZlKSAmJiB0aGlzLmRyYWdFbGVtZW50T3JpZ2luU3R5bGUpIHtcclxuICAgICAgICAgICAgbGV0IGhlbHBlciA9IHRoaXMuaGVscGVyO1xyXG4gICAgICAgICAgICAvLyBkb24ndCBhbmltYXRlLCBvdGhlcndpc2Ugd2UgYW5pbWF0ZSBvZmZzZXRlZCB3aGVuIHN3aXRjaGluZyBiYWNrIHRvICdhYnNvbHV0ZScgZnJvbSAnZml4ZWQnLlxyXG4gICAgICAgICAgICAvLyBUT0RPOiB0aGlzIGFsc28gcmVtb3ZlcyByZXNpemluZyBhbmltYXRpb24gd2hpY2ggZG9lc24ndCBoYXZlIHRoaXMgaXNzdWUsIGJ1dCBvdGhlcnMuXHJcbiAgICAgICAgICAgIC8vIElkZWFsbHkgYm90aCB3b3VsZCBhbmltYXRlICgnbW92ZScgd291bGQgaW1tZWRpYXRlbHkgcmVzdG9yZSAnYWJzb2x1dGUnIGFuZCBhZGp1c3QgY29vcmRpbmF0ZSB0byBtYXRjaCxcclxuICAgICAgICAgICAgLy8gdGhlbiB0cmlnZ2VyIGEgZGVsYXkgKHJlcGFpbnQpIHRvIHJlc3RvcmUgdG8gZmluYWwgZGVzdCB3aXRoIGFuaW1hdGUpIGJ1dCB0aGVuIHdlIG5lZWQgdG8gbWFrZSBzdXJlICdyZXNpemVzdG9wJ1xyXG4gICAgICAgICAgICAvLyBpcyBjYWxsZWQgQUZURVIgJ3RyYW5zaXRpb25lbmQnIGV2ZW50IGlzIHJlY2VpdmVkIChzZWUgaHR0cHM6Ly9naXRodWIuY29tL2dyaWRzdGFjay9ncmlkc3RhY2suanMvaXNzdWVzLzIwMzMpXHJcbiAgICAgICAgICAgIGxldCB0cmFuc2l0aW9uID0gdGhpcy5kcmFnRWxlbWVudE9yaWdpblN0eWxlWyd0cmFuc2l0aW9uJ10gfHwgbnVsbDtcclxuICAgICAgICAgICAgaGVscGVyLnN0eWxlLnRyYW5zaXRpb24gPSB0aGlzLmRyYWdFbGVtZW50T3JpZ2luU3R5bGVbJ3RyYW5zaXRpb24nXSA9ICdub25lJzsgLy8gY2FuJ3QgYmUgTlVMTCAjMTk3M1xyXG4gICAgICAgICAgICBERERyYWdnYWJsZS5vcmlnaW5TdHlsZVByb3AuZm9yRWFjaChwcm9wID0+IGhlbHBlci5zdHlsZVtwcm9wXSA9IHRoaXMuZHJhZ0VsZW1lbnRPcmlnaW5TdHlsZVtwcm9wXSB8fCBudWxsKTtcclxuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiBoZWxwZXIuc3R5bGUudHJhbnNpdGlvbiA9IHRyYW5zaXRpb24sIDUwKTsgLy8gcmVjb3ZlciBhbmltYXRpb24gZnJvbSBzYXZlZCB2YXJzIGFmdGVyIGEgcGF1c2UgKDAgaXNuJ3QgZW5vdWdoICMxOTczKVxyXG4gICAgICAgIH1cclxuICAgICAgICBkZWxldGUgdGhpcy5kcmFnRWxlbWVudE9yaWdpblN0eWxlO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG4gICAgLyoqIEBpbnRlcm5hbCB1cGRhdGVzIHRoZSB0b3AvbGVmdCBwb3NpdGlvbiB0byBmb2xsb3cgdGhlIG1vdXNlICovXHJcbiAgICBfZHJhZ0ZvbGxvdyhlKSB7XHJcbiAgICAgICAgbGV0IGNvbnRhaW5tZW50UmVjdCA9IHsgbGVmdDogMCwgdG9wOiAwIH07XHJcbiAgICAgICAgLy8gaWYgKHRoaXMuaGVscGVyLnN0eWxlLnBvc2l0aW9uID09PSAnYWJzb2x1dGUnKSB7IC8vIHdlIHVzZSAnZml4ZWQnXHJcbiAgICAgICAgLy8gICBjb25zdCB7IGxlZnQsIHRvcCB9ID0gdGhpcy5oZWxwZXJDb250YWlubWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcclxuICAgICAgICAvLyAgIGNvbnRhaW5tZW50UmVjdCA9IHsgbGVmdCwgdG9wIH07XHJcbiAgICAgICAgLy8gfVxyXG4gICAgICAgIGNvbnN0IHN0eWxlID0gdGhpcy5oZWxwZXIuc3R5bGU7XHJcbiAgICAgICAgY29uc3Qgb2Zmc2V0ID0gdGhpcy5kcmFnT2Zmc2V0O1xyXG4gICAgICAgIHN0eWxlLmxlZnQgPSBlLmNsaWVudFggKyBvZmZzZXQub2Zmc2V0TGVmdCAtIGNvbnRhaW5tZW50UmVjdC5sZWZ0ICsgJ3B4JztcclxuICAgICAgICBzdHlsZS50b3AgPSBlLmNsaWVudFkgKyBvZmZzZXQub2Zmc2V0VG9wIC0gY29udGFpbm1lbnRSZWN0LnRvcCArICdweCc7XHJcbiAgICB9XHJcbiAgICAvKiogQGludGVybmFsICovXHJcbiAgICBfc2V0dXBIZWxwZXJDb250YWlubWVudFN0eWxlKCkge1xyXG4gICAgICAgIHRoaXMuaGVscGVyQ29udGFpbm1lbnQgPSB0aGlzLmhlbHBlci5wYXJlbnRFbGVtZW50O1xyXG4gICAgICAgIGlmICh0aGlzLmhlbHBlci5zdHlsZS5wb3NpdGlvbiAhPT0gJ2ZpeGVkJykge1xyXG4gICAgICAgICAgICB0aGlzLnBhcmVudE9yaWdpblN0eWxlUG9zaXRpb24gPSB0aGlzLmhlbHBlckNvbnRhaW5tZW50LnN0eWxlLnBvc2l0aW9uO1xyXG4gICAgICAgICAgICBpZiAod2luZG93LmdldENvbXB1dGVkU3R5bGUodGhpcy5oZWxwZXJDb250YWlubWVudCkucG9zaXRpb24ubWF0Y2goL3N0YXRpYy8pKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmhlbHBlckNvbnRhaW5tZW50LnN0eWxlLnBvc2l0aW9uID0gJ3JlbGF0aXZlJztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuICAgIC8qKiBAaW50ZXJuYWwgKi9cclxuICAgIF9nZXREcmFnT2Zmc2V0KGV2ZW50LCBlbCwgcGFyZW50KSB7XHJcbiAgICAgICAgLy8gaW4gY2FzZSBhbmNlc3RvciBoYXMgdHJhbnNmb3JtL3BlcnNwZWN0aXZlIGNzcyBwcm9wZXJ0aWVzIHRoYXQgY2hhbmdlIHRoZSB2aWV3cG9pbnRcclxuICAgICAgICBsZXQgeGZvcm1PZmZzZXRYID0gMDtcclxuICAgICAgICBsZXQgeGZvcm1PZmZzZXRZID0gMDtcclxuICAgICAgICBpZiAocGFyZW50KSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHRlc3RFbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gICAgICAgICAgICB1dGlsc18xLlV0aWxzLmFkZEVsU3R5bGVzKHRlc3RFbCwge1xyXG4gICAgICAgICAgICAgICAgb3BhY2l0eTogJzAnLFxyXG4gICAgICAgICAgICAgICAgcG9zaXRpb246ICdmaXhlZCcsXHJcbiAgICAgICAgICAgICAgICB0b3A6IDAgKyAncHgnLFxyXG4gICAgICAgICAgICAgICAgbGVmdDogMCArICdweCcsXHJcbiAgICAgICAgICAgICAgICB3aWR0aDogJzFweCcsXHJcbiAgICAgICAgICAgICAgICBoZWlnaHQ6ICcxcHgnLFxyXG4gICAgICAgICAgICAgICAgekluZGV4OiAnLTk5OTk5OScsXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBwYXJlbnQuYXBwZW5kQ2hpbGQodGVzdEVsKTtcclxuICAgICAgICAgICAgY29uc3QgdGVzdEVsUG9zaXRpb24gPSB0ZXN0RWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcbiAgICAgICAgICAgIHBhcmVudC5yZW1vdmVDaGlsZCh0ZXN0RWwpO1xyXG4gICAgICAgICAgICB4Zm9ybU9mZnNldFggPSB0ZXN0RWxQb3NpdGlvbi5sZWZ0O1xyXG4gICAgICAgICAgICB4Zm9ybU9mZnNldFkgPSB0ZXN0RWxQb3NpdGlvbi50b3A7XHJcbiAgICAgICAgICAgIC8vIFRPRE86IHNjYWxlID9cclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgdGFyZ2V0T2Zmc2V0ID0gZWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgbGVmdDogdGFyZ2V0T2Zmc2V0LmxlZnQsXHJcbiAgICAgICAgICAgIHRvcDogdGFyZ2V0T2Zmc2V0LnRvcCxcclxuICAgICAgICAgICAgb2Zmc2V0TGVmdDogLWV2ZW50LmNsaWVudFggKyB0YXJnZXRPZmZzZXQubGVmdCAtIHhmb3JtT2Zmc2V0WCxcclxuICAgICAgICAgICAgb2Zmc2V0VG9wOiAtZXZlbnQuY2xpZW50WSArIHRhcmdldE9mZnNldC50b3AgLSB4Zm9ybU9mZnNldFksXHJcbiAgICAgICAgICAgIHdpZHRoOiB0YXJnZXRPZmZzZXQud2lkdGgsXHJcbiAgICAgICAgICAgIGhlaWdodDogdGFyZ2V0T2Zmc2V0LmhlaWdodFxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcbiAgICAvKiogQGludGVybmFsIFRPRE86IHNldCB0byBwdWJsaWMgYXMgY2FsbGVkIGJ5IERERHJvcHBhYmxlISAqL1xyXG4gICAgdWkoKSB7XHJcbiAgICAgICAgY29uc3QgY29udGFpbm1lbnRFbCA9IHRoaXMuZWwucGFyZW50RWxlbWVudDtcclxuICAgICAgICBjb25zdCBjb250YWlubWVudFJlY3QgPSBjb250YWlubWVudEVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xyXG4gICAgICAgIGNvbnN0IG9mZnNldCA9IHRoaXMuaGVscGVyLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHBvc2l0aW9uOiB7XHJcbiAgICAgICAgICAgICAgICB0b3A6IG9mZnNldC50b3AgLSBjb250YWlubWVudFJlY3QudG9wLFxyXG4gICAgICAgICAgICAgICAgbGVmdDogb2Zmc2V0LmxlZnQgLSBjb250YWlubWVudFJlY3QubGVmdFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8qIG5vdCB1c2VkIGJ5IEdyaWRTdGFjayBmb3Igbm93Li4uXHJcbiAgICAgICAgICAgIGhlbHBlcjogW3RoaXMuaGVscGVyXSwgLy9UaGUgb2JqZWN0IGFyciByZXByZXNlbnRpbmcgdGhlIGhlbHBlciB0aGF0J3MgYmVpbmcgZHJhZ2dlZC5cclxuICAgICAgICAgICAgb2Zmc2V0OiB7IHRvcDogb2Zmc2V0LnRvcCwgbGVmdDogb2Zmc2V0LmxlZnQgfSAvLyBDdXJyZW50IG9mZnNldCBwb3NpdGlvbiBvZiB0aGUgaGVscGVyIGFzIHsgdG9wLCBsZWZ0IH0gb2JqZWN0LlxyXG4gICAgICAgICAgICAqL1xyXG4gICAgICAgIH07XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0cy5ERERyYWdnYWJsZSA9IERERHJhZ2dhYmxlO1xyXG4vKiogQGludGVybmFsIHByb3BlcnRpZXMgd2UgY2hhbmdlIGR1cmluZyBkcmFnZ2luZywgYW5kIHJlc3RvcmUgYmFjayAqL1xyXG5ERERyYWdnYWJsZS5vcmlnaW5TdHlsZVByb3AgPSBbJ3RyYW5zaXRpb24nLCAncG9pbnRlckV2ZW50cycsICdwb3NpdGlvbicsICdsZWZ0JywgJ3RvcCcsICdtaW5XaWR0aCcsICd3aWxsQ2hhbmdlJ107XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRkLWRyYWdnYWJsZS5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcclxuLyoqXHJcbiAqIGRkLWRyb3BwYWJsZS50cyA3LjMuMFxyXG4gKiBDb3B5cmlnaHQgKGMpIDIwMjEtMjAyMiBBbGFpbiBEdW1lc255IC0gc2VlIEdyaWRTdGFjayByb290IGxpY2Vuc2VcclxuICovXHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcclxuZXhwb3J0cy5ERERyb3BwYWJsZSA9IHZvaWQgMDtcclxuY29uc3QgZGRfbWFuYWdlcl8xID0gcmVxdWlyZShcIi4vZGQtbWFuYWdlclwiKTtcclxuY29uc3QgZGRfYmFzZV9pbXBsXzEgPSByZXF1aXJlKFwiLi9kZC1iYXNlLWltcGxcIik7XHJcbmNvbnN0IHV0aWxzXzEgPSByZXF1aXJlKFwiLi91dGlsc1wiKTtcclxuY29uc3QgZGRfdG91Y2hfMSA9IHJlcXVpcmUoXCIuL2RkLXRvdWNoXCIpO1xyXG4vLyBsZXQgY291bnQgPSAwOyAvLyBURVNUXHJcbmNsYXNzIERERHJvcHBhYmxlIGV4dGVuZHMgZGRfYmFzZV9pbXBsXzEuRERCYXNlSW1wbGVtZW50IHtcclxuICAgIGNvbnN0cnVjdG9yKGVsLCBvcHRzID0ge30pIHtcclxuICAgICAgICBzdXBlcigpO1xyXG4gICAgICAgIHRoaXMuZWwgPSBlbDtcclxuICAgICAgICB0aGlzLm9wdGlvbiA9IG9wdHM7XHJcbiAgICAgICAgLy8gY3JlYXRlIHZhciBldmVudCBiaW5kaW5nIHNvIHdlIGNhbiBlYXNpbHkgcmVtb3ZlIGFuZCBzdGlsbCBsb29rIGxpa2UgVFMgbWV0aG9kcyAodW5saWtlIGFub255bW91cyBmdW5jdGlvbnMpXHJcbiAgICAgICAgdGhpcy5fbW91c2VFbnRlciA9IHRoaXMuX21vdXNlRW50ZXIuYmluZCh0aGlzKTtcclxuICAgICAgICB0aGlzLl9tb3VzZUxlYXZlID0gdGhpcy5fbW91c2VMZWF2ZS5iaW5kKHRoaXMpO1xyXG4gICAgICAgIHRoaXMuZW5hYmxlKCk7XHJcbiAgICAgICAgdGhpcy5fc2V0dXBBY2NlcHQoKTtcclxuICAgIH1cclxuICAgIG9uKGV2ZW50LCBjYWxsYmFjaykge1xyXG4gICAgICAgIHN1cGVyLm9uKGV2ZW50LCBjYWxsYmFjayk7XHJcbiAgICB9XHJcbiAgICBvZmYoZXZlbnQpIHtcclxuICAgICAgICBzdXBlci5vZmYoZXZlbnQpO1xyXG4gICAgfVxyXG4gICAgZW5hYmxlKCkge1xyXG4gICAgICAgIGlmICh0aGlzLmRpc2FibGVkID09PSBmYWxzZSlcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIHN1cGVyLmVuYWJsZSgpO1xyXG4gICAgICAgIHRoaXMuZWwuY2xhc3NMaXN0LmFkZCgndWktZHJvcHBhYmxlJyk7XHJcbiAgICAgICAgdGhpcy5lbC5jbGFzc0xpc3QucmVtb3ZlKCd1aS1kcm9wcGFibGUtZGlzYWJsZWQnKTtcclxuICAgICAgICB0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZW50ZXInLCB0aGlzLl9tb3VzZUVudGVyKTtcclxuICAgICAgICB0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbGVhdmUnLCB0aGlzLl9tb3VzZUxlYXZlKTtcclxuICAgICAgICBpZiAoZGRfdG91Y2hfMS5pc1RvdWNoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZWwuYWRkRXZlbnRMaXN0ZW5lcigncG9pbnRlcmVudGVyJywgZGRfdG91Y2hfMS5wb2ludGVyZW50ZXIpO1xyXG4gICAgICAgICAgICB0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIoJ3BvaW50ZXJsZWF2ZScsIGRkX3RvdWNoXzEucG9pbnRlcmxlYXZlKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBkaXNhYmxlKGZvckRlc3Ryb3kgPSBmYWxzZSkge1xyXG4gICAgICAgIGlmICh0aGlzLmRpc2FibGVkID09PSB0cnVlKVxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgc3VwZXIuZGlzYWJsZSgpO1xyXG4gICAgICAgIHRoaXMuZWwuY2xhc3NMaXN0LnJlbW92ZSgndWktZHJvcHBhYmxlJyk7XHJcbiAgICAgICAgaWYgKCFmb3JEZXN0cm95KVxyXG4gICAgICAgICAgICB0aGlzLmVsLmNsYXNzTGlzdC5hZGQoJ3VpLWRyb3BwYWJsZS1kaXNhYmxlZCcpO1xyXG4gICAgICAgIHRoaXMuZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2VlbnRlcicsIHRoaXMuX21vdXNlRW50ZXIpO1xyXG4gICAgICAgIHRoaXMuZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2VsZWF2ZScsIHRoaXMuX21vdXNlTGVhdmUpO1xyXG4gICAgICAgIGlmIChkZF90b3VjaF8xLmlzVG91Y2gpIHtcclxuICAgICAgICAgICAgdGhpcy5lbC5yZW1vdmVFdmVudExpc3RlbmVyKCdwb2ludGVyZW50ZXInLCBkZF90b3VjaF8xLnBvaW50ZXJlbnRlcik7XHJcbiAgICAgICAgICAgIHRoaXMuZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcigncG9pbnRlcmxlYXZlJywgZGRfdG91Y2hfMS5wb2ludGVybGVhdmUpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGRlc3Ryb3koKSB7XHJcbiAgICAgICAgdGhpcy5kaXNhYmxlKHRydWUpO1xyXG4gICAgICAgIHRoaXMuZWwuY2xhc3NMaXN0LnJlbW92ZSgndWktZHJvcHBhYmxlJyk7XHJcbiAgICAgICAgdGhpcy5lbC5jbGFzc0xpc3QucmVtb3ZlKCd1aS1kcm9wcGFibGUtZGlzYWJsZWQnKTtcclxuICAgICAgICBzdXBlci5kZXN0cm95KCk7XHJcbiAgICB9XHJcbiAgICB1cGRhdGVPcHRpb24ob3B0cykge1xyXG4gICAgICAgIE9iamVjdC5rZXlzKG9wdHMpLmZvckVhY2goa2V5ID0+IHRoaXMub3B0aW9uW2tleV0gPSBvcHRzW2tleV0pO1xyXG4gICAgICAgIHRoaXMuX3NldHVwQWNjZXB0KCk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbiAgICAvKiogQGludGVybmFsIGNhbGxlZCB3aGVuIHRoZSBjdXJzb3IgZW50ZXJzIG91ciBhcmVhIC0gcHJlcGFyZSBmb3IgYSBwb3NzaWJsZSBkcm9wIGFuZCB0cmFjayBsZWF2aW5nICovXHJcbiAgICBfbW91c2VFbnRlcihlKSB7XHJcbiAgICAgICAgLy8gY29uc29sZS5sb2coYCR7Y291bnQrK30gRW50ZXIgJHt0aGlzLmVsLmlkIHx8ICh0aGlzLmVsIGFzIEdyaWRIVE1MRWxlbWVudCkuZ3JpZHN0YWNrLm9wdHMuaWR9YCk7IC8vIFRFU1RcclxuICAgICAgICBpZiAoIWRkX21hbmFnZXJfMS5ERE1hbmFnZXIuZHJhZ0VsZW1lbnQpXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICBpZiAoIXRoaXMuX2NhbkRyb3AoZGRfbWFuYWdlcl8xLkRETWFuYWdlci5kcmFnRWxlbWVudC5lbCkpXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICAvLyBtYWtlIHN1cmUgd2hlbiB3ZSBlbnRlciB0aGlzLCB0aGF0IHRoZSBsYXN0IG9uZSBnZXRzIGEgbGVhdmUgRklSU1QgdG8gY29ycmVjdGx5IGNsZWFudXAgYXMgd2UgZG9uJ3QgYWx3YXlzIGRvXHJcbiAgICAgICAgaWYgKGRkX21hbmFnZXJfMS5ERE1hbmFnZXIuZHJvcEVsZW1lbnQgJiYgZGRfbWFuYWdlcl8xLkRETWFuYWdlci5kcm9wRWxlbWVudCAhPT0gdGhpcykge1xyXG4gICAgICAgICAgICBkZF9tYW5hZ2VyXzEuRERNYW5hZ2VyLmRyb3BFbGVtZW50Ll9tb3VzZUxlYXZlKGUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBkZF9tYW5hZ2VyXzEuRERNYW5hZ2VyLmRyb3BFbGVtZW50ID0gdGhpcztcclxuICAgICAgICBjb25zdCBldiA9IHV0aWxzXzEuVXRpbHMuaW5pdEV2ZW50KGUsIHsgdGFyZ2V0OiB0aGlzLmVsLCB0eXBlOiAnZHJvcG92ZXInIH0pO1xyXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbi5vdmVyKSB7XHJcbiAgICAgICAgICAgIHRoaXMub3B0aW9uLm92ZXIoZXYsIHRoaXMuX3VpKGRkX21hbmFnZXJfMS5ERE1hbmFnZXIuZHJhZ0VsZW1lbnQpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy50cmlnZ2VyRXZlbnQoJ2Ryb3BvdmVyJywgZXYpO1xyXG4gICAgICAgIHRoaXMuZWwuY2xhc3NMaXN0LmFkZCgndWktZHJvcHBhYmxlLW92ZXInKTtcclxuICAgICAgICAvLyBjb25zb2xlLmxvZygndHJhY2tpbmcnKTsgLy8gVEVTVFxyXG4gICAgfVxyXG4gICAgLyoqIEBpbnRlcm5hbCBjYWxsZWQgd2hlbiB0aGUgaXRlbSBpcyBsZWF2aW5nIG91ciBhcmVhLCBzdG9wIHRyYWNraW5nIGlmIHdlIGhhZCBtb3ZpbmcgaXRlbSAqL1xyXG4gICAgX21vdXNlTGVhdmUoZSkge1xyXG4gICAgICAgIHZhciBfYTtcclxuICAgICAgICAvLyBjb25zb2xlLmxvZyhgJHtjb3VudCsrfSBMZWF2ZSAke3RoaXMuZWwuaWQgfHwgKHRoaXMuZWwgYXMgR3JpZEhUTUxFbGVtZW50KS5ncmlkc3RhY2sub3B0cy5pZH1gKTsgLy8gVEVTVFxyXG4gICAgICAgIGlmICghZGRfbWFuYWdlcl8xLkRETWFuYWdlci5kcmFnRWxlbWVudCB8fCBkZF9tYW5hZ2VyXzEuRERNYW5hZ2VyLmRyb3BFbGVtZW50ICE9PSB0aGlzKVxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgY29uc3QgZXYgPSB1dGlsc18xLlV0aWxzLmluaXRFdmVudChlLCB7IHRhcmdldDogdGhpcy5lbCwgdHlwZTogJ2Ryb3BvdXQnIH0pO1xyXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbi5vdXQpIHtcclxuICAgICAgICAgICAgdGhpcy5vcHRpb24ub3V0KGV2LCB0aGlzLl91aShkZF9tYW5hZ2VyXzEuRERNYW5hZ2VyLmRyYWdFbGVtZW50KSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMudHJpZ2dlckV2ZW50KCdkcm9wb3V0JywgZXYpO1xyXG4gICAgICAgIGlmIChkZF9tYW5hZ2VyXzEuRERNYW5hZ2VyLmRyb3BFbGVtZW50ID09PSB0aGlzKSB7XHJcbiAgICAgICAgICAgIGRlbGV0ZSBkZF9tYW5hZ2VyXzEuRERNYW5hZ2VyLmRyb3BFbGVtZW50O1xyXG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZygnbm90IHRyYWNraW5nJyk7IC8vIFRFU1RcclxuICAgICAgICAgICAgLy8gaWYgd2UncmUgc3RpbGwgb3ZlciBhIHBhcmVudCBkcm9wcGFibGUsIHNlbmQgaXQgYW4gZW50ZXIgYXMgd2UgZG9uJ3QgZ2V0IG9uZSBmcm9tIGxlYXZpbmcgbmVzdGVkIGNoaWxkcmVuXHJcbiAgICAgICAgICAgIGxldCBwYXJlbnREcm9wO1xyXG4gICAgICAgICAgICBsZXQgcGFyZW50ID0gdGhpcy5lbC5wYXJlbnRFbGVtZW50O1xyXG4gICAgICAgICAgICB3aGlsZSAoIXBhcmVudERyb3AgJiYgcGFyZW50KSB7XHJcbiAgICAgICAgICAgICAgICBwYXJlbnREcm9wID0gKF9hID0gcGFyZW50LmRkRWxlbWVudCkgPT09IG51bGwgfHwgX2EgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9hLmRkRHJvcHBhYmxlO1xyXG4gICAgICAgICAgICAgICAgcGFyZW50ID0gcGFyZW50LnBhcmVudEVsZW1lbnQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHBhcmVudERyb3ApIHtcclxuICAgICAgICAgICAgICAgIHBhcmVudERyb3AuX21vdXNlRW50ZXIoZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvKiogaXRlbSBpcyBiZWluZyBkcm9wcGVkIG9uIHVzIC0gY2FsbGVkIGJ5IHRoZSBkcmFnIG1vdXNldXAgaGFuZGxlciAtIHRoaXMgY2FsbHMgdGhlIGNsaWVudCBkcm9wIGV2ZW50ICovXHJcbiAgICBkcm9wKGUpIHtcclxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgY29uc3QgZXYgPSB1dGlsc18xLlV0aWxzLmluaXRFdmVudChlLCB7IHRhcmdldDogdGhpcy5lbCwgdHlwZTogJ2Ryb3AnIH0pO1xyXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbi5kcm9wKSB7XHJcbiAgICAgICAgICAgIHRoaXMub3B0aW9uLmRyb3AoZXYsIHRoaXMuX3VpKGRkX21hbmFnZXJfMS5ERE1hbmFnZXIuZHJhZ0VsZW1lbnQpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy50cmlnZ2VyRXZlbnQoJ2Ryb3AnLCBldik7XHJcbiAgICB9XHJcbiAgICAvKiogQGludGVybmFsIHRydWUgaWYgZWxlbWVudCBtYXRjaGVzIHRoZSBzdHJpbmcvbWV0aG9kIGFjY2VwdCBvcHRpb24gKi9cclxuICAgIF9jYW5Ecm9wKGVsKSB7XHJcbiAgICAgICAgcmV0dXJuIGVsICYmICghdGhpcy5hY2NlcHQgfHwgdGhpcy5hY2NlcHQoZWwpKTtcclxuICAgIH1cclxuICAgIC8qKiBAaW50ZXJuYWwgKi9cclxuICAgIF9zZXR1cEFjY2VwdCgpIHtcclxuICAgICAgICBpZiAoIXRoaXMub3B0aW9uLmFjY2VwdClcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgaWYgKHR5cGVvZiB0aGlzLm9wdGlvbi5hY2NlcHQgPT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICAgIHRoaXMuYWNjZXB0ID0gKGVsKSA9PiBlbC5tYXRjaGVzKHRoaXMub3B0aW9uLmFjY2VwdCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmFjY2VwdCA9IHRoaXMub3B0aW9uLmFjY2VwdDtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbiAgICAvKiogQGludGVybmFsICovXHJcbiAgICBfdWkoZHJhZykge1xyXG4gICAgICAgIHJldHVybiBPYmplY3QuYXNzaWduKHsgZHJhZ2dhYmxlOiBkcmFnLmVsIH0sIGRyYWcudWkoKSk7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0cy5ERERyb3BwYWJsZSA9IERERHJvcHBhYmxlO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kZC1kcm9wcGFibGUuanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbi8qKlxyXG4gKiBkZC1lbGVtZW50cy50cyA3LjMuMFxyXG4gKiBDb3B5cmlnaHQgKGMpIDIwMjEgQWxhaW4gRHVtZXNueSAtIHNlZSBHcmlkU3RhY2sgcm9vdCBsaWNlbnNlXHJcbiAqL1xyXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XHJcbmV4cG9ydHMuRERFbGVtZW50ID0gdm9pZCAwO1xyXG5jb25zdCBkZF9yZXNpemFibGVfMSA9IHJlcXVpcmUoXCIuL2RkLXJlc2l6YWJsZVwiKTtcclxuY29uc3QgZGRfZHJhZ2dhYmxlXzEgPSByZXF1aXJlKFwiLi9kZC1kcmFnZ2FibGVcIik7XHJcbmNvbnN0IGRkX2Ryb3BwYWJsZV8xID0gcmVxdWlyZShcIi4vZGQtZHJvcHBhYmxlXCIpO1xyXG5jbGFzcyBEREVsZW1lbnQge1xyXG4gICAgY29uc3RydWN0b3IoZWwpIHtcclxuICAgICAgICB0aGlzLmVsID0gZWw7XHJcbiAgICB9XHJcbiAgICBzdGF0aWMgaW5pdChlbCkge1xyXG4gICAgICAgIGlmICghZWwuZGRFbGVtZW50KSB7XHJcbiAgICAgICAgICAgIGVsLmRkRWxlbWVudCA9IG5ldyBEREVsZW1lbnQoZWwpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZWwuZGRFbGVtZW50O1xyXG4gICAgfVxyXG4gICAgb24oZXZlbnROYW1lLCBjYWxsYmFjaykge1xyXG4gICAgICAgIGlmICh0aGlzLmRkRHJhZ2dhYmxlICYmIFsnZHJhZycsICdkcmFnc3RhcnQnLCAnZHJhZ3N0b3AnXS5pbmRleE9mKGV2ZW50TmFtZSkgPiAtMSkge1xyXG4gICAgICAgICAgICB0aGlzLmRkRHJhZ2dhYmxlLm9uKGV2ZW50TmFtZSwgY2FsbGJhY2spO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICh0aGlzLmRkRHJvcHBhYmxlICYmIFsnZHJvcCcsICdkcm9wb3ZlcicsICdkcm9wb3V0J10uaW5kZXhPZihldmVudE5hbWUpID4gLTEpIHtcclxuICAgICAgICAgICAgdGhpcy5kZERyb3BwYWJsZS5vbihldmVudE5hbWUsIGNhbGxiYWNrKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAodGhpcy5kZFJlc2l6YWJsZSAmJiBbJ3Jlc2l6ZXN0YXJ0JywgJ3Jlc2l6ZScsICdyZXNpemVzdG9wJ10uaW5kZXhPZihldmVudE5hbWUpID4gLTEpIHtcclxuICAgICAgICAgICAgdGhpcy5kZFJlc2l6YWJsZS5vbihldmVudE5hbWUsIGNhbGxiYWNrKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbiAgICBvZmYoZXZlbnROYW1lKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuZGREcmFnZ2FibGUgJiYgWydkcmFnJywgJ2RyYWdzdGFydCcsICdkcmFnc3RvcCddLmluZGV4T2YoZXZlbnROYW1lKSA+IC0xKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZGREcmFnZ2FibGUub2ZmKGV2ZW50TmFtZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKHRoaXMuZGREcm9wcGFibGUgJiYgWydkcm9wJywgJ2Ryb3BvdmVyJywgJ2Ryb3BvdXQnXS5pbmRleE9mKGV2ZW50TmFtZSkgPiAtMSkge1xyXG4gICAgICAgICAgICB0aGlzLmRkRHJvcHBhYmxlLm9mZihldmVudE5hbWUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICh0aGlzLmRkUmVzaXphYmxlICYmIFsncmVzaXplc3RhcnQnLCAncmVzaXplJywgJ3Jlc2l6ZXN0b3AnXS5pbmRleE9mKGV2ZW50TmFtZSkgPiAtMSkge1xyXG4gICAgICAgICAgICB0aGlzLmRkUmVzaXphYmxlLm9mZihldmVudE5hbWUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuICAgIHNldHVwRHJhZ2dhYmxlKG9wdHMpIHtcclxuICAgICAgICBpZiAoIXRoaXMuZGREcmFnZ2FibGUpIHtcclxuICAgICAgICAgICAgdGhpcy5kZERyYWdnYWJsZSA9IG5ldyBkZF9kcmFnZ2FibGVfMS5ERERyYWdnYWJsZSh0aGlzLmVsLCBvcHRzKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuZGREcmFnZ2FibGUudXBkYXRlT3B0aW9uKG9wdHMpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuICAgIGNsZWFuRHJhZ2dhYmxlKCkge1xyXG4gICAgICAgIGlmICh0aGlzLmRkRHJhZ2dhYmxlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZGREcmFnZ2FibGUuZGVzdHJveSgpO1xyXG4gICAgICAgICAgICBkZWxldGUgdGhpcy5kZERyYWdnYWJsZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbiAgICBzZXR1cFJlc2l6YWJsZShvcHRzKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLmRkUmVzaXphYmxlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZGRSZXNpemFibGUgPSBuZXcgZGRfcmVzaXphYmxlXzEuRERSZXNpemFibGUodGhpcy5lbCwgb3B0cyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmRkUmVzaXphYmxlLnVwZGF0ZU9wdGlvbihvcHRzKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbiAgICBjbGVhblJlc2l6YWJsZSgpIHtcclxuICAgICAgICBpZiAodGhpcy5kZFJlc2l6YWJsZSkge1xyXG4gICAgICAgICAgICB0aGlzLmRkUmVzaXphYmxlLmRlc3Ryb3koKTtcclxuICAgICAgICAgICAgZGVsZXRlIHRoaXMuZGRSZXNpemFibGU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG4gICAgc2V0dXBEcm9wcGFibGUob3B0cykge1xyXG4gICAgICAgIGlmICghdGhpcy5kZERyb3BwYWJsZSkge1xyXG4gICAgICAgICAgICB0aGlzLmRkRHJvcHBhYmxlID0gbmV3IGRkX2Ryb3BwYWJsZV8xLkRERHJvcHBhYmxlKHRoaXMuZWwsIG9wdHMpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5kZERyb3BwYWJsZS51cGRhdGVPcHRpb24ob3B0cyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG4gICAgY2xlYW5Ecm9wcGFibGUoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuZGREcm9wcGFibGUpIHtcclxuICAgICAgICAgICAgdGhpcy5kZERyb3BwYWJsZS5kZXN0cm95KCk7XHJcbiAgICAgICAgICAgIGRlbGV0ZSB0aGlzLmRkRHJvcHBhYmxlO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxufVxyXG5leHBvcnRzLkRERWxlbWVudCA9IERERWxlbWVudDtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGQtZWxlbWVudC5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcclxuLyoqXHJcbiAqIGRkLWdyaWRzdGFjay50cyA3LjMuMFxyXG4gKiBDb3B5cmlnaHQgKGMpIDIwMjEgQWxhaW4gRHVtZXNueSAtIHNlZSBHcmlkU3RhY2sgcm9vdCBsaWNlbnNlXHJcbiAqL1xyXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XHJcbmV4cG9ydHMuRERHcmlkU3RhY2sgPSB2b2lkIDA7XHJcbmNvbnN0IHV0aWxzXzEgPSByZXF1aXJlKFwiLi91dGlsc1wiKTtcclxuY29uc3QgZGRfbWFuYWdlcl8xID0gcmVxdWlyZShcIi4vZGQtbWFuYWdlclwiKTtcclxuY29uc3QgZGRfZWxlbWVudF8xID0gcmVxdWlyZShcIi4vZGQtZWxlbWVudFwiKTtcclxuLy8gbGV0IGNvdW50ID0gMDsgLy8gVEVTVFxyXG4vKipcclxuICogSFRNTCBOYXRpdmUgTW91c2UgYW5kIFRvdWNoIEV2ZW50cyBEcmFnIGFuZCBEcm9wIGZ1bmN0aW9uYWxpdHkuXHJcbiAqL1xyXG5jbGFzcyBEREdyaWRTdGFjayB7XHJcbiAgICByZXNpemFibGUoZWwsIG9wdHMsIGtleSwgdmFsdWUpIHtcclxuICAgICAgICB0aGlzLl9nZXREREVsZW1lbnRzKGVsKS5mb3JFYWNoKGRFbCA9PiB7XHJcbiAgICAgICAgICAgIGlmIChvcHRzID09PSAnZGlzYWJsZScgfHwgb3B0cyA9PT0gJ2VuYWJsZScpIHtcclxuICAgICAgICAgICAgICAgIGRFbC5kZFJlc2l6YWJsZSAmJiBkRWwuZGRSZXNpemFibGVbb3B0c10oKTsgLy8gY2FuJ3QgY3JlYXRlIEREIGFzIGl0IHJlcXVpcmVzIG9wdGlvbnMgZm9yIHNldHVwUmVzaXphYmxlKClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmIChvcHRzID09PSAnZGVzdHJveScpIHtcclxuICAgICAgICAgICAgICAgIGRFbC5kZFJlc2l6YWJsZSAmJiBkRWwuY2xlYW5SZXNpemFibGUoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmIChvcHRzID09PSAnb3B0aW9uJykge1xyXG4gICAgICAgICAgICAgICAgZEVsLnNldHVwUmVzaXphYmxlKHsgW2tleV06IHZhbHVlIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgZ3JpZCA9IGRFbC5lbC5ncmlkc3RhY2tOb2RlLmdyaWQ7XHJcbiAgICAgICAgICAgICAgICBsZXQgaGFuZGxlcyA9IGRFbC5lbC5nZXRBdHRyaWJ1dGUoJ2dzLXJlc2l6ZS1oYW5kbGVzJykgPyBkRWwuZWwuZ2V0QXR0cmlidXRlKCdncy1yZXNpemUtaGFuZGxlcycpIDogZ3JpZC5vcHRzLnJlc2l6YWJsZS5oYW5kbGVzO1xyXG4gICAgICAgICAgICAgICAgbGV0IGF1dG9IaWRlID0gIWdyaWQub3B0cy5hbHdheXNTaG93UmVzaXplSGFuZGxlO1xyXG4gICAgICAgICAgICAgICAgZEVsLnNldHVwUmVzaXphYmxlKE9iamVjdC5hc3NpZ24oT2JqZWN0LmFzc2lnbihPYmplY3QuYXNzaWduKHt9LCBncmlkLm9wdHMucmVzaXphYmxlKSwgeyBoYW5kbGVzLCBhdXRvSGlkZSB9KSwge1xyXG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0OiBvcHRzLnN0YXJ0LFxyXG4gICAgICAgICAgICAgICAgICAgIHN0b3A6IG9wdHMuc3RvcCxcclxuICAgICAgICAgICAgICAgICAgICByZXNpemU6IG9wdHMucmVzaXplXHJcbiAgICAgICAgICAgICAgICB9KSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuICAgIGRyYWdnYWJsZShlbCwgb3B0cywga2V5LCB2YWx1ZSkge1xyXG4gICAgICAgIHRoaXMuX2dldERERWxlbWVudHMoZWwpLmZvckVhY2goZEVsID0+IHtcclxuICAgICAgICAgICAgaWYgKG9wdHMgPT09ICdkaXNhYmxlJyB8fCBvcHRzID09PSAnZW5hYmxlJykge1xyXG4gICAgICAgICAgICAgICAgZEVsLmRkRHJhZ2dhYmxlICYmIGRFbC5kZERyYWdnYWJsZVtvcHRzXSgpOyAvLyBjYW4ndCBjcmVhdGUgREQgYXMgaXQgcmVxdWlyZXMgb3B0aW9ucyBmb3Igc2V0dXBEcmFnZ2FibGUoKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKG9wdHMgPT09ICdkZXN0cm95Jykge1xyXG4gICAgICAgICAgICAgICAgZEVsLmRkRHJhZ2dhYmxlICYmIGRFbC5jbGVhbkRyYWdnYWJsZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKG9wdHMgPT09ICdvcHRpb24nKSB7XHJcbiAgICAgICAgICAgICAgICBkRWwuc2V0dXBEcmFnZ2FibGUoeyBba2V5XTogdmFsdWUgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBncmlkID0gZEVsLmVsLmdyaWRzdGFja05vZGUuZ3JpZDtcclxuICAgICAgICAgICAgICAgIGRFbC5zZXR1cERyYWdnYWJsZShPYmplY3QuYXNzaWduKE9iamVjdC5hc3NpZ24oe30sIGdyaWQub3B0cy5kcmFnZ2FibGUpLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gY29udGFpbm1lbnQ6IChncmlkLnBhcmVudEdyaWRJdGVtICYmICFncmlkLm9wdHMuZHJhZ091dCkgPyBncmlkLmVsLnBhcmVudEVsZW1lbnQgOiAoZ3JpZC5vcHRzLmRyYWdnYWJsZS5jb250YWlubWVudCB8fCBudWxsKSxcclxuICAgICAgICAgICAgICAgICAgICBzdGFydDogb3B0cy5zdGFydCxcclxuICAgICAgICAgICAgICAgICAgICBzdG9wOiBvcHRzLnN0b3AsXHJcbiAgICAgICAgICAgICAgICAgICAgZHJhZzogb3B0cy5kcmFnXHJcbiAgICAgICAgICAgICAgICB9KSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuICAgIGRyYWdJbihlbCwgb3B0cykge1xyXG4gICAgICAgIHRoaXMuX2dldERERWxlbWVudHMoZWwpLmZvckVhY2goZEVsID0+IGRFbC5zZXR1cERyYWdnYWJsZShvcHRzKSk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbiAgICBkcm9wcGFibGUoZWwsIG9wdHMsIGtleSwgdmFsdWUpIHtcclxuICAgICAgICBpZiAodHlwZW9mIG9wdHMuYWNjZXB0ID09PSAnZnVuY3Rpb24nICYmICFvcHRzLl9hY2NlcHQpIHtcclxuICAgICAgICAgICAgb3B0cy5fYWNjZXB0ID0gb3B0cy5hY2NlcHQ7XHJcbiAgICAgICAgICAgIG9wdHMuYWNjZXB0ID0gKGVsKSA9PiBvcHRzLl9hY2NlcHQoZWwpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9nZXREREVsZW1lbnRzKGVsKS5mb3JFYWNoKGRFbCA9PiB7XHJcbiAgICAgICAgICAgIGlmIChvcHRzID09PSAnZGlzYWJsZScgfHwgb3B0cyA9PT0gJ2VuYWJsZScpIHtcclxuICAgICAgICAgICAgICAgIGRFbC5kZERyb3BwYWJsZSAmJiBkRWwuZGREcm9wcGFibGVbb3B0c10oKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmIChvcHRzID09PSAnZGVzdHJveScpIHtcclxuICAgICAgICAgICAgICAgIGlmIChkRWwuZGREcm9wcGFibGUpIHsgLy8gZXJyb3IgdG8gY2FsbCBkZXN0cm95IGlmIG5vdCB0aGVyZVxyXG4gICAgICAgICAgICAgICAgICAgIGRFbC5jbGVhbkRyb3BwYWJsZSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKG9wdHMgPT09ICdvcHRpb24nKSB7XHJcbiAgICAgICAgICAgICAgICBkRWwuc2V0dXBEcm9wcGFibGUoeyBba2V5XTogdmFsdWUgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBkRWwuc2V0dXBEcm9wcGFibGUob3B0cyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuICAgIC8qKiB0cnVlIGlmIGVsZW1lbnQgaXMgZHJvcHBhYmxlICovXHJcbiAgICBpc0Ryb3BwYWJsZShlbCkge1xyXG4gICAgICAgIHJldHVybiAhIShlbCAmJiBlbC5kZEVsZW1lbnQgJiYgZWwuZGRFbGVtZW50LmRkRHJvcHBhYmxlICYmICFlbC5kZEVsZW1lbnQuZGREcm9wcGFibGUuZGlzYWJsZWQpO1xyXG4gICAgfVxyXG4gICAgLyoqIHRydWUgaWYgZWxlbWVudCBpcyBkcmFnZ2FibGUgKi9cclxuICAgIGlzRHJhZ2dhYmxlKGVsKSB7XHJcbiAgICAgICAgcmV0dXJuICEhKGVsICYmIGVsLmRkRWxlbWVudCAmJiBlbC5kZEVsZW1lbnQuZGREcmFnZ2FibGUgJiYgIWVsLmRkRWxlbWVudC5kZERyYWdnYWJsZS5kaXNhYmxlZCk7XHJcbiAgICB9XHJcbiAgICAvKiogdHJ1ZSBpZiBlbGVtZW50IGlzIGRyYWdnYWJsZSAqL1xyXG4gICAgaXNSZXNpemFibGUoZWwpIHtcclxuICAgICAgICByZXR1cm4gISEoZWwgJiYgZWwuZGRFbGVtZW50ICYmIGVsLmRkRWxlbWVudC5kZFJlc2l6YWJsZSAmJiAhZWwuZGRFbGVtZW50LmRkUmVzaXphYmxlLmRpc2FibGVkKTtcclxuICAgIH1cclxuICAgIG9uKGVsLCBuYW1lLCBjYWxsYmFjaykge1xyXG4gICAgICAgIHRoaXMuX2dldERERWxlbWVudHMoZWwpLmZvckVhY2goZEVsID0+IGRFbC5vbihuYW1lLCAoZXZlbnQpID0+IHtcclxuICAgICAgICAgICAgY2FsbGJhY2soZXZlbnQsIGRkX21hbmFnZXJfMS5ERE1hbmFnZXIuZHJhZ0VsZW1lbnQgPyBkZF9tYW5hZ2VyXzEuRERNYW5hZ2VyLmRyYWdFbGVtZW50LmVsIDogZXZlbnQudGFyZ2V0LCBkZF9tYW5hZ2VyXzEuRERNYW5hZ2VyLmRyYWdFbGVtZW50ID8gZGRfbWFuYWdlcl8xLkRETWFuYWdlci5kcmFnRWxlbWVudC5oZWxwZXIgOiBudWxsKTtcclxuICAgICAgICB9KSk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbiAgICBvZmYoZWwsIG5hbWUpIHtcclxuICAgICAgICB0aGlzLl9nZXREREVsZW1lbnRzKGVsKS5mb3JFYWNoKGRFbCA9PiBkRWwub2ZmKG5hbWUpKTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuICAgIC8qKiBAaW50ZXJuYWwgcmV0dXJucyBhIGxpc3Qgb2YgREQgZWxlbWVudHMsIGNyZWF0aW5nIHRoZW0gb24gdGhlIGZseSBieSBkZWZhdWx0ICovXHJcbiAgICBfZ2V0RERFbGVtZW50cyhlbHMsIGNyZWF0ZSA9IHRydWUpIHtcclxuICAgICAgICBsZXQgaG9zdHMgPSB1dGlsc18xLlV0aWxzLmdldEVsZW1lbnRzKGVscyk7XHJcbiAgICAgICAgaWYgKCFob3N0cy5sZW5ndGgpXHJcbiAgICAgICAgICAgIHJldHVybiBbXTtcclxuICAgICAgICBsZXQgbGlzdCA9IGhvc3RzLm1hcChlID0+IGUuZGRFbGVtZW50IHx8IChjcmVhdGUgPyBkZF9lbGVtZW50XzEuRERFbGVtZW50LmluaXQoZSkgOiBudWxsKSk7XHJcbiAgICAgICAgaWYgKCFjcmVhdGUpIHtcclxuICAgICAgICAgICAgbGlzdC5maWx0ZXIoZCA9PiBkKTtcclxuICAgICAgICB9IC8vIHJlbW92ZSBudWxsc1xyXG4gICAgICAgIHJldHVybiBsaXN0O1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydHMuRERHcmlkU3RhY2sgPSBEREdyaWRTdGFjaztcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGQtZ3JpZHN0YWNrLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xyXG4vKipcclxuICogZGQtbWFuYWdlci50cyA3LjMuMFxyXG4gKiBDb3B5cmlnaHQgKGMpIDIwMjEgQWxhaW4gRHVtZXNueSAtIHNlZSBHcmlkU3RhY2sgcm9vdCBsaWNlbnNlXHJcbiAqL1xyXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XHJcbmV4cG9ydHMuRERNYW5hZ2VyID0gdm9pZCAwO1xyXG4vKipcclxuICogZ2xvYmFscyB0aGF0IGFyZSBzaGFyZWQgYWNyb3NzIERyYWcgJiBEcm9wIGluc3RhbmNlc1xyXG4gKi9cclxuY2xhc3MgRERNYW5hZ2VyIHtcclxufVxyXG5leHBvcnRzLkRETWFuYWdlciA9IERETWFuYWdlcjtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGQtbWFuYWdlci5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcclxuLyoqXHJcbiAqIGRkLXJlc2l6YWJsZS1oYW5kbGUudHMgNy4zLjBcclxuICogQ29weXJpZ2h0IChjKSAyMDIxLTIwMjIgQWxhaW4gRHVtZXNueSAtIHNlZSBHcmlkU3RhY2sgcm9vdCBsaWNlbnNlXHJcbiAqL1xyXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XHJcbmV4cG9ydHMuRERSZXNpemFibGVIYW5kbGUgPSB2b2lkIDA7XHJcbmNvbnN0IGRkX3RvdWNoXzEgPSByZXF1aXJlKFwiLi9kZC10b3VjaFwiKTtcclxuY2xhc3MgRERSZXNpemFibGVIYW5kbGUge1xyXG4gICAgY29uc3RydWN0b3IoaG9zdCwgZGlyZWN0aW9uLCBvcHRpb24pIHtcclxuICAgICAgICAvKiogQGludGVybmFsIHRydWUgYWZ0ZXIgd2UndmUgbW92ZWQgZW5vdWdoIHBpeGVscyB0byBzdGFydCBhIHJlc2l6ZSAqL1xyXG4gICAgICAgIHRoaXMubW92aW5nID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5ob3N0ID0gaG9zdDtcclxuICAgICAgICB0aGlzLmRpciA9IGRpcmVjdGlvbjtcclxuICAgICAgICB0aGlzLm9wdGlvbiA9IG9wdGlvbjtcclxuICAgICAgICAvLyBjcmVhdGUgdmFyIGV2ZW50IGJpbmRpbmcgc28gd2UgY2FuIGVhc2lseSByZW1vdmUgYW5kIHN0aWxsIGxvb2sgbGlrZSBUUyBtZXRob2RzICh1bmxpa2UgYW5vbnltb3VzIGZ1bmN0aW9ucylcclxuICAgICAgICB0aGlzLl9tb3VzZURvd24gPSB0aGlzLl9tb3VzZURvd24uYmluZCh0aGlzKTtcclxuICAgICAgICB0aGlzLl9tb3VzZU1vdmUgPSB0aGlzLl9tb3VzZU1vdmUuYmluZCh0aGlzKTtcclxuICAgICAgICB0aGlzLl9tb3VzZVVwID0gdGhpcy5fbW91c2VVcC5iaW5kKHRoaXMpO1xyXG4gICAgICAgIHRoaXMuX2luaXQoKTtcclxuICAgIH1cclxuICAgIC8qKiBAaW50ZXJuYWwgKi9cclxuICAgIF9pbml0KCkge1xyXG4gICAgICAgIGNvbnN0IGVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICAgICAgZWwuY2xhc3NMaXN0LmFkZCgndWktcmVzaXphYmxlLWhhbmRsZScpO1xyXG4gICAgICAgIGVsLmNsYXNzTGlzdC5hZGQoYCR7RERSZXNpemFibGVIYW5kbGUucHJlZml4fSR7dGhpcy5kaXJ9YCk7XHJcbiAgICAgICAgZWwuc3R5bGUuekluZGV4ID0gJzEwMCc7XHJcbiAgICAgICAgZWwuc3R5bGUudXNlclNlbGVjdCA9ICdub25lJztcclxuICAgICAgICB0aGlzLmVsID0gZWw7XHJcbiAgICAgICAgdGhpcy5ob3N0LmFwcGVuZENoaWxkKHRoaXMuZWwpO1xyXG4gICAgICAgIHRoaXMuZWwuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgdGhpcy5fbW91c2VEb3duKTtcclxuICAgICAgICBpZiAoZGRfdG91Y2hfMS5pc1RvdWNoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZWwuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIGRkX3RvdWNoXzEudG91Y2hzdGFydCk7XHJcbiAgICAgICAgICAgIHRoaXMuZWwuYWRkRXZlbnRMaXN0ZW5lcigncG9pbnRlcmRvd24nLCBkZF90b3VjaF8xLnBvaW50ZXJkb3duKTtcclxuICAgICAgICAgICAgLy8gdGhpcy5lbC5zdHlsZS50b3VjaEFjdGlvbiA9ICdub25lJzsgLy8gbm90IG5lZWRlZCB1bmxpa2UgcG9pbnRlcmRvd24gZG9jIGNvbW1lbnRcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbiAgICAvKiogY2FsbCB0aGlzIHdoZW4gcmVzaXplIGhhbmRsZSBuZWVkcyB0byBiZSByZW1vdmVkIGFuZCBjbGVhbmVkIHVwICovXHJcbiAgICBkZXN0cm95KCkge1xyXG4gICAgICAgIGlmICh0aGlzLm1vdmluZylcclxuICAgICAgICAgICAgdGhpcy5fbW91c2VVcCh0aGlzLm1vdXNlRG93bkV2ZW50KTtcclxuICAgICAgICB0aGlzLmVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIHRoaXMuX21vdXNlRG93bik7XHJcbiAgICAgICAgaWYgKGRkX3RvdWNoXzEuaXNUb3VjaCkge1xyXG4gICAgICAgICAgICB0aGlzLmVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCBkZF90b3VjaF8xLnRvdWNoc3RhcnQpO1xyXG4gICAgICAgICAgICB0aGlzLmVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3BvaW50ZXJkb3duJywgZGRfdG91Y2hfMS5wb2ludGVyZG93bik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuaG9zdC5yZW1vdmVDaGlsZCh0aGlzLmVsKTtcclxuICAgICAgICBkZWxldGUgdGhpcy5lbDtcclxuICAgICAgICBkZWxldGUgdGhpcy5ob3N0O1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG4gICAgLyoqIEBpbnRlcm5hbCBjYWxsZWQgb24gbW91c2UgZG93biBvbiB1czogY2FwdHVyZSBtb3ZlIG9uIHRoZSBlbnRpcmUgZG9jdW1lbnQgKG1vdXNlIG1pZ2h0IG5vdCBzdGF5IG9uIHVzKSB1bnRpbCB3ZSByZWxlYXNlIHRoZSBtb3VzZSAqL1xyXG4gICAgX21vdXNlRG93bihlKSB7XHJcbiAgICAgICAgdGhpcy5tb3VzZURvd25FdmVudCA9IGU7XHJcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgdGhpcy5fbW91c2VNb3ZlLCB0cnVlKTsgLy8gY2FwdHVyZSwgbm90IGJ1YmJsZVxyXG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCB0aGlzLl9tb3VzZVVwLCB0cnVlKTtcclxuICAgICAgICBpZiAoZGRfdG91Y2hfMS5pc1RvdWNoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZWwuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgZGRfdG91Y2hfMS50b3VjaG1vdmUpO1xyXG4gICAgICAgICAgICB0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgZGRfdG91Y2hfMS50b3VjaGVuZCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgfVxyXG4gICAgLyoqIEBpbnRlcm5hbCAqL1xyXG4gICAgX21vdXNlTW92ZShlKSB7XHJcbiAgICAgICAgbGV0IHMgPSB0aGlzLm1vdXNlRG93bkV2ZW50O1xyXG4gICAgICAgIGlmICh0aGlzLm1vdmluZykge1xyXG4gICAgICAgICAgICB0aGlzLl90cmlnZ2VyRXZlbnQoJ21vdmUnLCBlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoTWF0aC5hYnMoZS54IC0gcy54KSArIE1hdGguYWJzKGUueSAtIHMueSkgPiAyKSB7XHJcbiAgICAgICAgICAgIC8vIGRvbid0IHN0YXJ0IHVubGVzcyB3ZSd2ZSBtb3ZlZCBhdCBsZWFzdCAzIHBpeGVsc1xyXG4gICAgICAgICAgICB0aGlzLm1vdmluZyA9IHRydWU7XHJcbiAgICAgICAgICAgIHRoaXMuX3RyaWdnZXJFdmVudCgnc3RhcnQnLCB0aGlzLm1vdXNlRG93bkV2ZW50KTtcclxuICAgICAgICAgICAgdGhpcy5fdHJpZ2dlckV2ZW50KCdtb3ZlJywgZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgfVxyXG4gICAgLyoqIEBpbnRlcm5hbCAqL1xyXG4gICAgX21vdXNlVXAoZSkge1xyXG4gICAgICAgIGlmICh0aGlzLm1vdmluZykge1xyXG4gICAgICAgICAgICB0aGlzLl90cmlnZ2VyRXZlbnQoJ3N0b3AnLCBlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgdGhpcy5fbW91c2VNb3ZlLCB0cnVlKTtcclxuICAgICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgdGhpcy5fbW91c2VVcCwgdHJ1ZSk7XHJcbiAgICAgICAgaWYgKGRkX3RvdWNoXzEuaXNUb3VjaCkge1xyXG4gICAgICAgICAgICB0aGlzLmVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsIGRkX3RvdWNoXzEudG91Y2htb3ZlKTtcclxuICAgICAgICAgICAgdGhpcy5lbC5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIGRkX3RvdWNoXzEudG91Y2hlbmQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBkZWxldGUgdGhpcy5tb3Zpbmc7XHJcbiAgICAgICAgZGVsZXRlIHRoaXMubW91c2VEb3duRXZlbnQ7XHJcbiAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICB9XHJcbiAgICAvKiogQGludGVybmFsICovXHJcbiAgICBfdHJpZ2dlckV2ZW50KG5hbWUsIGV2ZW50KSB7XHJcbiAgICAgICAgaWYgKHRoaXMub3B0aW9uW25hbWVdKVxyXG4gICAgICAgICAgICB0aGlzLm9wdGlvbltuYW1lXShldmVudCk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0cy5ERFJlc2l6YWJsZUhhbmRsZSA9IEREUmVzaXphYmxlSGFuZGxlO1xyXG4vKiogQGludGVybmFsICovXHJcbkREUmVzaXphYmxlSGFuZGxlLnByZWZpeCA9ICd1aS1yZXNpemFibGUtJztcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGQtcmVzaXphYmxlLWhhbmRsZS5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcclxuLyoqXHJcbiAqIGRkLXJlc2l6YWJsZS50cyA3LjMuMFxyXG4gKiBDb3B5cmlnaHQgKGMpIDIwMjEtMjAyMiBBbGFpbiBEdW1lc255IC0gc2VlIEdyaWRTdGFjayByb290IGxpY2Vuc2VcclxuICovXHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcclxuZXhwb3J0cy5ERFJlc2l6YWJsZSA9IHZvaWQgMDtcclxuY29uc3QgZGRfcmVzaXphYmxlX2hhbmRsZV8xID0gcmVxdWlyZShcIi4vZGQtcmVzaXphYmxlLWhhbmRsZVwiKTtcclxuY29uc3QgZGRfYmFzZV9pbXBsXzEgPSByZXF1aXJlKFwiLi9kZC1iYXNlLWltcGxcIik7XHJcbmNvbnN0IHV0aWxzXzEgPSByZXF1aXJlKFwiLi91dGlsc1wiKTtcclxuY29uc3QgZGRfbWFuYWdlcl8xID0gcmVxdWlyZShcIi4vZGQtbWFuYWdlclwiKTtcclxuY2xhc3MgRERSZXNpemFibGUgZXh0ZW5kcyBkZF9iYXNlX2ltcGxfMS5EREJhc2VJbXBsZW1lbnQge1xyXG4gICAgY29uc3RydWN0b3IoZWwsIG9wdHMgPSB7fSkge1xyXG4gICAgICAgIHN1cGVyKCk7XHJcbiAgICAgICAgLyoqIEBpbnRlcm5hbCAqL1xyXG4gICAgICAgIHRoaXMuX3VpID0gKCkgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBjb250YWlubWVudEVsID0gdGhpcy5lbC5wYXJlbnRFbGVtZW50O1xyXG4gICAgICAgICAgICBjb25zdCBjb250YWlubWVudFJlY3QgPSBjb250YWlubWVudEVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xyXG4gICAgICAgICAgICBjb25zdCBuZXdSZWN0ID0ge1xyXG4gICAgICAgICAgICAgICAgd2lkdGg6IHRoaXMub3JpZ2luYWxSZWN0LndpZHRoLFxyXG4gICAgICAgICAgICAgICAgaGVpZ2h0OiB0aGlzLm9yaWdpbmFsUmVjdC5oZWlnaHQgKyB0aGlzLnNjcm9sbGVkLFxyXG4gICAgICAgICAgICAgICAgbGVmdDogdGhpcy5vcmlnaW5hbFJlY3QubGVmdCxcclxuICAgICAgICAgICAgICAgIHRvcDogdGhpcy5vcmlnaW5hbFJlY3QudG9wIC0gdGhpcy5zY3JvbGxlZFxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBjb25zdCByZWN0ID0gdGhpcy50ZW1wb3JhbFJlY3QgfHwgbmV3UmVjdDtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIHBvc2l0aW9uOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGVmdDogcmVjdC5sZWZ0IC0gY29udGFpbm1lbnRSZWN0LmxlZnQsXHJcbiAgICAgICAgICAgICAgICAgICAgdG9wOiByZWN0LnRvcCAtIGNvbnRhaW5tZW50UmVjdC50b3BcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBzaXplOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg6IHJlY3Qud2lkdGgsXHJcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiByZWN0LmhlaWdodFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgLyogR3JpZHN0YWNrIE9OTFkgbmVlZHMgcG9zaXRpb24gc2V0IGFib3ZlLi4uIGtlZXAgYXJvdW5kIGluIGNhc2UuXHJcbiAgICAgICAgICAgICAgICBlbGVtZW50OiBbdGhpcy5lbF0sIC8vIFRoZSBvYmplY3QgcmVwcmVzZW50aW5nIHRoZSBlbGVtZW50IHRvIGJlIHJlc2l6ZWRcclxuICAgICAgICAgICAgICAgIGhlbHBlcjogW10sIC8vIFRPRE86IG5vdCBzdXBwb3J0IHlldCAtIFRoZSBvYmplY3QgcmVwcmVzZW50aW5nIHRoZSBoZWxwZXIgdGhhdCdzIGJlaW5nIHJlc2l6ZWRcclxuICAgICAgICAgICAgICAgIG9yaWdpbmFsRWxlbWVudDogW3RoaXMuZWxdLC8vIHdlIGRvbid0IHdyYXAgaGVyZSwgc28gc2ltcGxpZnkgYXMgdGhpcy5lbCAvL1RoZSBvYmplY3QgcmVwcmVzZW50aW5nIHRoZSBvcmlnaW5hbCBlbGVtZW50IGJlZm9yZSBpdCBpcyB3cmFwcGVkXHJcbiAgICAgICAgICAgICAgICBvcmlnaW5hbFBvc2l0aW9uOiB7IC8vIFRoZSBwb3NpdGlvbiByZXByZXNlbnRlZCBhcyB7IGxlZnQsIHRvcCB9IGJlZm9yZSB0aGUgcmVzaXphYmxlIGlzIHJlc2l6ZWRcclxuICAgICAgICAgICAgICAgICAgbGVmdDogdGhpcy5vcmlnaW5hbFJlY3QubGVmdCAtIGNvbnRhaW5tZW50UmVjdC5sZWZ0LFxyXG4gICAgICAgICAgICAgICAgICB0b3A6IHRoaXMub3JpZ2luYWxSZWN0LnRvcCAtIGNvbnRhaW5tZW50UmVjdC50b3BcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBvcmlnaW5hbFNpemU6IHsgLy8gVGhlIHNpemUgcmVwcmVzZW50ZWQgYXMgeyB3aWR0aCwgaGVpZ2h0IH0gYmVmb3JlIHRoZSByZXNpemFibGUgaXMgcmVzaXplZFxyXG4gICAgICAgICAgICAgICAgICB3aWR0aDogdGhpcy5vcmlnaW5hbFJlY3Qud2lkdGgsXHJcbiAgICAgICAgICAgICAgICAgIGhlaWdodDogdGhpcy5vcmlnaW5hbFJlY3QuaGVpZ2h0XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgdGhpcy5lbCA9IGVsO1xyXG4gICAgICAgIHRoaXMub3B0aW9uID0gb3B0cztcclxuICAgICAgICAvLyBjcmVhdGUgdmFyIGV2ZW50IGJpbmRpbmcgc28gd2UgY2FuIGVhc2lseSByZW1vdmUgYW5kIHN0aWxsIGxvb2sgbGlrZSBUUyBtZXRob2RzICh1bmxpa2UgYW5vbnltb3VzIGZ1bmN0aW9ucylcclxuICAgICAgICB0aGlzLl9tb3VzZU92ZXIgPSB0aGlzLl9tb3VzZU92ZXIuYmluZCh0aGlzKTtcclxuICAgICAgICB0aGlzLl9tb3VzZU91dCA9IHRoaXMuX21vdXNlT3V0LmJpbmQodGhpcyk7XHJcbiAgICAgICAgdGhpcy5lbmFibGUoKTtcclxuICAgICAgICB0aGlzLl9zZXR1cEF1dG9IaWRlKHRoaXMub3B0aW9uLmF1dG9IaWRlKTtcclxuICAgICAgICB0aGlzLl9zZXR1cEhhbmRsZXJzKCk7XHJcbiAgICB9XHJcbiAgICBvbihldmVudCwgY2FsbGJhY2spIHtcclxuICAgICAgICBzdXBlci5vbihldmVudCwgY2FsbGJhY2spO1xyXG4gICAgfVxyXG4gICAgb2ZmKGV2ZW50KSB7XHJcbiAgICAgICAgc3VwZXIub2ZmKGV2ZW50KTtcclxuICAgIH1cclxuICAgIGVuYWJsZSgpIHtcclxuICAgICAgICBzdXBlci5lbmFibGUoKTtcclxuICAgICAgICB0aGlzLmVsLmNsYXNzTGlzdC5hZGQoJ3VpLXJlc2l6YWJsZScpO1xyXG4gICAgICAgIHRoaXMuZWwuY2xhc3NMaXN0LnJlbW92ZSgndWktcmVzaXphYmxlLWRpc2FibGVkJyk7XHJcbiAgICAgICAgdGhpcy5fc2V0dXBBdXRvSGlkZSh0aGlzLm9wdGlvbi5hdXRvSGlkZSk7XHJcbiAgICB9XHJcbiAgICBkaXNhYmxlKCkge1xyXG4gICAgICAgIHN1cGVyLmRpc2FibGUoKTtcclxuICAgICAgICB0aGlzLmVsLmNsYXNzTGlzdC5hZGQoJ3VpLXJlc2l6YWJsZS1kaXNhYmxlZCcpO1xyXG4gICAgICAgIHRoaXMuZWwuY2xhc3NMaXN0LnJlbW92ZSgndWktcmVzaXphYmxlJyk7XHJcbiAgICAgICAgdGhpcy5fc2V0dXBBdXRvSGlkZShmYWxzZSk7XHJcbiAgICB9XHJcbiAgICBkZXN0cm95KCkge1xyXG4gICAgICAgIHRoaXMuX3JlbW92ZUhhbmRsZXJzKCk7XHJcbiAgICAgICAgdGhpcy5fc2V0dXBBdXRvSGlkZShmYWxzZSk7XHJcbiAgICAgICAgdGhpcy5lbC5jbGFzc0xpc3QucmVtb3ZlKCd1aS1yZXNpemFibGUnKTtcclxuICAgICAgICBkZWxldGUgdGhpcy5lbDtcclxuICAgICAgICBzdXBlci5kZXN0cm95KCk7XHJcbiAgICB9XHJcbiAgICB1cGRhdGVPcHRpb24ob3B0cykge1xyXG4gICAgICAgIGxldCB1cGRhdGVIYW5kbGVzID0gKG9wdHMuaGFuZGxlcyAmJiBvcHRzLmhhbmRsZXMgIT09IHRoaXMub3B0aW9uLmhhbmRsZXMpO1xyXG4gICAgICAgIGxldCB1cGRhdGVBdXRvSGlkZSA9IChvcHRzLmF1dG9IaWRlICYmIG9wdHMuYXV0b0hpZGUgIT09IHRoaXMub3B0aW9uLmF1dG9IaWRlKTtcclxuICAgICAgICBPYmplY3Qua2V5cyhvcHRzKS5mb3JFYWNoKGtleSA9PiB0aGlzLm9wdGlvbltrZXldID0gb3B0c1trZXldKTtcclxuICAgICAgICBpZiAodXBkYXRlSGFuZGxlcykge1xyXG4gICAgICAgICAgICB0aGlzLl9yZW1vdmVIYW5kbGVycygpO1xyXG4gICAgICAgICAgICB0aGlzLl9zZXR1cEhhbmRsZXJzKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh1cGRhdGVBdXRvSGlkZSkge1xyXG4gICAgICAgICAgICB0aGlzLl9zZXR1cEF1dG9IaWRlKHRoaXMub3B0aW9uLmF1dG9IaWRlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbiAgICAvKiogQGludGVybmFsIHR1cm5zIGF1dG8gaGlkZSBvbi9vZmYgKi9cclxuICAgIF9zZXR1cEF1dG9IaWRlKGF1dG8pIHtcclxuICAgICAgICBpZiAoYXV0bykge1xyXG4gICAgICAgICAgICB0aGlzLmVsLmNsYXNzTGlzdC5hZGQoJ3VpLXJlc2l6YWJsZS1hdXRvaGlkZScpO1xyXG4gICAgICAgICAgICAvLyB1c2UgbW91c2VvdmVyIGFuZCBub3QgbW91c2VlbnRlciB0byBnZXQgYmV0dGVyIHBlcmZvcm1hbmNlIGFuZCB0cmFjayBmb3IgbmVzdGVkIGNhc2VzXHJcbiAgICAgICAgICAgIHRoaXMuZWwuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VvdmVyJywgdGhpcy5fbW91c2VPdmVyKTtcclxuICAgICAgICAgICAgdGhpcy5lbC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW91dCcsIHRoaXMuX21vdXNlT3V0KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuZWwuY2xhc3NMaXN0LnJlbW92ZSgndWktcmVzaXphYmxlLWF1dG9oaWRlJyk7XHJcbiAgICAgICAgICAgIHRoaXMuZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2VvdmVyJywgdGhpcy5fbW91c2VPdmVyKTtcclxuICAgICAgICAgICAgdGhpcy5lbC5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZW91dCcsIHRoaXMuX21vdXNlT3V0KTtcclxuICAgICAgICAgICAgaWYgKGRkX21hbmFnZXJfMS5ERE1hbmFnZXIub3ZlclJlc2l6ZUVsZW1lbnQgPT09IHRoaXMpIHtcclxuICAgICAgICAgICAgICAgIGRlbGV0ZSBkZF9tYW5hZ2VyXzEuRERNYW5hZ2VyLm92ZXJSZXNpemVFbGVtZW50O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG4gICAgLyoqIEBpbnRlcm5hbCAqL1xyXG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby11bnVzZWQtdmFyc1xyXG4gICAgX21vdXNlT3ZlcihlKSB7XHJcbiAgICAgICAgLy8gY29uc29sZS5sb2coYCR7Y291bnQrK30gcHJlLWVudGVyICR7KHRoaXMuZWwgYXMgR3JpZEl0ZW1IVE1MRWxlbWVudCkuZ3JpZHN0YWNrTm9kZS5faWR9YClcclxuICAgICAgICAvLyBhbHJlYWR5IG92ZXIgYSBjaGlsZCwgaWdub3JlLiBJZGVhbGx5IHdlIGp1c3QgY2FsbCBlLnN0b3BQcm9wYWdhdGlvbigpIGJ1dCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL2dyaWRzdGFjay9ncmlkc3RhY2suanMvaXNzdWVzLzIwMThcclxuICAgICAgICBpZiAoZGRfbWFuYWdlcl8xLkRETWFuYWdlci5vdmVyUmVzaXplRWxlbWVudCB8fCBkZF9tYW5hZ2VyXzEuRERNYW5hZ2VyLmRyYWdFbGVtZW50KVxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgZGRfbWFuYWdlcl8xLkRETWFuYWdlci5vdmVyUmVzaXplRWxlbWVudCA9IHRoaXM7XHJcbiAgICAgICAgLy8gY29uc29sZS5sb2coYCR7Y291bnQrK30gZW50ZXIgJHsodGhpcy5lbCBhcyBHcmlkSXRlbUhUTUxFbGVtZW50KS5ncmlkc3RhY2tOb2RlLl9pZH1gKVxyXG4gICAgICAgIHRoaXMuZWwuY2xhc3NMaXN0LnJlbW92ZSgndWktcmVzaXphYmxlLWF1dG9oaWRlJyk7XHJcbiAgICB9XHJcbiAgICAvKiogQGludGVybmFsICovXHJcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXVudXNlZC12YXJzXHJcbiAgICBfbW91c2VPdXQoZSkge1xyXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKGAke2NvdW50Kyt9IHByZS1sZWF2ZSAkeyh0aGlzLmVsIGFzIEdyaWRJdGVtSFRNTEVsZW1lbnQpLmdyaWRzdGFja05vZGUuX2lkfWApXHJcbiAgICAgICAgaWYgKGRkX21hbmFnZXJfMS5ERE1hbmFnZXIub3ZlclJlc2l6ZUVsZW1lbnQgIT09IHRoaXMpXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICBkZWxldGUgZGRfbWFuYWdlcl8xLkRETWFuYWdlci5vdmVyUmVzaXplRWxlbWVudDtcclxuICAgICAgICAvLyBjb25zb2xlLmxvZyhgJHtjb3VudCsrfSBsZWF2ZSAkeyh0aGlzLmVsIGFzIEdyaWRJdGVtSFRNTEVsZW1lbnQpLmdyaWRzdGFja05vZGUuX2lkfWApXHJcbiAgICAgICAgdGhpcy5lbC5jbGFzc0xpc3QuYWRkKCd1aS1yZXNpemFibGUtYXV0b2hpZGUnKTtcclxuICAgIH1cclxuICAgIC8qKiBAaW50ZXJuYWwgKi9cclxuICAgIF9zZXR1cEhhbmRsZXJzKCkge1xyXG4gICAgICAgIGxldCBoYW5kbGVyRGlyZWN0aW9uID0gdGhpcy5vcHRpb24uaGFuZGxlcyB8fCAnZSxzLHNlJztcclxuICAgICAgICBpZiAoaGFuZGxlckRpcmVjdGlvbiA9PT0gJ2FsbCcpIHtcclxuICAgICAgICAgICAgaGFuZGxlckRpcmVjdGlvbiA9ICduLGUscyx3LHNlLHN3LG5lLG53JztcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5oYW5kbGVycyA9IGhhbmRsZXJEaXJlY3Rpb24uc3BsaXQoJywnKVxyXG4gICAgICAgICAgICAubWFwKGRpciA9PiBkaXIudHJpbSgpKVxyXG4gICAgICAgICAgICAubWFwKGRpciA9PiBuZXcgZGRfcmVzaXphYmxlX2hhbmRsZV8xLkREUmVzaXphYmxlSGFuZGxlKHRoaXMuZWwsIGRpciwge1xyXG4gICAgICAgICAgICBzdGFydDogKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9yZXNpemVTdGFydChldmVudCk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHN0b3A6IChldmVudCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fcmVzaXplU3RvcChldmVudCk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIG1vdmU6IChldmVudCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fcmVzaXppbmcoZXZlbnQsIGRpcik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KSk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbiAgICAvKiogQGludGVybmFsICovXHJcbiAgICBfcmVzaXplU3RhcnQoZXZlbnQpIHtcclxuICAgICAgICB0aGlzLm9yaWdpbmFsUmVjdCA9IHRoaXMuZWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcbiAgICAgICAgdGhpcy5zY3JvbGxFbCA9IHV0aWxzXzEuVXRpbHMuZ2V0U2Nyb2xsRWxlbWVudCh0aGlzLmVsKTtcclxuICAgICAgICB0aGlzLnNjcm9sbFkgPSB0aGlzLnNjcm9sbEVsLnNjcm9sbFRvcDtcclxuICAgICAgICB0aGlzLnNjcm9sbGVkID0gMDtcclxuICAgICAgICB0aGlzLnN0YXJ0RXZlbnQgPSBldmVudDtcclxuICAgICAgICB0aGlzLl9zZXR1cEhlbHBlcigpO1xyXG4gICAgICAgIHRoaXMuX2FwcGx5Q2hhbmdlKCk7XHJcbiAgICAgICAgY29uc3QgZXYgPSB1dGlsc18xLlV0aWxzLmluaXRFdmVudChldmVudCwgeyB0eXBlOiAncmVzaXplc3RhcnQnLCB0YXJnZXQ6IHRoaXMuZWwgfSk7XHJcbiAgICAgICAgaWYgKHRoaXMub3B0aW9uLnN0YXJ0KSB7XHJcbiAgICAgICAgICAgIHRoaXMub3B0aW9uLnN0YXJ0KGV2LCB0aGlzLl91aSgpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5lbC5jbGFzc0xpc3QuYWRkKCd1aS1yZXNpemFibGUtcmVzaXppbmcnKTtcclxuICAgICAgICB0aGlzLnRyaWdnZXJFdmVudCgncmVzaXplc3RhcnQnLCBldik7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbiAgICAvKiogQGludGVybmFsICovXHJcbiAgICBfcmVzaXppbmcoZXZlbnQsIGRpcikge1xyXG4gICAgICAgIHRoaXMuc2Nyb2xsZWQgPSB0aGlzLnNjcm9sbEVsLnNjcm9sbFRvcCAtIHRoaXMuc2Nyb2xsWTtcclxuICAgICAgICB0aGlzLnRlbXBvcmFsUmVjdCA9IHRoaXMuX2dldENoYW5nZShldmVudCwgZGlyKTtcclxuICAgICAgICB0aGlzLl9hcHBseUNoYW5nZSgpO1xyXG4gICAgICAgIGNvbnN0IGV2ID0gdXRpbHNfMS5VdGlscy5pbml0RXZlbnQoZXZlbnQsIHsgdHlwZTogJ3Jlc2l6ZScsIHRhcmdldDogdGhpcy5lbCB9KTtcclxuICAgICAgICBpZiAodGhpcy5vcHRpb24ucmVzaXplKSB7XHJcbiAgICAgICAgICAgIHRoaXMub3B0aW9uLnJlc2l6ZShldiwgdGhpcy5fdWkoKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMudHJpZ2dlckV2ZW50KCdyZXNpemUnLCBldik7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbiAgICAvKiogQGludGVybmFsICovXHJcbiAgICBfcmVzaXplU3RvcChldmVudCkge1xyXG4gICAgICAgIGNvbnN0IGV2ID0gdXRpbHNfMS5VdGlscy5pbml0RXZlbnQoZXZlbnQsIHsgdHlwZTogJ3Jlc2l6ZXN0b3AnLCB0YXJnZXQ6IHRoaXMuZWwgfSk7XHJcbiAgICAgICAgaWYgKHRoaXMub3B0aW9uLnN0b3ApIHtcclxuICAgICAgICAgICAgdGhpcy5vcHRpb24uc3RvcChldik7IC8vIE5vdGU6IHVpKCkgbm90IHVzZWQgYnkgZ3JpZHN0YWNrIHNvIGRvbid0IHBhc3NcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5lbC5jbGFzc0xpc3QucmVtb3ZlKCd1aS1yZXNpemFibGUtcmVzaXppbmcnKTtcclxuICAgICAgICB0aGlzLnRyaWdnZXJFdmVudCgncmVzaXplc3RvcCcsIGV2KTtcclxuICAgICAgICB0aGlzLl9jbGVhbkhlbHBlcigpO1xyXG4gICAgICAgIGRlbGV0ZSB0aGlzLnN0YXJ0RXZlbnQ7XHJcbiAgICAgICAgZGVsZXRlIHRoaXMub3JpZ2luYWxSZWN0O1xyXG4gICAgICAgIGRlbGV0ZSB0aGlzLnRlbXBvcmFsUmVjdDtcclxuICAgICAgICBkZWxldGUgdGhpcy5zY3JvbGxZO1xyXG4gICAgICAgIGRlbGV0ZSB0aGlzLnNjcm9sbGVkO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG4gICAgLyoqIEBpbnRlcm5hbCAqL1xyXG4gICAgX3NldHVwSGVscGVyKCkge1xyXG4gICAgICAgIHRoaXMuZWxPcmlnaW5TdHlsZVZhbCA9IEREUmVzaXphYmxlLl9vcmlnaW5TdHlsZVByb3AubWFwKHByb3AgPT4gdGhpcy5lbC5zdHlsZVtwcm9wXSk7XHJcbiAgICAgICAgdGhpcy5wYXJlbnRPcmlnaW5TdHlsZVBvc2l0aW9uID0gdGhpcy5lbC5wYXJlbnRFbGVtZW50LnN0eWxlLnBvc2l0aW9uO1xyXG4gICAgICAgIGlmICh3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZSh0aGlzLmVsLnBhcmVudEVsZW1lbnQpLnBvc2l0aW9uLm1hdGNoKC9zdGF0aWMvKSkge1xyXG4gICAgICAgICAgICB0aGlzLmVsLnBhcmVudEVsZW1lbnQuc3R5bGUucG9zaXRpb24gPSAncmVsYXRpdmUnO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmVsLnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJztcclxuICAgICAgICB0aGlzLmVsLnN0eWxlLm9wYWNpdHkgPSAnMC44JztcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuICAgIC8qKiBAaW50ZXJuYWwgKi9cclxuICAgIF9jbGVhbkhlbHBlcigpIHtcclxuICAgICAgICBERFJlc2l6YWJsZS5fb3JpZ2luU3R5bGVQcm9wLmZvckVhY2goKHByb3AsIGkpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5lbC5zdHlsZVtwcm9wXSA9IHRoaXMuZWxPcmlnaW5TdHlsZVZhbFtpXSB8fCBudWxsO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuZWwucGFyZW50RWxlbWVudC5zdHlsZS5wb3NpdGlvbiA9IHRoaXMucGFyZW50T3JpZ2luU3R5bGVQb3NpdGlvbiB8fCBudWxsO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG4gICAgLyoqIEBpbnRlcm5hbCAqL1xyXG4gICAgX2dldENoYW5nZShldmVudCwgZGlyKSB7XHJcbiAgICAgICAgY29uc3Qgb0V2ZW50ID0gdGhpcy5zdGFydEV2ZW50O1xyXG4gICAgICAgIGNvbnN0IG5ld1JlY3QgPSB7XHJcbiAgICAgICAgICAgIHdpZHRoOiB0aGlzLm9yaWdpbmFsUmVjdC53aWR0aCxcclxuICAgICAgICAgICAgaGVpZ2h0OiB0aGlzLm9yaWdpbmFsUmVjdC5oZWlnaHQgKyB0aGlzLnNjcm9sbGVkLFxyXG4gICAgICAgICAgICBsZWZ0OiB0aGlzLm9yaWdpbmFsUmVjdC5sZWZ0LFxyXG4gICAgICAgICAgICB0b3A6IHRoaXMub3JpZ2luYWxSZWN0LnRvcCAtIHRoaXMuc2Nyb2xsZWRcclxuICAgICAgICB9O1xyXG4gICAgICAgIGNvbnN0IG9mZnNldFggPSBldmVudC5jbGllbnRYIC0gb0V2ZW50LmNsaWVudFg7XHJcbiAgICAgICAgY29uc3Qgb2Zmc2V0WSA9IGV2ZW50LmNsaWVudFkgLSBvRXZlbnQuY2xpZW50WTtcclxuICAgICAgICBpZiAoZGlyLmluZGV4T2YoJ2UnKSA+IC0xKSB7XHJcbiAgICAgICAgICAgIG5ld1JlY3Qud2lkdGggKz0gb2Zmc2V0WDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoZGlyLmluZGV4T2YoJ3cnKSA+IC0xKSB7XHJcbiAgICAgICAgICAgIG5ld1JlY3Qud2lkdGggLT0gb2Zmc2V0WDtcclxuICAgICAgICAgICAgbmV3UmVjdC5sZWZ0ICs9IG9mZnNldFg7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChkaXIuaW5kZXhPZigncycpID4gLTEpIHtcclxuICAgICAgICAgICAgbmV3UmVjdC5oZWlnaHQgKz0gb2Zmc2V0WTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoZGlyLmluZGV4T2YoJ24nKSA+IC0xKSB7XHJcbiAgICAgICAgICAgIG5ld1JlY3QuaGVpZ2h0IC09IG9mZnNldFk7XHJcbiAgICAgICAgICAgIG5ld1JlY3QudG9wICs9IG9mZnNldFk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IGNvbnN0cmFpbiA9IHRoaXMuX2NvbnN0cmFpblNpemUobmV3UmVjdC53aWR0aCwgbmV3UmVjdC5oZWlnaHQpO1xyXG4gICAgICAgIGlmIChNYXRoLnJvdW5kKG5ld1JlY3Qud2lkdGgpICE9PSBNYXRoLnJvdW5kKGNvbnN0cmFpbi53aWR0aCkpIHsgLy8gcm91bmQgdG8gaWdub3JlIHNsaWdodCByb3VuZC1vZmYgZXJyb3JzXHJcbiAgICAgICAgICAgIGlmIChkaXIuaW5kZXhPZigndycpID4gLTEpIHtcclxuICAgICAgICAgICAgICAgIG5ld1JlY3QubGVmdCArPSBuZXdSZWN0LndpZHRoIC0gY29uc3RyYWluLndpZHRoO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIG5ld1JlY3Qud2lkdGggPSBjb25zdHJhaW4ud2lkdGg7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChNYXRoLnJvdW5kKG5ld1JlY3QuaGVpZ2h0KSAhPT0gTWF0aC5yb3VuZChjb25zdHJhaW4uaGVpZ2h0KSkge1xyXG4gICAgICAgICAgICBpZiAoZGlyLmluZGV4T2YoJ24nKSA+IC0xKSB7XHJcbiAgICAgICAgICAgICAgICBuZXdSZWN0LnRvcCArPSBuZXdSZWN0LmhlaWdodCAtIGNvbnN0cmFpbi5oZWlnaHQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbmV3UmVjdC5oZWlnaHQgPSBjb25zdHJhaW4uaGVpZ2h0O1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbmV3UmVjdDtcclxuICAgIH1cclxuICAgIC8qKiBAaW50ZXJuYWwgY29uc3RyYWluIHRoZSBzaXplIHRvIHRoZSBzZXQgbWluL21heCB2YWx1ZXMgKi9cclxuICAgIF9jb25zdHJhaW5TaXplKG9XaWR0aCwgb0hlaWdodCkge1xyXG4gICAgICAgIGNvbnN0IG1heFdpZHRoID0gdGhpcy5vcHRpb24ubWF4V2lkdGggfHwgTnVtYmVyLk1BWF9TQUZFX0lOVEVHRVI7XHJcbiAgICAgICAgY29uc3QgbWluV2lkdGggPSB0aGlzLm9wdGlvbi5taW5XaWR0aCB8fCBvV2lkdGg7XHJcbiAgICAgICAgY29uc3QgbWF4SGVpZ2h0ID0gdGhpcy5vcHRpb24ubWF4SGVpZ2h0IHx8IE51bWJlci5NQVhfU0FGRV9JTlRFR0VSO1xyXG4gICAgICAgIGNvbnN0IG1pbkhlaWdodCA9IHRoaXMub3B0aW9uLm1pbkhlaWdodCB8fCBvSGVpZ2h0O1xyXG4gICAgICAgIGNvbnN0IHdpZHRoID0gTWF0aC5taW4obWF4V2lkdGgsIE1hdGgubWF4KG1pbldpZHRoLCBvV2lkdGgpKTtcclxuICAgICAgICBjb25zdCBoZWlnaHQgPSBNYXRoLm1pbihtYXhIZWlnaHQsIE1hdGgubWF4KG1pbkhlaWdodCwgb0hlaWdodCkpO1xyXG4gICAgICAgIHJldHVybiB7IHdpZHRoLCBoZWlnaHQgfTtcclxuICAgIH1cclxuICAgIC8qKiBAaW50ZXJuYWwgKi9cclxuICAgIF9hcHBseUNoYW5nZSgpIHtcclxuICAgICAgICBsZXQgY29udGFpbm1lbnRSZWN0ID0geyBsZWZ0OiAwLCB0b3A6IDAsIHdpZHRoOiAwLCBoZWlnaHQ6IDAgfTtcclxuICAgICAgICBpZiAodGhpcy5lbC5zdHlsZS5wb3NpdGlvbiA9PT0gJ2Fic29sdXRlJykge1xyXG4gICAgICAgICAgICBjb25zdCBjb250YWlubWVudEVsID0gdGhpcy5lbC5wYXJlbnRFbGVtZW50O1xyXG4gICAgICAgICAgICBjb25zdCB7IGxlZnQsIHRvcCB9ID0gY29udGFpbm1lbnRFbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcclxuICAgICAgICAgICAgY29udGFpbm1lbnRSZWN0ID0geyBsZWZ0LCB0b3AsIHdpZHRoOiAwLCBoZWlnaHQ6IDAgfTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCF0aGlzLnRlbXBvcmFsUmVjdClcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgT2JqZWN0LmtleXModGhpcy50ZW1wb3JhbFJlY3QpLmZvckVhY2goa2V5ID0+IHtcclxuICAgICAgICAgICAgY29uc3QgdmFsdWUgPSB0aGlzLnRlbXBvcmFsUmVjdFtrZXldO1xyXG4gICAgICAgICAgICB0aGlzLmVsLnN0eWxlW2tleV0gPSB2YWx1ZSAtIGNvbnRhaW5tZW50UmVjdFtrZXldICsgJ3B4JztcclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuICAgIC8qKiBAaW50ZXJuYWwgKi9cclxuICAgIF9yZW1vdmVIYW5kbGVycygpIHtcclxuICAgICAgICB0aGlzLmhhbmRsZXJzLmZvckVhY2goaGFuZGxlID0+IGhhbmRsZS5kZXN0cm95KCkpO1xyXG4gICAgICAgIGRlbGV0ZSB0aGlzLmhhbmRsZXJzO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydHMuRERSZXNpemFibGUgPSBERFJlc2l6YWJsZTtcclxuLyoqIEBpbnRlcm5hbCAqL1xyXG5ERFJlc2l6YWJsZS5fb3JpZ2luU3R5bGVQcm9wID0gWyd3aWR0aCcsICdoZWlnaHQnLCAncG9zaXRpb24nLCAnbGVmdCcsICd0b3AnLCAnb3BhY2l0eScsICd6SW5kZXgnXTtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGQtcmVzaXphYmxlLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xyXG4vKipcclxuICogdG91Y2gudHMgNy4zLjBcclxuICogQ29weXJpZ2h0IChjKSAyMDIxIEFsYWluIER1bWVzbnkgLSBzZWUgR3JpZFN0YWNrIHJvb3QgbGljZW5zZVxyXG4gKi9cclxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xyXG5leHBvcnRzLnBvaW50ZXJsZWF2ZSA9IGV4cG9ydHMucG9pbnRlcmVudGVyID0gZXhwb3J0cy5wb2ludGVyZG93biA9IGV4cG9ydHMudG91Y2hlbmQgPSBleHBvcnRzLnRvdWNobW92ZSA9IGV4cG9ydHMudG91Y2hzdGFydCA9IGV4cG9ydHMuaXNUb3VjaCA9IHZvaWQgMDtcclxuY29uc3QgZGRfbWFuYWdlcl8xID0gcmVxdWlyZShcIi4vZGQtbWFuYWdlclwiKTtcclxuLyoqXHJcbiAqIERldGVjdCB0b3VjaCBzdXBwb3J0IC0gV2luZG93cyBTdXJmYWNlIGRldmljZXMgYW5kIG90aGVyIHRvdWNoIGRldmljZXNcclxuICogc2hvdWxkIHdlIHVzZSB0aGlzIGluc3RlYWQgPyAod2hhdCB3ZSBoYWQgZm9yIGFsd2F5cyBzaG93aW5nIHJlc2l6ZSBoYW5kbGVzKVxyXG4gKiAvQW5kcm9pZHx3ZWJPU3xpUGhvbmV8aVBhZHxpUG9kfEJsYWNrQmVycnl8SUVNb2JpbGV8T3BlcmEgTWluaS9pLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudClcclxuICovXHJcbmV4cG9ydHMuaXNUb3VjaCA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBkb2N1bWVudCAhPT0gJ3VuZGVmaW5lZCcgJiZcclxuICAgICgnb250b3VjaHN0YXJ0JyBpbiBkb2N1bWVudFxyXG4gICAgICAgIHx8ICdvbnRvdWNoc3RhcnQnIGluIHdpbmRvd1xyXG4gICAgICAgIC8vIHx8ICEhd2luZG93LlRvdWNoRXZlbnQgLy8gdHJ1ZSBvbiBXaW5kb3dzIDEwIENocm9tZSBkZXNrdG9wIHNvIGRvbid0IHVzZSB0aGlzXHJcbiAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1leHBsaWNpdC1hbnlcclxuICAgICAgICB8fCAod2luZG93LkRvY3VtZW50VG91Y2ggJiYgZG9jdW1lbnQgaW5zdGFuY2VvZiB3aW5kb3cuRG9jdW1lbnRUb3VjaClcclxuICAgICAgICB8fCBuYXZpZ2F0b3IubWF4VG91Y2hQb2ludHMgPiAwXHJcbiAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1leHBsaWNpdC1hbnlcclxuICAgICAgICB8fCBuYXZpZ2F0b3IubXNNYXhUb3VjaFBvaW50cyA+IDApO1xyXG4vLyBpbnRlcmZhY2UgVG91Y2hDb29yZCB7eDogbnVtYmVyLCB5OiBudW1iZXJ9O1xyXG5jbGFzcyBERFRvdWNoIHtcclxufVxyXG4vKipcclxuKiBHZXQgdGhlIHgseSBwb3NpdGlvbiBvZiBhIHRvdWNoIGV2ZW50XHJcbiovXHJcbi8vIGZ1bmN0aW9uIGdldFRvdWNoQ29vcmRzKGU6IFRvdWNoRXZlbnQpOiBUb3VjaENvb3JkIHtcclxuLy8gICByZXR1cm4ge1xyXG4vLyAgICAgeDogZS5jaGFuZ2VkVG91Y2hlc1swXS5wYWdlWCxcclxuLy8gICAgIHk6IGUuY2hhbmdlZFRvdWNoZXNbMF0ucGFnZVlcclxuLy8gICB9O1xyXG4vLyB9XHJcbi8qKlxyXG4gKiBTaW11bGF0ZSBhIG1vdXNlIGV2ZW50IGJhc2VkIG9uIGEgY29ycmVzcG9uZGluZyB0b3VjaCBldmVudFxyXG4gKiBAcGFyYW0ge09iamVjdH0gZSBBIHRvdWNoIGV2ZW50XHJcbiAqIEBwYXJhbSB7U3RyaW5nfSBzaW11bGF0ZWRUeXBlIFRoZSBjb3JyZXNwb25kaW5nIG1vdXNlIGV2ZW50XHJcbiAqL1xyXG5mdW5jdGlvbiBzaW11bGF0ZU1vdXNlRXZlbnQoZSwgc2ltdWxhdGVkVHlwZSkge1xyXG4gICAgLy8gSWdub3JlIG11bHRpLXRvdWNoIGV2ZW50c1xyXG4gICAgaWYgKGUudG91Y2hlcy5sZW5ndGggPiAxKVxyXG4gICAgICAgIHJldHVybjtcclxuICAgIC8vIFByZXZlbnQgXCJJZ25vcmVkIGF0dGVtcHQgdG8gY2FuY2VsIGEgdG91Y2htb3ZlIGV2ZW50IHdpdGggY2FuY2VsYWJsZT1mYWxzZVwiIGVycm9yc1xyXG4gICAgaWYgKGUuY2FuY2VsYWJsZSlcclxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICBjb25zdCB0b3VjaCA9IGUuY2hhbmdlZFRvdWNoZXNbMF0sIHNpbXVsYXRlZEV2ZW50ID0gZG9jdW1lbnQuY3JlYXRlRXZlbnQoJ01vdXNlRXZlbnRzJyk7XHJcbiAgICAvLyBJbml0aWFsaXplIHRoZSBzaW11bGF0ZWQgbW91c2UgZXZlbnQgdXNpbmcgdGhlIHRvdWNoIGV2ZW50J3MgY29vcmRpbmF0ZXNcclxuICAgIHNpbXVsYXRlZEV2ZW50LmluaXRNb3VzZUV2ZW50KHNpbXVsYXRlZFR5cGUsIC8vIHR5cGVcclxuICAgIHRydWUsIC8vIGJ1YmJsZXNcclxuICAgIHRydWUsIC8vIGNhbmNlbGFibGVcclxuICAgIHdpbmRvdywgLy8gdmlld1xyXG4gICAgMSwgLy8gZGV0YWlsXHJcbiAgICB0b3VjaC5zY3JlZW5YLCAvLyBzY3JlZW5YXHJcbiAgICB0b3VjaC5zY3JlZW5ZLCAvLyBzY3JlZW5ZXHJcbiAgICB0b3VjaC5jbGllbnRYLCAvLyBjbGllbnRYXHJcbiAgICB0b3VjaC5jbGllbnRZLCAvLyBjbGllbnRZXHJcbiAgICBmYWxzZSwgLy8gY3RybEtleVxyXG4gICAgZmFsc2UsIC8vIGFsdEtleVxyXG4gICAgZmFsc2UsIC8vIHNoaWZ0S2V5XHJcbiAgICBmYWxzZSwgLy8gbWV0YUtleVxyXG4gICAgMCwgLy8gYnV0dG9uXHJcbiAgICBudWxsIC8vIHJlbGF0ZWRUYXJnZXRcclxuICAgICk7XHJcbiAgICAvLyBEaXNwYXRjaCB0aGUgc2ltdWxhdGVkIGV2ZW50IHRvIHRoZSB0YXJnZXQgZWxlbWVudFxyXG4gICAgZS50YXJnZXQuZGlzcGF0Y2hFdmVudChzaW11bGF0ZWRFdmVudCk7XHJcbn1cclxuLyoqXHJcbiAqIFNpbXVsYXRlIGEgbW91c2UgZXZlbnQgYmFzZWQgb24gYSBjb3JyZXNwb25kaW5nIFBvaW50ZXIgZXZlbnRcclxuICogQHBhcmFtIHtPYmplY3R9IGUgQSBwb2ludGVyIGV2ZW50XHJcbiAqIEBwYXJhbSB7U3RyaW5nfSBzaW11bGF0ZWRUeXBlIFRoZSBjb3JyZXNwb25kaW5nIG1vdXNlIGV2ZW50XHJcbiAqL1xyXG5mdW5jdGlvbiBzaW11bGF0ZVBvaW50ZXJNb3VzZUV2ZW50KGUsIHNpbXVsYXRlZFR5cGUpIHtcclxuICAgIC8vIFByZXZlbnQgXCJJZ25vcmVkIGF0dGVtcHQgdG8gY2FuY2VsIGEgdG91Y2htb3ZlIGV2ZW50IHdpdGggY2FuY2VsYWJsZT1mYWxzZVwiIGVycm9yc1xyXG4gICAgaWYgKGUuY2FuY2VsYWJsZSlcclxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICBjb25zdCBzaW11bGF0ZWRFdmVudCA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KCdNb3VzZUV2ZW50cycpO1xyXG4gICAgLy8gSW5pdGlhbGl6ZSB0aGUgc2ltdWxhdGVkIG1vdXNlIGV2ZW50IHVzaW5nIHRoZSB0b3VjaCBldmVudCdzIGNvb3JkaW5hdGVzXHJcbiAgICBzaW11bGF0ZWRFdmVudC5pbml0TW91c2VFdmVudChzaW11bGF0ZWRUeXBlLCAvLyB0eXBlXHJcbiAgICB0cnVlLCAvLyBidWJibGVzXHJcbiAgICB0cnVlLCAvLyBjYW5jZWxhYmxlXHJcbiAgICB3aW5kb3csIC8vIHZpZXdcclxuICAgIDEsIC8vIGRldGFpbFxyXG4gICAgZS5zY3JlZW5YLCAvLyBzY3JlZW5YXHJcbiAgICBlLnNjcmVlblksIC8vIHNjcmVlbllcclxuICAgIGUuY2xpZW50WCwgLy8gY2xpZW50WFxyXG4gICAgZS5jbGllbnRZLCAvLyBjbGllbnRZXHJcbiAgICBmYWxzZSwgLy8gY3RybEtleVxyXG4gICAgZmFsc2UsIC8vIGFsdEtleVxyXG4gICAgZmFsc2UsIC8vIHNoaWZ0S2V5XHJcbiAgICBmYWxzZSwgLy8gbWV0YUtleVxyXG4gICAgMCwgLy8gYnV0dG9uXHJcbiAgICBudWxsIC8vIHJlbGF0ZWRUYXJnZXRcclxuICAgICk7XHJcbiAgICAvLyBEaXNwYXRjaCB0aGUgc2ltdWxhdGVkIGV2ZW50IHRvIHRoZSB0YXJnZXQgZWxlbWVudFxyXG4gICAgZS50YXJnZXQuZGlzcGF0Y2hFdmVudChzaW11bGF0ZWRFdmVudCk7XHJcbn1cclxuLyoqXHJcbiAqIEhhbmRsZSB0aGUgdG91Y2hzdGFydCBldmVudHNcclxuICogQHBhcmFtIHtPYmplY3R9IGUgVGhlIHdpZGdldCBlbGVtZW50J3MgdG91Y2hzdGFydCBldmVudFxyXG4gKi9cclxuZnVuY3Rpb24gdG91Y2hzdGFydChlKSB7XHJcbiAgICAvLyBJZ25vcmUgdGhlIGV2ZW50IGlmIGFub3RoZXIgd2lkZ2V0IGlzIGFscmVhZHkgYmVpbmcgaGFuZGxlZFxyXG4gICAgaWYgKEREVG91Y2gudG91Y2hIYW5kbGVkKVxyXG4gICAgICAgIHJldHVybjtcclxuICAgIEREVG91Y2gudG91Y2hIYW5kbGVkID0gdHJ1ZTtcclxuICAgIC8vIFNpbXVsYXRlIHRoZSBtb3VzZSBldmVudHNcclxuICAgIC8vIHNpbXVsYXRlTW91c2VFdmVudChlLCAnbW91c2VvdmVyJyk7XHJcbiAgICAvLyBzaW11bGF0ZU1vdXNlRXZlbnQoZSwgJ21vdXNlbW92ZScpO1xyXG4gICAgc2ltdWxhdGVNb3VzZUV2ZW50KGUsICdtb3VzZWRvd24nKTtcclxufVxyXG5leHBvcnRzLnRvdWNoc3RhcnQgPSB0b3VjaHN0YXJ0O1xyXG4vKipcclxuICogSGFuZGxlIHRoZSB0b3VjaG1vdmUgZXZlbnRzXHJcbiAqIEBwYXJhbSB7T2JqZWN0fSBlIFRoZSBkb2N1bWVudCdzIHRvdWNobW92ZSBldmVudFxyXG4gKi9cclxuZnVuY3Rpb24gdG91Y2htb3ZlKGUpIHtcclxuICAgIC8vIElnbm9yZSBldmVudCBpZiBub3QgaGFuZGxlZCBieSB1c1xyXG4gICAgaWYgKCFERFRvdWNoLnRvdWNoSGFuZGxlZClcclxuICAgICAgICByZXR1cm47XHJcbiAgICBzaW11bGF0ZU1vdXNlRXZlbnQoZSwgJ21vdXNlbW92ZScpO1xyXG59XHJcbmV4cG9ydHMudG91Y2htb3ZlID0gdG91Y2htb3ZlO1xyXG4vKipcclxuICogSGFuZGxlIHRoZSB0b3VjaGVuZCBldmVudHNcclxuICogQHBhcmFtIHtPYmplY3R9IGUgVGhlIGRvY3VtZW50J3MgdG91Y2hlbmQgZXZlbnRcclxuICovXHJcbmZ1bmN0aW9uIHRvdWNoZW5kKGUpIHtcclxuICAgIC8vIElnbm9yZSBldmVudCBpZiBub3QgaGFuZGxlZFxyXG4gICAgaWYgKCFERFRvdWNoLnRvdWNoSGFuZGxlZClcclxuICAgICAgICByZXR1cm47XHJcbiAgICAvLyBjYW5jZWwgZGVsYXllZCBsZWF2ZSBldmVudCB3aGVuIHdlIHJlbGVhc2Ugb24gb3Vyc2VsZiB3aGljaCBoYXBwZW5zIEJFRk9SRSB3ZSBnZXQgdGhpcyFcclxuICAgIGlmIChERFRvdWNoLnBvaW50ZXJMZWF2ZVRpbWVvdXQpIHtcclxuICAgICAgICB3aW5kb3cuY2xlYXJUaW1lb3V0KEREVG91Y2gucG9pbnRlckxlYXZlVGltZW91dCk7XHJcbiAgICAgICAgZGVsZXRlIEREVG91Y2gucG9pbnRlckxlYXZlVGltZW91dDtcclxuICAgIH1cclxuICAgIGNvbnN0IHdhc0RyYWdnaW5nID0gISFkZF9tYW5hZ2VyXzEuRERNYW5hZ2VyLmRyYWdFbGVtZW50O1xyXG4gICAgLy8gU2ltdWxhdGUgdGhlIG1vdXNldXAgZXZlbnRcclxuICAgIHNpbXVsYXRlTW91c2VFdmVudChlLCAnbW91c2V1cCcpO1xyXG4gICAgLy8gc2ltdWxhdGVNb3VzZUV2ZW50KGV2ZW50LCAnbW91c2VvdXQnKTtcclxuICAgIC8vIElmIHRoZSB0b3VjaCBpbnRlcmFjdGlvbiBkaWQgbm90IG1vdmUsIGl0IHNob3VsZCB0cmlnZ2VyIGEgY2xpY2tcclxuICAgIGlmICghd2FzRHJhZ2dpbmcpIHtcclxuICAgICAgICBzaW11bGF0ZU1vdXNlRXZlbnQoZSwgJ2NsaWNrJyk7XHJcbiAgICB9XHJcbiAgICAvLyBVbnNldCB0aGUgZmxhZyB0byBhbGxvdyBvdGhlciB3aWRnZXRzIHRvIGluaGVyaXQgdGhlIHRvdWNoIGV2ZW50XHJcbiAgICBERFRvdWNoLnRvdWNoSGFuZGxlZCA9IGZhbHNlO1xyXG59XHJcbmV4cG9ydHMudG91Y2hlbmQgPSB0b3VjaGVuZDtcclxuLyoqXHJcbiAqIE5vdGUgd2UgZG9uJ3QgZ2V0IHRvdWNoZW50ZXIvdG91Y2hsZWF2ZSAod2hpY2ggYXJlIGRlcHJlY2F0ZWQpXHJcbiAqIHNlZSBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8yNzkwODMzOS9qcy10b3VjaC1lcXVpdmFsZW50LWZvci1tb3VzZWVudGVyXHJcbiAqIHNvIGluc3RlYWQgb2YgUG9pbnRlckV2ZW50IHRvIHN0aWxsIGdldCBlbnRlci9sZWF2ZSBhbmQgc2VuZCB0aGUgbWF0Y2hpbmcgbW91c2UgZXZlbnQuXHJcbiAqL1xyXG5mdW5jdGlvbiBwb2ludGVyZG93bihlKSB7XHJcbiAgICAvLyBjb25zb2xlLmxvZyhcInBvaW50ZXIgZG93blwiKVxyXG4gICAgZS50YXJnZXQucmVsZWFzZVBvaW50ZXJDYXB0dXJlKGUucG9pbnRlcklkKTsgLy8gPC0gSW1wb3J0YW50IVxyXG59XHJcbmV4cG9ydHMucG9pbnRlcmRvd24gPSBwb2ludGVyZG93bjtcclxuZnVuY3Rpb24gcG9pbnRlcmVudGVyKGUpIHtcclxuICAgIC8vIGlnbm9yZSB0aGUgaW5pdGlhbCBvbmUgd2UgZ2V0IG9uIHBvaW50ZXJkb3duIG9uIG91cnNlbGZcclxuICAgIGlmICghZGRfbWFuYWdlcl8xLkRETWFuYWdlci5kcmFnRWxlbWVudCkge1xyXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKCdwb2ludGVyZW50ZXIgaWdub3JlZCcpO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIC8vIGNvbnNvbGUubG9nKCdwb2ludGVyZW50ZXInKTtcclxuICAgIHNpbXVsYXRlUG9pbnRlck1vdXNlRXZlbnQoZSwgJ21vdXNlZW50ZXInKTtcclxufVxyXG5leHBvcnRzLnBvaW50ZXJlbnRlciA9IHBvaW50ZXJlbnRlcjtcclxuZnVuY3Rpb24gcG9pbnRlcmxlYXZlKGUpIHtcclxuICAgIC8vIGlnbm9yZSB0aGUgbGVhdmUgb24gb3Vyc2VsZiB3ZSBnZXQgYmVmb3JlIHJlbGVhc2luZyB0aGUgbW91c2Ugb3ZlciBvdXJzZWxmXHJcbiAgICAvLyBieSBkZWxheWluZyBzZW5kaW5nIHRoZSBldmVudCBhbmQgaGF2aW5nIHRoZSB1cCBldmVudCBjYW5jZWwgdXNcclxuICAgIGlmICghZGRfbWFuYWdlcl8xLkRETWFuYWdlci5kcmFnRWxlbWVudCkge1xyXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKCdwb2ludGVybGVhdmUgaWdub3JlZCcpO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIEREVG91Y2gucG9pbnRlckxlYXZlVGltZW91dCA9IHdpbmRvdy5zZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICBkZWxldGUgRERUb3VjaC5wb2ludGVyTGVhdmVUaW1lb3V0O1xyXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKCdwb2ludGVybGVhdmUgZGVsYXllZCcpO1xyXG4gICAgICAgIHNpbXVsYXRlUG9pbnRlck1vdXNlRXZlbnQoZSwgJ21vdXNlbGVhdmUnKTtcclxuICAgIH0sIDEwKTtcclxufVxyXG5leHBvcnRzLnBvaW50ZXJsZWF2ZSA9IHBvaW50ZXJsZWF2ZTtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGQtdG91Y2guanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbi8qKlxyXG4gKiBncmlkc3RhY2stZW5naW5lLnRzIDcuMy4wXHJcbiAqIENvcHlyaWdodCAoYykgMjAyMS0yMDIyIEFsYWluIER1bWVzbnkgLSBzZWUgR3JpZFN0YWNrIHJvb3QgbGljZW5zZVxyXG4gKi9cclxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xyXG5leHBvcnRzLkdyaWRTdGFja0VuZ2luZSA9IHZvaWQgMDtcclxuY29uc3QgdXRpbHNfMSA9IHJlcXVpcmUoXCIuL3V0aWxzXCIpO1xyXG4vKipcclxuICogRGVmaW5lcyB0aGUgR3JpZFN0YWNrIGVuZ2luZSB0aGF0IGRvZXMgbW9zdCBubyBET00gZ3JpZCBtYW5pcHVsYXRpb24uXHJcbiAqIFNlZSBHcmlkU3RhY2sgbWV0aG9kcyBhbmQgdmFycyBmb3IgZGVzY3JpcHRpb25zLlxyXG4gKlxyXG4gKiBOT1RFOiB2YWx1ZXMgc2hvdWxkIG5vdCBiZSBtb2RpZmllZCBkaXJlY3RseSAtIGNhbGwgdGhlIG1haW4gR3JpZFN0YWNrIEFQSSBpbnN0ZWFkXHJcbiAqL1xyXG5jbGFzcyBHcmlkU3RhY2tFbmdpbmUge1xyXG4gICAgY29uc3RydWN0b3Iob3B0cyA9IHt9KSB7XHJcbiAgICAgICAgdGhpcy5hZGRlZE5vZGVzID0gW107XHJcbiAgICAgICAgdGhpcy5yZW1vdmVkTm9kZXMgPSBbXTtcclxuICAgICAgICB0aGlzLmNvbHVtbiA9IG9wdHMuY29sdW1uIHx8IDEyO1xyXG4gICAgICAgIHRoaXMubWF4Um93ID0gb3B0cy5tYXhSb3c7XHJcbiAgICAgICAgdGhpcy5fZmxvYXQgPSBvcHRzLmZsb2F0O1xyXG4gICAgICAgIHRoaXMubm9kZXMgPSBvcHRzLm5vZGVzIHx8IFtdO1xyXG4gICAgICAgIHRoaXMub25DaGFuZ2UgPSBvcHRzLm9uQ2hhbmdlO1xyXG4gICAgfVxyXG4gICAgYmF0Y2hVcGRhdGUoZmxhZyA9IHRydWUpIHtcclxuICAgICAgICBpZiAoISF0aGlzLmJhdGNoTW9kZSA9PT0gZmxhZylcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgdGhpcy5iYXRjaE1vZGUgPSBmbGFnO1xyXG4gICAgICAgIGlmIChmbGFnKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3ByZXZGbG9hdCA9IHRoaXMuX2Zsb2F0O1xyXG4gICAgICAgICAgICB0aGlzLl9mbG9hdCA9IHRydWU7IC8vIGxldCB0aGluZ3MgZ28gYW55d2hlcmUgZm9yIG5vdy4uLiB3aWxsIHJlc3RvcmUgYW5kIHBvc3NpYmx5IHJlcG9zaXRpb24gbGF0ZXJcclxuICAgICAgICAgICAgdGhpcy5zYXZlSW5pdGlhbCgpOyAvLyBzaW5jZSBiZWdpbiB1cGRhdGUgKHdoaWNoIGlzIGNhbGxlZCBtdWx0aXBsZSB0aW1lcykgd29uJ3QgZG8gdGhpc1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5fZmxvYXQgPSB0aGlzLl9wcmV2RmxvYXQ7XHJcbiAgICAgICAgICAgIGRlbGV0ZSB0aGlzLl9wcmV2RmxvYXQ7XHJcbiAgICAgICAgICAgIHRoaXMuX3BhY2tOb2RlcygpLl9ub3RpZnkoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbiAgICAvLyB1c2UgZW50aXJlIHJvdyBmb3IgaGl0dGluZyBhcmVhICh3aWxsIHVzZSBib3R0b20gcmV2ZXJzZSBzb3J0ZWQgZmlyc3QpIGlmIHdlIG5vdCBhY3RpdmVseSBtb3ZpbmcgRE9XTiBhbmQgZGlkbid0IGFscmVhZHkgc2tpcFxyXG4gICAgX3VzZUVudGlyZVJvd0FyZWEobm9kZSwgbm4pIHtcclxuICAgICAgICByZXR1cm4gKCF0aGlzLmZsb2F0IHx8IHRoaXMuYmF0Y2hNb2RlICYmICF0aGlzLl9wcmV2RmxvYXQpICYmICF0aGlzLl9oYXNMb2NrZWQgJiYgKCFub2RlLl9tb3ZpbmcgfHwgbm9kZS5fc2tpcERvd24gfHwgbm4ueSA8PSBub2RlLnkpO1xyXG4gICAgfVxyXG4gICAgLyoqIEBpbnRlcm5hbCBmaXggY29sbGlzaW9uIG9uIGdpdmVuICdub2RlJywgZ29pbmcgdG8gZ2l2ZW4gbmV3IGxvY2F0aW9uICdubicsIHdpdGggb3B0aW9uYWwgJ2NvbGxpZGUnIG5vZGUgYWxyZWFkeSBmb3VuZC5cclxuICAgICAqIHJldHVybiB0cnVlIGlmIHdlIG1vdmVkLiAqL1xyXG4gICAgX2ZpeENvbGxpc2lvbnMobm9kZSwgbm4gPSBub2RlLCBjb2xsaWRlLCBvcHQgPSB7fSkge1xyXG4gICAgICAgIHRoaXMuc29ydE5vZGVzKC0xKTsgLy8gZnJvbSBsYXN0IHRvIGZpcnN0LCBzbyByZWN1cnNpdmUgY29sbGlzaW9uIG1vdmUgaXRlbXMgaW4gdGhlIHJpZ2h0IG9yZGVyXHJcbiAgICAgICAgY29sbGlkZSA9IGNvbGxpZGUgfHwgdGhpcy5jb2xsaWRlKG5vZGUsIG5uKTsgLy8gUkVBTCBhcmVhIGNvbGxpZGUgZm9yIHN3YXAgYW5kIHNraXAgaWYgbm9uZS4uLlxyXG4gICAgICAgIGlmICghY29sbGlkZSlcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIC8vIHN3YXAgY2hlY2s6IGlmIHdlJ3JlIGFjdGl2ZWx5IG1vdmluZyBpbiBncmF2aXR5IG1vZGUsIHNlZSBpZiB3ZSBjb2xsaWRlIHdpdGggYW4gb2JqZWN0IHRoZSBzYW1lIHNpemVcclxuICAgICAgICBpZiAobm9kZS5fbW92aW5nICYmICFvcHQubmVzdGVkICYmICF0aGlzLmZsb2F0KSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnN3YXAobm9kZSwgY29sbGlkZSkpXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gZHVyaW5nIHdoaWxlKCkgY29sbGlzaW9ucyBNQUtFIFNVUkUgdG8gY2hlY2sgZW50aXJlIHJvdyBzbyBsYXJnZXIgaXRlbXMgZG9uJ3QgbGVhcCBmcm9nIHNtYWxsIG9uZXMgKHB1c2ggdGhlbSBhbGwgZG93biBzdGFydGluZyBsYXN0IGluIGdyaWQpXHJcbiAgICAgICAgbGV0IGFyZWEgPSBubjtcclxuICAgICAgICBpZiAodGhpcy5fdXNlRW50aXJlUm93QXJlYShub2RlLCBubikpIHtcclxuICAgICAgICAgICAgYXJlYSA9IHsgeDogMCwgdzogdGhpcy5jb2x1bW4sIHk6IG5uLnksIGg6IG5uLmggfTtcclxuICAgICAgICAgICAgY29sbGlkZSA9IHRoaXMuY29sbGlkZShub2RlLCBhcmVhLCBvcHQuc2tpcCk7IC8vIGZvcmNlIG5ldyBoaXRcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IGRpZE1vdmUgPSBmYWxzZTtcclxuICAgICAgICBsZXQgbmV3T3B0ID0geyBuZXN0ZWQ6IHRydWUsIHBhY2s6IGZhbHNlIH07XHJcbiAgICAgICAgd2hpbGUgKGNvbGxpZGUgPSBjb2xsaWRlIHx8IHRoaXMuY29sbGlkZShub2RlLCBhcmVhLCBvcHQuc2tpcCkpIHsgLy8gY291bGQgY29sbGlkZSB3aXRoIG1vcmUgdGhhbiAxIGl0ZW0uLi4gc28gcmVwZWF0IGZvciBlYWNoXHJcbiAgICAgICAgICAgIGxldCBtb3ZlZDtcclxuICAgICAgICAgICAgLy8gaWYgY29sbGlkaW5nIHdpdGggYSBsb2NrZWQgaXRlbSBPUiBtb3ZpbmcgZG93biB3aXRoIHRvcCBncmF2aXR5IChhbmQgY29sbGlkZSBjb3VsZCBtb3ZlIHVwKSAtPiBza2lwIHBhc3QgdGhlIGNvbGxpZGUsXHJcbiAgICAgICAgICAgIC8vIGJ1dCByZW1lbWJlciB0aGF0IHNraXAgZG93biBzbyB3ZSBvbmx5IGRvIHRoaXMgb25jZSAoYW5kIHB1c2ggb3RoZXJzIG90aGVyd2lzZSkuXHJcbiAgICAgICAgICAgIGlmIChjb2xsaWRlLmxvY2tlZCB8fCBub2RlLl9tb3ZpbmcgJiYgIW5vZGUuX3NraXBEb3duICYmIG5uLnkgPiBub2RlLnkgJiYgIXRoaXMuZmxvYXQgJiZcclxuICAgICAgICAgICAgICAgIC8vIGNhbiB0YWtlIHNwYWNlIHdlIGhhZCwgb3IgYmVmb3JlIHdoZXJlIHdlJ3JlIGdvaW5nXHJcbiAgICAgICAgICAgICAgICAoIXRoaXMuY29sbGlkZShjb2xsaWRlLCBPYmplY3QuYXNzaWduKE9iamVjdC5hc3NpZ24oe30sIGNvbGxpZGUpLCB7IHk6IG5vZGUueSB9KSwgbm9kZSkgfHwgIXRoaXMuY29sbGlkZShjb2xsaWRlLCBPYmplY3QuYXNzaWduKE9iamVjdC5hc3NpZ24oe30sIGNvbGxpZGUpLCB7IHk6IG5uLnkgLSBjb2xsaWRlLmggfSksIG5vZGUpKSkge1xyXG4gICAgICAgICAgICAgICAgbm9kZS5fc2tpcERvd24gPSAobm9kZS5fc2tpcERvd24gfHwgbm4ueSA+IG5vZGUueSk7XHJcbiAgICAgICAgICAgICAgICBtb3ZlZCA9IHRoaXMubW92ZU5vZGUobm9kZSwgT2JqZWN0LmFzc2lnbihPYmplY3QuYXNzaWduKE9iamVjdC5hc3NpZ24oe30sIG5uKSwgeyB5OiBjb2xsaWRlLnkgKyBjb2xsaWRlLmggfSksIG5ld09wdCkpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGNvbGxpZGUubG9ja2VkICYmIG1vdmVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdXRpbHNfMS5VdGlscy5jb3B5UG9zKG5uLCBub2RlKTsgLy8gbW92aW5nIGFmdGVyIGxvY2sgYmVjb21lIG91ciBuZXcgZGVzaXJlZCBsb2NhdGlvblxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoIWNvbGxpZGUubG9ja2VkICYmIG1vdmVkICYmIG9wdC5wYWNrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gd2UgbW92ZWQgYWZ0ZXIgYW5kIHdpbGwgcGFjazogZG8gaXQgbm93IGFuZCBrZWVwIHRoZSBvcmlnaW5hbCBkcm9wIGxvY2F0aW9uLCBidXQgcGFzdCB0aGUgb2xkIGNvbGxpZGUgdG8gc2VlIHdoYXQgZWxzZSB3ZSBtaWdodCBwdXNoIHdheVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3BhY2tOb2RlcygpO1xyXG4gICAgICAgICAgICAgICAgICAgIG5uLnkgPSBjb2xsaWRlLnkgKyBjb2xsaWRlLmg7XHJcbiAgICAgICAgICAgICAgICAgICAgdXRpbHNfMS5VdGlscy5jb3B5UG9zKG5vZGUsIG5uKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGRpZE1vdmUgPSBkaWRNb3ZlIHx8IG1vdmVkO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgLy8gbW92ZSBjb2xsaWRlIGRvd24gKmFmdGVyKiB3aGVyZSB3ZSB3aWxsIGJlLCBpZ25vcmluZyB3aGVyZSB3ZSBhcmUgbm93IChkb24ndCBjb2xsaWRlIHdpdGggdXMpXHJcbiAgICAgICAgICAgICAgICBtb3ZlZCA9IHRoaXMubW92ZU5vZGUoY29sbGlkZSwgT2JqZWN0LmFzc2lnbihPYmplY3QuYXNzaWduKE9iamVjdC5hc3NpZ24oe30sIGNvbGxpZGUpLCB7IHk6IG5uLnkgKyBubi5oLCBza2lwOiBub2RlIH0pLCBuZXdPcHQpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoIW1vdmVkKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZGlkTW92ZTtcclxuICAgICAgICAgICAgfSAvLyBicmVhayBpbmYgbG9vcCBpZiB3ZSBjb3VsZG4ndCBtb3ZlIGFmdGVyIGFsbCAoZXg6IG1heFJvdywgZml4ZWQpXHJcbiAgICAgICAgICAgIGNvbGxpZGUgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBkaWRNb3ZlO1xyXG4gICAgfVxyXG4gICAgLyoqIHJldHVybiB0aGUgbm9kZXMgdGhhdCBpbnRlcmNlcHQgdGhlIGdpdmVuIG5vZGUuIE9wdGlvbmFsbHkgYSBkaWZmZXJlbnQgYXJlYSBjYW4gYmUgdXNlZCwgYXMgd2VsbCBhcyBhIHNlY29uZCBub2RlIHRvIHNraXAgKi9cclxuICAgIGNvbGxpZGUoc2tpcCwgYXJlYSA9IHNraXAsIHNraXAyKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubm9kZXMuZmluZChuID0+IG4gIT09IHNraXAgJiYgbiAhPT0gc2tpcDIgJiYgdXRpbHNfMS5VdGlscy5pc0ludGVyY2VwdGVkKG4sIGFyZWEpKTtcclxuICAgIH1cclxuICAgIGNvbGxpZGVBbGwoc2tpcCwgYXJlYSA9IHNraXAsIHNraXAyKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubm9kZXMuZmlsdGVyKG4gPT4gbiAhPT0gc2tpcCAmJiBuICE9PSBza2lwMiAmJiB1dGlsc18xLlV0aWxzLmlzSW50ZXJjZXB0ZWQobiwgYXJlYSkpO1xyXG4gICAgfVxyXG4gICAgLyoqIGRvZXMgYSBwaXhlbCBjb3ZlcmFnZSBjb2xsaXNpb24gYmFzZWQgb24gd2hlcmUgd2Ugc3RhcnRlZCwgcmV0dXJuaW5nIHRoZSBub2RlIHRoYXQgaGFzIHRoZSBtb3N0IGNvdmVyYWdlIHRoYXQgaXMgPjUwJSBtaWQgbGluZSAqL1xyXG4gICAgZGlyZWN0aW9uQ29sbGlkZUNvdmVyYWdlKG5vZGUsIG8sIGNvbGxpZGVzKSB7XHJcbiAgICAgICAgaWYgKCFvLnJlY3QgfHwgIW5vZGUuX3JlY3QpXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICBsZXQgcjAgPSBub2RlLl9yZWN0OyAvLyB3aGVyZSBzdGFydGVkXHJcbiAgICAgICAgbGV0IHIgPSBPYmplY3QuYXNzaWduKHt9LCBvLnJlY3QpOyAvLyB3aGVyZSB3ZSBhcmVcclxuICAgICAgICAvLyB1cGRhdGUgZHJhZ2dlZCByZWN0IHRvIHNob3cgd2hlcmUgaXQncyBjb21pbmcgZnJvbSAoYWJvdmUgb3IgYmVsb3csIGV0Yy4uLilcclxuICAgICAgICBpZiAoci55ID4gcjAueSkge1xyXG4gICAgICAgICAgICByLmggKz0gci55IC0gcjAueTtcclxuICAgICAgICAgICAgci55ID0gcjAueTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHIuaCArPSByMC55IC0gci55O1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoci54ID4gcjAueCkge1xyXG4gICAgICAgICAgICByLncgKz0gci54IC0gcjAueDtcclxuICAgICAgICAgICAgci54ID0gcjAueDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHIudyArPSByMC54IC0gci54O1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgY29sbGlkZTtcclxuICAgICAgICBjb2xsaWRlcy5mb3JFYWNoKG4gPT4ge1xyXG4gICAgICAgICAgICBpZiAobi5sb2NrZWQgfHwgIW4uX3JlY3QpXHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIGxldCByMiA9IG4uX3JlY3Q7IC8vIG92ZXJsYXBwaW5nIHRhcmdldFxyXG4gICAgICAgICAgICBsZXQgeU92ZXIgPSBOdW1iZXIuTUFYX1ZBTFVFLCB4T3ZlciA9IE51bWJlci5NQVhfVkFMVUUsIG92ZXJNYXggPSAwLjU7IC8vIG5lZWQgPjUwJVxyXG4gICAgICAgICAgICAvLyBkZXBlbmRpbmcgb24gd2hpY2ggc2lkZSB3ZSBzdGFydGVkIGZyb20sIGNvbXB1dGUgdGhlIG92ZXJsYXAgJSBvZiBjb3ZlcmFnZVxyXG4gICAgICAgICAgICAvLyAoZXg6IGZyb20gYWJvdmUvYmVsb3cgd2Ugb25seSBjb21wdXRlIHRoZSBtYXggaG9yaXpvbnRhbCBsaW5lIGNvdmVyYWdlKVxyXG4gICAgICAgICAgICBpZiAocjAueSA8IHIyLnkpIHsgLy8gZnJvbSBhYm92ZVxyXG4gICAgICAgICAgICAgICAgeU92ZXIgPSAoKHIueSArIHIuaCkgLSByMi55KSAvIHIyLmg7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAocjAueSArIHIwLmggPiByMi55ICsgcjIuaCkgeyAvLyBmcm9tIGJlbG93XHJcbiAgICAgICAgICAgICAgICB5T3ZlciA9ICgocjIueSArIHIyLmgpIC0gci55KSAvIHIyLmg7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHIwLnggPCByMi54KSB7IC8vIGZyb20gdGhlIGxlZnRcclxuICAgICAgICAgICAgICAgIHhPdmVyID0gKChyLnggKyByLncpIC0gcjIueCkgLyByMi53O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKHIwLnggKyByMC53ID4gcjIueCArIHIyLncpIHsgLy8gZnJvbSB0aGUgcmlnaHRcclxuICAgICAgICAgICAgICAgIHhPdmVyID0gKChyMi54ICsgcjIudykgLSByLngpIC8gcjIudztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBsZXQgb3ZlciA9IE1hdGgubWluKHhPdmVyLCB5T3Zlcik7XHJcbiAgICAgICAgICAgIGlmIChvdmVyID4gb3Zlck1heCkge1xyXG4gICAgICAgICAgICAgICAgb3Zlck1heCA9IG92ZXI7XHJcbiAgICAgICAgICAgICAgICBjb2xsaWRlID0gbjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIG8uY29sbGlkZSA9IGNvbGxpZGU7IC8vIHNhdmUgaXQgc28gd2UgZG9uJ3QgaGF2ZSB0byBmaW5kIGl0IGFnYWluXHJcbiAgICAgICAgcmV0dXJuIGNvbGxpZGU7XHJcbiAgICB9XHJcbiAgICAvKiogZG9lcyBhIHBpeGVsIGNvdmVyYWdlIHJldHVybmluZyB0aGUgbm9kZSB0aGF0IGhhcyB0aGUgbW9zdCBjb3ZlcmFnZSBieSBhcmVhICovXHJcbiAgICAvKlxyXG4gICAgcHJvdGVjdGVkIGNvbGxpZGVDb3ZlcmFnZShyOiBHcmlkU3RhY2tQb3NpdGlvbiwgY29sbGlkZXM6IEdyaWRTdGFja05vZGVbXSk6IHtjb2xsaWRlOiBHcmlkU3RhY2tOb2RlLCBvdmVyOiBudW1iZXJ9IHtcclxuICAgICAgbGV0IGNvbGxpZGU6IEdyaWRTdGFja05vZGU7XHJcbiAgICAgIGxldCBvdmVyTWF4ID0gMDtcclxuICAgICAgY29sbGlkZXMuZm9yRWFjaChuID0+IHtcclxuICAgICAgICBpZiAobi5sb2NrZWQgfHwgIW4uX3JlY3QpIHJldHVybjtcclxuICAgICAgICBsZXQgb3ZlciA9IFV0aWxzLmFyZWFJbnRlcmNlcHQociwgbi5fcmVjdCk7XHJcbiAgICAgICAgaWYgKG92ZXIgPiBvdmVyTWF4KSB7XHJcbiAgICAgICAgICBvdmVyTWF4ID0gb3ZlcjtcclxuICAgICAgICAgIGNvbGxpZGUgPSBuO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICAgIHJldHVybiB7Y29sbGlkZSwgb3Zlcjogb3Zlck1heH07XHJcbiAgICB9XHJcbiAgICAqL1xyXG4gICAgLyoqIGNhbGxlZCB0byBjYWNoZSB0aGUgbm9kZXMgcGl4ZWwgcmVjdGFuZ2xlcyB1c2VkIGZvciBjb2xsaXNpb24gZGV0ZWN0aW9uIGR1cmluZyBkcmFnICovXHJcbiAgICBjYWNoZVJlY3RzKHcsIGgsIHRvcCwgcmlnaHQsIGJvdHRvbSwgbGVmdCkge1xyXG4gICAgICAgIHRoaXMubm9kZXMuZm9yRWFjaChuID0+IG4uX3JlY3QgPSB7XHJcbiAgICAgICAgICAgIHk6IG4ueSAqIGggKyB0b3AsXHJcbiAgICAgICAgICAgIHg6IG4ueCAqIHcgKyBsZWZ0LFxyXG4gICAgICAgICAgICB3OiBuLncgKiB3IC0gbGVmdCAtIHJpZ2h0LFxyXG4gICAgICAgICAgICBoOiBuLmggKiBoIC0gdG9wIC0gYm90dG9tXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbiAgICAvKiogY2FsbGVkIHRvIHBvc3NpYmx5IHN3YXAgYmV0d2VlbiAyIG5vZGVzIChzYW1lIHNpemUgb3IgY29sdW1uLCBub3QgbG9ja2VkLCB0b3VjaGluZyksIHJldHVybmluZyB0cnVlIGlmIHN1Y2Nlc3NmdWwgKi9cclxuICAgIHN3YXAoYSwgYikge1xyXG4gICAgICAgIGlmICghYiB8fCBiLmxvY2tlZCB8fCAhYSB8fCBhLmxvY2tlZClcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIGZ1bmN0aW9uIF9kb1N3YXAoKSB7XHJcbiAgICAgICAgICAgIGxldCB4ID0gYi54LCB5ID0gYi55O1xyXG4gICAgICAgICAgICBiLnggPSBhLng7XHJcbiAgICAgICAgICAgIGIueSA9IGEueTsgLy8gYiAtPiBhIHBvc2l0aW9uXHJcbiAgICAgICAgICAgIGlmIChhLmggIT0gYi5oKSB7XHJcbiAgICAgICAgICAgICAgICBhLnggPSB4O1xyXG4gICAgICAgICAgICAgICAgYS55ID0gYi55ICsgYi5oOyAvLyBhIC0+IGdvZXMgYWZ0ZXIgYlxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKGEudyAhPSBiLncpIHtcclxuICAgICAgICAgICAgICAgIGEueCA9IGIueCArIGIudztcclxuICAgICAgICAgICAgICAgIGEueSA9IHk7IC8vIGEgLT4gZ29lcyBhZnRlciBiXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBhLnggPSB4O1xyXG4gICAgICAgICAgICAgICAgYS55ID0geTsgLy8gYSAtPiBvbGQgYiBwb3NpdGlvblxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGEuX2RpcnR5ID0gYi5fZGlydHkgPSB0cnVlO1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IHRvdWNoaW5nOyAvLyByZW1lbWJlciBpZiB3ZSBjYWxsZWQgaXQgKHZzIHVuZGVmaW5lZClcclxuICAgICAgICAvLyBzYW1lIHNpemUgYW5kIHNhbWUgcm93IG9yIGNvbHVtbiwgYW5kIHRvdWNoaW5nXHJcbiAgICAgICAgaWYgKGEudyA9PT0gYi53ICYmIGEuaCA9PT0gYi5oICYmIChhLnggPT09IGIueCB8fCBhLnkgPT09IGIueSkgJiYgKHRvdWNoaW5nID0gdXRpbHNfMS5VdGlscy5pc1RvdWNoaW5nKGEsIGIpKSlcclxuICAgICAgICAgICAgcmV0dXJuIF9kb1N3YXAoKTtcclxuICAgICAgICBpZiAodG91Y2hpbmcgPT09IGZhbHNlKVxyXG4gICAgICAgICAgICByZXR1cm47IC8vIElGRiByYW4gdGVzdCBhbmQgZmFpbCwgYmFpbCBvdXRcclxuICAgICAgICAvLyBjaGVjayBmb3IgdGFraW5nIHNhbWUgY29sdW1ucyAoYnV0IGRpZmZlcmVudCBoZWlnaHQpIGFuZCB0b3VjaGluZ1xyXG4gICAgICAgIGlmIChhLncgPT09IGIudyAmJiBhLnggPT09IGIueCAmJiAodG91Y2hpbmcgfHwgKHRvdWNoaW5nID0gdXRpbHNfMS5VdGlscy5pc1RvdWNoaW5nKGEsIGIpKSkpIHtcclxuICAgICAgICAgICAgaWYgKGIueSA8IGEueSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHQgPSBhO1xyXG4gICAgICAgICAgICAgICAgYSA9IGI7XHJcbiAgICAgICAgICAgICAgICBiID0gdDtcclxuICAgICAgICAgICAgfSAvLyBzd2FwIGEgPC0+IGIgdmFycyBzbyBhIGlzIGZpcnN0XHJcbiAgICAgICAgICAgIHJldHVybiBfZG9Td2FwKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0b3VjaGluZyA9PT0gZmFsc2UpXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAvLyBjaGVjayBpZiB0YWtpbmcgc2FtZSByb3cgKGJ1dCBkaWZmZXJlbnQgd2lkdGgpIGFuZCB0b3VjaGluZ1xyXG4gICAgICAgIGlmIChhLmggPT09IGIuaCAmJiBhLnkgPT09IGIueSAmJiAodG91Y2hpbmcgfHwgKHRvdWNoaW5nID0gdXRpbHNfMS5VdGlscy5pc1RvdWNoaW5nKGEsIGIpKSkpIHtcclxuICAgICAgICAgICAgaWYgKGIueCA8IGEueCkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHQgPSBhO1xyXG4gICAgICAgICAgICAgICAgYSA9IGI7XHJcbiAgICAgICAgICAgICAgICBiID0gdDtcclxuICAgICAgICAgICAgfSAvLyBzd2FwIGEgPC0+IGIgdmFycyBzbyBhIGlzIGZpcnN0XHJcbiAgICAgICAgICAgIHJldHVybiBfZG9Td2FwKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIGlzQXJlYUVtcHR5KHgsIHksIHcsIGgpIHtcclxuICAgICAgICBsZXQgbm4gPSB7IHg6IHggfHwgMCwgeTogeSB8fCAwLCB3OiB3IHx8IDEsIGg6IGggfHwgMSB9O1xyXG4gICAgICAgIHJldHVybiAhdGhpcy5jb2xsaWRlKG5uKTtcclxuICAgIH1cclxuICAgIC8qKiByZS1sYXlvdXQgZ3JpZCBpdGVtcyB0byByZWNsYWltIGFueSBlbXB0eSBzcGFjZSAqL1xyXG4gICAgY29tcGFjdCgpIHtcclxuICAgICAgICBpZiAodGhpcy5ub2Rlcy5sZW5ndGggPT09IDApXHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIHRoaXMuYmF0Y2hVcGRhdGUoKVxyXG4gICAgICAgICAgICAuc29ydE5vZGVzKCk7XHJcbiAgICAgICAgbGV0IGNvcHlOb2RlcyA9IHRoaXMubm9kZXM7XHJcbiAgICAgICAgdGhpcy5ub2RlcyA9IFtdOyAvLyBwcmV0ZW5kIHdlIGhhdmUgbm8gbm9kZXMgdG8gY29uZmxpY3QgbGF5b3V0IHRvIHN0YXJ0IHdpdGguLi5cclxuICAgICAgICBjb3B5Tm9kZXMuZm9yRWFjaChub2RlID0+IHtcclxuICAgICAgICAgICAgaWYgKCFub2RlLmxvY2tlZCkge1xyXG4gICAgICAgICAgICAgICAgbm9kZS5hdXRvUG9zaXRpb24gPSB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuYWRkTm9kZShub2RlLCBmYWxzZSk7IC8vICdmYWxzZScgZm9yIGFkZCBldmVudCB0cmlnZ2VyXHJcbiAgICAgICAgICAgIG5vZGUuX2RpcnR5ID0gdHJ1ZTsgLy8gd2lsbCBmb3JjZSBhdHRyIHVwZGF0ZVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiB0aGlzLmJhdGNoVXBkYXRlKGZhbHNlKTtcclxuICAgIH1cclxuICAgIC8qKiBlbmFibGUvZGlzYWJsZSBmbG9hdGluZyB3aWRnZXRzIChkZWZhdWx0OiBgZmFsc2VgKSBTZWUgW2V4YW1wbGVdKGh0dHA6Ly9ncmlkc3RhY2tqcy5jb20vZGVtby9mbG9hdC5odG1sKSAqL1xyXG4gICAgc2V0IGZsb2F0KHZhbCkge1xyXG4gICAgICAgIGlmICh0aGlzLl9mbG9hdCA9PT0gdmFsKVxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgdGhpcy5fZmxvYXQgPSB2YWwgfHwgZmFsc2U7XHJcbiAgICAgICAgaWYgKCF2YWwpIHtcclxuICAgICAgICAgICAgdGhpcy5fcGFja05vZGVzKCkuX25vdGlmeSgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8qKiBmbG9hdCBnZXR0ZXIgbWV0aG9kICovXHJcbiAgICBnZXQgZmxvYXQoKSB7IHJldHVybiB0aGlzLl9mbG9hdCB8fCBmYWxzZTsgfVxyXG4gICAgLyoqIHNvcnQgdGhlIG5vZGVzIGFycmF5IGZyb20gZmlyc3QgdG8gbGFzdCwgb3IgcmV2ZXJzZS4gQ2FsbGVkIGR1cmluZyBjb2xsaXNpb24vcGxhY2VtZW50IHRvIGZvcmNlIGFuIG9yZGVyICovXHJcbiAgICBzb3J0Tm9kZXMoZGlyKSB7XHJcbiAgICAgICAgdGhpcy5ub2RlcyA9IHV0aWxzXzEuVXRpbHMuc29ydCh0aGlzLm5vZGVzLCBkaXIsIHRoaXMuY29sdW1uKTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuICAgIC8qKiBAaW50ZXJuYWwgY2FsbGVkIHRvIHRvcCBncmF2aXR5IHBhY2sgdGhlIGl0ZW1zIGJhY2sgT1IgcmV2ZXJ0IGJhY2sgdG8gb3JpZ2luYWwgWSBwb3NpdGlvbnMgd2hlbiBmbG9hdGluZyAqL1xyXG4gICAgX3BhY2tOb2RlcygpIHtcclxuICAgICAgICBpZiAodGhpcy5iYXRjaE1vZGUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuc29ydE5vZGVzKCk7IC8vIGZpcnN0IHRvIGxhc3RcclxuICAgICAgICBpZiAodGhpcy5mbG9hdCkge1xyXG4gICAgICAgICAgICAvLyByZXN0b3JlIG9yaWdpbmFsIFkgcG9zXHJcbiAgICAgICAgICAgIHRoaXMubm9kZXMuZm9yRWFjaChuID0+IHtcclxuICAgICAgICAgICAgICAgIGlmIChuLl91cGRhdGluZyB8fCBuLl9vcmlnID09PSB1bmRlZmluZWQgfHwgbi55ID09PSBuLl9vcmlnLnkpXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgbGV0IG5ld1kgPSBuLnk7XHJcbiAgICAgICAgICAgICAgICB3aGlsZSAobmV3WSA+IG4uX29yaWcueSkge1xyXG4gICAgICAgICAgICAgICAgICAgIC0tbmV3WTtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgY29sbGlkZSA9IHRoaXMuY29sbGlkZShuLCB7IHg6IG4ueCwgeTogbmV3WSwgdzogbi53LCBoOiBuLmggfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFjb2xsaWRlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG4uX2RpcnR5ID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbi55ID0gbmV3WTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgLy8gdG9wIGdyYXZpdHkgcGFja1xyXG4gICAgICAgICAgICB0aGlzLm5vZGVzLmZvckVhY2goKG4sIGkpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmIChuLmxvY2tlZClcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB3aGlsZSAobi55ID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBuZXdZID0gaSA9PT0gMCA/IDAgOiBuLnkgLSAxO1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBjYW5CZU1vdmVkID0gaSA9PT0gMCB8fCAhdGhpcy5jb2xsaWRlKG4sIHsgeDogbi54LCB5OiBuZXdZLCB3OiBuLncsIGg6IG4uaCB9KTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIWNhbkJlTW92ZWQpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIE5vdGU6IG11c3QgYmUgZGlydHkgKGZyb20gbGFzdCBwb3NpdGlvbikgZm9yIEdyaWRTdGFjazo6T25DaGFuZ2UgQ0IgdG8gdXBkYXRlIHBvc2l0aW9uc1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIGFuZCBtb3ZlIGl0ZW1zIGJhY2suIFRoZSB1c2VyICdjaGFuZ2UnIENCIHNob3VsZCBkZXRlY3QgY2hhbmdlcyBmcm9tIHRoZSBvcmlnaW5hbFxyXG4gICAgICAgICAgICAgICAgICAgIC8vIHN0YXJ0aW5nIHBvc2l0aW9uIGluc3RlYWQuXHJcbiAgICAgICAgICAgICAgICAgICAgbi5fZGlydHkgPSAobi55ICE9PSBuZXdZKTtcclxuICAgICAgICAgICAgICAgICAgICBuLnkgPSBuZXdZO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIGdpdmVuIGEgcmFuZG9tIG5vZGUsIG1ha2VzIHN1cmUgaXQncyBjb29yZGluYXRlcy92YWx1ZXMgYXJlIHZhbGlkIGluIHRoZSBjdXJyZW50IGdyaWRcclxuICAgICAqIEBwYXJhbSBub2RlIHRvIGFkanVzdFxyXG4gICAgICogQHBhcmFtIHJlc2l6aW5nIGlmIG91dCBvZiBib3VuZCwgcmVzaXplIGRvd24gb3IgbW92ZSBpbnRvIHRoZSBncmlkIHRvIGZpdCA/XHJcbiAgICAgKi9cclxuICAgIHByZXBhcmVOb2RlKG5vZGUsIHJlc2l6aW5nKSB7XHJcbiAgICAgICAgbm9kZSA9IG5vZGUgfHwge307XHJcbiAgICAgICAgbm9kZS5faWQgPSBub2RlLl9pZCB8fCBHcmlkU3RhY2tFbmdpbmUuX2lkU2VxKys7XHJcbiAgICAgICAgLy8gaWYgd2UncmUgbWlzc2luZyBwb3NpdGlvbiwgaGF2ZSB0aGUgZ3JpZCBwb3NpdGlvbiB1cyBhdXRvbWF0aWNhbGx5IChiZWZvcmUgd2Ugc2V0IHRoZW0gdG8gMCwwKVxyXG4gICAgICAgIGlmIChub2RlLnggPT09IHVuZGVmaW5lZCB8fCBub2RlLnkgPT09IHVuZGVmaW5lZCB8fCBub2RlLnggPT09IG51bGwgfHwgbm9kZS55ID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgIG5vZGUuYXV0b1Bvc2l0aW9uID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gYXNzaWduIGRlZmF1bHRzIGZvciBtaXNzaW5nIHJlcXVpcmVkIGZpZWxkc1xyXG4gICAgICAgIGxldCBkZWZhdWx0cyA9IHsgeDogMCwgeTogMCwgdzogMSwgaDogMSB9O1xyXG4gICAgICAgIHV0aWxzXzEuVXRpbHMuZGVmYXVsdHMobm9kZSwgZGVmYXVsdHMpO1xyXG4gICAgICAgIGlmICghbm9kZS5hdXRvUG9zaXRpb24pIHtcclxuICAgICAgICAgICAgZGVsZXRlIG5vZGUuYXV0b1Bvc2l0aW9uO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIW5vZGUubm9SZXNpemUpIHtcclxuICAgICAgICAgICAgZGVsZXRlIG5vZGUubm9SZXNpemU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghbm9kZS5ub01vdmUpIHtcclxuICAgICAgICAgICAgZGVsZXRlIG5vZGUubm9Nb3ZlO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBjaGVjayBmb3IgTmFOIChpbiBjYXNlIG1lc3NlZCB1cCBzdHJpbmdzIHdlcmUgcGFzc2VkLiBjYW4ndCBkbyBwYXJzZUludCgpIHx8IGRlZmF1bHRzLnggYWJvdmUgYXMgMCBpcyB2YWxpZCAjKVxyXG4gICAgICAgIGlmICh0eXBlb2Ygbm9kZS54ID09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICAgIG5vZGUueCA9IE51bWJlcihub2RlLngpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodHlwZW9mIG5vZGUueSA9PSAnc3RyaW5nJykge1xyXG4gICAgICAgICAgICBub2RlLnkgPSBOdW1iZXIobm9kZS55KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHR5cGVvZiBub2RlLncgPT0gJ3N0cmluZycpIHtcclxuICAgICAgICAgICAgbm9kZS53ID0gTnVtYmVyKG5vZGUudyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0eXBlb2Ygbm9kZS5oID09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICAgIG5vZGUuaCA9IE51bWJlcihub2RlLmgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoaXNOYU4obm9kZS54KSkge1xyXG4gICAgICAgICAgICBub2RlLnggPSBkZWZhdWx0cy54O1xyXG4gICAgICAgICAgICBub2RlLmF1dG9Qb3NpdGlvbiA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChpc05hTihub2RlLnkpKSB7XHJcbiAgICAgICAgICAgIG5vZGUueSA9IGRlZmF1bHRzLnk7XHJcbiAgICAgICAgICAgIG5vZGUuYXV0b1Bvc2l0aW9uID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGlzTmFOKG5vZGUudykpIHtcclxuICAgICAgICAgICAgbm9kZS53ID0gZGVmYXVsdHMudztcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGlzTmFOKG5vZGUuaCkpIHtcclxuICAgICAgICAgICAgbm9kZS5oID0gZGVmYXVsdHMuaDtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubm9kZUJvdW5kRml4KG5vZGUsIHJlc2l6aW5nKTtcclxuICAgIH1cclxuICAgIC8qKiBwYXJ0MiBvZiBwcmVwYXJpbmcgYSBub2RlIHRvIGZpdCBpbnNpZGUgb3VyIGdyaWQgLSBjaGVja3MgZm9yIHgseSx3IGZyb20gZ3JpZCBkaW1lbnNpb25zICovXHJcbiAgICBub2RlQm91bmRGaXgobm9kZSwgcmVzaXppbmcpIHtcclxuICAgICAgICBsZXQgYmVmb3JlID0gbm9kZS5fb3JpZyB8fCB1dGlsc18xLlV0aWxzLmNvcHlQb3Moe30sIG5vZGUpO1xyXG4gICAgICAgIGlmIChub2RlLm1heFcpIHtcclxuICAgICAgICAgICAgbm9kZS53ID0gTWF0aC5taW4obm9kZS53LCBub2RlLm1heFcpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAobm9kZS5tYXhIKSB7XHJcbiAgICAgICAgICAgIG5vZGUuaCA9IE1hdGgubWluKG5vZGUuaCwgbm9kZS5tYXhIKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKG5vZGUubWluVyAmJiBub2RlLm1pblcgPD0gdGhpcy5jb2x1bW4pIHtcclxuICAgICAgICAgICAgbm9kZS53ID0gTWF0aC5tYXgobm9kZS53LCBub2RlLm1pblcpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAobm9kZS5taW5IKSB7XHJcbiAgICAgICAgICAgIG5vZGUuaCA9IE1hdGgubWF4KG5vZGUuaCwgbm9kZS5taW5IKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gaWYgdXNlciBsb2FkZWQgYSBsYXJnZXIgdGhhbiBhbGxvd2VkIHdpZGdldCBmb3IgY3VycmVudCAjIG9mIGNvbHVtbnMgKG9yIGZvcmNlIDEgY29sdW1uIG1vZGUpLFxyXG4gICAgICAgIC8vIHJlbWVtYmVyIGl0J3MgcG9zaXRpb24gJiB3aWR0aCBzbyB3ZSBjYW4gcmVzdG9yZSBiYWNrICgxIC0+IDEyIGNvbHVtbikgIzE2NTUgIzE5ODVcclxuICAgICAgICAvLyBJRkYgd2UncmUgbm90IGluIHRoZSBtaWRkbGUgb2YgY29sdW1uIHJlc2l6aW5nIVxyXG4gICAgICAgIGNvbnN0IHNhdmVPcmlnID0gdGhpcy5jb2x1bW4gPT09IDEgfHwgbm9kZS54ICsgbm9kZS53ID4gdGhpcy5jb2x1bW47XHJcbiAgICAgICAgaWYgKHNhdmVPcmlnICYmIHRoaXMuY29sdW1uIDwgMTIgJiYgIXRoaXMuX2luQ29sdW1uUmVzaXplICYmIG5vZGUuX2lkICYmIHRoaXMuZmluZENhY2hlTGF5b3V0KG5vZGUsIDEyKSA9PT0gLTEpIHtcclxuICAgICAgICAgICAgbGV0IGNvcHkgPSBPYmplY3QuYXNzaWduKHt9LCBub2RlKTsgLy8gbmVlZCBfaWQgKyBwb3NpdGlvbnNcclxuICAgICAgICAgICAgaWYgKGNvcHkuYXV0b1Bvc2l0aW9uKSB7XHJcbiAgICAgICAgICAgICAgICBkZWxldGUgY29weS54O1xyXG4gICAgICAgICAgICAgICAgZGVsZXRlIGNvcHkueTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICBjb3B5LnggPSBNYXRoLm1pbigxMSwgY29weS54KTtcclxuICAgICAgICAgICAgY29weS53ID0gTWF0aC5taW4oMTIsIGNvcHkudyk7XHJcbiAgICAgICAgICAgIHRoaXMuY2FjaGVPbmVMYXlvdXQoY29weSwgMTIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAobm9kZS53ID4gdGhpcy5jb2x1bW4pIHtcclxuICAgICAgICAgICAgbm9kZS53ID0gdGhpcy5jb2x1bW47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKG5vZGUudyA8IDEpIHtcclxuICAgICAgICAgICAgbm9kZS53ID0gMTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMubWF4Um93ICYmIG5vZGUuaCA+IHRoaXMubWF4Um93KSB7XHJcbiAgICAgICAgICAgIG5vZGUuaCA9IHRoaXMubWF4Um93O1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmIChub2RlLmggPCAxKSB7XHJcbiAgICAgICAgICAgIG5vZGUuaCA9IDE7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChub2RlLnggPCAwKSB7XHJcbiAgICAgICAgICAgIG5vZGUueCA9IDA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChub2RlLnkgPCAwKSB7XHJcbiAgICAgICAgICAgIG5vZGUueSA9IDA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChub2RlLnggKyBub2RlLncgPiB0aGlzLmNvbHVtbikge1xyXG4gICAgICAgICAgICBpZiAocmVzaXppbmcpIHtcclxuICAgICAgICAgICAgICAgIG5vZGUudyA9IHRoaXMuY29sdW1uIC0gbm9kZS54O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgbm9kZS54ID0gdGhpcy5jb2x1bW4gLSBub2RlLnc7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMubWF4Um93ICYmIG5vZGUueSArIG5vZGUuaCA+IHRoaXMubWF4Um93KSB7XHJcbiAgICAgICAgICAgIGlmIChyZXNpemluZykge1xyXG4gICAgICAgICAgICAgICAgbm9kZS5oID0gdGhpcy5tYXhSb3cgLSBub2RlLnk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBub2RlLnkgPSB0aGlzLm1heFJvdyAtIG5vZGUuaDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIXV0aWxzXzEuVXRpbHMuc2FtZVBvcyhub2RlLCBiZWZvcmUpKSB7XHJcbiAgICAgICAgICAgIG5vZGUuX2RpcnR5ID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG5vZGU7XHJcbiAgICB9XHJcbiAgICAvKiogcmV0dXJucyBhIGxpc3Qgb2YgbW9kaWZpZWQgbm9kZXMgZnJvbSB0aGVpciBvcmlnaW5hbCB2YWx1ZXMgKi9cclxuICAgIGdldERpcnR5Tm9kZXModmVyaWZ5KSB7XHJcbiAgICAgICAgLy8gY29tcGFyZSBvcmlnaW5hbCB4LHksdyxoIGluc3RlYWQgYXMgX2RpcnR5IGNhbiBiZSBhIHRlbXBvcmFyeSBzdGF0ZVxyXG4gICAgICAgIGlmICh2ZXJpZnkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMubm9kZXMuZmlsdGVyKG4gPT4gbi5fZGlydHkgJiYgIXV0aWxzXzEuVXRpbHMuc2FtZVBvcyhuLCBuLl9vcmlnKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzLm5vZGVzLmZpbHRlcihuID0+IG4uX2RpcnR5KTtcclxuICAgIH1cclxuICAgIC8qKiBAaW50ZXJuYWwgY2FsbCB0aGlzIHRvIGNhbGwgb25DaGFuZ2UgY2FsbGJhY2sgd2l0aCBkaXJ0eSBub2RlcyBzbyBET00gY2FuIGJlIHVwZGF0ZWQgKi9cclxuICAgIF9ub3RpZnkocmVtb3ZlZE5vZGVzKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuYmF0Y2hNb2RlIHx8ICF0aGlzLm9uQ2hhbmdlKVxyXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICBsZXQgZGlydHlOb2RlcyA9IChyZW1vdmVkTm9kZXMgfHwgW10pLmNvbmNhdCh0aGlzLmdldERpcnR5Tm9kZXMoKSk7XHJcbiAgICAgICAgdGhpcy5vbkNoYW5nZShkaXJ0eU5vZGVzKTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuICAgIC8qKiBAaW50ZXJuYWwgcmVtb3ZlIGRpcnR5IGFuZCBsYXN0IHRyaWVkIGluZm8gKi9cclxuICAgIGNsZWFuTm9kZXMoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuYmF0Y2hNb2RlKVxyXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICB0aGlzLm5vZGVzLmZvckVhY2gobiA9PiB7XHJcbiAgICAgICAgICAgIGRlbGV0ZSBuLl9kaXJ0eTtcclxuICAgICAgICAgICAgZGVsZXRlIG4uX2xhc3RUcmllZDtcclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuICAgIC8qKiBAaW50ZXJuYWwgY2FsbGVkIHRvIHNhdmUgaW5pdGlhbCBwb3NpdGlvbi9zaXplIHRvIHRyYWNrIHJlYWwgZGlydHkgc3RhdGUuXHJcbiAgICAgKiBOb3RlOiBzaG91bGQgYmUgY2FsbGVkIHJpZ2h0IGFmdGVyIHdlIGNhbGwgY2hhbmdlIGV2ZW50IChzbyBuZXh0IEFQSSBpcyBjYW4gZGV0ZWN0IGNoYW5nZXMpXHJcbiAgICAgKiBhcyB3ZWxsIGFzIHJpZ2h0IGJlZm9yZSB3ZSBzdGFydCBtb3ZlL3Jlc2l6ZS9lbnRlciAoc28gd2UgY2FuIHJlc3RvcmUgaXRlbXMgdG8gcHJldiB2YWx1ZXMpICovXHJcbiAgICBzYXZlSW5pdGlhbCgpIHtcclxuICAgICAgICB0aGlzLm5vZGVzLmZvckVhY2gobiA9PiB7XHJcbiAgICAgICAgICAgIG4uX29yaWcgPSB1dGlsc18xLlV0aWxzLmNvcHlQb3Moe30sIG4pO1xyXG4gICAgICAgICAgICBkZWxldGUgbi5fZGlydHk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5faGFzTG9ja2VkID0gdGhpcy5ub2Rlcy5zb21lKG4gPT4gbi5sb2NrZWQpO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG4gICAgLyoqIEBpbnRlcm5hbCByZXN0b3JlIGFsbCB0aGUgbm9kZXMgYmFjayB0byBpbml0aWFsIHZhbHVlcyAoY2FsbGVkIHdoZW4gd2UgbGVhdmUpICovXHJcbiAgICByZXN0b3JlSW5pdGlhbCgpIHtcclxuICAgICAgICB0aGlzLm5vZGVzLmZvckVhY2gobiA9PiB7XHJcbiAgICAgICAgICAgIGlmICh1dGlsc18xLlV0aWxzLnNhbWVQb3Mobiwgbi5fb3JpZykpXHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIHV0aWxzXzEuVXRpbHMuY29weVBvcyhuLCBuLl9vcmlnKTtcclxuICAgICAgICAgICAgbi5fZGlydHkgPSB0cnVlO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuX25vdGlmeSgpO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG4gICAgLyoqIGZpbmQgdGhlIGZpcnN0IGF2YWlsYWJsZSBlbXB0eSBzcG90IGZvciB0aGUgZ2l2ZW4gbm9kZSB3aWR0aC9oZWlnaHQsIHVwZGF0aW5nIHRoZSB4LHkgYXR0cmlidXRlcy4gcmV0dXJuIHRydWUgaWYgZm91bmQuXHJcbiAgICAgKiBvcHRpb25hbGx5IHlvdSBjYW4gcGFzcyB5b3VyIG93biBleGlzdGluZyBub2RlIGxpc3QgYW5kIGNvbHVtbiBjb3VudCwgb3RoZXJ3aXNlIGRlZmF1bHRzIHRvIHRoYXQgZW5naW5lIGRhdGEuXHJcbiAgICAgKi9cclxuICAgIGZpbmRFbXB0eVBvc2l0aW9uKG5vZGUsIG5vZGVMaXN0ID0gdGhpcy5ub2RlcywgY29sdW1uID0gdGhpcy5jb2x1bW4pIHtcclxuICAgICAgICBub2RlTGlzdCA9IHV0aWxzXzEuVXRpbHMuc29ydChub2RlTGlzdCwgLTEsIGNvbHVtbik7XHJcbiAgICAgICAgbGV0IGZvdW5kID0gZmFsc2U7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7ICFmb3VuZDsgKytpKSB7XHJcbiAgICAgICAgICAgIGxldCB4ID0gaSAlIGNvbHVtbjtcclxuICAgICAgICAgICAgbGV0IHkgPSBNYXRoLmZsb29yKGkgLyBjb2x1bW4pO1xyXG4gICAgICAgICAgICBpZiAoeCArIG5vZGUudyA+IGNvbHVtbikge1xyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbGV0IGJveCA9IHsgeCwgeSwgdzogbm9kZS53LCBoOiBub2RlLmggfTtcclxuICAgICAgICAgICAgaWYgKCFub2RlTGlzdC5maW5kKG4gPT4gdXRpbHNfMS5VdGlscy5pc0ludGVyY2VwdGVkKGJveCwgbikpKSB7XHJcbiAgICAgICAgICAgICAgICBub2RlLnggPSB4O1xyXG4gICAgICAgICAgICAgICAgbm9kZS55ID0geTtcclxuICAgICAgICAgICAgICAgIGRlbGV0ZSBub2RlLmF1dG9Qb3NpdGlvbjtcclxuICAgICAgICAgICAgICAgIGZvdW5kID0gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZm91bmQ7XHJcbiAgICB9XHJcbiAgICAvKiogY2FsbCB0byBhZGQgdGhlIGdpdmVuIG5vZGUgdG8gb3VyIGxpc3QsIGZpeGluZyBjb2xsaXNpb24gYW5kIHJlLXBhY2tpbmcgKi9cclxuICAgIGFkZE5vZGUobm9kZSwgdHJpZ2dlckFkZEV2ZW50ID0gZmFsc2UpIHtcclxuICAgICAgICBsZXQgZHVwID0gdGhpcy5ub2Rlcy5maW5kKG4gPT4gbi5faWQgPT09IG5vZGUuX2lkKTtcclxuICAgICAgICBpZiAoZHVwKVxyXG4gICAgICAgICAgICByZXR1cm4gZHVwOyAvLyBwcmV2ZW50IGluc2VydGluZyB0d2ljZSEgcmV0dXJuIGl0IGluc3RlYWQuXHJcbiAgICAgICAgLy8gc2tpcCBwcmVwYXJlTm9kZSBpZiB3ZSdyZSBpbiBtaWRkbGUgb2YgY29sdW1uIHJlc2l6ZSAobm90IG5ldykgYnV0IGRvIGNoZWNrIGZvciBib3VuZHMhXHJcbiAgICAgICAgbm9kZSA9IHRoaXMuX2luQ29sdW1uUmVzaXplID8gdGhpcy5ub2RlQm91bmRGaXgobm9kZSkgOiB0aGlzLnByZXBhcmVOb2RlKG5vZGUpO1xyXG4gICAgICAgIGRlbGV0ZSBub2RlLl90ZW1wb3JhcnlSZW1vdmVkO1xyXG4gICAgICAgIGRlbGV0ZSBub2RlLl9yZW1vdmVET007XHJcbiAgICAgICAgaWYgKG5vZGUuYXV0b1Bvc2l0aW9uICYmIHRoaXMuZmluZEVtcHR5UG9zaXRpb24obm9kZSkpIHtcclxuICAgICAgICAgICAgZGVsZXRlIG5vZGUuYXV0b1Bvc2l0aW9uOyAvLyBmb3VuZCBvdXIgc2xvdFxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLm5vZGVzLnB1c2gobm9kZSk7XHJcbiAgICAgICAgaWYgKHRyaWdnZXJBZGRFdmVudCkge1xyXG4gICAgICAgICAgICB0aGlzLmFkZGVkTm9kZXMucHVzaChub2RlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fZml4Q29sbGlzaW9ucyhub2RlKTtcclxuICAgICAgICBpZiAoIXRoaXMuYmF0Y2hNb2RlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3BhY2tOb2RlcygpLl9ub3RpZnkoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG5vZGU7XHJcbiAgICB9XHJcbiAgICByZW1vdmVOb2RlKG5vZGUsIHJlbW92ZURPTSA9IHRydWUsIHRyaWdnZXJFdmVudCA9IGZhbHNlKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLm5vZGVzLmZpbmQobiA9PiBuID09PSBub2RlKSkge1xyXG4gICAgICAgICAgICAvLyBURVNUIGNvbnNvbGUubG9nKGBFcnJvcjogR3JpZFN0YWNrRW5naW5lLnJlbW92ZU5vZGUoKSBub2RlLl9pZD0ke25vZGUuX2lkfSBub3QgZm91bmQhYClcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0cmlnZ2VyRXZlbnQpIHsgLy8gd2Ugd2FpdCB1bnRpbCBmaW5hbCBkcm9wIHRvIG1hbnVhbGx5IHRyYWNrIHJlbW92ZWQgaXRlbXMgKHJhdGhlciB0aGFuIGR1cmluZyBkcmFnKVxyXG4gICAgICAgICAgICB0aGlzLnJlbW92ZWROb2Rlcy5wdXNoKG5vZGUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAocmVtb3ZlRE9NKVxyXG4gICAgICAgICAgICBub2RlLl9yZW1vdmVET00gPSB0cnVlOyAvLyBsZXQgQ0IgcmVtb3ZlIGFjdHVhbCBIVE1MICh1c2VkIHRvIHNldCBfaWQgdG8gbnVsbCwgYnV0IHRoZW4gd2UgbG9vc2UgbGF5b3V0IGluZm8pXHJcbiAgICAgICAgLy8gZG9uJ3QgdXNlICdmYXN0ZXInIC5zcGxpY2UoZmluZEluZGV4KCksMSkgaW4gY2FzZSBub2RlIGlzbid0IGluIG91ciBsaXN0LCBvciBpbiBtdWx0aXBsZSB0aW1lcy5cclxuICAgICAgICB0aGlzLm5vZGVzID0gdGhpcy5ub2Rlcy5maWx0ZXIobiA9PiBuICE9PSBub2RlKTtcclxuICAgICAgICByZXR1cm4gdGhpcy5fcGFja05vZGVzKClcclxuICAgICAgICAgICAgLl9ub3RpZnkoW25vZGVdKTtcclxuICAgIH1cclxuICAgIHJlbW92ZUFsbChyZW1vdmVET00gPSB0cnVlKSB7XHJcbiAgICAgICAgZGVsZXRlIHRoaXMuX2xheW91dHM7XHJcbiAgICAgICAgaWYgKHRoaXMubm9kZXMubGVuZ3RoID09PSAwKVxyXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICByZW1vdmVET00gJiYgdGhpcy5ub2Rlcy5mb3JFYWNoKG4gPT4gbi5fcmVtb3ZlRE9NID0gdHJ1ZSk7IC8vIGxldCBDQiByZW1vdmUgYWN0dWFsIEhUTUwgKHVzZWQgdG8gc2V0IF9pZCB0byBudWxsLCBidXQgdGhlbiB3ZSBsb29zZSBsYXlvdXQgaW5mbylcclxuICAgICAgICB0aGlzLnJlbW92ZWROb2RlcyA9IHRoaXMubm9kZXM7XHJcbiAgICAgICAgdGhpcy5ub2RlcyA9IFtdO1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9ub3RpZnkodGhpcy5yZW1vdmVkTm9kZXMpO1xyXG4gICAgfVxyXG4gICAgLyoqIGNoZWNrcyBpZiBpdGVtIGNhbiBiZSBtb3ZlZCAobGF5b3V0IGNvbnN0cmFpbikgdnMgbW92ZU5vZGUoKSwgcmV0dXJuaW5nIHRydWUgaWYgd2FzIGFibGUgdG8gbW92ZS5cclxuICAgICAqIEluIG1vcmUgY29tcGxpY2F0ZWQgY2FzZXMgKG1heFJvdykgaXQgd2lsbCBhdHRlbXB0IGF0IG1vdmluZyB0aGUgaXRlbSBhbmQgZml4aW5nXHJcbiAgICAgKiBvdGhlcnMgaW4gYSBjbG9uZSBmaXJzdCwgdGhlbiBhcHBseSB0aG9zZSBjaGFuZ2VzIGlmIHN0aWxsIHdpdGhpbiBzcGVjcy4gKi9cclxuICAgIG1vdmVOb2RlQ2hlY2sobm9kZSwgbykge1xyXG4gICAgICAgIC8vIGlmIChub2RlLmxvY2tlZCkgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIGlmICghdGhpcy5jaGFuZ2VkUG9zQ29uc3RyYWluKG5vZGUsIG8pKVxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgby5wYWNrID0gdHJ1ZTtcclxuICAgICAgICAvLyBzaW1wbGVyIGNhc2U6IG1vdmUgaXRlbSBkaXJlY3RseS4uLlxyXG4gICAgICAgIGlmICghdGhpcy5tYXhSb3cpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMubW92ZU5vZGUobm9kZSwgbyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIGNvbXBsZXggY2FzZTogY3JlYXRlIGEgY2xvbmUgd2l0aCBOTyBtYXhSb3cgKHdpbGwgY2hlY2sgZm9yIG91dCBvZiBib3VuZHMgYXQgdGhlIGVuZClcclxuICAgICAgICBsZXQgY2xvbmVkTm9kZTtcclxuICAgICAgICBsZXQgY2xvbmUgPSBuZXcgR3JpZFN0YWNrRW5naW5lKHtcclxuICAgICAgICAgICAgY29sdW1uOiB0aGlzLmNvbHVtbixcclxuICAgICAgICAgICAgZmxvYXQ6IHRoaXMuZmxvYXQsXHJcbiAgICAgICAgICAgIG5vZGVzOiB0aGlzLm5vZGVzLm1hcChuID0+IHtcclxuICAgICAgICAgICAgICAgIGlmIChuID09PSBub2RlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2xvbmVkTm9kZSA9IE9iamVjdC5hc3NpZ24oe30sIG4pO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjbG9uZWROb2RlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIE9iamVjdC5hc3NpZ24oe30sIG4pO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGlmICghY2xvbmVkTm9kZSlcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIC8vIGNoZWNrIGlmIHdlJ3JlIGNvdmVyaW5nIDUwJSBjb2xsaXNpb24gYW5kIGNvdWxkIG1vdmVcclxuICAgICAgICBsZXQgY2FuTW92ZSA9IGNsb25lLm1vdmVOb2RlKGNsb25lZE5vZGUsIG8pICYmIGNsb25lLmdldFJvdygpIDw9IHRoaXMubWF4Um93O1xyXG4gICAgICAgIC8vIGVsc2UgY2hlY2sgaWYgd2UgY2FuIGZvcmNlIGEgc3dhcCAoZmxvYXQ9dHJ1ZSwgb3IgZGlmZmVyZW50IHNoYXBlcykgb24gbm9uLXJlc2l6ZVxyXG4gICAgICAgIGlmICghY2FuTW92ZSAmJiAhby5yZXNpemluZyAmJiBvLmNvbGxpZGUpIHtcclxuICAgICAgICAgICAgbGV0IGNvbGxpZGUgPSBvLmNvbGxpZGUuZWwuZ3JpZHN0YWNrTm9kZTsgLy8gZmluZCB0aGUgc291cmNlIG5vZGUgdGhlIGNsb25lIGNvbGxpZGVkIHdpdGggYXQgNTAlXHJcbiAgICAgICAgICAgIGlmICh0aGlzLnN3YXAobm9kZSwgY29sbGlkZSkpIHsgLy8gc3dhcHMgYW5kIG1hcmsgZGlydHlcclxuICAgICAgICAgICAgICAgIHRoaXMuX25vdGlmeSgpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCFjYW5Nb3ZlKVxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgLy8gaWYgY2xvbmUgd2FzIGFibGUgdG8gbW92ZSwgY29weSB0aG9zZSBtb2RzIG92ZXIgdG8gdXMgbm93IGluc3RlYWQgb2YgY2FsbGVyIHRyeWluZyB0byBkbyB0aGlzIGFsbCBvdmVyIVxyXG4gICAgICAgIC8vIE5vdGU6IHdlIGNhbid0IHVzZSB0aGUgbGlzdCBkaXJlY3RseSBhcyBlbGVtZW50cyBhbmQgb3RoZXIgcGFydHMgcG9pbnQgdG8gYWN0dWFsIG5vZGUsIHNvIGNvcHkgY29udGVudFxyXG4gICAgICAgIGNsb25lLm5vZGVzLmZpbHRlcihuID0+IG4uX2RpcnR5KS5mb3JFYWNoKGMgPT4ge1xyXG4gICAgICAgICAgICBsZXQgbiA9IHRoaXMubm9kZXMuZmluZChhID0+IGEuX2lkID09PSBjLl9pZCk7XHJcbiAgICAgICAgICAgIGlmICghbilcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgdXRpbHNfMS5VdGlscy5jb3B5UG9zKG4sIGMpO1xyXG4gICAgICAgICAgICBuLl9kaXJ0eSA9IHRydWU7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5fbm90aWZ5KCk7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcbiAgICAvKiogcmV0dXJuIHRydWUgaWYgY2FuIGZpdCBpbiBncmlkIGhlaWdodCBjb25zdHJhaW4gb25seSAoYWx3YXlzIHRydWUgaWYgbm8gbWF4Um93KSAqL1xyXG4gICAgd2lsbEl0Rml0KG5vZGUpIHtcclxuICAgICAgICBkZWxldGUgbm9kZS5fd2lsbEZpdFBvcztcclxuICAgICAgICBpZiAoIXRoaXMubWF4Um93KVxyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAvLyBjcmVhdGUgYSBjbG9uZSB3aXRoIE5PIG1heFJvdyBhbmQgY2hlY2sgaWYgc3RpbGwgd2l0aGluIHNpemVcclxuICAgICAgICBsZXQgY2xvbmUgPSBuZXcgR3JpZFN0YWNrRW5naW5lKHtcclxuICAgICAgICAgICAgY29sdW1uOiB0aGlzLmNvbHVtbixcclxuICAgICAgICAgICAgZmxvYXQ6IHRoaXMuZmxvYXQsXHJcbiAgICAgICAgICAgIG5vZGVzOiB0aGlzLm5vZGVzLm1hcChuID0+IHsgcmV0dXJuIE9iamVjdC5hc3NpZ24oe30sIG4pOyB9KVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGxldCBuID0gT2JqZWN0LmFzc2lnbih7fSwgbm9kZSk7IC8vIGNsb25lIG5vZGUgc28gd2UgZG9uJ3QgbW9kIGFueSBzZXR0aW5ncyBvbiBpdCBidXQgaGF2ZSBmdWxsIGF1dG9Qb3NpdGlvbiBhbmQgbWluL21heCBhcyB3ZWxsISAjMTY4N1xyXG4gICAgICAgIHRoaXMuY2xlYW51cE5vZGUobik7XHJcbiAgICAgICAgZGVsZXRlIG4uZWw7XHJcbiAgICAgICAgZGVsZXRlIG4uX2lkO1xyXG4gICAgICAgIGRlbGV0ZSBuLmNvbnRlbnQ7XHJcbiAgICAgICAgZGVsZXRlIG4uZ3JpZDtcclxuICAgICAgICBjbG9uZS5hZGROb2RlKG4pO1xyXG4gICAgICAgIGlmIChjbG9uZS5nZXRSb3coKSA8PSB0aGlzLm1heFJvdykge1xyXG4gICAgICAgICAgICBub2RlLl93aWxsRml0UG9zID0gdXRpbHNfMS5VdGlscy5jb3B5UG9zKHt9LCBuKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIC8qKiB0cnVlIGlmIHgseSBvciB3LGggYXJlIGRpZmZlcmVudCBhZnRlciBjbGFtcGluZyB0byBtaW4vbWF4ICovXHJcbiAgICBjaGFuZ2VkUG9zQ29uc3RyYWluKG5vZGUsIHApIHtcclxuICAgICAgICAvLyBmaXJzdCBtYWtlIHN1cmUgdyxoIGFyZSBzZXQgZm9yIGNhbGxlclxyXG4gICAgICAgIHAudyA9IHAudyB8fCBub2RlLnc7XHJcbiAgICAgICAgcC5oID0gcC5oIHx8IG5vZGUuaDtcclxuICAgICAgICBpZiAobm9kZS54ICE9PSBwLnggfHwgbm9kZS55ICE9PSBwLnkpXHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIC8vIGNoZWNrIGNvbnN0cmFpbmVkIHcsaFxyXG4gICAgICAgIGlmIChub2RlLm1heFcpIHtcclxuICAgICAgICAgICAgcC53ID0gTWF0aC5taW4ocC53LCBub2RlLm1heFcpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAobm9kZS5tYXhIKSB7XHJcbiAgICAgICAgICAgIHAuaCA9IE1hdGgubWluKHAuaCwgbm9kZS5tYXhIKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKG5vZGUubWluVykge1xyXG4gICAgICAgICAgICBwLncgPSBNYXRoLm1heChwLncsIG5vZGUubWluVyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChub2RlLm1pbkgpIHtcclxuICAgICAgICAgICAgcC5oID0gTWF0aC5tYXgocC5oLCBub2RlLm1pbkgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gKG5vZGUudyAhPT0gcC53IHx8IG5vZGUuaCAhPT0gcC5oKTtcclxuICAgIH1cclxuICAgIC8qKiByZXR1cm4gdHJ1ZSBpZiB0aGUgcGFzc2VkIGluIG5vZGUgd2FzIGFjdHVhbGx5IG1vdmVkIChjaGVja3MgZm9yIG5vLW9wIGFuZCBsb2NrZWQpICovXHJcbiAgICBtb3ZlTm9kZShub2RlLCBvKSB7XHJcbiAgICAgICAgdmFyIF9hLCBfYjtcclxuICAgICAgICBpZiAoIW5vZGUgfHwgLypub2RlLmxvY2tlZCB8fCovICFvKVxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgbGV0IHdhc1VuZGVmaW5lZFBhY2s7XHJcbiAgICAgICAgaWYgKG8ucGFjayA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIHdhc1VuZGVmaW5lZFBhY2sgPSBvLnBhY2sgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBjb25zdHJhaW4gdGhlIHBhc3NlZCBpbiB2YWx1ZXMgYW5kIGNoZWNrIGlmIHdlJ3JlIHN0aWxsIGNoYW5naW5nIG91ciBub2RlXHJcbiAgICAgICAgaWYgKHR5cGVvZiBvLnggIT09ICdudW1iZXInKSB7XHJcbiAgICAgICAgICAgIG8ueCA9IG5vZGUueDtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHR5cGVvZiBvLnkgIT09ICdudW1iZXInKSB7XHJcbiAgICAgICAgICAgIG8ueSA9IG5vZGUueTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHR5cGVvZiBvLncgIT09ICdudW1iZXInKSB7XHJcbiAgICAgICAgICAgIG8udyA9IG5vZGUudztcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHR5cGVvZiBvLmggIT09ICdudW1iZXInKSB7XHJcbiAgICAgICAgICAgIG8uaCA9IG5vZGUuaDtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IHJlc2l6aW5nID0gKG5vZGUudyAhPT0gby53IHx8IG5vZGUuaCAhPT0gby5oKTtcclxuICAgICAgICBsZXQgbm4gPSB1dGlsc18xLlV0aWxzLmNvcHlQb3Moe30sIG5vZGUsIHRydWUpOyAvLyBnZXQgbWluL21heCBvdXQgZmlyc3QsIHRoZW4gb3B0IHBvc2l0aW9ucyBuZXh0XHJcbiAgICAgICAgdXRpbHNfMS5VdGlscy5jb3B5UG9zKG5uLCBvKTtcclxuICAgICAgICBubiA9IHRoaXMubm9kZUJvdW5kRml4KG5uLCByZXNpemluZyk7XHJcbiAgICAgICAgdXRpbHNfMS5VdGlscy5jb3B5UG9zKG8sIG5uKTtcclxuICAgICAgICBpZiAodXRpbHNfMS5VdGlscy5zYW1lUG9zKG5vZGUsIG8pKVxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgbGV0IHByZXZQb3MgPSB1dGlsc18xLlV0aWxzLmNvcHlQb3Moe30sIG5vZGUpO1xyXG4gICAgICAgIC8vIGNoZWNrIGlmIHdlIHdpbGwgbmVlZCB0byBmaXggY29sbGlzaW9uIGF0IG91ciBuZXcgbG9jYXRpb25cclxuICAgICAgICBsZXQgY29sbGlkZXMgPSB0aGlzLmNvbGxpZGVBbGwobm9kZSwgbm4sIG8uc2tpcCk7XHJcbiAgICAgICAgbGV0IG5lZWRUb01vdmUgPSB0cnVlO1xyXG4gICAgICAgIGlmIChjb2xsaWRlcy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgbGV0IGFjdGl2ZURyYWcgPSBub2RlLl9tb3ZpbmcgJiYgIW8ubmVzdGVkO1xyXG4gICAgICAgICAgICAvLyBjaGVjayB0byBtYWtlIHN1cmUgd2UgYWN0dWFsbHkgY29sbGlkZWQgb3ZlciA1MCUgc3VyZmFjZSBhcmVhIHdoaWxlIGRyYWdnaW5nXHJcbiAgICAgICAgICAgIGxldCBjb2xsaWRlID0gYWN0aXZlRHJhZyA/IHRoaXMuZGlyZWN0aW9uQ29sbGlkZUNvdmVyYWdlKG5vZGUsIG8sIGNvbGxpZGVzKSA6IGNvbGxpZGVzWzBdO1xyXG4gICAgICAgICAgICAvLyBpZiB3ZSdyZSBlbmFibGluZyBjcmVhdGlvbiBvZiBzdWItZ3JpZHMgb24gdGhlIGZseSwgc2VlIGlmIHdlJ3JlIGNvdmVyaW5nIDgwJSBvZiBlaXRoZXIgb25lLCBpZiB3ZSBkaWRuJ3QgYWxyZWFkeSBkbyB0aGF0XHJcbiAgICAgICAgICAgIGlmIChhY3RpdmVEcmFnICYmIGNvbGxpZGUgJiYgKChfYiA9IChfYSA9IG5vZGUuZ3JpZCkgPT09IG51bGwgfHwgX2EgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9hLm9wdHMpID09PSBudWxsIHx8IF9iID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfYi5zdWJHcmlkRHluYW1pYykgJiYgIW5vZGUuZ3JpZC5faXNUZW1wKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgb3ZlciA9IHV0aWxzXzEuVXRpbHMuYXJlYUludGVyY2VwdChvLnJlY3QsIGNvbGxpZGUuX3JlY3QpO1xyXG4gICAgICAgICAgICAgICAgbGV0IGExID0gdXRpbHNfMS5VdGlscy5hcmVhKG8ucmVjdCk7XHJcbiAgICAgICAgICAgICAgICBsZXQgYTIgPSB1dGlsc18xLlV0aWxzLmFyZWEoY29sbGlkZS5fcmVjdCk7XHJcbiAgICAgICAgICAgICAgICBsZXQgcGVyYyA9IG92ZXIgLyAoYTEgPCBhMiA/IGExIDogYTIpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHBlcmMgPiAuOCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbGxpZGUuZ3JpZC5tYWtlU3ViR3JpZChjb2xsaWRlLmVsLCB1bmRlZmluZWQsIG5vZGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbGxpZGUgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGNvbGxpZGUpIHtcclxuICAgICAgICAgICAgICAgIG5lZWRUb01vdmUgPSAhdGhpcy5fZml4Q29sbGlzaW9ucyhub2RlLCBubiwgY29sbGlkZSwgbyk7IC8vIGNoZWNrIGlmIGFscmVhZHkgbW92ZWQuLi5cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIG5lZWRUb01vdmUgPSBmYWxzZTsgLy8gd2UgZGlkbid0IGNvdmVyID41MCUgZm9yIGEgbW92ZSwgc2tpcC4uLlxyXG4gICAgICAgICAgICAgICAgaWYgKHdhc1VuZGVmaW5lZFBhY2spXHJcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIG8ucGFjaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBub3cgbW92ZSAodG8gdGhlIG9yaWdpbmFsIGFzayB2cyB0aGUgY29sbGlzaW9uIHZlcnNpb24gd2hpY2ggbWlnaHQgZGlmZmVyKSBhbmQgcmVwYWNrIHRoaW5nc1xyXG4gICAgICAgIGlmIChuZWVkVG9Nb3ZlKSB7XHJcbiAgICAgICAgICAgIG5vZGUuX2RpcnR5ID0gdHJ1ZTtcclxuICAgICAgICAgICAgdXRpbHNfMS5VdGlscy5jb3B5UG9zKG5vZGUsIG5uKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKG8ucGFjaykge1xyXG4gICAgICAgICAgICB0aGlzLl9wYWNrTm9kZXMoKVxyXG4gICAgICAgICAgICAgICAgLl9ub3RpZnkoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuICF1dGlsc18xLlV0aWxzLnNhbWVQb3Mobm9kZSwgcHJldlBvcyk7IC8vIHBhY2sgbWlnaHQgaGF2ZSBtb3ZlZCB0aGluZ3MgYmFja1xyXG4gICAgfVxyXG4gICAgZ2V0Um93KCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLm5vZGVzLnJlZHVjZSgocm93LCBuKSA9PiBNYXRoLm1heChyb3csIG4ueSArIG4uaCksIDApO1xyXG4gICAgfVxyXG4gICAgYmVnaW5VcGRhdGUobm9kZSkge1xyXG4gICAgICAgIGlmICghbm9kZS5fdXBkYXRpbmcpIHtcclxuICAgICAgICAgICAgbm9kZS5fdXBkYXRpbmcgPSB0cnVlO1xyXG4gICAgICAgICAgICBkZWxldGUgbm9kZS5fc2tpcERvd247XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5iYXRjaE1vZGUpXHJcbiAgICAgICAgICAgICAgICB0aGlzLnNhdmVJbml0aWFsKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG4gICAgZW5kVXBkYXRlKCkge1xyXG4gICAgICAgIGxldCBuID0gdGhpcy5ub2Rlcy5maW5kKG4gPT4gbi5fdXBkYXRpbmcpO1xyXG4gICAgICAgIGlmIChuKSB7XHJcbiAgICAgICAgICAgIGRlbGV0ZSBuLl91cGRhdGluZztcclxuICAgICAgICAgICAgZGVsZXRlIG4uX3NraXBEb3duO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuICAgIC8qKiBzYXZlcyBhIGNvcHkgb2YgdGhlIGxhcmdlc3QgY29sdW1uIGxheW91dCAoZWcgMTIgZXZlbiB3aGVuIHJlbmRlcmluZyBvbmVDb2x1bW5Nb2RlKSBzbyB3ZSBkb24ndCBsb29zZSBvcmlnIGxheW91dCxcclxuICAgICAqIHJldHVybmluZyBhIGxpc3Qgb2Ygd2lkZ2V0cyBmb3Igc2VyaWFsaXphdGlvbiAqL1xyXG4gICAgc2F2ZShzYXZlRWxlbWVudCA9IHRydWUpIHtcclxuICAgICAgICB2YXIgX2E7XHJcbiAgICAgICAgLy8gdXNlIHRoZSBoaWdoZXN0IGxheW91dCBmb3IgYW55IHNhdmVkIGluZm8gc28gd2UgY2FuIGhhdmUgZnVsbCBkZXRhaWwgb24gcmVsb2FkICMxODQ5XHJcbiAgICAgICAgbGV0IGxlbiA9IChfYSA9IHRoaXMuX2xheW91dHMpID09PSBudWxsIHx8IF9hID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfYS5sZW5ndGg7XHJcbiAgICAgICAgbGV0IGxheW91dCA9IGxlbiAmJiB0aGlzLmNvbHVtbiAhPT0gKGxlbiAtIDEpID8gdGhpcy5fbGF5b3V0c1tsZW4gLSAxXSA6IG51bGw7XHJcbiAgICAgICAgbGV0IGxpc3QgPSBbXTtcclxuICAgICAgICB0aGlzLnNvcnROb2RlcygpO1xyXG4gICAgICAgIHRoaXMubm9kZXMuZm9yRWFjaChuID0+IHtcclxuICAgICAgICAgICAgbGV0IHdsID0gbGF5b3V0ID09PSBudWxsIHx8IGxheW91dCA9PT0gdm9pZCAwID8gdm9pZCAwIDogbGF5b3V0LmZpbmQobCA9PiBsLl9pZCA9PT0gbi5faWQpO1xyXG4gICAgICAgICAgICBsZXQgdyA9IE9iamVjdC5hc3NpZ24oe30sIG4pO1xyXG4gICAgICAgICAgICAvLyB1c2UgbGF5b3V0IGluZm8gaW5zdGVhZCBpZiBzZXRcclxuICAgICAgICAgICAgaWYgKHdsKSB7XHJcbiAgICAgICAgICAgICAgICB3LnggPSB3bC54O1xyXG4gICAgICAgICAgICAgICAgdy55ID0gd2wueTtcclxuICAgICAgICAgICAgICAgIHcudyA9IHdsLnc7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdXRpbHNfMS5VdGlscy5yZW1vdmVJbnRlcm5hbEZvclNhdmUodywgIXNhdmVFbGVtZW50KTtcclxuICAgICAgICAgICAgbGlzdC5wdXNoKHcpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiBsaXN0O1xyXG4gICAgfVxyXG4gICAgLyoqIEBpbnRlcm5hbCBjYWxsZWQgd2hlbmV2ZXIgYSBub2RlIGlzIGFkZGVkIG9yIG1vdmVkIC0gdXBkYXRlcyB0aGUgY2FjaGVkIGxheW91dHMgKi9cclxuICAgIGxheW91dHNOb2Rlc0NoYW5nZShub2Rlcykge1xyXG4gICAgICAgIGlmICghdGhpcy5fbGF5b3V0cyB8fCB0aGlzLl9pbkNvbHVtblJlc2l6ZSlcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgLy8gcmVtb3ZlIHNtYWxsZXIgbGF5b3V0cyAtIHdlIHdpbGwgcmUtZ2VuZXJhdGUgdGhvc2Ugb24gdGhlIGZseS4uLiBsYXJnZXIgb25lcyBuZWVkIHRvIHVwZGF0ZVxyXG4gICAgICAgIHRoaXMuX2xheW91dHMuZm9yRWFjaCgobGF5b3V0LCBjb2x1bW4pID0+IHtcclxuICAgICAgICAgICAgaWYgKCFsYXlvdXQgfHwgY29sdW1uID09PSB0aGlzLmNvbHVtbilcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgICAgICBpZiAoY29sdW1uIDwgdGhpcy5jb2x1bW4pIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2xheW91dHNbY29sdW1uXSA9IHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIC8vIHdlIHNhdmUgdGhlIG9yaWdpbmFsIHgseSx3IChoIGlzbid0IGNhY2hlZCkgdG8gc2VlIHdoYXQgYWN0dWFsbHkgY2hhbmdlZCB0byBwcm9wYWdhdGUgYmV0dGVyLlxyXG4gICAgICAgICAgICAgICAgLy8gTk9URTogd2UgZG9uJ3QgbmVlZCB0byBjaGVjayBhZ2FpbnN0IG91dCBvZiBib3VuZCBzY2FsaW5nL21vdmluZyBhcyB0aGF0IHdpbGwgYmUgZG9uZSB3aGVuIHVzaW5nIHRob3NlIGNhY2hlIHZhbHVlcy4gIzE3ODVcclxuICAgICAgICAgICAgICAgIGxldCByYXRpbyA9IGNvbHVtbiAvIHRoaXMuY29sdW1uO1xyXG4gICAgICAgICAgICAgICAgbm9kZXMuZm9yRWFjaChub2RlID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIW5vZGUuX29yaWcpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjsgLy8gZGlkbid0IGNoYW5nZSAobmV3bHkgYWRkZWQgPylcclxuICAgICAgICAgICAgICAgICAgICBsZXQgbiA9IGxheW91dC5maW5kKGwgPT4gbC5faWQgPT09IG5vZGUuX2lkKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIW4pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjsgLy8gbm8gY2FjaGUgZm9yIG5ldyBub2Rlcy4gV2lsbCB1c2UgdGhvc2UgdmFsdWVzLlxyXG4gICAgICAgICAgICAgICAgICAgIC8vIFkgY2hhbmdlZCwgcHVzaCBkb3duIHNhbWUgYW1vdW50XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gVE9ETzogZGV0ZWN0IGRvaW5nIGl0ZW0gJ3N3YXBzJyB3aWxsIGhlbHAgaW5zdGVhZCBvZiBtb3ZlIChlc3BlY2lhbGx5IGluIDEgY29sdW1uIG1vZGUpXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5vZGUueSAhPT0gbm9kZS5fb3JpZy55KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG4ueSArPSAobm9kZS55IC0gbm9kZS5fb3JpZy55KTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gWCBjaGFuZ2VkLCBzY2FsZSBmcm9tIG5ldyBwb3NpdGlvblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChub2RlLnggIT09IG5vZGUuX29yaWcueCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBuLnggPSBNYXRoLnJvdW5kKG5vZGUueCAqIHJhdGlvKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gd2lkdGggY2hhbmdlZCwgc2NhbGUgZnJvbSBuZXcgd2lkdGhcclxuICAgICAgICAgICAgICAgICAgICBpZiAobm9kZS53ICE9PSBub2RlLl9vcmlnLncpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbi53ID0gTWF0aC5yb3VuZChub2RlLncgKiByYXRpbyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIC8vIC4uLmhlaWdodCBhbHdheXMgY2FycmllcyBvdmVyIGZyb20gY2FjaGVcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIEBpbnRlcm5hbCBDYWxsZWQgdG8gc2NhbGUgdGhlIHdpZGdldCB3aWR0aCAmIHBvc2l0aW9uIHVwL2Rvd24gYmFzZWQgb24gdGhlIGNvbHVtbiBjaGFuZ2UuXHJcbiAgICAgKiBOb3RlIHdlIHN0b3JlIHByZXZpb3VzIGxheW91dHMgKGVzcGVjaWFsbHkgb3JpZ2luYWwgb25lcykgdG8gbWFrZSBpdCBwb3NzaWJsZSB0byBnb1xyXG4gICAgICogZnJvbSBzYXkgMTIgLT4gMSAtPiAxMiBhbmQgZ2V0IGJhY2sgdG8gd2hlcmUgd2Ugd2VyZS5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0gcHJldkNvbHVtbiBwcmV2aW91cyBudW1iZXIgb2YgY29sdW1uc1xyXG4gICAgICogQHBhcmFtIGNvbHVtbiAgbmV3IGNvbHVtbiBudW1iZXJcclxuICAgICAqIEBwYXJhbSBub2RlcyBkaWZmZXJlbnQgc29ydGVkIGxpc3QgKGV4OiBET00gb3JkZXIpIGluc3RlYWQgb2YgY3VycmVudCBsaXN0XHJcbiAgICAgKiBAcGFyYW0gbGF5b3V0IHNwZWNpZnkgdGhlIHR5cGUgb2YgcmUtbGF5b3V0IHRoYXQgd2lsbCBoYXBwZW4gKHBvc2l0aW9uLCBzaXplLCBldGMuLi4pLlxyXG4gICAgICogTm90ZTogaXRlbXMgd2lsbCBuZXZlciBiZSBvdXRzaWRlIG9mIHRoZSBjdXJyZW50IGNvbHVtbiBib3VuZGFyaWVzLiBkZWZhdWx0IChtb3ZlU2NhbGUpLiBJZ25vcmVkIGZvciAxIGNvbHVtblxyXG4gICAgICovXHJcbiAgICB1cGRhdGVOb2RlV2lkdGhzKHByZXZDb2x1bW4sIGNvbHVtbiwgbm9kZXMsIGxheW91dCA9ICdtb3ZlU2NhbGUnKSB7XHJcbiAgICAgICAgdmFyIF9hO1xyXG4gICAgICAgIGlmICghdGhpcy5ub2Rlcy5sZW5ndGggfHwgIWNvbHVtbiB8fCBwcmV2Q29sdW1uID09PSBjb2x1bW4pXHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIC8vIGNhY2hlIHRoZSBjdXJyZW50IGxheW91dCBpbiBjYXNlIHRoZXkgd2FudCB0byBnbyBiYWNrIChsaWtlIDEyIC0+IDEgLT4gMTIpIGFzIGl0IHJlcXVpcmVzIG9yaWdpbmFsIGRhdGFcclxuICAgICAgICB0aGlzLmNhY2hlTGF5b3V0KHRoaXMubm9kZXMsIHByZXZDb2x1bW4pO1xyXG4gICAgICAgIHRoaXMuYmF0Y2hVcGRhdGUoKTsgLy8gZG8gdGhpcyBFQVJMWSBhcyBpdCB3aWxsIGNhbGwgc2F2ZUluaXRpYWwoKSBzbyB3ZSBjYW4gZGV0ZWN0IHdoZXJlIHdlIHN0YXJ0ZWQgZm9yIF9kaXJ0eSBhbmQgY29sbGlzaW9uXHJcbiAgICAgICAgbGV0IG5ld05vZGVzID0gW107XHJcbiAgICAgICAgLy8gaWYgd2UncmUgZ29pbmcgdG8gMSBjb2x1bW4gYW5kIHVzaW5nIERPTSBvcmRlciByYXRoZXIgdGhhbiBkZWZhdWx0IHNvcnRpbmcsIHRoZW4gZ2VuZXJhdGUgdGhhdCBsYXlvdXRcclxuICAgICAgICBsZXQgZG9tT3JkZXIgPSBmYWxzZTtcclxuICAgICAgICBpZiAoY29sdW1uID09PSAxICYmIChub2RlcyA9PT0gbnVsbCB8fCBub2RlcyA9PT0gdm9pZCAwID8gdm9pZCAwIDogbm9kZXMubGVuZ3RoKSkge1xyXG4gICAgICAgICAgICBkb21PcmRlciA9IHRydWU7XHJcbiAgICAgICAgICAgIGxldCB0b3AgPSAwO1xyXG4gICAgICAgICAgICBub2Rlcy5mb3JFYWNoKG4gPT4ge1xyXG4gICAgICAgICAgICAgICAgbi54ID0gMDtcclxuICAgICAgICAgICAgICAgIG4udyA9IDE7XHJcbiAgICAgICAgICAgICAgICBuLnkgPSBNYXRoLm1heChuLnksIHRvcCk7XHJcbiAgICAgICAgICAgICAgICB0b3AgPSBuLnkgKyBuLmg7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBuZXdOb2RlcyA9IG5vZGVzO1xyXG4gICAgICAgICAgICBub2RlcyA9IFtdO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgbm9kZXMgPSB1dGlsc18xLlV0aWxzLnNvcnQodGhpcy5ub2RlcywgLTEsIHByZXZDb2x1bW4pOyAvLyBjdXJyZW50IGNvbHVtbiByZXZlcnNlIHNvcnRpbmcgc28gd2UgY2FuIGluc2VydCBsYXN0IHRvIGZyb250IChsaW1pdCBjb2xsaXNpb24pXHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIHNlZSBpZiB3ZSBoYXZlIGNhY2hlZCBwcmV2aW91cyBsYXlvdXQgSUZGIHdlIGFyZSBnb2luZyB1cCBpbiBzaXplIChyZXN0b3JlKSBvdGhlcndpc2UgYWx3YXlzXHJcbiAgICAgICAgLy8gZ2VuZXJhdGUgbmV4dCBzaXplIGRvd24gZnJvbSB3aGVyZSB3ZSBhcmUgKGxvb2tzIG1vcmUgbmF0dXJhbCBhcyB5b3UgZ3JhZHVhbGx5IHNpemUgZG93bikuXHJcbiAgICAgICAgbGV0IGNhY2hlTm9kZXMgPSBbXTtcclxuICAgICAgICBpZiAoY29sdW1uID4gcHJldkNvbHVtbikge1xyXG4gICAgICAgICAgICBjYWNoZU5vZGVzID0gdGhpcy5fbGF5b3V0c1tjb2x1bW5dIHx8IFtdO1xyXG4gICAgICAgICAgICAvLyAuLi5pZiBub3QsIHN0YXJ0IHdpdGggdGhlIGxhcmdlc3QgbGF5b3V0IChpZiBub3QgYWxyZWFkeSB0aGVyZSkgYXMgZG93bi1zY2FsaW5nIGlzIG1vcmUgYWNjdXJhdGVcclxuICAgICAgICAgICAgLy8gYnkgcHJldGVuZGluZyB3ZSBjYW1lIGZyb20gdGhhdCBsYXJnZXIgY29sdW1uIGJ5IGFzc2lnbmluZyB0aG9zZSB2YWx1ZXMgYXMgc3RhcnRpbmcgcG9pbnRcclxuICAgICAgICAgICAgbGV0IGxhc3RJbmRleCA9IHRoaXMuX2xheW91dHMubGVuZ3RoIC0gMTtcclxuICAgICAgICAgICAgaWYgKCFjYWNoZU5vZGVzLmxlbmd0aCAmJiBwcmV2Q29sdW1uICE9PSBsYXN0SW5kZXggJiYgKChfYSA9IHRoaXMuX2xheW91dHNbbGFzdEluZGV4XSkgPT09IG51bGwgfHwgX2EgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9hLmxlbmd0aCkpIHtcclxuICAgICAgICAgICAgICAgIHByZXZDb2x1bW4gPSBsYXN0SW5kZXg7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9sYXlvdXRzW2xhc3RJbmRleF0uZm9yRWFjaChjYWNoZU5vZGUgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBuID0gbm9kZXMuZmluZChuID0+IG4uX2lkID09PSBjYWNoZU5vZGUuX2lkKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAobikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBzdGlsbCBjdXJyZW50LCB1c2UgY2FjaGUgaW5mbyBwb3NpdGlvbnNcclxuICAgICAgICAgICAgICAgICAgICAgICAgbi54ID0gY2FjaGVOb2RlLng7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG4ueSA9IGNhY2hlTm9kZS55O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBuLncgPSBjYWNoZU5vZGUudztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBpZiB3ZSBmb3VuZCBjYWNoZSByZS11c2UgdGhvc2Ugbm9kZXMgdGhhdCBhcmUgc3RpbGwgY3VycmVudFxyXG4gICAgICAgIGNhY2hlTm9kZXMuZm9yRWFjaChjYWNoZU5vZGUgPT4ge1xyXG4gICAgICAgICAgICBsZXQgaiA9IG5vZGVzLmZpbmRJbmRleChuID0+IG4uX2lkID09PSBjYWNoZU5vZGUuX2lkKTtcclxuICAgICAgICAgICAgaWYgKGogIT09IC0xKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBzdGlsbCBjdXJyZW50LCB1c2UgY2FjaGUgaW5mbyBwb3NpdGlvbnNcclxuICAgICAgICAgICAgICAgIGlmIChjYWNoZU5vZGUuYXV0b1Bvc2l0aW9uIHx8IGlzTmFOKGNhY2hlTm9kZS54KSB8fCBpc05hTihjYWNoZU5vZGUueSkpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmZpbmRFbXB0eVBvc2l0aW9uKGNhY2hlTm9kZSwgbmV3Tm9kZXMpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKCFjYWNoZU5vZGUuYXV0b1Bvc2l0aW9uKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbm9kZXNbal0ueCA9IGNhY2hlTm9kZS54O1xyXG4gICAgICAgICAgICAgICAgICAgIG5vZGVzW2pdLnkgPSBjYWNoZU5vZGUueTtcclxuICAgICAgICAgICAgICAgICAgICBub2Rlc1tqXS53ID0gY2FjaGVOb2RlLnc7XHJcbiAgICAgICAgICAgICAgICAgICAgbmV3Tm9kZXMucHVzaChub2Rlc1tqXSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBub2Rlcy5zcGxpY2UoaiwgMSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICAvLyAuLi5hbmQgYWRkIGFueSBleHRyYSBub24tY2FjaGVkIG9uZXNcclxuICAgICAgICBpZiAobm9kZXMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgbGF5b3V0ID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgICAgICAgICBsYXlvdXQoY29sdW1uLCBwcmV2Q29sdW1uLCBuZXdOb2Rlcywgbm9kZXMpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKCFkb21PcmRlcikge1xyXG4gICAgICAgICAgICAgICAgbGV0IHJhdGlvID0gY29sdW1uIC8gcHJldkNvbHVtbjtcclxuICAgICAgICAgICAgICAgIGxldCBtb3ZlID0gKGxheW91dCA9PT0gJ21vdmUnIHx8IGxheW91dCA9PT0gJ21vdmVTY2FsZScpO1xyXG4gICAgICAgICAgICAgICAgbGV0IHNjYWxlID0gKGxheW91dCA9PT0gJ3NjYWxlJyB8fCBsYXlvdXQgPT09ICdtb3ZlU2NhbGUnKTtcclxuICAgICAgICAgICAgICAgIG5vZGVzLmZvckVhY2gobm9kZSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gTk9URTogeCArIHcgY291bGQgYmUgb3V0c2lkZSBvZiB0aGUgZ3JpZCwgYnV0IGFkZE5vZGUoKSBiZWxvdyB3aWxsIGhhbmRsZSB0aGF0XHJcbiAgICAgICAgICAgICAgICAgICAgbm9kZS54ID0gKGNvbHVtbiA9PT0gMSA/IDAgOiAobW92ZSA/IE1hdGgucm91bmQobm9kZS54ICogcmF0aW8pIDogTWF0aC5taW4obm9kZS54LCBjb2x1bW4gLSAxKSkpO1xyXG4gICAgICAgICAgICAgICAgICAgIG5vZGUudyA9ICgoY29sdW1uID09PSAxIHx8IHByZXZDb2x1bW4gPT09IDEpID8gMSA6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNjYWxlID8gKE1hdGgucm91bmQobm9kZS53ICogcmF0aW8pIHx8IDEpIDogKE1hdGgubWluKG5vZGUudywgY29sdW1uKSkpO1xyXG4gICAgICAgICAgICAgICAgICAgIG5ld05vZGVzLnB1c2gobm9kZSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIG5vZGVzID0gW107XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gZmluYWxseSByZS1sYXlvdXQgdGhlbSBpbiByZXZlcnNlIG9yZGVyICh0byBnZXQgY29ycmVjdCBwbGFjZW1lbnQpXHJcbiAgICAgICAgaWYgKCFkb21PcmRlcilcclxuICAgICAgICAgICAgbmV3Tm9kZXMgPSB1dGlsc18xLlV0aWxzLnNvcnQobmV3Tm9kZXMsIC0xLCBjb2x1bW4pO1xyXG4gICAgICAgIHRoaXMuX2luQ29sdW1uUmVzaXplID0gdHJ1ZTsgLy8gcHJldmVudCBjYWNoZSB1cGRhdGVcclxuICAgICAgICB0aGlzLm5vZGVzID0gW107IC8vIHByZXRlbmQgd2UgaGF2ZSBubyBub2RlcyB0byBzdGFydCB3aXRoIChhZGQoKSB3aWxsIHVzZSBzYW1lIHN0cnVjdHVyZXMpIHRvIHNpbXBsaWZ5IGxheW91dFxyXG4gICAgICAgIG5ld05vZGVzLmZvckVhY2gobm9kZSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuYWRkTm9kZShub2RlLCBmYWxzZSk7IC8vICdmYWxzZScgZm9yIGFkZCBldmVudCB0cmlnZ2VyXHJcbiAgICAgICAgICAgIGRlbGV0ZSBub2RlLl9vcmlnOyAvLyBtYWtlIHN1cmUgdGhlIGNvbW1pdCBkb2Vzbid0IHRyeSB0byByZXN0b3JlIHRoaW5ncyBiYWNrIHRvIG9yaWdpbmFsXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5iYXRjaFVwZGF0ZShmYWxzZSk7XHJcbiAgICAgICAgZGVsZXRlIHRoaXMuX2luQ29sdW1uUmVzaXplO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBjYWxsIHRvIGNhY2hlIHRoZSBnaXZlbiBsYXlvdXQgaW50ZXJuYWxseSB0byB0aGUgZ2l2ZW4gbG9jYXRpb24gc28gd2UgY2FuIHJlc3RvcmUgYmFjayB3aGVuIGNvbHVtbiBjaGFuZ2VzIHNpemVcclxuICAgICAqIEBwYXJhbSBub2RlcyBsaXN0IG9mIG5vZGVzXHJcbiAgICAgKiBAcGFyYW0gY29sdW1uIGNvcnJlc3BvbmRpbmcgY29sdW1uIGluZGV4IHRvIHNhdmUgaXQgdW5kZXJcclxuICAgICAqIEBwYXJhbSBjbGVhciBpZiB0cnVlLCB3aWxsIGZvcmNlIG90aGVyIGNhY2hlcyB0byBiZSByZW1vdmVkIChkZWZhdWx0IGZhbHNlKVxyXG4gICAgICovXHJcbiAgICBjYWNoZUxheW91dChub2RlcywgY29sdW1uLCBjbGVhciA9IGZhbHNlKSB7XHJcbiAgICAgICAgbGV0IGNvcHkgPSBbXTtcclxuICAgICAgICBub2Rlcy5mb3JFYWNoKChuLCBpKSA9PiB7XHJcbiAgICAgICAgICAgIG4uX2lkID0gbi5faWQgfHwgR3JpZFN0YWNrRW5naW5lLl9pZFNlcSsrOyAvLyBtYWtlIHN1cmUgd2UgaGF2ZSBhbiBpZCBpbiBjYXNlIHRoaXMgaXMgbmV3IGxheW91dCwgZWxzZSByZS11c2UgaWQgYWxyZWFkeSBzZXRcclxuICAgICAgICAgICAgY29weVtpXSA9IHsgeDogbi54LCB5OiBuLnksIHc6IG4udywgX2lkOiBuLl9pZCB9OyAvLyBvbmx5IHRoaW5nIHdlIGNoYW5nZSBpcyB4LHksdyBhbmQgaWQgdG8gZmluZCBpdCBiYWNrXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5fbGF5b3V0cyA9IGNsZWFyID8gW10gOiB0aGlzLl9sYXlvdXRzIHx8IFtdOyAvLyB1c2UgYXJyYXkgdG8gZmluZCBsYXJnZXIgcXVpY2tcclxuICAgICAgICB0aGlzLl9sYXlvdXRzW2NvbHVtbl0gPSBjb3B5O1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBjYWxsIHRvIGNhY2hlIHRoZSBnaXZlbiBub2RlIGxheW91dCBpbnRlcm5hbGx5IHRvIHRoZSBnaXZlbiBsb2NhdGlvbiBzbyB3ZSBjYW4gcmVzdG9yZSBiYWNrIHdoZW4gY29sdW1uIGNoYW5nZXMgc2l6ZVxyXG4gICAgICogQHBhcmFtIG5vZGUgc2luZ2xlIG5vZGUgdG8gY2FjaGVcclxuICAgICAqIEBwYXJhbSBjb2x1bW4gY29ycmVzcG9uZGluZyBjb2x1bW4gaW5kZXggdG8gc2F2ZSBpdCB1bmRlclxyXG4gICAgICovXHJcbiAgICBjYWNoZU9uZUxheW91dChuLCBjb2x1bW4pIHtcclxuICAgICAgICBuLl9pZCA9IG4uX2lkIHx8IEdyaWRTdGFja0VuZ2luZS5faWRTZXErKztcclxuICAgICAgICBsZXQgbCA9IHsgeDogbi54LCB5OiBuLnksIHc6IG4udywgX2lkOiBuLl9pZCB9O1xyXG4gICAgICAgIGlmIChuLmF1dG9Qb3NpdGlvbikge1xyXG4gICAgICAgICAgICBkZWxldGUgbC54O1xyXG4gICAgICAgICAgICBkZWxldGUgbC55O1xyXG4gICAgICAgICAgICBsLmF1dG9Qb3NpdGlvbiA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX2xheW91dHMgPSB0aGlzLl9sYXlvdXRzIHx8IFtdO1xyXG4gICAgICAgIHRoaXMuX2xheW91dHNbY29sdW1uXSA9IHRoaXMuX2xheW91dHNbY29sdW1uXSB8fCBbXTtcclxuICAgICAgICBsZXQgaW5kZXggPSB0aGlzLmZpbmRDYWNoZUxheW91dChuLCBjb2x1bW4pO1xyXG4gICAgICAgIGlmIChpbmRleCA9PT0gLTEpXHJcbiAgICAgICAgICAgIHRoaXMuX2xheW91dHNbY29sdW1uXS5wdXNoKGwpO1xyXG4gICAgICAgIGVsc2VcclxuICAgICAgICAgICAgdGhpcy5fbGF5b3V0c1tjb2x1bW5dW2luZGV4XSA9IGw7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbiAgICBmaW5kQ2FjaGVMYXlvdXQobiwgY29sdW1uKSB7XHJcbiAgICAgICAgdmFyIF9hLCBfYiwgX2M7XHJcbiAgICAgICAgcmV0dXJuIChfYyA9IChfYiA9IChfYSA9IHRoaXMuX2xheW91dHMpID09PSBudWxsIHx8IF9hID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfYVtjb2x1bW5dKSA9PT0gbnVsbCB8fCBfYiA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2IuZmluZEluZGV4KGwgPT4gbC5faWQgPT09IG4uX2lkKSkgIT09IG51bGwgJiYgX2MgIT09IHZvaWQgMCA/IF9jIDogLTE7XHJcbiAgICB9XHJcbiAgICAvKiogY2FsbGVkIHRvIHJlbW92ZSBhbGwgaW50ZXJuYWwgdmFsdWVzIGJ1dCB0aGUgX2lkICovXHJcbiAgICBjbGVhbnVwTm9kZShub2RlKSB7XHJcbiAgICAgICAgZm9yIChsZXQgcHJvcCBpbiBub2RlKSB7XHJcbiAgICAgICAgICAgIGlmIChwcm9wWzBdID09PSAnXycgJiYgcHJvcCAhPT0gJ19pZCcpXHJcbiAgICAgICAgICAgICAgICBkZWxldGUgbm9kZVtwcm9wXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0cy5HcmlkU3RhY2tFbmdpbmUgPSBHcmlkU3RhY2tFbmdpbmU7XHJcbi8qKiBAaW50ZXJuYWwgdW5pcXVlIGdsb2JhbCBpbnRlcm5hbCBfaWQgY291bnRlciBOT1Qgc3RhcnRpbmcgYXQgMCAqL1xyXG5HcmlkU3RhY2tFbmdpbmUuX2lkU2VxID0gMTtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Z3JpZHN0YWNrLWVuZ2luZS5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcclxudmFyIF9fY3JlYXRlQmluZGluZyA9ICh0aGlzICYmIHRoaXMuX19jcmVhdGVCaW5kaW5nKSB8fCAoT2JqZWN0LmNyZWF0ZSA/IChmdW5jdGlvbihvLCBtLCBrLCBrMikge1xyXG4gICAgaWYgKGsyID09PSB1bmRlZmluZWQpIGsyID0gaztcclxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvLCBrMiwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGZ1bmN0aW9uKCkgeyByZXR1cm4gbVtrXTsgfSB9KTtcclxufSkgOiAoZnVuY3Rpb24obywgbSwgaywgazIpIHtcclxuICAgIGlmIChrMiA9PT0gdW5kZWZpbmVkKSBrMiA9IGs7XHJcbiAgICBvW2syXSA9IG1ba107XHJcbn0pKTtcclxudmFyIF9fZXhwb3J0U3RhciA9ICh0aGlzICYmIHRoaXMuX19leHBvcnRTdGFyKSB8fCBmdW5jdGlvbihtLCBleHBvcnRzKSB7XHJcbiAgICBmb3IgKHZhciBwIGluIG0pIGlmIChwICE9PSBcImRlZmF1bHRcIiAmJiAhZXhwb3J0cy5oYXNPd25Qcm9wZXJ0eShwKSkgX19jcmVhdGVCaW5kaW5nKGV4cG9ydHMsIG0sIHApO1xyXG59O1xyXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XHJcbmV4cG9ydHMuR3JpZFN0YWNrID0gdm9pZCAwO1xyXG4vKiFcclxuICogR3JpZFN0YWNrIDcuMy4wXHJcbiAqIGh0dHBzOi8vZ3JpZHN0YWNranMuY29tL1xyXG4gKlxyXG4gKiBDb3B5cmlnaHQgKGMpIDIwMjEtMjAyMiBBbGFpbiBEdW1lc255XHJcbiAqIHNlZSByb290IGxpY2Vuc2UgaHR0cHM6Ly9naXRodWIuY29tL2dyaWRzdGFjay9ncmlkc3RhY2suanMvdHJlZS9tYXN0ZXIvTElDRU5TRVxyXG4gKi9cclxuY29uc3QgZ3JpZHN0YWNrX2VuZ2luZV8xID0gcmVxdWlyZShcIi4vZ3JpZHN0YWNrLWVuZ2luZVwiKTtcclxuY29uc3QgdXRpbHNfMSA9IHJlcXVpcmUoXCIuL3V0aWxzXCIpO1xyXG5jb25zdCB0eXBlc18xID0gcmVxdWlyZShcIi4vdHlwZXNcIik7XHJcbi8qXHJcbiAqIGFuZCBpbmNsdWRlIEQmRCBieSBkZWZhdWx0XHJcbiAqIFRPRE86IHdoaWxlIHdlIGNvdWxkIGdlbmVyYXRlIGEgZ3JpZHN0YWNrLXN0YXRpYy5qcyBhdCBzbWFsbGVyIHNpemUgLSBzYXZlcyBhYm91dCAzMWsgKDQxayAtPiA3MmspXHJcbiAqIEkgZG9uJ3Qga25vdyBob3cgdG8gZ2VuZXJhdGUgdGhlIEREIG9ubHkgY29kZSBhdCB0aGUgcmVtYWluaW5nIDMxayB0byBkZWxheSBsb2FkIGFzIGNvZGUgZGVwZW5kcyBvbiBHcmlkc3RhY2sudHNcclxuICogYWxzbyBpdCBjYXVzZWQgbG9hZGluZyBpc3N1ZXMgaW4gcHJvZCAtIHNlZSBodHRwczovL2dpdGh1Yi5jb20vZ3JpZHN0YWNrL2dyaWRzdGFjay5qcy9pc3N1ZXMvMjAzOVxyXG4gKi9cclxuY29uc3QgZGRfZ3JpZHN0YWNrXzEgPSByZXF1aXJlKFwiLi9kZC1ncmlkc3RhY2tcIik7XHJcbmNvbnN0IGRkX3RvdWNoXzEgPSByZXF1aXJlKFwiLi9kZC10b3VjaFwiKTtcclxuY29uc3QgZGRfbWFuYWdlcl8xID0gcmVxdWlyZShcIi4vZGQtbWFuYWdlclwiKTtcclxuLyoqIGdsb2JhbCBpbnN0YW5jZSAqL1xyXG5jb25zdCBkZCA9IG5ldyBkZF9ncmlkc3RhY2tfMS5EREdyaWRTdGFjaztcclxuLy8gZXhwb3J0IGFsbCBkZXBlbmRlbnQgZmlsZSBhcyB3ZWxsIHRvIG1ha2UgaXQgZWFzaWVyIGZvciB1c2VycyB0byBqdXN0IGltcG9ydCB0aGUgbWFpbiBmaWxlXHJcbl9fZXhwb3J0U3RhcihyZXF1aXJlKFwiLi90eXBlc1wiKSwgZXhwb3J0cyk7XHJcbl9fZXhwb3J0U3RhcihyZXF1aXJlKFwiLi91dGlsc1wiKSwgZXhwb3J0cyk7XHJcbl9fZXhwb3J0U3RhcihyZXF1aXJlKFwiLi9ncmlkc3RhY2stZW5naW5lXCIpLCBleHBvcnRzKTtcclxuX19leHBvcnRTdGFyKHJlcXVpcmUoXCIuL2RkLWdyaWRzdGFja1wiKSwgZXhwb3J0cyk7XHJcbi8qKlxyXG4gKiBNYWluIGdyaWRzdGFjayBjbGFzcyAtIHlvdSB3aWxsIG5lZWQgdG8gY2FsbCBgR3JpZFN0YWNrLmluaXQoKWAgZmlyc3QgdG8gaW5pdGlhbGl6ZSB5b3VyIGdyaWQuXHJcbiAqIE5vdGU6IHlvdXIgZ3JpZCBlbGVtZW50cyBNVVNUIGhhdmUgdGhlIGZvbGxvd2luZyBjbGFzc2VzIGZvciB0aGUgQ1NTIGxheW91dCB0byB3b3JrOlxyXG4gKiBAZXhhbXBsZVxyXG4gKiA8ZGl2IGNsYXNzPVwiZ3JpZC1zdGFja1wiPlxyXG4gKiAgIDxkaXYgY2xhc3M9XCJncmlkLXN0YWNrLWl0ZW1cIj5cclxuICogICAgIDxkaXYgY2xhc3M9XCJncmlkLXN0YWNrLWl0ZW0tY29udGVudFwiPkl0ZW0gMTwvZGl2PlxyXG4gKiAgIDwvZGl2PlxyXG4gKiA8L2Rpdj5cclxuICovXHJcbmNsYXNzIEdyaWRTdGFjayB7XHJcbiAgICAvKipcclxuICAgICAqIENvbnN0cnVjdCBhIGdyaWQgaXRlbSBmcm9tIHRoZSBnaXZlbiBlbGVtZW50IGFuZCBvcHRpb25zXHJcbiAgICAgKiBAcGFyYW0gZWxcclxuICAgICAqIEBwYXJhbSBvcHRzXHJcbiAgICAgKi9cclxuICAgIGNvbnN0cnVjdG9yKGVsLCBvcHRzID0ge30pIHtcclxuICAgICAgICB2YXIgX2EsIF9iO1xyXG4gICAgICAgIC8qKiBAaW50ZXJuYWwgKi9cclxuICAgICAgICB0aGlzLl9nc0V2ZW50SGFuZGxlciA9IHt9O1xyXG4gICAgICAgIC8qKiBAaW50ZXJuYWwgZXh0cmEgcm93IGFkZGVkIHdoZW4gZHJhZ2dpbmcgYXQgdGhlIGJvdHRvbSBvZiB0aGUgZ3JpZCAqL1xyXG4gICAgICAgIHRoaXMuX2V4dHJhRHJhZ1JvdyA9IDA7XHJcbiAgICAgICAgdGhpcy5lbCA9IGVsOyAvLyBleHBvc2VkIEhUTUwgZWxlbWVudCB0byB0aGUgdXNlclxyXG4gICAgICAgIG9wdHMgPSBvcHRzIHx8IHt9OyAvLyBoYW5kbGVzIG51bGwvdW5kZWZpbmVkLzBcclxuICAgICAgICBpZiAoIWVsLmNsYXNzTGlzdC5jb250YWlucygnZ3JpZC1zdGFjaycpKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZWwuY2xhc3NMaXN0LmFkZCgnZ3JpZC1zdGFjaycpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBpZiByb3cgcHJvcGVydHkgZXhpc3RzLCByZXBsYWNlIG1pblJvdyBhbmQgbWF4Um93IGluc3RlYWRcclxuICAgICAgICBpZiAob3B0cy5yb3cpIHtcclxuICAgICAgICAgICAgb3B0cy5taW5Sb3cgPSBvcHRzLm1heFJvdyA9IG9wdHMucm93O1xyXG4gICAgICAgICAgICBkZWxldGUgb3B0cy5yb3c7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCByb3dBdHRyID0gdXRpbHNfMS5VdGlscy50b051bWJlcihlbC5nZXRBdHRyaWJ1dGUoJ2dzLXJvdycpKTtcclxuICAgICAgICAvLyBmbGFnIG9ubHkgdmFsaWQgaW4gc3ViLWdyaWRzIChoYW5kbGVkIGJ5IHBhcmVudCwgbm90IGhlcmUpXHJcbiAgICAgICAgaWYgKG9wdHMuY29sdW1uID09PSAnYXV0bycpIHtcclxuICAgICAgICAgICAgZGVsZXRlIG9wdHMuY29sdW1uO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyAnbWluV2lkdGgnIGxlZ2FjeSBzdXBwb3J0IGluIDUuMVxyXG4gICAgICAgIC8qIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXhwbGljaXQtYW55ICovXHJcbiAgICAgICAgbGV0IGFueU9wdHMgPSBvcHRzO1xyXG4gICAgICAgIGlmIChhbnlPcHRzLm1pbldpZHRoICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgb3B0cy5vbmVDb2x1bW5TaXplID0gb3B0cy5vbmVDb2x1bW5TaXplIHx8IGFueU9wdHMubWluV2lkdGg7XHJcbiAgICAgICAgICAgIGRlbGV0ZSBhbnlPcHRzLm1pbldpZHRoO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBzYXZlIG9yaWdpbmFsIHNldHRpbmcgc28gd2UgY2FuIHJlc3RvcmUgb24gc2F2ZVxyXG4gICAgICAgIGlmIChvcHRzLmFsd2F5c1Nob3dSZXNpemVIYW5kbGUgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICBvcHRzLl9hbHdheXNTaG93UmVzaXplSGFuZGxlID0gb3B0cy5hbHdheXNTaG93UmVzaXplSGFuZGxlO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBlbGVtZW50cyBET00gYXR0cmlidXRlcyBvdmVycmlkZSBhbnkgcGFzc2VkIG9wdGlvbnMgKGxpa2UgQ1NTIHN0eWxlKSAtIG1lcmdlIHRoZSB0d28gdG9nZXRoZXJcclxuICAgICAgICBsZXQgZGVmYXVsdHMgPSBPYmplY3QuYXNzaWduKE9iamVjdC5hc3NpZ24oe30sIHV0aWxzXzEuVXRpbHMuY2xvbmVEZWVwKHR5cGVzXzEuZ3JpZERlZmF1bHRzKSksIHsgY29sdW1uOiB1dGlsc18xLlV0aWxzLnRvTnVtYmVyKGVsLmdldEF0dHJpYnV0ZSgnZ3MtY29sdW1uJykpIHx8IHR5cGVzXzEuZ3JpZERlZmF1bHRzLmNvbHVtbiwgbWluUm93OiByb3dBdHRyID8gcm93QXR0ciA6IHV0aWxzXzEuVXRpbHMudG9OdW1iZXIoZWwuZ2V0QXR0cmlidXRlKCdncy1taW4tcm93JykpIHx8IHR5cGVzXzEuZ3JpZERlZmF1bHRzLm1pblJvdywgbWF4Um93OiByb3dBdHRyID8gcm93QXR0ciA6IHV0aWxzXzEuVXRpbHMudG9OdW1iZXIoZWwuZ2V0QXR0cmlidXRlKCdncy1tYXgtcm93JykpIHx8IHR5cGVzXzEuZ3JpZERlZmF1bHRzLm1heFJvdywgc3RhdGljR3JpZDogdXRpbHNfMS5VdGlscy50b0Jvb2woZWwuZ2V0QXR0cmlidXRlKCdncy1zdGF0aWMnKSkgfHwgdHlwZXNfMS5ncmlkRGVmYXVsdHMuc3RhdGljR3JpZCwgZHJhZ2dhYmxlOiB7XHJcbiAgICAgICAgICAgICAgICBoYW5kbGU6IChvcHRzLmhhbmRsZUNsYXNzID8gJy4nICsgb3B0cy5oYW5kbGVDbGFzcyA6IChvcHRzLmhhbmRsZSA/IG9wdHMuaGFuZGxlIDogJycpKSB8fCB0eXBlc18xLmdyaWREZWZhdWx0cy5kcmFnZ2FibGUuaGFuZGxlLFxyXG4gICAgICAgICAgICB9LCByZW1vdmFibGVPcHRpb25zOiB7XHJcbiAgICAgICAgICAgICAgICBhY2NlcHQ6IG9wdHMuaXRlbUNsYXNzID8gJy4nICsgb3B0cy5pdGVtQ2xhc3MgOiB0eXBlc18xLmdyaWREZWZhdWx0cy5yZW1vdmFibGVPcHRpb25zLmFjY2VwdCxcclxuICAgICAgICAgICAgfSB9KTtcclxuICAgICAgICBpZiAoZWwuZ2V0QXR0cmlidXRlKCdncy1hbmltYXRlJykpIHsgLy8gZGVmYXVsdCB0byB0cnVlLCBidXQgaWYgc2V0IHRvIGZhbHNlIHVzZSB0aGF0IGluc3RlYWRcclxuICAgICAgICAgICAgZGVmYXVsdHMuYW5pbWF0ZSA9IHV0aWxzXzEuVXRpbHMudG9Cb29sKGVsLmdldEF0dHJpYnV0ZSgnZ3MtYW5pbWF0ZScpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5vcHRzID0gdXRpbHNfMS5VdGlscy5kZWZhdWx0cyhvcHRzLCBkZWZhdWx0cyk7XHJcbiAgICAgICAgb3B0cyA9IG51bGw7IC8vIG1ha2Ugc3VyZSB3ZSB1c2UgdGhpcy5vcHRzIGluc3RlYWRcclxuICAgICAgICB0aGlzLl9pbml0TWFyZ2luKCk7IC8vIHBhcnQgb2Ygc2V0dGluZ3MgZGVmYXVsdHMuLi5cclxuICAgICAgICAvLyBOb3cgY2hlY2sgaWYgd2UncmUgbG9hZGluZyBpbnRvIDEgY29sdW1uIG1vZGUgRklSU1Qgc28gd2UgZG9uJ3QgZG8gdW4tbmVjZXNzYXJ5IHdvcmsgKGxpa2UgY2VsbEhlaWdodCA9IHdpZHRoIC8gMTIgdGhlbiBnbyAxIGNvbHVtbilcclxuICAgICAgICBpZiAodGhpcy5vcHRzLmNvbHVtbiAhPT0gMSAmJiAhdGhpcy5vcHRzLmRpc2FibGVPbmVDb2x1bW5Nb2RlICYmIHRoaXMuX3dpZHRoT3JDb250YWluZXIoKSA8PSB0aGlzLm9wdHMub25lQ29sdW1uU2l6ZSkge1xyXG4gICAgICAgICAgICB0aGlzLl9wcmV2Q29sdW1uID0gdGhpcy5nZXRDb2x1bW4oKTtcclxuICAgICAgICAgICAgdGhpcy5vcHRzLmNvbHVtbiA9IDE7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLm9wdHMucnRsID09PSAnYXV0bycpIHtcclxuICAgICAgICAgICAgdGhpcy5vcHRzLnJ0bCA9IChlbC5zdHlsZS5kaXJlY3Rpb24gPT09ICdydGwnKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMub3B0cy5ydGwpIHtcclxuICAgICAgICAgICAgdGhpcy5lbC5jbGFzc0xpc3QuYWRkKCdncmlkLXN0YWNrLXJ0bCcpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBjaGVjayBpZiB3ZSdyZSBiZWVuIG5lc3RlZCwgYW5kIGlmIHNvIHVwZGF0ZSBvdXIgc3R5bGUgYW5kIGtlZXAgcG9pbnRlciBhcm91bmQgKHVzZWQgZHVyaW5nIHNhdmUpXHJcbiAgICAgICAgbGV0IHBhcmVudEdyaWRJdGVtID0gKF9hID0gdXRpbHNfMS5VdGlscy5jbG9zZXN0VXBCeUNsYXNzKHRoaXMuZWwsIHR5cGVzXzEuZ3JpZERlZmF1bHRzLml0ZW1DbGFzcykpID09PSBudWxsIHx8IF9hID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfYS5ncmlkc3RhY2tOb2RlO1xyXG4gICAgICAgIGlmIChwYXJlbnRHcmlkSXRlbSkge1xyXG4gICAgICAgICAgICBwYXJlbnRHcmlkSXRlbS5zdWJHcmlkID0gdGhpcztcclxuICAgICAgICAgICAgdGhpcy5wYXJlbnRHcmlkSXRlbSA9IHBhcmVudEdyaWRJdGVtO1xyXG4gICAgICAgICAgICB0aGlzLmVsLmNsYXNzTGlzdC5hZGQoJ2dyaWQtc3RhY2stbmVzdGVkJyk7XHJcbiAgICAgICAgICAgIHBhcmVudEdyaWRJdGVtLmVsLmNsYXNzTGlzdC5hZGQoJ2dyaWQtc3RhY2stc3ViLWdyaWQnKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5faXNBdXRvQ2VsbEhlaWdodCA9ICh0aGlzLm9wdHMuY2VsbEhlaWdodCA9PT0gJ2F1dG8nKTtcclxuICAgICAgICBpZiAodGhpcy5faXNBdXRvQ2VsbEhlaWdodCB8fCB0aGlzLm9wdHMuY2VsbEhlaWdodCA9PT0gJ2luaXRpYWwnKSB7XHJcbiAgICAgICAgICAgIC8vIG1ha2UgdGhlIGNlbGwgY29udGVudCBzcXVhcmUgaW5pdGlhbGx5ICh3aWxsIHVzZSByZXNpemUvY29sdW1uIGV2ZW50IHRvIGtlZXAgaXQgc3F1YXJlKVxyXG4gICAgICAgICAgICB0aGlzLmNlbGxIZWlnaHQodW5kZWZpbmVkLCBmYWxzZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAvLyBhcHBlbmQgdW5pdCBpZiBhbnkgYXJlIHNldFxyXG4gICAgICAgICAgICBpZiAodHlwZW9mIHRoaXMub3B0cy5jZWxsSGVpZ2h0ID09ICdudW1iZXInICYmIHRoaXMub3B0cy5jZWxsSGVpZ2h0VW5pdCAmJiB0aGlzLm9wdHMuY2VsbEhlaWdodFVuaXQgIT09IHR5cGVzXzEuZ3JpZERlZmF1bHRzLmNlbGxIZWlnaHRVbml0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm9wdHMuY2VsbEhlaWdodCA9IHRoaXMub3B0cy5jZWxsSGVpZ2h0ICsgdGhpcy5vcHRzLmNlbGxIZWlnaHRVbml0O1xyXG4gICAgICAgICAgICAgICAgZGVsZXRlIHRoaXMub3B0cy5jZWxsSGVpZ2h0VW5pdDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLmNlbGxIZWlnaHQodGhpcy5vcHRzLmNlbGxIZWlnaHQsIGZhbHNlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gc2VlIGlmIHdlIG5lZWQgdG8gYWRqdXN0IGF1dG8taGlkZVxyXG4gICAgICAgIGlmICh0aGlzLm9wdHMuYWx3YXlzU2hvd1Jlc2l6ZUhhbmRsZSA9PT0gJ21vYmlsZScpIHtcclxuICAgICAgICAgICAgdGhpcy5vcHRzLmFsd2F5c1Nob3dSZXNpemVIYW5kbGUgPSBkZF90b3VjaF8xLmlzVG91Y2g7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX3N0eWxlU2hlZXRDbGFzcyA9ICdncmlkLXN0YWNrLWluc3RhbmNlLScgKyBncmlkc3RhY2tfZW5naW5lXzEuR3JpZFN0YWNrRW5naW5lLl9pZFNlcSsrO1xyXG4gICAgICAgIHRoaXMuZWwuY2xhc3NMaXN0LmFkZCh0aGlzLl9zdHlsZVNoZWV0Q2xhc3MpO1xyXG4gICAgICAgIHRoaXMuX3NldFN0YXRpY0NsYXNzKCk7XHJcbiAgICAgICAgbGV0IGVuZ2luZUNsYXNzID0gdGhpcy5vcHRzLmVuZ2luZUNsYXNzIHx8IEdyaWRTdGFjay5lbmdpbmVDbGFzcyB8fCBncmlkc3RhY2tfZW5naW5lXzEuR3JpZFN0YWNrRW5naW5lO1xyXG4gICAgICAgIHRoaXMuZW5naW5lID0gbmV3IGVuZ2luZUNsYXNzKHtcclxuICAgICAgICAgICAgY29sdW1uOiB0aGlzLmdldENvbHVtbigpLFxyXG4gICAgICAgICAgICBmbG9hdDogdGhpcy5vcHRzLmZsb2F0LFxyXG4gICAgICAgICAgICBtYXhSb3c6IHRoaXMub3B0cy5tYXhSb3csXHJcbiAgICAgICAgICAgIG9uQ2hhbmdlOiAoY2JOb2RlcykgPT4ge1xyXG4gICAgICAgICAgICAgICAgbGV0IG1heEggPSAwO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5lbmdpbmUubm9kZXMuZm9yRWFjaChuID0+IHsgbWF4SCA9IE1hdGgubWF4KG1heEgsIG4ueSArIG4uaCk7IH0pO1xyXG4gICAgICAgICAgICAgICAgY2JOb2Rlcy5mb3JFYWNoKG4gPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBlbCA9IG4uZWw7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFlbClcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChuLl9yZW1vdmVET00pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVsKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWwucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBuLl9yZW1vdmVET007XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl93cml0ZVBvc0F0dHIoZWwsIG4pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fdXBkYXRlU3R5bGVzKGZhbHNlLCBtYXhIKTsgLy8gZmFsc2UgPSBkb24ndCByZWNyZWF0ZSwganVzdCBhcHBlbmQgaWYgbmVlZCBiZVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgaWYgKHRoaXMub3B0cy5hdXRvKSB7XHJcbiAgICAgICAgICAgIHRoaXMuYmF0Y2hVcGRhdGUoKTsgLy8gcHJldmVudCBpbiBiZXR3ZWVuIHJlLWxheW91dCAjMTUzNSBUT0RPOiB0aGlzIG9ubHkgc2V0IGZsb2F0PXRydWUsIG5lZWQgdG8gcHJldmVudCBjb2xsaXNpb24gY2hlY2suLi5cclxuICAgICAgICAgICAgdGhpcy5nZXRHcmlkSXRlbXMoKS5mb3JFYWNoKGVsID0+IHRoaXMuX3ByZXBhcmVFbGVtZW50KGVsKSk7XHJcbiAgICAgICAgICAgIHRoaXMuYmF0Y2hVcGRhdGUoZmFsc2UpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBsb2FkIGFueSBwYXNzZWQgaW4gY2hpbGRyZW4gYXMgd2VsbCwgd2hpY2ggb3ZlcnJpZGVzIGFueSBET00gbGF5b3V0IGRvbmUgYWJvdmVcclxuICAgICAgICBpZiAodGhpcy5vcHRzLmNoaWxkcmVuKSB7XHJcbiAgICAgICAgICAgIGxldCBjaGlsZHJlbiA9IHRoaXMub3B0cy5jaGlsZHJlbjtcclxuICAgICAgICAgICAgZGVsZXRlIHRoaXMub3B0cy5jaGlsZHJlbjtcclxuICAgICAgICAgICAgaWYgKGNoaWxkcmVuLmxlbmd0aClcclxuICAgICAgICAgICAgICAgIHRoaXMubG9hZChjaGlsZHJlbik7IC8vIGRvbid0IGxvYWQgZW1wdHlcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5zZXRBbmltYXRpb24odGhpcy5vcHRzLmFuaW1hdGUpO1xyXG4gICAgICAgIHRoaXMuX3VwZGF0ZVN0eWxlcygpO1xyXG4gICAgICAgIGlmICh0aGlzLm9wdHMuY29sdW1uICE9IDEyKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZWwuY2xhc3NMaXN0LmFkZCgnZ3JpZC1zdGFjay0nICsgdGhpcy5vcHRzLmNvbHVtbik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIGxlZ2FjeSBzdXBwb3J0IHRvIGFwcGVhciAncGVyIGdyaWRgIG9wdGlvbnMgd2hlbiByZWFsbHkgZ2xvYmFsLlxyXG4gICAgICAgIGlmICh0aGlzLm9wdHMuZHJhZ0luKVxyXG4gICAgICAgICAgICBHcmlkU3RhY2suc2V0dXBEcmFnSW4odGhpcy5vcHRzLmRyYWdJbiwgdGhpcy5vcHRzLmRyYWdJbk9wdGlvbnMpO1xyXG4gICAgICAgIGRlbGV0ZSB0aGlzLm9wdHMuZHJhZ0luO1xyXG4gICAgICAgIGRlbGV0ZSB0aGlzLm9wdHMuZHJhZ0luT3B0aW9ucztcclxuICAgICAgICAvLyBkeW5hbWljIGdyaWRzIHJlcXVpcmUgcGF1c2luZyBkdXJpbmcgZHJhZyB0byBkZXRlY3Qgb3ZlciB0byBuZXN0IHZzIHB1c2hcclxuICAgICAgICBpZiAodGhpcy5vcHRzLnN1YkdyaWREeW5hbWljICYmICFkZF9tYW5hZ2VyXzEuRERNYW5hZ2VyLnBhdXNlRHJhZylcclxuICAgICAgICAgICAgZGRfbWFuYWdlcl8xLkRETWFuYWdlci5wYXVzZURyYWcgPSB0cnVlO1xyXG4gICAgICAgIGlmICgoKF9iID0gdGhpcy5vcHRzLmRyYWdnYWJsZSkgPT09IG51bGwgfHwgX2IgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9iLnBhdXNlKSAhPT0gdW5kZWZpbmVkKVxyXG4gICAgICAgICAgICBkZF9tYW5hZ2VyXzEuRERNYW5hZ2VyLnBhdXNlRHJhZyA9IHRoaXMub3B0cy5kcmFnZ2FibGUucGF1c2U7XHJcbiAgICAgICAgdGhpcy5fc2V0dXBSZW1vdmVEcm9wKCk7XHJcbiAgICAgICAgdGhpcy5fc2V0dXBBY2NlcHRXaWRnZXQoKTtcclxuICAgICAgICB0aGlzLl91cGRhdGVXaW5kb3dSZXNpemVFdmVudCgpO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBpbml0aWFsaXppbmcgdGhlIEhUTUwgZWxlbWVudCwgb3Igc2VsZWN0b3Igc3RyaW5nLCBpbnRvIGEgZ3JpZCB3aWxsIHJldHVybiB0aGUgZ3JpZC4gQ2FsbGluZyBpdCBhZ2FpbiB3aWxsXHJcbiAgICAgKiBzaW1wbHkgcmV0dXJuIHRoZSBleGlzdGluZyBpbnN0YW5jZSAoaWdub3JlIGFueSBwYXNzZWQgb3B0aW9ucykuIFRoZXJlIGlzIGFsc28gYW4gaW5pdEFsbCgpIHZlcnNpb24gdGhhdCBzdXBwb3J0XHJcbiAgICAgKiBtdWx0aXBsZSBncmlkcyBpbml0aWFsaXphdGlvbiBhdCBvbmNlLiBPciB5b3UgY2FuIHVzZSBhZGRHcmlkKCkgdG8gY3JlYXRlIHRoZSBlbnRpcmUgZ3JpZCBmcm9tIEpTT04uXHJcbiAgICAgKiBAcGFyYW0gb3B0aW9ucyBncmlkIG9wdGlvbnMgKG9wdGlvbmFsKVxyXG4gICAgICogQHBhcmFtIGVsT3JTdHJpbmcgZWxlbWVudCBvciBDU1Mgc2VsZWN0b3IgKGZpcnN0IG9uZSB1c2VkKSB0byBjb252ZXJ0IHRvIGEgZ3JpZCAoZGVmYXVsdCB0byAnLmdyaWQtc3RhY2snIGNsYXNzIHNlbGVjdG9yKVxyXG4gICAgICpcclxuICAgICAqIEBleGFtcGxlXHJcbiAgICAgKiBsZXQgZ3JpZCA9IEdyaWRTdGFjay5pbml0KCk7XHJcbiAgICAgKlxyXG4gICAgICogTm90ZTogdGhlIEhUTUxFbGVtZW50IChvZiB0eXBlIEdyaWRIVE1MRWxlbWVudCkgd2lsbCBzdG9yZSBhIGBncmlkc3RhY2s6IEdyaWRTdGFja2AgdmFsdWUgdGhhdCBjYW4gYmUgcmV0cmlldmUgbGF0ZXJcclxuICAgICAqIGxldCBncmlkID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmdyaWQtc3RhY2snKS5ncmlkc3RhY2s7XHJcbiAgICAgKi9cclxuICAgIHN0YXRpYyBpbml0KG9wdGlvbnMgPSB7fSwgZWxPclN0cmluZyA9ICcuZ3JpZC1zdGFjaycpIHtcclxuICAgICAgICBsZXQgZWwgPSBHcmlkU3RhY2suZ2V0R3JpZEVsZW1lbnQoZWxPclN0cmluZyk7XHJcbiAgICAgICAgaWYgKCFlbCkge1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIGVsT3JTdHJpbmcgPT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdHcmlkU3RhY2suaW5pdEFsbCgpIG5vIGdyaWQgd2FzIGZvdW5kIHdpdGggc2VsZWN0b3IgXCInICsgZWxPclN0cmluZyArICdcIiAtIGVsZW1lbnQgbWlzc2luZyBvciB3cm9uZyBzZWxlY3RvciA/JyArXHJcbiAgICAgICAgICAgICAgICAgICAgJ1xcbk5vdGU6IFwiLmdyaWQtc3RhY2tcIiBpcyByZXF1aXJlZCBmb3IgcHJvcGVyIENTUyBzdHlsaW5nIGFuZCBkcmFnL2Ryb3AsIGFuZCBpcyB0aGUgZGVmYXVsdCBzZWxlY3Rvci4nKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0dyaWRTdGFjay5pbml0KCkgbm8gZ3JpZCBlbGVtZW50IHdhcyBwYXNzZWQuJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghZWwuZ3JpZHN0YWNrKSB7XHJcbiAgICAgICAgICAgIGVsLmdyaWRzdGFjayA9IG5ldyBHcmlkU3RhY2soZWwsIHV0aWxzXzEuVXRpbHMuY2xvbmVEZWVwKG9wdGlvbnMpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGVsLmdyaWRzdGFjaztcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogV2lsbCBpbml0aWFsaXplIGEgbGlzdCBvZiBlbGVtZW50cyAoZ2l2ZW4gYSBzZWxlY3RvcikgYW5kIHJldHVybiBhbiBhcnJheSBvZiBncmlkcy5cclxuICAgICAqIEBwYXJhbSBvcHRpb25zIGdyaWQgb3B0aW9ucyAob3B0aW9uYWwpXHJcbiAgICAgKiBAcGFyYW0gc2VsZWN0b3IgZWxlbWVudHMgc2VsZWN0b3IgdG8gY29udmVydCB0byBncmlkcyAoZGVmYXVsdCB0byAnLmdyaWQtc3RhY2snIGNsYXNzIHNlbGVjdG9yKVxyXG4gICAgICpcclxuICAgICAqIEBleGFtcGxlXHJcbiAgICAgKiBsZXQgZ3JpZHMgPSBHcmlkU3RhY2suaW5pdEFsbCgpO1xyXG4gICAgICogZ3JpZHMuZm9yRWFjaCguLi4pXHJcbiAgICAgKi9cclxuICAgIHN0YXRpYyBpbml0QWxsKG9wdGlvbnMgPSB7fSwgc2VsZWN0b3IgPSAnLmdyaWQtc3RhY2snKSB7XHJcbiAgICAgICAgbGV0IGdyaWRzID0gW107XHJcbiAgICAgICAgR3JpZFN0YWNrLmdldEdyaWRFbGVtZW50cyhzZWxlY3RvcikuZm9yRWFjaChlbCA9PiB7XHJcbiAgICAgICAgICAgIGlmICghZWwuZ3JpZHN0YWNrKSB7XHJcbiAgICAgICAgICAgICAgICBlbC5ncmlkc3RhY2sgPSBuZXcgR3JpZFN0YWNrKGVsLCB1dGlsc18xLlV0aWxzLmNsb25lRGVlcChvcHRpb25zKSk7XHJcbiAgICAgICAgICAgICAgICBkZWxldGUgb3B0aW9ucy5kcmFnSW47XHJcbiAgICAgICAgICAgICAgICBkZWxldGUgb3B0aW9ucy5kcmFnSW5PcHRpb25zOyAvLyBvbmx5IG5lZWQgdG8gYmUgZG9uZSBvbmNlIChyZWFsbHkgYSBzdGF0aWMgZ2xvYmFsIHRoaW5nLCBub3QgcGVyIGdyaWQpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZ3JpZHMucHVzaChlbC5ncmlkc3RhY2spO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGlmIChncmlkcy5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcignR3JpZFN0YWNrLmluaXRBbGwoKSBubyBncmlkIHdhcyBmb3VuZCB3aXRoIHNlbGVjdG9yIFwiJyArIHNlbGVjdG9yICsgJ1wiIC0gZWxlbWVudCBtaXNzaW5nIG9yIHdyb25nIHNlbGVjdG9yID8nICtcclxuICAgICAgICAgICAgICAgICdcXG5Ob3RlOiBcIi5ncmlkLXN0YWNrXCIgaXMgcmVxdWlyZWQgZm9yIHByb3BlciBDU1Mgc3R5bGluZyBhbmQgZHJhZy9kcm9wLCBhbmQgaXMgdGhlIGRlZmF1bHQgc2VsZWN0b3IuJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBncmlkcztcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogY2FsbCB0byBjcmVhdGUgYSBncmlkIHdpdGggdGhlIGdpdmVuIG9wdGlvbnMsIGluY2x1ZGluZyBsb2FkaW5nIGFueSBjaGlsZHJlbiBmcm9tIEpTT04gc3RydWN0dXJlLiBUaGlzIHdpbGwgY2FsbCBHcmlkU3RhY2suaW5pdCgpLCB0aGVuXHJcbiAgICAgKiBncmlkLmxvYWQoKSBvbiBhbnkgcGFzc2VkIGNoaWxkcmVuIChyZWN1cnNpdmVseSkuIEdyZWF0IGFsdGVybmF0aXZlIHRvIGNhbGxpbmcgaW5pdCgpIGlmIHlvdSB3YW50IGVudGlyZSBncmlkIHRvIGNvbWUgZnJvbVxyXG4gICAgICogSlNPTiBzZXJpYWxpemVkIGRhdGEsIGluY2x1ZGluZyBvcHRpb25zLlxyXG4gICAgICogQHBhcmFtIHBhcmVudCBIVE1MIGVsZW1lbnQgcGFyZW50IHRvIHRoZSBncmlkXHJcbiAgICAgKiBAcGFyYW0gb3B0IGdyaWRzIG9wdGlvbnMgdXNlZCB0byBpbml0aWFsaXplIHRoZSBncmlkLCBhbmQgbGlzdCBvZiBjaGlsZHJlblxyXG4gICAgICovXHJcbiAgICBzdGF0aWMgYWRkR3JpZChwYXJlbnQsIG9wdCA9IHt9KSB7XHJcbiAgICAgICAgaWYgKCFwYXJlbnQpXHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIC8vIGNyZWF0ZSB0aGUgZ3JpZCBlbGVtZW50LCBidXQgY2hlY2sgaWYgdGhlIHBhc3NlZCAncGFyZW50JyBhbHJlYWR5IGhhcyBncmlkIHN0eWxpbmcgYW5kIHNob3VsZCBiZSB1c2VkIGluc3RlYWRcclxuICAgICAgICBsZXQgZWwgPSBwYXJlbnQ7XHJcbiAgICAgICAgY29uc3QgcGFyZW50SXNHcmlkID0gcGFyZW50LmNsYXNzTGlzdC5jb250YWlucygnZ3JpZC1zdGFjaycpO1xyXG4gICAgICAgIGlmICghcGFyZW50SXNHcmlkIHx8IG9wdC5hZGRSZW1vdmVDQikge1xyXG4gICAgICAgICAgICBpZiAob3B0LmFkZFJlbW92ZUNCKSB7XHJcbiAgICAgICAgICAgICAgICBlbCA9IG9wdC5hZGRSZW1vdmVDQihwYXJlbnQsIG9wdCwgdHJ1ZSwgdHJ1ZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgZG9jID0gZG9jdW1lbnQuaW1wbGVtZW50YXRpb24uY3JlYXRlSFRNTERvY3VtZW50KCcnKTsgLy8gSUUgbmVlZHMgYSBwYXJhbVxyXG4gICAgICAgICAgICAgICAgZG9jLmJvZHkuaW5uZXJIVE1MID0gYDxkaXYgY2xhc3M9XCJncmlkLXN0YWNrICR7b3B0LmNsYXNzIHx8ICcnfVwiPjwvZGl2PmA7XHJcbiAgICAgICAgICAgICAgICBlbCA9IGRvYy5ib2R5LmNoaWxkcmVuWzBdO1xyXG4gICAgICAgICAgICAgICAgcGFyZW50LmFwcGVuZENoaWxkKGVsKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBjcmVhdGUgZ3JpZCBjbGFzcyBhbmQgbG9hZCBhbnkgY2hpbGRyZW5cclxuICAgICAgICBsZXQgZ3JpZCA9IEdyaWRTdGFjay5pbml0KG9wdCwgZWwpO1xyXG4gICAgICAgIHJldHVybiBncmlkO1xyXG4gICAgfVxyXG4gICAgLyoqIGNhbGwgdGhpcyBtZXRob2QgdG8gcmVnaXN0ZXIgeW91ciBlbmdpbmUgaW5zdGVhZCBvZiB0aGUgZGVmYXVsdCBvbmUuXHJcbiAgICAgKiBTZWUgaW5zdGVhZCBgR3JpZFN0YWNrT3B0aW9ucy5lbmdpbmVDbGFzc2AgaWYgeW91IG9ubHkgbmVlZCB0b1xyXG4gICAgICogcmVwbGFjZSBqdXN0IG9uZSBpbnN0YW5jZS5cclxuICAgICAqL1xyXG4gICAgc3RhdGljIHJlZ2lzdGVyRW5naW5lKGVuZ2luZUNsYXNzKSB7XHJcbiAgICAgICAgR3JpZFN0YWNrLmVuZ2luZUNsYXNzID0gZW5naW5lQ2xhc3M7XHJcbiAgICB9XHJcbiAgICAvKiogQGludGVybmFsIGNyZWF0ZSBwbGFjZWhvbGRlciBESVYgYXMgbmVlZGVkICovXHJcbiAgICBnZXQgcGxhY2Vob2xkZXIoKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9wbGFjZWhvbGRlcikge1xyXG4gICAgICAgICAgICBsZXQgcGxhY2Vob2xkZXJDaGlsZCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpOyAvLyBjaGlsZCBzbyBwYWRkaW5nIG1hdGNoIGl0ZW0tY29udGVudFxyXG4gICAgICAgICAgICBwbGFjZWhvbGRlckNoaWxkLmNsYXNzTmFtZSA9ICdwbGFjZWhvbGRlci1jb250ZW50JztcclxuICAgICAgICAgICAgaWYgKHRoaXMub3B0cy5wbGFjZWhvbGRlclRleHQpIHtcclxuICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyQ2hpbGQuaW5uZXJIVE1MID0gdGhpcy5vcHRzLnBsYWNlaG9sZGVyVGV4dDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLl9wbGFjZWhvbGRlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gICAgICAgICAgICB0aGlzLl9wbGFjZWhvbGRlci5jbGFzc0xpc3QuYWRkKHRoaXMub3B0cy5wbGFjZWhvbGRlckNsYXNzLCB0eXBlc18xLmdyaWREZWZhdWx0cy5pdGVtQ2xhc3MsIHRoaXMub3B0cy5pdGVtQ2xhc3MpO1xyXG4gICAgICAgICAgICB0aGlzLnBsYWNlaG9sZGVyLmFwcGVuZENoaWxkKHBsYWNlaG9sZGVyQ2hpbGQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcy5fcGxhY2Vob2xkZXI7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIGFkZCBhIG5ldyB3aWRnZXQgYW5kIHJldHVybnMgaXQuXHJcbiAgICAgKlxyXG4gICAgICogV2lkZ2V0IHdpbGwgYmUgYWx3YXlzIHBsYWNlZCBldmVuIGlmIHJlc3VsdCBoZWlnaHQgaXMgbW9yZSB0aGFuIGFjdHVhbCBncmlkIGhlaWdodC5cclxuICAgICAqIFlvdSBuZWVkIHRvIHVzZSBgd2lsbEl0Rml0KClgIGJlZm9yZSBjYWxsaW5nIGFkZFdpZGdldCBmb3IgYWRkaXRpb25hbCBjaGVjay5cclxuICAgICAqIFNlZSBhbHNvIGBtYWtlV2lkZ2V0KClgLlxyXG4gICAgICpcclxuICAgICAqIEBleGFtcGxlXHJcbiAgICAgKiBsZXQgZ3JpZCA9IEdyaWRTdGFjay5pbml0KCk7XHJcbiAgICAgKiBncmlkLmFkZFdpZGdldCh7dzogMywgY29udGVudDogJ2hlbGxvJ30pO1xyXG4gICAgICogZ3JpZC5hZGRXaWRnZXQoJzxkaXYgY2xhc3M9XCJncmlkLXN0YWNrLWl0ZW1cIj48ZGl2IGNsYXNzPVwiZ3JpZC1zdGFjay1pdGVtLWNvbnRlbnRcIj5oZWxsbzwvZGl2PjwvZGl2PicsIHt3OiAzfSk7XHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIGVsICBHcmlkU3RhY2tXaWRnZXQgKHdoaWNoIGNhbiBoYXZlIGNvbnRlbnQgc3RyaW5nIGFzIHdlbGwpLCBodG1sIGVsZW1lbnQsIG9yIHN0cmluZyBkZWZpbml0aW9uIHRvIGFkZFxyXG4gICAgICogQHBhcmFtIG9wdGlvbnMgd2lkZ2V0IHBvc2l0aW9uL3NpemUgb3B0aW9ucyAob3B0aW9uYWwsIGFuZCBpZ25vcmUgaWYgZmlyc3QgcGFyYW0gaXMgYWxyZWFkeSBvcHRpb24pIC0gc2VlIEdyaWRTdGFja1dpZGdldFxyXG4gICAgICovXHJcbiAgICBhZGRXaWRnZXQoZWxzLCBvcHRpb25zKSB7XHJcbiAgICAgICAgZnVuY3Rpb24gaXNHcmlkU3RhY2tXaWRnZXQodykge1xyXG4gICAgICAgICAgICByZXR1cm4gdy5lbCAhPT0gdW5kZWZpbmVkIHx8IHcueCAhPT0gdW5kZWZpbmVkIHx8IHcueSAhPT0gdW5kZWZpbmVkIHx8IHcudyAhPT0gdW5kZWZpbmVkIHx8IHcuaCAhPT0gdW5kZWZpbmVkIHx8IHcuY29udGVudCAhPT0gdW5kZWZpbmVkID8gdHJ1ZSA6IGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgZWw7XHJcbiAgICAgICAgbGV0IG5vZGU7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBlbHMgPT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICAgIGxldCBkb2MgPSBkb2N1bWVudC5pbXBsZW1lbnRhdGlvbi5jcmVhdGVIVE1MRG9jdW1lbnQoJycpOyAvLyBJRSBuZWVkcyBhIHBhcmFtXHJcbiAgICAgICAgICAgIGRvYy5ib2R5LmlubmVySFRNTCA9IGVscztcclxuICAgICAgICAgICAgZWwgPSBkb2MuYm9keS5jaGlsZHJlblswXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMCB8fCBhcmd1bWVudHMubGVuZ3RoID09PSAxICYmIGlzR3JpZFN0YWNrV2lkZ2V0KGVscykpIHtcclxuICAgICAgICAgICAgbm9kZSA9IG9wdGlvbnMgPSBlbHM7XHJcbiAgICAgICAgICAgIGlmIChub2RlID09PSBudWxsIHx8IG5vZGUgPT09IHZvaWQgMCA/IHZvaWQgMCA6IG5vZGUuZWwpIHtcclxuICAgICAgICAgICAgICAgIGVsID0gbm9kZS5lbDsgLy8gcmUtdXNlIGVsZW1lbnQgc3RvcmVkIGluIHRoZSBub2RlXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAodGhpcy5vcHRzLmFkZFJlbW92ZUNCKSB7XHJcbiAgICAgICAgICAgICAgICBlbCA9IHRoaXMub3B0cy5hZGRSZW1vdmVDQih0aGlzLmVsLCBvcHRpb25zLCB0cnVlLCBmYWxzZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgY29udGVudCA9IChvcHRpb25zID09PSBudWxsIHx8IG9wdGlvbnMgPT09IHZvaWQgMCA/IHZvaWQgMCA6IG9wdGlvbnMuY29udGVudCkgfHwgJyc7XHJcbiAgICAgICAgICAgICAgICBsZXQgZG9jID0gZG9jdW1lbnQuaW1wbGVtZW50YXRpb24uY3JlYXRlSFRNTERvY3VtZW50KCcnKTsgLy8gSUUgbmVlZHMgYSBwYXJhbVxyXG4gICAgICAgICAgICAgICAgZG9jLmJvZHkuaW5uZXJIVE1MID0gYDxkaXYgY2xhc3M9XCJncmlkLXN0YWNrLWl0ZW0gJHt0aGlzLm9wdHMuaXRlbUNsYXNzIHx8ICcnfVwiPjxkaXYgY2xhc3M9XCJncmlkLXN0YWNrLWl0ZW0tY29udGVudFwiPiR7Y29udGVudH08L2Rpdj48L2Rpdj5gO1xyXG4gICAgICAgICAgICAgICAgZWwgPSBkb2MuYm9keS5jaGlsZHJlblswXTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgZWwgPSBlbHM7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghZWwpXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAvLyBUZW1wdGluZyB0byBpbml0aWFsaXplIHRoZSBwYXNzZWQgaW4gb3B0IHdpdGggZGVmYXVsdCBhbmQgdmFsaWQgdmFsdWVzLCBidXQgdGhpcyBicmVhayBrbm9ja291dCBkZW1vc1xyXG4gICAgICAgIC8vIGFzIHRoZSBhY3R1YWwgdmFsdWUgYXJlIGZpbGxlZCBpbiB3aGVuIF9wcmVwYXJlRWxlbWVudCgpIGNhbGxzIGVsLmdldEF0dHJpYnV0ZSgnZ3MteHl6JykgYmVmb3JlIGFkZGluZyB0aGUgbm9kZS5cclxuICAgICAgICAvLyBTbyBtYWtlIHN1cmUgd2UgbG9hZCBhbnkgRE9NIGF0dHJpYnV0ZXMgdGhhdCBhcmUgbm90IHNwZWNpZmllZCBpbiBwYXNzZWQgaW4gb3B0aW9ucyAod2hpY2ggb3ZlcnJpZGUpXHJcbiAgICAgICAgbGV0IGRvbUF0dHIgPSB0aGlzLl9yZWFkQXR0cihlbCk7XHJcbiAgICAgICAgb3B0aW9ucyA9IHV0aWxzXzEuVXRpbHMuY2xvbmVEZWVwKG9wdGlvbnMpIHx8IHt9OyAvLyBtYWtlIGEgY29weSBiZWZvcmUgd2UgbW9kaWZ5IGluIGNhc2UgY2FsbGVyIHJlLXVzZXMgaXRcclxuICAgICAgICB1dGlsc18xLlV0aWxzLmRlZmF1bHRzKG9wdGlvbnMsIGRvbUF0dHIpO1xyXG4gICAgICAgIG5vZGUgPSB0aGlzLmVuZ2luZS5wcmVwYXJlTm9kZShvcHRpb25zKTtcclxuICAgICAgICB0aGlzLl93cml0ZUF0dHIoZWwsIG9wdGlvbnMpO1xyXG4gICAgICAgIGlmICh0aGlzLl9pbnNlcnROb3RBcHBlbmQpIHtcclxuICAgICAgICAgICAgdGhpcy5lbC5wcmVwZW5kKGVsKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuZWwuYXBwZW5kQ2hpbGQoZWwpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBzaW1pbGFyIHRvIG1ha2VXaWRnZXQoKSB0aGF0IGRvZXNuJ3QgcmVhZCBhdHRyIGFnYWluIGFuZCB3b3JzZSByZS1jcmVhdGUgYSBuZXcgbm9kZSBhbmQgbG9vc2UgYW55IF9pZFxyXG4gICAgICAgIHRoaXMuX3ByZXBhcmVFbGVtZW50KGVsLCB0cnVlLCBvcHRpb25zKTtcclxuICAgICAgICB0aGlzLl91cGRhdGVDb250YWluZXJIZWlnaHQoKTtcclxuICAgICAgICAvLyBzZWUgaWYgdGhlcmUgaXMgYSBzdWItZ3JpZCB0byBjcmVhdGVcclxuICAgICAgICBpZiAobm9kZS5zdWJHcmlkKSB7XHJcbiAgICAgICAgICAgIHRoaXMubWFrZVN1YkdyaWQobm9kZS5lbCwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIGZhbHNlKTsgLy9ub2RlLnN1YkdyaWQgd2lsbCBiZSB1c2VkIGFzIG9wdGlvbiBpbiBtZXRob2QsIG5vIG5lZWQgdG8gcGFzc1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBpZiB3ZSdyZSBhZGRpbmcgYW4gaXRlbSBpbnRvIDEgY29sdW1uIChfcHJldkNvbHVtbiBpcyBzZXQgb25seSB3aGVuIGdvaW5nIHRvIDEpIG1ha2Ugc3VyZVxyXG4gICAgICAgIC8vIHdlIGRvbid0IG92ZXJyaWRlIHRoZSBsYXJnZXIgMTIgY29sdW1uIGxheW91dCB0aGF0IHdhcyBhbHJlYWR5IHNhdmVkLiAjMTk4NVxyXG4gICAgICAgIGlmICh0aGlzLl9wcmV2Q29sdW1uICYmIHRoaXMub3B0cy5jb2x1bW4gPT09IDEpIHtcclxuICAgICAgICAgICAgdGhpcy5faWdub3JlTGF5b3V0c05vZGVDaGFuZ2UgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl90cmlnZ2VyQWRkRXZlbnQoKTtcclxuICAgICAgICB0aGlzLl90cmlnZ2VyQ2hhbmdlRXZlbnQoKTtcclxuICAgICAgICBkZWxldGUgdGhpcy5faWdub3JlTGF5b3V0c05vZGVDaGFuZ2U7XHJcbiAgICAgICAgcmV0dXJuIGVsO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBDb252ZXJ0IGFuIGV4aXN0aW5nIGdyaWRJdGVtIGVsZW1lbnQgaW50byBhIHN1Yi1ncmlkIHdpdGggdGhlIGdpdmVuIChvcHRpb25hbCkgb3B0aW9ucywgZWxzZSBpbmhlcml0IHRoZW1cclxuICAgICAqIGZyb20gdGhlIHBhcmVudCdzIHN1YkdyaWQgb3B0aW9ucy5cclxuICAgICAqIEBwYXJhbSBlbCBncmlkSXRlbSBlbGVtZW50IHRvIGNvbnZlcnRcclxuICAgICAqIEBwYXJhbSBvcHMgKG9wdGlvbmFsKSBzdWItZ3JpZCBvcHRpb25zLCBlbHNlIGRlZmF1bHQgdG8gbm9kZSwgdGhlbiBwYXJlbnQgc2V0dGluZ3MsIGVsc2UgZGVmYXVsdHNcclxuICAgICAqIEBwYXJhbSBub2RlVG9BZGQgKG9wdGlvbmFsKSBub2RlIHRvIGFkZCB0byB0aGUgbmV3bHkgY3JlYXRlZCBzdWIgZ3JpZCAodXNlZCB3aGVuIGRyYWdnaW5nIG92ZXIgZXhpc3RpbmcgcmVndWxhciBpdGVtKVxyXG4gICAgICogQHJldHVybnMgbmV3bHkgY3JlYXRlZCBncmlkXHJcbiAgICAgKi9cclxuICAgIG1ha2VTdWJHcmlkKGVsLCBvcHMsIG5vZGVUb0FkZCwgc2F2ZUNvbnRlbnQgPSB0cnVlKSB7XHJcbiAgICAgICAgdmFyIF9hLCBfYiwgX2M7XHJcbiAgICAgICAgbGV0IG5vZGUgPSBlbC5ncmlkc3RhY2tOb2RlO1xyXG4gICAgICAgIGlmICghbm9kZSkge1xyXG4gICAgICAgICAgICBub2RlID0gdGhpcy5tYWtlV2lkZ2V0KGVsKS5ncmlkc3RhY2tOb2RlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoKF9hID0gbm9kZS5zdWJHcmlkKSA9PT0gbnVsbCB8fCBfYSA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2EuZWwpXHJcbiAgICAgICAgICAgIHJldHVybiBub2RlLnN1YkdyaWQ7IC8vIGFscmVhZHkgZG9uZVxyXG4gICAgICAgIC8vIGZpbmQgdGhlIHRlbXBsYXRlIHN1YkdyaWQgc3RvcmVkIG9uIGEgcGFyZW50IGFzIGZhbGxiYWNrLi4uXHJcbiAgICAgICAgbGV0IHN1YkdyaWRUZW1wbGF0ZTsgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby10aGlzLWFsaWFzXHJcbiAgICAgICAgbGV0IGdyaWQgPSB0aGlzO1xyXG4gICAgICAgIHdoaWxlIChncmlkICYmICFzdWJHcmlkVGVtcGxhdGUpIHtcclxuICAgICAgICAgICAgc3ViR3JpZFRlbXBsYXRlID0gKF9iID0gZ3JpZC5vcHRzKSA9PT0gbnVsbCB8fCBfYiA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2Iuc3ViR3JpZDtcclxuICAgICAgICAgICAgZ3JpZCA9IChfYyA9IGdyaWQucGFyZW50R3JpZEl0ZW0pID09PSBudWxsIHx8IF9jID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfYy5ncmlkO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLy4uLiBhbmQgc2V0IHRoZSBjcmVhdGUgb3B0aW9uc1xyXG4gICAgICAgIG9wcyA9IHV0aWxzXzEuVXRpbHMuY2xvbmVEZWVwKE9iamVjdC5hc3NpZ24oT2JqZWN0LmFzc2lnbihPYmplY3QuYXNzaWduKHt9LCAoc3ViR3JpZFRlbXBsYXRlIHx8IHt9KSksIHsgY2hpbGRyZW46IHVuZGVmaW5lZCB9KSwgKG9wcyB8fCBub2RlLnN1YkdyaWQpKSk7XHJcbiAgICAgICAgbm9kZS5zdWJHcmlkID0gb3BzO1xyXG4gICAgICAgIC8vIGlmIGNvbHVtbiBzcGVjaWFsIGNhc2UgaXQgc2V0LCByZW1lbWJlciB0aGF0IGZsYWcgYW5kIHNldCBkZWZhdWx0XHJcbiAgICAgICAgbGV0IGF1dG9Db2x1bW47XHJcbiAgICAgICAgaWYgKG9wcy5jb2x1bW4gPT09ICdhdXRvJykge1xyXG4gICAgICAgICAgICBhdXRvQ29sdW1uID0gdHJ1ZTtcclxuICAgICAgICAgICAgb3BzLmNvbHVtbiA9IE1hdGgubWF4KG5vZGUudyB8fCAxLCAobm9kZVRvQWRkID09PSBudWxsIHx8IG5vZGVUb0FkZCA9PT0gdm9pZCAwID8gdm9pZCAwIDogbm9kZVRvQWRkLncpIHx8IDEpO1xyXG4gICAgICAgICAgICBvcHMuZGlzYWJsZU9uZUNvbHVtbk1vZGUgPSB0cnVlOyAvLyBkcml2ZW4gYnkgcGFyZW50XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIGlmIHdlJ3JlIGNvbnZlcnRpbmcgYW4gZXhpc3RpbmcgZnVsbCBpdGVtLCBtb3ZlIG92ZXIgdGhlIGNvbnRlbnQgdG8gYmUgdGhlIGZpcnN0IHN1YiBpdGVtIGluIHRoZSBuZXcgZ3JpZFxyXG4gICAgICAgIGxldCBjb250ZW50ID0gbm9kZS5lbC5xdWVyeVNlbGVjdG9yKCcuZ3JpZC1zdGFjay1pdGVtLWNvbnRlbnQnKTtcclxuICAgICAgICBsZXQgbmV3SXRlbTtcclxuICAgICAgICBsZXQgbmV3SXRlbU9wdDtcclxuICAgICAgICBpZiAoc2F2ZUNvbnRlbnQpIHtcclxuICAgICAgICAgICAgdGhpcy5fcmVtb3ZlREQobm9kZS5lbCk7IC8vIHJlbW92ZSBEJkQgc2luY2UgaXQncyBzZXQgb24gY29udGVudCBkaXZcclxuICAgICAgICAgICAgbmV3SXRlbU9wdCA9IE9iamVjdC5hc3NpZ24oT2JqZWN0LmFzc2lnbih7fSwgbm9kZSksIHsgeDogMCwgeTogMCB9KTtcclxuICAgICAgICAgICAgdXRpbHNfMS5VdGlscy5yZW1vdmVJbnRlcm5hbEZvclNhdmUobmV3SXRlbU9wdCk7XHJcbiAgICAgICAgICAgIGRlbGV0ZSBuZXdJdGVtT3B0LnN1YkdyaWQ7XHJcbiAgICAgICAgICAgIGlmIChub2RlLmNvbnRlbnQpIHtcclxuICAgICAgICAgICAgICAgIG5ld0l0ZW1PcHQuY29udGVudCA9IG5vZGUuY29udGVudDtcclxuICAgICAgICAgICAgICAgIGRlbGV0ZSBub2RlLmNvbnRlbnQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHRoaXMub3B0cy5hZGRSZW1vdmVDQikge1xyXG4gICAgICAgICAgICAgICAgbmV3SXRlbSA9IHRoaXMub3B0cy5hZGRSZW1vdmVDQih0aGlzLmVsLCBuZXdJdGVtT3B0LCB0cnVlLCBmYWxzZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgZG9jID0gZG9jdW1lbnQuaW1wbGVtZW50YXRpb24uY3JlYXRlSFRNTERvY3VtZW50KCcnKTsgLy8gSUUgbmVlZHMgYSBwYXJhbVxyXG4gICAgICAgICAgICAgICAgZG9jLmJvZHkuaW5uZXJIVE1MID0gYDxkaXYgY2xhc3M9XCJncmlkLXN0YWNrLWl0ZW1cIj48L2Rpdj5gO1xyXG4gICAgICAgICAgICAgICAgbmV3SXRlbSA9IGRvYy5ib2R5LmNoaWxkcmVuWzBdO1xyXG4gICAgICAgICAgICAgICAgbmV3SXRlbS5hcHBlbmRDaGlsZChjb250ZW50KTtcclxuICAgICAgICAgICAgICAgIGRvYy5ib2R5LmlubmVySFRNTCA9IGA8ZGl2IGNsYXNzPVwiZ3JpZC1zdGFjay1pdGVtLWNvbnRlbnRcIj48L2Rpdj5gO1xyXG4gICAgICAgICAgICAgICAgY29udGVudCA9IGRvYy5ib2R5LmNoaWxkcmVuWzBdO1xyXG4gICAgICAgICAgICAgICAgbm9kZS5lbC5hcHBlbmRDaGlsZChjb250ZW50KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLl9wcmVwYXJlRHJhZ0Ryb3BCeU5vZGUobm9kZSk7IC8vIC4uLiBhbmQgcmVzdG9yZSBvcmlnaW5hbCBEJkRcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gaWYgd2UncmUgYWRkaW5nIGFuIGFkZGl0aW9uYWwgaXRlbSwgbWFrZSB0aGUgY29udGFpbmVyIGxhcmdlIGVub3VnaCB0byBoYXZlIHRoZW0gYm90aFxyXG4gICAgICAgIGlmIChub2RlVG9BZGQpIHtcclxuICAgICAgICAgICAgbGV0IHcgPSBhdXRvQ29sdW1uID8gb3BzLmNvbHVtbiA6IG5vZGUudztcclxuICAgICAgICAgICAgbGV0IGggPSBub2RlLmggKyBub2RlVG9BZGQuaDtcclxuICAgICAgICAgICAgbGV0IHN0eWxlID0gbm9kZS5lbC5zdHlsZTtcclxuICAgICAgICAgICAgc3R5bGUudHJhbnNpdGlvbiA9ICdub25lJzsgLy8gc2hvdyB1cCBpbnN0YW50bHkgc28gd2UgZG9uJ3Qgc2VlIHNjcm9sbGJhciB3aXRoIG5vZGVUb0FkZFxyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZShub2RlLmVsLCB7IHcsIGggfSk7XHJcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4gc3R5bGUudHJhbnNpdGlvbiA9IG51bGwpOyAvLyByZWNvdmVyIGFuaW1hdGlvblxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5vcHRzLmFkZFJlbW92ZUNCKSB7XHJcbiAgICAgICAgICAgIG9wcy5hZGRSZW1vdmVDQiA9IG9wcy5hZGRSZW1vdmVDQiB8fCB0aGlzLm9wdHMuYWRkUmVtb3ZlQ0I7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCBzdWJHcmlkID0gbm9kZS5zdWJHcmlkID0gR3JpZFN0YWNrLmFkZEdyaWQoY29udGVudCwgb3BzKTtcclxuICAgICAgICBpZiAobm9kZVRvQWRkID09PSBudWxsIHx8IG5vZGVUb0FkZCA9PT0gdm9pZCAwID8gdm9pZCAwIDogbm9kZVRvQWRkLl9tb3ZpbmcpXHJcbiAgICAgICAgICAgIHN1YkdyaWQuX2lzVGVtcCA9IHRydWU7IC8vIHByZXZlbnQgcmUtbmVzdGluZyBhcyB3ZSBhZGQgb3ZlclxyXG4gICAgICAgIGlmIChhdXRvQ29sdW1uKVxyXG4gICAgICAgICAgICBzdWJHcmlkLl9hdXRvQ29sdW1uID0gdHJ1ZTtcclxuICAgICAgICAvLyBhZGQgdGhlIG9yaWdpbmFsIGNvbnRlbnQgYmFjayBhcyBhIGNoaWxkIG9mIGh0ZSBuZXdseSBjcmVhdGVkIGdyaWRcclxuICAgICAgICBpZiAoc2F2ZUNvbnRlbnQpIHtcclxuICAgICAgICAgICAgc3ViR3JpZC5hZGRXaWRnZXQobmV3SXRlbSwgbmV3SXRlbU9wdCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIG5vdyBhZGQgYW55IGFkZGl0aW9uYWwgbm9kZVxyXG4gICAgICAgIGlmIChub2RlVG9BZGQpIHtcclxuICAgICAgICAgICAgaWYgKG5vZGVUb0FkZC5fbW92aW5nKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBjcmVhdGUgYW4gYXJ0aWZpY2lhbCBldmVudCBldmVuIGZvciB0aGUganVzdCBjcmVhdGVkIGdyaWQgdG8gcmVjZWl2ZSB0aGlzIGl0ZW1cclxuICAgICAgICAgICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KCgpID0+IHV0aWxzXzEuVXRpbHMuc2ltdWxhdGVNb3VzZUV2ZW50KG5vZGVUb0FkZC5fZXZlbnQsICdtb3VzZWVudGVyJywgc3ViR3JpZC5lbCksIDApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgc3ViR3JpZC5hZGRXaWRnZXQobm9kZS5lbCwgbm9kZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHN1YkdyaWQ7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIGNhbGxlZCB3aGVuIGFuIGl0ZW0gd2FzIGNvbnZlcnRlZCBpbnRvIGEgbmVzdGVkIGdyaWQgdG8gYWNjb21tb2RhdGUgYSBkcmFnZ2VkIG92ZXIgaXRlbSwgYnV0IHRoZW4gaXRlbSBsZWF2ZXMgLSByZXR1cm4gYmFja1xyXG4gICAgICogdG8gdGhlIG9yaWdpbmFsIGdyaWQtaXRlbS4gQWxzbyBjYWxsZWQgdG8gcmVtb3ZlIGVtcHR5IHN1Yi1ncmlkcyB3aGVuIGxhc3QgaXRlbSBpcyBkcmFnZ2VkIG91dCAoc2luY2UgcmUtY3JlYXRpbmcgaXMgc2ltcGxlKVxyXG4gICAgICovXHJcbiAgICByZW1vdmVBc1N1YkdyaWQobm9kZVRoYXRSZW1vdmVkKSB7XHJcbiAgICAgICAgdmFyIF9hO1xyXG4gICAgICAgIGxldCBwR3JpZCA9IChfYSA9IHRoaXMucGFyZW50R3JpZEl0ZW0pID09PSBudWxsIHx8IF9hID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfYS5ncmlkO1xyXG4gICAgICAgIGlmICghcEdyaWQpXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICBwR3JpZC5iYXRjaFVwZGF0ZSgpO1xyXG4gICAgICAgIHBHcmlkLnJlbW92ZVdpZGdldCh0aGlzLnBhcmVudEdyaWRJdGVtLmVsLCB0cnVlLCB0cnVlKTtcclxuICAgICAgICB0aGlzLmVuZ2luZS5ub2Rlcy5mb3JFYWNoKG4gPT4ge1xyXG4gICAgICAgICAgICAvLyBtaWdyYXRlIGFueSBjaGlsZHJlbiBvdmVyIGFuZCBvZmZzZXR0aW5nIGJ5IG91ciBsb2NhdGlvblxyXG4gICAgICAgICAgICBuLnggKz0gdGhpcy5wYXJlbnRHcmlkSXRlbS54O1xyXG4gICAgICAgICAgICBuLnkgKz0gdGhpcy5wYXJlbnRHcmlkSXRlbS55O1xyXG4gICAgICAgICAgICBwR3JpZC5hZGRXaWRnZXQobi5lbCwgbik7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcEdyaWQuYmF0Y2hVcGRhdGUoZmFsc2UpO1xyXG4gICAgICAgIGlmICh0aGlzLnBhcmVudEdyaWRJdGVtKVxyXG4gICAgICAgICAgICBkZWxldGUgdGhpcy5wYXJlbnRHcmlkSXRlbS5zdWJHcmlkO1xyXG4gICAgICAgIGRlbGV0ZSB0aGlzLnBhcmVudEdyaWRJdGVtO1xyXG4gICAgICAgIC8vIGNyZWF0ZSBhbiBhcnRpZmljaWFsIGV2ZW50IGZvciB0aGUgb3JpZ2luYWwgZ3JpZCBub3cgdGhhdCB0aGlzIG9uZSBpcyBnb25lIChnb3QgYSBsZWF2ZSwgYnV0IHdvbid0IGdldCBlbnRlcilcclxuICAgICAgICBpZiAobm9kZVRoYXRSZW1vdmVkKSB7XHJcbiAgICAgICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KCgpID0+IHV0aWxzXzEuVXRpbHMuc2ltdWxhdGVNb3VzZUV2ZW50KG5vZGVUaGF0UmVtb3ZlZC5fZXZlbnQsICdtb3VzZWVudGVyJywgcEdyaWQuZWwpLCAwKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgIC8qKlxyXG4gICAgICogc2F2ZXMgdGhlIGN1cnJlbnQgbGF5b3V0IHJldHVybmluZyBhIGxpc3Qgb2Ygd2lkZ2V0cyBmb3Igc2VyaWFsaXphdGlvbiB3aGljaCBtaWdodCBpbmNsdWRlIGFueSBuZXN0ZWQgZ3JpZHMuXHJcbiAgICAgKiBAcGFyYW0gc2F2ZUNvbnRlbnQgaWYgdHJ1ZSAoZGVmYXVsdCkgdGhlIGxhdGVzdCBodG1sIGluc2lkZSAuZ3JpZC1zdGFjay1jb250ZW50IHdpbGwgYmUgc2F2ZWQgdG8gR3JpZFN0YWNrV2lkZ2V0LmNvbnRlbnQgZmllbGQsIGVsc2UgaXQgd2lsbFxyXG4gICAgICogYmUgcmVtb3ZlZC5cclxuICAgICAqIEBwYXJhbSBzYXZlR3JpZE9wdCBpZiB0cnVlIChkZWZhdWx0IGZhbHNlKSwgc2F2ZSB0aGUgZ3JpZCBvcHRpb25zIGl0c2VsZiwgc28geW91IGNhbiBjYWxsIHRoZSBuZXcgR3JpZFN0YWNrLmFkZEdyaWQoKVxyXG4gICAgICogdG8gcmVjcmVhdGUgZXZlcnl0aGluZyBmcm9tIHNjcmF0Y2guIEdyaWRTdGFja09wdGlvbnMuY2hpbGRyZW4gd291bGQgdGhlbiBjb250YWluIHRoZSB3aWRnZXQgbGlzdCBpbnN0ZWFkLlxyXG4gICAgICogQHJldHVybnMgbGlzdCBvZiB3aWRnZXRzIG9yIGZ1bGwgZ3JpZCBvcHRpb24sIGluY2x1ZGluZyAuY2hpbGRyZW4gbGlzdCBvZiB3aWRnZXRzXHJcbiAgICAgKi9cclxuICAgIHNhdmUoc2F2ZUNvbnRlbnQgPSB0cnVlLCBzYXZlR3JpZE9wdCA9IGZhbHNlKSB7XHJcbiAgICAgICAgLy8gcmV0dXJuIGNvcGllZCBub2RlcyB3ZSBjYW4gbW9kaWZ5IGF0IHdpbGwuLi5cclxuICAgICAgICBsZXQgbGlzdCA9IHRoaXMuZW5naW5lLnNhdmUoc2F2ZUNvbnRlbnQpO1xyXG4gICAgICAgIC8vIGNoZWNrIGZvciBIVE1MIGNvbnRlbnQgYW5kIG5lc3RlZCBncmlkc1xyXG4gICAgICAgIGxpc3QuZm9yRWFjaChuID0+IHtcclxuICAgICAgICAgICAgdmFyIF9hO1xyXG4gICAgICAgICAgICBpZiAoc2F2ZUNvbnRlbnQgJiYgbi5lbCAmJiAhbi5zdWJHcmlkKSB7IC8vIHN1Yi1ncmlkIGFyZSBzYXZlZCBkaWZmZXJlbnRseSwgbm90IHBsYWluIGNvbnRlbnRcclxuICAgICAgICAgICAgICAgIGxldCBzdWIgPSBuLmVsLnF1ZXJ5U2VsZWN0b3IoJy5ncmlkLXN0YWNrLWl0ZW0tY29udGVudCcpO1xyXG4gICAgICAgICAgICAgICAgbi5jb250ZW50ID0gc3ViID8gc3ViLmlubmVySFRNTCA6IHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgICAgIGlmICghbi5jb250ZW50KVxyXG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBuLmNvbnRlbnQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIXNhdmVDb250ZW50KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIG4uY29udGVudDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIC8vIGNoZWNrIGZvciBuZXN0ZWQgZ3JpZFxyXG4gICAgICAgICAgICAgICAgaWYgKChfYSA9IG4uc3ViR3JpZCkgPT09IG51bGwgfHwgX2EgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9hLmVsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbGlzdE9yT3B0ID0gbi5zdWJHcmlkLnNhdmUoc2F2ZUNvbnRlbnQsIHNhdmVHcmlkT3B0KTtcclxuICAgICAgICAgICAgICAgICAgICBuLnN1YkdyaWQgPSAoc2F2ZUdyaWRPcHQgPyBsaXN0T3JPcHQgOiB7IGNoaWxkcmVuOiBsaXN0T3JPcHQgfSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZGVsZXRlIG4uZWw7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgLy8gY2hlY2sgaWYgc2F2ZSBlbnRpcmUgZ3JpZCBvcHRpb25zIChuZWVkZWQgZm9yIHJlY3Vyc2l2ZSkgKyBjaGlsZHJlbi4uLlxyXG4gICAgICAgIGlmIChzYXZlR3JpZE9wdCkge1xyXG4gICAgICAgICAgICBsZXQgbyA9IHV0aWxzXzEuVXRpbHMuY2xvbmVEZWVwKHRoaXMub3B0cyk7XHJcbiAgICAgICAgICAgIC8vIGRlbGV0ZSBkZWZhdWx0IHZhbHVlcyB0aGF0IHdpbGwgYmUgcmVjcmVhdGVkIG9uIGxhdW5jaFxyXG4gICAgICAgICAgICBpZiAoby5tYXJnaW5Cb3R0b20gPT09IG8ubWFyZ2luVG9wICYmIG8ubWFyZ2luUmlnaHQgPT09IG8ubWFyZ2luTGVmdCAmJiBvLm1hcmdpblRvcCA9PT0gby5tYXJnaW5SaWdodCkge1xyXG4gICAgICAgICAgICAgICAgby5tYXJnaW4gPSBvLm1hcmdpblRvcDtcclxuICAgICAgICAgICAgICAgIGRlbGV0ZSBvLm1hcmdpblRvcDtcclxuICAgICAgICAgICAgICAgIGRlbGV0ZSBvLm1hcmdpblJpZ2h0O1xyXG4gICAgICAgICAgICAgICAgZGVsZXRlIG8ubWFyZ2luQm90dG9tO1xyXG4gICAgICAgICAgICAgICAgZGVsZXRlIG8ubWFyZ2luTGVmdDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoby5ydGwgPT09ICh0aGlzLmVsLnN0eWxlLmRpcmVjdGlvbiA9PT0gJ3J0bCcpKSB7XHJcbiAgICAgICAgICAgICAgICBvLnJ0bCA9ICdhdXRvJztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAodGhpcy5faXNBdXRvQ2VsbEhlaWdodCkge1xyXG4gICAgICAgICAgICAgICAgby5jZWxsSGVpZ2h0ID0gJ2F1dG8nO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICh0aGlzLl9hdXRvQ29sdW1uKSB7XHJcbiAgICAgICAgICAgICAgICBvLmNvbHVtbiA9ICdhdXRvJztcclxuICAgICAgICAgICAgICAgIGRlbGV0ZSBvLmRpc2FibGVPbmVDb2x1bW5Nb2RlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnN0IG9yaWdTaG93ID0gby5fYWx3YXlzU2hvd1Jlc2l6ZUhhbmRsZTtcclxuICAgICAgICAgICAgZGVsZXRlIG8uX2Fsd2F5c1Nob3dSZXNpemVIYW5kbGU7XHJcbiAgICAgICAgICAgIGlmIChvcmlnU2hvdyAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICAgICBvLmFsd2F5c1Nob3dSZXNpemVIYW5kbGUgPSBvcmlnU2hvdztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGRlbGV0ZSBvLmFsd2F5c1Nob3dSZXNpemVIYW5kbGU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdXRpbHNfMS5VdGlscy5yZW1vdmVJbnRlcm5hbEFuZFNhbWUobywgdHlwZXNfMS5ncmlkRGVmYXVsdHMpO1xyXG4gICAgICAgICAgICBvLmNoaWxkcmVuID0gbGlzdDtcclxuICAgICAgICAgICAgcmV0dXJuIG87XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBsaXN0O1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBsb2FkIHRoZSB3aWRnZXRzIGZyb20gYSBsaXN0LiBUaGlzIHdpbGwgY2FsbCB1cGRhdGUoKSBvbiBlYWNoIChtYXRjaGluZyBieSBpZCkgb3IgYWRkL3JlbW92ZSB3aWRnZXRzIHRoYXQgYXJlIG5vdCB0aGVyZS5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0gbGF5b3V0IGxpc3Qgb2Ygd2lkZ2V0cyBkZWZpbml0aW9uIHRvIHVwZGF0ZS9jcmVhdGVcclxuICAgICAqIEBwYXJhbSBhZGRBbmRSZW1vdmUgYm9vbGVhbiAoZGVmYXVsdCB0cnVlKSBvciBjYWxsYmFjayBtZXRob2QgY2FuIGJlIHBhc3NlZCB0byBjb250cm9sIGlmIGFuZCBob3cgbWlzc2luZyB3aWRnZXRzIGNhbiBiZSBhZGRlZC9yZW1vdmVkLCBnaXZpbmdcclxuICAgICAqIHRoZSB1c2VyIGNvbnRyb2wgb2YgaW5zZXJ0aW9uLlxyXG4gICAgICpcclxuICAgICAqIEBleGFtcGxlXHJcbiAgICAgKiBzZWUgaHR0cDovL2dyaWRzdGFja2pzLmNvbS9kZW1vL3NlcmlhbGl6YXRpb24uaHRtbFxyXG4gICAgICoqL1xyXG4gICAgbG9hZChsYXlvdXQsIGFkZFJlbW92ZSA9IHRoaXMub3B0cy5hZGRSZW1vdmVDQiB8fCB0cnVlKSB7XHJcbiAgICAgICAgbGV0IGl0ZW1zID0gR3JpZFN0YWNrLlV0aWxzLnNvcnQoWy4uLmxheW91dF0sIC0xLCB0aGlzLl9wcmV2Q29sdW1uIHx8IHRoaXMuZ2V0Q29sdW1uKCkpOyAvLyBtYWtlIGNvcHkgYmVmb3JlIHdlIG1vZC9zb3J0XHJcbiAgICAgICAgdGhpcy5faW5zZXJ0Tm90QXBwZW5kID0gdHJ1ZTsgLy8gc2luY2UgY3JlYXRlIGluIHJldmVyc2Ugb3JkZXIuLi5cclxuICAgICAgICAvLyBpZiB3ZSdyZSBsb2FkaW5nIGEgbGF5b3V0IGludG8gZm9yIGV4YW1wbGUgMSBjb2x1bW4gKF9wcmV2Q29sdW1uIGlzIHNldCBvbmx5IHdoZW4gZ29pbmcgdG8gMSkgYW5kIGl0ZW1zIGRvbid0IGZpdCwgbWFrZSBzdXJlIHRvIHNhdmVcclxuICAgICAgICAvLyB0aGUgb3JpZ2luYWwgd2FudGVkIGxheW91dCBzbyB3ZSBjYW4gc2NhbGUgYmFjayB1cCBjb3JyZWN0bHkgIzE0NzFcclxuICAgICAgICBpZiAodGhpcy5fcHJldkNvbHVtbiAmJiB0aGlzLl9wcmV2Q29sdW1uICE9PSB0aGlzLm9wdHMuY29sdW1uICYmIGl0ZW1zLnNvbWUobiA9PiAobi54ICsgbi53KSA+IHRoaXMub3B0cy5jb2x1bW4pKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2lnbm9yZUxheW91dHNOb2RlQ2hhbmdlID0gdHJ1ZTsgLy8gc2tpcCBsYXlvdXQgdXBkYXRlXHJcbiAgICAgICAgICAgIHRoaXMuZW5naW5lLmNhY2hlTGF5b3V0KGl0ZW1zLCB0aGlzLl9wcmV2Q29sdW1uLCB0cnVlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gaWYgZ2l2ZW4gYSBkaWZmZXJlbnQgY2FsbGJhY2ssIHRlbXBvcmFsbHkgc2V0IGl0IGFzIGdsb2JhbCBvcHRpb24gdG8gY3JlYXRpbmcgd2lsbCB1c2UgaXRcclxuICAgICAgICBjb25zdCBwcmV2Q0IgPSB0aGlzLm9wdHMuYWRkUmVtb3ZlQ0I7XHJcbiAgICAgICAgaWYgKHR5cGVvZiAoYWRkUmVtb3ZlKSA9PT0gJ2Z1bmN0aW9uJylcclxuICAgICAgICAgICAgdGhpcy5vcHRzLmFkZFJlbW92ZUNCID0gYWRkUmVtb3ZlO1xyXG4gICAgICAgIGxldCByZW1vdmVkID0gW107XHJcbiAgICAgICAgdGhpcy5iYXRjaFVwZGF0ZSgpO1xyXG4gICAgICAgIC8vIHNlZSBpZiBhbnkgaXRlbXMgYXJlIG1pc3NpbmcgZnJvbSBuZXcgbGF5b3V0IGFuZCBuZWVkIHRvIGJlIHJlbW92ZWQgZmlyc3RcclxuICAgICAgICBpZiAoYWRkUmVtb3ZlKSB7XHJcbiAgICAgICAgICAgIGxldCBjb3B5Tm9kZXMgPSBbLi4udGhpcy5lbmdpbmUubm9kZXNdOyAvLyBkb24ndCBsb29wIHRocm91Z2ggYXJyYXkgeW91IG1vZGlmeVxyXG4gICAgICAgICAgICBjb3B5Tm9kZXMuZm9yRWFjaChuID0+IHtcclxuICAgICAgICAgICAgICAgIGxldCBpdGVtID0gaXRlbXMuZmluZCh3ID0+IG4uaWQgPT09IHcuaWQpO1xyXG4gICAgICAgICAgICAgICAgaWYgKCFpdGVtKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMub3B0cy5hZGRSZW1vdmVDQilcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vcHRzLmFkZFJlbW92ZUNCKHRoaXMuZWwsIG4sIGZhbHNlLCBmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVtb3ZlZC5wdXNoKG4pOyAvLyBiYXRjaCBrZWVwIHRyYWNrXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZW1vdmVXaWRnZXQobi5lbCwgdHJ1ZSwgZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gbm93IGFkZC91cGRhdGUgdGhlIHdpZGdldHNcclxuICAgICAgICBpdGVtcy5mb3JFYWNoKHcgPT4ge1xyXG4gICAgICAgICAgICBsZXQgaXRlbSA9ICh3LmlkIHx8IHcuaWQgPT09IDApID8gdGhpcy5lbmdpbmUubm9kZXMuZmluZChuID0+IG4uaWQgPT09IHcuaWQpIDogdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICBpZiAoaXRlbSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGUoaXRlbS5lbCwgdyk7XHJcbiAgICAgICAgICAgICAgICBpZiAody5zdWJHcmlkICYmIHcuc3ViR3JpZC5jaGlsZHJlbikgeyAvLyB1cGRhdGUgYW55IHN1YiBncmlkIGFzIHdlbGxcclxuICAgICAgICAgICAgICAgICAgICBsZXQgc3ViID0gaXRlbS5lbC5xdWVyeVNlbGVjdG9yKCcuZ3JpZC1zdGFjaycpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChzdWIgJiYgc3ViLmdyaWRzdGFjaykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdWIuZ3JpZHN0YWNrLmxvYWQody5zdWJHcmlkLmNoaWxkcmVuKTsgLy8gVE9ETzogc3VwcG9ydCB1cGRhdGluZyBncmlkIG9wdGlvbnMgP1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9pbnNlcnROb3RBcHBlbmQgPSB0cnVlOyAvLyBnb3QgcmVzZXQgYnkgYWJvdmUgY2FsbFxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmIChhZGRSZW1vdmUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuYWRkV2lkZ2V0KHcpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5lbmdpbmUucmVtb3ZlZE5vZGVzID0gcmVtb3ZlZDtcclxuICAgICAgICB0aGlzLmJhdGNoVXBkYXRlKGZhbHNlKTtcclxuICAgICAgICAvLyBhZnRlciBjb21taXQsIGNsZWFyIHRoYXQgZmxhZ1xyXG4gICAgICAgIGRlbGV0ZSB0aGlzLl9pZ25vcmVMYXlvdXRzTm9kZUNoYW5nZTtcclxuICAgICAgICBkZWxldGUgdGhpcy5faW5zZXJ0Tm90QXBwZW5kO1xyXG4gICAgICAgIHByZXZDQiA/IHRoaXMub3B0cy5hZGRSZW1vdmVDQiA9IHByZXZDQiA6IGRlbGV0ZSB0aGlzLm9wdHMuYWRkUmVtb3ZlQ0I7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIHVzZSBiZWZvcmUgY2FsbGluZyBhIGJ1bmNoIG9mIGBhZGRXaWRnZXQoKWAgdG8gcHJldmVudCB1bi1uZWNlc3NhcnkgcmVsYXlvdXRzIGluIGJldHdlZW4gKG1vcmUgZWZmaWNpZW50KVxyXG4gICAgICogYW5kIGdldCBhIHNpbmdsZSBldmVudCBjYWxsYmFjay4gWW91IHdpbGwgc2VlIG5vIGNoYW5nZXMgdW50aWwgYGJhdGNoVXBkYXRlKGZhbHNlKWAgaXMgY2FsbGVkLlxyXG4gICAgICovXHJcbiAgICBiYXRjaFVwZGF0ZShmbGFnID0gdHJ1ZSkge1xyXG4gICAgICAgIHRoaXMuZW5naW5lLmJhdGNoVXBkYXRlKGZsYWcpO1xyXG4gICAgICAgIGlmICghZmxhZykge1xyXG4gICAgICAgICAgICB0aGlzLl90cmlnZ2VyUmVtb3ZlRXZlbnQoKTtcclxuICAgICAgICAgICAgdGhpcy5fdHJpZ2dlckFkZEV2ZW50KCk7XHJcbiAgICAgICAgICAgIHRoaXMuX3RyaWdnZXJDaGFuZ2VFdmVudCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogR2V0cyBjdXJyZW50IGNlbGwgaGVpZ2h0LlxyXG4gICAgICovXHJcbiAgICBnZXRDZWxsSGVpZ2h0KGZvcmNlUGl4ZWwgPSBmYWxzZSkge1xyXG4gICAgICAgIGlmICh0aGlzLm9wdHMuY2VsbEhlaWdodCAmJiB0aGlzLm9wdHMuY2VsbEhlaWdodCAhPT0gJ2F1dG8nICYmXHJcbiAgICAgICAgICAgICghZm9yY2VQaXhlbCB8fCAhdGhpcy5vcHRzLmNlbGxIZWlnaHRVbml0IHx8IHRoaXMub3B0cy5jZWxsSGVpZ2h0VW5pdCA9PT0gJ3B4JykpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMub3B0cy5jZWxsSGVpZ2h0O1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBlbHNlIGdldCBmaXJzdCBjZWxsIGhlaWdodFxyXG4gICAgICAgIGxldCBlbCA9IHRoaXMuZWwucXVlcnlTZWxlY3RvcignLicgKyB0aGlzLm9wdHMuaXRlbUNsYXNzKTtcclxuICAgICAgICBpZiAoZWwpIHtcclxuICAgICAgICAgICAgbGV0IGhlaWdodCA9IHV0aWxzXzEuVXRpbHMudG9OdW1iZXIoZWwuZ2V0QXR0cmlidXRlKCdncy1oJykpO1xyXG4gICAgICAgICAgICByZXR1cm4gTWF0aC5yb3VuZChlbC5vZmZzZXRIZWlnaHQgLyBoZWlnaHQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBlbHNlIGRvIGVudGlyZSBncmlkIGFuZCAjIG9mIHJvd3MgKGJ1dCBkb2Vzbid0IHdvcmsgaWYgbWluLWhlaWdodCBpcyB0aGUgYWN0dWFsIGNvbnN0cmFpbilcclxuICAgICAgICBsZXQgcm93cyA9IHBhcnNlSW50KHRoaXMuZWwuZ2V0QXR0cmlidXRlKCdncy1jdXJyZW50LXJvdycpKTtcclxuICAgICAgICByZXR1cm4gcm93cyA/IE1hdGgucm91bmQodGhpcy5lbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5oZWlnaHQgLyByb3dzKSA6IHRoaXMub3B0cy5jZWxsSGVpZ2h0O1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBVcGRhdGUgY3VycmVudCBjZWxsIGhlaWdodCAtIHNlZSBgR3JpZFN0YWNrT3B0aW9ucy5jZWxsSGVpZ2h0YCBmb3IgZm9ybWF0LlxyXG4gICAgICogVGhpcyBtZXRob2QgcmVidWlsZHMgYW4gaW50ZXJuYWwgQ1NTIHN0eWxlIHNoZWV0LlxyXG4gICAgICogTm90ZTogWW91IGNhbiBleHBlY3QgcGVyZm9ybWFuY2UgaXNzdWVzIGlmIGNhbGwgdGhpcyBtZXRob2QgdG9vIG9mdGVuLlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB2YWwgdGhlIGNlbGwgaGVpZ2h0LiBJZiBub3QgcGFzc2VkICh1bmRlZmluZWQpLCBjZWxscyBjb250ZW50IHdpbGwgYmUgbWFkZSBzcXVhcmUgKG1hdGNoIHdpZHRoIG1pbnVzIG1hcmdpbiksXHJcbiAgICAgKiBpZiBwYXNzIDAgdGhlIENTUyB3aWxsIGJlIGdlbmVyYXRlZCBieSB0aGUgYXBwbGljYXRpb24gaW5zdGVhZC5cclxuICAgICAqIEBwYXJhbSB1cGRhdGUgKE9wdGlvbmFsKSBpZiBmYWxzZSwgc3R5bGVzIHdpbGwgbm90IGJlIHVwZGF0ZWRcclxuICAgICAqXHJcbiAgICAgKiBAZXhhbXBsZVxyXG4gICAgICogZ3JpZC5jZWxsSGVpZ2h0KDEwMCk7IC8vIHNhbWUgYXMgMTAwcHhcclxuICAgICAqIGdyaWQuY2VsbEhlaWdodCgnNzBweCcpO1xyXG4gICAgICogZ3JpZC5jZWxsSGVpZ2h0KGdyaWQuY2VsbFdpZHRoKCkgKiAxLjIpO1xyXG4gICAgICovXHJcbiAgICBjZWxsSGVpZ2h0KHZhbCwgdXBkYXRlID0gdHJ1ZSkge1xyXG4gICAgICAgIC8vIGlmIG5vdCBjYWxsZWQgaW50ZXJuYWxseSwgY2hlY2sgaWYgd2UncmUgY2hhbmdpbmcgbW9kZVxyXG4gICAgICAgIGlmICh1cGRhdGUgJiYgdmFsICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuX2lzQXV0b0NlbGxIZWlnaHQgIT09ICh2YWwgPT09ICdhdXRvJykpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2lzQXV0b0NlbGxIZWlnaHQgPSAodmFsID09PSAnYXV0bycpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fdXBkYXRlV2luZG93UmVzaXplRXZlbnQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodmFsID09PSAnaW5pdGlhbCcgfHwgdmFsID09PSAnYXV0bycpIHtcclxuICAgICAgICAgICAgdmFsID0gdW5kZWZpbmVkO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBtYWtlIGl0ZW0gY29udGVudCBiZSBzcXVhcmVcclxuICAgICAgICBpZiAodmFsID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgbGV0IG1hcmdpbkRpZmYgPSAtdGhpcy5vcHRzLm1hcmdpblJpZ2h0IC0gdGhpcy5vcHRzLm1hcmdpbkxlZnRcclxuICAgICAgICAgICAgICAgICsgdGhpcy5vcHRzLm1hcmdpblRvcCArIHRoaXMub3B0cy5tYXJnaW5Cb3R0b207XHJcbiAgICAgICAgICAgIHZhbCA9IHRoaXMuY2VsbFdpZHRoKCkgKyBtYXJnaW5EaWZmO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgZGF0YSA9IHV0aWxzXzEuVXRpbHMucGFyc2VIZWlnaHQodmFsKTtcclxuICAgICAgICBpZiAodGhpcy5vcHRzLmNlbGxIZWlnaHRVbml0ID09PSBkYXRhLnVuaXQgJiYgdGhpcy5vcHRzLmNlbGxIZWlnaHQgPT09IGRhdGEuaCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5vcHRzLmNlbGxIZWlnaHRVbml0ID0gZGF0YS51bml0O1xyXG4gICAgICAgIHRoaXMub3B0cy5jZWxsSGVpZ2h0ID0gZGF0YS5oO1xyXG4gICAgICAgIGlmICh1cGRhdGUpIHtcclxuICAgICAgICAgICAgdGhpcy5fdXBkYXRlU3R5bGVzKHRydWUpOyAvLyB0cnVlID0gZm9yY2UgcmUtY3JlYXRlIGZvciBjdXJyZW50ICMgb2Ygcm93c1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuICAgIC8qKiBHZXRzIGN1cnJlbnQgY2VsbCB3aWR0aC4gKi9cclxuICAgIGNlbGxXaWR0aCgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fd2lkdGhPckNvbnRhaW5lcigpIC8gdGhpcy5nZXRDb2x1bW4oKTtcclxuICAgIH1cclxuICAgIC8qKiByZXR1cm4gb3VyIGV4cGVjdGVkIHdpZHRoIChvciBwYXJlbnQpIGZvciAxIGNvbHVtbiBjaGVjayAqL1xyXG4gICAgX3dpZHRoT3JDb250YWluZXIoKSB7XHJcbiAgICAgICAgLy8gdXNlIGBvZmZzZXRXaWR0aGAgb3IgYGNsaWVudFdpZHRoYCAobm8gc2Nyb2xsYmFyKSA/XHJcbiAgICAgICAgLy8gaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMjEwNjQxMDEvdW5kZXJzdGFuZGluZy1vZmZzZXR3aWR0aC1jbGllbnR3aWR0aC1zY3JvbGx3aWR0aC1hbmQtaGVpZ2h0LXJlc3BlY3RpdmVseVxyXG4gICAgICAgIHJldHVybiAodGhpcy5lbC5jbGllbnRXaWR0aCB8fCB0aGlzLmVsLnBhcmVudEVsZW1lbnQuY2xpZW50V2lkdGggfHwgd2luZG93LmlubmVyV2lkdGgpO1xyXG4gICAgfVxyXG4gICAgLyoqIHJlLWxheW91dCBncmlkIGl0ZW1zIHRvIHJlY2xhaW0gYW55IGVtcHR5IHNwYWNlICovXHJcbiAgICBjb21wYWN0KCkge1xyXG4gICAgICAgIHRoaXMuZW5naW5lLmNvbXBhY3QoKTtcclxuICAgICAgICB0aGlzLl90cmlnZ2VyQ2hhbmdlRXZlbnQoKTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogc2V0IHRoZSBudW1iZXIgb2YgY29sdW1ucyBpbiB0aGUgZ3JpZC4gV2lsbCB1cGRhdGUgZXhpc3Rpbmcgd2lkZ2V0cyB0byBjb25mb3JtIHRvIG5ldyBudW1iZXIgb2YgY29sdW1ucyxcclxuICAgICAqIGFzIHdlbGwgYXMgY2FjaGUgdGhlIG9yaWdpbmFsIGxheW91dCBzbyB5b3UgY2FuIHJldmVydCBiYWNrIHRvIHByZXZpb3VzIHBvc2l0aW9ucyB3aXRob3V0IGxvc3MuXHJcbiAgICAgKiBSZXF1aXJlcyBgZ3JpZHN0YWNrLWV4dHJhLmNzc2Agb3IgYGdyaWRzdGFjay1leHRyYS5taW4uY3NzYCBmb3IgWzItMTFdLFxyXG4gICAgICogZWxzZSB5b3Ugd2lsbCBuZWVkIHRvIGdlbmVyYXRlIGNvcnJlY3QgQ1NTIChzZWUgaHR0cHM6Ly9naXRodWIuY29tL2dyaWRzdGFjay9ncmlkc3RhY2suanMjY2hhbmdlLWdyaWQtY29sdW1ucylcclxuICAgICAqIEBwYXJhbSBjb2x1bW4gLSBJbnRlZ2VyID4gMCAoZGVmYXVsdCAxMikuXHJcbiAgICAgKiBAcGFyYW0gbGF5b3V0IHNwZWNpZnkgdGhlIHR5cGUgb2YgcmUtbGF5b3V0IHRoYXQgd2lsbCBoYXBwZW4gKHBvc2l0aW9uLCBzaXplLCBldGMuLi4pLlxyXG4gICAgICogTm90ZTogaXRlbXMgd2lsbCBuZXZlciBiZSBvdXRzaWRlIG9mIHRoZSBjdXJyZW50IGNvbHVtbiBib3VuZGFyaWVzLiBkZWZhdWx0IChtb3ZlU2NhbGUpLiBJZ25vcmVkIGZvciAxIGNvbHVtblxyXG4gICAgICovXHJcbiAgICBjb2x1bW4oY29sdW1uLCBsYXlvdXQgPSAnbW92ZVNjYWxlJykge1xyXG4gICAgICAgIGlmIChjb2x1bW4gPCAxIHx8IHRoaXMub3B0cy5jb2x1bW4gPT09IGNvbHVtbilcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgbGV0IG9sZENvbHVtbiA9IHRoaXMuZ2V0Q29sdW1uKCk7XHJcbiAgICAgICAgLy8gaWYgd2UgZ28gaW50byAxIGNvbHVtbiBtb2RlICh3aGljaCBoYXBwZW5zIGlmIHdlJ3JlIHNpemVkIGxlc3MgdGhhbiBtaW5XIHVubGVzcyBkaXNhYmxlT25lQ29sdW1uTW9kZSBpcyBvbilcclxuICAgICAgICAvLyB0aGVuIHJlbWVtYmVyIHRoZSBvcmlnaW5hbCBjb2x1bW5zIHNvIHdlIGNhbiByZXN0b3JlLlxyXG4gICAgICAgIGlmIChjb2x1bW4gPT09IDEpIHtcclxuICAgICAgICAgICAgdGhpcy5fcHJldkNvbHVtbiA9IG9sZENvbHVtbjtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGRlbGV0ZSB0aGlzLl9wcmV2Q29sdW1uO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmVsLmNsYXNzTGlzdC5yZW1vdmUoJ2dyaWQtc3RhY2stJyArIG9sZENvbHVtbik7XHJcbiAgICAgICAgdGhpcy5lbC5jbGFzc0xpc3QuYWRkKCdncmlkLXN0YWNrLScgKyBjb2x1bW4pO1xyXG4gICAgICAgIHRoaXMub3B0cy5jb2x1bW4gPSB0aGlzLmVuZ2luZS5jb2x1bW4gPSBjb2x1bW47XHJcbiAgICAgICAgLy8gdXBkYXRlIHRoZSBpdGVtcyBub3cgLSBzZWUgaWYgdGhlIGRvbSBvcmRlciBub2RlcyBzaG91bGQgYmUgcGFzc2VkIGluc3RlYWQgKGVsc2UgZGVmYXVsdCB0byBjdXJyZW50IGxpc3QpXHJcbiAgICAgICAgbGV0IGRvbU5vZGVzO1xyXG4gICAgICAgIGlmIChjb2x1bW4gPT09IDEgJiYgdGhpcy5vcHRzLm9uZUNvbHVtbk1vZGVEb21Tb3J0KSB7XHJcbiAgICAgICAgICAgIGRvbU5vZGVzID0gW107XHJcbiAgICAgICAgICAgIHRoaXMuZ2V0R3JpZEl0ZW1zKCkuZm9yRWFjaChlbCA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZWwuZ3JpZHN0YWNrTm9kZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGRvbU5vZGVzLnB1c2goZWwuZ3JpZHN0YWNrTm9kZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBpZiAoIWRvbU5vZGVzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgZG9tTm9kZXMgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5lbmdpbmUudXBkYXRlTm9kZVdpZHRocyhvbGRDb2x1bW4sIGNvbHVtbiwgZG9tTm9kZXMsIGxheW91dCk7XHJcbiAgICAgICAgaWYgKHRoaXMuX2lzQXV0b0NlbGxIZWlnaHQpXHJcbiAgICAgICAgICAgIHRoaXMuY2VsbEhlaWdodCgpO1xyXG4gICAgICAgIC8vIGFuZCB0cmlnZ2VyIG91ciBldmVudCBsYXN0Li4uXHJcbiAgICAgICAgdGhpcy5faWdub3JlTGF5b3V0c05vZGVDaGFuZ2UgPSB0cnVlOyAvLyBza2lwIGxheW91dCB1cGRhdGVcclxuICAgICAgICB0aGlzLl90cmlnZ2VyQ2hhbmdlRXZlbnQoKTtcclxuICAgICAgICBkZWxldGUgdGhpcy5faWdub3JlTGF5b3V0c05vZGVDaGFuZ2U7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIGdldCB0aGUgbnVtYmVyIG9mIGNvbHVtbnMgaW4gdGhlIGdyaWQgKGRlZmF1bHQgMTIpXHJcbiAgICAgKi9cclxuICAgIGdldENvbHVtbigpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5vcHRzLmNvbHVtbjtcclxuICAgIH1cclxuICAgIC8qKiByZXR1cm5zIGFuIGFycmF5IG9mIGdyaWQgSFRNTCBlbGVtZW50cyAobm8gcGxhY2Vob2xkZXIpIC0gdXNlZCB0byBpdGVyYXRlIHRocm91Z2ggb3VyIGNoaWxkcmVuIGluIERPTSBvcmRlciAqL1xyXG4gICAgZ2V0R3JpZEl0ZW1zKCkge1xyXG4gICAgICAgIHJldHVybiBBcnJheS5mcm9tKHRoaXMuZWwuY2hpbGRyZW4pXHJcbiAgICAgICAgICAgIC5maWx0ZXIoKGVsKSA9PiBlbC5tYXRjaGVzKCcuJyArIHRoaXMub3B0cy5pdGVtQ2xhc3MpICYmICFlbC5tYXRjaGVzKCcuJyArIHRoaXMub3B0cy5wbGFjZWhvbGRlckNsYXNzKSk7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIERlc3Ryb3lzIGEgZ3JpZCBpbnN0YW5jZS4gRE8gTk9UIENBTEwgYW55IG1ldGhvZHMgb3IgYWNjZXNzIGFueSB2YXJzIGFmdGVyIHRoaXMgYXMgaXQgd2lsbCBmcmVlIHVwIG1lbWJlcnMuXHJcbiAgICAgKiBAcGFyYW0gcmVtb3ZlRE9NIGlmIGBmYWxzZWAgZ3JpZCBhbmQgaXRlbXMgSFRNTCBlbGVtZW50cyB3aWxsIG5vdCBiZSByZW1vdmVkIGZyb20gdGhlIERPTSAoT3B0aW9uYWwuIERlZmF1bHQgYHRydWVgKS5cclxuICAgICAqL1xyXG4gICAgZGVzdHJveShyZW1vdmVET00gPSB0cnVlKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLmVsKVxyXG4gICAgICAgICAgICByZXR1cm47IC8vIHByZXZlbnQgbXVsdGlwbGUgY2FsbHNcclxuICAgICAgICB0aGlzLl91cGRhdGVXaW5kb3dSZXNpemVFdmVudCh0cnVlKTtcclxuICAgICAgICB0aGlzLnNldFN0YXRpYyh0cnVlLCBmYWxzZSk7IC8vIHBlcm1hbmVudGx5IHJlbW92ZXMgREQgYnV0IGRvbid0IHNldCBDU1MgY2xhc3MgKHdlJ3JlIGdvaW5nIGF3YXkpXHJcbiAgICAgICAgdGhpcy5zZXRBbmltYXRpb24oZmFsc2UpO1xyXG4gICAgICAgIGlmICghcmVtb3ZlRE9NKSB7XHJcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlQWxsKHJlbW92ZURPTSk7XHJcbiAgICAgICAgICAgIHRoaXMuZWwuY2xhc3NMaXN0LnJlbW92ZSh0aGlzLl9zdHlsZVNoZWV0Q2xhc3MpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5lbC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHRoaXMuZWwpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9yZW1vdmVTdHlsZXNoZWV0KCk7XHJcbiAgICAgICAgdGhpcy5lbC5yZW1vdmVBdHRyaWJ1dGUoJ2dzLWN1cnJlbnQtcm93Jyk7XHJcbiAgICAgICAgaWYgKHRoaXMucGFyZW50R3JpZEl0ZW0pXHJcbiAgICAgICAgICAgIGRlbGV0ZSB0aGlzLnBhcmVudEdyaWRJdGVtLnN1YkdyaWQ7XHJcbiAgICAgICAgZGVsZXRlIHRoaXMucGFyZW50R3JpZEl0ZW07XHJcbiAgICAgICAgZGVsZXRlIHRoaXMub3B0cztcclxuICAgICAgICBkZWxldGUgdGhpcy5fcGxhY2Vob2xkZXI7XHJcbiAgICAgICAgZGVsZXRlIHRoaXMuZW5naW5lO1xyXG4gICAgICAgIGRlbGV0ZSB0aGlzLmVsLmdyaWRzdGFjazsgLy8gcmVtb3ZlIGNpcmN1bGFyIGRlcGVuZGVuY3kgdGhhdCB3b3VsZCBwcmV2ZW50IGEgZnJlZWluZ1xyXG4gICAgICAgIGRlbGV0ZSB0aGlzLmVsO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBlbmFibGUvZGlzYWJsZSBmbG9hdGluZyB3aWRnZXRzIChkZWZhdWx0OiBgZmFsc2VgKSBTZWUgW2V4YW1wbGVdKGh0dHA6Ly9ncmlkc3RhY2tqcy5jb20vZGVtby9mbG9hdC5odG1sKVxyXG4gICAgICovXHJcbiAgICBmbG9hdCh2YWwpIHtcclxuICAgICAgICBpZiAodGhpcy5vcHRzLmZsb2F0ICE9PSB2YWwpIHtcclxuICAgICAgICAgICAgdGhpcy5vcHRzLmZsb2F0ID0gdGhpcy5lbmdpbmUuZmxvYXQgPSB2YWw7XHJcbiAgICAgICAgICAgIHRoaXMuX3RyaWdnZXJDaGFuZ2VFdmVudCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogZ2V0IHRoZSBjdXJyZW50IGZsb2F0IG1vZGVcclxuICAgICAqL1xyXG4gICAgZ2V0RmxvYXQoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZW5naW5lLmZsb2F0O1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBHZXQgdGhlIHBvc2l0aW9uIG9mIHRoZSBjZWxsIHVuZGVyIGEgcGl4ZWwgb24gc2NyZWVuLlxyXG4gICAgICogQHBhcmFtIHBvc2l0aW9uIHRoZSBwb3NpdGlvbiBvZiB0aGUgcGl4ZWwgdG8gcmVzb2x2ZSBpblxyXG4gICAgICogYWJzb2x1dGUgY29vcmRpbmF0ZXMsIGFzIGFuIG9iamVjdCB3aXRoIHRvcCBhbmQgbGVmdCBwcm9wZXJ0aWVzXHJcbiAgICAgKiBAcGFyYW0gdXNlRG9jUmVsYXRpdmUgaWYgdHJ1ZSwgdmFsdWUgd2lsbCBiZSBiYXNlZCBvbiBkb2N1bWVudCBwb3NpdGlvbiB2cyBwYXJlbnQgcG9zaXRpb24gKE9wdGlvbmFsLiBEZWZhdWx0IGZhbHNlKS5cclxuICAgICAqIFVzZWZ1bCB3aGVuIGdyaWQgaXMgd2l0aGluIGBwb3NpdGlvbjogcmVsYXRpdmVgIGVsZW1lbnRcclxuICAgICAqXHJcbiAgICAgKiBSZXR1cm5zIGFuIG9iamVjdCB3aXRoIHByb3BlcnRpZXMgYHhgIGFuZCBgeWAgaS5lLiB0aGUgY29sdW1uIGFuZCByb3cgaW4gdGhlIGdyaWQuXHJcbiAgICAgKi9cclxuICAgIGdldENlbGxGcm9tUGl4ZWwocG9zaXRpb24sIHVzZURvY1JlbGF0aXZlID0gZmFsc2UpIHtcclxuICAgICAgICBsZXQgYm94ID0gdGhpcy5lbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcclxuICAgICAgICAvLyBjb25zb2xlLmxvZyhgZ2V0Qm91bmRpbmdDbGllbnRSZWN0IGxlZnQ6ICR7Ym94LmxlZnR9IHRvcDogJHtib3gudG9wfSB3OiAke2JveC53fSBoOiAke2JveC5ofWApXHJcbiAgICAgICAgbGV0IGNvbnRhaW5lclBvcztcclxuICAgICAgICBpZiAodXNlRG9jUmVsYXRpdmUpIHtcclxuICAgICAgICAgICAgY29udGFpbmVyUG9zID0geyB0b3A6IGJveC50b3AgKyBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsVG9wLCBsZWZ0OiBib3gubGVmdCB9O1xyXG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhgZ2V0Q2VsbEZyb21QaXhlbCBzY3JvbGxUb3A6ICR7ZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbFRvcH1gKVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgY29udGFpbmVyUG9zID0geyB0b3A6IHRoaXMuZWwub2Zmc2V0VG9wLCBsZWZ0OiB0aGlzLmVsLm9mZnNldExlZnQgfTtcclxuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coYGdldENlbGxGcm9tUGl4ZWwgb2Zmc2V0VG9wOiAke2NvbnRhaW5lclBvcy5sZWZ0fSBvZmZzZXRMZWZ0OiAke2NvbnRhaW5lclBvcy50b3B9YClcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IHJlbGF0aXZlTGVmdCA9IHBvc2l0aW9uLmxlZnQgLSBjb250YWluZXJQb3MubGVmdDtcclxuICAgICAgICBsZXQgcmVsYXRpdmVUb3AgPSBwb3NpdGlvbi50b3AgLSBjb250YWluZXJQb3MudG9wO1xyXG4gICAgICAgIGxldCBjb2x1bW5XaWR0aCA9IChib3gud2lkdGggLyB0aGlzLmdldENvbHVtbigpKTtcclxuICAgICAgICBsZXQgcm93SGVpZ2h0ID0gKGJveC5oZWlnaHQgLyBwYXJzZUludCh0aGlzLmVsLmdldEF0dHJpYnV0ZSgnZ3MtY3VycmVudC1yb3cnKSkpO1xyXG4gICAgICAgIHJldHVybiB7IHg6IE1hdGguZmxvb3IocmVsYXRpdmVMZWZ0IC8gY29sdW1uV2lkdGgpLCB5OiBNYXRoLmZsb29yKHJlbGF0aXZlVG9wIC8gcm93SGVpZ2h0KSB9O1xyXG4gICAgfVxyXG4gICAgLyoqIHJldHVybnMgdGhlIGN1cnJlbnQgbnVtYmVyIG9mIHJvd3MsIHdoaWNoIHdpbGwgYmUgYXQgbGVhc3QgYG1pblJvd2AgaWYgc2V0ICovXHJcbiAgICBnZXRSb3coKSB7XHJcbiAgICAgICAgcmV0dXJuIE1hdGgubWF4KHRoaXMuZW5naW5lLmdldFJvdygpLCB0aGlzLm9wdHMubWluUm93KTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogQ2hlY2tzIGlmIHNwZWNpZmllZCBhcmVhIGlzIGVtcHR5LlxyXG4gICAgICogQHBhcmFtIHggdGhlIHBvc2l0aW9uIHguXHJcbiAgICAgKiBAcGFyYW0geSB0aGUgcG9zaXRpb24geS5cclxuICAgICAqIEBwYXJhbSB3IHRoZSB3aWR0aCBvZiB0byBjaGVja1xyXG4gICAgICogQHBhcmFtIGggdGhlIGhlaWdodCBvZiB0byBjaGVja1xyXG4gICAgICovXHJcbiAgICBpc0FyZWFFbXB0eSh4LCB5LCB3LCBoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZW5naW5lLmlzQXJlYUVtcHR5KHgsIHksIHcsIGgpO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBJZiB5b3UgYWRkIGVsZW1lbnRzIHRvIHlvdXIgZ3JpZCBieSBoYW5kLCB5b3UgaGF2ZSB0byB0ZWxsIGdyaWRzdGFjayBhZnRlcndhcmRzIHRvIG1ha2UgdGhlbSB3aWRnZXRzLlxyXG4gICAgICogSWYgeW91IHdhbnQgZ3JpZHN0YWNrIHRvIGFkZCB0aGUgZWxlbWVudHMgZm9yIHlvdSwgdXNlIGBhZGRXaWRnZXQoKWAgaW5zdGVhZC5cclxuICAgICAqIE1ha2VzIHRoZSBnaXZlbiBlbGVtZW50IGEgd2lkZ2V0IGFuZCByZXR1cm5zIGl0LlxyXG4gICAgICogQHBhcmFtIGVscyB3aWRnZXQgb3Igc2luZ2xlIHNlbGVjdG9yIHRvIGNvbnZlcnQuXHJcbiAgICAgKlxyXG4gICAgICogQGV4YW1wbGVcclxuICAgICAqIGxldCBncmlkID0gR3JpZFN0YWNrLmluaXQoKTtcclxuICAgICAqIGdyaWQuZWwuYXBwZW5kQ2hpbGQoJzxkaXYgaWQ9XCJnc2ktMVwiIGdzLXc9XCIzXCI+PC9kaXY+Jyk7XHJcbiAgICAgKiBncmlkLm1ha2VXaWRnZXQoJyNnc2ktMScpO1xyXG4gICAgICovXHJcbiAgICBtYWtlV2lkZ2V0KGVscykge1xyXG4gICAgICAgIGxldCBlbCA9IEdyaWRTdGFjay5nZXRFbGVtZW50KGVscyk7XHJcbiAgICAgICAgdGhpcy5fcHJlcGFyZUVsZW1lbnQoZWwsIHRydWUpO1xyXG4gICAgICAgIHRoaXMuX3VwZGF0ZUNvbnRhaW5lckhlaWdodCgpO1xyXG4gICAgICAgIHRoaXMuX3RyaWdnZXJBZGRFdmVudCgpO1xyXG4gICAgICAgIHRoaXMuX3RyaWdnZXJDaGFuZ2VFdmVudCgpO1xyXG4gICAgICAgIHJldHVybiBlbDtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogRXZlbnQgaGFuZGxlciB0aGF0IGV4dHJhY3RzIG91ciBDdXN0b21FdmVudCBkYXRhIG91dCBhdXRvbWF0aWNhbGx5IGZvciByZWNlaXZpbmcgY3VzdG9tXHJcbiAgICAgKiBub3RpZmljYXRpb25zIChzZWUgZG9jIGZvciBzdXBwb3J0ZWQgZXZlbnRzKVxyXG4gICAgICogQHBhcmFtIG5hbWUgb2YgdGhlIGV2ZW50IChzZWUgcG9zc2libGUgdmFsdWVzKSBvciBsaXN0IG9mIG5hbWVzIHNwYWNlIHNlcGFyYXRlZFxyXG4gICAgICogQHBhcmFtIGNhbGxiYWNrIGZ1bmN0aW9uIGNhbGxlZCB3aXRoIGV2ZW50IGFuZCBvcHRpb25hbCBzZWNvbmQvdGhpcmQgcGFyYW1cclxuICAgICAqIChzZWUgUkVBRE1FIGRvY3VtZW50YXRpb24gZm9yIGVhY2ggc2lnbmF0dXJlKS5cclxuICAgICAqXHJcbiAgICAgKiBAZXhhbXBsZVxyXG4gICAgICogZ3JpZC5vbignYWRkZWQnLCBmdW5jdGlvbihlLCBpdGVtcykgeyBsb2coJ2FkZGVkICcsIGl0ZW1zKX0gKTtcclxuICAgICAqIG9yXHJcbiAgICAgKiBncmlkLm9uKCdhZGRlZCByZW1vdmVkIGNoYW5nZScsIGZ1bmN0aW9uKGUsIGl0ZW1zKSB7IGxvZyhlLnR5cGUsIGl0ZW1zKX0gKTtcclxuICAgICAqXHJcbiAgICAgKiBOb3RlOiBpbiBzb21lIGNhc2VzIGl0IGlzIHRoZSBzYW1lIGFzIGNhbGxpbmcgbmF0aXZlIGhhbmRsZXIgYW5kIHBhcnNpbmcgdGhlIGV2ZW50LlxyXG4gICAgICogZ3JpZC5lbC5hZGRFdmVudExpc3RlbmVyKCdhZGRlZCcsIGZ1bmN0aW9uKGV2ZW50KSB7IGxvZygnYWRkZWQgJywgZXZlbnQuZGV0YWlsKX0gKTtcclxuICAgICAqXHJcbiAgICAgKi9cclxuICAgIG9uKG5hbWUsIGNhbGxiYWNrKSB7XHJcbiAgICAgICAgLy8gY2hlY2sgZm9yIGFycmF5IG9mIG5hbWVzIGJlaW5nIHBhc3NlZCBpbnN0ZWFkXHJcbiAgICAgICAgaWYgKG5hbWUuaW5kZXhPZignICcpICE9PSAtMSkge1xyXG4gICAgICAgICAgICBsZXQgbmFtZXMgPSBuYW1lLnNwbGl0KCcgJyk7XHJcbiAgICAgICAgICAgIG5hbWVzLmZvckVhY2gobmFtZSA9PiB0aGlzLm9uKG5hbWUsIGNhbGxiYWNrKSk7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAobmFtZSA9PT0gJ2NoYW5nZScgfHwgbmFtZSA9PT0gJ2FkZGVkJyB8fCBuYW1lID09PSAncmVtb3ZlZCcgfHwgbmFtZSA9PT0gJ2VuYWJsZScgfHwgbmFtZSA9PT0gJ2Rpc2FibGUnKSB7XHJcbiAgICAgICAgICAgIC8vIG5hdGl2ZSBDdXN0b21FdmVudCBoYW5kbGVycyAtIGNhc2ggdGhlIGdlbmVyaWMgaGFuZGxlcnMgc28gd2UgY2FuIGVhc2lseSByZW1vdmVcclxuICAgICAgICAgICAgbGV0IG5vRGF0YSA9IChuYW1lID09PSAnZW5hYmxlJyB8fCBuYW1lID09PSAnZGlzYWJsZScpO1xyXG4gICAgICAgICAgICBpZiAobm9EYXRhKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9nc0V2ZW50SGFuZGxlcltuYW1lXSA9IChldmVudCkgPT4gY2FsbGJhY2soZXZlbnQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fZ3NFdmVudEhhbmRsZXJbbmFtZV0gPSAoZXZlbnQpID0+IGNhbGxiYWNrKGV2ZW50LCBldmVudC5kZXRhaWwpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuZWwuYWRkRXZlbnRMaXN0ZW5lcihuYW1lLCB0aGlzLl9nc0V2ZW50SGFuZGxlcltuYW1lXSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKG5hbWUgPT09ICdkcmFnJyB8fCBuYW1lID09PSAnZHJhZ3N0YXJ0JyB8fCBuYW1lID09PSAnZHJhZ3N0b3AnIHx8IG5hbWUgPT09ICdyZXNpemVzdGFydCcgfHwgbmFtZSA9PT0gJ3Jlc2l6ZScgfHwgbmFtZSA9PT0gJ3Jlc2l6ZXN0b3AnIHx8IG5hbWUgPT09ICdkcm9wcGVkJykge1xyXG4gICAgICAgICAgICAvLyBkcmFnJmRyb3Agc3RvcCBldmVudHMgTkVFRCB0byBiZSBjYWxsIHRoZW0gQUZURVIgd2UgdXBkYXRlIG5vZGUgYXR0cmlidXRlcyBzbyBoYW5kbGUgdGhlbSBvdXJzZWxmLlxyXG4gICAgICAgICAgICAvLyBkbyBzYW1lIGZvciBzdGFydCBldmVudCB0byBtYWtlIGl0IGVhc2llci4uLlxyXG4gICAgICAgICAgICB0aGlzLl9nc0V2ZW50SGFuZGxlcltuYW1lXSA9IGNhbGxiYWNrO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ0dyaWRTdGFjay5vbignICsgbmFtZSArICcpIGV2ZW50IG5vdCBzdXBwb3J0ZWQsIGJ1dCB5b3UgY2FuIHN0aWxsIHVzZSAkKFwiLmdyaWQtc3RhY2tcIikub24oLi4uKSB3aGlsZSBqcXVlcnktdWkgaXMgc3RpbGwgdXNlZCBpbnRlcm5hbGx5LicpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogdW5zdWJzY3JpYmUgZnJvbSB0aGUgJ29uJyBldmVudCBiZWxvd1xyXG4gICAgICogQHBhcmFtIG5hbWUgb2YgdGhlIGV2ZW50IChzZWUgcG9zc2libGUgdmFsdWVzKVxyXG4gICAgICovXHJcbiAgICBvZmYobmFtZSkge1xyXG4gICAgICAgIC8vIGNoZWNrIGZvciBhcnJheSBvZiBuYW1lcyBiZWluZyBwYXNzZWQgaW5zdGVhZFxyXG4gICAgICAgIGlmIChuYW1lLmluZGV4T2YoJyAnKSAhPT0gLTEpIHtcclxuICAgICAgICAgICAgbGV0IG5hbWVzID0gbmFtZS5zcGxpdCgnICcpO1xyXG4gICAgICAgICAgICBuYW1lcy5mb3JFYWNoKG5hbWUgPT4gdGhpcy5vZmYobmFtZSkpO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKG5hbWUgPT09ICdjaGFuZ2UnIHx8IG5hbWUgPT09ICdhZGRlZCcgfHwgbmFtZSA9PT0gJ3JlbW92ZWQnIHx8IG5hbWUgPT09ICdlbmFibGUnIHx8IG5hbWUgPT09ICdkaXNhYmxlJykge1xyXG4gICAgICAgICAgICAvLyByZW1vdmUgbmF0aXZlIEN1c3RvbUV2ZW50IGhhbmRsZXJzXHJcbiAgICAgICAgICAgIGlmICh0aGlzLl9nc0V2ZW50SGFuZGxlcltuYW1lXSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5lbC5yZW1vdmVFdmVudExpc3RlbmVyKG5hbWUsIHRoaXMuX2dzRXZlbnRIYW5kbGVyW25hbWVdKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBkZWxldGUgdGhpcy5fZ3NFdmVudEhhbmRsZXJbbmFtZV07XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIFJlbW92ZXMgd2lkZ2V0IGZyb20gdGhlIGdyaWQuXHJcbiAgICAgKiBAcGFyYW0gZWwgIHdpZGdldCBvciBzZWxlY3RvciB0byBtb2RpZnlcclxuICAgICAqIEBwYXJhbSByZW1vdmVET00gaWYgYGZhbHNlYCBET00gZWxlbWVudCB3b24ndCBiZSByZW1vdmVkIGZyb20gdGhlIHRyZWUgKERlZmF1bHQ/IHRydWUpLlxyXG4gICAgICogQHBhcmFtIHRyaWdnZXJFdmVudCBpZiBgZmFsc2VgIChxdWlldCBtb2RlKSBlbGVtZW50IHdpbGwgbm90IGJlIGFkZGVkIHRvIHJlbW92ZWQgbGlzdCBhbmQgbm8gJ3JlbW92ZWQnIGNhbGxiYWNrcyB3aWxsIGJlIGNhbGxlZCAoRGVmYXVsdD8gdHJ1ZSkuXHJcbiAgICAgKi9cclxuICAgIHJlbW92ZVdpZGdldChlbHMsIHJlbW92ZURPTSA9IHRydWUsIHRyaWdnZXJFdmVudCA9IHRydWUpIHtcclxuICAgICAgICBHcmlkU3RhY2suZ2V0RWxlbWVudHMoZWxzKS5mb3JFYWNoKGVsID0+IHtcclxuICAgICAgICAgICAgaWYgKGVsLnBhcmVudEVsZW1lbnQgJiYgZWwucGFyZW50RWxlbWVudCAhPT0gdGhpcy5lbClcclxuICAgICAgICAgICAgICAgIHJldHVybjsgLy8gbm90IG91ciBjaGlsZCFcclxuICAgICAgICAgICAgbGV0IG5vZGUgPSBlbC5ncmlkc3RhY2tOb2RlO1xyXG4gICAgICAgICAgICAvLyBGb3IgTWV0ZW9yIHN1cHBvcnQ6IGh0dHBzOi8vZ2l0aHViLmNvbS9ncmlkc3RhY2svZ3JpZHN0YWNrLmpzL3B1bGwvMjcyXHJcbiAgICAgICAgICAgIGlmICghbm9kZSkge1xyXG4gICAgICAgICAgICAgICAgbm9kZSA9IHRoaXMuZW5naW5lLm5vZGVzLmZpbmQobiA9PiBlbCA9PT0gbi5lbCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKCFub2RlKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAvLyByZW1vdmUgb3VyIERPTSBkYXRhIChjaXJjdWxhciBsaW5rKSBhbmQgZHJhZyZkcm9wIHBlcm1hbmVudGx5XHJcbiAgICAgICAgICAgIGRlbGV0ZSBlbC5ncmlkc3RhY2tOb2RlO1xyXG4gICAgICAgICAgICB0aGlzLl9yZW1vdmVERChlbCk7XHJcbiAgICAgICAgICAgIHRoaXMuZW5naW5lLnJlbW92ZU5vZGUobm9kZSwgcmVtb3ZlRE9NLCB0cmlnZ2VyRXZlbnQpO1xyXG4gICAgICAgICAgICBpZiAocmVtb3ZlRE9NICYmIGVsLnBhcmVudEVsZW1lbnQpIHtcclxuICAgICAgICAgICAgICAgIGVsLnJlbW92ZSgpOyAvLyBpbiBiYXRjaCBtb2RlIGVuZ2luZS5yZW1vdmVOb2RlIGRvZXNuJ3QgY2FsbCBiYWNrIHRvIHJlbW92ZSBET01cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGlmICh0cmlnZ2VyRXZlbnQpIHtcclxuICAgICAgICAgICAgdGhpcy5fdHJpZ2dlclJlbW92ZUV2ZW50KCk7XHJcbiAgICAgICAgICAgIHRoaXMuX3RyaWdnZXJDaGFuZ2VFdmVudCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogUmVtb3ZlcyBhbGwgd2lkZ2V0cyBmcm9tIHRoZSBncmlkLlxyXG4gICAgICogQHBhcmFtIHJlbW92ZURPTSBpZiBgZmFsc2VgIERPTSBlbGVtZW50cyB3b24ndCBiZSByZW1vdmVkIGZyb20gdGhlIHRyZWUgKERlZmF1bHQ/IGB0cnVlYCkuXHJcbiAgICAgKi9cclxuICAgIHJlbW92ZUFsbChyZW1vdmVET00gPSB0cnVlKSB7XHJcbiAgICAgICAgLy8gYWx3YXlzIHJlbW92ZSBvdXIgRE9NIGRhdGEgKGNpcmN1bGFyIGxpbmspIGJlZm9yZSBsaXN0IGdldHMgZW1wdGllZCBhbmQgZHJhZyZkcm9wIHBlcm1hbmVudGx5XHJcbiAgICAgICAgdGhpcy5lbmdpbmUubm9kZXMuZm9yRWFjaChuID0+IHtcclxuICAgICAgICAgICAgZGVsZXRlIG4uZWwuZ3JpZHN0YWNrTm9kZTtcclxuICAgICAgICAgICAgdGhpcy5fcmVtb3ZlREQobi5lbCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5lbmdpbmUucmVtb3ZlQWxsKHJlbW92ZURPTSk7XHJcbiAgICAgICAgdGhpcy5fdHJpZ2dlclJlbW92ZUV2ZW50KCk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIFRvZ2dsZSB0aGUgZ3JpZCBhbmltYXRpb24gc3RhdGUuICBUb2dnbGVzIHRoZSBgZ3JpZC1zdGFjay1hbmltYXRlYCBjbGFzcy5cclxuICAgICAqIEBwYXJhbSBkb0FuaW1hdGUgaWYgdHJ1ZSB0aGUgZ3JpZCB3aWxsIGFuaW1hdGUuXHJcbiAgICAgKi9cclxuICAgIHNldEFuaW1hdGlvbihkb0FuaW1hdGUpIHtcclxuICAgICAgICBpZiAoZG9BbmltYXRlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZWwuY2xhc3NMaXN0LmFkZCgnZ3JpZC1zdGFjay1hbmltYXRlJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmVsLmNsYXNzTGlzdC5yZW1vdmUoJ2dyaWQtc3RhY2stYW5pbWF0ZScpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogVG9nZ2xlIHRoZSBncmlkIHN0YXRpYyBzdGF0ZSwgd2hpY2ggcGVybWFuZW50bHkgcmVtb3Zlcy9hZGQgRHJhZyZEcm9wIHN1cHBvcnQsIHVubGlrZSBkaXNhYmxlKCkvZW5hYmxlKCkgdGhhdCBqdXN0IHR1cm5zIGl0IG9mZi9vbi5cclxuICAgICAqIEFsc28gdG9nZ2xlIHRoZSBncmlkLXN0YWNrLXN0YXRpYyBjbGFzcy5cclxuICAgICAqIEBwYXJhbSB2YWwgaWYgdHJ1ZSB0aGUgZ3JpZCBiZWNvbWUgc3RhdGljLlxyXG4gICAgICogQHBhcmFtIHVwZGF0ZUNsYXNzIHRydWUgKGRlZmF1bHQpIGlmIGNzcyBjbGFzcyBnZXRzIHVwZGF0ZWRcclxuICAgICAqIEBwYXJhbSByZWN1cnNlIHRydWUgKGRlZmF1bHQpIGlmIHN1Yi1ncmlkcyBhbHNvIGdldCB1cGRhdGVkXHJcbiAgICAgKi9cclxuICAgIHNldFN0YXRpYyh2YWwsIHVwZGF0ZUNsYXNzID0gdHJ1ZSwgcmVjdXJzZSA9IHRydWUpIHtcclxuICAgICAgICBpZiAodGhpcy5vcHRzLnN0YXRpY0dyaWQgPT09IHZhbClcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgdGhpcy5vcHRzLnN0YXRpY0dyaWQgPSB2YWw7XHJcbiAgICAgICAgdGhpcy5fc2V0dXBSZW1vdmVEcm9wKCk7XHJcbiAgICAgICAgdGhpcy5fc2V0dXBBY2NlcHRXaWRnZXQoKTtcclxuICAgICAgICB0aGlzLmVuZ2luZS5ub2Rlcy5mb3JFYWNoKG4gPT4ge1xyXG4gICAgICAgICAgICB0aGlzLl9wcmVwYXJlRHJhZ0Ryb3BCeU5vZGUobik7IC8vIGVpdGhlciBkZWxldGUgb3IgaW5pdCBEcmFnJmRyb3BcclxuICAgICAgICAgICAgaWYgKG4uc3ViR3JpZCAmJiByZWN1cnNlKVxyXG4gICAgICAgICAgICAgICAgbi5zdWJHcmlkLnNldFN0YXRpYyh2YWwsIHVwZGF0ZUNsYXNzLCByZWN1cnNlKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBpZiAodXBkYXRlQ2xhc3MpIHtcclxuICAgICAgICAgICAgdGhpcy5fc2V0U3RhdGljQ2xhc3MoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIFVwZGF0ZXMgd2lkZ2V0IHBvc2l0aW9uL3NpemUgYW5kIG90aGVyIGluZm8uIE5vdGU6IGlmIHlvdSBuZWVkIHRvIGNhbGwgdGhpcyBvbiBhbGwgbm9kZXMsIHVzZSBsb2FkKCkgaW5zdGVhZCB3aGljaCB3aWxsIHVwZGF0ZSB3aGF0IGNoYW5nZWQuXHJcbiAgICAgKiBAcGFyYW0gZWxzICB3aWRnZXQgb3Igc2VsZWN0b3Igb2Ygb2JqZWN0cyB0byBtb2RpZnkgKG5vdGU6IHNldHRpbmcgdGhlIHNhbWUgeCx5IGZvciBtdWx0aXBsZSBpdGVtcyB3aWxsIGJlIGluZGV0ZXJtaW5pc3RpYyBhbmQgbGlrZWx5IHVud2FudGVkKVxyXG4gICAgICogQHBhcmFtIG9wdCBuZXcgd2lkZ2V0IG9wdGlvbnMgKHgseSx3LGgsIGV0Yy4uKS4gT25seSB0aG9zZSBzZXQgd2lsbCBiZSB1cGRhdGVkLlxyXG4gICAgICovXHJcbiAgICB1cGRhdGUoZWxzLCBvcHQpIHtcclxuICAgICAgICAvLyBzdXBwb3J0IGxlZ2FjeSBjYWxsIGZvciBub3cgP1xyXG4gICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMikge1xyXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oJ2dyaWRzdGFjay50czogYHVwZGF0ZShlbCwgeCwgeSwgdywgaClgIGlzIGRlcHJlY2F0ZWQuIFVzZSBgdXBkYXRlKGVsLCB7eCwgdywgY29udGVudCwgLi4ufSlgLiBJdCB3aWxsIGJlIHJlbW92ZWQgc29vbicpO1xyXG4gICAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgcHJlZmVyLXJlc3QtcGFyYW1zXHJcbiAgICAgICAgICAgIGxldCBhID0gYXJndW1lbnRzLCBpID0gMTtcclxuICAgICAgICAgICAgb3B0ID0geyB4OiBhW2krK10sIHk6IGFbaSsrXSwgdzogYVtpKytdLCBoOiBhW2krK10gfTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMudXBkYXRlKGVscywgb3B0KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgR3JpZFN0YWNrLmdldEVsZW1lbnRzKGVscykuZm9yRWFjaChlbCA9PiB7XHJcbiAgICAgICAgICAgIGlmICghZWwgfHwgIWVsLmdyaWRzdGFja05vZGUpXHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIGxldCBuID0gZWwuZ3JpZHN0YWNrTm9kZTtcclxuICAgICAgICAgICAgbGV0IHcgPSB1dGlsc18xLlV0aWxzLmNsb25lRGVlcChvcHQpOyAvLyBtYWtlIGEgY29weSB3ZSBjYW4gbW9kaWZ5IGluIGNhc2UgdGhleSByZS11c2UgaXQgb3IgbXVsdGlwbGUgaXRlbXNcclxuICAgICAgICAgICAgZGVsZXRlIHcuYXV0b1Bvc2l0aW9uO1xyXG4gICAgICAgICAgICAvLyBtb3ZlL3Jlc2l6ZSB3aWRnZXQgaWYgYW55dGhpbmcgY2hhbmdlZFxyXG4gICAgICAgICAgICBsZXQga2V5cyA9IFsneCcsICd5JywgJ3cnLCAnaCddO1xyXG4gICAgICAgICAgICBsZXQgbTtcclxuICAgICAgICAgICAgaWYgKGtleXMuc29tZShrID0+IHdba10gIT09IHVuZGVmaW5lZCAmJiB3W2tdICE9PSBuW2tdKSkge1xyXG4gICAgICAgICAgICAgICAgbSA9IHt9O1xyXG4gICAgICAgICAgICAgICAga2V5cy5mb3JFYWNoKGsgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIG1ba10gPSAod1trXSAhPT0gdW5kZWZpbmVkKSA/IHdba10gOiBuW2tdO1xyXG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSB3W2tdO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8gZm9yIGEgbW92ZSBhcyB3ZWxsIElGRiB0aGVyZSBpcyBhbnkgbWluL21heCBmaWVsZHMgc2V0XHJcbiAgICAgICAgICAgIGlmICghbSAmJiAody5taW5XIHx8IHcubWluSCB8fCB3Lm1heFcgfHwgdy5tYXhIKSkge1xyXG4gICAgICAgICAgICAgICAgbSA9IHt9OyAvLyB3aWxsIHVzZSBub2RlIHBvc2l0aW9uIGJ1dCB2YWxpZGF0ZSB2YWx1ZXNcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvLyBjaGVjayBmb3IgY29udGVudCBjaGFuZ2luZ1xyXG4gICAgICAgICAgICBpZiAody5jb250ZW50KSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgc3ViID0gZWwucXVlcnlTZWxlY3RvcignLmdyaWQtc3RhY2staXRlbS1jb250ZW50Jyk7XHJcbiAgICAgICAgICAgICAgICBpZiAoc3ViICYmIHN1Yi5pbm5lckhUTUwgIT09IHcuY29udGVudCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHN1Yi5pbm5lckhUTUwgPSB3LmNvbnRlbnQ7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBkZWxldGUgdy5jb250ZW50O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIGFueSByZW1haW5pbmcgZmllbGRzIGFyZSBhc3NpZ25lZCwgYnV0IGNoZWNrIGZvciBkcmFnZ2luZyBjaGFuZ2VzLCByZXNpemUgY29uc3RyYWluXHJcbiAgICAgICAgICAgIGxldCBjaGFuZ2VkID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGxldCBkZENoYW5nZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgZm9yIChjb25zdCBrZXkgaW4gdykge1xyXG4gICAgICAgICAgICAgICAgaWYgKGtleVswXSAhPT0gJ18nICYmIG5ba2V5XSAhPT0gd1trZXldKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbltrZXldID0gd1trZXldO1xyXG4gICAgICAgICAgICAgICAgICAgIGNoYW5nZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIGRkQ2hhbmdlZCA9IGRkQ2hhbmdlZCB8fCAoIXRoaXMub3B0cy5zdGF0aWNHcmlkICYmIChrZXkgPT09ICdub1Jlc2l6ZScgfHwga2V5ID09PSAnbm9Nb3ZlJyB8fCBrZXkgPT09ICdsb2NrZWQnKSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8gZmluYWxseSBtb3ZlIHRoZSB3aWRnZXRcclxuICAgICAgICAgICAgaWYgKG0pIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZW5naW5lLmNsZWFuTm9kZXMoKVxyXG4gICAgICAgICAgICAgICAgICAgIC5iZWdpblVwZGF0ZShuKVxyXG4gICAgICAgICAgICAgICAgICAgIC5tb3ZlTm9kZShuLCBtKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3VwZGF0ZUNvbnRhaW5lckhlaWdodCgpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fdHJpZ2dlckNoYW5nZUV2ZW50KCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmVuZ2luZS5lbmRVcGRhdGUoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoY2hhbmdlZCkgeyAvLyBtb3ZlIHdpbGwgb25seSB1cGRhdGUgeCx5LHcsaCBzbyB1cGRhdGUgdGhlIHJlc3QgdG9vXHJcbiAgICAgICAgICAgICAgICB0aGlzLl93cml0ZUF0dHIoZWwsIG4pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChkZENoYW5nZWQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3ByZXBhcmVEcmFnRHJvcEJ5Tm9kZShuKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBVcGRhdGVzIHRoZSBtYXJnaW5zIHdoaWNoIHdpbGwgc2V0IGFsbCA0IHNpZGVzIGF0IG9uY2UgLSBzZWUgYEdyaWRTdGFja09wdGlvbnMubWFyZ2luYCBmb3IgZm9ybWF0IG9wdGlvbnMgKENTUyBzdHJpbmcgZm9ybWF0IG9mIDEsMiw0IHZhbHVlcyBvciBzaW5nbGUgbnVtYmVyKS5cclxuICAgICAqIEBwYXJhbSB2YWx1ZSBtYXJnaW4gdmFsdWVcclxuICAgICAqL1xyXG4gICAgbWFyZ2luKHZhbHVlKSB7XHJcbiAgICAgICAgbGV0IGlzTXVsdGlWYWx1ZSA9ICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnICYmIHZhbHVlLnNwbGl0KCcgJykubGVuZ3RoID4gMSk7XHJcbiAgICAgICAgLy8gY2hlY2sgaWYgd2UgY2FuIHNraXAgcmUtY3JlYXRpbmcgb3VyIENTUyBmaWxlLi4uIHdvbid0IGNoZWNrIGlmIG11bHRpIHZhbHVlcyAodG9vIG11Y2ggaGFzc2xlKVxyXG4gICAgICAgIGlmICghaXNNdWx0aVZhbHVlKSB7XHJcbiAgICAgICAgICAgIGxldCBkYXRhID0gdXRpbHNfMS5VdGlscy5wYXJzZUhlaWdodCh2YWx1ZSk7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLm9wdHMubWFyZ2luVW5pdCA9PT0gZGF0YS51bml0ICYmIHRoaXMub3B0cy5tYXJnaW4gPT09IGRhdGEuaClcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gcmUtdXNlIGV4aXN0aW5nIG1hcmdpbiBoYW5kbGluZ1xyXG4gICAgICAgIHRoaXMub3B0cy5tYXJnaW4gPSB2YWx1ZTtcclxuICAgICAgICB0aGlzLm9wdHMubWFyZ2luVG9wID0gdGhpcy5vcHRzLm1hcmdpbkJvdHRvbSA9IHRoaXMub3B0cy5tYXJnaW5MZWZ0ID0gdGhpcy5vcHRzLm1hcmdpblJpZ2h0ID0gdW5kZWZpbmVkO1xyXG4gICAgICAgIHRoaXMuX2luaXRNYXJnaW4oKTtcclxuICAgICAgICB0aGlzLl91cGRhdGVTdHlsZXModHJ1ZSk7IC8vIHRydWUgPSBmb3JjZSByZS1jcmVhdGVcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuICAgIC8qKiByZXR1cm5zIGN1cnJlbnQgbWFyZ2luIG51bWJlciB2YWx1ZSAodW5kZWZpbmVkIGlmIDQgc2lkZXMgZG9uJ3QgbWF0Y2gpICovXHJcbiAgICBnZXRNYXJnaW4oKSB7IHJldHVybiB0aGlzLm9wdHMubWFyZ2luOyB9XHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdHJ1ZSBpZiB0aGUgaGVpZ2h0IG9mIHRoZSBncmlkIHdpbGwgYmUgbGVzcyB0aGFuIHRoZSB2ZXJ0aWNhbFxyXG4gICAgICogY29uc3RyYWludC4gQWx3YXlzIHJldHVybnMgdHJ1ZSBpZiBncmlkIGRvZXNuJ3QgaGF2ZSBoZWlnaHQgY29uc3RyYWludC5cclxuICAgICAqIEBwYXJhbSBub2RlIGNvbnRhaW5zIHgseSx3LGgsYXV0by1wb3NpdGlvbiBvcHRpb25zXHJcbiAgICAgKlxyXG4gICAgICogQGV4YW1wbGVcclxuICAgICAqIGlmIChncmlkLndpbGxJdEZpdChuZXdXaWRnZXQpKSB7XHJcbiAgICAgKiAgIGdyaWQuYWRkV2lkZ2V0KG5ld1dpZGdldCk7XHJcbiAgICAgKiB9IGVsc2Uge1xyXG4gICAgICogICBhbGVydCgnTm90IGVub3VnaCBmcmVlIHNwYWNlIHRvIHBsYWNlIHRoZSB3aWRnZXQnKTtcclxuICAgICAqIH1cclxuICAgICAqL1xyXG4gICAgd2lsbEl0Rml0KG5vZGUpIHtcclxuICAgICAgICAvLyBzdXBwb3J0IGxlZ2FjeSBjYWxsIGZvciBub3dcclxuICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDEpIHtcclxuICAgICAgICAgICAgY29uc29sZS53YXJuKCdncmlkc3RhY2sudHM6IGB3aWxsSXRGaXQoeCx5LHcsaCxhdXRvUG9zaXRpb24pYCBpcyBkZXByZWNhdGVkLiBVc2UgYHdpbGxJdEZpdCh7eCwgeSwuLi59KWAuIEl0IHdpbGwgYmUgcmVtb3ZlZCBzb29uJyk7XHJcbiAgICAgICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBwcmVmZXItcmVzdC1wYXJhbXNcclxuICAgICAgICAgICAgbGV0IGEgPSBhcmd1bWVudHMsIGkgPSAwLCB3ID0geyB4OiBhW2krK10sIHk6IGFbaSsrXSwgdzogYVtpKytdLCBoOiBhW2krK10sIGF1dG9Qb3NpdGlvbjogYVtpKytdIH07XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLndpbGxJdEZpdCh3KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZW5naW5lLndpbGxJdEZpdChub2RlKTtcclxuICAgIH1cclxuICAgIC8qKiBAaW50ZXJuYWwgKi9cclxuICAgIF90cmlnZ2VyQ2hhbmdlRXZlbnQoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuZW5naW5lLmJhdGNoTW9kZSlcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgbGV0IGVsZW1lbnRzID0gdGhpcy5lbmdpbmUuZ2V0RGlydHlOb2Rlcyh0cnVlKTsgLy8gdmVyaWZ5IHRoZXkgcmVhbGx5IGNoYW5nZWRcclxuICAgICAgICBpZiAoZWxlbWVudHMgJiYgZWxlbWVudHMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5faWdub3JlTGF5b3V0c05vZGVDaGFuZ2UpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZW5naW5lLmxheW91dHNOb2Rlc0NoYW5nZShlbGVtZW50cyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5fdHJpZ2dlckV2ZW50KCdjaGFuZ2UnLCBlbGVtZW50cyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuZW5naW5lLnNhdmVJbml0aWFsKCk7IC8vIHdlIGNhbGxlZCwgbm93IHJlc2V0IGluaXRpYWwgdmFsdWVzICYgZGlydHkgZmxhZ3NcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuICAgIC8qKiBAaW50ZXJuYWwgKi9cclxuICAgIF90cmlnZ2VyQWRkRXZlbnQoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuZW5naW5lLmJhdGNoTW9kZSlcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgaWYgKHRoaXMuZW5naW5lLmFkZGVkTm9kZXMgJiYgdGhpcy5lbmdpbmUuYWRkZWROb2Rlcy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5faWdub3JlTGF5b3V0c05vZGVDaGFuZ2UpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZW5naW5lLmxheW91dHNOb2Rlc0NoYW5nZSh0aGlzLmVuZ2luZS5hZGRlZE5vZGVzKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvLyBwcmV2ZW50IGFkZGVkIG5vZGVzIGZyb20gYWxzbyB0cmlnZ2VyaW5nICdjaGFuZ2UnIGV2ZW50ICh3aGljaCBpcyBjYWxsZWQgbmV4dClcclxuICAgICAgICAgICAgdGhpcy5lbmdpbmUuYWRkZWROb2Rlcy5mb3JFYWNoKG4gPT4geyBkZWxldGUgbi5fZGlydHk7IH0pO1xyXG4gICAgICAgICAgICB0aGlzLl90cmlnZ2VyRXZlbnQoJ2FkZGVkJywgdGhpcy5lbmdpbmUuYWRkZWROb2Rlcyk7XHJcbiAgICAgICAgICAgIHRoaXMuZW5naW5lLmFkZGVkTm9kZXMgPSBbXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbiAgICAvKiogQGludGVybmFsICovXHJcbiAgICBfdHJpZ2dlclJlbW92ZUV2ZW50KCkge1xyXG4gICAgICAgIGlmICh0aGlzLmVuZ2luZS5iYXRjaE1vZGUpXHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIGlmICh0aGlzLmVuZ2luZS5yZW1vdmVkTm9kZXMgJiYgdGhpcy5lbmdpbmUucmVtb3ZlZE5vZGVzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgdGhpcy5fdHJpZ2dlckV2ZW50KCdyZW1vdmVkJywgdGhpcy5lbmdpbmUucmVtb3ZlZE5vZGVzKTtcclxuICAgICAgICAgICAgdGhpcy5lbmdpbmUucmVtb3ZlZE5vZGVzID0gW107XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG4gICAgLyoqIEBpbnRlcm5hbCAqL1xyXG4gICAgX3RyaWdnZXJFdmVudCh0eXBlLCBkYXRhKSB7XHJcbiAgICAgICAgbGV0IGV2ZW50ID0gZGF0YSA/IG5ldyBDdXN0b21FdmVudCh0eXBlLCB7IGJ1YmJsZXM6IGZhbHNlLCBkZXRhaWw6IGRhdGEgfSkgOiBuZXcgRXZlbnQodHlwZSk7XHJcbiAgICAgICAgdGhpcy5lbC5kaXNwYXRjaEV2ZW50KGV2ZW50KTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuICAgIC8qKiBAaW50ZXJuYWwgY2FsbGVkIHRvIGRlbGV0ZSB0aGUgY3VycmVudCBkeW5hbWljIHN0eWxlIHNoZWV0IHVzZWQgZm9yIG91ciBsYXlvdXQgKi9cclxuICAgIF9yZW1vdmVTdHlsZXNoZWV0KCkge1xyXG4gICAgICAgIGlmICh0aGlzLl9zdHlsZXMpIHtcclxuICAgICAgICAgICAgdXRpbHNfMS5VdGlscy5yZW1vdmVTdHlsZXNoZWV0KHRoaXMuX3N0eWxlU2hlZXRDbGFzcyk7XHJcbiAgICAgICAgICAgIGRlbGV0ZSB0aGlzLl9zdHlsZXM7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG4gICAgLyoqIEBpbnRlcm5hbCB1cGRhdGVkL2NyZWF0ZSB0aGUgQ1NTIHN0eWxlcyBmb3Igcm93IGJhc2VkIGxheW91dCBhbmQgaW5pdGlhbCBtYXJnaW4gc2V0dGluZyAqL1xyXG4gICAgX3VwZGF0ZVN0eWxlcyhmb3JjZVVwZGF0ZSA9IGZhbHNlLCBtYXhIKSB7XHJcbiAgICAgICAgLy8gY2FsbCB0byBkZWxldGUgZXhpc3Rpbmcgb25lIGlmIHdlIGNoYW5nZSBjZWxsSGVpZ2h0IC8gbWFyZ2luXHJcbiAgICAgICAgaWYgKGZvcmNlVXBkYXRlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3JlbW92ZVN0eWxlc2hlZXQoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCFtYXhIKVxyXG4gICAgICAgICAgICBtYXhIID0gdGhpcy5nZXRSb3coKTtcclxuICAgICAgICB0aGlzLl91cGRhdGVDb250YWluZXJIZWlnaHQoKTtcclxuICAgICAgICAvLyBpZiB1c2VyIGlzIHRlbGxpbmcgdXMgdGhleSB3aWxsIGhhbmRsZSB0aGUgQ1NTIHRoZW1zZWx2ZXMgYnkgc2V0dGluZyBoZWlnaHRzIHRvIDAuIERvIHdlIG5lZWQgdGhpcyBvcHRzIHJlYWxseSA/P1xyXG4gICAgICAgIGlmICh0aGlzLm9wdHMuY2VsbEhlaWdodCA9PT0gMCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IGNlbGxIZWlnaHQgPSB0aGlzLm9wdHMuY2VsbEhlaWdodDtcclxuICAgICAgICBsZXQgY2VsbEhlaWdodFVuaXQgPSB0aGlzLm9wdHMuY2VsbEhlaWdodFVuaXQ7XHJcbiAgICAgICAgbGV0IHByZWZpeCA9IGAuJHt0aGlzLl9zdHlsZVNoZWV0Q2xhc3N9ID4gLiR7dGhpcy5vcHRzLml0ZW1DbGFzc31gO1xyXG4gICAgICAgIC8vIGNyZWF0ZSBvbmUgYXMgbmVlZGVkXHJcbiAgICAgICAgaWYgKCF0aGlzLl9zdHlsZXMpIHtcclxuICAgICAgICAgICAgLy8gaW5zZXJ0IHN0eWxlIHRvIHBhcmVudCAoaW5zdGVhZCBvZiAnaGVhZCcgYnkgZGVmYXVsdCkgdG8gc3VwcG9ydCBXZWJDb21wb25lbnRcclxuICAgICAgICAgICAgbGV0IHN0eWxlTG9jYXRpb24gPSB0aGlzLm9wdHMuc3R5bGVJbkhlYWQgPyB1bmRlZmluZWQgOiB0aGlzLmVsLnBhcmVudE5vZGU7XHJcbiAgICAgICAgICAgIHRoaXMuX3N0eWxlcyA9IHV0aWxzXzEuVXRpbHMuY3JlYXRlU3R5bGVzaGVldCh0aGlzLl9zdHlsZVNoZWV0Q2xhc3MsIHN0eWxlTG9jYXRpb24sIHtcclxuICAgICAgICAgICAgICAgIG5vbmNlOiB0aGlzLm9wdHMubm9uY2UsXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMuX3N0eWxlcylcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgICAgICB0aGlzLl9zdHlsZXMuX21heCA9IDA7XHJcbiAgICAgICAgICAgIC8vIHRoZXNlIGFyZSBkb25lIG9uY2Ugb25seVxyXG4gICAgICAgICAgICB1dGlsc18xLlV0aWxzLmFkZENTU1J1bGUodGhpcy5fc3R5bGVzLCBwcmVmaXgsIGBtaW4taGVpZ2h0OiAke2NlbGxIZWlnaHR9JHtjZWxsSGVpZ2h0VW5pdH1gKTtcclxuICAgICAgICAgICAgLy8gY29udGVudCBtYXJnaW5zXHJcbiAgICAgICAgICAgIGxldCB0b3AgPSB0aGlzLm9wdHMubWFyZ2luVG9wICsgdGhpcy5vcHRzLm1hcmdpblVuaXQ7XHJcbiAgICAgICAgICAgIGxldCBib3R0b20gPSB0aGlzLm9wdHMubWFyZ2luQm90dG9tICsgdGhpcy5vcHRzLm1hcmdpblVuaXQ7XHJcbiAgICAgICAgICAgIGxldCByaWdodCA9IHRoaXMub3B0cy5tYXJnaW5SaWdodCArIHRoaXMub3B0cy5tYXJnaW5Vbml0O1xyXG4gICAgICAgICAgICBsZXQgbGVmdCA9IHRoaXMub3B0cy5tYXJnaW5MZWZ0ICsgdGhpcy5vcHRzLm1hcmdpblVuaXQ7XHJcbiAgICAgICAgICAgIGxldCBjb250ZW50ID0gYCR7cHJlZml4fSA+IC5ncmlkLXN0YWNrLWl0ZW0tY29udGVudGA7XHJcbiAgICAgICAgICAgIGxldCBwbGFjZWhvbGRlciA9IGAuJHt0aGlzLl9zdHlsZVNoZWV0Q2xhc3N9ID4gLmdyaWQtc3RhY2stcGxhY2Vob2xkZXIgPiAucGxhY2Vob2xkZXItY29udGVudGA7XHJcbiAgICAgICAgICAgIHV0aWxzXzEuVXRpbHMuYWRkQ1NTUnVsZSh0aGlzLl9zdHlsZXMsIGNvbnRlbnQsIGB0b3A6ICR7dG9wfTsgcmlnaHQ6ICR7cmlnaHR9OyBib3R0b206ICR7Ym90dG9tfTsgbGVmdDogJHtsZWZ0fTtgKTtcclxuICAgICAgICAgICAgdXRpbHNfMS5VdGlscy5hZGRDU1NSdWxlKHRoaXMuX3N0eWxlcywgcGxhY2Vob2xkZXIsIGB0b3A6ICR7dG9wfTsgcmlnaHQ6ICR7cmlnaHR9OyBib3R0b206ICR7Ym90dG9tfTsgbGVmdDogJHtsZWZ0fTtgKTtcclxuICAgICAgICAgICAgLy8gcmVzaXplIGhhbmRsZXMgb2Zmc2V0ICh0byBtYXRjaCBtYXJnaW4pXHJcbiAgICAgICAgICAgIHV0aWxzXzEuVXRpbHMuYWRkQ1NTUnVsZSh0aGlzLl9zdHlsZXMsIGAke3ByZWZpeH0gPiAudWktcmVzaXphYmxlLW5lYCwgYHJpZ2h0OiAke3JpZ2h0fWApO1xyXG4gICAgICAgICAgICB1dGlsc18xLlV0aWxzLmFkZENTU1J1bGUodGhpcy5fc3R5bGVzLCBgJHtwcmVmaXh9ID4gLnVpLXJlc2l6YWJsZS1lYCwgYHJpZ2h0OiAke3JpZ2h0fWApO1xyXG4gICAgICAgICAgICB1dGlsc18xLlV0aWxzLmFkZENTU1J1bGUodGhpcy5fc3R5bGVzLCBgJHtwcmVmaXh9ID4gLnVpLXJlc2l6YWJsZS1zZWAsIGByaWdodDogJHtyaWdodH07IGJvdHRvbTogJHtib3R0b219YCk7XHJcbiAgICAgICAgICAgIHV0aWxzXzEuVXRpbHMuYWRkQ1NTUnVsZSh0aGlzLl9zdHlsZXMsIGAke3ByZWZpeH0gPiAudWktcmVzaXphYmxlLW53YCwgYGxlZnQ6ICR7bGVmdH1gKTtcclxuICAgICAgICAgICAgdXRpbHNfMS5VdGlscy5hZGRDU1NSdWxlKHRoaXMuX3N0eWxlcywgYCR7cHJlZml4fSA+IC51aS1yZXNpemFibGUtd2AsIGBsZWZ0OiAke2xlZnR9YCk7XHJcbiAgICAgICAgICAgIHV0aWxzXzEuVXRpbHMuYWRkQ1NTUnVsZSh0aGlzLl9zdHlsZXMsIGAke3ByZWZpeH0gPiAudWktcmVzaXphYmxlLXN3YCwgYGxlZnQ6ICR7bGVmdH07IGJvdHRvbTogJHtib3R0b219YCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIG5vdyB1cGRhdGUgdGhlIGhlaWdodCBzcGVjaWZpYyBmaWVsZHNcclxuICAgICAgICBtYXhIID0gbWF4SCB8fCB0aGlzLl9zdHlsZXMuX21heDtcclxuICAgICAgICBpZiAobWF4SCA+IHRoaXMuX3N0eWxlcy5fbWF4KSB7XHJcbiAgICAgICAgICAgIGxldCBnZXRIZWlnaHQgPSAocm93cykgPT4gKGNlbGxIZWlnaHQgKiByb3dzKSArIGNlbGxIZWlnaHRVbml0O1xyXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gdGhpcy5fc3R5bGVzLl9tYXggKyAxOyBpIDw9IG1heEg7IGkrKykgeyAvLyBzdGFydCBhdCAxXHJcbiAgICAgICAgICAgICAgICBsZXQgaCA9IGdldEhlaWdodChpKTtcclxuICAgICAgICAgICAgICAgIHV0aWxzXzEuVXRpbHMuYWRkQ1NTUnVsZSh0aGlzLl9zdHlsZXMsIGAke3ByZWZpeH1bZ3MteT1cIiR7aSAtIDF9XCJdYCwgYHRvcDogJHtnZXRIZWlnaHQoaSAtIDEpfWApOyAvLyBzdGFydCBhdCAwXHJcbiAgICAgICAgICAgICAgICB1dGlsc18xLlV0aWxzLmFkZENTU1J1bGUodGhpcy5fc3R5bGVzLCBgJHtwcmVmaXh9W2dzLWg9XCIke2l9XCJdYCwgYGhlaWdodDogJHtofWApO1xyXG4gICAgICAgICAgICAgICAgdXRpbHNfMS5VdGlscy5hZGRDU1NSdWxlKHRoaXMuX3N0eWxlcywgYCR7cHJlZml4fVtncy1taW4taD1cIiR7aX1cIl1gLCBgbWluLWhlaWdodDogJHtofWApO1xyXG4gICAgICAgICAgICAgICAgdXRpbHNfMS5VdGlscy5hZGRDU1NSdWxlKHRoaXMuX3N0eWxlcywgYCR7cHJlZml4fVtncy1tYXgtaD1cIiR7aX1cIl1gLCBgbWF4LWhlaWdodDogJHtofWApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuX3N0eWxlcy5fbWF4ID0gbWF4SDtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbiAgICAvKiogQGludGVybmFsICovXHJcbiAgICBfdXBkYXRlQ29udGFpbmVySGVpZ2h0KCkge1xyXG4gICAgICAgIGlmICghdGhpcy5lbmdpbmUgfHwgdGhpcy5lbmdpbmUuYmF0Y2hNb2RlKVxyXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICBsZXQgcm93ID0gdGhpcy5nZXRSb3coKSArIHRoaXMuX2V4dHJhRHJhZ1JvdzsgLy8gY2hlY2tzIGZvciBtaW5Sb3cgYWxyZWFkeVxyXG4gICAgICAgIC8vIGNoZWNrIGZvciBjc3MgbWluIGhlaWdodFxyXG4gICAgICAgIC8vIE5vdGU6IHdlIGRvbid0IGhhbmRsZSAlLHJlbSBjb3JyZWN0bHkgc28gY29tbWVudCBvdXQsIGJlc2lkZSB3ZSBkb24ndCBuZWVkIG5lZWQgdG8gY3JlYXRlIHVuLW5lY2Vzc2FyeVxyXG4gICAgICAgIC8vIHJvd3MgYXMgdGhlIENTUyB3aWxsIG1ha2UgdXMgYmlnZ2VyIHRoYW4gb3VyIHNldCBoZWlnaHQgaWYgbmVlZGVkLi4uIG5vdCBzdXJlIHdoeSB3ZSBoYWQgdGhpcy5cclxuICAgICAgICAvLyBsZXQgY3NzTWluSGVpZ2h0ID0gcGFyc2VJbnQoZ2V0Q29tcHV0ZWRTdHlsZSh0aGlzLmVsKVsnbWluLWhlaWdodCddKTtcclxuICAgICAgICAvLyBpZiAoY3NzTWluSGVpZ2h0ID4gMCkge1xyXG4gICAgICAgIC8vICAgbGV0IG1pblJvdyA9IE1hdGgucm91bmQoY3NzTWluSGVpZ2h0IC8gdGhpcy5nZXRDZWxsSGVpZ2h0KHRydWUpKTtcclxuICAgICAgICAvLyAgIGlmIChyb3cgPCBtaW5Sb3cpIHtcclxuICAgICAgICAvLyAgICAgcm93ID0gbWluUm93O1xyXG4gICAgICAgIC8vICAgfVxyXG4gICAgICAgIC8vIH1cclxuICAgICAgICB0aGlzLmVsLnNldEF0dHJpYnV0ZSgnZ3MtY3VycmVudC1yb3cnLCBTdHJpbmcocm93KSk7XHJcbiAgICAgICAgaWYgKHJvdyA9PT0gMCkge1xyXG4gICAgICAgICAgICB0aGlzLmVsLnN0eWxlLnJlbW92ZVByb3BlcnR5KCdtaW4taGVpZ2h0Jyk7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgY2VsbEhlaWdodCA9IHRoaXMub3B0cy5jZWxsSGVpZ2h0O1xyXG4gICAgICAgIGxldCB1bml0ID0gdGhpcy5vcHRzLmNlbGxIZWlnaHRVbml0O1xyXG4gICAgICAgIGlmICghY2VsbEhlaWdodClcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgdGhpcy5lbC5zdHlsZS5taW5IZWlnaHQgPSByb3cgKiBjZWxsSGVpZ2h0ICsgdW5pdDtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuICAgIC8qKiBAaW50ZXJuYWwgKi9cclxuICAgIF9wcmVwYXJlRWxlbWVudChlbCwgdHJpZ2dlckFkZEV2ZW50ID0gZmFsc2UsIG5vZGUpIHtcclxuICAgICAgICBlbC5jbGFzc0xpc3QuYWRkKHRoaXMub3B0cy5pdGVtQ2xhc3MpO1xyXG4gICAgICAgIG5vZGUgPSBub2RlIHx8IHRoaXMuX3JlYWRBdHRyKGVsKTtcclxuICAgICAgICBlbC5ncmlkc3RhY2tOb2RlID0gbm9kZTtcclxuICAgICAgICBub2RlLmVsID0gZWw7XHJcbiAgICAgICAgbm9kZS5ncmlkID0gdGhpcztcclxuICAgICAgICBsZXQgY29weSA9IE9iamVjdC5hc3NpZ24oe30sIG5vZGUpO1xyXG4gICAgICAgIG5vZGUgPSB0aGlzLmVuZ2luZS5hZGROb2RlKG5vZGUsIHRyaWdnZXJBZGRFdmVudCk7XHJcbiAgICAgICAgLy8gd3JpdGUgbm9kZSBhdHRyIGJhY2sgaW4gY2FzZSB0aGVyZSB3YXMgY29sbGlzaW9uIG9yIHdlIGhhdmUgdG8gZml4IGJhZCB2YWx1ZXMgZHVyaW5nIGFkZE5vZGUoKVxyXG4gICAgICAgIGlmICghdXRpbHNfMS5VdGlscy5zYW1lKG5vZGUsIGNvcHkpKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3dyaXRlQXR0cihlbCwgbm9kZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX3ByZXBhcmVEcmFnRHJvcEJ5Tm9kZShub2RlKTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuICAgIC8qKiBAaW50ZXJuYWwgY2FsbCB0byB3cml0ZSBwb3NpdGlvbiB4LHksdyxoIGF0dHJpYnV0ZXMgYmFjayB0byBlbGVtZW50ICovXHJcbiAgICBfd3JpdGVQb3NBdHRyKGVsLCBuKSB7XHJcbiAgICAgICAgaWYgKG4ueCAhPT0gdW5kZWZpbmVkICYmIG4ueCAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICBlbC5zZXRBdHRyaWJ1dGUoJ2dzLXgnLCBTdHJpbmcobi54KSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChuLnkgIT09IHVuZGVmaW5lZCAmJiBuLnkgIT09IG51bGwpIHtcclxuICAgICAgICAgICAgZWwuc2V0QXR0cmlidXRlKCdncy15JywgU3RyaW5nKG4ueSkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAobi53KSB7XHJcbiAgICAgICAgICAgIGVsLnNldEF0dHJpYnV0ZSgnZ3MtdycsIFN0cmluZyhuLncpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKG4uaCkge1xyXG4gICAgICAgICAgICBlbC5zZXRBdHRyaWJ1dGUoJ2dzLWgnLCBTdHJpbmcobi5oKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG4gICAgLyoqIEBpbnRlcm5hbCBjYWxsIHRvIHdyaXRlIGFueSBkZWZhdWx0IGF0dHJpYnV0ZXMgYmFjayB0byBlbGVtZW50ICovXHJcbiAgICBfd3JpdGVBdHRyKGVsLCBub2RlKSB7XHJcbiAgICAgICAgaWYgKCFub2RlKVxyXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICB0aGlzLl93cml0ZVBvc0F0dHIoZWwsIG5vZGUpO1xyXG4gICAgICAgIGxldCBhdHRycyAvKjogR3JpZFN0YWNrV2lkZ2V0IGJ1dCBzdHJpbmdzICovID0ge1xyXG4gICAgICAgICAgICBhdXRvUG9zaXRpb246ICdncy1hdXRvLXBvc2l0aW9uJyxcclxuICAgICAgICAgICAgbWluVzogJ2dzLW1pbi13JyxcclxuICAgICAgICAgICAgbWluSDogJ2dzLW1pbi1oJyxcclxuICAgICAgICAgICAgbWF4VzogJ2dzLW1heC13JyxcclxuICAgICAgICAgICAgbWF4SDogJ2dzLW1heC1oJyxcclxuICAgICAgICAgICAgbm9SZXNpemU6ICdncy1uby1yZXNpemUnLFxyXG4gICAgICAgICAgICBub01vdmU6ICdncy1uby1tb3ZlJyxcclxuICAgICAgICAgICAgbG9ja2VkOiAnZ3MtbG9ja2VkJyxcclxuICAgICAgICAgICAgaWQ6ICdncy1pZCcsXHJcbiAgICAgICAgfTtcclxuICAgICAgICBmb3IgKGNvbnN0IGtleSBpbiBhdHRycykge1xyXG4gICAgICAgICAgICBpZiAobm9kZVtrZXldKSB7IC8vIDAgaXMgdmFsaWQgZm9yIHgseSBvbmx5IGJ1dCBkb25lIGFib3ZlIGFscmVhZHkgYW5kIG5vdCBpbiBsaXN0IGFueXdheVxyXG4gICAgICAgICAgICAgICAgZWwuc2V0QXR0cmlidXRlKGF0dHJzW2tleV0sIFN0cmluZyhub2RlW2tleV0pKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGVsLnJlbW92ZUF0dHJpYnV0ZShhdHRyc1trZXldKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuICAgIC8qKiBAaW50ZXJuYWwgY2FsbCB0byByZWFkIGFueSBkZWZhdWx0IGF0dHJpYnV0ZXMgZnJvbSBlbGVtZW50ICovXHJcbiAgICBfcmVhZEF0dHIoZWwpIHtcclxuICAgICAgICBsZXQgbm9kZSA9IHt9O1xyXG4gICAgICAgIG5vZGUueCA9IHV0aWxzXzEuVXRpbHMudG9OdW1iZXIoZWwuZ2V0QXR0cmlidXRlKCdncy14JykpO1xyXG4gICAgICAgIG5vZGUueSA9IHV0aWxzXzEuVXRpbHMudG9OdW1iZXIoZWwuZ2V0QXR0cmlidXRlKCdncy15JykpO1xyXG4gICAgICAgIG5vZGUudyA9IHV0aWxzXzEuVXRpbHMudG9OdW1iZXIoZWwuZ2V0QXR0cmlidXRlKCdncy13JykpO1xyXG4gICAgICAgIG5vZGUuaCA9IHV0aWxzXzEuVXRpbHMudG9OdW1iZXIoZWwuZ2V0QXR0cmlidXRlKCdncy1oJykpO1xyXG4gICAgICAgIG5vZGUubWF4VyA9IHV0aWxzXzEuVXRpbHMudG9OdW1iZXIoZWwuZ2V0QXR0cmlidXRlKCdncy1tYXgtdycpKTtcclxuICAgICAgICBub2RlLm1pblcgPSB1dGlsc18xLlV0aWxzLnRvTnVtYmVyKGVsLmdldEF0dHJpYnV0ZSgnZ3MtbWluLXcnKSk7XHJcbiAgICAgICAgbm9kZS5tYXhIID0gdXRpbHNfMS5VdGlscy50b051bWJlcihlbC5nZXRBdHRyaWJ1dGUoJ2dzLW1heC1oJykpO1xyXG4gICAgICAgIG5vZGUubWluSCA9IHV0aWxzXzEuVXRpbHMudG9OdW1iZXIoZWwuZ2V0QXR0cmlidXRlKCdncy1taW4taCcpKTtcclxuICAgICAgICBub2RlLmF1dG9Qb3NpdGlvbiA9IHV0aWxzXzEuVXRpbHMudG9Cb29sKGVsLmdldEF0dHJpYnV0ZSgnZ3MtYXV0by1wb3NpdGlvbicpKTtcclxuICAgICAgICBub2RlLm5vUmVzaXplID0gdXRpbHNfMS5VdGlscy50b0Jvb2woZWwuZ2V0QXR0cmlidXRlKCdncy1uby1yZXNpemUnKSk7XHJcbiAgICAgICAgbm9kZS5ub01vdmUgPSB1dGlsc18xLlV0aWxzLnRvQm9vbChlbC5nZXRBdHRyaWJ1dGUoJ2dzLW5vLW1vdmUnKSk7XHJcbiAgICAgICAgbm9kZS5sb2NrZWQgPSB1dGlsc18xLlV0aWxzLnRvQm9vbChlbC5nZXRBdHRyaWJ1dGUoJ2dzLWxvY2tlZCcpKTtcclxuICAgICAgICBub2RlLmlkID0gZWwuZ2V0QXR0cmlidXRlKCdncy1pZCcpO1xyXG4gICAgICAgIC8vIHJlbW92ZSBhbnkga2V5IG5vdCBmb3VuZCAobnVsbCBvciBmYWxzZSB3aGljaCBpcyBkZWZhdWx0KVxyXG4gICAgICAgIGZvciAoY29uc3Qga2V5IGluIG5vZGUpIHtcclxuICAgICAgICAgICAgaWYgKCFub2RlLmhhc093blByb3BlcnR5KGtleSkpXHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIGlmICghbm9kZVtrZXldICYmIG5vZGVba2V5XSAhPT0gMCkgeyAvLyAwIGNhbiBiZSB2YWxpZCB2YWx1ZSAoeCx5IG9ubHkgcmVhbGx5KVxyXG4gICAgICAgICAgICAgICAgZGVsZXRlIG5vZGVba2V5XTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbm9kZTtcclxuICAgIH1cclxuICAgIC8qKiBAaW50ZXJuYWwgKi9cclxuICAgIF9zZXRTdGF0aWNDbGFzcygpIHtcclxuICAgICAgICBsZXQgY2xhc3NlcyA9IFsnZ3JpZC1zdGFjay1zdGF0aWMnXTtcclxuICAgICAgICBpZiAodGhpcy5vcHRzLnN0YXRpY0dyaWQpIHtcclxuICAgICAgICAgICAgdGhpcy5lbC5jbGFzc0xpc3QuYWRkKC4uLmNsYXNzZXMpO1xyXG4gICAgICAgICAgICB0aGlzLmVsLnNldEF0dHJpYnV0ZSgnZ3Mtc3RhdGljJywgJ3RydWUnKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuZWwuY2xhc3NMaXN0LnJlbW92ZSguLi5jbGFzc2VzKTtcclxuICAgICAgICAgICAgdGhpcy5lbC5yZW1vdmVBdHRyaWJ1dGUoJ2dzLXN0YXRpYycpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogY2FsbGVkIHdoZW4gd2UgYXJlIGJlaW5nIHJlc2l6ZWQgYnkgdGhlIHdpbmRvdyAtIGNoZWNrIGlmIHRoZSBvbmUgQ29sdW1uIE1vZGUgbmVlZHMgdG8gYmUgdHVybmVkIG9uL29mZlxyXG4gICAgICogYW5kIHJlbWVtYmVyIHRoZSBwcmV2IGNvbHVtbnMgd2UgdXNlZCwgb3IgZ2V0IG91ciBjb3VudCBmcm9tIHBhcmVudCwgYXMgd2VsbCBhcyBjaGVjayBmb3IgYXV0byBjZWxsIGhlaWdodCAoc3F1YXJlKVxyXG4gICAgICovXHJcbiAgICBvblBhcmVudFJlc2l6ZSgpIHtcclxuICAgICAgICBpZiAoIXRoaXMuZWwgfHwgIXRoaXMuZWwuY2xpZW50V2lkdGgpXHJcbiAgICAgICAgICAgIHJldHVybjsgLy8gcmV0dXJuIGlmIHdlJ3JlIGdvbmUgb3Igbm8gc2l6ZSB5ZXQgKHdpbGwgZ2V0IGNhbGxlZCBhZ2FpbilcclxuICAgICAgICBsZXQgY2hhbmdlZENvbHVtbiA9IGZhbHNlO1xyXG4gICAgICAgIC8vIHNlZSBpZiB3ZSdyZSBuZXN0ZWQgYW5kIHRha2Ugb3VyIGNvbHVtbiBjb3VudCBmcm9tIG91ciBwYXJlbnQuLi4uXHJcbiAgICAgICAgaWYgKHRoaXMuX2F1dG9Db2x1bW4gJiYgdGhpcy5wYXJlbnRHcmlkSXRlbSkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5vcHRzLmNvbHVtbiAhPT0gdGhpcy5wYXJlbnRHcmlkSXRlbS53KSB7XHJcbiAgICAgICAgICAgICAgICBjaGFuZ2VkQ29sdW1uID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIHRoaXMuY29sdW1uKHRoaXMucGFyZW50R3JpZEl0ZW0udywgJ25vbmUnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgLy8gZWxzZSBjaGVjayBmb3IgMSBjb2x1bW4gaW4vb3V0IGJlaGF2aW9yXHJcbiAgICAgICAgICAgIGxldCBvbmVDb2x1bW4gPSAhdGhpcy5vcHRzLmRpc2FibGVPbmVDb2x1bW5Nb2RlICYmIHRoaXMuZWwuY2xpZW50V2lkdGggPD0gdGhpcy5vcHRzLm9uZUNvbHVtblNpemU7XHJcbiAgICAgICAgICAgIGlmICgodGhpcy5vcHRzLmNvbHVtbiA9PT0gMSkgIT09IG9uZUNvbHVtbikge1xyXG4gICAgICAgICAgICAgICAgY2hhbmdlZENvbHVtbiA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5vcHRzLmFuaW1hdGUpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldEFuaW1hdGlvbihmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICB9IC8vIDEgPC0+IDEyIGlzIHRvbyByYWRpY2FsLCB0dXJuIG9mZiBhbmltYXRpb25cclxuICAgICAgICAgICAgICAgIHRoaXMuY29sdW1uKG9uZUNvbHVtbiA/IDEgOiB0aGlzLl9wcmV2Q29sdW1uKTtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLm9wdHMuYW5pbWF0ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0QW5pbWF0aW9uKHRydWUpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIG1ha2UgdGhlIGNlbGxzIGNvbnRlbnQgc3F1YXJlIGFnYWluXHJcbiAgICAgICAgaWYgKHRoaXMuX2lzQXV0b0NlbGxIZWlnaHQpIHtcclxuICAgICAgICAgICAgaWYgKCFjaGFuZ2VkQ29sdW1uICYmIHRoaXMub3B0cy5jZWxsSGVpZ2h0VGhyb3R0bGUpIHtcclxuICAgICAgICAgICAgICAgIGlmICghdGhpcy5fY2VsbEhlaWdodFRocm90dGxlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fY2VsbEhlaWdodFRocm90dGxlID0gdXRpbHNfMS5VdGlscy50aHJvdHRsZSgoKSA9PiB0aGlzLmNlbGxIZWlnaHQoKSwgdGhpcy5vcHRzLmNlbGxIZWlnaHRUaHJvdHRsZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9jZWxsSGVpZ2h0VGhyb3R0bGUoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIC8vIGltbWVkaWF0ZSB1cGRhdGUgaWYgd2UndmUgY2hhbmdlZCBjb2x1bW4gY291bnQgb3IgaGF2ZSBubyB0aHJlc2hvbGRcclxuICAgICAgICAgICAgICAgIHRoaXMuY2VsbEhlaWdodCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIGZpbmFsbHkgdXBkYXRlIGFueSBuZXN0ZWQgZ3JpZHNcclxuICAgICAgICB0aGlzLmVuZ2luZS5ub2Rlcy5mb3JFYWNoKG4gPT4ge1xyXG4gICAgICAgICAgICBpZiAobi5zdWJHcmlkKSB7XHJcbiAgICAgICAgICAgICAgICBuLnN1YkdyaWQub25QYXJlbnRSZXNpemUoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG4gICAgLyoqIGFkZCBvciByZW1vdmUgdGhlIHdpbmRvdyBzaXplIGV2ZW50IGhhbmRsZXIgKi9cclxuICAgIF91cGRhdGVXaW5kb3dSZXNpemVFdmVudChmb3JjZVJlbW92ZSA9IGZhbHNlKSB7XHJcbiAgICAgICAgLy8gb25seSBhZGQgZXZlbnQgaWYgd2UncmUgbm90IG5lc3RlZCAocGFyZW50IHdpbGwgY2FsbCB1cykgYW5kIHdlJ3JlIGF1dG8gc2l6aW5nIGNlbGxzIG9yIHN1cHBvcnRpbmcgb25lQ29sdW1uIChpLmUuIGRvaW5nIHdvcmspXHJcbiAgICAgICAgY29uc3Qgd29ya1RvZG8gPSAodGhpcy5faXNBdXRvQ2VsbEhlaWdodCB8fCAhdGhpcy5vcHRzLmRpc2FibGVPbmVDb2x1bW5Nb2RlKSAmJiAhdGhpcy5wYXJlbnRHcmlkSXRlbTtcclxuICAgICAgICBpZiAoIWZvcmNlUmVtb3ZlICYmIHdvcmtUb2RvICYmICF0aGlzLl93aW5kb3dSZXNpemVCaW5kKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3dpbmRvd1Jlc2l6ZUJpbmQgPSB0aGlzLm9uUGFyZW50UmVzaXplLmJpbmQodGhpcyk7IC8vIHNvIHdlIGNhbiBwcm9wZXJseSByZW1vdmUgbGF0ZXJcclxuICAgICAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHRoaXMuX3dpbmRvd1Jlc2l6ZUJpbmQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICgoZm9yY2VSZW1vdmUgfHwgIXdvcmtUb2RvKSAmJiB0aGlzLl93aW5kb3dSZXNpemVCaW5kKSB7XHJcbiAgICAgICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdyZXNpemUnLCB0aGlzLl93aW5kb3dSZXNpemVCaW5kKTtcclxuICAgICAgICAgICAgZGVsZXRlIHRoaXMuX3dpbmRvd1Jlc2l6ZUJpbmQ7IC8vIHJlbW92ZSBsaW5rIHRvIHVzIHNvIHdlIGNhbiBmcmVlXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG4gICAgLyoqIEBpbnRlcm5hbCBjb252ZXJ0IGEgcG90ZW50aWFsIHNlbGVjdG9yIGludG8gYWN0dWFsIGVsZW1lbnQgKi9cclxuICAgIHN0YXRpYyBnZXRFbGVtZW50KGVscyA9ICcuZ3JpZC1zdGFjay1pdGVtJykgeyByZXR1cm4gdXRpbHNfMS5VdGlscy5nZXRFbGVtZW50KGVscyk7IH1cclxuICAgIC8qKiBAaW50ZXJuYWwgKi9cclxuICAgIHN0YXRpYyBnZXRFbGVtZW50cyhlbHMgPSAnLmdyaWQtc3RhY2staXRlbScpIHsgcmV0dXJuIHV0aWxzXzEuVXRpbHMuZ2V0RWxlbWVudHMoZWxzKTsgfVxyXG4gICAgLyoqIEBpbnRlcm5hbCAqL1xyXG4gICAgc3RhdGljIGdldEdyaWRFbGVtZW50KGVscykgeyByZXR1cm4gR3JpZFN0YWNrLmdldEVsZW1lbnQoZWxzKTsgfVxyXG4gICAgLyoqIEBpbnRlcm5hbCAqL1xyXG4gICAgc3RhdGljIGdldEdyaWRFbGVtZW50cyhlbHMpIHsgcmV0dXJuIHV0aWxzXzEuVXRpbHMuZ2V0RWxlbWVudHMoZWxzKTsgfVxyXG4gICAgLyoqIEBpbnRlcm5hbCBpbml0aWFsaXplIG1hcmdpbiB0b3AvYm90dG9tL2xlZnQvcmlnaHQgYW5kIHVuaXRzICovXHJcbiAgICBfaW5pdE1hcmdpbigpIHtcclxuICAgICAgICBsZXQgZGF0YTtcclxuICAgICAgICBsZXQgbWFyZ2luID0gMDtcclxuICAgICAgICAvLyBzdXBwb3J0IHBhc3NpbmcgbXVsdGlwbGUgdmFsdWVzIGxpa2UgQ1NTIChleDogJzVweCAxMHB4IDAgMjBweCcpXHJcbiAgICAgICAgbGV0IG1hcmdpbnMgPSBbXTtcclxuICAgICAgICBpZiAodHlwZW9mIHRoaXMub3B0cy5tYXJnaW4gPT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICAgIG1hcmdpbnMgPSB0aGlzLm9wdHMubWFyZ2luLnNwbGl0KCcgJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChtYXJnaW5zLmxlbmd0aCA9PT0gMikgeyAvLyB0b3AvYm90LCBsZWZ0L3JpZ2h0IGxpa2UgQ1NTXHJcbiAgICAgICAgICAgIHRoaXMub3B0cy5tYXJnaW5Ub3AgPSB0aGlzLm9wdHMubWFyZ2luQm90dG9tID0gbWFyZ2luc1swXTtcclxuICAgICAgICAgICAgdGhpcy5vcHRzLm1hcmdpbkxlZnQgPSB0aGlzLm9wdHMubWFyZ2luUmlnaHQgPSBtYXJnaW5zWzFdO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmIChtYXJnaW5zLmxlbmd0aCA9PT0gNCkgeyAvLyBDbG9ja3dpc2UgbGlrZSBDU1NcclxuICAgICAgICAgICAgdGhpcy5vcHRzLm1hcmdpblRvcCA9IG1hcmdpbnNbMF07XHJcbiAgICAgICAgICAgIHRoaXMub3B0cy5tYXJnaW5SaWdodCA9IG1hcmdpbnNbMV07XHJcbiAgICAgICAgICAgIHRoaXMub3B0cy5tYXJnaW5Cb3R0b20gPSBtYXJnaW5zWzJdO1xyXG4gICAgICAgICAgICB0aGlzLm9wdHMubWFyZ2luTGVmdCA9IG1hcmdpbnNbM107XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBkYXRhID0gdXRpbHNfMS5VdGlscy5wYXJzZUhlaWdodCh0aGlzLm9wdHMubWFyZ2luKTtcclxuICAgICAgICAgICAgdGhpcy5vcHRzLm1hcmdpblVuaXQgPSBkYXRhLnVuaXQ7XHJcbiAgICAgICAgICAgIG1hcmdpbiA9IHRoaXMub3B0cy5tYXJnaW4gPSBkYXRhLmg7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIHNlZSBpZiB0b3AvYm90dG9tL2xlZnQvcmlnaHQgbmVlZCB0byBiZSBzZXQgYXMgd2VsbFxyXG4gICAgICAgIGlmICh0aGlzLm9wdHMubWFyZ2luVG9wID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgdGhpcy5vcHRzLm1hcmdpblRvcCA9IG1hcmdpbjtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGRhdGEgPSB1dGlsc18xLlV0aWxzLnBhcnNlSGVpZ2h0KHRoaXMub3B0cy5tYXJnaW5Ub3ApO1xyXG4gICAgICAgICAgICB0aGlzLm9wdHMubWFyZ2luVG9wID0gZGF0YS5oO1xyXG4gICAgICAgICAgICBkZWxldGUgdGhpcy5vcHRzLm1hcmdpbjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMub3B0cy5tYXJnaW5Cb3R0b20gPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICB0aGlzLm9wdHMubWFyZ2luQm90dG9tID0gbWFyZ2luO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgZGF0YSA9IHV0aWxzXzEuVXRpbHMucGFyc2VIZWlnaHQodGhpcy5vcHRzLm1hcmdpbkJvdHRvbSk7XHJcbiAgICAgICAgICAgIHRoaXMub3B0cy5tYXJnaW5Cb3R0b20gPSBkYXRhLmg7XHJcbiAgICAgICAgICAgIGRlbGV0ZSB0aGlzLm9wdHMubWFyZ2luO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5vcHRzLm1hcmdpblJpZ2h0ID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgdGhpcy5vcHRzLm1hcmdpblJpZ2h0ID0gbWFyZ2luO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgZGF0YSA9IHV0aWxzXzEuVXRpbHMucGFyc2VIZWlnaHQodGhpcy5vcHRzLm1hcmdpblJpZ2h0KTtcclxuICAgICAgICAgICAgdGhpcy5vcHRzLm1hcmdpblJpZ2h0ID0gZGF0YS5oO1xyXG4gICAgICAgICAgICBkZWxldGUgdGhpcy5vcHRzLm1hcmdpbjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMub3B0cy5tYXJnaW5MZWZ0ID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgdGhpcy5vcHRzLm1hcmdpbkxlZnQgPSBtYXJnaW47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBkYXRhID0gdXRpbHNfMS5VdGlscy5wYXJzZUhlaWdodCh0aGlzLm9wdHMubWFyZ2luTGVmdCk7XHJcbiAgICAgICAgICAgIHRoaXMub3B0cy5tYXJnaW5MZWZ0ID0gZGF0YS5oO1xyXG4gICAgICAgICAgICBkZWxldGUgdGhpcy5vcHRzLm1hcmdpbjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5vcHRzLm1hcmdpblVuaXQgPSBkYXRhLnVuaXQ7IC8vIGluIGNhc2Ugc2lkZSB3ZXJlIHNwZWxsZWQgb3V0LCB1c2UgdGhvc2UgdW5pdHMgaW5zdGVhZC4uLlxyXG4gICAgICAgIGlmICh0aGlzLm9wdHMubWFyZ2luVG9wID09PSB0aGlzLm9wdHMubWFyZ2luQm90dG9tICYmIHRoaXMub3B0cy5tYXJnaW5MZWZ0ID09PSB0aGlzLm9wdHMubWFyZ2luUmlnaHQgJiYgdGhpcy5vcHRzLm1hcmdpblRvcCA9PT0gdGhpcy5vcHRzLm1hcmdpblJpZ2h0KSB7XHJcbiAgICAgICAgICAgIHRoaXMub3B0cy5tYXJnaW4gPSB0aGlzLm9wdHMubWFyZ2luVG9wOyAvLyBtYWtlcyBpdCBlYXNpZXIgdG8gY2hlY2sgZm9yIG5vLW9wcyBpbiBzZXRNYXJnaW4oKVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuICAgIC8qID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAgICAqIGRyYWcmZHJvcCBtZXRob2RzIHRoYXQgdXNlZCB0byBiZSBzdHViYmVkIG91dCBhbmQgaW1wbGVtZW50ZWQgaW4gZGQtZ3JpZHN0YWNrLnRzXHJcbiAgICAgKiBidXQgY2F1c2VkIGxvYWRpbmcgaXNzdWVzIGluIHByb2QgLSBzZWUgaHR0cHM6Ly9naXRodWIuY29tL2dyaWRzdGFjay9ncmlkc3RhY2suanMvaXNzdWVzLzIwMzlcclxuICAgICAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAgICAqL1xyXG4gICAgLyoqIGdldCB0aGUgZ2xvYmFsIChidXQgc3RhdGljIHRvIHRoaXMgY29kZSkgREQgaW1wbGVtZW50YXRpb24gKi9cclxuICAgIHN0YXRpYyBnZXRERCgpIHtcclxuICAgICAgICByZXR1cm4gZGQ7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIGNhbGwgdG8gc2V0dXAgZHJhZ2dpbmcgaW4gZnJvbSB0aGUgb3V0c2lkZSAoc2F5IHRvb2xiYXIpLCBieSBzcGVjaWZ5aW5nIHRoZSBjbGFzcyBzZWxlY3Rpb24gYW5kIG9wdGlvbnMuXHJcbiAgICAgKiBDYWxsZWQgZHVyaW5nIEdyaWRTdGFjay5pbml0KCkgYXMgb3B0aW9ucywgYnV0IGNhbiBhbHNvIGJlIGNhbGxlZCBkaXJlY3RseSAobGFzdCBwYXJhbSBhcmUgdXNlZCkgaW4gY2FzZSB0aGUgdG9vbGJhclxyXG4gICAgICogaXMgZHluYW1pY2FsbHkgY3JlYXRlIGFuZCBuZWVkcyB0byBiZSBzZXQgbGF0ZXIuXHJcbiAgICAgKiBAcGFyYW0gZHJhZ0luIHN0cmluZyBzZWxlY3RvciAoZXg6ICcuc2lkZWJhciAuZ3JpZC1zdGFjay1pdGVtJylcclxuICAgICAqIEBwYXJhbSBkcmFnSW5PcHRpb25zIG9wdGlvbnMgLSBzZWUgREREcmFnSW5PcHQuIChkZWZhdWx0OiB7aGFuZGxlOiAnLmdyaWQtc3RhY2staXRlbS1jb250ZW50JywgYXBwZW5kVG86ICdib2R5J31cclxuICAgICAqKi9cclxuICAgIHN0YXRpYyBzZXR1cERyYWdJbihkcmFnSW4sIGRyYWdJbk9wdGlvbnMpIHtcclxuICAgICAgICBpZiAoKGRyYWdJbk9wdGlvbnMgPT09IG51bGwgfHwgZHJhZ0luT3B0aW9ucyA9PT0gdm9pZCAwID8gdm9pZCAwIDogZHJhZ0luT3B0aW9ucy5wYXVzZSkgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICBkZF9tYW5hZ2VyXzEuRERNYW5hZ2VyLnBhdXNlRHJhZyA9IGRyYWdJbk9wdGlvbnMucGF1c2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0eXBlb2YgZHJhZ0luID09PSAnc3RyaW5nJykge1xyXG4gICAgICAgICAgICBkcmFnSW5PcHRpb25zID0gT2JqZWN0LmFzc2lnbihPYmplY3QuYXNzaWduKHt9LCB0eXBlc18xLmRyYWdJbkRlZmF1bHRPcHRpb25zKSwgKGRyYWdJbk9wdGlvbnMgfHwge30pKTtcclxuICAgICAgICAgICAgdXRpbHNfMS5VdGlscy5nZXRFbGVtZW50cyhkcmFnSW4pLmZvckVhY2goZWwgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKCFkZC5pc0RyYWdnYWJsZShlbCkpXHJcbiAgICAgICAgICAgICAgICAgICAgZGQuZHJhZ0luKGVsLCBkcmFnSW5PcHRpb25zKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBFbmFibGVzL0Rpc2FibGVzIGRyYWdnaW5nIGJ5IHRoZSB1c2VyIG9mIHNwZWNpZmljIGdyaWQgZWxlbWVudC4gSWYgeW91IHdhbnQgYWxsIGl0ZW1zLCBhbmQgaGF2ZSBpdCBhZmZlY3QgZnV0dXJlIGl0ZW1zLCB1c2UgZW5hYmxlTW92ZSgpIGluc3RlYWQuIE5vLW9wIGZvciBzdGF0aWMgZ3JpZHMuXHJcbiAgICAgKiBJRiB5b3UgYXJlIGxvb2tpbmcgdG8gcHJldmVudCBhbiBpdGVtIGZyb20gbW92aW5nIChkdWUgdG8gYmVpbmcgcHVzaGVkIGFyb3VuZCBieSBhbm90aGVyIGR1cmluZyBjb2xsaXNpb24pIHVzZSBsb2NrZWQgcHJvcGVydHkgaW5zdGVhZC5cclxuICAgICAqIEBwYXJhbSBlbHMgd2lkZ2V0IG9yIHNlbGVjdG9yIHRvIG1vZGlmeS5cclxuICAgICAqIEBwYXJhbSB2YWwgaWYgdHJ1ZSB3aWRnZXQgd2lsbCBiZSBkcmFnZ2FibGUuXHJcbiAgICAgKi9cclxuICAgIG1vdmFibGUoZWxzLCB2YWwpIHtcclxuICAgICAgICBpZiAodGhpcy5vcHRzLnN0YXRpY0dyaWQpXHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzOyAvLyBjYW4ndCBtb3ZlIGEgc3RhdGljIGdyaWQhXHJcbiAgICAgICAgR3JpZFN0YWNrLmdldEVsZW1lbnRzKGVscykuZm9yRWFjaChlbCA9PiB7XHJcbiAgICAgICAgICAgIGxldCBub2RlID0gZWwuZ3JpZHN0YWNrTm9kZTtcclxuICAgICAgICAgICAgaWYgKCFub2RlKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICBpZiAodmFsKVxyXG4gICAgICAgICAgICAgICAgZGVsZXRlIG5vZGUubm9Nb3ZlO1xyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICBub2RlLm5vTW92ZSA9IHRydWU7XHJcbiAgICAgICAgICAgIHRoaXMuX3ByZXBhcmVEcmFnRHJvcEJ5Tm9kZShub2RlKTsgLy8gaW5pdCBERCBpZiBuZWVkIGJlLCBhbmQgYWRqdXN0XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIEVuYWJsZXMvRGlzYWJsZXMgdXNlciByZXNpemluZyBvZiBzcGVjaWZpYyBncmlkIGVsZW1lbnQuIElmIHlvdSB3YW50IGFsbCBpdGVtcywgYW5kIGhhdmUgaXQgYWZmZWN0IGZ1dHVyZSBpdGVtcywgdXNlIGVuYWJsZVJlc2l6ZSgpIGluc3RlYWQuIE5vLW9wIGZvciBzdGF0aWMgZ3JpZHMuXHJcbiAgICAgKiBAcGFyYW0gZWxzICB3aWRnZXQgb3Igc2VsZWN0b3IgdG8gbW9kaWZ5XHJcbiAgICAgKiBAcGFyYW0gdmFsICBpZiB0cnVlIHdpZGdldCB3aWxsIGJlIHJlc2l6YWJsZS5cclxuICAgICAqL1xyXG4gICAgcmVzaXphYmxlKGVscywgdmFsKSB7XHJcbiAgICAgICAgaWYgKHRoaXMub3B0cy5zdGF0aWNHcmlkKVxyXG4gICAgICAgICAgICByZXR1cm4gdGhpczsgLy8gY2FuJ3QgcmVzaXplIGEgc3RhdGljIGdyaWQhXHJcbiAgICAgICAgR3JpZFN0YWNrLmdldEVsZW1lbnRzKGVscykuZm9yRWFjaChlbCA9PiB7XHJcbiAgICAgICAgICAgIGxldCBub2RlID0gZWwuZ3JpZHN0YWNrTm9kZTtcclxuICAgICAgICAgICAgaWYgKCFub2RlKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICBpZiAodmFsKVxyXG4gICAgICAgICAgICAgICAgZGVsZXRlIG5vZGUubm9SZXNpemU7XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgIG5vZGUubm9SZXNpemUgPSB0cnVlO1xyXG4gICAgICAgICAgICB0aGlzLl9wcmVwYXJlRHJhZ0Ryb3BCeU5vZGUobm9kZSk7IC8vIGluaXQgREQgaWYgbmVlZCBiZSwgYW5kIGFkanVzdFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBUZW1wb3JhcmlseSBkaXNhYmxlcyB3aWRnZXRzIG1vdmluZy9yZXNpemluZy5cclxuICAgICAqIElmIHlvdSB3YW50IGEgbW9yZSBwZXJtYW5lbnQgd2F5ICh3aGljaCBmcmVlemVzIHVwIHJlc291cmNlcykgdXNlIGBzZXRTdGF0aWModHJ1ZSlgIGluc3RlYWQuXHJcbiAgICAgKiBOb3RlOiBuby1vcCBmb3Igc3RhdGljIGdyaWRcclxuICAgICAqIFRoaXMgaXMgYSBzaG9ydGN1dCBmb3I6XHJcbiAgICAgKiBAZXhhbXBsZVxyXG4gICAgICogIGdyaWQuZW5hYmxlTW92ZShmYWxzZSk7XHJcbiAgICAgKiAgZ3JpZC5lbmFibGVSZXNpemUoZmFsc2UpO1xyXG4gICAgICogQHBhcmFtIHJlY3Vyc2UgdHJ1ZSAoZGVmYXVsdCkgaWYgc3ViLWdyaWRzIGFsc28gZ2V0IHVwZGF0ZWRcclxuICAgICAqL1xyXG4gICAgZGlzYWJsZShyZWN1cnNlID0gdHJ1ZSkge1xyXG4gICAgICAgIGlmICh0aGlzLm9wdHMuc3RhdGljR3JpZClcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIHRoaXMuZW5hYmxlTW92ZShmYWxzZSwgcmVjdXJzZSk7XHJcbiAgICAgICAgdGhpcy5lbmFibGVSZXNpemUoZmFsc2UsIHJlY3Vyc2UpOyAvLyBAdHMtaWdub3JlXHJcbiAgICAgICAgdGhpcy5fdHJpZ2dlckV2ZW50KCdkaXNhYmxlJyk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIFJlLWVuYWJsZXMgd2lkZ2V0cyBtb3ZpbmcvcmVzaXppbmcgLSBzZWUgZGlzYWJsZSgpLlxyXG4gICAgICogTm90ZTogbm8tb3AgZm9yIHN0YXRpYyBncmlkLlxyXG4gICAgICogVGhpcyBpcyBhIHNob3J0Y3V0IGZvcjpcclxuICAgICAqIEBleGFtcGxlXHJcbiAgICAgKiAgZ3JpZC5lbmFibGVNb3ZlKHRydWUpO1xyXG4gICAgICogIGdyaWQuZW5hYmxlUmVzaXplKHRydWUpO1xyXG4gICAgICogQHBhcmFtIHJlY3Vyc2UgdHJ1ZSAoZGVmYXVsdCkgaWYgc3ViLWdyaWRzIGFsc28gZ2V0IHVwZGF0ZWRcclxuICAgICAqL1xyXG4gICAgZW5hYmxlKHJlY3Vyc2UgPSB0cnVlKSB7XHJcbiAgICAgICAgaWYgKHRoaXMub3B0cy5zdGF0aWNHcmlkKVxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgdGhpcy5lbmFibGVNb3ZlKHRydWUsIHJlY3Vyc2UpO1xyXG4gICAgICAgIHRoaXMuZW5hYmxlUmVzaXplKHRydWUsIHJlY3Vyc2UpOyAvLyBAdHMtaWdub3JlXHJcbiAgICAgICAgdGhpcy5fdHJpZ2dlckV2ZW50KCdlbmFibGUnKTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogRW5hYmxlcy9kaXNhYmxlcyB3aWRnZXQgbW92aW5nLiBOby1vcCBmb3Igc3RhdGljIGdyaWRzLlxyXG4gICAgICogQHBhcmFtIHJlY3Vyc2UgdHJ1ZSAoZGVmYXVsdCkgaWYgc3ViLWdyaWRzIGFsc28gZ2V0IHVwZGF0ZWRcclxuICAgICAqL1xyXG4gICAgZW5hYmxlTW92ZShkb0VuYWJsZSwgcmVjdXJzZSA9IHRydWUpIHtcclxuICAgICAgICBpZiAodGhpcy5vcHRzLnN0YXRpY0dyaWQpXHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzOyAvLyBjYW4ndCBtb3ZlIGEgc3RhdGljIGdyaWQhXHJcbiAgICAgICAgdGhpcy5vcHRzLmRpc2FibGVEcmFnID0gIWRvRW5hYmxlOyAvLyBGSVJTVCBiZWZvcmUgd2UgdXBkYXRlIGNoaWxkcmVuIGFzIGdyaWQgb3ZlcnJpZGVzICMxNjU4XHJcbiAgICAgICAgdGhpcy5lbmdpbmUubm9kZXMuZm9yRWFjaChuID0+IHtcclxuICAgICAgICAgICAgdGhpcy5tb3ZhYmxlKG4uZWwsIGRvRW5hYmxlKTtcclxuICAgICAgICAgICAgaWYgKG4uc3ViR3JpZCAmJiByZWN1cnNlKVxyXG4gICAgICAgICAgICAgICAgbi5zdWJHcmlkLmVuYWJsZU1vdmUoZG9FbmFibGUsIHJlY3Vyc2UpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBFbmFibGVzL2Rpc2FibGVzIHdpZGdldCByZXNpemluZy4gTm8tb3AgZm9yIHN0YXRpYyBncmlkcy5cclxuICAgICAqIEBwYXJhbSByZWN1cnNlIHRydWUgKGRlZmF1bHQpIGlmIHN1Yi1ncmlkcyBhbHNvIGdldCB1cGRhdGVkXHJcbiAgICAgKi9cclxuICAgIGVuYWJsZVJlc2l6ZShkb0VuYWJsZSwgcmVjdXJzZSA9IHRydWUpIHtcclxuICAgICAgICBpZiAodGhpcy5vcHRzLnN0YXRpY0dyaWQpXHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzOyAvLyBjYW4ndCBzaXplIGEgc3RhdGljIGdyaWQhXHJcbiAgICAgICAgdGhpcy5vcHRzLmRpc2FibGVSZXNpemUgPSAhZG9FbmFibGU7IC8vIEZJUlNUIGJlZm9yZSB3ZSB1cGRhdGUgY2hpbGRyZW4gYXMgZ3JpZCBvdmVycmlkZXMgIzE2NThcclxuICAgICAgICB0aGlzLmVuZ2luZS5ub2Rlcy5mb3JFYWNoKG4gPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnJlc2l6YWJsZShuLmVsLCBkb0VuYWJsZSk7XHJcbiAgICAgICAgICAgIGlmIChuLnN1YkdyaWQgJiYgcmVjdXJzZSlcclxuICAgICAgICAgICAgICAgIG4uc3ViR3JpZC5lbmFibGVSZXNpemUoZG9FbmFibGUsIHJlY3Vyc2UpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG4gICAgLyoqIEBpbnRlcm5hbCByZW1vdmVzIGFueSBkcmFnJmRyb3AgcHJlc2VudCAoY2FsbGVkIGR1cmluZyBkZXN0cm95KSAqL1xyXG4gICAgX3JlbW92ZUREKGVsKSB7XHJcbiAgICAgICAgZGQuZHJhZ2dhYmxlKGVsLCAnZGVzdHJveScpLnJlc2l6YWJsZShlbCwgJ2Rlc3Ryb3knKTtcclxuICAgICAgICBpZiAoZWwuZ3JpZHN0YWNrTm9kZSkge1xyXG4gICAgICAgICAgICBkZWxldGUgZWwuZ3JpZHN0YWNrTm9kZS5faW5pdEREOyAvLyByZXNldCBvdXIgREQgaW5pdCBmbGFnXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGRlbGV0ZSBlbC5kZEVsZW1lbnQ7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbiAgICAvKiogQGludGVybmFsIGNhbGxlZCB0byBhZGQgZHJhZyBvdmVyIHRvIHN1cHBvcnQgd2lkZ2V0cyBiZWluZyBhZGRlZCBleHRlcm5hbGx5ICovXHJcbiAgICBfc2V0dXBBY2NlcHRXaWRnZXQoKSB7XHJcbiAgICAgICAgLy8gY2hlY2sgaWYgd2UgbmVlZCB0byBkaXNhYmxlIHRoaW5nc1xyXG4gICAgICAgIGlmICh0aGlzLm9wdHMuc3RhdGljR3JpZCB8fCAoIXRoaXMub3B0cy5hY2NlcHRXaWRnZXRzICYmICF0aGlzLm9wdHMucmVtb3ZhYmxlKSkge1xyXG4gICAgICAgICAgICBkZC5kcm9wcGFibGUodGhpcy5lbCwgJ2Rlc3Ryb3knKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIHZhcnMgc2hhcmVkIGFjcm9zcyBhbGwgbWV0aG9kc1xyXG4gICAgICAgIGxldCBjZWxsSGVpZ2h0LCBjZWxsV2lkdGg7XHJcbiAgICAgICAgbGV0IG9uRHJhZyA9IChldmVudCwgZWwsIGhlbHBlcikgPT4ge1xyXG4gICAgICAgICAgICBsZXQgbm9kZSA9IGVsLmdyaWRzdGFja05vZGU7XHJcbiAgICAgICAgICAgIGlmICghbm9kZSlcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgaGVscGVyID0gaGVscGVyIHx8IGVsO1xyXG4gICAgICAgICAgICBsZXQgcGFyZW50ID0gdGhpcy5lbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcclxuICAgICAgICAgICAgbGV0IHsgdG9wLCBsZWZ0IH0gPSBoZWxwZXIuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcbiAgICAgICAgICAgIGxlZnQgLT0gcGFyZW50LmxlZnQ7XHJcbiAgICAgICAgICAgIHRvcCAtPSBwYXJlbnQudG9wO1xyXG4gICAgICAgICAgICBsZXQgdWkgPSB7IHBvc2l0aW9uOiB7IHRvcCwgbGVmdCB9IH07XHJcbiAgICAgICAgICAgIGlmIChub2RlLl90ZW1wb3JhcnlSZW1vdmVkKSB7XHJcbiAgICAgICAgICAgICAgICBub2RlLnggPSBNYXRoLm1heCgwLCBNYXRoLnJvdW5kKGxlZnQgLyBjZWxsV2lkdGgpKTtcclxuICAgICAgICAgICAgICAgIG5vZGUueSA9IE1hdGgubWF4KDAsIE1hdGgucm91bmQodG9wIC8gY2VsbEhlaWdodCkpO1xyXG4gICAgICAgICAgICAgICAgZGVsZXRlIG5vZGUuYXV0b1Bvc2l0aW9uO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5lbmdpbmUubm9kZUJvdW5kRml4KG5vZGUpO1xyXG4gICAgICAgICAgICAgICAgLy8gZG9uJ3QgYWNjZXB0ICppbml0aWFsKiBsb2NhdGlvbiBpZiBkb2Vzbid0IGZpdCAjMTQxOSAobG9ja2VkIGRyb3AgcmVnaW9uLCBvciBjYW4ndCBncm93KSwgYnV0IG1heWJlIHRyeSBpZiBpdCB3aWxsIGdvIHNvbWV3aGVyZVxyXG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLmVuZ2luZS53aWxsSXRGaXQobm9kZSkpIHtcclxuICAgICAgICAgICAgICAgICAgICBub2RlLmF1dG9Qb3NpdGlvbiA9IHRydWU7IC8vIGlnbm9yZSB4LHkgYW5kIHRyeSBmb3IgYW55IHNsb3QuLi5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoIXRoaXMuZW5naW5lLndpbGxJdEZpdChub2RlKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZC5vZmYoZWwsICdkcmFnJyk7IC8vIHN0b3AgY2FsbGluZyB1c1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47IC8vIGZ1bGwgZ3JpZCBvciBjYW4ndCBncm93XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChub2RlLl93aWxsRml0UG9zKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHVzZSB0aGUgYXV0byBwb3NpdGlvbiBpbnN0ZWFkICMxNjg3XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHV0aWxzXzEuVXRpbHMuY29weVBvcyhub2RlLCBub2RlLl93aWxsRml0UG9zKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVsZXRlIG5vZGUuX3dpbGxGaXRQb3M7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgLy8gcmUtdXNlIHRoZSBleGlzdGluZyBub2RlIGRyYWdnaW5nIG1ldGhvZFxyXG4gICAgICAgICAgICAgICAgdGhpcy5fb25TdGFydE1vdmluZyhoZWxwZXIsIGV2ZW50LCB1aSwgbm9kZSwgY2VsbFdpZHRoLCBjZWxsSGVpZ2h0KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIC8vIHJlLXVzZSB0aGUgZXhpc3Rpbmcgbm9kZSBkcmFnZ2luZyB0aGF0IGRvZXMgc28gbXVjaCBvZiB0aGUgY29sbGlzaW9uIGRldGVjdGlvblxyXG4gICAgICAgICAgICAgICAgdGhpcy5fZHJhZ09yUmVzaXplKGhlbHBlciwgZXZlbnQsIHVpLCBub2RlLCBjZWxsV2lkdGgsIGNlbGxIZWlnaHQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgICAgICBkZC5kcm9wcGFibGUodGhpcy5lbCwge1xyXG4gICAgICAgICAgICBhY2NlcHQ6IChlbCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgbGV0IG5vZGUgPSBlbC5ncmlkc3RhY2tOb2RlO1xyXG4gICAgICAgICAgICAgICAgLy8gc2V0IGFjY2VwdCBkcm9wIHRvIHRydWUgb24gb3Vyc2VsZiAod2hpY2ggd2UgaWdub3JlKSBzbyB3ZSBkb24ndCBnZXQgXCJjYW4ndCBkcm9wXCIgaWNvbiBpbiBIVE1MNSBtb2RlIHdoaWxlIG1vdmluZ1xyXG4gICAgICAgICAgICAgICAgaWYgKChub2RlID09PSBudWxsIHx8IG5vZGUgPT09IHZvaWQgMCA/IHZvaWQgMCA6IG5vZGUuZ3JpZCkgPT09IHRoaXMpXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMub3B0cy5hY2NlcHRXaWRnZXRzKVxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgICAgIC8vIGNoZWNrIGZvciBhY2NlcHQgbWV0aG9kIG9yIGNsYXNzIG1hdGNoaW5nXHJcbiAgICAgICAgICAgICAgICBsZXQgY2FuQWNjZXB0ID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgdGhpcy5vcHRzLmFjY2VwdFdpZGdldHMgPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAgICAgICAgICAgICBjYW5BY2NlcHQgPSB0aGlzLm9wdHMuYWNjZXB0V2lkZ2V0cyhlbCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgc2VsZWN0b3IgPSAodGhpcy5vcHRzLmFjY2VwdFdpZGdldHMgPT09IHRydWUgPyAnLmdyaWQtc3RhY2staXRlbScgOiB0aGlzLm9wdHMuYWNjZXB0V2lkZ2V0cyk7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FuQWNjZXB0ID0gZWwubWF0Y2hlcyhzZWxlY3Rvcik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAvLyBmaW5hbGx5IGNoZWNrIHRvIG1ha2Ugc3VyZSB3ZSBhY3R1YWxseSBoYXZlIHNwYWNlIGxlZnQgIzE1NzFcclxuICAgICAgICAgICAgICAgIGlmIChjYW5BY2NlcHQgJiYgbm9kZSAmJiB0aGlzLm9wdHMubWF4Um93KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IG4gPSB7IHc6IG5vZGUudywgaDogbm9kZS5oLCBtaW5XOiBub2RlLm1pblcsIG1pbkg6IG5vZGUubWluSCB9OyAvLyBvbmx5IHdpZHRoL2hlaWdodCBtYXR0ZXJzIGFuZCBhdXRvUG9zaXRpb25cclxuICAgICAgICAgICAgICAgICAgICBjYW5BY2NlcHQgPSB0aGlzLmVuZ2luZS53aWxsSXRGaXQobik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gY2FuQWNjZXB0O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSlcclxuICAgICAgICAgICAgLyoqXHJcbiAgICAgICAgICAgICAqIGVudGVyaW5nIG91ciBncmlkIGFyZWFcclxuICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgIC5vbih0aGlzLmVsLCAnZHJvcG92ZXInLCAoZXZlbnQsIGVsLCBoZWxwZXIpID0+IHtcclxuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coYG92ZXIgJHt0aGlzLmVsLmdyaWRzdGFjay5vcHRzLmlkfSAke2NvdW50Kyt9YCk7IC8vIFRFU1RcclxuICAgICAgICAgICAgbGV0IG5vZGUgPSBlbC5ncmlkc3RhY2tOb2RlO1xyXG4gICAgICAgICAgICAvLyBpZ25vcmUgZHJvcCBlbnRlciBvbiBvdXJzZWxmICh1bmxlc3Mgd2UgdGVtcG9yYXJpbHkgcmVtb3ZlZCkgd2hpY2ggaGFwcGVucyBvbiBhIHNpbXBsZSBkcmFnIG9mIG91ciBpdGVtXHJcbiAgICAgICAgICAgIGlmICgobm9kZSA9PT0gbnVsbCB8fCBub2RlID09PSB2b2lkIDAgPyB2b2lkIDAgOiBub2RlLmdyaWQpID09PSB0aGlzICYmICFub2RlLl90ZW1wb3JhcnlSZW1vdmVkKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBkZWxldGUgbm9kZS5fYWRkZWQ7IC8vIHJlc2V0IHRoaXMgdG8gdHJhY2sgcGxhY2Vob2xkZXIgYWdhaW4gaW4gY2FzZSB3ZSB3ZXJlIG92ZXIgb3RoZXIgZ3JpZCAjMTQ4NCAoZHJvcG91dCBkb2Vzbid0IGFsd2F5cyBjbGVhcilcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTsgLy8gcHJldmVudCBwYXJlbnQgZnJvbSByZWNlaXZpbmcgbXNnICh3aGljaCBtYXkgYmUgYSBncmlkIGFzIHdlbGwpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8gZml4ICMxNTc4IHdoZW4gZHJhZ2dpbmcgZmFzdCwgd2UgbWF5IG5vdCBnZXQgYSBsZWF2ZSBvbiB0aGUgcHJldmlvdXMgZ3JpZCBzbyBmb3JjZSBvbmUgbm93XHJcbiAgICAgICAgICAgIGlmICgobm9kZSA9PT0gbnVsbCB8fCBub2RlID09PSB2b2lkIDAgPyB2b2lkIDAgOiBub2RlLmdyaWQpICYmIG5vZGUuZ3JpZCAhPT0gdGhpcyAmJiAhbm9kZS5fdGVtcG9yYXJ5UmVtb3ZlZCkge1xyXG4gICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coJ2Ryb3BvdmVyIHdpdGhvdXQgbGVhdmUnKTsgLy8gVEVTVFxyXG4gICAgICAgICAgICAgICAgbGV0IG90aGVyR3JpZCA9IG5vZGUuZ3JpZDtcclxuICAgICAgICAgICAgICAgIG90aGVyR3JpZC5fbGVhdmUoZWwsIGhlbHBlcik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8gY2FjaGUgY2VsbCBkaW1lbnNpb25zICh3aGljaCBkb24ndCBjaGFuZ2UpLCBwb3NpdGlvbiBjYW4gYW5pbWF0ZSBpZiB3ZSByZW1vdmVkIGFuIGl0ZW0gaW4gb3RoZXJHcmlkIHRoYXQgYWZmZWN0cyB1cy4uLlxyXG4gICAgICAgICAgICBjZWxsV2lkdGggPSB0aGlzLmNlbGxXaWR0aCgpO1xyXG4gICAgICAgICAgICBjZWxsSGVpZ2h0ID0gdGhpcy5nZXRDZWxsSGVpZ2h0KHRydWUpO1xyXG4gICAgICAgICAgICAvLyBsb2FkIGFueSBlbGVtZW50IGF0dHJpYnV0ZXMgaWYgd2UgZG9uJ3QgaGF2ZSBhIG5vZGVcclxuICAgICAgICAgICAgaWYgKCFub2RlKSB7IC8vIEB0cy1pZ25vcmUgcHJpdmF0ZSByZWFkIG9ubHkgb24gb3Vyc2VsZlxyXG4gICAgICAgICAgICAgICAgbm9kZSA9IHRoaXMuX3JlYWRBdHRyKGVsKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoIW5vZGUuZ3JpZCkge1xyXG4gICAgICAgICAgICAgICAgbm9kZS5faXNFeHRlcm5hbCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICBlbC5ncmlkc3RhY2tOb2RlID0gbm9kZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvLyBjYWxjdWxhdGUgdGhlIGdyaWQgc2l6ZSBiYXNlZCBvbiBlbGVtZW50IG91dGVyIHNpemVcclxuICAgICAgICAgICAgaGVscGVyID0gaGVscGVyIHx8IGVsO1xyXG4gICAgICAgICAgICBsZXQgdyA9IG5vZGUudyB8fCBNYXRoLnJvdW5kKGhlbHBlci5vZmZzZXRXaWR0aCAvIGNlbGxXaWR0aCkgfHwgMTtcclxuICAgICAgICAgICAgbGV0IGggPSBub2RlLmggfHwgTWF0aC5yb3VuZChoZWxwZXIub2Zmc2V0SGVpZ2h0IC8gY2VsbEhlaWdodCkgfHwgMTtcclxuICAgICAgICAgICAgLy8gaWYgdGhlIGl0ZW0gY2FtZSBmcm9tIGFub3RoZXIgZ3JpZCwgbWFrZSBhIGNvcHkgYW5kIHNhdmUgdGhlIG9yaWdpbmFsIGluZm8gaW4gY2FzZSB3ZSBnbyBiYWNrIHRoZXJlXHJcbiAgICAgICAgICAgIGlmIChub2RlLmdyaWQgJiYgbm9kZS5ncmlkICE9PSB0aGlzKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBjb3B5IHRoZSBub2RlIG9yaWdpbmFsIHZhbHVlcyAobWluL21heC9pZC9ldGMuLi4pIGJ1dCBvdmVycmlkZSB3aWR0aC9oZWlnaHQvb3RoZXIgZmxhZ3Mgd2hpY2ggYXJlIHRoaXMgZ3JpZCBzcGVjaWZpY1xyXG4gICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coJ2Ryb3BvdmVyIGNsb25pbmcgbm9kZScpOyAvLyBURVNUXHJcbiAgICAgICAgICAgICAgICBpZiAoIWVsLl9ncmlkc3RhY2tOb2RlT3JpZylcclxuICAgICAgICAgICAgICAgICAgICBlbC5fZ3JpZHN0YWNrTm9kZU9yaWcgPSBub2RlOyAvLyBzaG91bGRuJ3QgaGF2ZSBtdWx0aXBsZSBuZXN0ZWQhXHJcbiAgICAgICAgICAgICAgICBlbC5ncmlkc3RhY2tOb2RlID0gbm9kZSA9IE9iamVjdC5hc3NpZ24oT2JqZWN0LmFzc2lnbih7fSwgbm9kZSksIHsgdywgaCwgZ3JpZDogdGhpcyB9KTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZW5naW5lLmNsZWFudXBOb2RlKG5vZGUpXHJcbiAgICAgICAgICAgICAgICAgICAgLm5vZGVCb3VuZEZpeChub2RlKTtcclxuICAgICAgICAgICAgICAgIC8vIHJlc3RvcmUgc29tZSBpbnRlcm5hbCBmaWVsZHMgd2UgbmVlZCBhZnRlciBjbGVhcmluZyB0aGVtIGFsbFxyXG4gICAgICAgICAgICAgICAgbm9kZS5faW5pdEREID1cclxuICAgICAgICAgICAgICAgICAgICBub2RlLl9pc0V4dGVybmFsID0gLy8gRE9NIG5lZWRzIHRvIGJlIHJlLXBhcmVudGVkIG9uIGEgZHJvcFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBub2RlLl90ZW1wb3JhcnlSZW1vdmVkID0gdHJ1ZTsgLy8gc28gaXQgY2FuIGJlIGluc2VydGVkIG9uRHJhZyBiZWxvd1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgbm9kZS53ID0gdztcclxuICAgICAgICAgICAgICAgIG5vZGUuaCA9IGg7XHJcbiAgICAgICAgICAgICAgICBub2RlLl90ZW1wb3JhcnlSZW1vdmVkID0gdHJ1ZTsgLy8gc28gd2UgY2FuIGluc2VydCBpdFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIGNsZWFyIGFueSBtYXJrZWQgZm9yIGNvbXBsZXRlIHJlbW92YWwgKE5vdGU6IGRvbid0IGNoZWNrIF9pc0Fib3V0VG9SZW1vdmUgYXMgdGhhdCBpcyBjbGVhcmVkIGFib3ZlIC0ganVzdCBkbyBpdClcclxuICAgICAgICAgICAgdGhpcy5faXRlbVJlbW92aW5nKG5vZGUuZWwsIGZhbHNlKTtcclxuICAgICAgICAgICAgZGQub24oZWwsICdkcmFnJywgb25EcmFnKTtcclxuICAgICAgICAgICAgLy8gbWFrZSBzdXJlIHRoaXMgaXMgY2FsbGVkIGF0IGxlYXN0IG9uY2Ugd2hlbiBnb2luZyBmYXN0ICMxNTc4XHJcbiAgICAgICAgICAgIG9uRHJhZyhldmVudCwgZWwsIGhlbHBlcik7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTsgLy8gcHJldmVudCBwYXJlbnQgZnJvbSByZWNlaXZpbmcgbXNnICh3aGljaCBtYXkgYmUgYSBncmlkIGFzIHdlbGwpXHJcbiAgICAgICAgfSlcclxuICAgICAgICAgICAgLyoqXHJcbiAgICAgICAgICAgICAqIExlYXZpbmcgb3VyIGdyaWQgYXJlYS4uLlxyXG4gICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgLm9uKHRoaXMuZWwsICdkcm9wb3V0JywgKGV2ZW50LCBlbCwgaGVscGVyKSA9PiB7XHJcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKGBvdXQgJHt0aGlzLmVsLmdyaWRzdGFjay5vcHRzLmlkfSAke2NvdW50Kyt9YCk7IC8vIFRFU1RcclxuICAgICAgICAgICAgbGV0IG5vZGUgPSBlbC5ncmlkc3RhY2tOb2RlO1xyXG4gICAgICAgICAgICBpZiAoIW5vZGUpXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIC8vIGZpeCAjMTU3OCB3aGVuIGRyYWdnaW5nIGZhc3QsIHdlIG1pZ2h0IGdldCBsZWF2ZSBhZnRlciBvdGhlciBncmlkIGdldHMgZW50ZXIgKHdoaWNoIGNhbGxzIHVzIHRvIGNsZWFuKVxyXG4gICAgICAgICAgICAvLyBzbyBza2lwIHRoaXMgb25lIGlmIHdlJ3JlIG5vdCB0aGUgYWN0aXZlIGdyaWQgcmVhbGx5Li5cclxuICAgICAgICAgICAgaWYgKCFub2RlLmdyaWQgfHwgbm9kZS5ncmlkID09PSB0aGlzKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9sZWF2ZShlbCwgaGVscGVyKTtcclxuICAgICAgICAgICAgICAgIC8vIGlmIHdlIHdlcmUgY3JlYXRlZCBhcyB0ZW1wb3JhcnkgbmVzdGVkIGdyaWQsIGdvIGJhY2sgdG8gYmVmb3JlIHN0YXRlXHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5faXNUZW1wKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZW1vdmVBc1N1YkdyaWQobm9kZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlOyAvLyBwcmV2ZW50IHBhcmVudCBmcm9tIHJlY2VpdmluZyBtc2cgKHdoaWNoIG1heSBiZSBncmlkIGFzIHdlbGwpXHJcbiAgICAgICAgfSlcclxuICAgICAgICAgICAgLyoqXHJcbiAgICAgICAgICAgICAqIGVuZCAtIHJlbGVhc2luZyB0aGUgbW91c2VcclxuICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgIC5vbih0aGlzLmVsLCAnZHJvcCcsIChldmVudCwgZWwsIGhlbHBlcikgPT4ge1xyXG4gICAgICAgICAgICB2YXIgX2EsIF9iO1xyXG4gICAgICAgICAgICBsZXQgbm9kZSA9IGVsLmdyaWRzdGFja05vZGU7XHJcbiAgICAgICAgICAgIC8vIGlnbm9yZSBkcm9wIG9uIG91cnNlbGYgZnJvbSBvdXJzZWxmIHRoYXQgZGlkbid0IGNvbWUgZnJvbSB0aGUgb3V0c2lkZSAtIGRyYWdlbmQgd2lsbCBoYW5kbGUgdGhlIHNpbXBsZSBtb3ZlIGluc3RlYWRcclxuICAgICAgICAgICAgaWYgKChub2RlID09PSBudWxsIHx8IG5vZGUgPT09IHZvaWQgMCA/IHZvaWQgMCA6IG5vZGUuZ3JpZCkgPT09IHRoaXMgJiYgIW5vZGUuX2lzRXh0ZXJuYWwpXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIGxldCB3YXNBZGRlZCA9ICEhdGhpcy5wbGFjZWhvbGRlci5wYXJlbnRFbGVtZW50OyAvLyBza2lwIGl0ZW1zIG5vdCBhY3R1YWxseSBhZGRlZCB0byB1cyBiZWNhdXNlIG9mIGNvbnN0cmFpbnMsIGJ1dCBkbyBjbGVhbnVwICMxNDE5XHJcbiAgICAgICAgICAgIHRoaXMucGxhY2Vob2xkZXIucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgIC8vIG5vdGlmeSBwcmV2aW91cyBncmlkIG9mIHJlbW92YWxcclxuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coJ2Ryb3AgZGVsZXRlIF9ncmlkc3RhY2tOb2RlT3JpZycpIC8vIFRFU1RcclxuICAgICAgICAgICAgbGV0IG9yaWdOb2RlID0gZWwuX2dyaWRzdGFja05vZGVPcmlnO1xyXG4gICAgICAgICAgICBkZWxldGUgZWwuX2dyaWRzdGFja05vZGVPcmlnO1xyXG4gICAgICAgICAgICBpZiAod2FzQWRkZWQgJiYgKG9yaWdOb2RlID09PSBudWxsIHx8IG9yaWdOb2RlID09PSB2b2lkIDAgPyB2b2lkIDAgOiBvcmlnTm9kZS5ncmlkKSAmJiBvcmlnTm9kZS5ncmlkICE9PSB0aGlzKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgb0dyaWQgPSBvcmlnTm9kZS5ncmlkO1xyXG4gICAgICAgICAgICAgICAgb0dyaWQuZW5naW5lLnJlbW92ZWROb2Rlcy5wdXNoKG9yaWdOb2RlKTtcclxuICAgICAgICAgICAgICAgIG9HcmlkLl90cmlnZ2VyUmVtb3ZlRXZlbnQoKS5fdHJpZ2dlckNoYW5nZUV2ZW50KCk7XHJcbiAgICAgICAgICAgICAgICAvLyBpZiBpdCdzIGFuIGVtcHR5IHN1Yi1ncmlkIHRoYXQgZ290IGF1dG8tY3JlYXRlZCwgbnVrZSBpdFxyXG4gICAgICAgICAgICAgICAgaWYgKG9HcmlkLnBhcmVudEdyaWRJdGVtICYmICFvR3JpZC5lbmdpbmUubm9kZXMubGVuZ3RoICYmIG9HcmlkLm9wdHMuc3ViR3JpZER5bmFtaWMpIHtcclxuICAgICAgICAgICAgICAgICAgICBvR3JpZC5yZW1vdmVBc1N1YkdyaWQoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoIW5vZGUpXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIC8vIHVzZSBleGlzdGluZyBwbGFjZWhvbGRlciBub2RlIGFzIGl0J3MgYWxyZWFkeSBpbiBvdXIgbGlzdCB3aXRoIGRyb3AgbG9jYXRpb25cclxuICAgICAgICAgICAgaWYgKHdhc0FkZGVkKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmVuZ2luZS5jbGVhbnVwTm9kZShub2RlKTsgLy8gcmVtb3ZlcyBhbGwgaW50ZXJuYWwgX3h5eiB2YWx1ZXNcclxuICAgICAgICAgICAgICAgIG5vZGUuZ3JpZCA9IHRoaXM7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZGQub2ZmKGVsLCAnZHJhZycpO1xyXG4gICAgICAgICAgICAvLyBpZiB3ZSBtYWRlIGEgY29weSAoJ2hlbHBlcicgd2hpY2ggaXMgdGVtcCkgb2YgdGhlIG9yaWdpbmFsIG5vZGUgdGhlbiBpbnNlcnQgYSBjb3B5LCBlbHNlIHdlIG1vdmUgdGhlIG9yaWdpbmFsIG5vZGUgKCMxMTAyKVxyXG4gICAgICAgICAgICAvLyBhcyB0aGUgaGVscGVyIHdpbGwgYmUgbnVrZWQgYnkganF1ZXJ5LXVpIG90aGVyd2lzZS4gVE9ETzogdXBkYXRlIG9sZCBjb2RlIHBhdGhcclxuICAgICAgICAgICAgaWYgKGhlbHBlciAhPT0gZWwpIHtcclxuICAgICAgICAgICAgICAgIGhlbHBlci5yZW1vdmUoKTtcclxuICAgICAgICAgICAgICAgIGVsLmdyaWRzdGFja05vZGUgPSBvcmlnTm9kZTsgLy8gb3JpZ2luYWwgaXRlbSAobGVmdCBiZWhpbmQpIGlzIHJlLXN0b3JlZCB0byBwcmUgZHJhZ2dpbmcgYXMgdGhlIG5vZGUgbm93IGhhcyBkcm9wIGluZm9cclxuICAgICAgICAgICAgICAgIGlmICh3YXNBZGRlZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGVsID0gZWwuY2xvbmVOb2RlKHRydWUpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgZWwucmVtb3ZlKCk7IC8vIHJlZHVjZSBmbGlja2VyIGFzIHdlIGNoYW5nZSBkZXB0aCBoZXJlLCBhbmQgc2l6ZSBmdXJ0aGVyIGRvd25cclxuICAgICAgICAgICAgICAgIHRoaXMuX3JlbW92ZUREKGVsKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoIXdhc0FkZGVkKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICBlbC5ncmlkc3RhY2tOb2RlID0gbm9kZTtcclxuICAgICAgICAgICAgbm9kZS5lbCA9IGVsO1xyXG4gICAgICAgICAgICBsZXQgc3ViR3JpZCA9IChfYiA9IChfYSA9IG5vZGUuc3ViR3JpZCkgPT09IG51bGwgfHwgX2EgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9hLmVsKSA9PT0gbnVsbCB8fCBfYiA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2IuZ3JpZHN0YWNrOyAvLyBzZXQgd2hlbiBhY3R1YWwgc3ViLWdyaWQgcHJlc2VudFxyXG4gICAgICAgICAgICAvLyBAdHMtaWdub3JlXHJcbiAgICAgICAgICAgIHV0aWxzXzEuVXRpbHMuY29weVBvcyhub2RlLCB0aGlzLl9yZWFkQXR0cih0aGlzLnBsYWNlaG9sZGVyKSk7IC8vIHBsYWNlaG9sZGVyIHZhbHVlcyBhcyBtb3ZpbmcgVkVSWSBmYXN0IGNhbiB0aHJvdyB0aGluZ3Mgb2ZmICMxNTc4XHJcbiAgICAgICAgICAgIHV0aWxzXzEuVXRpbHMucmVtb3ZlUG9zaXRpb25pbmdTdHlsZXMoZWwpOyAvLyBAdHMtaWdub3JlXHJcbiAgICAgICAgICAgIHRoaXMuX3dyaXRlQXR0cihlbCwgbm9kZSk7XHJcbiAgICAgICAgICAgIGVsLmNsYXNzTGlzdC5hZGQodHlwZXNfMS5ncmlkRGVmYXVsdHMuaXRlbUNsYXNzLCB0aGlzLm9wdHMuaXRlbUNsYXNzKTtcclxuICAgICAgICAgICAgdGhpcy5lbC5hcHBlbmRDaGlsZChlbCk7IC8vIEB0cy1pZ25vcmUgLy8gVE9ETzogbm93IHdvdWxkIGJlIGlkZWFsIHRpbWUgdG8gX3JlbW92ZUhlbHBlclN0eWxlKCkgb3ZlcnJpZGluZyBmbG9hdGluZyBzdHlsZXMgKG5hdGl2ZSBvbmx5KVxyXG4gICAgICAgICAgICBpZiAoc3ViR3JpZCkge1xyXG4gICAgICAgICAgICAgICAgc3ViR3JpZC5wYXJlbnRHcmlkSXRlbSA9IG5vZGU7XHJcbiAgICAgICAgICAgICAgICBpZiAoIXN1YkdyaWQub3B0cy5zdHlsZUluSGVhZClcclxuICAgICAgICAgICAgICAgICAgICBzdWJHcmlkLl91cGRhdGVTdHlsZXModHJ1ZSk7IC8vIHJlLWNyZWF0ZSBzdWItZ3JpZCBzdHlsZXMgbm93IHRoYXQgd2UndmUgbW92ZWRcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLl91cGRhdGVDb250YWluZXJIZWlnaHQoKTtcclxuICAgICAgICAgICAgdGhpcy5lbmdpbmUuYWRkZWROb2Rlcy5wdXNoKG5vZGUpOyAvLyBAdHMtaWdub3JlXHJcbiAgICAgICAgICAgIHRoaXMuX3RyaWdnZXJBZGRFdmVudCgpOyAvLyBAdHMtaWdub3JlXHJcbiAgICAgICAgICAgIHRoaXMuX3RyaWdnZXJDaGFuZ2VFdmVudCgpO1xyXG4gICAgICAgICAgICB0aGlzLmVuZ2luZS5lbmRVcGRhdGUoKTtcclxuICAgICAgICAgICAgaWYgKHRoaXMuX2dzRXZlbnRIYW5kbGVyWydkcm9wcGVkJ10pIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2dzRXZlbnRIYW5kbGVyWydkcm9wcGVkJ10oT2JqZWN0LmFzc2lnbihPYmplY3QuYXNzaWduKHt9LCBldmVudCksIHsgdHlwZTogJ2Ryb3BwZWQnIH0pLCBvcmlnTm9kZSAmJiBvcmlnTm9kZS5ncmlkID8gb3JpZ05vZGUgOiB1bmRlZmluZWQsIG5vZGUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIHdhaXQgdGlsbCB3ZSByZXR1cm4gb3V0IG9mIHRoZSBkcmFnIGNhbGxiYWNrIHRvIHNldCB0aGUgbmV3IGRyYWcmcmVzaXplIGhhbmRsZXIgb3IgdGhleSBtYXkgZ2V0IG1lc3NlZCB1cFxyXG4gICAgICAgICAgICB3aW5kb3cuc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAvLyBJRkYgd2UgYXJlIHN0aWxsIHRoZXJlIChzb21lIGFwcGxpY2F0aW9uIHdpbGwgdXNlIGFzIHBsYWNlaG9sZGVyIGFuZCBpbnNlcnQgdGhlaXIgcmVhbCB3aWRnZXQgaW5zdGVhZCBhbmQgYmV0dGVyIGNhbGwgbWFrZVdpZGdldCgpKVxyXG4gICAgICAgICAgICAgICAgaWYgKG5vZGUuZWwgJiYgbm9kZS5lbC5wYXJlbnRFbGVtZW50KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fcHJlcGFyZURyYWdEcm9wQnlOb2RlKG5vZGUpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5lbmdpbmUucmVtb3ZlTm9kZShub2RlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGRlbGV0ZSBub2RlLmdyaWQuX2lzVGVtcDtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTsgLy8gcHJldmVudCBwYXJlbnQgZnJvbSByZWNlaXZpbmcgbXNnICh3aGljaCBtYXkgYmUgZ3JpZCBhcyB3ZWxsKVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG4gICAgLyoqIEBpbnRlcm5hbCBtYXJrIGl0ZW0gZm9yIHJlbW92YWwgKi9cclxuICAgIF9pdGVtUmVtb3ZpbmcoZWwsIHJlbW92ZSkge1xyXG4gICAgICAgIGxldCBub2RlID0gZWwgPyBlbC5ncmlkc3RhY2tOb2RlIDogdW5kZWZpbmVkO1xyXG4gICAgICAgIGlmICghbm9kZSB8fCAhbm9kZS5ncmlkKVxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgcmVtb3ZlID8gbm9kZS5faXNBYm91dFRvUmVtb3ZlID0gdHJ1ZSA6IGRlbGV0ZSBub2RlLl9pc0Fib3V0VG9SZW1vdmU7XHJcbiAgICAgICAgcmVtb3ZlID8gZWwuY2xhc3NMaXN0LmFkZCgnZ3JpZC1zdGFjay1pdGVtLXJlbW92aW5nJykgOiBlbC5jbGFzc0xpc3QucmVtb3ZlKCdncmlkLXN0YWNrLWl0ZW0tcmVtb3ZpbmcnKTtcclxuICAgIH1cclxuICAgIC8qKiBAaW50ZXJuYWwgY2FsbGVkIHRvIHNldHVwIGEgdHJhc2ggZHJvcCB6b25lIGlmIHRoZSB1c2VyIHNwZWNpZmllcyBpdCAqL1xyXG4gICAgX3NldHVwUmVtb3ZlRHJvcCgpIHtcclxuICAgICAgICBpZiAoIXRoaXMub3B0cy5zdGF0aWNHcmlkICYmIHR5cGVvZiB0aGlzLm9wdHMucmVtb3ZhYmxlID09PSAnc3RyaW5nJykge1xyXG4gICAgICAgICAgICBsZXQgdHJhc2hFbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGhpcy5vcHRzLnJlbW92YWJsZSk7XHJcbiAgICAgICAgICAgIGlmICghdHJhc2hFbClcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgICAgICAvLyBvbmx5IHJlZ2lzdGVyIE9ORSBkcm9wLW92ZXIvZHJvcG91dCBjYWxsYmFjayBmb3IgdGhlICd0cmFzaCcsIGFuZCBpdCB3aWxsXHJcbiAgICAgICAgICAgIC8vIHVwZGF0ZSB0aGUgcGFzc2VkIGluIGl0ZW0gYW5kIHBhcmVudCBncmlkIGJlY2F1c2UgdGhlICd0cmFzaCcgaXMgYSBzaGFyZWQgcmVzb3VyY2UgYW55d2F5LFxyXG4gICAgICAgICAgICAvLyBhbmQgTmF0aXZlIEREIG9ubHkgaGFzIDEgZXZlbnQgQ0IgKGhhdmluZyBhIGxpc3QgYW5kIHRlY2huaWNhbGx5IGEgcGVyIGdyaWQgcmVtb3ZhYmxlT3B0aW9ucyBjb21wbGljYXRlcyB0aGluZ3MgZ3JlYXRseSlcclxuICAgICAgICAgICAgaWYgKCFkZC5pc0Ryb3BwYWJsZSh0cmFzaEVsKSkge1xyXG4gICAgICAgICAgICAgICAgZGQuZHJvcHBhYmxlKHRyYXNoRWwsIHRoaXMub3B0cy5yZW1vdmFibGVPcHRpb25zKVxyXG4gICAgICAgICAgICAgICAgICAgIC5vbih0cmFzaEVsLCAnZHJvcG92ZXInLCAoZXZlbnQsIGVsKSA9PiB0aGlzLl9pdGVtUmVtb3ZpbmcoZWwsIHRydWUpKVxyXG4gICAgICAgICAgICAgICAgICAgIC5vbih0cmFzaEVsLCAnZHJvcG91dCcsIChldmVudCwgZWwpID0+IHRoaXMuX2l0ZW1SZW1vdmluZyhlbCwgZmFsc2UpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuICAgIC8qKiBAaW50ZXJuYWwgcHJlcGFyZXMgdGhlIGVsZW1lbnQgZm9yIGRyYWcmZHJvcCAqKi9cclxuICAgIF9wcmVwYXJlRHJhZ0Ryb3BCeU5vZGUobm9kZSkge1xyXG4gICAgICAgIGxldCBlbCA9IG5vZGUuZWw7XHJcbiAgICAgICAgY29uc3Qgbm9Nb3ZlID0gbm9kZS5ub01vdmUgfHwgdGhpcy5vcHRzLmRpc2FibGVEcmFnO1xyXG4gICAgICAgIGNvbnN0IG5vUmVzaXplID0gbm9kZS5ub1Jlc2l6ZSB8fCB0aGlzLm9wdHMuZGlzYWJsZVJlc2l6ZTtcclxuICAgICAgICAvLyBjaGVjayBmb3IgZGlzYWJsZWQgZ3JpZCBmaXJzdFxyXG4gICAgICAgIGlmICh0aGlzLm9wdHMuc3RhdGljR3JpZCB8fCAobm9Nb3ZlICYmIG5vUmVzaXplKSkge1xyXG4gICAgICAgICAgICBpZiAobm9kZS5faW5pdEREKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9yZW1vdmVERChlbCk7IC8vIG51a2VzIGV2ZXJ5dGhpbmcgaW5zdGVhZCBvZiBqdXN0IGRpc2FibGUsIHdpbGwgYWRkIHNvbWUgc3R5bGVzIGJhY2sgbmV4dFxyXG4gICAgICAgICAgICAgICAgZGVsZXRlIG5vZGUuX2luaXRERDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbC5jbGFzc0xpc3QuYWRkKCd1aS1kcmFnZ2FibGUtZGlzYWJsZWQnLCAndWktcmVzaXphYmxlLWRpc2FibGVkJyk7IC8vIGFkZCBzdHlsZXMgb25lIG1pZ2h0IGRlcGVuZCBvbiAjMTQzNVxyXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCFub2RlLl9pbml0REQpIHtcclxuICAgICAgICAgICAgLy8gdmFyaWFibGVzIHVzZWQvY2FzaGVkIGJldHdlZW4gdGhlIDMgc3RhcnQvbW92ZS9lbmQgbWV0aG9kcywgaW4gYWRkaXRpb24gdG8gbm9kZSBwYXNzZWQgYWJvdmVcclxuICAgICAgICAgICAgbGV0IGNlbGxXaWR0aDtcclxuICAgICAgICAgICAgbGV0IGNlbGxIZWlnaHQ7XHJcbiAgICAgICAgICAgIC8qKiBjYWxsZWQgd2hlbiBpdGVtIHN0YXJ0cyBtb3ZpbmcvcmVzaXppbmcgKi9cclxuICAgICAgICAgICAgbGV0IG9uU3RhcnRNb3ZpbmcgPSAoZXZlbnQsIHVpKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAvLyB0cmlnZ2VyIGFueSAnZHJhZ3N0YXJ0JyAvICdyZXNpemVzdGFydCcgbWFudWFsbHlcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLl9nc0V2ZW50SGFuZGxlcltldmVudC50eXBlXSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2dzRXZlbnRIYW5kbGVyW2V2ZW50LnR5cGVdKGV2ZW50LCBldmVudC50YXJnZXQpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY2VsbFdpZHRoID0gdGhpcy5jZWxsV2lkdGgoKTtcclxuICAgICAgICAgICAgICAgIGNlbGxIZWlnaHQgPSB0aGlzLmdldENlbGxIZWlnaHQodHJ1ZSk7IC8vIGZvcmNlIHBpeGVscyBmb3IgY2FsY3VsYXRpb25zXHJcbiAgICAgICAgICAgICAgICB0aGlzLl9vblN0YXJ0TW92aW5nKGVsLCBldmVudCwgdWksIG5vZGUsIGNlbGxXaWR0aCwgY2VsbEhlaWdodCk7XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIC8qKiBjYWxsZWQgd2hlbiBpdGVtIGlzIGJlaW5nIGRyYWdnZWQvcmVzaXplZCAqL1xyXG4gICAgICAgICAgICBsZXQgZHJhZ09yUmVzaXplID0gKGV2ZW50LCB1aSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fZHJhZ09yUmVzaXplKGVsLCBldmVudCwgdWksIG5vZGUsIGNlbGxXaWR0aCwgY2VsbEhlaWdodCk7XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIC8qKiBjYWxsZWQgd2hlbiB0aGUgaXRlbSBzdG9wcyBtb3ZpbmcvcmVzaXppbmcgKi9cclxuICAgICAgICAgICAgbGV0IG9uRW5kTW92aW5nID0gKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBsYWNlaG9sZGVyLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICAgICAgZGVsZXRlIG5vZGUuX21vdmluZztcclxuICAgICAgICAgICAgICAgIGRlbGV0ZSBub2RlLl9ldmVudDtcclxuICAgICAgICAgICAgICAgIGRlbGV0ZSBub2RlLl9sYXN0VHJpZWQ7XHJcbiAgICAgICAgICAgICAgICAvLyBpZiB0aGUgaXRlbSBoYXMgbW92ZWQgdG8gYW5vdGhlciBncmlkLCB3ZSdyZSBkb25lIGhlcmVcclxuICAgICAgICAgICAgICAgIGxldCB0YXJnZXQgPSBldmVudC50YXJnZXQ7XHJcbiAgICAgICAgICAgICAgICBpZiAoIXRhcmdldC5ncmlkc3RhY2tOb2RlIHx8IHRhcmdldC5ncmlkc3RhY2tOb2RlLmdyaWQgIT09IHRoaXMpXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgbm9kZS5lbCA9IHRhcmdldDtcclxuICAgICAgICAgICAgICAgIGlmIChub2RlLl9pc0Fib3V0VG9SZW1vdmUpIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgZ3JpZFRvTm90aWZ5ID0gZWwuZ3JpZHN0YWNrTm9kZS5ncmlkO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChncmlkVG9Ob3RpZnkuX2dzRXZlbnRIYW5kbGVyW2V2ZW50LnR5cGVdKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGdyaWRUb05vdGlmeS5fZ3NFdmVudEhhbmRsZXJbZXZlbnQudHlwZV0oZXZlbnQsIHRhcmdldCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3JlbW92ZUREKGVsKTtcclxuICAgICAgICAgICAgICAgICAgICBncmlkVG9Ob3RpZnkuZW5naW5lLnJlbW92ZWROb2Rlcy5wdXNoKG5vZGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIGdyaWRUb05vdGlmeS5fdHJpZ2dlclJlbW92ZUV2ZW50KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gYnJlYWsgY2lyY3VsYXIgbGlua3MgYW5kIHJlbW92ZSBET01cclxuICAgICAgICAgICAgICAgICAgICBkZWxldGUgZWwuZ3JpZHN0YWNrTm9kZTtcclxuICAgICAgICAgICAgICAgICAgICBkZWxldGUgbm9kZS5lbDtcclxuICAgICAgICAgICAgICAgICAgICBlbC5yZW1vdmUoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHV0aWxzXzEuVXRpbHMucmVtb3ZlUG9zaXRpb25pbmdTdHlsZXModGFyZ2V0KTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAobm9kZS5fdGVtcG9yYXJ5UmVtb3ZlZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBnb3QgcmVtb3ZlZCAtIHJlc3RvcmUgaXRlbSBiYWNrIHRvIGJlZm9yZSBkcmFnZ2luZyBwb3NpdGlvblxyXG4gICAgICAgICAgICAgICAgICAgICAgICB1dGlsc18xLlV0aWxzLmNvcHlQb3Mobm9kZSwgbm9kZS5fb3JpZyk7IC8vIEB0cy1pZ25vcmVcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fd3JpdGVQb3NBdHRyKHRhcmdldCwgbm9kZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZW5naW5lLmFkZE5vZGUobm9kZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBtb3ZlIHRvIG5ldyBwbGFjZWhvbGRlciBsb2NhdGlvblxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl93cml0ZVBvc0F0dHIodGFyZ2V0LCBub2RlKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuX2dzRXZlbnRIYW5kbGVyW2V2ZW50LnR5cGVdKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2dzRXZlbnRIYW5kbGVyW2V2ZW50LnR5cGVdKGV2ZW50LCB0YXJnZXQpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcclxuICAgICAgICAgICAgICAgIHRoaXMuX2V4dHJhRHJhZ1JvdyA9IDA7IC8vIEB0cy1pZ25vcmVcclxuICAgICAgICAgICAgICAgIHRoaXMuX3VwZGF0ZUNvbnRhaW5lckhlaWdodCgpOyAvLyBAdHMtaWdub3JlXHJcbiAgICAgICAgICAgICAgICB0aGlzLl90cmlnZ2VyQ2hhbmdlRXZlbnQoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZW5naW5lLmVuZFVwZGF0ZSgpO1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBkZC5kcmFnZ2FibGUoZWwsIHtcclxuICAgICAgICAgICAgICAgIHN0YXJ0OiBvblN0YXJ0TW92aW5nLFxyXG4gICAgICAgICAgICAgICAgc3RvcDogb25FbmRNb3ZpbmcsXHJcbiAgICAgICAgICAgICAgICBkcmFnOiBkcmFnT3JSZXNpemVcclxuICAgICAgICAgICAgfSkucmVzaXphYmxlKGVsLCB7XHJcbiAgICAgICAgICAgICAgICBzdGFydDogb25TdGFydE1vdmluZyxcclxuICAgICAgICAgICAgICAgIHN0b3A6IG9uRW5kTW92aW5nLFxyXG4gICAgICAgICAgICAgICAgcmVzaXplOiBkcmFnT3JSZXNpemVcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIG5vZGUuX2luaXRERCA9IHRydWU7IC8vIHdlJ3ZlIHNldCBERCBzdXBwb3J0IG5vd1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBmaW5hbGx5IGZpbmUgdHVuZSBtb3ZlIHZzIHJlc2l6ZSBieSBkaXNhYmxpbmcgYW55IHBhcnQuLi5cclxuICAgICAgICBkZC5kcmFnZ2FibGUoZWwsIG5vTW92ZSA/ICdkaXNhYmxlJyA6ICdlbmFibGUnKVxyXG4gICAgICAgICAgICAucmVzaXphYmxlKGVsLCBub1Jlc2l6ZSA/ICdkaXNhYmxlJyA6ICdlbmFibGUnKTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuICAgIC8qKiBAaW50ZXJuYWwgaGFuZGxlcyBhY3R1YWwgZHJhZy9yZXNpemUgc3RhcnQgKiovXHJcbiAgICBfb25TdGFydE1vdmluZyhlbCwgZXZlbnQsIHVpLCBub2RlLCBjZWxsV2lkdGgsIGNlbGxIZWlnaHQpIHtcclxuICAgICAgICB0aGlzLmVuZ2luZS5jbGVhbk5vZGVzKClcclxuICAgICAgICAgICAgLmJlZ2luVXBkYXRlKG5vZGUpO1xyXG4gICAgICAgIC8vIEB0cy1pZ25vcmVcclxuICAgICAgICB0aGlzLl93cml0ZVBvc0F0dHIodGhpcy5wbGFjZWhvbGRlciwgbm9kZSk7XHJcbiAgICAgICAgdGhpcy5lbC5hcHBlbmRDaGlsZCh0aGlzLnBsYWNlaG9sZGVyKTtcclxuICAgICAgICAvLyBjb25zb2xlLmxvZygnX29uU3RhcnRNb3ZpbmcgcGxhY2Vob2xkZXInKSAvLyBURVNUXHJcbiAgICAgICAgbm9kZS5lbCA9IHRoaXMucGxhY2Vob2xkZXI7XHJcbiAgICAgICAgbm9kZS5fbGFzdFVpUG9zaXRpb24gPSB1aS5wb3NpdGlvbjtcclxuICAgICAgICBub2RlLl9wcmV2WVBpeCA9IHVpLnBvc2l0aW9uLnRvcDtcclxuICAgICAgICBub2RlLl9tb3ZpbmcgPSAoZXZlbnQudHlwZSA9PT0gJ2RyYWdzdGFydCcpOyAvLyAnZHJvcG92ZXInIGFyZSBub3QgaW5pdGlhbGx5IG1vdmluZyBzbyB0aGV5IGNhbiBnbyBleGFjdGx5IHdoZXJlIHRoZXkgZW50ZXIgKHdpbGwgcHVzaCBzdHVmZiBvdXQgb2YgdGhlIHdheSlcclxuICAgICAgICBkZWxldGUgbm9kZS5fbGFzdFRyaWVkO1xyXG4gICAgICAgIGlmIChldmVudC50eXBlID09PSAnZHJvcG92ZXInICYmIG5vZGUuX3RlbXBvcmFyeVJlbW92ZWQpIHtcclxuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coJ2VuZ2luZS5hZGROb2RlIHg9JyArIG5vZGUueCk7IC8vIFRFU1RcclxuICAgICAgICAgICAgdGhpcy5lbmdpbmUuYWRkTm9kZShub2RlKTsgLy8gd2lsbCBhZGQsIGZpeCBjb2xsaXNpb25zLCB1cGRhdGUgYXR0ciBhbmQgY2xlYXIgX3RlbXBvcmFyeVJlbW92ZWRcclxuICAgICAgICAgICAgbm9kZS5fbW92aW5nID0gdHJ1ZTsgLy8gQUZURVIsIG1hcmsgYXMgbW92aW5nIG9iamVjdCAod2FudGVkIGZpeCBsb2NhdGlvbiBiZWZvcmUpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIHNldCB0aGUgbWluL21heCByZXNpemUgaW5mb1xyXG4gICAgICAgIHRoaXMuZW5naW5lLmNhY2hlUmVjdHMoY2VsbFdpZHRoLCBjZWxsSGVpZ2h0LCB0aGlzLm9wdHMubWFyZ2luVG9wLCB0aGlzLm9wdHMubWFyZ2luUmlnaHQsIHRoaXMub3B0cy5tYXJnaW5Cb3R0b20sIHRoaXMub3B0cy5tYXJnaW5MZWZ0KTtcclxuICAgICAgICBpZiAoZXZlbnQudHlwZSA9PT0gJ3Jlc2l6ZXN0YXJ0Jykge1xyXG4gICAgICAgICAgICBkZC5yZXNpemFibGUoZWwsICdvcHRpb24nLCAnbWluV2lkdGgnLCBjZWxsV2lkdGggKiAobm9kZS5taW5XIHx8IDEpKVxyXG4gICAgICAgICAgICAgICAgLnJlc2l6YWJsZShlbCwgJ29wdGlvbicsICdtaW5IZWlnaHQnLCBjZWxsSGVpZ2h0ICogKG5vZGUubWluSCB8fCAxKSk7XHJcbiAgICAgICAgICAgIGlmIChub2RlLm1heFcpIHtcclxuICAgICAgICAgICAgICAgIGRkLnJlc2l6YWJsZShlbCwgJ29wdGlvbicsICdtYXhXaWR0aCcsIGNlbGxXaWR0aCAqIG5vZGUubWF4Vyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKG5vZGUubWF4SCkge1xyXG4gICAgICAgICAgICAgICAgZGQucmVzaXphYmxlKGVsLCAnb3B0aW9uJywgJ21heEhlaWdodCcsIGNlbGxIZWlnaHQgKiBub2RlLm1heEgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgLyoqIEBpbnRlcm5hbCBoYW5kbGVzIGFjdHVhbCBkcmFnL3Jlc2l6ZSAqKi9cclxuICAgIF9kcmFnT3JSZXNpemUoZWwsIGV2ZW50LCB1aSwgbm9kZSwgY2VsbFdpZHRoLCBjZWxsSGVpZ2h0KSB7XHJcbiAgICAgICAgbGV0IHAgPSBPYmplY3QuYXNzaWduKHt9LCBub2RlLl9vcmlnKTsgLy8gY291bGQgYmUgdW5kZWZpbmVkIChfaXNFeHRlcm5hbCkgd2hpY2ggaXMgb2sgKGRyYWcgb25seSBzZXQgeCx5IGFuZCB3LGggd2lsbCBkZWZhdWx0IHRvIG5vZGUgdmFsdWUpXHJcbiAgICAgICAgbGV0IHJlc2l6aW5nO1xyXG4gICAgICAgIGxldCBtTGVmdCA9IHRoaXMub3B0cy5tYXJnaW5MZWZ0LCBtUmlnaHQgPSB0aGlzLm9wdHMubWFyZ2luUmlnaHQsIG1Ub3AgPSB0aGlzLm9wdHMubWFyZ2luVG9wLCBtQm90dG9tID0gdGhpcy5vcHRzLm1hcmdpbkJvdHRvbTtcclxuICAgICAgICAvLyBpZiBtYXJnaW5zICh3aGljaCBhcmUgdXNlZCB0byBwYXNzIG1pZCBwb2ludCBieSkgYXJlIGxhcmdlIHJlbGF0aXZlIHRvIGNlbGwgaGVpZ2h0L3dpZHRoLCByZWR1Y2UgdGhlbSBkb3duICMxODU1XHJcbiAgICAgICAgbGV0IG1IZWlnaHQgPSBNYXRoLnJvdW5kKGNlbGxIZWlnaHQgKiAwLjEpLCBtV2lkdGggPSBNYXRoLnJvdW5kKGNlbGxXaWR0aCAqIDAuMSk7XHJcbiAgICAgICAgbUxlZnQgPSBNYXRoLm1pbihtTGVmdCwgbVdpZHRoKTtcclxuICAgICAgICBtUmlnaHQgPSBNYXRoLm1pbihtUmlnaHQsIG1XaWR0aCk7XHJcbiAgICAgICAgbVRvcCA9IE1hdGgubWluKG1Ub3AsIG1IZWlnaHQpO1xyXG4gICAgICAgIG1Cb3R0b20gPSBNYXRoLm1pbihtQm90dG9tLCBtSGVpZ2h0KTtcclxuICAgICAgICBpZiAoZXZlbnQudHlwZSA9PT0gJ2RyYWcnKSB7XHJcbiAgICAgICAgICAgIGlmIChub2RlLl90ZW1wb3JhcnlSZW1vdmVkKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuOyAvLyBoYW5kbGVkIGJ5IGRyb3BvdmVyXHJcbiAgICAgICAgICAgIGxldCBkaXN0YW5jZSA9IHVpLnBvc2l0aW9uLnRvcCAtIG5vZGUuX3ByZXZZUGl4O1xyXG4gICAgICAgICAgICBub2RlLl9wcmV2WVBpeCA9IHVpLnBvc2l0aW9uLnRvcDtcclxuICAgICAgICAgICAgaWYgKHRoaXMub3B0cy5kcmFnZ2FibGUuc2Nyb2xsICE9PSBmYWxzZSkge1xyXG4gICAgICAgICAgICAgICAgdXRpbHNfMS5VdGlscy51cGRhdGVTY3JvbGxQb3NpdGlvbihlbCwgdWkucG9zaXRpb24sIGRpc3RhbmNlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvLyBnZXQgbmV3IHBvc2l0aW9uIHRha2luZyBpbnRvIGFjY291bnQgdGhlIG1hcmdpbiBpbiB0aGUgZGlyZWN0aW9uIHdlIGFyZSBtb3ZpbmchIChuZWVkIHRvIHBhc3MgbWlkIHBvaW50IGJ5IG1hcmdpbilcclxuICAgICAgICAgICAgbGV0IGxlZnQgPSB1aS5wb3NpdGlvbi5sZWZ0ICsgKHVpLnBvc2l0aW9uLmxlZnQgPiBub2RlLl9sYXN0VWlQb3NpdGlvbi5sZWZ0ID8gLW1SaWdodCA6IG1MZWZ0KTtcclxuICAgICAgICAgICAgbGV0IHRvcCA9IHVpLnBvc2l0aW9uLnRvcCArICh1aS5wb3NpdGlvbi50b3AgPiBub2RlLl9sYXN0VWlQb3NpdGlvbi50b3AgPyAtbUJvdHRvbSA6IG1Ub3ApO1xyXG4gICAgICAgICAgICBwLnggPSBNYXRoLnJvdW5kKGxlZnQgLyBjZWxsV2lkdGgpO1xyXG4gICAgICAgICAgICBwLnkgPSBNYXRoLnJvdW5kKHRvcCAvIGNlbGxIZWlnaHQpO1xyXG4gICAgICAgICAgICAvLyBAdHMtaWdub3JlLy8gaWYgd2UncmUgYXQgdGhlIGJvdHRvbSBoaXR0aW5nIHNvbWV0aGluZyBlbHNlLCBncm93IHRoZSBncmlkIHNvIGN1cnNvciBkb2Vzbid0IGxlYXZlIHdoZW4gdHJ5aW5nIHRvIHBsYWNlIGJlbG93IG90aGVyc1xyXG4gICAgICAgICAgICBsZXQgcHJldiA9IHRoaXMuX2V4dHJhRHJhZ1JvdztcclxuICAgICAgICAgICAgaWYgKHRoaXMuZW5naW5lLmNvbGxpZGUobm9kZSwgcCkpIHtcclxuICAgICAgICAgICAgICAgIGxldCByb3cgPSB0aGlzLmdldFJvdygpO1xyXG4gICAgICAgICAgICAgICAgbGV0IGV4dHJhID0gTWF0aC5tYXgoMCwgKHAueSArIG5vZGUuaCkgLSByb3cpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMub3B0cy5tYXhSb3cgJiYgcm93ICsgZXh0cmEgPiB0aGlzLm9wdHMubWF4Um93KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZXh0cmEgPSBNYXRoLm1heCgwLCB0aGlzLm9wdHMubWF4Um93IC0gcm93KTtcclxuICAgICAgICAgICAgICAgIH0gLy8gQHRzLWlnbm9yZVxyXG4gICAgICAgICAgICAgICAgdGhpcy5fZXh0cmFEcmFnUm93ID0gZXh0cmE7IC8vIEB0cy1pZ25vcmVcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICB0aGlzLl9leHRyYURyYWdSb3cgPSAwOyAvLyBAdHMtaWdub3JlXHJcbiAgICAgICAgICAgIGlmICh0aGlzLl9leHRyYURyYWdSb3cgIT09IHByZXYpXHJcbiAgICAgICAgICAgICAgICB0aGlzLl91cGRhdGVDb250YWluZXJIZWlnaHQoKTtcclxuICAgICAgICAgICAgaWYgKG5vZGUueCA9PT0gcC54ICYmIG5vZGUueSA9PT0gcC55KVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuOyAvLyBza2lwIHNhbWVcclxuICAgICAgICAgICAgLy8gRE9OJ1Qgc2tpcCBvbmUgd2UgdHJpZWQgYXMgd2UgbWlnaHQgaGF2ZSBmYWlsZWQgYmVjYXVzZSBvZiBjb3ZlcmFnZSA8NTAlIGJlZm9yZVxyXG4gICAgICAgICAgICAvLyBpZiAobm9kZS5fbGFzdFRyaWVkICYmIG5vZGUuX2xhc3RUcmllZC54ID09PSB4ICYmIG5vZGUuX2xhc3RUcmllZC55ID09PSB5KSByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKGV2ZW50LnR5cGUgPT09ICdyZXNpemUnKSB7XHJcbiAgICAgICAgICAgIGlmIChwLnggPCAwKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAvLyBTY3JvbGxpbmcgcGFnZSBpZiBuZWVkZWRcclxuICAgICAgICAgICAgdXRpbHNfMS5VdGlscy51cGRhdGVTY3JvbGxSZXNpemUoZXZlbnQsIGVsLCBjZWxsSGVpZ2h0KTtcclxuICAgICAgICAgICAgLy8gZ2V0IG5ldyBzaXplXHJcbiAgICAgICAgICAgIHAudyA9IE1hdGgucm91bmQoKHVpLnNpemUud2lkdGggLSBtTGVmdCkgLyBjZWxsV2lkdGgpO1xyXG4gICAgICAgICAgICBwLmggPSBNYXRoLnJvdW5kKCh1aS5zaXplLmhlaWdodCAtIG1Ub3ApIC8gY2VsbEhlaWdodCk7XHJcbiAgICAgICAgICAgIGlmIChub2RlLncgPT09IHAudyAmJiBub2RlLmggPT09IHAuaClcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgaWYgKG5vZGUuX2xhc3RUcmllZCAmJiBub2RlLl9sYXN0VHJpZWQudyA9PT0gcC53ICYmIG5vZGUuX2xhc3RUcmllZC5oID09PSBwLmgpXHJcbiAgICAgICAgICAgICAgICByZXR1cm47IC8vIHNraXAgb25lIHdlIHRyaWVkIChidXQgZmFpbGVkKVxyXG4gICAgICAgICAgICAvLyBpZiB3ZSBzaXplIG9uIGxlZnQvdG9wIHNpZGUgdGhpcyBtaWdodCBtb3ZlIHVzLCBzbyBnZXQgcG9zc2libGUgbmV3IHBvc2l0aW9uIGFzIHdlbGxcclxuICAgICAgICAgICAgbGV0IGxlZnQgPSB1aS5wb3NpdGlvbi5sZWZ0ICsgbUxlZnQ7XHJcbiAgICAgICAgICAgIGxldCB0b3AgPSB1aS5wb3NpdGlvbi50b3AgKyBtVG9wO1xyXG4gICAgICAgICAgICBwLnggPSBNYXRoLnJvdW5kKGxlZnQgLyBjZWxsV2lkdGgpO1xyXG4gICAgICAgICAgICBwLnkgPSBNYXRoLnJvdW5kKHRvcCAvIGNlbGxIZWlnaHQpO1xyXG4gICAgICAgICAgICByZXNpemluZyA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIG5vZGUuX2V2ZW50ID0gZXZlbnQ7XHJcbiAgICAgICAgbm9kZS5fbGFzdFRyaWVkID0gcDsgLy8gc2V0IGFzIGxhc3QgdHJpZWQgKHdpbGwgbnVrZSBpZiB3ZSBnbyB0aGVyZSlcclxuICAgICAgICBsZXQgcmVjdCA9IHtcclxuICAgICAgICAgICAgeDogdWkucG9zaXRpb24ubGVmdCArIG1MZWZ0LFxyXG4gICAgICAgICAgICB5OiB1aS5wb3NpdGlvbi50b3AgKyBtVG9wLFxyXG4gICAgICAgICAgICB3OiAodWkuc2l6ZSA/IHVpLnNpemUud2lkdGggOiBub2RlLncgKiBjZWxsV2lkdGgpIC0gbUxlZnQgLSBtUmlnaHQsXHJcbiAgICAgICAgICAgIGg6ICh1aS5zaXplID8gdWkuc2l6ZS5oZWlnaHQgOiBub2RlLmggKiBjZWxsSGVpZ2h0KSAtIG1Ub3AgLSBtQm90dG9tXHJcbiAgICAgICAgfTtcclxuICAgICAgICBpZiAodGhpcy5lbmdpbmUubW92ZU5vZGVDaGVjayhub2RlLCBPYmplY3QuYXNzaWduKE9iamVjdC5hc3NpZ24oe30sIHApLCB7IGNlbGxXaWR0aCwgY2VsbEhlaWdodCwgcmVjdCwgcmVzaXppbmcgfSkpKSB7XHJcbiAgICAgICAgICAgIG5vZGUuX2xhc3RVaVBvc2l0aW9uID0gdWkucG9zaXRpb247XHJcbiAgICAgICAgICAgIHRoaXMuZW5naW5lLmNhY2hlUmVjdHMoY2VsbFdpZHRoLCBjZWxsSGVpZ2h0LCBtVG9wLCBtUmlnaHQsIG1Cb3R0b20sIG1MZWZ0KTtcclxuICAgICAgICAgICAgZGVsZXRlIG5vZGUuX3NraXBEb3duO1xyXG4gICAgICAgICAgICBpZiAocmVzaXppbmcgJiYgbm9kZS5zdWJHcmlkKSB7XHJcbiAgICAgICAgICAgICAgICBub2RlLnN1YkdyaWQub25QYXJlbnRSZXNpemUoKTtcclxuICAgICAgICAgICAgfSAvLyBAdHMtaWdub3JlXHJcbiAgICAgICAgICAgIHRoaXMuX2V4dHJhRHJhZ1JvdyA9IDA7IC8vIEB0cy1pZ25vcmVcclxuICAgICAgICAgICAgdGhpcy5fdXBkYXRlQ29udGFpbmVySGVpZ2h0KCk7XHJcbiAgICAgICAgICAgIGxldCB0YXJnZXQgPSBldmVudC50YXJnZXQ7IC8vIEB0cy1pZ25vcmVcclxuICAgICAgICAgICAgdGhpcy5fd3JpdGVQb3NBdHRyKHRhcmdldCwgbm9kZSk7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLl9nc0V2ZW50SGFuZGxlcltldmVudC50eXBlXSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fZ3NFdmVudEhhbmRsZXJbZXZlbnQudHlwZV0oZXZlbnQsIHRhcmdldCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvKiogQGludGVybmFsIGNhbGxlZCB3aGVuIGl0ZW0gbGVhdmluZyBvdXIgYXJlYSBieSBlaXRoZXIgY3Vyc29yIGRyb3BvdXQgZXZlbnRcclxuICAgICAqIG9yIHNoYXBlIGlzIG91dHNpZGUgb3VyIGJvdW5kYXJpZXMuIHJlbW92ZSBpdCBmcm9tIHVzLCBhbmQgbWFyayB0ZW1wb3JhcnkgaWYgdGhpcyB3YXNcclxuICAgICAqIG91ciBpdGVtIHRvIHN0YXJ0IHdpdGggZWxzZSByZXN0b3JlIHByZXYgbm9kZSB2YWx1ZXMgZnJvbSBwcmV2IGdyaWQgaXQgY2FtZSBmcm9tLlxyXG4gICAgICoqL1xyXG4gICAgX2xlYXZlKGVsLCBoZWxwZXIpIHtcclxuICAgICAgICBsZXQgbm9kZSA9IGVsLmdyaWRzdGFja05vZGU7XHJcbiAgICAgICAgaWYgKCFub2RlKVxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgZGQub2ZmKGVsLCAnZHJhZycpOyAvLyBubyBuZWVkIHRvIHRyYWNrIHdoaWxlIGJlaW5nIG91dHNpZGVcclxuICAgICAgICAvLyB0aGlzIGdldHMgY2FsbGVkIHdoZW4gY3Vyc29yIGxlYXZlcyBhbmQgc2hhcGUgaXMgb3V0c2lkZSwgc28gb25seSBkbyB0aGlzIG9uY2VcclxuICAgICAgICBpZiAobm9kZS5fdGVtcG9yYXJ5UmVtb3ZlZClcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIG5vZGUuX3RlbXBvcmFyeVJlbW92ZWQgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMuZW5naW5lLnJlbW92ZU5vZGUobm9kZSk7IC8vIHJlbW92ZSBwbGFjZWhvbGRlciBhcyB3ZWxsLCBvdGhlcndpc2UgaXQncyBhIHNpZ24gbm9kZSBpcyBub3QgaW4gb3VyIGxpc3QsIHdoaWNoIGlzIGEgYmlnZ2VyIGlzc3VlXHJcbiAgICAgICAgbm9kZS5lbCA9IG5vZGUuX2lzRXh0ZXJuYWwgJiYgaGVscGVyID8gaGVscGVyIDogZWw7IC8vIHBvaW50IGJhY2sgdG8gcmVhbCBpdGVtIGJlaW5nIGRyYWdnZWRcclxuICAgICAgICBpZiAodGhpcy5vcHRzLnJlbW92YWJsZSA9PT0gdHJ1ZSkgeyAvLyBib29sZWFuIHZzIGEgY2xhc3Mgc3RyaW5nXHJcbiAgICAgICAgICAgIC8vIGl0ZW0gbGVhdmluZyB1cyBhbmQgd2UgYXJlIHN1cHBvc2VkIHRvIHJlbW92ZSBvbiBsZWF2ZSAobm8gbmVlZCB0byBkcmFnIG9udG8gdHJhc2gpIG1hcmsgaXQgc29cclxuICAgICAgICAgICAgdGhpcy5faXRlbVJlbW92aW5nKGVsLCB0cnVlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gZmluYWxseSBpZiBpdGVtIG9yaWdpbmFsbHkgY2FtZSBmcm9tIGFub3RoZXIgZ3JpZCwgYnV0IGxlZnQgdXMsIHJlc3RvcmUgdGhpbmdzIGJhY2sgdG8gcHJldiBpbmZvXHJcbiAgICAgICAgaWYgKGVsLl9ncmlkc3RhY2tOb2RlT3JpZykge1xyXG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZygnbGVhdmUgZGVsZXRlIF9ncmlkc3RhY2tOb2RlT3JpZycpIC8vIFRFU1RcclxuICAgICAgICAgICAgZWwuZ3JpZHN0YWNrTm9kZSA9IGVsLl9ncmlkc3RhY2tOb2RlT3JpZztcclxuICAgICAgICAgICAgZGVsZXRlIGVsLl9ncmlkc3RhY2tOb2RlT3JpZztcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAobm9kZS5faXNFeHRlcm5hbCkge1xyXG4gICAgICAgICAgICAvLyBpdGVtIGNhbWUgZnJvbSBvdXRzaWRlIChsaWtlIGEgdG9vbGJhcikgc28gbnVrZSBhbnkgbm9kZSBpbmZvXHJcbiAgICAgICAgICAgIGRlbGV0ZSBub2RlLmVsO1xyXG4gICAgICAgICAgICBkZWxldGUgZWwuZ3JpZHN0YWNrTm9kZTtcclxuICAgICAgICAgICAgLy8gYW5kIHJlc3RvcmUgYWxsIG5vZGVzIGJhY2sgdG8gb3JpZ2luYWxcclxuICAgICAgICAgICAgdGhpcy5lbmdpbmUucmVzdG9yZUluaXRpYWwoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvLyBsZWdhY3kgbWV0aG9kIHJlbW92ZWRcclxuICAgIGNvbW1pdCgpIHsgdXRpbHNfMS5vYnNvbGV0ZSh0aGlzLCB0aGlzLmJhdGNoVXBkYXRlKGZhbHNlKSwgJ2NvbW1pdCcsICdiYXRjaFVwZGF0ZScsICc1LjInKTsgcmV0dXJuIHRoaXM7IH1cclxufVxyXG5leHBvcnRzLkdyaWRTdGFjayA9IEdyaWRTdGFjaztcclxuLyoqIHNjb3Bpbmcgc28gdXNlcnMgY2FuIGNhbGwgR3JpZFN0YWNrLlV0aWxzLnNvcnQoKSBmb3IgZXhhbXBsZSAqL1xyXG5HcmlkU3RhY2suVXRpbHMgPSB1dGlsc18xLlV0aWxzO1xyXG4vKiogc2NvcGluZyBzbyB1c2VycyBjYW4gY2FsbCBuZXcgR3JpZFN0YWNrLkVuZ2luZSgxMikgZm9yIGV4YW1wbGUgKi9cclxuR3JpZFN0YWNrLkVuZ2luZSA9IGdyaWRzdGFja19lbmdpbmVfMS5HcmlkU3RhY2tFbmdpbmU7XHJcbkdyaWRTdGFjay5HRFJldiA9ICc3LjMuMCc7XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWdyaWRzdGFjay5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcclxuLyoqXHJcbiAqIHR5cGVzLnRzIDcuMy4wXHJcbiAqIENvcHlyaWdodCAoYykgMjAyMSBBbGFpbiBEdW1lc255IC0gc2VlIEdyaWRTdGFjayByb290IGxpY2Vuc2VcclxuICovXHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcclxuZXhwb3J0cy5kcmFnSW5EZWZhdWx0T3B0aW9ucyA9IGV4cG9ydHMuZ3JpZERlZmF1bHRzID0gdm9pZCAwO1xyXG4vLyBkZWZhdWx0IHZhbHVlcyBmb3IgZ3JpZCBvcHRpb25zIC0gdXNlZCBkdXJpbmcgaW5pdCBhbmQgd2hlbiBzYXZpbmcgb3V0XHJcbmV4cG9ydHMuZ3JpZERlZmF1bHRzID0ge1xyXG4gICAgYWx3YXlzU2hvd1Jlc2l6ZUhhbmRsZTogJ21vYmlsZScsXHJcbiAgICBhbmltYXRlOiB0cnVlLFxyXG4gICAgYXV0bzogdHJ1ZSxcclxuICAgIGNlbGxIZWlnaHQ6ICdhdXRvJyxcclxuICAgIGNlbGxIZWlnaHRUaHJvdHRsZTogMTAwLFxyXG4gICAgY2VsbEhlaWdodFVuaXQ6ICdweCcsXHJcbiAgICBjb2x1bW46IDEyLFxyXG4gICAgZHJhZ2dhYmxlOiB7IGhhbmRsZTogJy5ncmlkLXN0YWNrLWl0ZW0tY29udGVudCcsIGFwcGVuZFRvOiAnYm9keScsIHNjcm9sbDogdHJ1ZSB9LFxyXG4gICAgaGFuZGxlOiAnLmdyaWQtc3RhY2staXRlbS1jb250ZW50JyxcclxuICAgIGl0ZW1DbGFzczogJ2dyaWQtc3RhY2staXRlbScsXHJcbiAgICBtYXJnaW46IDEwLFxyXG4gICAgbWFyZ2luVW5pdDogJ3B4JyxcclxuICAgIG1heFJvdzogMCxcclxuICAgIG1pblJvdzogMCxcclxuICAgIG9uZUNvbHVtblNpemU6IDc2OCxcclxuICAgIHBsYWNlaG9sZGVyQ2xhc3M6ICdncmlkLXN0YWNrLXBsYWNlaG9sZGVyJyxcclxuICAgIHBsYWNlaG9sZGVyVGV4dDogJycsXHJcbiAgICByZW1vdmFibGVPcHRpb25zOiB7IGFjY2VwdDogJy5ncmlkLXN0YWNrLWl0ZW0nIH0sXHJcbiAgICByZXNpemFibGU6IHsgaGFuZGxlczogJ3NlJyB9LFxyXG4gICAgcnRsOiAnYXV0bycsXHJcbn07XHJcbi8qKiBkZWZhdWx0IGRyYWdJbiBvcHRpb25zICovXHJcbmV4cG9ydHMuZHJhZ0luRGVmYXVsdE9wdGlvbnMgPSB7XHJcbiAgICBoYW5kbGU6ICcuZ3JpZC1zdGFjay1pdGVtLWNvbnRlbnQnLFxyXG4gICAgYXBwZW5kVG86ICdib2R5JyxcclxufTtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9dHlwZXMuanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbi8qKlxyXG4gKiB1dGlscy50cyA3LjMuMFxyXG4gKiBDb3B5cmlnaHQgKGMpIDIwMjEgQWxhaW4gRHVtZXNueSAtIHNlZSBHcmlkU3RhY2sgcm9vdCBsaWNlbnNlXHJcbiAqL1xyXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XHJcbmV4cG9ydHMuVXRpbHMgPSBleHBvcnRzLm9ic29sZXRlQXR0ciA9IGV4cG9ydHMub2Jzb2xldGVPcHRzRGVsID0gZXhwb3J0cy5vYnNvbGV0ZU9wdHMgPSBleHBvcnRzLm9ic29sZXRlID0gdm9pZCAwO1xyXG4vKiogY2hlY2tzIGZvciBvYnNvbGV0ZSBtZXRob2QgbmFtZXMgKi9cclxuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lXHJcbmZ1bmN0aW9uIG9ic29sZXRlKHNlbGYsIGYsIG9sZE5hbWUsIG5ld05hbWUsIHJldikge1xyXG4gICAgbGV0IHdyYXBwZXIgPSAoLi4uYXJncykgPT4ge1xyXG4gICAgICAgIGNvbnNvbGUud2FybignZ3JpZHN0YWNrLmpzOiBGdW5jdGlvbiBgJyArIG9sZE5hbWUgKyAnYCBpcyBkZXByZWNhdGVkIGluICcgKyByZXYgKyAnIGFuZCBoYXMgYmVlbiByZXBsYWNlZCAnICtcclxuICAgICAgICAgICAgJ3dpdGggYCcgKyBuZXdOYW1lICsgJ2AuIEl0IHdpbGwgYmUgKipyZW1vdmVkKiogaW4gYSBmdXR1cmUgcmVsZWFzZScpO1xyXG4gICAgICAgIHJldHVybiBmLmFwcGx5KHNlbGYsIGFyZ3MpO1xyXG4gICAgfTtcclxuICAgIHdyYXBwZXIucHJvdG90eXBlID0gZi5wcm90b3R5cGU7XHJcbiAgICByZXR1cm4gd3JhcHBlcjtcclxufVxyXG5leHBvcnRzLm9ic29sZXRlID0gb2Jzb2xldGU7XHJcbi8qKiBjaGVja3MgZm9yIG9ic29sZXRlIGdyaWQgb3B0aW9ucyAoY2FuIGJlIHVzZWQgZm9yIGFueSBmaWVsZHMsIGJ1dCBtc2cgaXMgYWJvdXQgb3B0aW9ucykgKi9cclxuZnVuY3Rpb24gb2Jzb2xldGVPcHRzKG9wdHMsIG9sZE5hbWUsIG5ld05hbWUsIHJldikge1xyXG4gICAgaWYgKG9wdHNbb2xkTmFtZV0gIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgIG9wdHNbbmV3TmFtZV0gPSBvcHRzW29sZE5hbWVdO1xyXG4gICAgICAgIGNvbnNvbGUud2FybignZ3JpZHN0YWNrLmpzOiBPcHRpb24gYCcgKyBvbGROYW1lICsgJ2AgaXMgZGVwcmVjYXRlZCBpbiAnICsgcmV2ICsgJyBhbmQgaGFzIGJlZW4gcmVwbGFjZWQgd2l0aCBgJyArXHJcbiAgICAgICAgICAgIG5ld05hbWUgKyAnYC4gSXQgd2lsbCBiZSAqKnJlbW92ZWQqKiBpbiBhIGZ1dHVyZSByZWxlYXNlJyk7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0cy5vYnNvbGV0ZU9wdHMgPSBvYnNvbGV0ZU9wdHM7XHJcbi8qKiBjaGVja3MgZm9yIG9ic29sZXRlIGdyaWQgb3B0aW9ucyB3aGljaCBhcmUgZ29uZSAqL1xyXG5mdW5jdGlvbiBvYnNvbGV0ZU9wdHNEZWwob3B0cywgb2xkTmFtZSwgcmV2LCBpbmZvKSB7XHJcbiAgICBpZiAob3B0c1tvbGROYW1lXSAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgY29uc29sZS53YXJuKCdncmlkc3RhY2suanM6IE9wdGlvbiBgJyArIG9sZE5hbWUgKyAnYCBpcyBkZXByZWNhdGVkIGluICcgKyByZXYgKyBpbmZvKTtcclxuICAgIH1cclxufVxyXG5leHBvcnRzLm9ic29sZXRlT3B0c0RlbCA9IG9ic29sZXRlT3B0c0RlbDtcclxuLyoqIGNoZWNrcyBmb3Igb2Jzb2xldGUgSnF1ZXJ5IGVsZW1lbnQgYXR0cmlidXRlcyAqL1xyXG5mdW5jdGlvbiBvYnNvbGV0ZUF0dHIoZWwsIG9sZE5hbWUsIG5ld05hbWUsIHJldikge1xyXG4gICAgbGV0IG9sZEF0dHIgPSBlbC5nZXRBdHRyaWJ1dGUob2xkTmFtZSk7XHJcbiAgICBpZiAob2xkQXR0ciAhPT0gbnVsbCkge1xyXG4gICAgICAgIGVsLnNldEF0dHJpYnV0ZShuZXdOYW1lLCBvbGRBdHRyKTtcclxuICAgICAgICBjb25zb2xlLndhcm4oJ2dyaWRzdGFjay5qczogYXR0cmlidXRlIGAnICsgb2xkTmFtZSArICdgPScgKyBvbGRBdHRyICsgJyBpcyBkZXByZWNhdGVkIG9uIHRoaXMgb2JqZWN0IGluICcgKyByZXYgKyAnIGFuZCBoYXMgYmVlbiByZXBsYWNlZCB3aXRoIGAnICtcclxuICAgICAgICAgICAgbmV3TmFtZSArICdgLiBJdCB3aWxsIGJlICoqcmVtb3ZlZCoqIGluIGEgZnV0dXJlIHJlbGVhc2UnKTtcclxuICAgIH1cclxufVxyXG5leHBvcnRzLm9ic29sZXRlQXR0ciA9IG9ic29sZXRlQXR0cjtcclxuLyoqXHJcbiAqIFV0aWxpdHkgbWV0aG9kc1xyXG4gKi9cclxuY2xhc3MgVXRpbHMge1xyXG4gICAgLyoqIGNvbnZlcnQgYSBwb3RlbnRpYWwgc2VsZWN0b3IgaW50byBhY3R1YWwgbGlzdCBvZiBodG1sIGVsZW1lbnRzICovXHJcbiAgICBzdGF0aWMgZ2V0RWxlbWVudHMoZWxzKSB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBlbHMgPT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICAgIGxldCBsaXN0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChlbHMpO1xyXG4gICAgICAgICAgICBpZiAoIWxpc3QubGVuZ3RoICYmIGVsc1swXSAhPT0gJy4nICYmIGVsc1swXSAhPT0gJyMnKSB7XHJcbiAgICAgICAgICAgICAgICBsaXN0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLicgKyBlbHMpO1xyXG4gICAgICAgICAgICAgICAgaWYgKCFsaXN0Lmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxpc3QgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcjJyArIGVscyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIEFycmF5LmZyb20obGlzdCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBbZWxzXTtcclxuICAgIH1cclxuICAgIC8qKiBjb252ZXJ0IGEgcG90ZW50aWFsIHNlbGVjdG9yIGludG8gYWN0dWFsIHNpbmdsZSBlbGVtZW50ICovXHJcbiAgICBzdGF0aWMgZ2V0RWxlbWVudChlbHMpIHtcclxuICAgICAgICBpZiAodHlwZW9mIGVscyA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgICAgICAgaWYgKCFlbHMubGVuZ3RoKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgICAgIGlmIChlbHNbMF0gPT09ICcjJykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGVscy5zdWJzdHJpbmcoMSkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChlbHNbMF0gPT09ICcuJyB8fCBlbHNbMF0gPT09ICdbJykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoZWxzKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvLyBpZiB3ZSBzdGFydCB3aXRoIGEgZGlnaXQsIGFzc3VtZSBpdCdzIGFuIGlkIChlcnJvciBjYWxsaW5nIHF1ZXJ5U2VsZWN0b3IoJyMxJykpIGFzIGNsYXNzIGFyZSBub3QgdmFsaWQgQ1NTXHJcbiAgICAgICAgICAgIGlmICghaXNOYU4oK2Vsc1swXSkpIHsgLy8gc3RhcnQgd2l0aCBkaWdpdFxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGVscyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8gZmluYWxseSB0cnkgc3RyaW5nLCB0aGVuIGlkIHRoZW4gY2xhc3NcclxuICAgICAgICAgICAgbGV0IGVsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihlbHMpO1xyXG4gICAgICAgICAgICBpZiAoIWVsKSB7XHJcbiAgICAgICAgICAgICAgICBlbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGVscyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKCFlbCkge1xyXG4gICAgICAgICAgICAgICAgZWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuJyArIGVscyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGVsO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZWxzO1xyXG4gICAgfVxyXG4gICAgLyoqIHJldHVybnMgdHJ1ZSBpZiBhIGFuZCBiIG92ZXJsYXAgKi9cclxuICAgIHN0YXRpYyBpc0ludGVyY2VwdGVkKGEsIGIpIHtcclxuICAgICAgICByZXR1cm4gIShhLnkgPj0gYi55ICsgYi5oIHx8IGEueSArIGEuaCA8PSBiLnkgfHwgYS54ICsgYS53IDw9IGIueCB8fCBhLnggPj0gYi54ICsgYi53KTtcclxuICAgIH1cclxuICAgIC8qKiByZXR1cm5zIHRydWUgaWYgYSBhbmQgYiB0b3VjaCBlZGdlcyBvciBjb3JuZXJzICovXHJcbiAgICBzdGF0aWMgaXNUb3VjaGluZyhhLCBiKSB7XHJcbiAgICAgICAgcmV0dXJuIFV0aWxzLmlzSW50ZXJjZXB0ZWQoYSwgeyB4OiBiLnggLSAwLjUsIHk6IGIueSAtIDAuNSwgdzogYi53ICsgMSwgaDogYi5oICsgMSB9KTtcclxuICAgIH1cclxuICAgIC8qKiByZXR1cm5zIHRoZSBhcmVhIGEgYW5kIGIgb3ZlcmxhcCAqL1xyXG4gICAgc3RhdGljIGFyZWFJbnRlcmNlcHQoYSwgYikge1xyXG4gICAgICAgIGxldCB4MCA9IChhLnggPiBiLngpID8gYS54IDogYi54O1xyXG4gICAgICAgIGxldCB4MSA9IChhLnggKyBhLncgPCBiLnggKyBiLncpID8gYS54ICsgYS53IDogYi54ICsgYi53O1xyXG4gICAgICAgIGlmICh4MSA8PSB4MClcclxuICAgICAgICAgICAgcmV0dXJuIDA7IC8vIG5vIG92ZXJsYXBcclxuICAgICAgICBsZXQgeTAgPSAoYS55ID4gYi55KSA/IGEueSA6IGIueTtcclxuICAgICAgICBsZXQgeTEgPSAoYS55ICsgYS5oIDwgYi55ICsgYi5oKSA/IGEueSArIGEuaCA6IGIueSArIGIuaDtcclxuICAgICAgICBpZiAoeTEgPD0geTApXHJcbiAgICAgICAgICAgIHJldHVybiAwOyAvLyBubyBvdmVybGFwXHJcbiAgICAgICAgcmV0dXJuICh4MSAtIHgwKSAqICh5MSAtIHkwKTtcclxuICAgIH1cclxuICAgIC8qKiByZXR1cm5zIHRoZSBhcmVhICovXHJcbiAgICBzdGF0aWMgYXJlYShhKSB7XHJcbiAgICAgICAgcmV0dXJuIGEudyAqIGEuaDtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogU29ydHMgYXJyYXkgb2Ygbm9kZXNcclxuICAgICAqIEBwYXJhbSBub2RlcyBhcnJheSB0byBzb3J0XHJcbiAgICAgKiBAcGFyYW0gZGlyIDEgZm9yIGFzYywgLTEgZm9yIGRlc2MgKG9wdGlvbmFsKVxyXG4gICAgICogQHBhcmFtIHdpZHRoIHdpZHRoIG9mIHRoZSBncmlkLiBJZiB1bmRlZmluZWQgdGhlIHdpZHRoIHdpbGwgYmUgY2FsY3VsYXRlZCBhdXRvbWF0aWNhbGx5IChvcHRpb25hbCkuXHJcbiAgICAgKiovXHJcbiAgICBzdGF0aWMgc29ydChub2RlcywgZGlyLCBjb2x1bW4pIHtcclxuICAgICAgICBjb2x1bW4gPSBjb2x1bW4gfHwgbm9kZXMucmVkdWNlKChjb2wsIG4pID0+IE1hdGgubWF4KG4ueCArIG4udywgY29sKSwgMCkgfHwgMTI7XHJcbiAgICAgICAgaWYgKGRpciA9PT0gLTEpXHJcbiAgICAgICAgICAgIHJldHVybiBub2Rlcy5zb3J0KChhLCBiKSA9PiAoYi54ICsgYi55ICogY29sdW1uKSAtIChhLnggKyBhLnkgKiBjb2x1bW4pKTtcclxuICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHJldHVybiBub2Rlcy5zb3J0KChiLCBhKSA9PiAoYi54ICsgYi55ICogY29sdW1uKSAtIChhLnggKyBhLnkgKiBjb2x1bW4pKTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogY3JlYXRlcyBhIHN0eWxlIHNoZWV0IHdpdGggc3R5bGUgaWQgdW5kZXIgZ2l2ZW4gcGFyZW50XHJcbiAgICAgKiBAcGFyYW0gaWQgd2lsbCBzZXQgdGhlICdncy1zdHlsZS1pZCcgYXR0cmlidXRlIHRvIHRoYXQgaWRcclxuICAgICAqIEBwYXJhbSBwYXJlbnQgdG8gaW5zZXJ0IHRoZSBzdHlsZXNoZWV0IGFzIGZpcnN0IGNoaWxkLFxyXG4gICAgICogaWYgbm9uZSBzdXBwbGllZCBpdCB3aWxsIGJlIGFwcGVuZGVkIHRvIHRoZSBkb2N1bWVudCBoZWFkIGluc3RlYWQuXHJcbiAgICAgKi9cclxuICAgIHN0YXRpYyBjcmVhdGVTdHlsZXNoZWV0KGlkLCBwYXJlbnQsIG9wdGlvbnMpIHtcclxuICAgICAgICBsZXQgc3R5bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpO1xyXG4gICAgICAgIGNvbnN0IG5vbmNlID0gb3B0aW9ucyA9PT0gbnVsbCB8fCBvcHRpb25zID09PSB2b2lkIDAgPyB2b2lkIDAgOiBvcHRpb25zLm5vbmNlO1xyXG4gICAgICAgIGlmIChub25jZSlcclxuICAgICAgICAgICAgc3R5bGUubm9uY2UgPSBub25jZTtcclxuICAgICAgICBzdHlsZS5zZXRBdHRyaWJ1dGUoJ3R5cGUnLCAndGV4dC9jc3MnKTtcclxuICAgICAgICBzdHlsZS5zZXRBdHRyaWJ1dGUoJ2dzLXN0eWxlLWlkJywgaWQpO1xyXG4gICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXhwbGljaXQtYW55XHJcbiAgICAgICAgaWYgKHN0eWxlLnN0eWxlU2hlZXQpIHsgLy8gVE9ETzogb25seSBDU1NJbXBvcnRSdWxlIGhhdmUgdGhhdCBhbmQgZGlmZmVyZW50IGJlYXN0ID8/XHJcbiAgICAgICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXhwbGljaXQtYW55XHJcbiAgICAgICAgICAgIHN0eWxlLnN0eWxlU2hlZXQuY3NzVGV4dCA9ICcnO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgc3R5bGUuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoJycpKTsgLy8gV2ViS2l0IGhhY2tcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCFwYXJlbnQpIHtcclxuICAgICAgICAgICAgLy8gZGVmYXVsdCB0byBoZWFkXHJcbiAgICAgICAgICAgIHBhcmVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdoZWFkJylbMF07XHJcbiAgICAgICAgICAgIHBhcmVudC5hcHBlbmRDaGlsZChzdHlsZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBwYXJlbnQuaW5zZXJ0QmVmb3JlKHN0eWxlLCBwYXJlbnQuZmlyc3RDaGlsZCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBzdHlsZS5zaGVldDtcclxuICAgIH1cclxuICAgIC8qKiByZW1vdmVkIHRoZSBnaXZlbiBzdHlsZXNoZWV0IGlkICovXHJcbiAgICBzdGF0aWMgcmVtb3ZlU3R5bGVzaGVldChpZCkge1xyXG4gICAgICAgIGxldCBlbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ1NUWUxFW2dzLXN0eWxlLWlkPScgKyBpZCArICddJyk7XHJcbiAgICAgICAgaWYgKGVsICYmIGVsLnBhcmVudE5vZGUpXHJcbiAgICAgICAgICAgIGVsLnJlbW92ZSgpO1xyXG4gICAgfVxyXG4gICAgLyoqIGluc2VydHMgYSBDU1MgcnVsZSAqL1xyXG4gICAgc3RhdGljIGFkZENTU1J1bGUoc2hlZXQsIHNlbGVjdG9yLCBydWxlcykge1xyXG4gICAgICAgIGlmICh0eXBlb2Ygc2hlZXQuYWRkUnVsZSA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgICAgICBzaGVldC5hZGRSdWxlKHNlbGVjdG9yLCBydWxlcyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKHR5cGVvZiBzaGVldC5pbnNlcnRSdWxlID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgICAgIHNoZWV0Lmluc2VydFJ1bGUoYCR7c2VsZWN0b3J9eyR7cnVsZXN9fWApO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXhwbGljaXQtYW55XHJcbiAgICBzdGF0aWMgdG9Cb29sKHYpIHtcclxuICAgICAgICBpZiAodHlwZW9mIHYgPT09ICdib29sZWFuJykge1xyXG4gICAgICAgICAgICByZXR1cm4gdjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHR5cGVvZiB2ID09PSAnc3RyaW5nJykge1xyXG4gICAgICAgICAgICB2ID0gdi50b0xvd2VyQ2FzZSgpO1xyXG4gICAgICAgICAgICByZXR1cm4gISh2ID09PSAnJyB8fCB2ID09PSAnbm8nIHx8IHYgPT09ICdmYWxzZScgfHwgdiA9PT0gJzAnKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIEJvb2xlYW4odik7XHJcbiAgICB9XHJcbiAgICBzdGF0aWMgdG9OdW1iZXIodmFsdWUpIHtcclxuICAgICAgICByZXR1cm4gKHZhbHVlID09PSBudWxsIHx8IHZhbHVlLmxlbmd0aCA9PT0gMCkgPyB1bmRlZmluZWQgOiBOdW1iZXIodmFsdWUpO1xyXG4gICAgfVxyXG4gICAgc3RhdGljIHBhcnNlSGVpZ2h0KHZhbCkge1xyXG4gICAgICAgIGxldCBoO1xyXG4gICAgICAgIGxldCB1bml0ID0gJ3B4JztcclxuICAgICAgICBpZiAodHlwZW9mIHZhbCA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgICAgICAgbGV0IG1hdGNoID0gdmFsLm1hdGNoKC9eKC1bMC05XStcXC5bMC05XSt8WzAtOV0qXFwuWzAtOV0rfC1bMC05XSt8WzAtOV0rKShweHxlbXxyZW18dmh8dnd8JSk/JC8pO1xyXG4gICAgICAgICAgICBpZiAoIW1hdGNoKSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgaGVpZ2h0Jyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdW5pdCA9IG1hdGNoWzJdIHx8ICdweCc7XHJcbiAgICAgICAgICAgIGggPSBwYXJzZUZsb2F0KG1hdGNoWzFdKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGggPSB2YWw7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB7IGgsIHVuaXQgfTtcclxuICAgIH1cclxuICAgIC8qKiBjb3BpZXMgdW5zZXQgZmllbGRzIGluIHRhcmdldCB0byB1c2UgdGhlIGdpdmVuIGRlZmF1bHQgc291cmNlcyB2YWx1ZXMgKi9cclxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZVxyXG4gICAgc3RhdGljIGRlZmF1bHRzKHRhcmdldCwgLi4uc291cmNlcykge1xyXG4gICAgICAgIHNvdXJjZXMuZm9yRWFjaChzb3VyY2UgPT4ge1xyXG4gICAgICAgICAgICBmb3IgKGNvbnN0IGtleSBpbiBzb3VyY2UpIHtcclxuICAgICAgICAgICAgICAgIGlmICghc291cmNlLmhhc093blByb3BlcnR5KGtleSkpXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgaWYgKHRhcmdldFtrZXldID09PSBudWxsIHx8IHRhcmdldFtrZXldID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICB0YXJnZXRba2V5XSA9IHNvdXJjZVtrZXldO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSBpZiAodHlwZW9mIHNvdXJjZVtrZXldID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgdGFyZ2V0W2tleV0gPT09ICdvYmplY3QnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gcHJvcGVydHkgaXMgYW4gb2JqZWN0LCByZWN1cnNpdmVseSBhZGQgaXQncyBmaWVsZCBvdmVyLi4uICMxMzczXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kZWZhdWx0cyh0YXJnZXRba2V5XSwgc291cmNlW2tleV0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIHRhcmdldDtcclxuICAgIH1cclxuICAgIC8qKiBnaXZlbiAyIG9iamVjdHMgcmV0dXJuIHRydWUgaWYgdGhleSBoYXZlIHRoZSBzYW1lIHZhbHVlcy4gQ2hlY2tzIGZvciBPYmplY3Qge30gaGF2aW5nIHNhbWUgZmllbGRzIGFuZCB2YWx1ZXMgKGp1c3QgMSBsZXZlbCBkb3duKSAqL1xyXG4gICAgc3RhdGljIHNhbWUoYSwgYikge1xyXG4gICAgICAgIGlmICh0eXBlb2YgYSAhPT0gJ29iamVjdCcpXHJcbiAgICAgICAgICAgIHJldHVybiBhID09IGI7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBhICE9PSB0eXBlb2YgYilcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIC8vIGVsc2Ugd2UgaGF2ZSBvYmplY3QsIGNoZWNrIGp1c3QgMSBsZXZlbCBkZWVwIGZvciBiZWluZyBzYW1lIHRoaW5ncy4uLlxyXG4gICAgICAgIGlmIChPYmplY3Qua2V5cyhhKS5sZW5ndGggIT09IE9iamVjdC5rZXlzKGIpLmxlbmd0aClcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIGZvciAoY29uc3Qga2V5IGluIGEpIHtcclxuICAgICAgICAgICAgaWYgKGFba2V5XSAhPT0gYltrZXldKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuICAgIC8qKiBjb3BpZXMgb3ZlciBiIHNpemUgJiBwb3NpdGlvbiAoR3JpZFN0YWNrUG9zaXRpb24pLCBhbmQgb3B0aW9uYWxseSBtaW4vbWF4IGFzIHdlbGwgKi9cclxuICAgIHN0YXRpYyBjb3B5UG9zKGEsIGIsIGRvTWluTWF4ID0gZmFsc2UpIHtcclxuICAgICAgICBhLnggPSBiLng7XHJcbiAgICAgICAgYS55ID0gYi55O1xyXG4gICAgICAgIGEudyA9IGIudztcclxuICAgICAgICBhLmggPSBiLmg7XHJcbiAgICAgICAgaWYgKGRvTWluTWF4KSB7XHJcbiAgICAgICAgICAgIGlmIChiLm1pblcpXHJcbiAgICAgICAgICAgICAgICBhLm1pblcgPSBiLm1pblc7XHJcbiAgICAgICAgICAgIGlmIChiLm1pbkgpXHJcbiAgICAgICAgICAgICAgICBhLm1pbkggPSBiLm1pbkg7XHJcbiAgICAgICAgICAgIGlmIChiLm1heFcpXHJcbiAgICAgICAgICAgICAgICBhLm1heFcgPSBiLm1heFc7XHJcbiAgICAgICAgICAgIGlmIChiLm1heEgpXHJcbiAgICAgICAgICAgICAgICBhLm1heEggPSBiLm1heEg7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBhO1xyXG4gICAgfVxyXG4gICAgLyoqIHRydWUgaWYgYSBhbmQgYiBoYXMgc2FtZSBzaXplICYgcG9zaXRpb24gKi9cclxuICAgIHN0YXRpYyBzYW1lUG9zKGEsIGIpIHtcclxuICAgICAgICByZXR1cm4gYSAmJiBiICYmIGEueCA9PT0gYi54ICYmIGEueSA9PT0gYi55ICYmIGEudyA9PT0gYi53ICYmIGEuaCA9PT0gYi5oO1xyXG4gICAgfVxyXG4gICAgLyoqIHJlbW92ZXMgZmllbGQgZnJvbSB0aGUgZmlyc3Qgb2JqZWN0IGlmIHNhbWUgYXMgdGhlIHNlY29uZCBvYmplY3RzIChsaWtlIGRpZmZpbmcpIGFuZCBpbnRlcm5hbCAnXycgZm9yIHNhdmluZyAqL1xyXG4gICAgc3RhdGljIHJlbW92ZUludGVybmFsQW5kU2FtZShhLCBiKSB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBhICE9PSAnb2JqZWN0JyB8fCB0eXBlb2YgYiAhPT0gJ29iamVjdCcpXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICBmb3IgKGxldCBrZXkgaW4gYSkge1xyXG4gICAgICAgICAgICBsZXQgdmFsID0gYVtrZXldO1xyXG4gICAgICAgICAgICBpZiAoa2V5WzBdID09PSAnXycgfHwgdmFsID09PSBiW2tleV0pIHtcclxuICAgICAgICAgICAgICAgIGRlbGV0ZSBhW2tleV07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAodmFsICYmIHR5cGVvZiB2YWwgPT09ICdvYmplY3QnICYmIGJba2V5XSAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpIGluIHZhbCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh2YWxbaV0gPT09IGJba2V5XVtpXSB8fCBpWzBdID09PSAnXycpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVsZXRlIHZhbFtpXTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoIU9iamVjdC5rZXlzKHZhbCkubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIGFba2V5XTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8qKiByZW1vdmVzIGludGVybmFsIGZpZWxkcyAnXycgYW5kIGRlZmF1bHQgdmFsdWVzIGZvciBzYXZpbmcgKi9cclxuICAgIHN0YXRpYyByZW1vdmVJbnRlcm5hbEZvclNhdmUobiwgcmVtb3ZlRWwgPSB0cnVlKSB7XHJcbiAgICAgICAgZm9yIChsZXQga2V5IGluIG4pIHtcclxuICAgICAgICAgICAgaWYgKGtleVswXSA9PT0gJ18nIHx8IG5ba2V5XSA9PT0gbnVsbCB8fCBuW2tleV0gPT09IHVuZGVmaW5lZClcclxuICAgICAgICAgICAgICAgIGRlbGV0ZSBuW2tleV07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGRlbGV0ZSBuLmdyaWQ7XHJcbiAgICAgICAgaWYgKHJlbW92ZUVsKVxyXG4gICAgICAgICAgICBkZWxldGUgbi5lbDtcclxuICAgICAgICAvLyBkZWxldGUgZGVmYXVsdCB2YWx1ZXMgKHdpbGwgYmUgcmUtY3JlYXRlZCBvbiByZWFkKVxyXG4gICAgICAgIGlmICghbi5hdXRvUG9zaXRpb24pXHJcbiAgICAgICAgICAgIGRlbGV0ZSBuLmF1dG9Qb3NpdGlvbjtcclxuICAgICAgICBpZiAoIW4ubm9SZXNpemUpXHJcbiAgICAgICAgICAgIGRlbGV0ZSBuLm5vUmVzaXplO1xyXG4gICAgICAgIGlmICghbi5ub01vdmUpXHJcbiAgICAgICAgICAgIGRlbGV0ZSBuLm5vTW92ZTtcclxuICAgICAgICBpZiAoIW4ubG9ja2VkKVxyXG4gICAgICAgICAgICBkZWxldGUgbi5sb2NrZWQ7XHJcbiAgICAgICAgaWYgKG4udyA9PT0gMSB8fCBuLncgPT09IG4ubWluVylcclxuICAgICAgICAgICAgZGVsZXRlIG4udztcclxuICAgICAgICBpZiAobi5oID09PSAxIHx8IG4uaCA9PT0gbi5taW5IKVxyXG4gICAgICAgICAgICBkZWxldGUgbi5oO1xyXG4gICAgfVxyXG4gICAgLyoqIHJldHVybiB0aGUgY2xvc2VzdCBwYXJlbnQgKG9yIGl0c2VsZikgbWF0Y2hpbmcgdGhlIGdpdmVuIGNsYXNzICovXHJcbiAgICBzdGF0aWMgY2xvc2VzdFVwQnlDbGFzcyhlbCwgbmFtZSkge1xyXG4gICAgICAgIHdoaWxlIChlbCkge1xyXG4gICAgICAgICAgICBpZiAoZWwuY2xhc3NMaXN0LmNvbnRhaW5zKG5hbWUpKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGVsO1xyXG4gICAgICAgICAgICBlbCA9IGVsLnBhcmVudEVsZW1lbnQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG4gICAgLyoqIGRlbGF5IGNhbGxpbmcgdGhlIGdpdmVuIGZ1bmN0aW9uIGZvciBnaXZlbiBkZWxheSwgcHJldmVudGluZyBuZXcgY2FsbHMgZnJvbSBoYXBwZW5pbmcgd2hpbGUgd2FpdGluZyAqL1xyXG4gICAgc3RhdGljIHRocm90dGxlKGZ1bmMsIGRlbGF5KSB7XHJcbiAgICAgICAgbGV0IGlzV2FpdGluZyA9IGZhbHNlO1xyXG4gICAgICAgIHJldHVybiAoLi4uYXJncykgPT4ge1xyXG4gICAgICAgICAgICBpZiAoIWlzV2FpdGluZykge1xyXG4gICAgICAgICAgICAgICAgaXNXYWl0aW5nID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4geyBmdW5jKC4uLmFyZ3MpOyBpc1dhaXRpbmcgPSBmYWxzZTsgfSwgZGVsYXkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuICAgIHN0YXRpYyByZW1vdmVQb3NpdGlvbmluZ1N0eWxlcyhlbCkge1xyXG4gICAgICAgIGxldCBzdHlsZSA9IGVsLnN0eWxlO1xyXG4gICAgICAgIGlmIChzdHlsZS5wb3NpdGlvbikge1xyXG4gICAgICAgICAgICBzdHlsZS5yZW1vdmVQcm9wZXJ0eSgncG9zaXRpb24nKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHN0eWxlLmxlZnQpIHtcclxuICAgICAgICAgICAgc3R5bGUucmVtb3ZlUHJvcGVydHkoJ2xlZnQnKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHN0eWxlLnRvcCkge1xyXG4gICAgICAgICAgICBzdHlsZS5yZW1vdmVQcm9wZXJ0eSgndG9wJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChzdHlsZS53aWR0aCkge1xyXG4gICAgICAgICAgICBzdHlsZS5yZW1vdmVQcm9wZXJ0eSgnd2lkdGgnKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHN0eWxlLmhlaWdodCkge1xyXG4gICAgICAgICAgICBzdHlsZS5yZW1vdmVQcm9wZXJ0eSgnaGVpZ2h0Jyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgLyoqIEBpbnRlcm5hbCByZXR1cm5zIHRoZSBwYXNzZWQgZWxlbWVudCBpZiBzY3JvbGxhYmxlLCBlbHNlIHRoZSBjbG9zZXN0IHBhcmVudCB0aGF0IHdpbGwsIHVwIHRvIHRoZSBlbnRpcmUgZG9jdW1lbnQgc2Nyb2xsaW5nIGVsZW1lbnQgKi9cclxuICAgIHN0YXRpYyBnZXRTY3JvbGxFbGVtZW50KGVsKSB7XHJcbiAgICAgICAgaWYgKCFlbClcclxuICAgICAgICAgICAgcmV0dXJuIGRvY3VtZW50LnNjcm9sbGluZ0VsZW1lbnQgfHwgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50OyAvLyBJRSBzdXBwb3J0XHJcbiAgICAgICAgY29uc3Qgc3R5bGUgPSBnZXRDb21wdXRlZFN0eWxlKGVsKTtcclxuICAgICAgICBjb25zdCBvdmVyZmxvd1JlZ2V4ID0gLyhhdXRvfHNjcm9sbCkvO1xyXG4gICAgICAgIGlmIChvdmVyZmxvd1JlZ2V4LnRlc3Qoc3R5bGUub3ZlcmZsb3cgKyBzdHlsZS5vdmVyZmxvd1kpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBlbDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldFNjcm9sbEVsZW1lbnQoZWwucGFyZW50RWxlbWVudCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgLyoqIEBpbnRlcm5hbCAqL1xyXG4gICAgc3RhdGljIHVwZGF0ZVNjcm9sbFBvc2l0aW9uKGVsLCBwb3NpdGlvbiwgZGlzdGFuY2UpIHtcclxuICAgICAgICAvLyBpcyB3aWRnZXQgaW4gdmlldz9cclxuICAgICAgICBsZXQgcmVjdCA9IGVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xyXG4gICAgICAgIGxldCBpbm5lckhlaWdodE9yQ2xpZW50SGVpZ2h0ID0gKHdpbmRvdy5pbm5lckhlaWdodCB8fCBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50SGVpZ2h0KTtcclxuICAgICAgICBpZiAocmVjdC50b3AgPCAwIHx8XHJcbiAgICAgICAgICAgIHJlY3QuYm90dG9tID4gaW5uZXJIZWlnaHRPckNsaWVudEhlaWdodCkge1xyXG4gICAgICAgICAgICAvLyBzZXQgc2Nyb2xsVG9wIG9mIGZpcnN0IHBhcmVudCB0aGF0IHNjcm9sbHNcclxuICAgICAgICAgICAgLy8gaWYgcGFyZW50IGlzIGxhcmdlciB0aGFuIGVsLCBzZXQgYXMgbG93IGFzIHBvc3NpYmxlXHJcbiAgICAgICAgICAgIC8vIHRvIGdldCBlbnRpcmUgd2lkZ2V0IG9uIHNjcmVlblxyXG4gICAgICAgICAgICBsZXQgb2Zmc2V0RGlmZkRvd24gPSByZWN0LmJvdHRvbSAtIGlubmVySGVpZ2h0T3JDbGllbnRIZWlnaHQ7XHJcbiAgICAgICAgICAgIGxldCBvZmZzZXREaWZmVXAgPSByZWN0LnRvcDtcclxuICAgICAgICAgICAgbGV0IHNjcm9sbEVsID0gdGhpcy5nZXRTY3JvbGxFbGVtZW50KGVsKTtcclxuICAgICAgICAgICAgaWYgKHNjcm9sbEVsICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgcHJldlNjcm9sbCA9IHNjcm9sbEVsLnNjcm9sbFRvcDtcclxuICAgICAgICAgICAgICAgIGlmIChyZWN0LnRvcCA8IDAgJiYgZGlzdGFuY2UgPCAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gbW92aW5nIHVwXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVsLm9mZnNldEhlaWdodCA+IGlubmVySGVpZ2h0T3JDbGllbnRIZWlnaHQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2Nyb2xsRWwuc2Nyb2xsVG9wICs9IGRpc3RhbmNlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2Nyb2xsRWwuc2Nyb2xsVG9wICs9IE1hdGguYWJzKG9mZnNldERpZmZVcCkgPiBNYXRoLmFicyhkaXN0YW5jZSkgPyBkaXN0YW5jZSA6IG9mZnNldERpZmZVcDtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIGlmIChkaXN0YW5jZSA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBtb3ZpbmcgZG93blxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChlbC5vZmZzZXRIZWlnaHQgPiBpbm5lckhlaWdodE9yQ2xpZW50SGVpZ2h0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNjcm9sbEVsLnNjcm9sbFRvcCArPSBkaXN0YW5jZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNjcm9sbEVsLnNjcm9sbFRvcCArPSBvZmZzZXREaWZmRG93biA+IGRpc3RhbmNlID8gZGlzdGFuY2UgOiBvZmZzZXREaWZmRG93bjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAvLyBtb3ZlIHdpZGdldCB5IGJ5IGFtb3VudCBzY3JvbGxlZFxyXG4gICAgICAgICAgICAgICAgcG9zaXRpb24udG9wICs9IHNjcm9sbEVsLnNjcm9sbFRvcCAtIHByZXZTY3JvbGw7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIEBpbnRlcm5hbCBGdW5jdGlvbiB1c2VkIHRvIHNjcm9sbCB0aGUgcGFnZS5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0gZXZlbnQgYE1vdXNlRXZlbnRgIHRoYXQgdHJpZ2dlcnMgdGhlIHJlc2l6ZVxyXG4gICAgICogQHBhcmFtIGVsIGBIVE1MRWxlbWVudGAgdGhhdCdzIGJlaW5nIHJlc2l6ZWRcclxuICAgICAqIEBwYXJhbSBkaXN0YW5jZSBEaXN0YW5jZSBmcm9tIHRoZSBWIGVkZ2VzIHRvIHN0YXJ0IHNjcm9sbGluZ1xyXG4gICAgICovXHJcbiAgICBzdGF0aWMgdXBkYXRlU2Nyb2xsUmVzaXplKGV2ZW50LCBlbCwgZGlzdGFuY2UpIHtcclxuICAgICAgICBjb25zdCBzY3JvbGxFbCA9IHRoaXMuZ2V0U2Nyb2xsRWxlbWVudChlbCk7XHJcbiAgICAgICAgY29uc3QgaGVpZ2h0ID0gc2Nyb2xsRWwuY2xpZW50SGVpZ2h0O1xyXG4gICAgICAgIC8vICMxNzI3IGV2ZW50LmNsaWVudFkgaXMgcmVsYXRpdmUgdG8gdmlld3BvcnQsIHNvIG11c3QgY29tcGFyZSB0aGlzIGFnYWluc3QgcG9zaXRpb24gb2Ygc2Nyb2xsRWwgZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkudG9wXHJcbiAgICAgICAgLy8gIzE3NDUgU3BlY2lhbCBzaXR1YXRpb24gaWYgc2Nyb2xsRWwgaXMgZG9jdW1lbnQgJ2h0bWwnOiBoZXJlIGJyb3dzZXIgc3BlYyBzdGF0ZXMgdGhhdFxyXG4gICAgICAgIC8vIGNsaWVudEhlaWdodCBpcyBoZWlnaHQgb2Ygdmlld3BvcnQsIGJ1dCBnZXRCb3VuZGluZ0NsaWVudFJlY3QoKSBpcyByZWN0YW5nbGUgb2YgaHRtbCBlbGVtZW50O1xyXG4gICAgICAgIC8vIHRoaXMgZGlzY3JlcGFuY3kgYXJpc2VzIGJlY2F1c2UgaW4gcmVhbGl0eSBzY3JvbGxiYXIgaXMgYXR0YWNoZWQgdG8gdmlld3BvcnQsIG5vdCBodG1sIGVsZW1lbnQgaXRzZWxmLlxyXG4gICAgICAgIGNvbnN0IG9mZnNldFRvcCA9IChzY3JvbGxFbCA9PT0gdGhpcy5nZXRTY3JvbGxFbGVtZW50KCkpID8gMCA6IHNjcm9sbEVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLnRvcDtcclxuICAgICAgICBjb25zdCBwb2ludGVyUG9zWSA9IGV2ZW50LmNsaWVudFkgLSBvZmZzZXRUb3A7XHJcbiAgICAgICAgY29uc3QgdG9wID0gcG9pbnRlclBvc1kgPCBkaXN0YW5jZTtcclxuICAgICAgICBjb25zdCBib3R0b20gPSBwb2ludGVyUG9zWSA+IGhlaWdodCAtIGRpc3RhbmNlO1xyXG4gICAgICAgIGlmICh0b3ApIHtcclxuICAgICAgICAgICAgLy8gVGhpcyBhbHNvIGNhbiBiZSBkb25lIHdpdGggYSB0aW1lb3V0IHRvIGtlZXAgc2Nyb2xsaW5nIHdoaWxlIHRoZSBtb3VzZSBpc1xyXG4gICAgICAgICAgICAvLyBpbiB0aGUgc2Nyb2xsaW5nIHpvbmUuICh3aWxsIGhhdmUgc21vb3RoZXIgYmVoYXZpb3IpXHJcbiAgICAgICAgICAgIHNjcm9sbEVsLnNjcm9sbEJ5KHsgYmVoYXZpb3I6ICdzbW9vdGgnLCB0b3A6IHBvaW50ZXJQb3NZIC0gZGlzdGFuY2UgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKGJvdHRvbSkge1xyXG4gICAgICAgICAgICBzY3JvbGxFbC5zY3JvbGxCeSh7IGJlaGF2aW9yOiAnc21vb3RoJywgdG9wOiBkaXN0YW5jZSAtIChoZWlnaHQgLSBwb2ludGVyUG9zWSkgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgLyoqIHNpbmdsZSBsZXZlbCBjbG9uZSwgcmV0dXJuaW5nIGEgbmV3IG9iamVjdCB3aXRoIHNhbWUgdG9wIGZpZWxkcy4gVGhpcyB3aWxsIHNoYXJlIHN1YiBvYmplY3RzIGFuZCBhcnJheXMgKi9cclxuICAgIHN0YXRpYyBjbG9uZShvYmopIHtcclxuICAgICAgICBpZiAob2JqID09PSBudWxsIHx8IG9iaiA9PT0gdW5kZWZpbmVkIHx8IHR5cGVvZiAob2JqKSAhPT0gJ29iamVjdCcpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG9iajtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gcmV0dXJuIE9iamVjdC5hc3NpZ24oe30sIG9iaik7XHJcbiAgICAgICAgaWYgKG9iaiBpbnN0YW5jZW9mIEFycmF5KSB7XHJcbiAgICAgICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXhwbGljaXQtYW55XHJcbiAgICAgICAgICAgIHJldHVybiBbLi4ub2JqXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIE9iamVjdC5hc3NpZ24oe30sIG9iaik7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIFJlY3Vyc2l2ZSBjbG9uZSB2ZXJzaW9uIHRoYXQgcmV0dXJucyBhIGZ1bGwgY29weSwgY2hlY2tpbmcgZm9yIG5lc3RlZCBvYmplY3RzIGFuZCBhcnJheXMgT05MWS5cclxuICAgICAqIE5vdGU6IHRoaXMgd2lsbCB1c2UgYXMtaXMgYW55IGtleSBzdGFydGluZyB3aXRoIGRvdWJsZSBfXyAoYW5kIG5vdCBjb3B5IGluc2lkZSkgc29tZSBsaWIgaGF2ZSBjaXJjdWxhciBkZXBlbmRlbmNpZXMuXHJcbiAgICAgKi9cclxuICAgIHN0YXRpYyBjbG9uZURlZXAob2JqKSB7XHJcbiAgICAgICAgLy8gbGlzdCBvZiBmaWVsZHMgd2Ugd2lsbCBza2lwIGR1cmluZyBjbG9uZURlZXAgKG5lc3RlZCBvYmplY3RzLCBvdGhlciBpbnRlcm5hbClcclxuICAgICAgICBjb25zdCBza2lwRmllbGRzID0gWydwYXJlbnRHcmlkJywgJ2VsJywgJ2dyaWQnLCAnc3ViR3JpZCcsICdlbmdpbmUnXTtcclxuICAgICAgICAvLyByZXR1cm4gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShvYmopKTsgLy8gZG9lc24ndCB3b3JrIHdpdGggZGF0ZSBmb3JtYXQgP1xyXG4gICAgICAgIGNvbnN0IHJldCA9IFV0aWxzLmNsb25lKG9iaik7XHJcbiAgICAgICAgZm9yIChjb25zdCBrZXkgaW4gcmV0KSB7XHJcbiAgICAgICAgICAgIC8vIE5PVEU6IHdlIGRvbid0IHN1cHBvcnQgZnVuY3Rpb24vY2lyY3VsYXIgZGVwZW5kZW5jaWVzIHNvIHNraXAgdGhvc2UgcHJvcGVydGllcyBmb3Igbm93Li4uXHJcbiAgICAgICAgICAgIGlmIChyZXQuaGFzT3duUHJvcGVydHkoa2V5KSAmJiB0eXBlb2YgKHJldFtrZXldKSA9PT0gJ29iamVjdCcgJiYga2V5LnN1YnN0cmluZygwLCAyKSAhPT0gJ19fJyAmJiAhc2tpcEZpZWxkcy5maW5kKGsgPT4gayA9PT0ga2V5KSkge1xyXG4gICAgICAgICAgICAgICAgcmV0W2tleV0gPSBVdGlscy5jbG9uZURlZXAob2JqW2tleV0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByZXQ7XHJcbiAgICB9XHJcbiAgICAvKiogZGVlcCBjbG9uZSB0aGUgZ2l2ZW4gSFRNTCBub2RlLCByZW1vdmluZyB0ZWggdW5pcXVlIGlkIGZpZWxkICovXHJcbiAgICBzdGF0aWMgY2xvbmVOb2RlKGVsKSB7XHJcbiAgICAgICAgY29uc3Qgbm9kZSA9IGVsLmNsb25lTm9kZSh0cnVlKTtcclxuICAgICAgICBub2RlLnJlbW92ZUF0dHJpYnV0ZSgnaWQnKTtcclxuICAgICAgICByZXR1cm4gbm9kZTtcclxuICAgIH1cclxuICAgIHN0YXRpYyBhcHBlbmRUbyhlbCwgcGFyZW50KSB7XHJcbiAgICAgICAgbGV0IHBhcmVudE5vZGU7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBwYXJlbnQgPT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICAgIHBhcmVudE5vZGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHBhcmVudCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBwYXJlbnROb2RlID0gcGFyZW50O1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAocGFyZW50Tm9kZSkge1xyXG4gICAgICAgICAgICBwYXJlbnROb2RlLmFwcGVuZENoaWxkKGVsKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvLyBwdWJsaWMgc3RhdGljIHNldFBvc2l0aW9uUmVsYXRpdmUoZWw6IEhUTUxFbGVtZW50KTogdm9pZCB7XHJcbiAgICAvLyAgIGlmICghKC9eKD86cnxhfGYpLykudGVzdCh3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShlbCkucG9zaXRpb24pKSB7XHJcbiAgICAvLyAgICAgZWwuc3R5bGUucG9zaXRpb24gPSBcInJlbGF0aXZlXCI7XHJcbiAgICAvLyAgIH1cclxuICAgIC8vIH1cclxuICAgIHN0YXRpYyBhZGRFbFN0eWxlcyhlbCwgc3R5bGVzKSB7XHJcbiAgICAgICAgaWYgKHN0eWxlcyBpbnN0YW5jZW9mIE9iamVjdCkge1xyXG4gICAgICAgICAgICBmb3IgKGNvbnN0IHMgaW4gc3R5bGVzKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoc3R5bGVzLmhhc093blByb3BlcnR5KHMpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkoc3R5bGVzW3NdKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBzdXBwb3J0IGZhbGxiYWNrIHZhbHVlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlc1tzXS5mb3JFYWNoKHZhbCA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbC5zdHlsZVtzXSA9IHZhbDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbC5zdHlsZVtzXSA9IHN0eWxlc1tzXTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBzdGF0aWMgaW5pdEV2ZW50KGUsIGluZm8pIHtcclxuICAgICAgICBjb25zdCBldnQgPSB7IHR5cGU6IGluZm8udHlwZSB9O1xyXG4gICAgICAgIGNvbnN0IG9iaiA9IHtcclxuICAgICAgICAgICAgYnV0dG9uOiAwLFxyXG4gICAgICAgICAgICB3aGljaDogMCxcclxuICAgICAgICAgICAgYnV0dG9uczogMSxcclxuICAgICAgICAgICAgYnViYmxlczogdHJ1ZSxcclxuICAgICAgICAgICAgY2FuY2VsYWJsZTogdHJ1ZSxcclxuICAgICAgICAgICAgdGFyZ2V0OiBpbmZvLnRhcmdldCA/IGluZm8udGFyZ2V0IDogZS50YXJnZXRcclxuICAgICAgICB9O1xyXG4gICAgICAgIC8vIGRvbid0IGNoZWNrIGZvciBgaW5zdGFuY2VvZiBEcmFnRXZlbnRgIGFzIFNhZmFyaSB1c2UgTW91c2VFdmVudCAjMTU0MFxyXG4gICAgICAgIGlmIChlLmRhdGFUcmFuc2Zlcikge1xyXG4gICAgICAgICAgICBldnRbJ2RhdGFUcmFuc2ZlciddID0gZS5kYXRhVHJhbnNmZXI7IC8vIHdvcmthcm91bmQgJ3JlYWRvbmx5JyBmaWVsZC5cclxuICAgICAgICB9XHJcbiAgICAgICAgWydhbHRLZXknLCAnY3RybEtleScsICdtZXRhS2V5JywgJ3NoaWZ0S2V5J10uZm9yRWFjaChwID0+IGV2dFtwXSA9IGVbcF0pOyAvLyBrZXlzXHJcbiAgICAgICAgWydwYWdlWCcsICdwYWdlWScsICdjbGllbnRYJywgJ2NsaWVudFknLCAnc2NyZWVuWCcsICdzY3JlZW5ZJ10uZm9yRWFjaChwID0+IGV2dFtwXSA9IGVbcF0pOyAvLyBwb2ludCBpbmZvXHJcbiAgICAgICAgcmV0dXJuIE9iamVjdC5hc3NpZ24oT2JqZWN0LmFzc2lnbih7fSwgZXZ0KSwgb2JqKTtcclxuICAgIH1cclxuICAgIC8qKiBjb3BpZXMgdGhlIE1vdXNlRXZlbnQgcHJvcGVydGllcyBhbmQgc2VuZHMgaXQgYXMgYW5vdGhlciBldmVudCB0byB0aGUgZ2l2ZW4gdGFyZ2V0ICovXHJcbiAgICBzdGF0aWMgc2ltdWxhdGVNb3VzZUV2ZW50KGUsIHNpbXVsYXRlZFR5cGUsIHRhcmdldCkge1xyXG4gICAgICAgIGNvbnN0IHNpbXVsYXRlZEV2ZW50ID0gZG9jdW1lbnQuY3JlYXRlRXZlbnQoJ01vdXNlRXZlbnRzJyk7XHJcbiAgICAgICAgc2ltdWxhdGVkRXZlbnQuaW5pdE1vdXNlRXZlbnQoc2ltdWxhdGVkVHlwZSwgLy8gdHlwZVxyXG4gICAgICAgIHRydWUsIC8vIGJ1YmJsZXNcclxuICAgICAgICB0cnVlLCAvLyBjYW5jZWxhYmxlXHJcbiAgICAgICAgd2luZG93LCAvLyB2aWV3XHJcbiAgICAgICAgMSwgLy8gZGV0YWlsXHJcbiAgICAgICAgZS5zY3JlZW5YLCAvLyBzY3JlZW5YXHJcbiAgICAgICAgZS5zY3JlZW5ZLCAvLyBzY3JlZW5ZXHJcbiAgICAgICAgZS5jbGllbnRYLCAvLyBjbGllbnRYXHJcbiAgICAgICAgZS5jbGllbnRZLCAvLyBjbGllbnRZXHJcbiAgICAgICAgZS5jdHJsS2V5LCAvLyBjdHJsS2V5XHJcbiAgICAgICAgZS5hbHRLZXksIC8vIGFsdEtleVxyXG4gICAgICAgIGUuc2hpZnRLZXksIC8vIHNoaWZ0S2V5XHJcbiAgICAgICAgZS5tZXRhS2V5LCAvLyBtZXRhS2V5XHJcbiAgICAgICAgMCwgLy8gYnV0dG9uXHJcbiAgICAgICAgZS50YXJnZXQgLy8gcmVsYXRlZFRhcmdldFxyXG4gICAgICAgICk7XHJcbiAgICAgICAgKHRhcmdldCB8fCBlLnRhcmdldCkuZGlzcGF0Y2hFdmVudChzaW11bGF0ZWRFdmVudCk7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0cy5VdGlscyA9IFV0aWxzO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD11dGlscy5qcy5tYXAiLCIvLyBleHRyYWN0ZWQgYnkgbWluaS1jc3MtZXh0cmFjdC1wbHVnaW5cbmV4cG9ydCB7fTsiLCIvLyBleHRyYWN0ZWQgYnkgbWluaS1jc3MtZXh0cmFjdC1wbHVnaW5cbmV4cG9ydCB7fTsiXSwibmFtZXMiOlsicmVxdWlyZSIsIkdyaWRTdGFjayIsImdsb2JhbCJdLCJzb3VyY2VSb290IjoiIn0=
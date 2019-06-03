(window["webpackJsonp"] = window["webpackJsonp"] || []).push([[1],{

/***/ "./pkg/webaudio.js":
/*!*************************!*\
  !*** ./pkg/webaudio.js ***!
  \*************************/
/*! exports provided: __widl_f_new_AudioContext, __widl_f_close_AudioContext, __widl_f_create_gain_AudioContext, __widl_f_create_oscillator_AudioContext, __widl_f_destination_AudioContext, __widl_f_connect_with_audio_node_AudioNode, __widl_f_connect_with_audio_param_AudioNode, __widl_f_value_AudioParam, __widl_f_set_value_AudioParam, __widl_f_gain_GainNode, __widl_f_set_type_OscillatorNode, __widl_f_frequency_OscillatorNode, __widl_f_start_OscillatorNode, __wbindgen_string_new, __wbindgen_rethrow, __wbindgen_throw, FmOsc, __wbindgen_object_drop_ref */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* WEBPACK VAR INJECTION */(function(TextDecoder) {/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"__widl_f_new_AudioContext\", function() { return __widl_f_new_AudioContext; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"__widl_f_close_AudioContext\", function() { return __widl_f_close_AudioContext; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"__widl_f_create_gain_AudioContext\", function() { return __widl_f_create_gain_AudioContext; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"__widl_f_create_oscillator_AudioContext\", function() { return __widl_f_create_oscillator_AudioContext; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"__widl_f_destination_AudioContext\", function() { return __widl_f_destination_AudioContext; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"__widl_f_connect_with_audio_node_AudioNode\", function() { return __widl_f_connect_with_audio_node_AudioNode; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"__widl_f_connect_with_audio_param_AudioNode\", function() { return __widl_f_connect_with_audio_param_AudioNode; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"__widl_f_value_AudioParam\", function() { return __widl_f_value_AudioParam; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"__widl_f_set_value_AudioParam\", function() { return __widl_f_set_value_AudioParam; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"__widl_f_gain_GainNode\", function() { return __widl_f_gain_GainNode; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"__widl_f_set_type_OscillatorNode\", function() { return __widl_f_set_type_OscillatorNode; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"__widl_f_frequency_OscillatorNode\", function() { return __widl_f_frequency_OscillatorNode; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"__widl_f_start_OscillatorNode\", function() { return __widl_f_start_OscillatorNode; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"__wbindgen_string_new\", function() { return __wbindgen_string_new; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"__wbindgen_rethrow\", function() { return __wbindgen_rethrow; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"__wbindgen_throw\", function() { return __wbindgen_throw; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"FmOsc\", function() { return FmOsc; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"__wbindgen_object_drop_ref\", function() { return __wbindgen_object_drop_ref; });\n/* harmony import */ var _webaudio_bg__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./webaudio_bg */ \"./pkg/webaudio_bg.wasm\");\n\n\nconst lAudioContext = (typeof AudioContext == 'undefined' ? webkitAudioContext : AudioContext);\n\nfunction _assertNum(n) {\n    if (typeof(n) !== 'number') throw new Error('expected a number argument');\n}\n\nconst heap = new Array(32);\n\nheap.fill(undefined);\n\nheap.push(undefined, null, true, false);\n\nlet heap_next = heap.length;\n\nfunction addHeapObject(obj) {\n    if (heap_next === heap.length) heap.push(heap.length + 1);\n    const idx = heap_next;\n    heap_next = heap[idx];\n\n    if (typeof(heap_next) !== 'number') throw new Error('corrupt heap');\n\n    heap[idx] = obj;\n    return idx;\n}\n\nlet cachegetUint32Memory = null;\nfunction getUint32Memory() {\n    if (cachegetUint32Memory === null || cachegetUint32Memory.buffer !== _webaudio_bg__WEBPACK_IMPORTED_MODULE_0__[\"memory\"].buffer) {\n        cachegetUint32Memory = new Uint32Array(_webaudio_bg__WEBPACK_IMPORTED_MODULE_0__[\"memory\"].buffer);\n    }\n    return cachegetUint32Memory;\n}\n\nfunction handleError(exnptr, e) {\n    const view = getUint32Memory();\n    view[exnptr / 4] = 1;\n    view[exnptr / 4 + 1] = addHeapObject(e);\n}\n\nfunction __widl_f_new_AudioContext(exnptr) {\n    try {\n        return addHeapObject(new lAudioContext());\n    } catch (e) {\n        handleError(exnptr, e);\n    }\n}\n\nfunction getObject(idx) { return heap[idx]; }\n\nfunction __widl_f_close_AudioContext(arg0, exnptr) {\n    try {\n        return addHeapObject(getObject(arg0).close());\n    } catch (e) {\n        handleError(exnptr, e);\n    }\n}\n\nfunction __widl_f_create_gain_AudioContext(arg0, exnptr) {\n    try {\n        return addHeapObject(getObject(arg0).createGain());\n    } catch (e) {\n        handleError(exnptr, e);\n    }\n}\n\nfunction __widl_f_create_oscillator_AudioContext(arg0, exnptr) {\n    try {\n        return addHeapObject(getObject(arg0).createOscillator());\n    } catch (e) {\n        handleError(exnptr, e);\n    }\n}\n\nfunction __widl_f_destination_AudioContext(arg0) {\n    try {\n        return addHeapObject(getObject(arg0).destination);\n    } catch (e) {\n        let error = (function () {\n            try {\n                return e instanceof Error\n                ? `${e.message}\n\n            Stack:\n            ${e.stack}`\n                : e.toString();\n        } catch(_) {\n            return \"<failed to stringify thrown value>\";\n        }\n    }());\n    console.error(\"wasm-bindgen: imported JS function `__widl_f_destination_AudioContext` that was not marked as `catch` threw an error:\", error);\n    throw e;\n}\n}\n\nfunction __widl_f_connect_with_audio_node_AudioNode(arg0, arg1, exnptr) {\n    try {\n        return addHeapObject(getObject(arg0).connect(getObject(arg1)));\n    } catch (e) {\n        handleError(exnptr, e);\n    }\n}\n\nfunction __widl_f_connect_with_audio_param_AudioNode(arg0, arg1, exnptr) {\n    try {\n        getObject(arg0).connect(getObject(arg1));\n    } catch (e) {\n        handleError(exnptr, e);\n    }\n}\n\nfunction __widl_f_value_AudioParam(arg0) {\n    try {\n        return getObject(arg0).value;\n    } catch (e) {\n        let error = (function () {\n            try {\n                return e instanceof Error\n                ? `${e.message}\n\n            Stack:\n            ${e.stack}`\n                : e.toString();\n        } catch(_) {\n            return \"<failed to stringify thrown value>\";\n        }\n    }());\n    console.error(\"wasm-bindgen: imported JS function `__widl_f_value_AudioParam` that was not marked as `catch` threw an error:\", error);\n    throw e;\n}\n}\n\nfunction __widl_f_set_value_AudioParam(arg0, arg1) {\n    try {\n        getObject(arg0).value = arg1;\n    } catch (e) {\n        let error = (function () {\n            try {\n                return e instanceof Error\n                ? `${e.message}\n\n            Stack:\n            ${e.stack}`\n                : e.toString();\n        } catch(_) {\n            return \"<failed to stringify thrown value>\";\n        }\n    }());\n    console.error(\"wasm-bindgen: imported JS function `__widl_f_set_value_AudioParam` that was not marked as `catch` threw an error:\", error);\n    throw e;\n}\n}\n\nfunction __widl_f_gain_GainNode(arg0) {\n    try {\n        return addHeapObject(getObject(arg0).gain);\n    } catch (e) {\n        let error = (function () {\n            try {\n                return e instanceof Error\n                ? `${e.message}\n\n            Stack:\n            ${e.stack}`\n                : e.toString();\n        } catch(_) {\n            return \"<failed to stringify thrown value>\";\n        }\n    }());\n    console.error(\"wasm-bindgen: imported JS function `__widl_f_gain_GainNode` that was not marked as `catch` threw an error:\", error);\n    throw e;\n}\n}\n\nfunction dropObject(idx) {\n    if (idx < 36) return;\n    heap[idx] = heap_next;\n    heap_next = idx;\n}\n\nfunction takeObject(idx) {\n    const ret = getObject(idx);\n    dropObject(idx);\n    return ret;\n}\n\nfunction __widl_f_set_type_OscillatorNode(arg0, arg1) {\n    try {\n        getObject(arg0).type = takeObject(arg1);\n    } catch (e) {\n        let error = (function () {\n            try {\n                return e instanceof Error\n                ? `${e.message}\n\n            Stack:\n            ${e.stack}`\n                : e.toString();\n        } catch(_) {\n            return \"<failed to stringify thrown value>\";\n        }\n    }());\n    console.error(\"wasm-bindgen: imported JS function `__widl_f_set_type_OscillatorNode` that was not marked as `catch` threw an error:\", error);\n    throw e;\n}\n}\n\nfunction __widl_f_frequency_OscillatorNode(arg0) {\n    try {\n        return addHeapObject(getObject(arg0).frequency);\n    } catch (e) {\n        let error = (function () {\n            try {\n                return e instanceof Error\n                ? `${e.message}\n\n            Stack:\n            ${e.stack}`\n                : e.toString();\n        } catch(_) {\n            return \"<failed to stringify thrown value>\";\n        }\n    }());\n    console.error(\"wasm-bindgen: imported JS function `__widl_f_frequency_OscillatorNode` that was not marked as `catch` threw an error:\", error);\n    throw e;\n}\n}\n\nfunction __widl_f_start_OscillatorNode(arg0, exnptr) {\n    try {\n        getObject(arg0).start();\n    } catch (e) {\n        handleError(exnptr, e);\n    }\n}\n\nlet cachedTextDecoder = new TextDecoder('utf-8');\n\nlet cachegetUint8Memory = null;\nfunction getUint8Memory() {\n    if (cachegetUint8Memory === null || cachegetUint8Memory.buffer !== _webaudio_bg__WEBPACK_IMPORTED_MODULE_0__[\"memory\"].buffer) {\n        cachegetUint8Memory = new Uint8Array(_webaudio_bg__WEBPACK_IMPORTED_MODULE_0__[\"memory\"].buffer);\n    }\n    return cachegetUint8Memory;\n}\n\nfunction getStringFromWasm(ptr, len) {\n    return cachedTextDecoder.decode(getUint8Memory().subarray(ptr, ptr + len));\n}\n\nfunction __wbindgen_string_new(p, l) { return addHeapObject(getStringFromWasm(p, l)); }\n\nfunction __wbindgen_rethrow(idx) { throw takeObject(idx); }\n\nfunction __wbindgen_throw(ptr, len) {\n    throw new Error(getStringFromWasm(ptr, len));\n}\n\nfunction freeFmOsc(ptr) {\n    _webaudio_bg__WEBPACK_IMPORTED_MODULE_0__[\"__wbg_fmosc_free\"](ptr);\n}\n/**\n*/\nclass FmOsc {\n\n    free() {\n        const ptr = this.ptr;\n        this.ptr = 0;\n\n        freeFmOsc(ptr);\n    }\n\n    /**\n    * @returns {}\n    */\n    constructor() {\n        this.ptr = _webaudio_bg__WEBPACK_IMPORTED_MODULE_0__[\"fmosc_new\"]();\n    }\n    /**\n    * Sets the gain for this oscillator, between 0.0 and 1.0.\n    * @param {number} gain\n    * @returns {void}\n    */\n    set_gain(gain) {\n        if (this.ptr === 0) {\n            throw new Error('Attempt to use a moved value');\n        }\n        _assertNum(gain);\n        return _webaudio_bg__WEBPACK_IMPORTED_MODULE_0__[\"fmosc_set_gain\"](this.ptr, gain);\n    }\n    /**\n    * @param {number} freq\n    * @returns {void}\n    */\n    set_primary_frequency(freq) {\n        if (this.ptr === 0) {\n            throw new Error('Attempt to use a moved value');\n        }\n        _assertNum(freq);\n        return _webaudio_bg__WEBPACK_IMPORTED_MODULE_0__[\"fmosc_set_primary_frequency\"](this.ptr, freq);\n    }\n    /**\n    * @param {number} note\n    * @returns {void}\n    */\n    set_note(note) {\n        if (this.ptr === 0) {\n            throw new Error('Attempt to use a moved value');\n        }\n        _assertNum(note);\n        return _webaudio_bg__WEBPACK_IMPORTED_MODULE_0__[\"fmosc_set_note\"](this.ptr, note);\n    }\n    /**\n    * This should be between 0 and 1, though higher values are accepted.\n    * @param {number} amt\n    * @returns {void}\n    */\n    set_fm_amount(amt) {\n        if (this.ptr === 0) {\n            throw new Error('Attempt to use a moved value');\n        }\n        _assertNum(amt);\n        return _webaudio_bg__WEBPACK_IMPORTED_MODULE_0__[\"fmosc_set_fm_amount\"](this.ptr, amt);\n    }\n    /**\n    * This should be between 0 and 1, though higher values are accepted.\n    * @param {number} amt\n    * @returns {void}\n    */\n    set_fm_frequency(amt) {\n        if (this.ptr === 0) {\n            throw new Error('Attempt to use a moved value');\n        }\n        _assertNum(amt);\n        return _webaudio_bg__WEBPACK_IMPORTED_MODULE_0__[\"fmosc_set_fm_frequency\"](this.ptr, amt);\n    }\n}\n\nfunction __wbindgen_object_drop_ref(i) { dropObject(i); }\n\n\n/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! text-encoding */ \"../../node_modules/text-encoding/index.js\")[\"TextDecoder\"]))\n\n//# sourceURL=webpack:///./pkg/webaudio.js?");

/***/ }),

/***/ "./pkg/webaudio_bg.wasm":
/*!******************************!*\
  !*** ./pkg/webaudio_bg.wasm ***!
  \******************************/
/*! exports provided: memory, __rustc_debug_gdb_scripts_section__, __wbg_fmosc_free, fmosc_new, fmosc_set_gain, fmosc_set_primary_frequency, fmosc_set_note, fmosc_set_fm_amount, fmosc_set_fm_frequency */
/***/ (function(module, exports, __webpack_require__) {

eval("\"use strict\";\n// Instantiate WebAssembly module\nvar wasmExports = __webpack_require__.w[module.i];\n__webpack_require__.r(exports);\n// export exports from WebAssembly module\nfor(var name in wasmExports) if(name != \"__webpack_init__\") exports[name] = wasmExports[name];\n// exec imports from WebAssembly module (for esm order)\n/* harmony import */ var m0 = __webpack_require__(/*! ./webaudio */ \"./pkg/webaudio.js\");\n\n\n// exec wasm module\nwasmExports[\"__webpack_init__\"]()\n\n//# sourceURL=webpack:///./pkg/webaudio_bg.wasm?");

/***/ })

}]);
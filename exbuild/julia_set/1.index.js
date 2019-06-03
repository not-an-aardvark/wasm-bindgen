(window["webpackJsonp"] = window["webpackJsonp"] || []).push([[1],{

/***/ "./pkg/julia_set.js":
/*!**************************!*\
  !*** ./pkg/julia_set.js ***!
  \**************************/
/*! exports provided: draw, __widl_f_put_image_data_CanvasRenderingContext2D, __widl_f_new_with_u8_clamped_array_and_sh_ImageData, __wbindgen_rethrow, __wbindgen_throw, __wbindgen_object_drop_ref */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* WEBPACK VAR INJECTION */(function(TextDecoder) {/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"draw\", function() { return draw; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"__widl_f_put_image_data_CanvasRenderingContext2D\", function() { return __widl_f_put_image_data_CanvasRenderingContext2D; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"__widl_f_new_with_u8_clamped_array_and_sh_ImageData\", function() { return __widl_f_new_with_u8_clamped_array_and_sh_ImageData; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"__wbindgen_rethrow\", function() { return __wbindgen_rethrow; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"__wbindgen_throw\", function() { return __wbindgen_throw; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"__wbindgen_object_drop_ref\", function() { return __wbindgen_object_drop_ref; });\n/* harmony import */ var _julia_set_bg__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./julia_set_bg */ \"./pkg/julia_set_bg.wasm\");\n\n\nconst heap = new Array(32);\n\nheap.fill(undefined);\n\nheap.push(undefined, null, true, false);\n\nlet stack_pointer = 32;\n\nfunction addBorrowedObject(obj) {\n    if (stack_pointer == 1) throw new Error('out of js stack');\n    heap[--stack_pointer] = obj;\n    return stack_pointer;\n}\n\nfunction _assertNum(n) {\n    if (typeof(n) !== 'number') throw new Error('expected a number argument');\n}\n/**\n* @param {any} ctx\n* @param {number} width\n* @param {number} height\n* @param {number} real\n* @param {number} imaginary\n* @returns {void}\n*/\nfunction draw(ctx, width, height, real, imaginary) {\n    _assertNum(width);\n    _assertNum(height);\n    _assertNum(real);\n    _assertNum(imaginary);\n    try {\n        return _julia_set_bg__WEBPACK_IMPORTED_MODULE_0__[\"draw\"](addBorrowedObject(ctx), width, height, real, imaginary);\n\n    } finally {\n        heap[stack_pointer++] = undefined;\n\n    }\n\n}\n\nfunction getObject(idx) { return heap[idx]; }\n\nlet cachegetUint32Memory = null;\nfunction getUint32Memory() {\n    if (cachegetUint32Memory === null || cachegetUint32Memory.buffer !== _julia_set_bg__WEBPACK_IMPORTED_MODULE_0__[\"memory\"].buffer) {\n        cachegetUint32Memory = new Uint32Array(_julia_set_bg__WEBPACK_IMPORTED_MODULE_0__[\"memory\"].buffer);\n    }\n    return cachegetUint32Memory;\n}\n\nlet heap_next = heap.length;\n\nfunction addHeapObject(obj) {\n    if (heap_next === heap.length) heap.push(heap.length + 1);\n    const idx = heap_next;\n    heap_next = heap[idx];\n\n    if (typeof(heap_next) !== 'number') throw new Error('corrupt heap');\n\n    heap[idx] = obj;\n    return idx;\n}\n\nfunction handleError(exnptr, e) {\n    const view = getUint32Memory();\n    view[exnptr / 4] = 1;\n    view[exnptr / 4 + 1] = addHeapObject(e);\n}\n\nfunction __widl_f_put_image_data_CanvasRenderingContext2D(arg0, arg1, arg2, arg3, exnptr) {\n    try {\n        getObject(arg0).putImageData(getObject(arg1), arg2, arg3);\n    } catch (e) {\n        handleError(exnptr, e);\n    }\n}\n\nlet cachegetUint8ClampedMemory = null;\nfunction getUint8ClampedMemory() {\n    if (cachegetUint8ClampedMemory === null || cachegetUint8ClampedMemory.buffer !== _julia_set_bg__WEBPACK_IMPORTED_MODULE_0__[\"memory\"].buffer) {\n        cachegetUint8ClampedMemory = new Uint8ClampedArray(_julia_set_bg__WEBPACK_IMPORTED_MODULE_0__[\"memory\"].buffer);\n    }\n    return cachegetUint8ClampedMemory;\n}\n\nfunction getClampedArrayU8FromWasm(ptr, len) {\n    return getUint8ClampedMemory().subarray(ptr / 1, ptr / 1 + len);\n}\n\nfunction __widl_f_new_with_u8_clamped_array_and_sh_ImageData(arg0, arg1, arg2, arg3, exnptr) {\n    let varg0 = getClampedArrayU8FromWasm(arg0, arg1);\n    try {\n        return addHeapObject(new ImageData(varg0, arg2 >>> 0, arg3 >>> 0));\n    } catch (e) {\n        handleError(exnptr, e);\n    }\n}\n\nfunction dropObject(idx) {\n    if (idx < 36) return;\n    heap[idx] = heap_next;\n    heap_next = idx;\n}\n\nfunction takeObject(idx) {\n    const ret = getObject(idx);\n    dropObject(idx);\n    return ret;\n}\n\nfunction __wbindgen_rethrow(idx) { throw takeObject(idx); }\n\nlet cachedTextDecoder = new TextDecoder('utf-8');\n\nlet cachegetUint8Memory = null;\nfunction getUint8Memory() {\n    if (cachegetUint8Memory === null || cachegetUint8Memory.buffer !== _julia_set_bg__WEBPACK_IMPORTED_MODULE_0__[\"memory\"].buffer) {\n        cachegetUint8Memory = new Uint8Array(_julia_set_bg__WEBPACK_IMPORTED_MODULE_0__[\"memory\"].buffer);\n    }\n    return cachegetUint8Memory;\n}\n\nfunction getStringFromWasm(ptr, len) {\n    return cachedTextDecoder.decode(getUint8Memory().subarray(ptr, ptr + len));\n}\n\nfunction __wbindgen_throw(ptr, len) {\n    throw new Error(getStringFromWasm(ptr, len));\n}\n\nfunction __wbindgen_object_drop_ref(i) { dropObject(i); }\n\n\n/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! text-encoding */ \"../../node_modules/text-encoding/index.js\")[\"TextDecoder\"]))\n\n//# sourceURL=webpack:///./pkg/julia_set.js?");

/***/ }),

/***/ "./pkg/julia_set_bg.wasm":
/*!*******************************!*\
  !*** ./pkg/julia_set_bg.wasm ***!
  \*******************************/
/*! exports provided: memory, __rustc_debug_gdb_scripts_section__, draw */
/***/ (function(module, exports, __webpack_require__) {

eval("\"use strict\";\n// Instantiate WebAssembly module\nvar wasmExports = __webpack_require__.w[module.i];\n__webpack_require__.r(exports);\n// export exports from WebAssembly module\nfor(var name in wasmExports) if(name != \"__webpack_init__\") exports[name] = wasmExports[name];\n// exec imports from WebAssembly module (for esm order)\n/* harmony import */ var m0 = __webpack_require__(/*! ./julia_set */ \"./pkg/julia_set.js\");\n\n\n// exec wasm module\nwasmExports[\"__webpack_init__\"]()\n\n//# sourceURL=webpack:///./pkg/julia_set_bg.wasm?");

/***/ })

}]);
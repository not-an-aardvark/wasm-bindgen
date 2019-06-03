import { Foo } from '../globals.js';
import { jsthunk } from '../globals.js';
import { add as add2 } from '../globals.js';

const __exports = {};
let wasm;

const heap = new Array(32);

heap.fill(undefined);

heap.push(undefined, null, true, false);

function getObject(idx) { return heap[idx]; }

const __wbg_bar_be39433b107f574c_target = typeof Foo === 'undefined' ? null : Foo.prototype.bar || function() {
    throw new Error(`wasm-bindgen: Foo.bar does not exist`);
};

function __wbg_bar_be39433b107f574c(arg0) {
    __wbg_bar_be39433b107f574c_target.call(getObject(arg0));
}
__exports.__wbg_bar_be39433b107f574c = __wbg_bar_be39433b107f574c

function __wbg_bar_ecb09d67d012d94e(arg0) {
    getObject(arg0).bar();
}
__exports.__wbg_bar_ecb09d67d012d94e = __wbg_bar_ecb09d67d012d94e

let cachegetUint32Memory = null;
function getUint32Memory() {
    if (cachegetUint32Memory === null || cachegetUint32Memory.buffer !== wasm.memory.buffer) {
        cachegetUint32Memory = new Uint32Array(wasm.memory.buffer);
    }
    return cachegetUint32Memory;
}

let heap_next = heap.length;

function addHeapObject(obj) {
    if (heap_next === heap.length) heap.push(heap.length + 1);
    const idx = heap_next;
    heap_next = heap[idx];

    heap[idx] = obj;
    return idx;
}

function handleError(exnptr, e) {
    const view = getUint32Memory();
    view[exnptr / 4] = 1;
    view[exnptr / 4 + 1] = addHeapObject(e);
}

function __wbg_jsthunk_06330a0180a79545(exnptr) {
    try {
        jsthunk();
    } catch (e) {
        handleError(exnptr, e);
    }
}
__exports.__wbg_jsthunk_06330a0180a79545 = __wbg_jsthunk_06330a0180a79545
/**
* @param {number} n
* @returns {void}
*/
export function call_js_thunk_n_times(n) {
    return wasm.call_js_thunk_n_times(n);
}
__exports.call_js_thunk_n_times = call_js_thunk_n_times

/**
* @param {number} n
* @param {number} a
* @param {number} b
* @returns {void}
*/
export function call_js_add_n_times(n, a, b) {
    return wasm.call_js_add_n_times(n, a, b);
}
__exports.call_js_add_n_times = call_js_add_n_times

/**
* @returns {void}
*/
export function thunk() {
    return wasm.thunk();
}
__exports.thunk = thunk

/**
* @param {number} a
* @param {number} b
* @returns {number}
*/
export function add(a, b) {
    return wasm.add(a, b);
}
__exports.add = add

/**
* @param {number} n
* @returns {number}
*/
export function fibonacci(n) {
    return wasm.fibonacci(n);
}
__exports.fibonacci = fibonacci

/**
* @returns {number}
*/
export function fibonacci_high() {
    return wasm.fibonacci_high();
}
__exports.fibonacci_high = fibonacci_high

let stack_pointer = 32;

function addBorrowedObject(obj) {
    if (stack_pointer == 1) throw new Error('out of js stack');
    heap[--stack_pointer] = obj;
    return stack_pointer;
}
/**
* @param {number} n
* @param {any} foo
* @returns {void}
*/
export function call_foo_bar_final_n_times(n, foo) {
    try {
        return wasm.call_foo_bar_final_n_times(n, addBorrowedObject(foo));

    } finally {
        heap[stack_pointer++] = undefined;

    }

}
__exports.call_foo_bar_final_n_times = call_foo_bar_final_n_times

/**
* @param {number} n
* @param {any} foo
* @returns {void}
*/
export function call_foo_bar_structural_n_times(n, foo) {
    try {
        return wasm.call_foo_bar_structural_n_times(n, addBorrowedObject(foo));

    } finally {
        heap[stack_pointer++] = undefined;

    }

}
__exports.call_foo_bar_structural_n_times = call_foo_bar_structural_n_times

/**
* @param {number} n
* @returns {void}
*/
export function call_doesnt_throw_n_times(n) {
    return wasm.call_doesnt_throw_n_times(n);
}
__exports.call_doesnt_throw_n_times = call_doesnt_throw_n_times

/**
* @param {number} n
* @returns {void}
*/
export function call_doesnt_throw_with_catch_n_times(n) {
    return wasm.call_doesnt_throw_with_catch_n_times(n);
}
__exports.call_doesnt_throw_with_catch_n_times = call_doesnt_throw_with_catch_n_times

function GetOwnOrInheritedPropertyDescriptor(obj, id) {
    while (obj) {
        let desc = Object.getOwnPropertyDescriptor(obj, id);
        if (desc) return desc;
        obj = Object.getPrototypeOf(obj);
    }
return {}
}

const __wbg_firstChild_a71694b74dc435f3_target = GetOwnOrInheritedPropertyDescriptor(typeof Element === 'undefined' ? null : Element.prototype, 'firstChild').get || function() {
    throw new Error(`wasm-bindgen: Element.firstChild does not exist`);
};

function __wbg_firstChild_a71694b74dc435f3(arg0) {
    return addHeapObject(__wbg_firstChild_a71694b74dc435f3_target.call(getObject(arg0)));
}
__exports.__wbg_firstChild_a71694b74dc435f3 = __wbg_firstChild_a71694b74dc435f3

function __wbg_firstChild_708a5ee860a65e50(arg0) {
    return addHeapObject(getObject(arg0).firstChild);
}
__exports.__wbg_firstChild_708a5ee860a65e50 = __wbg_firstChild_708a5ee860a65e50
/**
* @param {number} n
* @param {any} element
* @returns {void}
*/
export function call_first_child_final_n_times(n, element) {
    try {
        return wasm.call_first_child_final_n_times(n, addBorrowedObject(element));

    } finally {
        heap[stack_pointer++] = undefined;

    }

}
__exports.call_first_child_final_n_times = call_first_child_final_n_times

/**
* @param {number} n
* @param {any} element
* @returns {void}
*/
export function call_first_child_structural_n_times(n, element) {
    try {
        return wasm.call_first_child_structural_n_times(n, addBorrowedObject(element));

    } finally {
        heap[stack_pointer++] = undefined;

    }

}
__exports.call_first_child_structural_n_times = call_first_child_structural_n_times

let WASM_VECTOR_LEN = 0;

function passArrayJsValueToWasm(array) {
    const ptr = wasm.__wbindgen_malloc(array.length * 4);
    const mem = getUint32Memory();
    for (let i = 0; i < array.length; i++) {
        mem[ptr / 4 + i] = addHeapObject(array[i]);
    }
    WASM_VECTOR_LEN = array.length;
    return ptr;
}
/**
* @param {number} n
* @param {any[]} elements
* @returns {void}
*/
export function call_node_first_child_n_times(n, elements) {
    const ptr1 = passArrayJsValueToWasm(elements);
    const len1 = WASM_VECTOR_LEN;
    return wasm.call_node_first_child_n_times(n, ptr1, len1);
}
__exports.call_node_first_child_n_times = call_node_first_child_n_times

/**
* @param {number} n
* @param {any[]} elements
* @returns {void}
*/
export function call_node_node_type_n_times(n, elements) {
    const ptr1 = passArrayJsValueToWasm(elements);
    const len1 = WASM_VECTOR_LEN;
    return wasm.call_node_node_type_n_times(n, ptr1, len1);
}
__exports.call_node_node_type_n_times = call_node_node_type_n_times

/**
* @param {number} n
* @param {any[]} elements
* @returns {void}
*/
export function call_node_has_child_nodes_n_times(n, elements) {
    const ptr1 = passArrayJsValueToWasm(elements);
    const len1 = WASM_VECTOR_LEN;
    return wasm.call_node_has_child_nodes_n_times(n, ptr1, len1);
}
__exports.call_node_has_child_nodes_n_times = call_node_has_child_nodes_n_times

/**
* @param {any} element
* @returns {void}
*/
export function count_node_types(element) {
    return wasm.count_node_types(addHeapObject(element));
}
__exports.count_node_types = count_node_types

let cachedTextEncoder = new TextEncoder('utf-8');

let cachegetUint8Memory = null;
function getUint8Memory() {
    if (cachegetUint8Memory === null || cachegetUint8Memory.buffer !== wasm.memory.buffer) {
        cachegetUint8Memory = new Uint8Array(wasm.memory.buffer);
    }
    return cachegetUint8Memory;
}

let passStringToWasm;
if (typeof cachedTextEncoder.encodeInto === 'function') {
    passStringToWasm = function(arg) {


        let size = arg.length;
        let ptr = wasm.__wbindgen_malloc(size);
        let offset = 0;
        {
            const mem = getUint8Memory();
            for (; offset < arg.length; offset++) {
                const code = arg.charCodeAt(offset);
                if (code > 0x7F) break;
                mem[ptr + offset] = code;
            }
        }

        if (offset !== arg.length) {
            arg = arg.slice(offset);
            ptr = wasm.__wbindgen_realloc(ptr, size, size = offset + arg.length * 3);
            const view = getUint8Memory().subarray(ptr + offset, ptr + size);
            const ret = cachedTextEncoder.encodeInto(arg, view);

            offset += ret.written;
        }
        WASM_VECTOR_LEN = offset;
        return ptr;
    };
} else {
    passStringToWasm = function(arg) {


        let size = arg.length;
        let ptr = wasm.__wbindgen_malloc(size);
        let offset = 0;
        {
            const mem = getUint8Memory();
            for (; offset < arg.length; offset++) {
                const code = arg.charCodeAt(offset);
                if (code > 0x7F) break;
                mem[ptr + offset] = code;
            }
        }

        if (offset !== arg.length) {
            const buf = cachedTextEncoder.encode(arg.slice(offset));
            ptr = wasm.__wbindgen_realloc(ptr, size, size = offset + buf.length);
            getUint8Memory().set(buf, ptr + offset);
            offset += buf.length;
        }
        WASM_VECTOR_LEN = offset;
        return ptr;
    };
}

let cachedTextDecoder = new TextDecoder('utf-8');

function getStringFromWasm(ptr, len) {
    return cachedTextDecoder.decode(getUint8Memory().subarray(ptr, ptr + len));
}

let cachedGlobalArgumentPtr = null;
function globalArgumentPtr() {
    if (cachedGlobalArgumentPtr === null) {
        cachedGlobalArgumentPtr = wasm.__wbindgen_global_argument_ptr();
    }
    return cachedGlobalArgumentPtr;
}
/**
* @param {string} s
* @returns {string}
*/
export function str_roundtrip(s) {
    const ptr0 = passStringToWasm(s);
    const len0 = WASM_VECTOR_LEN;
    const retptr = globalArgumentPtr();
    wasm.str_roundtrip(retptr, ptr0, len0);
    const mem = getUint32Memory();
    const rustptr = mem[retptr / 4];
    const rustlen = mem[retptr / 4 + 1];

    const realRet = getStringFromWasm(rustptr, rustlen).slice();
    wasm.__wbindgen_free(rustptr, rustlen * 1);
    return realRet;

}
__exports.str_roundtrip = str_roundtrip

function __widl_f_has_child_nodes_Node(arg0) {
    return getObject(arg0).hasChildNodes();
}
__exports.__widl_f_has_child_nodes_Node = __widl_f_has_child_nodes_Node

function __widl_f_node_type_Node(arg0) {
    return getObject(arg0).nodeType;
}
__exports.__widl_f_node_type_Node = __widl_f_node_type_Node

function isLikeNone(x) {
    return x === undefined || x === null;
}

function __widl_f_first_child_Node(arg0) {

    const val = getObject(arg0).firstChild;
    return isLikeNone(val) ? 0 : addHeapObject(val);

}
__exports.__widl_f_first_child_Node = __widl_f_first_child_Node

function __widl_f_next_sibling_Node(arg0) {

    const val = getObject(arg0).nextSibling;
    return isLikeNone(val) ? 0 : addHeapObject(val);

}
__exports.__widl_f_next_sibling_Node = __widl_f_next_sibling_Node

function dropObject(idx) {
    if (idx < 36) return;
    heap[idx] = heap_next;
    heap_next = idx;
}

function takeObject(idx) {
    const ret = getObject(idx);
    dropObject(idx);
    return ret;
}

function __wbindgen_rethrow(idx) { throw takeObject(idx); }
__exports.__wbindgen_rethrow = __wbindgen_rethrow

function __wbindgen_throw(ptr, len) {
    throw new Error(getStringFromWasm(ptr, len));
}
__exports.__wbindgen_throw = __wbindgen_throw

function __wbindgen_object_drop_ref(i) { dropObject(i); }
__exports.__wbindgen_object_drop_ref = __wbindgen_object_drop_ref

function init(module) {
    let result;
    const imports = { './wasm_bindgen_benchmark': __exports };
    imports['../globals.js'] = { add: add2, jsthunk: jsthunk };

    if (module instanceof URL || typeof module === 'string' || module instanceof Request) {

        const response = fetch(module);
        if (typeof WebAssembly.instantiateStreaming === 'function') {
            result = WebAssembly.instantiateStreaming(response, imports)
            .catch(e => {
                console.warn("`WebAssembly.instantiateStreaming` failed. Assuming this is because your server does not serve wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);
                return response
                .then(r => r.arrayBuffer())
                .then(bytes => WebAssembly.instantiate(bytes, imports));
            });
        } else {
            result = response
            .then(r => r.arrayBuffer())
            .then(bytes => WebAssembly.instantiate(bytes, imports));
        }
    } else {

        result = WebAssembly.instantiate(module, imports)
        .then(result => {
            if (result instanceof WebAssembly.Instance) {
                return { instance: result, module };
            } else {
                return result;
            }
        });
    }
    return result.then(({instance, module}) => {
        wasm = instance.exports;
        init.__wbindgen_wasm_module = module;

        return wasm;
    });
}

export default init;


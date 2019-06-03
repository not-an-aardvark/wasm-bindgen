(function() {
    const __exports = {};
    let wasm;

    let memory;

    let cachedTextDecoder = new TextDecoder('utf-8');

    let cachegetUint8Memory = null;
    function getUint8Memory() {
        if (cachegetUint8Memory === null || cachegetUint8Memory.buffer !== memory.buffer) {
            cachegetUint8Memory = new Uint8Array(memory.buffer);
        }
        return cachegetUint8Memory;
    }

    function getStringFromWasm(ptr, len) {
        return cachedTextDecoder.decode(getUint8Memory().slice(ptr, ptr + len));
    }

    __exports.__wbg_log_1d841581f9a79c01 = function(arg0, arg1) {
        let varg0 = getStringFromWasm(arg0, arg1);
        console.log(varg0);
    };

    const heap = new Array(32);

    heap.fill(undefined);

    heap.push(undefined, null, true, false);

    let stack_pointer = 32;

    function addBorrowedObject(obj) {
        if (stack_pointer == 1) throw new Error('out of js stack');
        heap[--stack_pointer] = obj;
        return stack_pointer;
    }

    let heap_next = heap.length;

    function addHeapObject(obj) {
        if (heap_next === heap.length) heap.push(heap.length + 1);
        const idx = heap_next;
        heap_next = heap[idx];

        heap[idx] = obj;
        return idx;
    }

function getObject(idx) { return heap[idx]; }

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

let cachegetUint32Memory = null;
function getUint32Memory() {
    if (cachegetUint32Memory === null || cachegetUint32Memory.buffer !== memory.buffer) {
        cachegetUint32Memory = new Uint32Array(memory.buffer);
    }
    return cachegetUint32Memory;
}

function handleError(exnptr, e) {
    const view = getUint32Memory();
    view[exnptr / 4] = 1;
    view[exnptr / 4 + 1] = addHeapObject(e);
}

__exports.__wbg_new_911134b6f1c642fa = function(arg0, arg1, arg2, exnptr) {
    try {
        return addHeapObject(new ImageData(getObject(arg0), arg1, arg2));
    } catch (e) {
        handleError(exnptr, e);
    }
};
/**
* @param {number} ptr
* @returns {void}
*/
__exports.child_entry_point = function(ptr) {
    return wasm.child_entry_point(ptr);
};

__exports.__wbg_error_4bb6c2a97407129a = function(arg0, arg1) {
    let varg0 = getStringFromWasm(arg0, arg1);

    varg0 = varg0.slice();
    wasm.__wbindgen_free(arg0, arg1 * 1);

    console.error(varg0);
};

__exports.__wbg_new_59cb74e423758ede = function() {
    return addHeapObject(new Error());
};

let WASM_VECTOR_LEN = 0;

let cachedTextEncoder = new TextEncoder('utf-8');

function passStringToWasm(arg) {


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
}

__exports.__wbg_stack_558ba5917b466edd = function(ret, arg0) {

    const retptr = passStringToWasm(getObject(arg0).stack);
    const retlen = WASM_VECTOR_LEN;
    const mem = getUint32Memory();
    mem[ret / 4] = retptr;
    mem[ret / 4 + 1] = retlen;

};

__exports.__widl_f_put_image_data_CanvasRenderingContext2D = function(arg0, arg1, arg2, arg3, exnptr) {
    try {
        getObject(arg0).putImageData(getObject(arg1), arg2, arg3);
    } catch (e) {
        handleError(exnptr, e);
    }
};

__exports.__widl_f_post_message_DedicatedWorkerGlobalScope = function(arg0, arg1, exnptr) {
    try {
        getObject(arg0).postMessage(getObject(arg1));
    } catch (e) {
        handleError(exnptr, e);
    }
};

__exports.__widl_instanceof_ErrorEvent = function(idx) { return getObject(idx) instanceof ErrorEvent ? 1 : 0; };

__exports.__widl_f_message_ErrorEvent = function(ret, arg0) {

    const retptr = passStringToWasm(getObject(arg0).message);
    const retlen = WASM_VECTOR_LEN;
    const mem = getUint32Memory();
    mem[ret / 4] = retptr;
    mem[ret / 4 + 1] = retlen;

};

__exports.__widl_f_type_Event = function(ret, arg0) {

    const retptr = passStringToWasm(getObject(arg0).type);
    const retlen = WASM_VECTOR_LEN;
    const mem = getUint32Memory();
    mem[ret / 4] = retptr;
    mem[ret / 4 + 1] = retlen;

};

__exports.__widl_instanceof_MessageEvent = function(idx) { return getObject(idx) instanceof MessageEvent ? 1 : 0; };

__exports.__widl_f_data_MessageEvent = function(arg0) {
    return addHeapObject(getObject(arg0).data);
};

__exports.__widl_f_new_Worker = function(arg0, arg1, exnptr) {
    let varg0 = getStringFromWasm(arg0, arg1);
    try {
        return addHeapObject(new Worker(varg0));
    } catch (e) {
        handleError(exnptr, e);
    }
};

__exports.__widl_f_post_message_Worker = function(arg0, arg1, exnptr) {
    try {
        getObject(arg0).postMessage(getObject(arg1));
    } catch (e) {
        handleError(exnptr, e);
    }
};

__exports.__widl_f_terminate_Worker = function(arg0) {
    getObject(arg0).terminate();
};

__exports.__widl_f_set_onmessage_Worker = function(arg0, arg1) {
    getObject(arg0).onmessage = getObject(arg1);
};

__exports.__widl_f_set_onerror_Worker = function(arg0, arg1) {
    getObject(arg0).onerror = getObject(arg1);
};

__exports.__wbg_new_acdbe9c25dc35c37 = function() {
    return addHeapObject(new Array());
};

__exports.__wbg_isArray_1ac2d66dd819d58a = function(arg0) {
    return Array.isArray(getObject(arg0));
};

__exports.__wbg_pop_dcd8d2df6d71717e = function(arg0) {
    return addHeapObject(getObject(arg0).pop());
};

__exports.__wbg_push_60b55c9bdc824202 = function(arg0, arg1) {
    return getObject(arg0).push(getObject(arg1));
};

__exports.__wbg_new_1b8e8daea7ea040d = function(arg0, arg1) {
    let varg0 = getStringFromWasm(arg0, arg1);
    return addHeapObject(new Error(varg0));
};

__exports.__wbg_newnoargs_a172f39151049128 = function(arg0, arg1) {
    let varg0 = getStringFromWasm(arg0, arg1);
    return addHeapObject(new Function(varg0));
};

__exports.__wbg_call_8a9c8b0a32a202ff = function(arg0, arg1, exnptr) {
    try {
        return addHeapObject(getObject(arg0).call(getObject(arg1)));
    } catch (e) {
        handleError(exnptr, e);
    }
};

__exports.__wbg_call_6eed851d946419d8 = function(arg0, arg1, arg2, exnptr) {
    try {
        return addHeapObject(getObject(arg0).call(getObject(arg1), getObject(arg2)));
    } catch (e) {
        handleError(exnptr, e);
    }
};

__exports.__wbg_new_7884206509213d02 = function(arg0, arg1) {
    let cbarg0 = function(arg0, arg1) {
        let a = this.a;
        this.a = 0;
        try {
            return this.f(a, this.b, addHeapObject(arg0), addHeapObject(arg1));

        } finally {
            this.a = a;

        }

    };
    cbarg0.f = wasm.__wbg_function_table.get(127);
    cbarg0.a = arg0;
    cbarg0.b = arg1;
    try {
        return addHeapObject(new Promise(cbarg0.bind(cbarg0)));
    } finally {
        cbarg0.a = cbarg0.b = 0;

    }
};

__exports.__wbg_resolve_7f1a97b982aed82d = function(arg0) {
    return addHeapObject(Promise.resolve(getObject(arg0)));
};

__exports.__wbg_then_ad10ddb5ba4496f4 = function(arg0, arg1) {
    return addHeapObject(getObject(arg0).then(getObject(arg1)));
};

__exports.__wbg_new_8e65228b5cbc6361 = function(arg0) {
    return addHeapObject(new Uint8ClampedArray(getObject(arg0)));
};

__exports.__wbg_slice_f0f2de9f2d0a6df6 = function(arg0, arg1, arg2) {
    return addHeapObject(getObject(arg0).slice(arg1 >>> 0, arg2 >>> 0));
};

__exports.__wbg_buffer_0b401f8e593a961e = function(arg0) {
    return addHeapObject(getObject(arg0).buffer);
};

__exports.__wbindgen_string_new = function(p, l) { return addHeapObject(getStringFromWasm(p, l)); };

__exports.__wbindgen_number_new = function(i) { return addHeapObject(i); };

__exports.__wbindgen_number_get = function(n, invalid) {
    let obj = getObject(n);
    if (typeof(obj) === 'number') return obj;
    getUint8Memory()[invalid] = 1;
    return 0;
};

__exports.__wbindgen_boolean_get = function(i) {
    let v = getObject(i);
    return typeof(v) === 'boolean' ? (v ? 1 : 0) : 2;
};

__exports.__wbindgen_debug_string = function(i, len_ptr) {
    const debug_str =
    val => {
        // primitive types
        const type = typeof val;
        if (type == 'number' || type == 'boolean' || val == null) {
            return  `${val}`;
        }
        if (type == 'string') {
            return `"${val}"`;
        }
        if (type == 'symbol') {
            const description = val.description;
            if (description == null) {
                return 'Symbol';
            } else {
                return `Symbol(${description})`;
            }
        }
        if (type == 'function') {
            const name = val.name;
            if (typeof name == 'string' && name.length > 0) {
                return `Function(${name})`;
            } else {
                return 'Function';
            }
        }
        // objects
        if (Array.isArray(val)) {
            const length = val.length;
            let debug = '[';
            if (length > 0) {
                debug += debug_str(val[0]);
            }
            for(let i = 1; i < length; i++) {
                debug += ', ' + debug_str(val[i]);
            }
            debug += ']';
            return debug;
        }
        // Test for built-in
        const builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
        let className;
        if (builtInMatches.length > 1) {
            className = builtInMatches[1];
        } else {
            // Failed to match the standard '[object ClassName]'
            return toString.call(val);
        }
        if (className == 'Object') {
            // we're a user defined class or Object
            // JSON.stringify avoids problems with cycles, and is generally much
            // easier than looping through ownProperties of `val`.
            try {
                return 'Object(' + JSON.stringify(val) + ')';
            } catch (_) {
                return 'Object';
            }
        }
        // errors
        if (val instanceof Error) {
        return `${val.name}: ${val.message}
        ${val.stack}`;
    }
    // TODO we could test for more things here, like `Set`s and `Map`s.
    return className;
}
;
const toString = Object.prototype.toString;
const val = getObject(i);
const debug = debug_str(val);
const ptr = passStringToWasm(debug);
getUint32Memory()[len_ptr / 4] = WASM_VECTOR_LEN;
return ptr;
};

__exports.__wbindgen_cb_drop = function(i) {
    const obj = takeObject(i).original;
    if (obj.cnt-- == 1) {
        obj.a = 0;
        return 1;
    }
    return 0;
};

__exports.__wbindgen_json_serialize = function(idx, ptrptr) {
    const ptr = passStringToWasm(JSON.stringify(getObject(idx)));
    getUint32Memory()[ptrptr / 4] = ptr;
    return WASM_VECTOR_LEN;
};

__exports.__wbindgen_memory = function() { return addHeapObject(memory); };

__exports.__wbindgen_module = function() { return addHeapObject(init.__wbindgen_wasm_module); };

__exports.__wbindgen_rethrow = function(idx) { throw takeObject(idx); };

__exports.__wbindgen_throw = function(ptr, len) {
    throw new Error(getStringFromWasm(ptr, len));
};

__exports.__wbindgen_closure_wrapper180 = function(a, b, _ignored) {
    const f = wasm.__wbg_function_table.get(49);
    const d = wasm.__wbg_function_table.get(50);
    const cb = function(arg0) {
        this.cnt++;
        let a = this.a;
        this.a = 0;
        try {
            return f(a, b, addHeapObject(arg0));

        } finally {
            if (--this.cnt === 0) d(a, b);
            else this.a = a;

        }

    };
    cb.a = a;
    cb.cnt = 1;
    let real = cb.bind(cb);
    real.original = cb;
    return addHeapObject(real);
};

__exports.__wbindgen_closure_wrapper182 = function(a, b, _ignored) {
    const f = wasm.__wbg_function_table.get(53);
    const d = wasm.__wbg_function_table.get(50);
    const cb = function(arg0) {
        this.cnt++;
        let a = this.a;
        this.a = 0;
        try {
            return f(a, b, addHeapObject(arg0));

        } finally {
            if (--this.cnt === 0) d(a, b);
            else this.a = a;

        }

    };
    cb.a = a;
    cb.cnt = 1;
    let real = cb.bind(cb);
    real.original = cb;
    return addHeapObject(real);
};

__exports.__wbindgen_closure_wrapper242 = function(a, b, _ignored) {
    const f = wasm.__wbg_function_table.get(85);
    const d = wasm.__wbg_function_table.get(86);
    const cb = function(arg0) {
        this.cnt++;
        let a = this.a;
        this.a = 0;
        try {
            return f(a, b, addHeapObject(arg0));

        } finally {
            if (--this.cnt === 0) d(a, b);
            else this.a = a;

        }

    };
    cb.a = a;
    cb.cnt = 1;
    let real = cb.bind(cb);
    real.original = cb;
    return addHeapObject(real);
};

function freeRenderingScene(ptr) {
    wasm.__wbg_renderingscene_free(ptr);
}
/**
*/
class RenderingScene {

    static __wrap(ptr) {
        const obj = Object.create(RenderingScene.prototype);
        obj.ptr = ptr;

        return obj;
    }

    free() {
        const ptr = this.ptr;
        this.ptr = 0;

        freeRenderingScene(ptr);
    }

    /**
    * @returns {any}
    */
    promise() {
        return takeObject(wasm.renderingscene_promise(this.ptr));
    }
    /**
    * @returns {void}
    */
    requestUpdate() {
        return wasm.renderingscene_requestUpdate(this.ptr);
    }
    /**
    * @returns {WorkerPool}
    */
    cancel() {
        const ptr = this.ptr;
        this.ptr = 0;
        return WorkerPool.__wrap(wasm.renderingscene_cancel(ptr));
    }
}
__exports.RenderingScene = RenderingScene;

function freeScene(ptr) {
    wasm.__wbg_scene_free(ptr);
}
/**
*/
class Scene {

    free() {
        const ptr = this.ptr;
        this.ptr = 0;

        freeScene(ptr);
    }

    /**
    * @param {any} object
    * @returns {}
    */
    constructor(object) {
        try {
            this.ptr = wasm.scene_new(addBorrowedObject(object));

        } finally {
            heap[stack_pointer++] = undefined;

        }

    }
    /**
    * @param {number} concurrency
    * @param {WorkerPool} pool
    * @param {any} ctx
    * @returns {RenderingScene}
    */
    render(concurrency, pool, ctx) {
        const ptr = this.ptr;
        this.ptr = 0;
        const ptr1 = pool.ptr;
        pool.ptr = 0;
        return RenderingScene.__wrap(wasm.scene_render(ptr, concurrency, ptr1, addHeapObject(ctx)));
    }
}
__exports.Scene = Scene;

function freeWorkerPool(ptr) {
    wasm.__wbg_workerpool_free(ptr);
}
/**
*/
class WorkerPool {

    static __wrap(ptr) {
        const obj = Object.create(WorkerPool.prototype);
        obj.ptr = ptr;

        return obj;
    }

    free() {
        const ptr = this.ptr;
        this.ptr = 0;

        freeWorkerPool(ptr);
    }

    /**
    * @param {number} max
    * @returns {}
    */
    constructor(max) {
        this.ptr = wasm.workerpool_new(max);
    }
}
__exports.WorkerPool = WorkerPool;

__exports.__wbindgen_object_clone_ref = function(idx) {
    return addHeapObject(getObject(idx));
};

__exports.__wbindgen_object_drop_ref = function(i) { dropObject(i); };

function init(module, maybe_memory) {
    let result;
    const imports = { './raytrace_parallel': __exports };

    if (module instanceof URL || typeof module === 'string' || module instanceof Request) {
        memory = __exports.memory = new WebAssembly.Memory({initial:17,maximum:16384,shared:true});
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
        memory = __exports.memory = maybe_memory;
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
        wasm.__wbindgen_start();
        return wasm;
    });
}

self.wasm_bindgen = Object.assign(init, __exports);

})();

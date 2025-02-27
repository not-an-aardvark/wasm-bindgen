use crate::ast;
use crate::encode;
use crate::util::ShortHash;
use crate::Diagnostic;
use proc_macro2::{Ident, Literal, Span, TokenStream};
use quote::{quote, ToTokens};
use std::collections::HashSet;
use std::sync::atomic::{AtomicUsize, Ordering};
use std::sync::Mutex;
use syn;
use wasm_bindgen_shared as shared;

pub trait TryToTokens {
    fn try_to_tokens(&self, tokens: &mut TokenStream) -> Result<(), Diagnostic>;

    fn try_to_token_stream(&self) -> Result<TokenStream, Diagnostic> {
        let mut tokens = TokenStream::new();
        self.try_to_tokens(&mut tokens)?;
        Ok(tokens)
    }
}

impl TryToTokens for ast::Program {
    // Generate wrappers for all the items that we've found
    fn try_to_tokens(&self, tokens: &mut TokenStream) -> Result<(), Diagnostic> {
        let mut errors = Vec::new();
        for export in self.exports.iter() {
            if let Err(e) = export.try_to_tokens(tokens) {
                errors.push(e);
            }
        }
        for s in self.structs.iter() {
            s.to_tokens(tokens);
        }
        let mut types = HashSet::new();
        for i in self.imports.iter() {
            if let ast::ImportKind::Type(t) = &i.kind {
                types.insert(t.rust_name.clone());
            }
        }
        for i in self.imports.iter() {
            DescribeImport(&i.kind).to_tokens(tokens);

            // If there is a js namespace, check that name isn't a type. If it is,
            // this import might be a method on that type.
            if let Some(ns) = &i.js_namespace {
                if types.contains(ns) && i.kind.fits_on_impl() {
                    let kind = match i.kind.try_to_token_stream() {
                        Ok(kind) => kind,
                        Err(e) => {
                            errors.push(e);
                            continue;
                        }
                    };
                    (quote! { impl #ns { #kind } }).to_tokens(tokens);
                    continue;
                }
            }

            if let Err(e) = i.kind.try_to_tokens(tokens) {
                errors.push(e);
            }
        }
        for e in self.enums.iter() {
            e.to_tokens(tokens);
        }
        for c in self.consts.iter() {
            c.to_tokens(tokens);
        }
        for d in self.dictionaries.iter() {
            d.to_tokens(tokens);
        }

        Diagnostic::from_vec(errors)?;

        // Generate a static which will eventually be what lives in a custom section
        // of the wasm executable. For now it's just a plain old static, but we'll
        // eventually have it actually in its own section.

        static CNT: AtomicUsize = AtomicUsize::new(0);

        let generated_static_name = format!(
            "__WASM_BINDGEN_GENERATED_{}",
            ShortHash(CNT.fetch_add(1, Ordering::SeqCst)),
        );
        let generated_static_name = Ident::new(&generated_static_name, Span::call_site());

        // See comments in `crates/cli-support/src/lib.rs` about what this
        // `schema_version` is.
        let prefix_json = format!(
            r#"{{"schema_version":"{}","version":"{}"}}"#,
            shared::SCHEMA_VERSION,
            shared::version()
        );
        let encoded = encode::encode(self)?;
        let mut bytes = Vec::new();
        bytes.push((prefix_json.len() >> 0) as u8);
        bytes.push((prefix_json.len() >> 8) as u8);
        bytes.push((prefix_json.len() >> 16) as u8);
        bytes.push((prefix_json.len() >> 24) as u8);
        bytes.extend_from_slice(prefix_json.as_bytes());
        bytes.extend_from_slice(&encoded.custom_section);

        let generated_static_length = bytes.len();
        let generated_static_value = syn::LitByteStr::new(&bytes, Span::call_site());

        // We already consumed the contents of included files when generating
        // the custom section, but we want to make sure that updates to the
        // generated files will cause this macro to rerun incrementally. To do
        // that we use `include_str!` to force rustc to think it has a
        // dependency on these files. That way when the file changes Cargo will
        // automatically rerun rustc which will rerun this macro. Other than
        // this we don't actually need the results of the `include_str!`, so
        // it's just shoved into an anonymous static.
        let file_dependencies = encoded.included_files.iter().map(|file| {
            let file = file.to_str().unwrap();
            quote! { include_str!(#file) }
        });

        (quote! {
            #[allow(non_upper_case_globals)]
            #[cfg(target_arch = "wasm32")]
            #[link_section = "__wasm_bindgen_unstable"]
            #[doc(hidden)]
            #[allow(clippy::all)]
            pub static #generated_static_name: [u8; #generated_static_length] = {
                static _INCLUDED_FILES: &[&str] = &[#(#file_dependencies),*];

                *#generated_static_value
            };

        })
        .to_tokens(tokens);

        Ok(())
    }
}

impl ToTokens for ast::Struct {
    fn to_tokens(&self, tokens: &mut TokenStream) {
        let name = &self.rust_name;
        let name_str = self.js_name.to_string();
        let name_len = name_str.len() as u32;
        let name_chars = name_str.chars().map(|c| c as u32);
        let new_fn = Ident::new(&shared::new_function(&name_str), Span::call_site());
        let free_fn = Ident::new(&shared::free_function(&name_str), Span::call_site());
        (quote! {
            #[allow(clippy::all)]
            impl wasm_bindgen::describe::WasmDescribe for #name {
                fn describe() {
                    use wasm_bindgen::__wbindgen_if_not_std;
                    __wbindgen_if_not_std! {
                        compile_error! {
                            "exporting a class to JS requires the `std` feature to \
                             be enabled in the `wasm-bindgen` crate"
                        }
                    }
                    use wasm_bindgen::describe::*;
                    inform(RUST_STRUCT);
                    inform(#name_len);
                    #(inform(#name_chars);)*
                }
            }

            #[allow(clippy::all)]
            impl wasm_bindgen::convert::IntoWasmAbi for #name {
                type Abi = u32;

                fn into_abi(self, _extra: &mut dyn wasm_bindgen::convert::Stack)
                    -> u32
                {
                    use wasm_bindgen::__rt::std::boxed::Box;
                    use wasm_bindgen::__rt::WasmRefCell;
                    Box::into_raw(Box::new(WasmRefCell::new(self))) as u32
                }
            }

            #[allow(clippy::all)]
            impl wasm_bindgen::convert::FromWasmAbi for #name {
                type Abi = u32;

                unsafe fn from_abi(js: u32, _extra: &mut dyn wasm_bindgen::convert::Stack)
                    -> Self
                {
                    use wasm_bindgen::__rt::std::boxed::Box;
                    use wasm_bindgen::__rt::{assert_not_null, WasmRefCell};

                    let ptr = js as *mut WasmRefCell<#name>;
                    assert_not_null(ptr);
                    let js = Box::from_raw(ptr);
                    (*js).borrow_mut(); // make sure no one's borrowing
                    js.into_inner()
                }
            }

            #[allow(clippy::all)]
            impl wasm_bindgen::__rt::core::convert::From<#name> for
                wasm_bindgen::JsValue
            {
                fn from(value: #name) -> Self {
                    let ptr = wasm_bindgen::convert::IntoWasmAbi::into_abi(
                        value,
                        unsafe { &mut wasm_bindgen::convert::GlobalStack::new() },
                    );

                    #[link(wasm_import_module = "__wbindgen_placeholder__")]
                    #[cfg(all(target_arch = "wasm32", not(target_os = "emscripten")))]
                    extern "C" {
                        fn #new_fn(ptr: u32) -> u32;
                    }

                    #[cfg(not(all(target_arch = "wasm32", not(target_os = "emscripten"))))]
                    unsafe fn #new_fn(_: u32) -> u32 {
                        panic!("cannot convert to JsValue outside of the wasm target")
                    }

                    unsafe {
                        <wasm_bindgen::JsValue as wasm_bindgen::convert::FromWasmAbi>
                            ::from_abi(
                                #new_fn(ptr),
                                &mut wasm_bindgen::convert::GlobalStack::new(),
                            )
                    }
                }
            }

            #[cfg(all(target_arch = "wasm32", not(target_os = "emscripten")))]
            #[no_mangle]
            #[doc(hidden)]
            #[allow(clippy::all)]
            pub unsafe extern "C" fn #free_fn(ptr: u32) {
                <#name as wasm_bindgen::convert::FromWasmAbi>::from_abi(
                    ptr,
                    &mut wasm_bindgen::convert::GlobalStack::new(),
                );
            }

            #[allow(clippy::all)]
            impl wasm_bindgen::convert::RefFromWasmAbi for #name {
                type Abi = u32;
                type Anchor = wasm_bindgen::__rt::Ref<'static, #name>;

                unsafe fn ref_from_abi(
                    js: Self::Abi,
                    _extra: &mut dyn wasm_bindgen::convert::Stack,
                ) -> Self::Anchor {
                    let js = js as *mut wasm_bindgen::__rt::WasmRefCell<#name>;
                    wasm_bindgen::__rt::assert_not_null(js);
                    (*js).borrow()
                }
            }

            #[allow(clippy::all)]
            impl wasm_bindgen::convert::RefMutFromWasmAbi for #name {
                type Abi = u32;
                type Anchor = wasm_bindgen::__rt::RefMut<'static, #name>;

                unsafe fn ref_mut_from_abi(
                    js: Self::Abi,
                    _extra: &mut dyn wasm_bindgen::convert::Stack,
                ) -> Self::Anchor {
                    let js = js as *mut wasm_bindgen::__rt::WasmRefCell<#name>;
                    wasm_bindgen::__rt::assert_not_null(js);
                    (*js).borrow_mut()
                }
            }

            impl wasm_bindgen::convert::OptionIntoWasmAbi for #name {
                #[inline]
                fn none() -> Self::Abi { 0 }
            }

            impl wasm_bindgen::convert::OptionFromWasmAbi for #name {
                #[inline]
                fn is_none(abi: &Self::Abi) -> bool { *abi == 0 }
            }

        })
        .to_tokens(tokens);

        for field in self.fields.iter() {
            field.to_tokens(tokens);
        }
    }
}

impl ToTokens for ast::StructField {
    fn to_tokens(&self, tokens: &mut TokenStream) {
        let name = &self.name;
        let struct_name = &self.struct_name;
        let ty = &self.ty;
        let getter = &self.getter;
        let setter = &self.setter;

        let assert_copy = quote! { assert_copy::<#ty>() };
        let assert_copy = respan(assert_copy, ty);
        (quote! {
            #[doc(hidden)]
            #[allow(clippy::all)]
            #[cfg_attr(all(target_arch = "wasm32", not(target_os = "emscripten")), no_mangle)]
            pub unsafe extern "C" fn #getter(js: u32)
                -> <#ty as wasm_bindgen::convert::IntoWasmAbi>::Abi
            {
                use wasm_bindgen::__rt::{WasmRefCell, assert_not_null};
                use wasm_bindgen::convert::{GlobalStack, IntoWasmAbi};

                fn assert_copy<T: Copy>(){}
                #assert_copy;

                let js = js as *mut WasmRefCell<#struct_name>;
                assert_not_null(js);
                let val = (*js).borrow().#name;
                <#ty as IntoWasmAbi>::into_abi(
                    val,
                    &mut GlobalStack::new(),
                )
            }
        })
        .to_tokens(tokens);

        Descriptor(
            &getter,
            quote! {
                <#ty as WasmDescribe>::describe();
            },
        )
        .to_tokens(tokens);

        if self.readonly {
            return;
        }

        (quote! {
            #[no_mangle]
            #[doc(hidden)]
            #[cfg(all(target_arch = "wasm32", not(target_os = "emscripten")))]
            #[allow(clippy::all)]
            pub unsafe extern "C" fn #setter(
                js: u32,
                val: <#ty as wasm_bindgen::convert::FromWasmAbi>::Abi,
            ) {
                use wasm_bindgen::__rt::{WasmRefCell, assert_not_null};
                use wasm_bindgen::convert::{GlobalStack, FromWasmAbi};

                let js = js as *mut WasmRefCell<#struct_name>;
                assert_not_null(js);
                let val = <#ty as FromWasmAbi>::from_abi(
                    val,
                    &mut GlobalStack::new(),
                );
                (*js).borrow_mut().#name = val;
            }
        })
        .to_tokens(tokens);
    }
}

impl TryToTokens for ast::Export {
    fn try_to_tokens(self: &ast::Export, into: &mut TokenStream) -> Result<(), Diagnostic> {
        let generated_name = self.rust_symbol();
        let export_name = self.export_name();
        let mut args = vec![];
        let mut arg_conversions = vec![];
        let mut converted_arguments = vec![];
        let ret = Ident::new("_ret", Span::call_site());

        let offset = if self.method_self.is_some() {
            args.push(quote! { me: u32 });
            1
        } else {
            0
        };

        let name = &self.rust_name;
        let receiver = match self.method_self {
            Some(ast::MethodSelf::ByValue) => {
                let class = self.rust_class.as_ref().unwrap();
                arg_conversions.push(quote! {
                    let me = unsafe {
                        <#class as wasm_bindgen::convert::FromWasmAbi>::from_abi(
                            me,
                            &mut wasm_bindgen::convert::GlobalStack::new(),
                        )
                    };
                });
                quote! { me.#name }
            }
            Some(ast::MethodSelf::RefMutable) => {
                let class = self.rust_class.as_ref().unwrap();
                arg_conversions.push(quote! {
                    let mut me = unsafe {
                        <#class as wasm_bindgen::convert::RefMutFromWasmAbi>
                            ::ref_mut_from_abi(
                                me,
                                &mut wasm_bindgen::convert::GlobalStack::new(),
                            )
                    };
                    let me = &mut *me;
                });
                quote! { me.#name }
            }
            Some(ast::MethodSelf::RefShared) => {
                let class = self.rust_class.as_ref().unwrap();
                arg_conversions.push(quote! {
                    let me = unsafe {
                        <#class as wasm_bindgen::convert::RefFromWasmAbi>
                            ::ref_from_abi(
                                me,
                                &mut wasm_bindgen::convert::GlobalStack::new(),
                            )
                    };
                    let me = &*me;
                });
                quote! { me.#name }
            }
            None => match &self.rust_class {
                Some(class) => quote! { #class::#name },
                None => quote! { #name },
            },
        };

        for (i, syn::ArgCaptured { ty, .. }) in self.function.arguments.iter().enumerate() {
            let i = i + offset;
            let ident = Ident::new(&format!("arg{}", i), Span::call_site());
            match *ty {
                syn::Type::Reference(syn::TypeReference {
                    mutability: Some(_),
                    ref elem,
                    ..
                }) => {
                    args.push(quote! {
                        #ident: <#elem as wasm_bindgen::convert::RefMutFromWasmAbi>::Abi
                    });
                    arg_conversions.push(quote! {
                        let mut #ident = unsafe {
                            <#elem as wasm_bindgen::convert::RefMutFromWasmAbi>
                                ::ref_mut_from_abi(#ident, &mut __stack)
                        };
                        let #ident = &mut *#ident;
                    });
                }
                syn::Type::Reference(syn::TypeReference { ref elem, .. }) => {
                    args.push(quote! {
                        #ident: <#elem as wasm_bindgen::convert::RefFromWasmAbi>::Abi
                    });
                    arg_conversions.push(quote! {
                        let #ident = unsafe {
                            <#elem as wasm_bindgen::convert::RefFromWasmAbi>
                                ::ref_from_abi(#ident, &mut __stack)
                        };
                        let #ident = &*#ident;
                    });
                }
                _ => {
                    args.push(quote! {
                        #ident: <#ty as wasm_bindgen::convert::FromWasmAbi>::Abi
                    });
                    arg_conversions.push(quote! {
                        let #ident = unsafe {
                            <#ty as wasm_bindgen::convert::FromWasmAbi>
                                ::from_abi(#ident, &mut __stack)
                        };
                    });
                }
            }
            converted_arguments.push(quote! { #ident });
        }
        let syn_unit = syn::Type::Tuple(syn::TypeTuple {
            elems: Default::default(),
            paren_token: Default::default(),
        });
        let syn_ret = self.function.ret.as_ref().unwrap_or(&syn_unit);
        if let syn::Type::Reference(_) = syn_ret {
            bail_span!(syn_ret, "cannot return a borrowed ref with #[wasm_bindgen]",)
        }
        let ret_ty = quote! {
            -> <#syn_ret as wasm_bindgen::convert::ReturnWasmAbi>::Abi
        };
        let convert_ret = quote! {
            <#syn_ret as wasm_bindgen::convert::ReturnWasmAbi>
                ::return_abi(#ret, &mut unsafe {
                    wasm_bindgen::convert::GlobalStack::new()
                })
        };
        let describe_ret = quote! {
            <#syn_ret as WasmDescribe>::describe();
        };
        let nargs = self.function.arguments.len() as u32;
        let argtys = self.function.arguments.iter().map(|arg| &arg.ty);
        let attrs = &self.function.rust_attrs;

        let start_check = if self.start {
            quote! {
                const _ASSERT: fn() = || #ret_ty { loop {} };
            }
        } else {
            quote! {}
        };

        (quote! {
            #(#attrs)*
            #[export_name = #export_name]
            #[allow(non_snake_case)]
            #[cfg(all(target_arch = "wasm32", not(target_os = "emscripten")))]
            #[allow(clippy::all)]
            pub extern "C" fn #generated_name(#(#args),*) #ret_ty {
                #start_check
                // Scope all local variables to be destroyed after we call the
                // function to ensure that `#convert_ret`, if it panics, doesn't
                // leak anything.
                let #ret = {
                    let mut __stack = unsafe {
                        wasm_bindgen::convert::GlobalStack::new()
                    };
                    #(#arg_conversions)*
                    #receiver(#(#converted_arguments),*)
                };
                #convert_ret
            }
        })
        .to_tokens(into);

        // In addition to generating the shim function above which is what
        // our generated JS will invoke, we *also* generate a "descriptor"
        // shim. This descriptor shim uses the `WasmDescribe` trait to
        // programmatically describe the type signature of the generated
        // shim above. This in turn is then used to inform the
        // `wasm-bindgen` CLI tool exactly what types and such it should be
        // using in JS.
        //
        // Note that this descriptor function is a purely an internal detail
        // of `#[wasm_bindgen]` and isn't intended to be exported to anyone
        // or actually part of the final was binary. Additionally, this is
        // literally executed when the `wasm-bindgen` tool executes.
        //
        // In any case, there's complications in `wasm-bindgen` to handle
        // this, but the tl;dr; is that this is stripped from the final wasm
        // binary along with anything it references.
        let export = Ident::new(&export_name, Span::call_site());
        Descriptor(
            &export,
            quote! {
                inform(FUNCTION);
                inform(0);
                inform(#nargs);
                #(<#argtys as WasmDescribe>::describe();)*
                #describe_ret
            },
        )
        .to_tokens(into);

        Ok(())
    }
}

impl TryToTokens for ast::ImportKind {
    fn try_to_tokens(&self, tokens: &mut TokenStream) -> Result<(), Diagnostic> {
        match *self {
            ast::ImportKind::Function(ref f) => f.try_to_tokens(tokens)?,
            ast::ImportKind::Static(ref s) => s.to_tokens(tokens),
            ast::ImportKind::Type(ref t) => t.to_tokens(tokens),
            ast::ImportKind::Enum(ref e) => e.to_tokens(tokens),
        }

        Ok(())
    }
}

impl ToTokens for ast::ImportType {
    fn to_tokens(&self, tokens: &mut TokenStream) {
        let vis = &self.vis;
        let rust_name = &self.rust_name;
        let attrs = &self.attrs;
        let doc_comment = match &self.doc_comment {
            None => "",
            Some(comment) => comment,
        };
        let const_name = format!("__wbg_generated_const_{}", rust_name);
        let const_name = Ident::new(&const_name, Span::call_site());
        let instanceof_shim = Ident::new(&self.instanceof_shim, Span::call_site());

        let internal_obj = match self.extends.first() {
            Some(target) => {
                quote! { #target }
            }
            None => {
                quote! { wasm_bindgen::JsValue }
            }
        };

        let is_type_of = self.is_type_of.as_ref().map(|is_type_of| {
            quote! {
                #[inline]
                fn is_type_of(val: &JsValue) -> bool {
                    let is_type_of: fn(&JsValue) -> bool = #is_type_of;
                    is_type_of(val)
                }
            }
        });

        (quote! {
            #[allow(bad_style)]
            #(#attrs)*
            #[doc = #doc_comment]
            #[repr(transparent)]
            #[allow(clippy::all)]
            #vis struct #rust_name {
                obj: #internal_obj
            }

            #[allow(bad_style)]
            #[allow(clippy::all)]
            const #const_name: () = {
                use wasm_bindgen::convert::{IntoWasmAbi, FromWasmAbi, Stack};
                use wasm_bindgen::convert::{OptionIntoWasmAbi, OptionFromWasmAbi};
                use wasm_bindgen::convert::RefFromWasmAbi;
                use wasm_bindgen::describe::WasmDescribe;
                use wasm_bindgen::{JsValue, JsCast};
                use wasm_bindgen::__rt::core;

                impl WasmDescribe for #rust_name {
                    fn describe() {
                        JsValue::describe();
                    }
                }

                impl core::ops::Deref for #rust_name {
                    type Target = #internal_obj;

                    #[inline]
                    fn deref(&self) -> &#internal_obj {
                        &self.obj
                    }
                }

                impl IntoWasmAbi for #rust_name {
                    type Abi = <JsValue as IntoWasmAbi>::Abi;

                    #[inline]
                    fn into_abi(self, extra: &mut dyn Stack) -> Self::Abi {
                        self.obj.into_abi(extra)
                    }
                }

                impl OptionIntoWasmAbi for #rust_name {
                    #[inline]
                    fn none() -> Self::Abi { 0 }
                }

                impl<'a> OptionIntoWasmAbi for &'a #rust_name {
                    #[inline]
                    fn none() -> Self::Abi { 0 }
                }

                impl FromWasmAbi for #rust_name {
                    type Abi = <JsValue as FromWasmAbi>::Abi;

                    #[inline]
                    unsafe fn from_abi(js: Self::Abi, extra: &mut dyn Stack) -> Self {
                        #rust_name {
                            obj: JsValue::from_abi(js, extra).into(),
                        }
                    }
                }

                impl OptionFromWasmAbi for #rust_name {
                    #[inline]
                    fn is_none(abi: &Self::Abi) -> bool { *abi == 0 }
                }

                impl<'a> IntoWasmAbi for &'a #rust_name {
                    type Abi = <&'a JsValue as IntoWasmAbi>::Abi;

                    #[inline]
                    fn into_abi(self, extra: &mut dyn Stack) -> Self::Abi {
                        (&self.obj).into_abi(extra)
                    }
                }

                impl RefFromWasmAbi for #rust_name {
                    type Abi = <JsValue as RefFromWasmAbi>::Abi;
                    type Anchor = core::mem::ManuallyDrop<#rust_name>;

                    #[inline]
                    unsafe fn ref_from_abi(js: Self::Abi, extra: &mut dyn Stack) -> Self::Anchor {
                        let tmp = <JsValue as RefFromWasmAbi>::ref_from_abi(js, extra);
                        core::mem::ManuallyDrop::new(#rust_name {
                            obj: core::mem::ManuallyDrop::into_inner(tmp).into(),
                        })
                    }
                }

                // TODO: remove this on the next major version
                impl From<JsValue> for #rust_name {
                    #[inline]
                    fn from(obj: JsValue) -> #rust_name {
                        #rust_name { obj: obj.into() }
                    }
                }

                impl AsRef<JsValue> for #rust_name {
                    #[inline]
                    fn as_ref(&self) -> &JsValue { self.obj.as_ref() }
                }


                impl From<#rust_name> for JsValue {
                    #[inline]
                    fn from(obj: #rust_name) -> JsValue {
                        obj.obj.into()
                    }
                }

                impl JsCast for #rust_name {
                    fn instanceof(val: &JsValue) -> bool {
                        #[link(wasm_import_module = "__wbindgen_placeholder__")]
                        #[cfg(all(target_arch = "wasm32", not(target_os = "emscripten")))]
                        extern "C" {
                            fn #instanceof_shim(val: u32) -> u32;
                        }
                        #[cfg(not(all(target_arch = "wasm32", not(target_os = "emscripten"))))]
                        unsafe fn #instanceof_shim(_: u32) -> u32 {
                            panic!("cannot check instanceof on non-wasm targets");
                        }
                        unsafe {
                            let idx = val.into_abi(&mut wasm_bindgen::convert::GlobalStack::new());
                            #instanceof_shim(idx) != 0
                        }
                    }

                    #is_type_of

                    #[inline]
                    fn unchecked_from_js(val: JsValue) -> Self {
                        #rust_name { obj: val.into() }
                    }

                    #[inline]
                    fn unchecked_from_js_ref(val: &JsValue) -> &Self {
                        // Should be safe because `#rust_name` is a transparent
                        // wrapper around `val`
                        unsafe { &*(val as *const JsValue as *const #rust_name) }
                    }
                }

                ()
            };
        })
        .to_tokens(tokens);

        for superclass in self.extends.iter() {
            (quote! {
                #[allow(clippy::all)]
                impl From<#rust_name> for #superclass {
                    #[inline]
                    fn from(obj: #rust_name) -> #superclass {
                        use wasm_bindgen::JsCast;
                        #superclass::unchecked_from_js(obj.into())
                    }
                }

                #[allow(clippy::all)]
                impl AsRef<#superclass> for #rust_name {
                    #[inline]
                    fn as_ref(&self) -> &#superclass {
                        use wasm_bindgen::JsCast;
                        #superclass::unchecked_from_js_ref(self.as_ref())
                    }
                }
            })
            .to_tokens(tokens);
        }
    }
}

impl ToTokens for ast::ImportEnum {
    fn to_tokens(&self, tokens: &mut TokenStream) {
        let vis = &self.vis;
        let name = &self.name;
        let expect_string = format!("attempted to convert invalid {} into JSValue", name);
        let variants = &self.variants;
        let variant_strings = &self.variant_values;
        let attrs = &self.rust_attrs;

        let mut current_idx: usize = 0;
        let variant_indexes: Vec<Literal> = variants
            .iter()
            .map(|_| {
                let this_index = current_idx;
                current_idx += 1;
                Literal::usize_unsuffixed(this_index)
            })
            .collect();

        // Borrow variant_indexes because we need to use it multiple times inside the quote! macro
        let variant_indexes_ref = &variant_indexes;

        // A vector of EnumName::VariantName tokens for this enum
        let variant_paths: Vec<TokenStream> = self
            .variants
            .iter()
            .map(|v| quote!(#name::#v).into_token_stream())
            .collect();

        // Borrow variant_paths because we need to use it multiple times inside the quote! macro
        let variant_paths_ref = &variant_paths;

        (quote! {
            #[allow(bad_style)]
            #(#attrs)*
            #[allow(clippy::all)]
            #vis enum #name {
                #(#variants = #variant_indexes_ref,)*
                #[doc(hidden)]
                __Nonexhaustive,
            }

            #[allow(clippy::all)]
            impl #name {
                #vis fn from_js_value(obj: &wasm_bindgen::JsValue) -> Option<#name> {
                    obj.as_string().and_then(|obj_str| match obj_str.as_str() {
                        #(#variant_strings => Some(#variant_paths_ref),)*
                        _ => None,
                    })
                }
            }

            #[allow(clippy::all)]
            impl wasm_bindgen::describe::WasmDescribe for #name {
                fn describe() {
                    wasm_bindgen::JsValue::describe()
                }
            }

            #[allow(clippy::all)]
            impl wasm_bindgen::convert::IntoWasmAbi for #name {
                type Abi = <wasm_bindgen::JsValue as
                    wasm_bindgen::convert::IntoWasmAbi>::Abi;

                #[inline]
                fn into_abi(self, extra: &mut dyn wasm_bindgen::convert::Stack) -> Self::Abi {
                    wasm_bindgen::JsValue::from(self).into_abi(extra)
                }
            }

            #[allow(clippy::all)]
            impl wasm_bindgen::convert::FromWasmAbi for #name {
                type Abi = <wasm_bindgen::JsValue as
                    wasm_bindgen::convert::FromWasmAbi>::Abi;

                unsafe fn from_abi(
                    js: Self::Abi,
                    extra: &mut dyn wasm_bindgen::convert::Stack,
                ) -> Self {
                    #name::from_js_value(&wasm_bindgen::JsValue::from_abi(js, extra)).unwrap_or(#name::__Nonexhaustive)
                }
            }

            #[allow(clippy::all)]
            impl wasm_bindgen::convert::OptionIntoWasmAbi for #name {
                #[inline]
                fn none() -> Self::Abi { Object::none() }
            }

            #[allow(clippy::all)]
            impl wasm_bindgen::convert::OptionFromWasmAbi for #name {
                #[inline]
                fn is_none(abi: &Self::Abi) -> bool { Object::is_none(abi) }
            }

            #[allow(clippy::all)]
            impl From<#name> for wasm_bindgen::JsValue {
                fn from(obj: #name) -> wasm_bindgen::JsValue {
                    match obj {
                        #(#variant_paths_ref => wasm_bindgen::JsValue::from_str(#variant_strings),)*
                        #name::__Nonexhaustive => panic!(#expect_string),
                    }
                }
            }
        }).to_tokens(tokens);
    }
}

impl TryToTokens for ast::ImportFunction {
    fn try_to_tokens(&self, tokens: &mut TokenStream) -> Result<(), Diagnostic> {
        let mut class_ty = None;
        let mut is_method = false;
        match self.kind {
            ast::ImportFunctionKind::Method {
                ref ty, ref kind, ..
            } => {
                if let ast::MethodKind::Operation(ast::Operation {
                    is_static: false, ..
                }) = kind
                {
                    is_method = true;
                }
                class_ty = Some(ty);
            }
            ast::ImportFunctionKind::Normal => {}
        }
        let vis = &self.function.rust_vis;
        let ret = match &self.function.ret {
            Some(ty) => quote! { -> #ty },
            None => quote!(),
        };

        let mut abi_argument_names = Vec::new();
        let mut abi_arguments = Vec::new();
        let mut arg_conversions = Vec::new();
        let mut arguments = Vec::new();
        let ret_ident = Ident::new("_ret", Span::call_site());

        for (i, syn::ArgCaptured { pat, ty, .. }) in self.function.arguments.iter().enumerate() {
            let name = match pat {
                syn::Pat::Ident(syn::PatIdent {
                    by_ref: None,
                    ident,
                    subpat: None,
                    ..
                }) => ident.clone(),
                syn::Pat::Wild(_) => syn::Ident::new(&format!("__genarg_{}", i), Span::call_site()),
                _ => bail_span!(
                    pat,
                    "unsupported pattern in #[wasm_bindgen] imported function",
                ),
            };

            abi_argument_names.push(name.clone());
            abi_arguments.push(quote! {
                #name: <#ty as wasm_bindgen::convert::IntoWasmAbi>::Abi
            });
            let var = if i == 0 && is_method {
                quote! { self }
            } else {
                arguments.push(quote! { #name: #ty });
                quote! { #name }
            };
            arg_conversions.push(quote! {
                let #name = <#ty as wasm_bindgen::convert::IntoWasmAbi>
                    ::into_abi(#var, &mut __stack);
            });
        }
        let abi_ret;
        let mut convert_ret;
        match &self.js_ret {
            Some(syn::Type::Reference(_)) => {
                bail_span!(
                    self.js_ret,
                    "cannot return references in #[wasm_bindgen] imports yet"
                );
            }
            Some(ref ty) => {
                abi_ret = quote! {
                    <#ty as wasm_bindgen::convert::FromWasmAbi>::Abi
                };
                convert_ret = quote! {
                    <#ty as wasm_bindgen::convert::FromWasmAbi>
                        ::from_abi(
                            #ret_ident,
                            &mut wasm_bindgen::convert::GlobalStack::new(),
                        )
                };
            }
            None => {
                abi_ret = quote! { () };
                convert_ret = quote! { () };
            }
        }

        let mut exceptional_ret = quote!();
        let exn_data = if self.catch {
            let exn_data = Ident::new("exn_data", Span::call_site());
            let exn_data_ptr = Ident::new("exn_data_ptr", Span::call_site());
            abi_argument_names.push(exn_data_ptr.clone());
            abi_arguments.push(quote! { #exn_data_ptr: *mut u32 });
            convert_ret = quote! { Ok(#convert_ret) };
            exceptional_ret = quote! {
                if #exn_data[0] == 1 {
                    return Err(
                        <
                            wasm_bindgen::JsValue as wasm_bindgen::convert::FromWasmAbi
                        >::from_abi(#exn_data[1], &mut wasm_bindgen::convert::GlobalStack::new())
                    )
                }
            };
            quote! {
                let mut #exn_data = [0; 2];
                let #exn_data_ptr = #exn_data.as_mut_ptr();
            }
        } else {
            quote!()
        };

        let rust_name = &self.rust_name;
        let import_name = &self.shim;
        let attrs = &self.function.rust_attrs;
        let arguments = &arguments;
        let abi_arguments = &abi_arguments;
        let abi_argument_names = &abi_argument_names;

        let doc_comment = match &self.doc_comment {
            None => "",
            Some(doc_string) => doc_string,
        };
        let me = if is_method {
            quote! { &self, }
        } else {
            quote!()
        };

        // Route any errors pointing to this imported function to the identifier
        // of the function we're imported from so we at least know what function
        // is causing issues.
        //
        // Note that this is where type errors like "doesn't implement
        // FromWasmAbi" or "doesn't implement IntoWasmAbi" currently get routed.
        // I suspect that's because they show up in the signature via trait
        // projections as types of arguments, and all that needs to typecheck
        // before the body can be typechecked. Due to rust-lang/rust#60980 (and
        // probably related issues) we can't really get a precise span.
        //
        // Ideally what we want is to point errors for particular types back to
        // the specific argument/type that generated the error, but it looks
        // like rustc itself doesn't do great in that regard so let's just do
        // the best we can in the meantime.
        let extern_fn = respan(
            quote! {
                #[link(wasm_import_module = "__wbindgen_placeholder__")]
                #[cfg(all(target_arch = "wasm32", not(target_os = "emscripten")))]
                extern "C" {
                    fn #import_name(#(#abi_arguments),*) -> #abi_ret;
                }
                #[cfg(not(all(target_arch = "wasm32", not(target_os = "emscripten"))))]
                unsafe fn #import_name(#(#abi_arguments),*) -> #abi_ret {
                    drop((#(#abi_argument_names),*));
                    panic!("cannot call wasm-bindgen imported functions on \
                            non-wasm targets");
                }
            },
            &self.rust_name,
        );

        let invocation = quote! {
            #(#attrs)*
            #[allow(bad_style)]
            #[doc = #doc_comment]
            #[allow(clippy::all)]
            #vis fn #rust_name(#me #(#arguments),*) #ret {
                #extern_fn

                unsafe {
                    #exn_data
                    let #ret_ident = {
                        let mut __stack = wasm_bindgen::convert::GlobalStack::new();
                        #(#arg_conversions)*
                        #import_name(#(#abi_argument_names),*)
                    };
                    #exceptional_ret
                    #convert_ret
                }
            }
        };

        if let Some(class) = class_ty {
            (quote! {
                impl #class {
                    #invocation
                }
            })
            .to_tokens(tokens);
        } else {
            invocation.to_tokens(tokens);
        }

        Ok(())
    }
}

// See comment above in ast::Export for what's going on here.
struct DescribeImport<'a>(&'a ast::ImportKind);

impl<'a> ToTokens for DescribeImport<'a> {
    fn to_tokens(&self, tokens: &mut TokenStream) {
        let f = match *self.0 {
            ast::ImportKind::Function(ref f) => f,
            ast::ImportKind::Static(_) => return,
            ast::ImportKind::Type(_) => return,
            ast::ImportKind::Enum(_) => return,
        };
        let argtys = f.function.arguments.iter().map(|arg| &arg.ty);
        let nargs = f.function.arguments.len() as u32;
        let inform_ret = match &f.js_ret {
            Some(ref t) => quote! { <#t as WasmDescribe>::describe(); },
            None => quote! { <() as WasmDescribe>::describe(); },
        };

        Descriptor(
            &f.shim,
            quote! {
                inform(FUNCTION);
                inform(0);
                inform(#nargs);
                #(<#argtys as WasmDescribe>::describe();)*
                #inform_ret
            },
        )
        .to_tokens(tokens);
    }
}

impl ToTokens for ast::Enum {
    fn to_tokens(&self, into: &mut TokenStream) {
        let enum_name = &self.name;
        let hole = &self.hole;
        let cast_clauses = self.variants.iter().map(|variant| {
            let variant_name = &variant.name;
            quote! {
                if js == #enum_name::#variant_name as u32 {
                    #enum_name::#variant_name
                }
            }
        });
        (quote! {
            #[allow(clippy::all)]
            impl wasm_bindgen::convert::IntoWasmAbi for #enum_name {
                type Abi = u32;

                #[inline]
                fn into_abi(self, _extra: &mut dyn wasm_bindgen::convert::Stack) -> u32 {
                    self as u32
                }
            }

            #[allow(clippy::all)]
            impl wasm_bindgen::convert::FromWasmAbi for #enum_name {
                type Abi = u32;

                #[inline]
                unsafe fn from_abi(
                    js: u32,
                    _extra: &mut dyn wasm_bindgen::convert::Stack,
                ) -> Self {
                    #(#cast_clauses else)* {
                        wasm_bindgen::throw_str("invalid enum value passed")
                    }
                }
            }

            #[allow(clippy::all)]
            impl wasm_bindgen::convert::OptionFromWasmAbi for #enum_name {
                #[inline]
                fn is_none(val: &u32) -> bool { *val == #hole }
            }

            #[allow(clippy::all)]
            impl wasm_bindgen::convert::OptionIntoWasmAbi for #enum_name {
                #[inline]
                fn none() -> Self::Abi { #hole }
            }

            #[allow(clippy::all)]
            impl wasm_bindgen::describe::WasmDescribe for #enum_name {
                fn describe() {
                    use wasm_bindgen::describe::*;
                    inform(ENUM);
                    inform(#hole);
                }
            }
        })
        .to_tokens(into);
    }
}

impl ToTokens for ast::ImportStatic {
    fn to_tokens(&self, into: &mut TokenStream) {
        let name = &self.rust_name;
        let ty = &self.ty;
        let shim_name = &self.shim;
        let vis = &self.vis;
        (quote! {
            #[allow(bad_style)]
            #[allow(clippy::all)]
            #vis static #name: wasm_bindgen::JsStatic<#ty> = {
                fn init() -> #ty {
                    #[link(wasm_import_module = "__wbindgen_placeholder__")]
                    #[cfg(all(target_arch = "wasm32", not(target_os = "emscripten")))]
                    extern "C" {
                        fn #shim_name() -> <#ty as wasm_bindgen::convert::FromWasmAbi>::Abi;
                    }
                    #[cfg(not(all(target_arch = "wasm32", not(target_os = "emscripten"))))]
                    unsafe fn #shim_name() -> <#ty as wasm_bindgen::convert::FromWasmAbi>::Abi {
                        panic!("cannot access imported statics on non-wasm targets")
                    }

                    unsafe {
                        <#ty as wasm_bindgen::convert::FromWasmAbi>::from_abi(
                            #shim_name(),
                            &mut wasm_bindgen::convert::GlobalStack::new(),
                        )

                    }
                }
                thread_local!(static _VAL: #ty = init(););
                wasm_bindgen::JsStatic {
                    __inner: &_VAL,
                }
            };
        })
        .to_tokens(into);
    }
}

impl ToTokens for ast::Const {
    fn to_tokens(&self, tokens: &mut TokenStream) {
        use crate::ast::ConstValue::*;

        let vis = &self.vis;
        let name = &self.name;
        let ty = &self.ty;

        let value: TokenStream = match self.value {
            BooleanLiteral(false) => quote!(false),
            BooleanLiteral(true) => quote!(true),
            // the actual type is unknown because of typedefs
            // so we cannot use std::fxx::INFINITY
            // but we can use type inference
            FloatLiteral(f) if f.is_infinite() && f.is_sign_positive() => quote!(1.0 / 0.0),
            FloatLiteral(f) if f.is_infinite() && f.is_sign_negative() => quote!(-1.0 / 0.0),
            FloatLiteral(f) if f.is_nan() => quote!(0.0 / 0.0),
            // again no suffix
            // panics on +-inf, nan
            FloatLiteral(f) => {
                let f = Literal::f64_suffixed(f);
                quote!(#f)
            }
            SignedIntegerLiteral(i) => {
                let i = Literal::i64_suffixed(i);
                quote!(#i)
            }
            UnsignedIntegerLiteral(i) => {
                let i = Literal::u64_suffixed(i);
                quote!(#i)
            }
            Null => unimplemented!(),
        };

        let declaration = quote!(#vis const #name: #ty = #value as #ty;);

        if let Some(class) = &self.class {
            (quote! {
                impl #class {
                    #declaration
                }
            })
            .to_tokens(tokens);
        } else {
            declaration.to_tokens(tokens);
        }
    }
}

impl ToTokens for ast::Dictionary {
    fn to_tokens(&self, tokens: &mut TokenStream) {
        let name = &self.name;
        let mut methods = TokenStream::new();
        for field in self.fields.iter() {
            field.to_tokens(&mut methods);
        }
        let required_names = &self
            .fields
            .iter()
            .filter(|f| f.required)
            .map(|f| &f.rust_name)
            .collect::<Vec<_>>();
        let required_types = &self
            .fields
            .iter()
            .filter(|f| f.required)
            .map(|f| &f.ty)
            .collect::<Vec<_>>();
        let required_names2 = required_names;
        let required_names3 = required_names;
        let doc_comment = match &self.doc_comment {
            None => "",
            Some(doc_string) => doc_string,
        };

        let ctor = if self.ctor {
            let doc_comment = match &self.ctor_doc_comment {
                None => "",
                Some(doc_string) => doc_string,
            };
            quote! {
                #[doc = #doc_comment]
                pub fn new(#(#required_names: #required_types),*) -> #name {
                    let mut _ret = #name { obj: ::js_sys::Object::new() };
                    #(_ret.#required_names2(#required_names3);)*
                    return _ret
                }
            }
        } else {
            quote! {}
        };

        let const_name = Ident::new(&format!("_CONST_{}", name), Span::call_site());
        (quote! {
            #[derive(Clone, Debug)]
            #[repr(transparent)]
            #[allow(clippy::all)]
            #[doc = #doc_comment]
            pub struct #name {
                obj: ::js_sys::Object,
            }

            #[allow(clippy::all)]
            impl #name {
                #ctor
                #methods
            }

            #[allow(bad_style)]
            #[allow(clippy::all)]
            const #const_name: () = {
                use js_sys::Object;
                use wasm_bindgen::describe::WasmDescribe;
                use wasm_bindgen::convert::*;
                use wasm_bindgen::{JsValue, JsCast};
                use wasm_bindgen::__rt::core::mem::ManuallyDrop;

                // interop w/ JsValue
                impl From<#name> for JsValue {
                    #[inline]
                    fn from(val: #name) -> JsValue {
                        val.obj.into()
                    }
                }
                impl AsRef<JsValue> for #name {
                    #[inline]
                    fn as_ref(&self) -> &JsValue { self.obj.as_ref() }
                }

                // Boundary conversion impls
                impl WasmDescribe for #name {
                    fn describe() {
                        Object::describe();
                    }
                }

                impl IntoWasmAbi for #name {
                    type Abi = <Object as IntoWasmAbi>::Abi;
                    #[inline]
                    fn into_abi(self, extra: &mut dyn Stack) -> Self::Abi {
                        self.obj.into_abi(extra)
                    }
                }

                impl<'a> IntoWasmAbi for &'a #name {
                    type Abi = <&'a Object as IntoWasmAbi>::Abi;
                    #[inline]
                    fn into_abi(self, extra: &mut dyn Stack) -> Self::Abi {
                        (&self.obj).into_abi(extra)
                    }
                }

                impl FromWasmAbi for #name {
                    type Abi = <Object as FromWasmAbi>::Abi;
                    #[inline]
                    unsafe fn from_abi(abi: Self::Abi, extra: &mut dyn Stack) -> Self {
                        #name { obj: Object::from_abi(abi, extra) }
                    }
                }

                impl OptionIntoWasmAbi for #name {
                    #[inline]
                    fn none() -> Self::Abi { Object::none() }
                }
                impl<'a> OptionIntoWasmAbi for &'a #name {
                    #[inline]
                    fn none() -> Self::Abi { <&'a Object>::none() }
                }
                impl OptionFromWasmAbi for #name {
                    #[inline]
                    fn is_none(abi: &Self::Abi) -> bool { Object::is_none(abi) }
                }

                impl RefFromWasmAbi for #name {
                    type Abi = <Object as RefFromWasmAbi>::Abi;
                    type Anchor = ManuallyDrop<#name>;

                    #[inline]
                    unsafe fn ref_from_abi(js: Self::Abi, extra: &mut dyn Stack) -> Self::Anchor {
                        let tmp = <Object as RefFromWasmAbi>::ref_from_abi(js, extra);
                        ManuallyDrop::new(#name {
                            obj: ManuallyDrop::into_inner(tmp),
                        })
                    }
                }

                impl JsCast for #name {
                    #[inline]
                    fn instanceof(val: &JsValue) -> bool {
                        Object::instanceof(val)
                    }

                    #[inline]
                    fn unchecked_from_js(val: JsValue) -> Self {
                        #name { obj: Object::unchecked_from_js(val) }
                    }

                    #[inline]
                    fn unchecked_from_js_ref(val: &JsValue) -> &Self {
                        unsafe { &*(val as *const JsValue as *const #name) }
                    }
                }
            };
        })
        .to_tokens(tokens);
    }
}

impl ToTokens for ast::DictionaryField {
    fn to_tokens(&self, tokens: &mut TokenStream) {
        let rust_name = &self.rust_name;
        let js_name = &self.js_name;
        let ty = &self.ty;
        let doc_comment = match &self.doc_comment {
            None => "",
            Some(doc_string) => doc_string,
        };
        (quote! {
            #[allow(clippy::all)]
            #[doc = #doc_comment]
            pub fn #rust_name(&mut self, val: #ty) -> &mut Self {
                use wasm_bindgen::JsValue;
                let r = ::js_sys::Reflect::set(
                    self.obj.as_ref(),
                    &JsValue::from(#js_name),
                    &JsValue::from(val),
                );
                debug_assert!(r.is_ok(), "setting properties should never fail on our dictionary objects");
                let _ = r;
                self
            }
        }).to_tokens(tokens);
    }
}

/// Emits the necessary glue tokens for "descriptor", generating an appropriate
/// symbol name as well as attributes around the descriptor function itself.
struct Descriptor<'a, T>(&'a Ident, T);

impl<'a, T: ToTokens> ToTokens for Descriptor<'a, T> {
    fn to_tokens(&self, tokens: &mut TokenStream) {
        // It's possible for the same descriptor to be emitted in two different
        // modules (aka a value imported twice in a crate, each in a separate
        // module). In this case no need to emit duplicate descriptors (which
        // leads to duplicate symbol errors), instead just emit one.
        //
        // It's up to the descriptors themselves to ensure they have unique
        // names for unique items imported, currently done via `ShortHash` and
        // hashing appropriate data into the symbol name.
        lazy_static::lazy_static! {
            static ref DESCRIPTORS_EMITTED: Mutex<HashSet<String>> = Default::default();
        }
        if !DESCRIPTORS_EMITTED
            .lock()
            .unwrap()
            .insert(self.0.to_string())
        {
            return;
        }

        let name = Ident::new(&format!("__wbindgen_describe_{}", self.0), self.0.span());
        let inner = &self.1;
        (quote! {
            #[no_mangle]
            #[allow(non_snake_case)]
            #[doc(hidden)]
            #[cfg(all(target_arch = "wasm32", not(target_os = "emscripten")))]
            #[allow(clippy::all)]
            pub extern "C" fn #name() {
                use wasm_bindgen::describe::*;
                // See definition of `link_mem_intrinsics` for what this is doing
                wasm_bindgen::__rt::link_mem_intrinsics();
                #inner
            }
        })
        .to_tokens(tokens);
    }
}

/// Converts `span` into a stream of tokens, and attempts to ensure that `input`
/// has all the appropriate span information so errors in it point to `span`.
fn respan(input: TokenStream, span: &dyn ToTokens) -> TokenStream {
    let mut first_span = Span::call_site();
    let mut last_span = Span::call_site();
    let mut spans = TokenStream::new();
    span.to_tokens(&mut spans);

    for (i, token) in spans.into_iter().enumerate() {
        if i == 0 {
            first_span = token.span();
        }
        last_span = token.span();
    }

    let mut new_tokens = Vec::new();
    for (i, mut token) in input.into_iter().enumerate() {
        if i == 0 {
            token.set_span(first_span);
        } else {
            token.set_span(last_span);
        }
        new_tokens.push(token);
    }
    new_tokens.into_iter().collect()
}

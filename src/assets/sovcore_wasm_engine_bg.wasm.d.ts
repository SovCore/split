/* tslint:disable */
/* eslint-disable */
export const memory: WebAssembly.Memory;
export const add_recovery_share: (a: number, b: number, c: number) => [number, number, number];
export const alloc_buffer: (a: number) => number;
export const assemble_secret: (a: any) => [number, number, number, number];
export const dealloc_buffer: (a: number, b: number) => void;
export const derive_key: (a: number, b: number, c: number, d: number) => [number, number, number];
export const encrypt_chunk_in_place: (a: number, b: number, c: number, d: number) => [number, number, number];
export const get_memory: () => any;
export const reconstruct_secret: () => [number, number, number];
export const split_secret_secure: (a: number, b: number, c: number, d: number) => [number, number, number];
export const start: () => void;
export const zeroize: () => [number, number, number];
export const __wbindgen_malloc: (a: number, b: number) => number;
export const __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
export const __wbindgen_exn_store: (a: number) => void;
export const __externref_table_alloc: () => number;
export const __wbindgen_externrefs: WebAssembly.Table;
export const __wbindgen_free: (a: number, b: number, c: number) => void;
export const __externref_table_dealloc: (a: number) => void;
export const __wbindgen_start: () => void;

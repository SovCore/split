/* tslint:disable */
/* eslint-disable */

export function add_recovery_share(x: number, y_hex: string): number;

export function alloc_buffer(size: number): number;

export function assemble_secret(shares_js: Array<any>): string;

export function dealloc_buffer(ptr: number, size: number): void;

export function derive_key(entropy_hex: string, salt_b64: string): boolean;

export function encrypt_chunk_in_place(ptr: number, len: number, iv_ptr: number, iv_len: number): number;

export function get_memory(): any;

export function reconstruct_secret(): boolean;

export function split_secret_secure(ptr: number, len: number, k: number, n: number): Array<any>;

export function start(): void;

export function zeroize(): boolean;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly add_recovery_share: (a: number, b: number, c: number) => [number, number, number];
    readonly alloc_buffer: (a: number) => number;
    readonly assemble_secret: (a: any) => [number, number, number, number];
    readonly dealloc_buffer: (a: number, b: number) => void;
    readonly derive_key: (a: number, b: number, c: number, d: number) => [number, number, number];
    readonly encrypt_chunk_in_place: (a: number, b: number, c: number, d: number) => [number, number, number];
    readonly get_memory: () => any;
    readonly reconstruct_secret: () => [number, number, number];
    readonly split_secret_secure: (a: number, b: number, c: number, d: number) => [number, number, number];
    readonly start: () => void;
    readonly zeroize: () => [number, number, number];
    readonly __wbindgen_malloc: (a: number, b: number) => number;
    readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
    readonly __wbindgen_exn_store: (a: number) => void;
    readonly __externref_table_alloc: () => number;
    readonly __wbindgen_externrefs: WebAssembly.Table;
    readonly __wbindgen_free: (a: number, b: number, c: number) => void;
    readonly __externref_table_dealloc: (a: number) => void;
    readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
 * Instantiates the given `module`, which can either be bytes or
 * a precompiled `WebAssembly.Module`.
 *
 * @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
 *
 * @returns {InitOutput}
 */
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
 * If `module_or_path` is {RequestInfo} or {URL}, makes a request and
 * for everything else, calls `WebAssembly.instantiate` directly.
 *
 * @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
 *
 * @returns {Promise<InitOutput>}
 */
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;

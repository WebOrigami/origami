/**
 * Origami is a JavaScript project, but we use TypeScript as an internal tool to
 * confirm our code is type safe.
 */

import AsyncMap from "./src/drivers/AsyncMap.js";

// Re-export all exports from main.js
export * from "./main.js";

export type Invocable = Function | Maplike | Unpackable;

export type KeyFn = (key: any, map: SyncOrAsyncMap) => any;

/**
 * An object with a non-trivial `toString` method.
 *
 * TODO: We want to deliberately exclude the base `Object` class because its
 * `toString` method return non-useful strings like `[object Object]`. How can
 * we declare that in TypeScript?
 */
export type HasString = {
  toString(): string;
};

export type MapExtensionOptions = {
  deep?: boolean;
  description?: string;
  extension?: string;
  value?: ValueKeyFn;
};

export type Maplike =
  any[] |
  Iterator<any> |
  Function | 
  SyncOrAsyncMap |
  PlainObject | 
  Set<any>;

export type MapOptions = {
  deep?: boolean;
  description?: string;
  extension?: string;
  inverseKey?: KeyFn;
  key?: ValueKeyFn;
  keyNeedsSourceValue?: boolean;
  needsSourceValue?: boolean;
  value?: ValueKeyFn;
};

export interface SyncTree<K, V> extends Map<K, V> {
  apply?(source: Map<K, V>): SyncTree<K, V>;
  child(key: any): SyncTree<K, V>;
  manifest?(): Map<string, string>;
  parent: SyncOrAsyncMap | null;
  trailingSlashKeys: boolean;
}

export interface AsyncTree<K, V> extends AsyncMap {
  apply?(source: SyncOrAsyncMap): Promise<AsyncTree<K, V>>;
  child(key: any): Promise<AsyncTree<K, V>>;
  manifest?(): Promise<Map<string, any>>;
  replaceWith?(source: SyncOrAsyncMap): Promise<AsyncTree<K, V>>;
  parent: SyncOrAsyncMap | null;
  trailingSlashKeys: boolean;
}

/**
 * A packed value is one that can be written to a file via fs.writeFile or into
 * an HTTP response via response.write, or readily converted to such a form.
 */
export type Packed = (ArrayBuffer | Buffer | ReadableStream | string | String | TypedArray) & {
  parent?: SyncOrAsyncMap|null;
  unpack?(): Promise<any>;
};

export type PlainObject = {
  [key: string]: any;
};

export type ReduceFn = (mapped: Map<any, any>, source: SyncOrAsyncMap) => any | Promise<any>;

export type Stringlike = string | HasString;

export type SyncOrAsyncMap = Map<any, any> | AsyncMap;

export type TypedArray =
  Float32Array |
  Float64Array |
  Int8Array |
  Int16Array |
  Int32Array |
  Uint8Array |
  Uint8ClampedArray |
  Uint16Array |
  Uint32Array;

export type Unpackable = {
  unpack(): Promise<any>
};

/**
 * A function that converts a value from a persistent form into a live value.
 */
export type UnpackFunction = (input: Packed, options?: any) => any;

export type ValueKeyFn = (value: any, key: any, map: SyncOrAsyncMap) => any;

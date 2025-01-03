import type { AsyncTree } from "@weborigami/types";

export * from "./main.js";

export type KeyFn = (key: any, innerTree: AsyncTree) => any;

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

/**
 * A packed value is one that can be written to a file via fs.writeFile or into
 * an HTTP response via response.write, or readily converted to such a form.
 */
export type Packed = (ArrayBuffer | Buffer | ReadableStream | string | String | TypedArray) & {
  unpack?(): Promise<any>;
};

export type PlainObject = {
  [key: string]: any;
};

export type ReduceFn = (values: any[], keys: any[], tree: AsyncTree) => Promise<any>;

export type StringLike = string | HasString;

export type NativeTreelike = 
  any[] |
  AsyncTree |
  Function | 
  Map<any, any> | 
  PlainObject | 
  Set<any>;

export type Treelike =
  NativeTreelike |
  Unpackable<NativeTreelike>;

export type TreeMapOptions = {
  deep?: boolean;
  description?: string;
  needsSourceValue?: boolean;
  inverseKey?: KeyFn;
  key?: KeyFn;
  value?: ValueKeyFn;
};
  
export type TreeTransform = (treelike: Treelike) => AsyncTree;

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

export type Unpackable<T> = {
  unpack(): Promise<T>
};

export type ValueKeyFn = (value: any, key: any, innerTree: AsyncTree) => any;

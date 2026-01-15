/**
 * Origami is a JavaScript project, but we use TypeScript as an internal tool to
 * confirm our code is type safe.
 */

// Re-export all exports from main.js
export * from "./main.js";

/**
 * A class constructor is an object with a `new` method that returns an
 * instance of the indicated type.
 */
export type Constructor<T> = new (...args: any[]) => T;

export interface JsonObject {
  [key: string]: JsonValue;
}

export type JsonValue = boolean | number | string | Date | JsonObject | JsonValue[] | null;

export type TypedArray = Int8Array | Uint8Array | Uint8ClampedArray | Int16Array | Uint16Array | Int32Array | Uint32Array | Float32Array | Float64Array | BigInt64Array | BigUint64Array;

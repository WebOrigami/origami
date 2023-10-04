/**
 * Graph Origami is a JavaScript project, but we use TypeScript as an internal
 * tool to confirm our code is type safe.
 */

import { Graphable, HasContents } from "@graphorigami/core";
import { AsyncDictionary } from "@graphorigami/types";

/**
 * A class constructor is an object with a `new` method that returns an
 * instance of the indicated type.
 */
export type Constructor<T> = new (...args: any[]) => T;

/**
 * A function that can convert a string-like input value into some live object.
 */
export type Deserializer = (
  container: AsyncDictionary | null,
  input: StringLike,
  key?: any) => any;

/**
 * A file loader function
 */
export type FileLoaderFunction = (
  container: AsyncDictionary | null,
  input: StringLike,
  key?: any) => StringLike & HasContents;

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

export type Invocable = Function | HasContents | Graphable;

export interface JsonObject {
  [key: string]: JsonValue;
}

export type JsonValue = boolean | number | string | Date | JsonObject | JsonValue[] | null;

/**
 * A mixin is a function that takes an existing class and returns a new class.
 *
 * The use of a generic type `T` here is a way of indicating that the members of
 * the supplied base class automatically pass through to the result. That
 * ensures the use of the mixin doesn't accidentally hide members of the class
 * passed to the mixin.
 */
export type Mixin<MixinMembers> = <T>(
  Base: Constructor<T>
) => Constructor<T & MixinMembers>;

/**
 * TODO
 */
export type Serializable = Buffer | TypedArray;

export type StringLike = string | HasString;

export type TypedArray = Int8Array | Uint8Array | Uint8ClampedArray | Int16Array | Uint16Array | Int32Array | Uint32Array | Float32Array | Float64Array | BigInt64Array | BigUint64Array;
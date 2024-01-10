import { AsyncTree } from "@weborigami/types";
import { StringLike } from "../async-tree/index.js";

export * from "./main.js";

/**
 * A class constructor is an object with a `new` method that returns an
 * instance of the indicated type.
 */
export type Constructor<T> = new (...args: any[]) => T;

/**
 * A function that can convert a string-like input value into some live object.
 */
export type FileUnpackFunction = (
  input: StringLike,
  options?: {
    attachedData?: any,
    key?: any,
    parent?: AsyncTree | null
  }
) => any;

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

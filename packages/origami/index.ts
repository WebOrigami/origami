/**
 * Graph Origami is a JavaScript project, but we use TypeScript as an internal
 * tool to confirm our code is type safe.
 */

import { Graphable, HasContents, PlainObject } from "@graphorigami/core";
import { AsyncDictionary } from "@graphorigami/types";

/**
 * A class constructor is an object with a `new` method that returns an
 * instance of the indicated type.
 */
export type Constructor<T> = new (...args: any[]) => T;

/**
 * Declaration for a file loader function.
 */
export type FileLoaderFunction = (
  container: AsyncDictionary | null,
  input: StringLike,
  key?: any) => String & HasContents;

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

export type JsonValue = Primitive | PlainObject | Array<any>;

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

export type Primitive = number | string | boolean | undefined | null;

export type StringLike = string | HasString;

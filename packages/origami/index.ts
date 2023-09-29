/*
 * Graph Origami is a JavaScript project, but we use TypeScript as an internal
 * tool to confirm our code is type safe.
 */

import { Graphable, HasContents } from "@graphorigami/core";

/*
 * A class constructor is an object with a `new` method that returns an
 * instance of the indicated type.
 */
export type Constructor<T> = new (...args: any[]) => T;


export interface HasString {
  toString(): string;
}

export type StringLike = string | HasString;

/*
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

export type Invocable = Function | HasContents | Graphable;

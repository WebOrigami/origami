import { Packed } from "@weborigami/async-tree";

export * from "./main.js";

/**
 * A chunk of compiled Origami code. This is just an Array with an additional
 * `source` property.
 */
interface ArrayWithSource extends Array<any> {
  source?: Source;
}
export type Code = ArrayWithSource;

/**
 * A class constructor is an object with a `new` method that returns an
 * instance of the indicated type.
 */
export type Constructor<T> = new (...args: any[]) => T;

/**
 * A structure associating a media type and an unpack function with a given file
 * extension.
 */
export type ExtensionHandler = {
  mediaType?: string;
  unpack?: UnpackFunction;
}

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
 * Source code representation used by the parser.
*/
export type Source = {
  name: string;
  text: string;
  url: URL;  
}

/**
 * A function that converts a value from a persistent form into a live value.
 */
export type UnpackFunction = (input: Packed, options?: any) => any;

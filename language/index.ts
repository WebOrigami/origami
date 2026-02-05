/**
 * Origami is a JavaScript project, but we use TypeScript as an internal tool to
 * confirm our code is type safe.
 */

import { SyncOrAsyncMap, UnpackFunction } from "@weborigami/async-tree";

// Re-export all exports from main.js
export * from "./main.js";

/**
 * Code annotated to track the original source that produced the code. If the
 * code is an array, it must have a `location` property.
 */
export type AnnotatedCodeItem<T = any> = T extends any[] ? never : T;
export type AnnotatedCode = (AnnotatedCode | AnnotatedCodeItem)[] & {
  location: CodeLocation
  source?: string;
};

/**
 * A chunk of compiled Origami code. This is just an array.
 */
export type Code = Array<any>;

/**
 * The context in which code is executed, including the code itself and the
 * runtime state, used for reporting errors and warnings.
 */
export type CodeContext = {
  code: Code;
  state: RuntimeState;
};

export type CodeLocation = {
  end: Position;
  source: Source;
  start: Position;
};

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

export type Position = {
  column: number;
  line: number;
  offset: number;
}

export type RuntimeState = {
  // Global variables that were used when compiling the code. These aren't used
  // by the code itself, but help generate meaningful error messages.
  globals?: any;
  
  // The object to which this code is attached
  object?: any;
  
  // The container (e.g., file system folder) that holds the code
  parent?: SyncOrAsyncMap | null;

  // The current stack of function parameter assignments
  stack?: Array<Record<string, any>>;
}

/**
 * Source code representation used by the parser.
 */
export type Source = {
  name?: string;
  text: string;
  url?: URL;
}

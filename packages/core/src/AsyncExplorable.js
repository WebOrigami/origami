import { asyncGet, asyncKeys } from "@explorablegraph/symbols";
import asyncExplorableObject from "./asyncExplorableObject.js";
import * as builtIns from "./builtIns.js";

// Use function syntax to define constructor so that we can support calling the
// constructor directly without `new` as a means of implicit conversion of
// objects to exfns. The TypeScript handling here needs tightening.

// @ts-ignore
export default class AsyncExplorable {
  constructor(obj) {
    if (obj instanceof AsyncExplorable) {
      // Object is already explorable; return as is.
      return obj;
    } else if (builtIns.isPlainObject(obj)) {
      return asyncExplorableObject(obj);
    }
  }

  /**
   * Default `[asyncKeys]` implementation returns an iterator for an empty list.
   *
   * @returns {AsyncGenerator<any, any, any>}
   */
  async *[asyncKeys]() {
    yield* [];
  }

  // Default `[asyncGet]` implementation returns undefined for any key.
  async [asyncGet](key) {}
}

// We define `obj instanceof ArrayExplorable` for any object that has the async
// exfn symbols.
//
// This can lead to cases where someone creates their own exfn using symbols and
// not the AsyncExplorable constructor, but is surprised to see that their exfn
// returns true for `instanceof AsyncExplorable`. However, since AsyncExplorable
// defines no statis or instance members other than the symbols and this
// `instanceof` check, such a check is effectively always true by definition.
// There is no ArrayExplorable.foo member such that an object would pass the
// `instanceof` test but not have access to the foo method.
//
// Relatedly, defining a class as a function in the way above runs into issues
// when defining subclasses of subclasses -- they will fail to pass an
// `instanceof` test. By defining `hasInstance` here, we can also handle that
// edge case.
Object.defineProperty(AsyncExplorable, Symbol.hasInstance, {
  value: (obj) => obj && obj[asyncGet] && obj[asyncKeys],
});

import { isUnpackable, scope as scopeFn, Tree } from "@weborigami/async-tree";
import helpRegistry from "../common/helpRegistry.js";
import assertTreeIsDefined from "../misc/assertTreeIsDefined.js";

/**
 * Find the indicated class constructor in scope, then return a function which
 * invokes it with `new`.
 *
 * This can also take a single argument that is a class.
 *
 * @this {import("@weborigami/types").AsyncTree|null}
 * @param  {...any} keys
 */
export default async function instantiate(...keys) {
  assertTreeIsDefined(this, "new:");
  let constructor;
  const scope = this ? scopeFn(this) : null;
  if (
    keys.length === 1 &&
    (typeof keys[0] === "object" || typeof keys[0] === "function")
  ) {
    constructor = keys[0];
  } else if (scope) {
    constructor = await Tree.traverseOrThrow(scope, ...keys);
  } else {
    throw new TypeError(`new: The scope isn't defined.`);
  }
  if (isUnpackable(constructor)) {
    constructor = await constructor.unpack();
  }
  // Origami may pass `undefined` as the first argument to the constructor. We
  // don't pass that along, because constructors like `Date` don't like it.
  return (...args) => {
    const object =
      args.length === 1 && args[0] === undefined
        ? new constructor()
        : new constructor(...args);
    if (Tree.isAsyncTree(object)) {
      object.parent = scope;
    }
    return object;
  };
}

helpRegistry.set("new:", "Create instances of JavaScript classes");

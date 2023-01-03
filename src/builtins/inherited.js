import Scope from "../common/Scope.js";

/**
 * Return the inherited value (if any) for the indicated key.
 *
 * @param {any} key
 * @this {Explorable}
 */
export default async function inherited(key) {
  const parent = /** @type {any} */ (this).parent;
  if (!parent) {
    return undefined;
  }
  const scopeGraphs = parent.graphs ?? parent;
  const newScope = new Scope(...scopeGraphs.slice(1));
  return newScope.get(key);
}

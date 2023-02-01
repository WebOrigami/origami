import Scope from "../common/Scope.js";

/**
 * Return the inherited value (if any) for the indicated key.
 *
 * @param {any} key
 * @this {Explorable}
 */
export default async function inherited(key) {
  const scope = this;
  const scopeGraphs = /** @type {any} */ (scope).graphs ?? scope;
  const inheritedScope = new Scope(...scopeGraphs.slice(1));
  return inheritedScope.get(key);
}

inherited.usage = `… <key>\tThe value of the key in the graph's inherited scope`;
inherited.documentation = "https://graphorigami.org/cli/builtins.html#…";

import MapExtensionsTree from "../../common/MapExtensionsTree.js";
import MapValuesTree from "../../common/MapValuesTree.js";
import InheritScopeTransform from "../../framework/InheritScopeTransform.js";
import assertScopeIsDefined from "../../language/assertScopeIsDefined.js";

/**
 * Map the top-level values of a tree with a map function.
 *
 * @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary
 * @typedef {import("@graphorigami/core").Treelike} Treelike
 * @typedef {import("@graphorigami/core").PlainObject} PlainObject
 * @typedef {import("../../..").Invocable} Invocable
 *
 * @this {AsyncDictionary|null}
 * @param {Treelike} treelike
 * @param {Invocable} mapFn
 * @param {PlainObject} options
 */
export default function map(treelike, mapFn, options = {}) {
  assertScopeIsDefined(this);
  if (!treelike) {
    return undefined;
  }

  /** @type {any} */
  const TreeClass =
    options.extension === undefined ? MapValuesTree : MapExtensionsTree;
  const mappedTree = new (InheritScopeTransform(TreeClass))(
    treelike,
    mapFn,
    options
  );
  return mappedTree;
}

map.usage = `map <tree, fn>\tMap the top-level values in a tree`;
map.documentation = "https://graphorigami.org/cli/builtins.html#map";

import { Tree } from "@weborigami/async-tree";
import helpRegistry from "../common/helpRegistry.js";
export { default as addNextPrevious } from "./addNextPrevious.js";
export { default as cache } from "./cache.js";
export { default as calendar } from "./calendar.js";
export { default as clean } from "./clean.js";
export { default as concat } from "./concat.js";
export { default as copy } from "./copy.js";
export { default as deepMap } from "./deepMap.js";
export { default as deepMerge } from "./deepMerge.js";
export { default as deepReverse } from "./deepReverse.js";
export { default as deepTake } from "./deepTake.js";
export { default as deepValues } from "./deepValues.js";
export { default as defineds } from "./defineds.js";
export { default as filter } from "./filter.js";
export { default as first } from "./first.js";
export { default as fromFn } from "./fromFn.js";
export { default as globs } from "./globs.js";
export { default as group } from "./group.js";
export { default as inners } from "./inners.js";
export { default as keys } from "./keys.js";
export { default as length } from "./length.js";
export { default as map } from "./map.js";
export { default as match } from "./match.js";
export { default as merge } from "./merge.js";
export { default as paginate } from "./paginate.js";
export { default as parent } from "./parent.js";
export { default as plain } from "./plain.js";
export { default as reverse } from "./reverse.js";
export { default as setDeep } from "./setDeep.js";
export { default as shuffle } from "./shuffle.js";
export { default as sort } from "./sort.js";
export { default as take } from "./take.js";
export { default as values } from "./values.js";

export const assign = Tree.assign;
export const entries = Tree.entries;
export const forEach = Tree.forEach;
export const from = Tree.from;
export const has = Tree.has;
export const isAsyncMutableTree = Tree.isAsyncMutableTree;
export const isAsyncTree = Tree.isAsyncTree;
export const isTraversable = Tree.isTraversable;
export const isTreelike = Tree.isTreelike;
export const mapReduce = Tree.mapReduce;
export const paths = Tree.paths;
export const remove = Tree.remove;
export const toFunction = Tree.toFunction;
export const traverse = Tree.traverse;
export const traverseOrThrow = Tree.traverseOrThrow;
export const traversePath = Tree.traversePath;

helpRegistry.set(
  "tree:assign",
  "(target, source) - Apply key/values from source to target"
);
helpRegistry.set("tree:entries", "(tree) - The tree's [key, value] pairs");
helpRegistry.set("tree:forEach", "(tree, fn) - Apply fn to each (value, key)");
helpRegistry.set(
  "tree:from",
  "(object, options) - Create a tree from an object"
);
helpRegistry.set("tree:has", "(tree, key) - True if key exists in tree");
helpRegistry.set(
  "tree:isAsyncMutableTree",
  "(object) - True if object is an async mutable tree"
);
helpRegistry.set(
  "tree:isAsyncTree",
  "(object) - True if object is an async tree"
);
helpRegistry.set(
  "tree:isTraversable",
  "(object) - True if object is traversable"
);
helpRegistry.set(
  "tree:isTreelike",
  "(object) - True if object can be coerced to a tree"
);
helpRegistry.set(
  "tree:mapReduce",
  "(tree, valueFn, reduceFn) - Map values and reduce them"
);
helpRegistry.set(
  "tree:paths",
  "(tree) - Slash-separated paths for the tree's values"
);
helpRegistry.set(
  "tree:remove",
  "(tree, key) - Remove the value for the key from tree"
);
helpRegistry.set(
  "tree:toFunction",
  "(tree) - The tree's get() method as a function"
);
helpRegistry.set(
  "tree:traverse",
  "(tree, ...keys) - Return the value at the path of keys"
);
helpRegistry.set(
  "tree:traverseOrThrow",
  "(tree, ...keys) - Return the value at the path of keys or throw"
);
helpRegistry.set(
  "tree:traversePath",
  "(tree, path) - Traverse a slash-separated path"
);

helpRegistry.set("tree:", "Work with trees");

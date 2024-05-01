import { KeyFn, Treelike, TreeTransform, ValueKeyFn } from "@weborigami/async-tree";
import { AsyncTree } from "@weborigami/types";

type TreeMapOptions = {
  deep?: boolean;
  description?: string;
  extensions?: string;
  inverseKey?: KeyFn;
  key?: ValueKeyFn;
  needsSourceValue?: boolean;
  value?: ValueKeyFn;
};

export default function treeMap(options: ValueKeyFn | TreeMapOptions): TreeTransform;
export default function treeMap(treelike: Treelike, options: ValueKeyFn | TreeMapOptions): AsyncTree;
export default function treeMap(param1: Treelike | ValueKeyFn | TreeMapOptions, param2?: ValueKeyFn | TreeMapOptions): AsyncTree | TreeTransform;

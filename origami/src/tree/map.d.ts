import { TreeMapOptions as AsyncTreeMapOptions, Treelike, TreeTransform, ValueKeyFn } from "@weborigami/async-tree";
import { AsyncTree } from "@weborigami/types";

/* Add more properties to TreeMapOptions */
type TreeMapOptions = AsyncTreeMapOptions &{
  description?: string;
  extension?: string;
  needsSourceValue?: boolean;
};

export default function treeMap(options: ValueKeyFn | TreeMapOptions): TreeTransform;
export default function treeMap(treelike: Treelike, options: ValueKeyFn | TreeMapOptions): AsyncTree;
export default function treeMap(param1: Treelike | ValueKeyFn | TreeMapOptions, param2?: ValueKeyFn | TreeMapOptions): AsyncTree | TreeTransform;

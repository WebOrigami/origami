import { TreeMapOptions as AsyncTreeMapOptions, Treelike, ValueKeyFn } from "@weborigami/async-tree";
import { AsyncTree } from "@weborigami/types";

/* Add more properties to TreeMapOptions */
type TreeMapOptions = AsyncTreeMapOptions &{
  description?: string;
  extension?: string;
  needsSourceValue?: boolean;
};

export default function treeMap(treelike: Treelike, options: ValueKeyFn | TreeMapOptions): AsyncTree;

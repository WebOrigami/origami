import { KeyFn, Treelike, ValueKeyFn } from "@weborigami/async-tree";
import { AsyncTree } from "@weborigami/types";
import { TreelikeTransform } from "../../index.ts";

type TreeMapOptions = {
  deep?: boolean;
  description?: string;
  extensions?: string;
  inverseKeyMap?: KeyFn;
  keyMap?: ValueKeyFn;
  valueMap?: ValueKeyFn;
};

export default function treeMap(valueMap: ValueKeyFn): TreelikeTransform;
export default function treeMap(options: TreeMapOptions): TreelikeTransform;
export default function treeMap(treelike: Treelike, valueMap: ValueKeyFn): AsyncTree;
export default function treeMap(treelike: Treelike, options: TreeMapOptions): AsyncTree;

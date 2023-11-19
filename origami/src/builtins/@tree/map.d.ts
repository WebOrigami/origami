import { KeyFn, Treelike, ValueKeyFn } from "@graphorigami/async-tree";
import { AsyncTree } from "@graphorigami/types";
import { TreelikeTransform } from "../../../index.ts";

type TreeMapOptions = {
  deep?: boolean;
  description?: string;
  extensions?: string;
  inverseKeyMap?: KeyFn;
  keyMap?: ValueKeyFn;
  keyName?: string;
  valueMap?: ValueKeyFn;
  valueName?: string
};

export default function treeMap(valueMap: ValueKeyFn): TreelikeTransform;
export default function treeMap(options: TreeMapOptions): TreelikeTransform;
export default function treeMap(treelike: Treelike, valueMap: ValueKeyFn): AsyncTree;
export default function treeMap(treelike: Treelike, options: TreeMapOptions): AsyncTree;

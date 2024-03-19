import { KeyFn, Treelike, ValueKeyFn } from "@weborigami/async-tree";
import { AsyncTree } from "@weborigami/types";
import { TreelikeTransform } from "../../index.ts";

type TreeMapOptions = {
  deep?: boolean;
  description?: string;
  extensions?: string;
  inverseKey?: KeyFn;
  key?: ValueKeyFn;
  value?: ValueKeyFn;
};

export default function treeMap(value: ValueKeyFn): TreelikeTransform;
export default function treeMap(options: TreeMapOptions): TreelikeTransform;
export default function treeMap(treelike: Treelike, value: ValueKeyFn): AsyncTree;
export default function treeMap(treelike: Treelike, options: TreeMapOptions): AsyncTree;

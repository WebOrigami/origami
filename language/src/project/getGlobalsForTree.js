import { Tree } from "@weborigami/async-tree";

export default function getGlobalsForTree(map) {
  return map ? Tree.root(map).globals : null;
}

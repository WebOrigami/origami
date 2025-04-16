import { scope, Tree } from "@weborigami/async-tree";

export default async function go(...keys) {
  return Tree.traverse(scope(this), ...keys);
}

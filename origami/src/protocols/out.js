import { scope, Tree } from "@weborigami/async-tree";

export default async function out(rootKey) {
  const root = await scope(this).get(rootKey);
  return async function (...keys) {
    const lastKey = keys.pop();
    const target = keys.length > 0 ? await Tree.traverse(root, ...keys) : root;
    if (!target) {
      throw new Error(`Cannot find target`);
    }
    if (!target.set) {
      throw new Error("Cannot use out: in a read-only tree");
    }
    return async function (value) {
      await target.set(lastKey, value);
    };
  };
}

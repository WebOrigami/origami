import { Tree } from "@weborigami/async-tree";

export default function assertTreeIsDefined(tree, methodName) {
  const isValid = tree === null || Tree.isAsyncTree(tree);
  if (!isValid) {
    throw new Error(
      `${methodName} must be called with a tree target. If you don't want to pass a tree, invoke with: ${methodName}.call(null)`
    );
  }
}

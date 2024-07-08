export default function assertTreeIsDefined(tree, methodName) {
  if (tree === undefined) {
    throw new Error(
      `${methodName} must be called with a tree target. If you don't want to pass a tree, invoke with: ${methodName}.call(null)`
    );
  }
}

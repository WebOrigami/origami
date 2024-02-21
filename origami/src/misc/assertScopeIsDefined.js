export default function assertScopeIsDefined(scope) {
  if (scope === undefined) {
    throw new Error(
      "Tree methods must be called with a scope. If you don't want to pass a scope, invoke with: <methodName>.call(null)"
    );
  }
}

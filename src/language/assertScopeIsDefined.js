export default function assertScopeIsDefined(scope) {
  if (scope === undefined) {
    throw new Error(
      "Graph methods must be called a scope. If you don't want to pass a scope, invoke with: <methodName>.call(null)"
    );
  }
}

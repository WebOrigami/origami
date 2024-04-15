export default function assertScopeIsDefined(scope, methodName) {
  if (scope === undefined) {
    throw new Error(
      `${methodName} must be called with a scope. If you don't want to pass a scope, invoke with: ${methodName}.call(null)`
    );
  }
}

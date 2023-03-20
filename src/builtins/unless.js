import ExplorableGraph from "../core/ExplorableGraph.js";
import assertScopeIsDefined from "../language/assertScopeIsDefined.js";

/**
 * @this {Explorable}
 */
export default async function unless(value, falseResult) {
  assertScopeIsDefined(this);
  let condition = await value;
  if (ExplorableGraph.isExplorable(condition)) {
    const keys = Array.from(await condition.keys());
    condition = keys.length > 0;
  }

  let result = condition ? undefined : falseResult;
  if (typeof result === "function") {
    result = await result.call(this);
  }
  return result;
}

unless.usage = `unless <value>, <result>]\tReturns the result if value is falsy`;
unless.documentation = "https://graphorigami.org/cli/builtins.html#unless";

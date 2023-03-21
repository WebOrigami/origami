import ExplorableGraph from "../core/ExplorableGraph.js";
import assertScopeIsDefined from "../language/assertScopeIsDefined.js";

/**
 * @this {Explorable}
 * @param {any} value
 * @param {any} trueResult
 * @param {any} [falseResult]
 */
export default async function ifCommand(value, trueResult, falseResult) {
  assertScopeIsDefined(this);
  let condition = await value;
  if (ExplorableGraph.isExplorable(condition)) {
    const keys = Array.from(await condition.keys());
    condition = keys.length > 0;
  }

  let result = condition ? trueResult : falseResult;
  if (typeof result === "function") {
    result = await result.call(this);
  }
  return result;
}

ifCommand.usage = `@if <value>, <true>, [<false>]\tThe true or false result based on the value`;
ifCommand.documentation = "https://graphorigami.org/cli/builtins.html#@if";

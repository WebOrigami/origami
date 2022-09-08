import ExplorableGraph from "../core/ExplorableGraph.js";

/**
 * @this {Explorable}
 */
export default async function unless(value, falseResult) {
  let condition = await value;
  if (ExplorableGraph.isExplorable(condition)) {
    const keys = await ExplorableGraph.keys(condition);
    condition = keys.length > 0;
  }

  let result = condition ? undefined : falseResult;
  if (typeof result === "function") {
    result = await result.call(this);
  }
  return result;
}

unless.usage = `unless <value>, <result>]\tReturns the result if value is falsy`;
unless.documentation = "https://explorablegraph.org/cli/builtins.html#unless";

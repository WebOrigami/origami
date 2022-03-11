import ExplorableGraph from "../core/ExplorableGraph.js";

export default async function ifCommand(value, trueResult, falseResult) {
  let condition = await value;
  if (ExplorableGraph.isExplorable(condition)) {
    const keys = await ExplorableGraph.keys(condition);
    condition = keys.length > 0;
  }

  let result = condition ? trueResult : falseResult;
  if (typeof result === "function") {
    result = await result();
  }
  return result;
}

ifCommand.usage = `if <value>, <true> [, <false>]\tReturns the true result if true, the false result otherwise`;
ifCommand.documentation = "https://explorablegraph.org/cli/builtins.html#if";

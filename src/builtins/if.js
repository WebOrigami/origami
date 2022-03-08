export default function ifCommand(value, trueResult, falseResult) {
  let result = value ? trueResult : falseResult;
  if (typeof result === "function") {
    result = result();
  }
  return result;
}

ifCommand.usage = `if <value>, <true> [, <false>]\tReturns the true result if true, the false result otherwise`;
ifCommand.documentation = "https://explorablegraph.org/pika/builtins.html#if";

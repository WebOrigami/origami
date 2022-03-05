export default function ifCommand(value, trueResult, falseResult) {
  return value ? trueResult : falseResult;
}

ifCommand.usage = `if <value>, <true> [, <false>]\tReturns the true result if true, the false result otherwise`;
ifCommand.documentation = "https://explorablegraph.org/pika/builtins.html#if";

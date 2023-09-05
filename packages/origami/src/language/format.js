import * as ops from "../../src/language/ops.js";

export default function format(code, implicitFunctionCall = false) {
  if (code === null) {
    return "";
  } else if (typeof code === "string") {
    return `'${code}'`;
  } else if (typeof code === "symbol") {
    return `«${code.description}»`;
  } else if (!(code instanceof Array)) {
    return code;
  } else {
    switch (code[0]) {
      case ops.assign:
        return formatAssignment(code);

      case ops.concat:
        return formatTemplate(code);

      case ops.graph:
        return formatGraph(code);

      case ops.lambda:
        return formatLambda(code);

      case ops.object:
        return formatObject(code);

      case ops.scope:
        return formatScopeTraversal(code, implicitFunctionCall);

      case ops.thisKey:
        return formatThisKey(code);

      default:
        return code[0] instanceof Array
          ? formatIndirectFunctionCall(code)
          : "** Unknown Origami code **";
    }
  }
}

function formatArgument(arg) {
  return typeof arg === "string" ? `'${arg}'` : format(arg);
}

function formatArguments(args) {
  const formatted = args.map((arg) => formatArgument(arg));
  return formatted.join(", ");
}

function formatAssignment(code) {
  const [_, declaration, expression] = code;
  return `${declaration} = ${format(expression)}`;
}

function formatGraph(code) {
  const [_, properties] = code;
  const formatted = Object.entries(properties).map(([key, value]) => {
    const rhs =
      typeof value === "function" && value.code !== undefined
        ? value.code
        : value;
    return `${key} = ${format(rhs)}`;
  });
  return formatted ? `{ ${formatted.join(", ")} }` : "{}";
}

function formatIndirectFunctionCall(code) {
  return `${format(code[0])}(${formatArguments(code.slice(1))})`;
}

function formatObject(code) {
  const [_, properties] = code;
  const formatted = Object.entries(properties).map(([key, value]) => {
    return value === null ? key : `${key}: ${format(value)}`;
  });
  return formatted ? `{ ${formatted.join(", ")} }` : "{}";
}

function formatName(name) {
  return typeof name === "string"
    ? name
    : name instanceof Array
    ? `(${format(name)})`
    : format(name);
}

function formatLambda(code) {
  return `=${format(code[1])}`;
}

function formatScopeTraversal(code, implicitFunctionCall = false) {
  const operands = code.slice(1);
  const name = formatName(operands[0]);
  if (operands.length === 1) {
    return implicitFunctionCall ? `${name}()` : name;
  }

  const allStrings = operands.every((operand) => typeof operand === "string");
  if (allStrings) {
    // Use graph traversal syntax.
    return operands.join("/");
  }
  // Use function invocation syntax.
  const args = formatArguments(operands.slice(1));
  return `${name}(${args})`;
}

function formatTemplate(code) {
  const args = code.slice(1);
  const formatted = args.map((arg) =>
    typeof arg === "string" ? arg : `{{${format(arg)}}}`
  );
  return `\`${formatted.join("")}\``;
}

function formatThisKey(code) {
  return "this";
}

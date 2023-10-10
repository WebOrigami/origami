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
          ? formatFunctionCall(code)
          : "** Unknown Origami code **";
    }
  }
}

function formatArgument(arg) {
  return typeof arg === "string" ? `'${arg}'` : format(arg);
}

function formatArguments(args) {
  const allStrings = args.every((arg) => typeof arg === "string");
  return allStrings
    ? // Use graph traversal syntax.
      formatSlashPath(args)
    : // Use function invocation syntax.
      formatArgumentsList(args);
}

function formatArgumentsList(args) {
  const formatted = args.map((arg) => formatArgument(arg));
  const list = formatted.join(", ");
  return `(${list})`;
}

function formatAssignment(code) {
  const [_, declaration, expression] = code;
  return `${declaration} = ${format(expression)}`;
}

function formatFunctionCall(code) {
  const [fn, ...args] = code;
  let formattedFn = format(fn);
  if (formattedFn.includes("/") || formattedFn.includes("(")) {
    formattedFn = `(${formattedFn})`;
  }
  return `${formattedFn}${formatArguments(args)}`;
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

  const args = formatArguments(operands.slice(1));
  return `${name}${args}`;
}

function formatSlashPath(args) {
  return "/" + args.join("/");
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

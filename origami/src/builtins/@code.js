import { symbols } from "@weborigami/language";
import getTreeArgument from "../misc/getTreeArgument.js";

/**
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 *
 * @this {AsyncTree|null}
 * @param {any} value
 */
export default async function code(value) {
  if (value === undefined) {
    value = await getTreeArgument(this, arguments, value, "@clean");
  }
  if (value === undefined) {
    return undefined;
  }
  const code = value.code ?? value[symbols.codeSymbol];
  return code ? functionNames(code) : undefined;
}

function functionNames(code) {
  if (!Array.isArray(code)) {
    return code;
  }
  let [head, ...tail] = code;
  if (typeof head === "function") {
    const text = head.toString();
    if (text.startsWith("«ops.")) {
      head = text;
    } else {
      head = head.name;
    }
  } else {
    head = functionNames(head);
  }
  return [head, ...tail.map(functionNames)];
}

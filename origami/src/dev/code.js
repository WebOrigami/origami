import { toString } from "@weborigami/async-tree";
import { compile } from "@weborigami/language";
import getTreeArgument from "../common/getTreeArgument.js";

/**
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 *
 * @this {AsyncTree|null}
 * @param {import("@weborigami/async-tree").StringLike} input
 */
export default async function code(input) {
  if (input === undefined) {
    input = await getTreeArgument(this, arguments, input, "dev:code");
  }
  if (input === undefined) {
    return undefined;
  }
  const text = toString(input);
  const fn = compile.program(text);
  return functionNames(fn.code);
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

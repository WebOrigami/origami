import { executionContext } from "@weborigami/language";
import DebugParent from "./DebugParent.js";

/**
 * Given an Origami expression, start a new debug server with that parent as the
 * root of the resource tree.
 *
 * This function expects unevaluated arguments. This is what it allows it to
 * extract the source code of the expression to be debugged. (If it were
 * evaluated, the function will be called with the result of the expression.)
 *
 * @typedef {import("@weborigami/language").AnnotatedCode} AnnotatedCode
 *
 * @param {AnnotatedCode} code
 */
export default async function debug2(code) {
  if (
    !(code instanceof Array) ||
    code.source === undefined ||
    arguments.length < 1
  ) {
    throw new TypeError(
      "Dev.debug2 expects an Origami expression to evaluate: `debug2 <expression>`",
    );
  }

  const expression = code.source;

  const parent = executionContext.getStore()?.parent;
  // @ts-ignore
  const parentPath = parent?.path;
  if (parentPath === undefined) {
    throw new Error("Dev.debug2 couldn't work out the parent path.");
  }

  // Start the debug server
  const debugParent = new DebugParent({
    expression,
    parentPath,
  });
  await debugParent.start();

  console.log(`Server running at ${debugParent.origin}. Press Ctrl+C to stop.`);
}
debug2.unevaluatedArgs = true;

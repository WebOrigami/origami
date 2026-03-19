import { execute } from "@weborigami/language";
import debugParent from "./debugParent.js";

/**
 * Given an Origami expression, start a new debug server with that parent as the
 * root of the resource tree.
 *
 * This function expects unevaluated arguments. This is what it allows it to
 * extract the source code of the expression to be debugged. (If it were
 * evaluated, the function will be called with the result of the expression.)
 *
 * The `options` argument can include:
 * - `enableUnsafeEval`: if true, enables the `!eval` debug command in the child
 *   process; default is false
 * - `debugFilesPath`: path to resources that will be added to the served tree
 *
 * @typedef {import("@weborigami/language").RuntimeState} RuntimeState
 * @typedef {import("@weborigami/language").AnnotatedCode} AnnotatedCode
 *
 * @param {AnnotatedCode} code
 * @param {any | RuntimeState} options
 * @param {RuntimeState} state
 */
export default async function debug2(code, options, state) {
  if (state === undefined) {
    // Options were omitted; shift arguments
    state = options;
    options = [];
  }

  if (
    !(code instanceof Array) ||
    code.source === undefined ||
    arguments.length < 2
  ) {
    throw new TypeError(
      "Dev.debug2 expects an Origami expression to evaluate: `debug2 <expression>`",
    );
  }

  const expression = code.source;

  const { parent } = state;
  // @ts-ignore
  const parentPath = parent?.path;
  if (parentPath === undefined) {
    throw new Error("Dev.debug2 couldn't work out the parent path.");
  }

  // Need to evaluate options object
  if (options.length > 0) {
    options = await execute(options, state);
  } else {
    options = {};
  }

  // @ts-ignore
  const enableUnsafeEval = options.enableUnsafeEval ?? false;
  const debugFilesPath = options.debugFilesPath ?? "";

  await debugParent({
    debugFilesPath,
    enableUnsafeEval,
    expression,
    parentPath,
  });
}
debug2.needsState = true;
debug2.unevaluatedArgs = true;

import path from "node:path";
import debugParent from "./debugParent.js";

/**
 * Given an Origami expression, start a new debug server with that parent as the
 * root of the resource tree.
 *
 * This function expects unevaluated arguments. This is what it allows it to
 * extract the source code of the expression to be debugged. (If it were
 * evaluated, the function will be called with the result of the expression.)
 *
 * @typedef {import("@weborigami/language").RuntimeState} RuntimeState
 * @typedef {import("@weborigami/language").AnnotatedCode} AnnotatedCode
 *
 * @param {AnnotatedCode} code
 * @param {RuntimeState} state
 */
export default async function debug2(code, state) {
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

  // Start the debug server
  const server = await debugParent({
    expression,
    parentPath,
  });

  // Watch the parent files for changes
  // const tree = new OrigamiFileMap(parentPath);
  // await tree.initializeGlobals();
  // tree.watch();
  // tree.addEventListener?.("valuechange", async (event) => {
  //   // @ts-ignore
  //   const { relativePath } = event.options;
  //   if (isJavaScriptFile(relativePath)) {
  //     // Need to restart the child process
  //     console.log("JavaScript file changed, restarting server…");
  //     await server.restart();
  //   } else if (relativePath === "package.json") {
  //     // Need to restart the child process
  //     console.log("package.json changed, restarting server…");
  //     await server.restart();
  //   }
  // });
  // tree.addEventListener?.("keyschange", async (event) => {
  //   // @ts-ignore
  //   const { relativePath } = event.options;
  //   console.log("Keys changed…");
  //   await server.invalidate(`${relativePath}/_keys`);
  // });

  // When server closes, stop watching for file changes
  // server.on("close", () => {
  //   tree.unwatch();
  // });

  console.log(`Server running at ${server.origin}. Press Ctrl+C to stop.`);
}
debug2.needsState = true;
debug2.unevaluatedArgs = true;

function isJavaScriptFile(filePath) {
  const extname = path.extname(filePath).toLowerCase();
  const jsExtensions = [".cjs", ".js", ".mjs", ".ts"];
  return jsExtensions.includes(extname);
}

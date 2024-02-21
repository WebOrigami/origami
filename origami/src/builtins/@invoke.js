import assertScopeIsDefined from "../misc/assertScopeIsDefined.js";
import builtins from "./@builtins.js";

/**
 * Invoke the given function.
 *
 * This built-in exists to facilitate executing an Origami file as a script via
 * a [shebang](https://en.wikipedia.org/wiki/Shebang_(Unix)) directive.
 *
 * You can execute a foo.ori file as a script by adding the following shebang
 * directive to the top of the file:
 *
 * ```sh
 * #!/usr/bin/env ori @invoke
 * ```
 *
 * Then mark the file as executable:
 *
 * ```sh
 * chmod +x foo.ori
 * ```
 *
 * @this {import("@weborigami/types").AsyncTree|null}
 */
export default async function invoke(fn) {
  assertScopeIsDefined(this, "invoke");
  // A fragment of the logic from getTreeArgument.js
  if (arguments.length > 0 && fn === undefined) {
    throw new Error(
      "An Origami function was called with an initial argument, but its value is undefined."
    );
  }
  if (typeof fn !== "function" && fn.unpack) {
    fn = await fn.unpack();
  }
  const scope = (await this?.get("@current")) ?? builtins;
  return typeof fn === "function" ? fn.call(scope) : fn;
}

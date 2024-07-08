import { isUnpackable } from "@weborigami/async-tree";
import assertTreeIsDefined from "../misc/assertTreeIsDefined.js";

/**
 * Invoke the given text as an Origami function.
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
  assertTreeIsDefined(this, "invoke");
  if (fn === undefined) {
    throw new Error(
      "An Origami function was called with an initial argument, but its value is undefined."
    );
  }
  if (isUnpackable(fn)) {
    fn = await fn.unpack();
  }
  return typeof fn === "function" ? fn.call(this) : fn;
}

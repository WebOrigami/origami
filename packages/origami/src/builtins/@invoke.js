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
 * @this {import("@graphorigami/types").AsyncDictionary|null}
 */
export default async function invoke(fn) {
  if (typeof fn !== "function" && fn.contents) {
    fn = await fn.contents();
  }
  return typeof fn === "function" ? fn.call(builtins) : fn;
}

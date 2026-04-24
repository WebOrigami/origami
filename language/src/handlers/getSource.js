import { getParent, toString, Tree } from "@weborigami/async-tree";
import path from "node:path";

/**
 * Given packed source text and a handler's options, return a source
 * object that can be passed to the compiler.
 */
export default function getSource(packed, options = {}) {
  const parent = getParent(packed, options);

  // Try to determine a URL for error messages
  const sourceName = options.key;
  let relativePath;
  let url;
  if (sourceName) {
    if (/** @type {any} */ (parent)?.url) {
      let parentHref = /** @type {any} */ (parent).url.href;
      if (!parentHref.endsWith("/")) {
        parentHref += "/";
      }
      url = new URL(sourceName, parentHref);
    } else if (/** @type {any} */ (parent)?.path) {
      let parentHref = new URL(/** @type {any} */ (parent).path, "file:///")
        .href;
      if (!parentHref.endsWith("/")) {
        parentHref += "/";
      }
      url = new URL(sourceName, parentHref);

      // TODO: clean up
      const root = Tree.root(parent);
      relativePath = path.join(
        path.relative(root.path, parent.path),
        sourceName,
      );
    }
  }

  const source = {
    text: toString(packed),
    name: options.key,
    url,
  };
  if (relativePath) {
    source.relativePath = relativePath;
  }

  return source;
}

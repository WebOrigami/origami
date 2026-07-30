import { getParent, toString } from "@weborigami/async-tree";
import SystemCacheMap from "../runtime/SystemCacheMap.js";

let parentCounter = 0;

/**
 * Given packed source text and a handler's options, return a source
 * object that can be passed to the compiler.
 */
export default function getSource(packed, options = {}) {
  const parent = getParent(packed, options);

  // Try to determine a URL for error messages
  const sourceName = options.key;
  let cachePath;
  let url;
  if (sourceName) {
    if (/** @type {any} */ (parent)?.url) {
      // Parent with URL
      let parentHref = /** @type {any} */ (parent).url.href;
      if (!parentHref.endsWith("/")) {
        parentHref += "/";
      }
      url = new URL(sourceName, parentHref);
    } else if (/** @type {any} */ (parent)?.path) {
      // Parent with path
      let parentHref = new URL(/** @type {any} */ (parent).path, "file:///")
        .href;
      if (!parentHref.endsWith("/")) {
        parentHref += "/";
      }
      url = new URL(sourceName, parentHref);

      const parentPath = /** @type {any} */ (parent).path;
      cachePath = SystemCacheMap.joinPath(parentPath, sourceName);
    } else {
      // Parent with no URL or path, use a counter to create unique path
      cachePath = SystemCacheMap.joinPath(
        `_parent${parentCounter++}`,
        sourceName,
      );
    }
  }

  const source = {
    text: toString(packed),
    name: options.key,
    url,
  };
  if (cachePath) {
    source.cachePath = cachePath;
  }

  return source;
}

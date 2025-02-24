import * as trailingSlash from "./trailingSlash.js";
import { isStringLike, toString } from "./utilities.js";

/**
 * Replicate the logic of Node POSIX path.extname at
 * https://github.com/nodejs/node/blob/main/lib/path.js so that we can use this
 * in the browser.
 *
 * @param {string} path
 * @returns {string}
 */
export function extname(path) {
  if (typeof path !== "string") {
    throw new TypeError(`Expected a string, got ${typeof path}`);
  }
  let startDot = -1;
  let startPart = 0;
  let end = -1;
  let matchedSlash = true;
  // Track the state of characters (if any) we see before our first dot and
  // after any path separator we find
  let preDotState = 0;
  for (let i = path.length - 1; i >= 0; --i) {
    const char = path[i];
    if (char === "/") {
      // If we reached a path separator that was not part of a set of path
      // separators at the end of the string, stop now
      if (!matchedSlash) {
        startPart = i + 1;
        break;
      }
      continue;
    }
    if (end === -1) {
      // We saw the first non-path separator, mark this as the end of our
      // extension
      matchedSlash = false;
      end = i + 1;
    }
    if (char === ".") {
      // If this is our first dot, mark it as the start of our extension
      if (startDot === -1) startDot = i;
      else if (preDotState !== 1) preDotState = 1;
    } else if (startDot !== -1) {
      // We saw a non-dot and non-path separator before our dot, so we should
      // have a good chance at having a non-empty extension
      preDotState = -1;
    }
  }

  if (
    startDot === -1 ||
    end === -1 ||
    // We saw a non-dot character immediately before the dot
    preDotState === 0 ||
    // The (right-most) trimmed path component is exactly '..'
    (preDotState === 1 && startDot === end - 1 && startDot === startPart + 1)
  ) {
    return "";
  }
  return path.slice(startDot, end);
}

/**
 * See if the key ends with the given extension. If it does, return the base
 * name without the extension; if it doesn't return null.
 *
 * If the extension is empty, the key must not have an extension to match.
 *
 * If the extension is a slash, then the key must end with a slash for the match
 * to succeed. Otherwise, a trailing slash in the key is ignored for purposes of
 * comparison to comply with the way Origami can unpack files. Example: the keys
 * "data.json" and "data.json/" are treated equally.
 *
 * This uses a different, more general interpretation of "extension" to mean any
 * suffix, rather than Node's interpretation in `extname`. In particular, this
 * will match a multi-part extension like ".foo.bar" that contains more than one
 * dot.
 */
export function match(key, ext) {
  if (!isStringLike(key)) {
    return null;
  }
  key = toString(key);

  if (ext === "/") {
    return trailingSlash.has(key) ? trailingSlash.remove(key) : null;
  }

  // Key matches if it ends with the same extension
  const normalized = trailingSlash.remove(key);

  if (ext === "") {
    return normalized.includes(".") ? null : normalized;
  } else if (normalized.endsWith(ext)) {
    const removed =
      ext.length > 0 ? normalized.slice(0, -ext.length) : normalized;
    return trailingSlash.toggle(removed, trailingSlash.has(key));
  }

  // Didn't match
  return null;
}

/**
 * If the given key ends in the source extension (which will generally include a
 * period), replace that extension with the result extension (which again should
 * generally include a period). Otherwise, return the key as is.
 *
 * If the key ends in a trailing slash, that will be preserved in the result.
 * Exception: if the source extension is empty, and the key doesn't have an
 * extension, the result extension will be appended to the key without a slash.
 *
 * @param {string} key
 * @param {string} sourceExtension
 * @param {string} resultExtension
 */
export function replace(key, sourceExtension, resultExtension) {
  if (!isStringLike(key)) {
    return null;
  }
  key = toString(key);

  if (!match(key, sourceExtension)) {
    return key;
  }

  let replaced;
  const normalizedKey = trailingSlash.remove(key);
  if (sourceExtension === "") {
    replaced = normalizedKey + resultExtension;
    if (!normalizedKey.includes(".")) {
      return replaced;
    }
  } else if (sourceExtension === "/") {
    return trailingSlash.remove(key) + resultExtension;
  } else {
    replaced =
      normalizedKey.slice(0, -sourceExtension.length) + resultExtension;
  }

  return trailingSlash.toggle(replaced, trailingSlash.has(key));
}

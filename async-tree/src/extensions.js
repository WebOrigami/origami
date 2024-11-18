import * as trailingSlash from "./trailingSlash.js";

/**
 * If the given path ends in an extension, return it. Otherwise, return the
 * empty string.
 *
 * This is meant as a basic replacement for the standard Node `path.extname`.
 * That standard function inaccurately returns an extension for a path that
 * includes a near-final extension but ends in a final slash, like `foo.txt/`.
 * Node thinks that path has a ".txt" extension, but for our purposes it
 * doesn't.
 *
 * @param {string} path
 */
export function extname(path) {
  // We want at least one character before the dot, then a dot, then a non-empty
  // sequence of characters after the dot that aren't slahes or dots.
  const extnameRegex = /[^/](?<ext>\.[^/\.]+)$/;
  const match = String(path).match(extnameRegex);
  const extension = match?.groups?.ext.toLowerCase() ?? "";
  return extension;
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
export function replaceExtension(key, sourceExtension, resultExtension) {
  if (!key) {
    return undefined;
  }

  const normalizedKey = trailingSlash.remove(key);
  if (!normalizedKey.endsWith(sourceExtension)) {
    return normalizedKey;
  }

  let replaced;
  if (sourceExtension === "") {
    replaced = normalizedKey + resultExtension;
    if (!normalizedKey.includes(".")) {
      return replaced;
    }
  } else {
    replaced =
      normalizedKey.slice(0, -sourceExtension.length) + resultExtension;
  }

  return trailingSlash.toggle(replaced, trailingSlash.has(key));
}

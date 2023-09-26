import TextWithContents from "../common/TextWithContents.js";

/**
 * Load a .js file as a String with a contents() method that returns the
 * module's default export.
 *
 * @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary
 * @typedef {import("@graphorigami/core").HasContents} HasContents
 *
 * @param {Buffer|string} buffer
 * @param {any} [key]
 * @returns {HasContents}
 * @this {AsyncDictionary|null}
 */
export default function loadJs(buffer, key) {
  const container = this;
  let contents;
  return new TextWithContents(buffer, async () => {
    if (!contents && container && "import" in container) {
      contents = await /** @type {any} */ (container).import?.(key);
    }
    return contents;
  });
}

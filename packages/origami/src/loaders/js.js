/**
 * Load a .js file as a String with a toFunction() method that returns a
 * function that invokes the module's default export, and a toGraph() method
 * that returns a graph for the module's default export.
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

  /** @type {any} */
  const moduleFile = new String(buffer);

  let contents;
  moduleFile.contents = async function importModule() {
    if (!contents && container && "import" in container) {
      contents = await /** @type {any} */ (container).import?.(key);
    }
    return contents;
  };

  return moduleFile;
}

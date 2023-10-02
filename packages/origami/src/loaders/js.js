import TextDocument from "../common/TextDocument.js";

/**
 * Load a .js file as a String with a contents() method that returns the
 * module's default export.
 *
 * @type {import("../../index.js").FileLoaderFunction}
 */
export default function loadJs(container, input, key) {
  return new TextDocument(input, {
    async contents() {
      if (container && "import" in container) {
        return /** @type {any} */ (container).import?.(key);
      }
    },
  });
}

import TextFile from "../common/TextFile.js";

/**
 * Load a .js file as a String with a contents() method that returns the
 * module's default export.
 *
 * @type {import("../../index.js").FileLoaderFunction}
 */
export default function loadJs(container, input, key) {
  let contents;
  return new TextFile(input, async () => {
    if (!contents && container && "import" in container) {
      contents = await /** @type {any} */ (container).import?.(key);
    }
    return contents;
  });
}

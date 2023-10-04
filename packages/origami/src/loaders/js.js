/**
 * Load a .js file as module's default export or exports.
 *
 * @type {import("../../index.js").FileUnpackFunction}
 */
export default function unpackModule(container, input, key) {
  if (container && "import" in container) {
    return /** @type {any} */ (container).import?.(key);
  }
}

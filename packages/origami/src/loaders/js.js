/**
 * Load a .js file as module's default export or exports.
 *
 * @type {import("../../index.js").FileUnpackFunction}
 */
export default function unpackModule(input, options = {}) {
  const { key, parent } = options;
  if (parent && "import" in parent) {
    return /** @type {any} */ (parent).import?.(key);
  }
}

/**
 * Load a .js file as module's default export or exports.
 *
 * @type {import("../../index.js").Deserializer}
 */
export default function loadJs(container, input, key) {
  if (container && "import" in container) {
    return /** @type {any} */ (container).import?.(key);
  }
}

import processUnpackedContent from "../common/processUnpackedContent.js";

/**
 * Load a .js file as module's default export or exports.
 *
 * @type {import("../..").FileUnpackFunction}
 */
export default function unpackModule(input, options = {}) {
  const { key, parent } = options;
  if (parent && "import" in parent) {
    const content = /** @type {any} */ (parent).import?.(key);
    return processUnpackedContent(content, parent);
  }
}

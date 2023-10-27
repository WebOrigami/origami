import processUnpackedContent from "../../common/processUnpackedContent.js";

/**
 * Load a .js file as module's default export or exports.
 *
 * @type {import("@graphorigami/language").FileUnpackFunction}
 */
export default async function unpackModule(input, options = {}) {
  const { key, parent } = options;
  if (parent && "import" in parent) {
    const content = await /** @type {any} */ (parent).import?.(key);
    return processUnpackedContent(content, parent);
  }
}

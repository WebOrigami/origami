import processUnpackedContent from "../../common/processUnpackedContent.js";

/**
 * Load a .js file as module's default export or exports.
 *
 * @type {import("@weborigami/language").FileUnpackFunction}
 */
export default async function unpackWasm(buffer, options = {}) {
  const wasmModule = await WebAssembly.instantiate(buffer);
  return processUnpackedContent(wasmModule.instance.exports, options.parent);
}

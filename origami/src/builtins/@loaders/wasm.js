import processUnpackedContent from "../../common/processUnpackedContent.js";

/**
 * Load a WebAssembly module and return its exports.
 *
 * @type {import("@weborigami/language").FileUnpackFunction}
 */
export default async function unpackWasm(buffer, options = {}) {
  const wasmModule = await WebAssembly.instantiate(buffer);
  return processUnpackedContent(wasmModule.instance.exports, options.parent);
}

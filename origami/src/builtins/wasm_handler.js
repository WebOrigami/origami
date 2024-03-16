import processUnpackedContent from "../common/processUnpackedContent.js";

/**
 * A WebAssembly module
 *
 * Unpacking a WebAssembly module returns its exports.
 */
export default {
  mediaType: "application/wasm",

  /** @type {import("@weborigami/language").FileUnpackFunction} */
  async unpack(buffer, options = {}) {
    const wasmModule = await WebAssembly.instantiate(buffer);
    return processUnpackedContent(wasmModule.instance.exports, options.parent);
  },
};

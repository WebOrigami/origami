import processUnpackedContent from "./processUnpackedContent.js";

/**
 * A WebAssembly module
 *
 * Unpacking a WebAssembly module returns its exports.
 */
export default {
  mediaType: "application/wasm",

  /** @type {import("@weborigami/async-tree").UnpackFunction} */
  async unpack(packed, options = {}) {
    const wasmModule = await WebAssembly.instantiate(packed);
    // @ts-ignore TypeScript thinks wasmModule is already an Instance.
    return processUnpackedContent(wasmModule.instance.exports, options.parent);
  },
};

/**
 * A WebAssembly module
 *
 * Unpacking a WebAssembly module returns its exports.
 */
export default {
  mediaType: "application/wasm",

  /** @type {import("@weborigami/async-tree").UnpackFunction} */
  async unpack(packed) {
    const wasmModule = await WebAssembly.instantiate(packed);
    // @ts-ignore TypeScript thinks wasmModule is already an Instance.
    return wasmModule.instance.exports;
  },
};

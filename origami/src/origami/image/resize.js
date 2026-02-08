let sharp;

/**
 * Resize an image.
 *
 * @param {import("@weborigami/async-tree").Packed} input
 * @param {import("sharp").ResizeOptions} options
 */
export default async function resize(input, options) {
  if (!sharp) {
    // Dynamic import to avoid loading Sharp until needed
    sharp = (await import("sharp")).default;
  }

  if (!(input instanceof Uint8Array || input instanceof ArrayBuffer)) {
    return undefined;
  }

  const data = await sharp(input).rotate().resize(options).toBuffer();

  // Sharp WASM library returns what appears to be a SharedArrayBuffer, which is
  // not accepted in some contexts, so we convert it to a regular Uint8Array.
  return new Uint8Array(data);
}

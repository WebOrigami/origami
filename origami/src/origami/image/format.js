let sharp;

/**
 * Return the image in a different format.
 *
 * @param {import("@weborigami/async-tree").Packed} input
 * @param {keyof import("sharp").FormatEnum|import("sharp").AvailableFormatInfo}
 * format
 * @param {any} options
 */
export default async function imageFormat(input, format, options) {
  if (!sharp) {
    // Dynamic import to avoid loading Sharp until needed
    sharp = (await import("sharp")).default;
  }

  if (!(input instanceof Uint8Array || input instanceof ArrayBuffer)) {
    return undefined;
  }

  const data = await sharp(input).toFormat(format, options).toBuffer();

  // Sharp WASM library returns what appears to be a SharedArrayBuffer, which is
  // not accepted in some contexts, so we convert it to a regular Uint8Array.
  return new Uint8Array(data);
}

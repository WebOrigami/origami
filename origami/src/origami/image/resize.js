import sharp from "sharp";

/**
 * Resize an image.
 *
 * @param {import("@weborigami/async-tree").Packed} input
 * @param {import("sharp").ResizeOptions} options
 */
export default async function resize(input, options) {
  return input instanceof Uint8Array || input instanceof ArrayBuffer
    ? sharp(input).rotate().resize(options).toBuffer()
    : undefined;
}

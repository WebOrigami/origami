import sharp from "sharp";

/**
 * Return the image in a different format.
 *
 * @param {import("@weborigami/async-tree").Packed} input
 * @param {keyof import("sharp").FormatEnum|import("sharp").AvailableFormatInfo}
 * format
 * @param {any} options
 */
export default async function imageFormat(input, format, options) {
  return input instanceof Uint8Array || input instanceof ArrayBuffer
    ? sharp(input).toFormat(format, options).toBuffer()
    : undefined;
}

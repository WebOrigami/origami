import sharp from "sharp";
import assertTreeIsDefined from "../misc/assertTreeIsDefined.js";

/**
 * Return a function that transforms an input image to a different format.
 *
 * @this {import("@weborigami/types").AsyncTree|null}
 * @param {keyof import("sharp").FormatEnum|import("sharp").AvailableFormatInfo}
 * format
 * @param {any} options
 */
export default function imageFormatFn(format, options) {
  assertTreeIsDefined(this, "image/formatFn");
  return (buffer) =>
    buffer instanceof Uint8Array || buffer instanceof ArrayBuffer
      ? sharp(buffer).toFormat(format, options).toBuffer()
      : undefined;
}

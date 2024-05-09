import sharp from "sharp";
import assertScopeIsDefined from "../../misc/assertScopeIsDefined.js";

/**
 * Return a function that transforms an input image to a different format.
 *
 * @this {import("@weborigami/types").AsyncTree|null}
 * @param {keyof import("sharp").FormatEnum|import("sharp").AvailableFormatInfo}
 * format
 * @param {any} options
 */
export default function imageFormatFn(format, options) {
  assertScopeIsDefined(this, "image/formatFn");
  return (buffer) => sharp(buffer).toFormat(format, options).toBuffer();
}

import assertScopeIsDefined from "../../misc/assertScopeIsDefined.js";
import imageFormatFn from "./formatFn.js";

/**
 * Return the image in a different format.
 *
 * @this {import("@weborigami/types").AsyncTree|null}
 *
 * @this {import("@weborigami/types").AsyncTree|null}
 * @param {Buffer} buffer
 * @param {keyof import("sharp").FormatEnum|import("sharp").AvailableFormatInfo}
 * format
 * @param {any} options
 */
export default async function imageFormat(buffer, format, options) {
  assertScopeIsDefined(this, "image/format");
  return imageFormatFn.call(this, format, options)(buffer);
}

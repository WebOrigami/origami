import assertTreeIsDefined from "../common/assertTreeIsDefined.js";
import imageFormatFn from "./formatFn.js";

/**
 * Return the image in a different format.
 *
 * @this {import("@weborigami/types").AsyncTree|null}
 *
 * @this {import("@weborigami/types").AsyncTree|null}
 * @param {import("@weborigami/async-tree").Packed} input
 * @param {keyof import("sharp").FormatEnum|import("sharp").AvailableFormatInfo}
 * format
 * @param {any} options
 */
export default async function imageFormat(input, format, options) {
  assertTreeIsDefined(this, "format");
  return imageFormatFn.call(this, format, options)(input);
}

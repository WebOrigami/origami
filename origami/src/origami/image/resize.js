import sharp from "sharp";
import assertTreeIsDefined from "../../common/assertTreeIsDefined.js";

/**
 * Resize an image.
 *
 * @this {import("@weborigami/types").AsyncTree|null}
 * @param {import("@weborigami/async-tree").Packed} input
 * @param {import("sharp").ResizeOptions} options
 */
export default async function resize(input, options) {
  assertTreeIsDefined(this, "resize");
  return input instanceof Uint8Array || input instanceof ArrayBuffer
    ? sharp(input).rotate().resize(options).toBuffer()
    : undefined;
}

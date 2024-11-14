import sharp from "sharp";
import assertTreeIsDefined from "../common/assertTreeIsDefined.js";

/**
 * Return a function that resizes an image.
 *
 * @this {import("@weborigami/types").AsyncTree|null}
 * @param {import("sharp").ResizeOptions} options
 */
export default function imageResizeFn(options) {
  assertTreeIsDefined(this, "image/resizeFn");
  // Include `rotate()` to auto-rotate according to EXIF data.
  return (buffer) =>
    buffer instanceof Uint8Array || buffer instanceof ArrayBuffer
      ? sharp(buffer).rotate().resize(options).toBuffer()
      : undefined;
}

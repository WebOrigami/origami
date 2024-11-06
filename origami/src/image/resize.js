import assertTreeIsDefined from "../misc/assertTreeIsDefined.js";
import imageResizeFn from "./resizeFn.js";

/**
 * Resize an image.
 *
 * @this {import("@weborigami/types").AsyncTree|null}
 * @param {import("@weborigami/async-tree").Packed} input
 * @param {import("sharp").ResizeOptions} options
 */
export default async function resize(input, options) {
  assertTreeIsDefined(this, "image:resize");
  return imageResizeFn.call(this, options)(input);
}
resize.description = "resize(image, options) - Resize the image";

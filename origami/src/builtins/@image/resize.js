import assertScopeIsDefined from "../../misc/assertScopeIsDefined.js";
import imageResizeFn from "./resizeFn.js";

/**
 * Resize an image.
 *
 * @this {import("@weborigami/types").AsyncTree|null}
 * @param {import("@weborigami/async-tree").Packed} input
 * @param {import("sharp").ResizeOptions} options
 */
export default async function resize(input, options) {
  assertScopeIsDefined(this, "image/resize");
  return imageResizeFn.call(this, options)(input);
}

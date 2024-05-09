import assertScopeIsDefined from "../../misc/assertScopeIsDefined.js";
import imageResizeFn from "./resizeFn.js";

/**
 * Resize an image.
 *
 * @this {import("@weborigami/types").AsyncTree|null}
 * @param {Buffer} buffer
 * @param {import("sharp").ResizeOptions} options
 */
export default async function resize(buffer, options) {
  assertScopeIsDefined(this, "image/resize");
  return imageResizeFn.call(this, options)(buffer);
}

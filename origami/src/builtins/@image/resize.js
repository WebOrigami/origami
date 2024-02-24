import sharp from "sharp";

/**
 * Resize an image.
 *
 * @this {import("@weborigami/types").AsyncTree|null}
 *
 * @typedef {import("sharp").ResizeOptions} ResizeOptions
 *
 * @overload
 * @param {ResizeOptions} param1
 * @returns {(buffer: Buffer) => Promise<Buffer>}
 *
 * @overload
 * @param {Buffer} param1
 * @param {ResizeOptions} param2
 * @returns {Promise<Buffer>}
 */
export default function resize(param1, param2) {
  // Identify which overload was used.
  let buffer;
  let options;
  if (param2 === undefined) {
    options = param1;
  } else {
    buffer = param1;
    options = param2;
  }

  // Include `rotate()` to auto-rotate according to EXIF data.
  const transform = (buffer) =>
    sharp(buffer).rotate().resize(options).toBuffer();

  return buffer ? transform(buffer) : transform;
}

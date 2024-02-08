import sharp from "sharp";

/**
 * Return the image in a different format.
 *
 * @this {import("@weborigami/types").AsyncTree|null}
 *
 * @typedef {import("sharp").ResizeOptions} ResizeOptions
 *
 * @overload
 * @param {any} param1
 * @param {any} param2
 * @returns {(buffer: Buffer) => Promise<Buffer>}
 *
 * @overload
 * @param {Buffer} param1
 * @param {any} param2
 * @param {any} param3
 * @returns {Promise<Buffer>}
 */
export default function format(param1, param2, param3) {
  // Identify which overload was used.
  let buffer;
  let format;
  let options;
  if (param1 instanceof Buffer) {
    buffer = param1;
    format = param2;
    options = param3;
  } else {
    format = param1;
    options = param2;
  }

  const transform = (buffer) =>
    sharp(buffer).toFormat(format, options).toBuffer();

  return buffer ? transform(buffer) : transform;
}

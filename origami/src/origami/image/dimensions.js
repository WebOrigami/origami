let sharp;

/**
 * Return the dimensions of the image. If the image has been rotated, the width
 * and height will be swapped.
 *
 * @param {import("@weborigami/async-tree").Packed} input
 */
export default async function dimensions(input) {
  // Dynamic import to avoid loading Sharp until needed
  sharp ??= (await import("sharp")).default;

  if (!(input instanceof Uint8Array || input instanceof ArrayBuffer)) {
    return undefined;
  }

  const metadata = await sharp(input).metadata();
  if (!metadata) {
    return undefined;
  }

  const { height, orientation, width } = metadata;
  if (width === undefined || height === undefined) {
    return undefined;
  }

  // Swap width and height for rotated images
  const rotated = orientation && orientation >= 5 && orientation <= 8;
  return rotated ? { width: height, height: width } : { width, height };
}

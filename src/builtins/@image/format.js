import sharp from "sharp";

export default function format(imageBuffer, format, options) {
  return imageBuffer instanceof Buffer
    ? sharp(imageBuffer).toFormat(format, options).toBuffer()
    : undefined;
}

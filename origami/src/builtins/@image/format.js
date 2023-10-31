import sharp from "sharp";

export default function format(buffer, format, options) {
  return sharp(buffer).toFormat(format, options).toBuffer();
}

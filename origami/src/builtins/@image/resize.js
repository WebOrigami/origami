import sharp from "sharp";

export default function resize(buffer, options) {
  return sharp(buffer).resize(options).toBuffer();
}

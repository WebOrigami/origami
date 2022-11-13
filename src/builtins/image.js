import sharp from "sharp";

export default {
  resize(imageBuffer, options) {
    return imageBuffer instanceof Buffer
      ? sharp(imageBuffer).resize(options).toBuffer()
      : undefined;
  },
};

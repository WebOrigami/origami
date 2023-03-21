import sharp from "sharp";

export default {
  format(imageBuffer, format, options) {
    return imageBuffer instanceof Buffer
      ? sharp(imageBuffer).toFormat(format, options).toBuffer()
      : undefined;
  },

  resize(imageBuffer, options) {
    return imageBuffer instanceof Buffer
      ? sharp(imageBuffer).resize(options).toBuffer()
      : undefined;
  },
};

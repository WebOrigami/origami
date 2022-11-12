import sharp from "sharp";

export default {
  resize(imageBuffer, width) {
    return imageBuffer instanceof Buffer
      ? sharp(imageBuffer).resize({ width }).toBuffer()
      : undefined;
  },
};

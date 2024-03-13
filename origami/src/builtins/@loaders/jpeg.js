import exifParser from "exif-parser";

const exifDateTags = [
  "ModifyDate",
  "MDPrepDate",
  "DateTimeOriginal",
  "CreateDate",
  "PreviewDateTime",
  "GPSDateStamp",
];

/**
 * A JPEG file with possible Exif metadata
 */
export default {
  mediaType: "image/jpeg",

  /** @type {import("@weborigami/language").FileUnpackFunction} */
  async unpack(buffer, options) {
    const parser = exifParser.create(buffer);
    parser.enableTagNames(true);
    parser.enableSimpleValues(true);
    const parsed = await parser.parse();

    // The exif-parser `enableSimpleValues` option should convert dates to
    // JavaScript Date objects, but that doesn't seem to work. Ensure dates are
    // Date objects.
    const exif = parsed.tags;
    for (const tag of exifDateTags) {
      if (typeof exif[tag] === "number") {
        exif[tag] = new Date(exif[tag] * 1000);
      }
    }

    const result = {
      height: parsed.imageSize.height,
      width: parsed.imageSize.width,
      exif,
    };

    // Promote some Exif properties to the top level.
    const tagsToPromote = {
      ImageDescription: "caption",
      ModifyDate: "modified",
      Orientation: "orientation",
    };
    for (const [tag, key] of Object.entries(tagsToPromote)) {
      if (exif[tag] !== undefined) {
        result[key] = exif[tag];
      }
    }

    // Add aspect ratio for use with `aspect-ratio` CSS.
    result.aspectRatio = result.width / result.height;

    return result;
  },
};

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
 * Load Exif data from a JPEG file.
 *
 * @type {import("@weborigami/language").FileUnpackFunction}
 */
export default async function unpackJpeg(buffer, options) {
  const parser = exifParser.create(buffer);
  parser.enableTagNames(true);
  parser.enableSimpleValues(true);
  const { tags } = await parser.parse();

  // The exif-parser `enableSimpleValues` option should convert dates to
  // JavaScript Date objects, but that doesn't seem to work. Ensure dates are
  // Date objects.
  for (const tag of exifDateTags) {
    if (typeof tags[tag] === "number") {
      tags[tag] = new Date(tags[tag] * 1000);
    }
  }

  return tags;
}

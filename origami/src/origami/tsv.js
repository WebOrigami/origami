import { isUnpackable, toPlainValue } from "@weborigami/async-tree";
import { EOL } from "node:os";

/**
 * Render the object as text in TSV (tab-separated values) format.
 *
 * The object should a treelike object such as an array. The output will include
 * a header row with field names taken from the first item in the tree/array.
 *
 * Lines will end with EOL character(s) appropriate for the operating system.
 *
 * @param {any} object
 */
export default async function tsv(object) {
  if (object == null) {
    return "";
  }
  if (isUnpackable(object)) {
    object = await object.unpack();
  }
  const value = await toPlainValue(object);
  const array = Array.isArray(value) ? value : Object.values(value);
  const text = formatTsv(array);
  return text;
}

function formatTsv(array) {
  if (!array || array.length === 0) {
    return "";
  }

  // Extract header fields from the first object.
  const headerFields = Object.keys(array[0]);
  const headerRow = headerFields.join("\t");

  // Map through each object and generate a data row.
  const dataRows = array.map((row) => {
    return headerFields.map((field) => row[field] ?? "").join("\t");
  });

  // Concatenate header and data rows, joining and ending with EOL.
  return [headerRow, ...dataRows].join(EOL) + EOL;
}

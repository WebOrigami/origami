import { isUnpackable, toPlainValue } from "@weborigami/async-tree";
import assertTreeIsDefined from "../common/assertTreeIsDefined.js";

/**
 * Render the object as text in CSV format.
 *
 * The object should a treelike object such as an array. The output will include
 * a header row with field names taken from the first item in the tree/array.
 *
 * @this {import("@weborigami/types").AsyncTree|null}
 * @param {any} [object]
 */
export default async function csv(object) {
  assertTreeIsDefined(this, "origami:csv");
  if (isUnpackable(object)) {
    object = await object.unpack();
  }
  const value = await toPlainValue(object);
  const text = formatCsv(value);
  return text;
}

function formatCsv(array) {
  if (!array || array.length === 0) {
    return "";
  }

  // Helper to quote field if necessary
  const formatField = (value) => {
    // Convert value to string.
    let field = String(value);

    // RFC 4180: Quote field if it contains a comma, a CR/LF, or a double quote
    if (field.search(/("|,|\n|\r)/) !== -1) {
      // Escape existing double quotes by replacing " with ""
      field = field.replace(/"/g, '""');
      // Surround the field with quotes
      field = `"${field}"`;
    }
    return field;
  };

  // Extract header fields from the first object.
  const headerFields = Object.keys(array[0]);

  // Generate the header row by formatting each header field.
  const headerRow = headerFields.map(formatField).join(",");

  // Map through each object and generate a CSV row.
  const dataRows = array.map((row) => {
    return headerFields
      .map((field) => formatField(row[field] !== undefined ? row[field] : ""))
      .join(",");
  });

  // Concatenate header and data rows, joining with CRLF.
  return [headerRow, ...dataRows].join("\r\n");
}

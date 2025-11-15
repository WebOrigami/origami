import { symbols, toString } from "@weborigami/async-tree";

export default {
  mediaType: "text/csv",

  unpack(packed, options = {}) {
    const parent = options.parent ?? null;
    const text = toString(packed);
    if (text === null) {
      throw new TypeError(".tsv handler can only unpack text");
    }
    const data = tsvParse(text);
    // Define `parent` as non-enumerable property
    Object.defineProperty(data, symbols.parent, {
      configurable: true,
      enumerable: false,
      value: parent,
      writable: true,
    });
    return data;
  },
};

/**
 * Parse text as tab-separated values (TSV) format into an array of objects.
 *
 * This assumes the presence of a header row, and accepts both CRLF and LF line
 * endings.
 *
 * Blank lines are ignored.
 *
 * @param {string} text
 * @returns {any[]}
 */
function tsvParse(text) {
  const lines = text.split(/\r?\n/).filter((line) => line.trim() !== "");
  if (lines.length === 0) {
    return [];
  }

  const headers = lines[0].split("\t");
  const data = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split("\t");
    const entry = {};
    for (let j = 0; j < headers.length; j++) {
      /** @type {string|number} */
      let value = values[j];
      if (value !== undefined) {
        // Attempt to convert to number if possible
        const n = Number(value);
        if (!isNaN(n)) {
          value = n;
        }
      }
      entry[headers[j]] = value ?? "";
    }
    data.push(entry);
  }

  return data;
}

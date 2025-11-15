import { symbols, toString } from "@weborigami/async-tree";

export default {
  mediaType: "text/csv",

  unpack(packed, options = {}) {
    const parent = options.parent ?? null;
    const text = toString(packed);
    if (text === null) {
      throw new TypeError("CSV handler can only unpack text");
    }
    const data = csvParse(text);
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
 * Parse text as CSV following RFC 4180
 *
 * This assumes the presence of a header row, and accepts both CRLF and LF line
 * endings.
 *
 * @param {string} text
 * @returns {any[]}
 */
function csvParse(text) {
  const rows = [];
  let currentRow = [];
  let currentField = "";
  let wasQuoted = false; // True if the current field was quoted

  const pushField = () => {
    /** @type {string|number} */
    let parsedField = currentField;
    if (!wasQuoted) {
      // Field wasn't quoted: if it's a valid number, convert it
      const n = Number(currentField);
      if (!isNaN(n)) {
        parsedField = n;
      }
    }
    currentRow.push(parsedField);
    currentField = "";
    wasQuoted = false; // Reset the flag for the next field
  };

  const pushRow = () => {
    // Push the row if there is at least one field (accounts for potential trailing newline)
    rows.push(currentRow);
    currentRow = [];
  };

  // Main state machine
  let i = 0;
  let inQuotes = false;
  while (i < text.length) {
    const char = text[i];

    if (inQuotes) {
      if (char === '"') {
        if (i + 1 < text.length && text[i + 1] === '"') {
          currentField += '"';
          i += 2;
          continue;
        } else {
          inQuotes = false;
          i++;
          continue;
        }
      } else {
        currentField += char;
        i++;
        continue;
      }
    } else if (char === '"') {
      inQuotes = true;
      wasQuoted = true; // Mark the field as quoted
      i++;
      continue;
    } else if (char === ",") {
      // End of field
      pushField();
      i++;
      continue;
    } else if (char === "\n" || (char === "\r" && text[i + 1] === "\n")) {
      // End of row: push the last field, then row.
      pushField();
      pushRow();
      if (char === "\r" && text[i + 1] === "\n") {
        i++; // Handle CRLF line endings
      }
      i++;
      continue;
    } else {
      // Regular character
      currentField += char;
      i++;
      continue;
    }
  }

  // Handle any remaining data after the loop.
  // This will capture the last field/row if the text did not end with a newline.
  if (inQuotes) {
    // Mismatched quotes: you might choose to throw an error or handle it gracefully.
    throw new Error("CSV parsing error: unmatched quote in the input.");
  }
  if (currentField !== "" || text.at(-1) === ",") {
    pushField();
  }
  if (currentRow.length > 0) {
    pushRow();
  }

  // The first row is assumed to be the header.
  if (rows.length === 0) {
    return [];
  }

  const header = rows.shift();

  const data = rows.map((row) =>
    Object.fromEntries(row.map((value, index) => [header[index], value]))
  );

  return data;
}

import toString from "../utilities/toString.js";
import deepText from "./deepText.js";
import isTreelike from "./isTreelike.js";

const lastLineWhitespaceRegex = /\n(?<indent>[ \t]*)$/;

const mapStringsToModifications = new Map();

/**
 * Normalize indentation in a tagged template string
 *
 * @param {TemplateStringsArray} strings
 * @param  {...any} values
 * @returns {Promise<string>}
 */
export default async function indent(strings, ...values) {
  let modified = mapStringsToModifications.get(strings);
  if (!modified) {
    modified = modifyStrings(strings);
    mapStringsToModifications.set(strings, modified);
  }
  const { blockIndentations, strings: modifiedStrings } = modified;
  const valueTexts = await Promise.all(
    values.map((value) => (isTreelike(value) ? deepText(value) : value))
  );
  return joinBlocks(modifiedStrings, valueTexts, blockIndentations);
}

// Join strings and values, applying the given block indentation to the lines of
// values for block placholders.
function joinBlocks(strings, values, blockIndentations) {
  let result = strings[0];
  for (let i = 0; i < values.length; i++) {
    let text = toString(values[i]);
    if (text) {
      const blockIndentation = blockIndentations[i];
      if (blockIndentation) {
        const lines = text.split("\n");
        text = "";
        if (lines.at(-1) === "") {
          // Drop empty last line
          lines.pop();
        }
        for (let line of lines) {
          text += blockIndentation + line + "\n";
        }
      }
      result += text;
    }
    result += strings[i + 1];
  }
  return result;
}

// Given an array of template boilerplate strings, return an object { modified,
// blockIndentations } where `strings` is the array of strings with indentation
// removed, and `blockIndentations` is an array of indentation strings for each
// block placeholder.
function modifyStrings(strings) {
  // Phase one: Identify the indentation based on the first real line of the
  // first string (skipping the initial newline), and remove this indentation
  // from all lines of all strings.
  let indent;
  if (strings.length > 0 && strings[0].startsWith("\n")) {
    // Look for indenttation
    const firstLineWhitespaceRegex = /^\n(?<indent>[ \t]*)/;
    const match = strings[0].match(firstLineWhitespaceRegex);
    indent = match?.groups.indent;
  }

  // Determine the modified strings. If this invoked as a JS tagged template
  // literal, the `strings` argument will be an odd array-ish object that we'll
  // want to convert to a real array.
  let modified;
  if (indent) {
    // De-indent the strings.
    const indentationRegex = new RegExp(`\n${indent}`, "g");
    // The `replaceAll` also converts strings to a real array.
    modified = strings.map((string) =>
      string.replaceAll(indentationRegex, "\n")
    );
    // Remove indentation from last line of last string
    modified[modified.length - 1] = modified
      .at(-1)
      .replace(lastLineWhitespaceRegex, "\n");
  } else {
    // No indentation; just copy the strings so we have a real array
    modified = strings.slice();
  }

  // Phase two: Identify any block placholders, identify and remove their
  // preceding indentation, and remove the following newline. Work backward from
  // the end towards the start because we're modifying the strings in place and
  // our pattern matching won't work going forward from start to end.
  let blockIndentations = [];
  for (let i = modified.length - 2; i >= 0; i--) {
    // Get the modified before and after substitution with index `i`
    const beforeString = modified[i];
    const afterString = modified[i + 1];
    const match = beforeString.match(lastLineWhitespaceRegex);
    if (match && afterString.startsWith("\n")) {
      // The substitution between these strings is a block substitution
      let blockIndentation = match.groups.indent;
      blockIndentations[i] = blockIndentation;
      // Trim the before and after strings
      if (blockIndentation) {
        modified[i] = beforeString.slice(0, -blockIndentation.length);
      }
      modified[i + 1] = afterString.slice(1);
    }
  }

  // Remove newline from start of first string *after* removing indentation.
  if (modified[0].startsWith("\n")) {
    modified[0] = modified[0].slice(1);
  }

  return {
    blockIndentations,
    strings: modified,
  };
}

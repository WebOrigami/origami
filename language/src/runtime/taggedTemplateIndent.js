// import taggedTemplate from "./taggedTemplate.js";

const lastLineWhitespaceRegex = /\n(?<indent>[ \t]*)$/;

const mapStringsToModifications = new Map();

export default function taggedTemplateIndent(strings, ...values) {
  let modified = mapStringsToModifications.get(strings);
  if (!modified) {
    modified = modifyStrings(strings);
    mapStringsToModifications.set(strings, modified);
  }
  const { blockIndentations, strings: modifiedStrings } = modified;
  return joinBlocks(modifiedStrings, values, blockIndentations);
}

// Join strings and values, applying the given block indentation to the lines of
// values for block placholders.
function joinBlocks(strings, values, blockIndentations) {
  let result = strings[0];
  for (let i = 0; i < values.length; i++) {
    let text = values[i];
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
  let modified;
  if (strings.length === 0 || !strings[0].startsWith("\n")) {
    // No indentation, so just copy the strings so we have a real array
    modified = strings.slice();
  } else {
    const firstLineWhitespaceRegex = /^\n(?<indent>[ \t]*)/;
    const match = strings[0].match(firstLineWhitespaceRegex);
    indent = match?.groups.indent ?? "";

    if (indent) {
      // Note that JS passes an odd array - like as the `strings` argument.As
      // a side effect of the `replaceAll`, we'll convert it to a real array.
      const indentationRegex = new RegExp(`\n${indent}`, "g");
      modified = strings.map((string) =>
        string.replaceAll(indentationRegex, "\n")
      );

      // Remove indentation from last line of last string
      modified[modified.length - 1] = modified
        .at(-1)
        .replace(lastLineWhitespaceRegex, "\n");
    }
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
  if (indent) {
    modified[0] = modified[0].slice(1);
  }

  return {
    blockIndentations,
    strings: modified,
  };
}

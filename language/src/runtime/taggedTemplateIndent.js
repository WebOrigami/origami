// import taggedTemplate from "./taggedTemplate.js";

const lastLineWhitespaceRegex = /\n(?<indent>[ \t]*)$/;

export default function taggedTemplateIndent(strings, ...values) {
  if (strings.length === 0) {
    return "";
  }

  let indent;
  if (strings[0].startsWith("\n")) {
    // Phase one: Identify the indentation based on the first real line of the
    // first string (skipping the initial newline), and remove this indentation
    // from all lines of all strings.

    const firstLineWhitespaceRegex = /^\n(?<indent>[ \t]*)/;
    const match = strings[0].match(firstLineWhitespaceRegex);
    indent = match?.groups.indent ?? "";

    if (indent) {
      // Note that JS passes an odd array - like as the `strings` argument.As
      // a side effect of the `replaceAll`, we'll convert it to a real array.
      const indentationRegex = new RegExp(`\n${indent}`, "g");
      strings = strings.map((string) =>
        string.replaceAll(indentationRegex, "\n")
      );

      // Remove indentation from last line of last string
      strings[strings.length - 1] = strings
        .at(-1)
        .replace(lastLineWhitespaceRegex, "\n");
    } else {
      // No indentation, so just copy the strings so we have a real array
      strings = strings.slice();
    }
  }

  // Phase two: Identify any block placholders, identify and remove their
  // preceding indentation, and remove the following newline. Work backward from
  // the end towards the start because we're modifying the strings in place and
  // our pattern matching won't work going forward from start to end.
  let blockIndentations = [];
  for (let i = strings.length - 2; i >= 0; i--) {
    // Get the strings before and after substitution with index `i`
    const beforeString = strings[i];
    const afterString = strings[i + 1];
    const match = beforeString.match(lastLineWhitespaceRegex);
    if (match && afterString.startsWith("\n")) {
      // The substitution between these strings is a block substitution
      let blockIndentation = match.groups.indent;
      blockIndentations[i] = blockIndentation;
      // Trim the before and after strings
      if (blockIndentation) {
        strings[i] = beforeString.slice(0, -blockIndentation.length);
      }
      strings[i + 1] = afterString.slice(1);
    }
  }

  // Remove newline from start of first string *after* removing indentation.
  if (indent) {
    strings[0] = strings[0].slice(1);
  }

  return joinBlocks(strings, values, blockIndentations);
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

import taggedTemplate from "./taggedTemplate.js";

const lastLineWhitespaceRegex = /\n(?<indent>[ \t]*)$/;

export default function taggedTemplateHtml(strings, ...values) {
  let isBlockTemplate;
  let indent;

  // Does first string start with newline?
  if (strings.length === 0 || !strings[0].startsWith("\n")) {
    isBlockTemplate = false;
  } else {
    // Is last line of last string empty, or just have whitespace indentation?
    const lastString = strings.at(-1);
    const match = lastString.match(lastLineWhitespaceRegex);
    if (match) {
      // Yes, this is a block template, note the indentation
      isBlockTemplate = true;
      indent = match.groups.indent;
    } else {
      isBlockTemplate = false;
    }
  }

  if (!isBlockTemplate) {
    // Use JS behavior
    return taggedTemplate(strings, values);
  }

  // Remove indentation from all strings, matching against the original indent
  // string. Note that JS passes an odd array-like as the `strings` argument. As
  // a side effect of the `replaceAll`, we'll convert it to a real array.
  const indentationRegex = new RegExp(`\n${indent}`, "g");
  strings = strings.map((string) => string.replaceAll(indentationRegex, "\n"));

  // Identify any block substitutions, identify and remove their preceding
  // indentation, remove the following newline.
  let blockIndentations = [];
  for (let i = 0; i < strings.length - 1; i++) {
    // Get the strings before and after substitution with index `i`
    const beforeString = strings[i];
    const afterString = strings[i + 1];
    const match = beforeString.match(lastLineWhitespaceRegex);
    if (match && afterString.startsWith("\n")) {
      // The substitution between these strings is a block substitution
      let blockIndentation = match.groups.indent;
      blockIndentations[i] = blockIndentation;
      // Trim the before and after strings
      strings[i] = beforeString.slice(0, -blockIndentation.length);
      strings[i + 1] = afterString.slice(1);
    }
  }

  // Remove newline from start of first string *after* removing indentation.
  strings[0] = strings[0].slice(1);

  return joinBlocks(strings, values, blockIndentations);
}

// Join strings and values, applying the given block indentation to the lines of
// values for block substitutions.
function joinBlocks(strings, values, blockIndentations) {
  let result = strings[0];
  for (let i = 0; i < values.length; i++) {
    let text = values[i];
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
    result += text + strings[i + 1];
  }
  return result;
}

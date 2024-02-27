import { createExpressionFunction } from "../runtime/expressionFunction.js";
import { parse } from "./parse.js";

function compile(source, startRule) {
  if (typeof source === "string") {
    source = { text: source };
  }
  // Trim whitespace from template blocks before we begin lexing, as our
  // heuristics are non-local and hard to implement in our parser.
  const preprocessed = trimTemplateWhitespace(source.text);
  const code = parse(preprocessed, {
    grammarSource: source,
    startRule,
  });
  const fn = createExpressionFunction(code);
  return fn;
}

export function expression(source) {
  return compile(source, "expression");
}

export function templateDocument(source) {
  return compile(source, "templateDocument");
}

// Trim the whitespace around and in substitution blocks in a template. There's
// no explicit syntax for blocks, but we infer them as any place where a
// substitution itself contains a multi-line template literal.
//
// Example:
//
//     ${ if `
//       true text
//     `, `
//       false text
//     ` }
//
// Case 1: a substitution that starts the text or starts a line (there's only
// whitespace before the `${`), and has the line end with the start of a
// template literal (there's only whitespace after the backtick) marks the start
// of a block.
//
// Case 2: a line in the middle that ends one template literal and starts
// another is an internal break in the block. Edge case: three backticks in a
// row, like ```, are common in markdown and are not treated as a break.
//
// Case 3: a line that ends a template literal and ends with `}` or ends the
// text marks the end of the block.
//
// In all three cases, we trim spaces and tabs from the start and end of the
// line. In case 1, we also remove the preceding newline.
function trimTemplateWhitespace(text) {
  const regex1 = /(^|\n)[ \t]*(\${.*?`)[ \t]*\n/g;
  const regex2 = /\n[ \t]*(`(?!`).*?`)[ \t]*\n/g;
  const regex3 = /\n[ \t]*(`(?!`).*?})[ \t]*(?:\n|$)/g;
  const trimBlockStarts = text.replace(regex1, "$1$2");
  const trimBlockBreaks = trimBlockStarts.replace(regex2, "\n$1");
  const trimBlockEnds = trimBlockBreaks.replace(regex3, "\n$1");
  return trimBlockEnds;
}

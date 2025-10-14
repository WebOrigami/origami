import { isUnpackable, toString } from "@weborigami/async-tree";
import { Marked } from "marked";

export default async function mdOutline(input) {
  if (isUnpackable(input)) {
    input = await input.unpack();
  }
  const inputIsDocument = typeof input === "object" && "_body" in input;
  const markdown = inputIsDocument ? input._body : toString(input);
  if (markdown === null) {
    throw new Error("mdHtml: The provided input couldn't be treated as text.");
  }

  // Call the marked lexer to parse the markdown into tokens
  const marked = new Marked();
  const lexer = new marked.Lexer();
  const tokens = lexer.lex(markdown);

  // Turn the linear list of tokens into a hierarchical outline
  const outline = {};
  const stack = [];
  let sectionText = "";
  /** @type {any} */
  let current = outline;
  for (const token of tokens) {
    if (token.type === "heading") {
      // Current section text gets added as content for the current node.
      if (sectionText) {
        current._text = sectionText.trim();
        sectionText = "";
      }

      // Pop the stack to find the right level for this heading
      const { depth, text: headingText } = token;
      while (stack.length >= depth) {
        current = stack.pop();
        consolidateText(current);
      }

      // Start a new node for this heading
      const newNode = {};
      current[headingText] = newNode;
      stack.push(current);
      current = newNode;
    } else {
      // Body element, accumulate text
      sectionText += token.raw;
    }
  }

  // Any remaining section text gets added as content for the current node.
  if (sectionText) {
    current._text = sectionText.trim();
    current = stack.pop();
    if (current) {
      consolidateText(current);
    }
  }

  return outline;
}

function consolidateText(node) {
  // If the node's last property value is an object with only a _text property,
  // destructively edit the value to be just the text.
  const keys = Object.keys(node);
  if (keys.length === 0) {
    return;
  }
  const lastKey = keys[keys.length - 1];
  const lastValue = node[lastKey];
  if (
    typeof lastValue === "object" &&
    lastValue !== null &&
    Object.keys(lastValue).length === 1 &&
    typeof lastValue._text === "string"
  ) {
    node[lastKey] = lastValue._text;
  }
}

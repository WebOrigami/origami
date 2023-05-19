import { extractFrontMatter } from "../core/utilities.js";

export default function body(input) {
  const { bodyText } = extractFrontMatter(input);
  return bodyText;
}

body.usage = `@body <text>\tThe body of the text without any front matter`;
body.documentation = "https://graphorigami.org/language/@body.html";

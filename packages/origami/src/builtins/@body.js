import { createTextDocument } from "../common/createTextDocument.js";

export default function body(input) {
  const document = createTextDocument(input);
  return document.bodyText;
}

body.usage = `@body <text>\tThe body of the text without any front matter`;
body.documentation = "https://graphorigami.org/language/@body.html";

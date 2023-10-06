import TextDocument from "../common/TextDocument.js";

export default function body(input) {
  const document = new TextDocument(input);
  return document.text;
}

body.usage = `@body <text>\tThe body of the text without any front matter`;
body.documentation = "https://graphorigami.org/language/@body.html";

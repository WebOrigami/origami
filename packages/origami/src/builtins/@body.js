export default function body(input) {
  const document = new TextDocument2(input);
  return document.bodyText;
}

body.usage = `@body <text>\tThe body of the text without any front matter`;
body.documentation = "https://graphorigami.org/language/@body.html";

import TextWithContents from "../common/TextWithContents.js";
import { extractFrontMatter } from "../common/serialize.js";

export default function body(input) {
  const { bodyText } = extractFrontMatter(input);
  return input.contents
    ? new TextWithContents(bodyText, input.contents)
    : bodyText;
}

body.usage = `@body <text>\tThe body of the text without any front matter`;
body.documentation = "https://graphorigami.org/language/@body.html";

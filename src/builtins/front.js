import { extractFrontMatter } from "../core/utilities.js";

export default async function front(text) {
  const frontMatter = extractFrontMatter(text.toString());
  return frontMatter?.frontData;
}

front.usage = `front <text>\tReturn the text's parsed front matter`;
front.documentation = "https://graphorigami.org/cli/builtins.html#front";

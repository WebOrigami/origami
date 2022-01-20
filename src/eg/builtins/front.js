import { extractFrontMatter } from "../../core/utilities.js";

export default async function front(text) {
  const frontMatter = extractFrontMatter(text);
  return frontMatter?.frontData;
}

front.usage = `front <text>\tReturn the text's parsed front matter`;
front.documentation = "https://explorablegraph.org/pika/builtins.html#front";

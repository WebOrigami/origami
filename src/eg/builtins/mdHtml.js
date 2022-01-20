import highlight from "highlight.js";
import { marked } from "marked";
import { extractFrontMatter } from "../../core/utilities.js";

marked.setOptions({
  gfm: true, // Use GitHub-flavored markdown.
  highlight: (code, lang) => {
    const language = highlight.getLanguage(lang) ? lang : "plaintext";
    return highlight.highlight(code, { language }).value;
  },
});

export default async function mdHtml(markdown) {
  if (!markdown) {
    return undefined;
  }
  // Preserve any front matter.
  const frontMatter = extractFrontMatter(markdown);
  const bodyText = frontMatter?.bodyText ?? markdown;
  const frontBlock = frontMatter?.frontBlock ?? "";
  const html = marked(String(bodyText));
  const output = `${frontBlock}${html}`;
  return output;
}

mdHtml.usage = `mdHtml <markdown>\tRender the markdown text as HTML`;
mdHtml.documentation = "https://explorablegraph.org/pika/builtins.html#mdHtml";

import highlight from "highlight.js";
import { marked } from "marked";
import { outputWithGraph } from "../core/utilities.js";

marked.setOptions({
  gfm: true, // Use GitHub-flavored markdown.
  highlight: (code, lang) => {
    const language = highlight.getLanguage(lang) ? lang : "plaintext";
    return highlight.highlight(code, { language }).value;
  },
  smartypants: true,
});

export default async function mdHtml(input, emitFrontMatter = false) {
  if (!input) {
    return undefined;
  }

  const markdown = input.bodyText ?? String(input);
  const html = marked(markdown);
  const result = await outputWithGraph(
    html,
    input.toGraph?.(),
    emitFrontMatter
  );
  return result;
}

mdHtml.usage = `@mdHtml <markdown>\tRender the markdown text as HTML`;
mdHtml.documentation = "https://graphorigami.org/language/@mdHtml.html";

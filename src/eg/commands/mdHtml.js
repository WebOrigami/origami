import highlight from "highlight.js";
import marked from "marked";

marked.setOptions({
  gfm: true, // Use GitHub-flavored markdown.
  highlight: (code, lang) => {
    const language = highlight.getLanguage(lang) ? lang : "plaintext";
    return highlight.highlight(code, { language }).value;
  },
});

export default async function mdHtml(markdown) {
  return marked(String(markdown));
}

mdHtml.usage = `mdHtml(markdown)\tRender the markdown text as HTML`;

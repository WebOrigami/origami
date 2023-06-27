import highlight from "highlight.js";
import { marked } from "marked";
import { gfmHeadingId as markedGfmHeadingId } from "marked-gfm-heading-id";
import { markedHighlight } from "marked-highlight";
import { markedSmartypants } from "marked-smartypants";
import { outputWithGraph } from "../common/serialize.js";

marked.use(
  markedGfmHeadingId(),
  markedHighlight({
    highlight(code, lang) {
      const language = highlight.getLanguage(lang) ? lang : "plaintext";
      return highlight.highlight(code, { language }).value;
    },

    langPrefix: "hljs language-",
  }),
  markedSmartypants(),
  {
    gfm: true, // Use GitHub-flavored markdown.
    mangle: false,
  }
);

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

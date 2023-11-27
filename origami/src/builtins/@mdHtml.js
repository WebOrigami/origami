import highlight from "highlight.js";
import { marked } from "marked";
import { gfmHeadingId as markedGfmHeadingId } from "marked-gfm-heading-id";
import { markedHighlight } from "marked-highlight";
import { markedSmartypants } from "marked-smartypants";
import * as textDocument2 from "../common/textDocument2.js";

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
    // @ts-ignore
    mangle: false,
  }
);

/**
 * @typedef {import("@graphorigami/async-tree").StringLike} StringLike
 *
 * @this {import("@graphorigami/types").AsyncTree|null|void}
 * @param {StringLike} input
 */
export default async function mdHtml(input) {
  const markdown = String(input);
  const html = marked(markdown);
  const htmlDocument = textDocument2.bodyWithData(html, input);
  return htmlDocument;
}

mdHtml.usage = `@mdHtml <markdown>\tRender the markdown text as HTML`;
mdHtml.documentation = "https://graphorigami.org/language/@mdHtml.html";

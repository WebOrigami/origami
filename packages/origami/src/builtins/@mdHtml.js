import highlight from "highlight.js";
import { marked } from "marked";
import { gfmHeadingId as markedGfmHeadingId } from "marked-gfm-heading-id";
import { markedHighlight } from "marked-highlight";
import { markedSmartypants } from "marked-smartypants";
import TextDocument from "../common/TextDocument.js";
import { createTextDocument } from "../common/createTextDocument.js";

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

/**
 * @typedef {import("../..").StringLike} StringLike
 *
 * @this {import("@graphorigami/types").AsyncDictionary|null|void}
 * @param {StringLike} input
 */
export default async function mdHtml(input) {
  const markdownDocument = createTextDocument(input);
  const markdown = markdownDocument.bodyText;
  const html = marked(markdown);
  return new TextDocument(html, {
    contents: () => markdownDocument.contents?.(),
    parent: this ?? undefined,
  });
}

mdHtml.usage = `@mdHtml <markdown>\tRender the markdown text as HTML`;
mdHtml.documentation = "https://graphorigami.org/language/@mdHtml.html";

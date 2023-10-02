import highlight from "highlight.js";
import { marked } from "marked";
import { gfmHeadingId as markedGfmHeadingId } from "marked-gfm-heading-id";
import { markedHighlight } from "marked-highlight";
import { markedSmartypants } from "marked-smartypants";
import TextFile from "../common/TextFile.js";

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
 * @param {StringLike} input
 */
export default async function mdHtml(input) {
  const markdown = TextFile.bodyText(input);
  const html = marked(markdown);
  return new TextFile(html, { contents: input.contents });
}

mdHtml.usage = `@mdHtml <markdown>\tRender the markdown text as HTML`;
mdHtml.documentation = "https://graphorigami.org/language/@mdHtml.html";

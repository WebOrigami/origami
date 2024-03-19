import highlight from "highlight.js";
import { marked } from "marked";
import { gfmHeadingId as markedGfmHeadingId } from "marked-gfm-heading-id";
import { markedHighlight } from "marked-highlight";
import { markedSmartypants } from "marked-smartypants";
import document from "../common/document.js";
import { replaceExtension } from "../common/utilities.js";

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
 * @typedef {import("@weborigami/async-tree").StringLike} StringLike
 * @typedef {import("@weborigami/async-tree").Unpackable<StringLike>} UnpackableStringlike
 *
 * @this {import("@weborigami/types").AsyncTree|null|void}
 * @param {StringLike|UnpackableStringlike} input
 */
export default async function mdHtml(input) {
  if (/** @type {any} */ (input).unpack) {
    input = await /** @type {any} */ (input).unpack();
  }
  const inputDocument = input["@text"] ? input : null;
  const markdown = inputDocument?.["@text"] ?? String(input);
  const html = marked(markdown);
  return inputDocument ? document(html, inputDocument) : html;
}

mdHtml.key = (sourceKey) => replaceExtension(sourceKey, ".md", ".html");
mdHtml.inverseKey = (resultKey) => replaceExtension(resultKey, ".html", ".md");

mdHtml.usage = `@mdHtml <markdown>\tRender the markdown text as HTML`;
mdHtml.documentation = "https://weborigami.org/language/@mdHtml.html";

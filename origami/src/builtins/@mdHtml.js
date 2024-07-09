import { isUnpackable } from "@weborigami/async-tree";
import highlight from "highlight.js";
import { marked } from "marked";
import { gfmHeadingId as markedGfmHeadingId } from "marked-gfm-heading-id";
import { markedHighlight } from "marked-highlight";
import { markedSmartypants } from "marked-smartypants";
import documentObject from "../common/documentObject.js";
import { replaceExtension, toString } from "../common/utilities.js";

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
 * Transform markdown to HTML.
 *
 * @typedef {import("@weborigami/async-tree").StringLike} StringLike
 * @typedef {import("@weborigami/async-tree").Unpackable<StringLike>} UnpackableStringlike
 *
 * @this {import("@weborigami/types").AsyncTree|null|void}
 * @param {StringLike|UnpackableStringlike} input
 */
export default async function mdHtml(input) {
  if (isUnpackable(input)) {
    input = await input.unpack();
  }
  const inputIsDocument = input["@text"] !== undefined;
  const markdown = toString(input);
  if (markdown === null) {
    throw new Error("@mdHtml: The provided input couldn't be treated as text.");
  }
  const html = marked(markdown);
  return inputIsDocument ? documentObject(html, input) : html;
}

mdHtml.key = (sourceKey) => replaceExtension(sourceKey, ".md", ".html");
mdHtml.inverseKey = (resultKey) => replaceExtension(resultKey, ".html", ".md");

mdHtml.usage = `@mdHtml <markdown>\tRender the markdown text as HTML`;
mdHtml.documentation = "https://weborigami.org/language/@mdHtml.html";

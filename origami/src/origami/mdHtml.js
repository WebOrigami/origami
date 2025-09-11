import { extension, isUnpackable } from "@weborigami/async-tree";
import highlight from "highlight.js";
import { Marked } from "marked";
import { gfmHeadingId as markedGfmHeadingId } from "marked-gfm-heading-id";
import { markedHighlight } from "marked-highlight";
import { markedSmartypants } from "marked-smartypants";
import documentObject from "../common/documentObject.js";
import { toString } from "../common/utilities.js";
import origamiHighlightDefinition from "./origamiHighlightDefinition.js";

highlight.registerLanguage("ori", origamiHighlightDefinition);

// Create our own marked instance so we don't interfere with the global one
const marked = new Marked();
marked.use(
  // @ts-ignore
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
  }
);

/**
 * Transform markdown to HTML.
 *
 * @typedef {import("@weborigami/async-tree").StringLike} StringLike
 * @typedef {import("@weborigami/async-tree").Unpackable<StringLike>} UnpackableStringlike
 *
 * @param {StringLike|UnpackableStringlike} input
 */
export default async function mdHtml(input) {
  if (input == null) {
    const error = new TypeError("mdHtml: The input is not defined.");
    /** @type {any} */ (error).position = 0;
    throw error;
  }
  if (isUnpackable(input)) {
    input = await input.unpack();
  }
  const inputIsDocument = typeof input === "object" && "_body" in input;
  const markdown = toString(input);
  if (markdown === null) {
    throw new Error("mdHtml: The provided input couldn't be treated as text.");
  }
  const html = marked.parse(markdown);
  return inputIsDocument ? documentObject(html, input) : html;
}

mdHtml.key = (sourceValue, sourceKey) =>
  extension.replace(sourceKey, ".md", ".html");
mdHtml.inverseKey = (resultKey) => extension.replace(resultKey, ".html", ".md");

import { Graph } from "@graphorigami/core";
import highlight from "highlight.js";
import { marked } from "marked";
import { gfmHeadingId as markedGfmHeadingId } from "marked-gfm-heading-id";
import { markedHighlight } from "marked-highlight";
import { markedSmartypants } from "marked-smartypants";
import MergeGraph from "../common/MergeGraph.js";
import TextWithContents from "../common/TextWithContents.js";

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

export default async function mdHtml(input) {
  if (!input) {
    return undefined;
  }

  const markdown = String(input);
  const html = marked(markdown);
  if (!input.contents) {
    return html;
  }

  /** @type {any} */
  return new TextWithContents(
    html,
    async () =>
      new MergeGraph(
        {
          // @ts-ignore
          [Graph.defaultValueKey]: html,
        },
        await input.contents()
      )
  );
}

mdHtml.usage = `@mdHtml <markdown>\tRender the markdown text as HTML`;
mdHtml.documentation = "https://graphorigami.org/language/@mdHtml.html";

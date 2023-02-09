import highlight from "highlight.js";
import { marked } from "marked";
import StringWithGraph from "../common/StringWithGraph.js";
import { extractFrontMatter } from "../core/utilities.js";

marked.setOptions({
  gfm: true, // Use GitHub-flavored markdown.
  highlight: (code, lang) => {
    const language = highlight.getLanguage(lang) ? lang : "plaintext";
    return highlight.highlight(code, { language }).value;
  },
  smartypants: true,
});

export default async function mdHtml(input) {
  if (!input) {
    return undefined;
  }

  // If there's front matter, extract it and the body text.
  const text = String(input);
  const frontMatter = extractFrontMatter(text);
  const markdown = frontMatter?.bodyText ?? text;

  const html = marked(markdown);

  let output;
  if (frontMatter) {
    // Preserve front matter
    const { frontBlock, frontData } = frontMatter;
    const outputText = `${frontBlock}${html}`;
    const outputData = {
      ...frontData,
      "@text": html,
    };
    output = new StringWithGraph(outputText, outputData);
  } else {
    output = html;
  }

  return output;
}

mdHtml.usage = `mdHtml <markdown>\tRender the markdown text as HTML`;
mdHtml.documentation = "https://graphorigami.org/cli/builtins.html#mdHtml";

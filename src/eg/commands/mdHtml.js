import marked from "marked";

export default async function mdHtml(markdown) {
  return marked(String(markdown));
}

mdHtml.usage = `mdHtml(markdown)\tRender the markdown text as HTML`;

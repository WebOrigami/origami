import marked from "marked";

export default async function markdown(markdown) {
  return marked(String(markdown));
}

markdown.usage = `markdown(text)\tRender the markdown text as HTML`;

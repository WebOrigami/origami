import marked from "marked";

export default async function htmlFromMarkdown(data) {
  const markdown = String(data);
  const headingRegex = /#(?<heading>.+)/;
  const match = headingRegex.exec(markdown);
  const title = match?.groups?.heading ?? filename;
  const html = marked(markdown);
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>${title}</title>
  </head>
  <body>
    ${html}
  </body>
</html>
`;
}

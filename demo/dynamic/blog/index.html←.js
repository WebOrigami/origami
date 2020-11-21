import path from "path";
import pages from "./posts/pages←.js";

export default async function () {
  const posts = await pages();
  const postList = posts
    .map((post) => {
      const basename = path.basename(post, ".html");
      return `<li><a href="posts/${post}">${basename}</a></li>`;
    })
    .join("");
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Blog</title>
  </head>
  <body>
    <h1>Blog</h1>
    <ul>
      ${postList}
    </ul>
  </body>
</html>
`;
}

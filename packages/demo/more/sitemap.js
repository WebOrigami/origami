import cheerio from "cheerio";
import path from "path";
import { fileURLToPath } from "url";
import fetch from "../../src/fetch.js";
import FunctionGraph from "../../src/FunctionGraph.js";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const postUrlPrefix = "https://component.kitchen/blog/posts/";

const data = await fetch("https://component.kitchen/sitemap.xml");
const sitemap = String(data);

function extractUrls(sitemap) {
  const urls = [];
  const $ = cheerio.load(sitemap, { xmlMode: true });

  $("loc").each(function () {
    const url = $(this).text();
    if (!urls.includes(url)) {
      urls.push(url);
    }
  });

  return urls;
}

let urls = extractUrls(sitemap);
const postUrls = urls
  .filter((url) => url.startsWith(postUrlPrefix))
  .slice(0, 3);
const functions = {};
postUrls.forEach(async (postUrl) => {
  const postName = postUrl.replace(postUrlPrefix, "");
  const postFileName = `${postName}.html`;
  const fn = async () => {
    const data = await fetch(postUrl);
    return String(data);
  };
  functions[postFileName] = fn;
});
const postGraph = new FunctionGraph(functions);

export default postGraph;

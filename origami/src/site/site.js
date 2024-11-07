import audit from "./audit.js";
import crawl from "./crawler/crawl.js";
import index from "./index.js";
import jsonKeys from "./jsonKeys.js";
import redirect from "./redirect.js";
import rss from "./rss.js";
import sitemap from "./sitemap.js";
import slug from "./slug.js";
import staticBuiltin from "./static.js";

const commands = {
  audit,
  crawl,
  index,
  jsonKeys,
  redirect,
  rss,
  sitemap,
  slug,
  static: staticBuiltin,
};

Object.defineProperty(commands, "description", {
  enumerable: false,
  value: "Add common website features",
});

export default commands;

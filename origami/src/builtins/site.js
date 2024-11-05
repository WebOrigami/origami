import * as deprecate from "../common/deprecate.js";
import crawl from "./@crawl.js";
import index from "./@index.js";
import jsonKeys from "./@jsonKeys.js";
import redirect from "./@redirect.js";
import rss from "./@rss.js";
import audit from "./@siteAudit.js";
import sitemap from "./@sitemap.js";
import slug from "./@slug.js";
import staticBuiltin from "./@static.js";

export default deprecate.commands({
  audit,
  crawl,
  index,
  jsonKeys,
  redirect,
  rss,
  sitemap,
  slug,
  static: staticBuiltin,
});
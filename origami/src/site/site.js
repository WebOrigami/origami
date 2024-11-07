import helpRegistry from "../common/helpRegistry.js";
export { default as audit } from "./audit.js";
export { default as crawl } from "./crawler/crawl.js";
export { default as index } from "./index.js";
export { default as jsonKeys } from "./jsonKeys.js";
export { default as redirect } from "./redirect.js";
export { default as rss } from "./rss.js";
export { default as sitemap } from "./sitemap.js";
export { default as slug } from "./slug.js";
export { default as staticBuiltin } from "./static.js";

helpRegistry.set("site:", "Add common website features");

import ExplorableSite from "../../core/ExplorableSite.js";

export default async function site(url) {
  return new ExplorableSite(url);
}

site.usage = `site(url)\tThe explorable site at url`;

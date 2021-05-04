import { ExplorableSite } from "../../web/exports.js";

export default async function explorableSite(url) {
  return new ExplorableSite(url);
}

explorableSite.usage = `ExplorableSite(url)\tThe explorable site at url`;

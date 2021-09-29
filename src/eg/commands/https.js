import ExplorableSite from "../../core/ExplorableSite.js";

export default async function https(domain, ...keys) {
  const site = new ExplorableSite(`https://${domain}`);
  return await site.get(...keys);
}

https.usage = `https(domain, ...keys)\tA web resource`;

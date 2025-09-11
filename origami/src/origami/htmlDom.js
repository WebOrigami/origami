import loadJsDom from "../common/loadJsDom.js";

export default async function htmlDom(html) {
  const { JSDOM } = await loadJsDom();
  const dom = JSDOM.fragment(html);
  return dom;
}

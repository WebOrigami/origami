import { JSDOM } from "jsdom";

export default function htmlDom(html) {
  const dom = JSDOM.fragment(html);
  return dom;
}

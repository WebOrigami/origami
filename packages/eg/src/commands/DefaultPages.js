import { DefaultPages } from "../../web/exports.js";

export default function defaultPages(graph) {
  return new DefaultPages(graph);
}

defaultPages.usage = `DefaultPages()\tCreates default index.html pages for node's keys`;

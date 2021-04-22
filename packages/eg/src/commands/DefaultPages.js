import { DefaultPages } from "@explorablegraph/web";

export default function defaultPages(graph) {
  return new DefaultPages(graph);
}

defaultPages.usage = `DefaultPages()\tCreates default index.html pages for node's keys`;

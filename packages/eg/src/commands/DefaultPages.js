import { DefaultPages } from "@explorablegraph/web";

export default function createIndexPage(graph) {
  return new DefaultPages(graph);
}

createIndexPage.usage = `DefaultPages()\tCreates default index.html pages for node's keys`;

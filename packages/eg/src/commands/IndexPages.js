import { IndexPages } from "@explorablegraph/web";

export default function createIndexPage(graph) {
  return new IndexPages(graph);
}

createIndexPage.usage = `IndexPages()                           Creates default index.html pages for node's keys`;

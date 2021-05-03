import { ExplorableApp } from "@explorablegraph/web";

export default function app(graph) {
  return new ExplorableApp(graph);
}

app.usage = `App([files])\tCreates a basic server app for the given set of files`;

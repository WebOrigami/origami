import path from "path";
import ExplorableFiles from "../../node/ExplorableFiles.js";
import appOf from "./appOf.js";

/**
 * Wrap the graph for the current directory with an app.
 */
export default async function app(key) {
  const dirname = path.resolve(process.cwd());
  const files = new ExplorableFiles(dirname);
  const graph = await appOf(files);
  return key === undefined ? graph : await graph.get(key);
}

app.usage = `app()\tWrap the graph for the current directory with an app`;

import path from "path";
import ExplorableFiles from "../../node/ExplorableFiles.js";
import graphApp from "./graphApp.js";

/**
 * Wrap the graph for the current directory with an app.
 */
export default async function app(key) {
  const dirname = path.resolve(process.cwd());
  const files = new ExplorableFiles(dirname);
  const graph = await graphApp(files);
  return key === undefined ? graph : await graph.get(key);
}

app.usage = `app\tWrap the graph for the current directory with an app`;

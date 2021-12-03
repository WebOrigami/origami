import path from "path";
import ExplorableFiles from "../../node/ExplorableFiles.js";
import appOf from "./appOf.js";

/**
 * Wrap the graph for the current directory with an app.
 */
export default async function app() {
  const dirname = path.resolve(process.cwd());
  const files = new ExplorableFiles(dirname);
  return await appOf(files);
}

app.usage = `app()\tWrap the graph for the current directory with an app`;

// import defaultPages from "../../app/defaultPages.js";
import path from "path";
import MetaMixin from "../../app/MetaMixin.js";
import ExplorableGraph from "../../core/ExplorableGraph.js";
import { applyMixinToObject } from "../../core/utilities.js";
import ExplorableFiles from "../../node/ExplorableFiles.js";
import config from "./config.js";

// Start an ExplorableApp
export default async function app(variant) {
  let meta;
  if (variant) {
    const graph = ExplorableGraph.from(variant);
    meta = applyMixinToObject(MetaMixin, graph);
  } else {
    const dirname = path.resolve(process.cwd());
    meta = new (MetaMixin(ExplorableFiles))(dirname);
    meta.scope = await config(dirname);
  }
  // meta.inheritedFallbacks = defaultPages;
  return meta;
}

app.usage = `app()\tAn explorable application graph for the current directory`;

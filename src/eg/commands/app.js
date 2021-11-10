import path from "path";
import process from "process";
import DefaultPagesMixin from "../../app/DefaultPagesMixin.js";
import MetaMixin from "../../app/MetaMixin.js";
import { applyMixinToGraph } from "../../core/utilities.js";
import ExplorableFiles from "../../node/ExplorableFiles.js";
import config from "./config.js";

// Start an ExplorableApp
export default async function app(...keys) {
  const appPath = path.resolve(process.cwd(), ...keys);
  let graph = new ExplorableFiles(appPath);
  const meta = applyMixinToGraph(MetaMixin, graph);
  const result = applyMixinToGraph(DefaultPagesMixin, meta);
  result.scope = await config(appPath);
  return result;
}

app.usage = `app()\tAn explorable application graph for the current directory`;

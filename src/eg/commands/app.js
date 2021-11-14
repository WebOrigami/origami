import DefaultPages from "../../app/DefaultPages.js";
// import DefaultPagesMixin from "../../app/DefaultPagesMixin.js";
import MetaMixin from "../../app/MetaMixin.js";
import ExplorableGraph from "../../core/ExplorableGraph.js";
import { applyMixinToObject } from "../../core/utilities.js";
import config from "./config.js";

// Start an ExplorableApp
export default async function app(variant = this.graph, ...keys) {
  const graph = ExplorableGraph.from(variant);
  const meta = applyMixinToObject(MetaMixin, graph);
  const result = new DefaultPages(meta);
  result.scope = this?.scope ?? (await config());
  return keys.length > 0 ? await result.get(...keys) : result;
}

app.usage = `app()\tAn explorable application graph for the current directory`;

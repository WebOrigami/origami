import path from "path";
import DefaultPages from "../../app/DefaultPages.js";
import MetaMixin from "../../app/MetaMixin.js";
import ExplorableGraph from "../../core/ExplorableGraph.js";
import { applyMixinToObject } from "../../core/utilities.js";
import config from "./config.js";

/**
 * Wrap a graph in an explorable app.
 *
 * @param {Explorable} variant
 */
export default async function appOf(variant) {
  const graph = ExplorableGraph.from(variant);
  const meta = applyMixinToObject(MetaMixin, graph);
  if (!meta.scope) {
    const scopePath =
      /** @type {any} */ (graph).path ?? path.resolve(process.cwd());
    meta.scope = await config(scopePath);
  }
  const result = new DefaultPages(meta);
  return result;
}

appOf.usage = `appOf(graph)\tCreate an app by wrapping a graph`;

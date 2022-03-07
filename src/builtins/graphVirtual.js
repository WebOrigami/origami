import path from "path";
import ExplorableGraph from "../core/ExplorableGraph.js";
import { transformObject } from "../core/utilities.js";
import DefaultPages from "../framework/DefaultPages.js";
import MetaTransform from "../framework/MetaTransform.js";
import config from "./config.js";

/**
 * Wrap the indicated graph as a virtual app.
 *
 * @param {Explorable} variant
 */
export default async function graphVirtual(variant) {
  const graph = ExplorableGraph.from(variant);
  const meta = transformObject(MetaTransform, graph);
  const scopePath =
    /** @type {any} */ (graph).path ?? path.resolve(process.cwd());
  meta.parent = await config(scopePath);
  const result = new DefaultPages(meta);
  return result;
}

graphVirtual.usage = `graphVirtual <graph>\tWrap the indicatedd graph as a virtual app`;
graphVirtual.documentation =
  "https://explorablegraph.org/pika/builtins.html#graphVirtual";

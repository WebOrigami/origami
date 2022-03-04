import ExplorableGraph from "../../core/ExplorableGraph.js";
import { toSerializable } from "../../core/utilities.js";

/**
 * Render the given object in JSON format.
 *
 * @this {Explorable}
 * @param {any} obj
 */
export default async function json(obj) {
  obj = obj ?? this;
  if (ExplorableGraph.canCastToExplorable(obj)) {
    return await ExplorableGraph.toJson(obj);
  } else {
    const serializable = toSerializable(obj);
    return JSON.stringify(serializable, null, 2);
  }
}

json.usage = "json <obj>\tRender the object as text in JSON format";
json.documentation = "https://explorablegraph.org/pika/builtins.html#json";

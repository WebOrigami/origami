import ExplorableGraph from "../../core/ExplorableGraph.js";
import { toSerializable } from "../../core/utilities.js";

export default async function json(obj = this.graph) {
  if (ExplorableGraph.canCastToExplorable(obj)) {
    return await ExplorableGraph.toJson(obj);
  } else {
    const serializable = toSerializable(obj);
    return JSON.stringify(serializable, null, 2);
  }
}

json.usage = "json(obj)\tRender the object as text in JSON format";

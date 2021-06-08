import ExplorableGraph from "../../core/ExplorableGraph.js";
import { stringify } from "../../core/utilities.js";

export default async function json(obj) {
  if (obj === undefined) {
    return undefined;
  }

  const strings = ExplorableGraph.isExplorable(obj)
    ? // Stringify graph values.
      await ExplorableGraph.strings(obj)
    : // Render to JSON.
      stringify(obj);

  return JSON.stringify(strings, null, 2);
}

json.usage = "json(obj)\tRender obj as JSON text";

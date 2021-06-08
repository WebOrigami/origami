import ExplorableGraph from "../../core/ExplorableGraph.js";
import { stringify } from "../../core/utilities.js";

export default async function json(obj) {
  if (obj === undefined) {
    return undefined;
  } else if (ExplorableGraph.isExplorable(obj)) {
    // Stringify graph values.
    const strings = await ExplorableGraph.strings(obj);
    // Render to JSON.
    return JSON.stringify(strings, null, 2);
  } else {
    return stringify(obj);
  }
}

json.usage = "json(obj)\tRender obj as JSON text";

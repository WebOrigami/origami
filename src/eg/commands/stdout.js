import ExplorableGraph from "../../core/ExplorableGraph.js";
import { stringify } from "../../core/utilities.js";

export default async function stdout(obj) {
  let output;
  if (obj === undefined) {
    return;
  } else if (ExplorableGraph.isExplorable(obj)) {
    // Stringify graph values.
    const strings = await ExplorableGraph.strings(obj);
    // Render to JSON.
    output = JSON.stringify(strings, null, 2);
  } else {
    output = stringify(obj);
  }
  console.log(output);
}

stdout.usage = "stdout(obj)\tWrite obj to the standard output stream";

import YAML from "yaml";
import ExplorableGraph from "../core/ExplorableGraph.js";

export default async function graphToText(value, key = ".yaml") {
  if (typeof value === "string") {
    // Already text
    return value;
  }

  if (typeof value === "function") {
    // Rendering the function as text is probably not what's wanted; better to
    // invoke the function and try serializing the result.
    value = await value();
  }

  if (ExplorableGraph.isExplorable(value)) {
    if (key.endsWith(".json")) {
      const plain = await ExplorableGraph.plain(value);
      return JSON.stringify(plain, null, 2);
    } else if (key.endsWith(".yaml")) {
      const plain = await ExplorableGraph.plain(value);
      return YAML.stringify(plain);
    }
  }

  return value;
}

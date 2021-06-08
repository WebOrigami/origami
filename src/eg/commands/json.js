import strings from "../../common/strings.js";
import ExplorableGraph from "../../core/ExplorableGraph.js";

export default async function json(obj) {
  const plain = ExplorableGraph.isExplorable(obj)
    ? await ExplorableGraph.plain(strings(obj))
    : obj;
  return JSON.stringify(plain, null, 2);
}

json.usage = "json(obj)\tRender the object as text in JSON format";

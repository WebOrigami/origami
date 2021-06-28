import YAML from "yaml";
import strings from "../../common/strings.js";
import ExplorableGraph from "../../core/ExplorableGraph.js";

export default async function yaml(obj) {
  const plain = ExplorableGraph.isExplorable(obj)
    ? await ExplorableGraph.plain(strings(obj))
    : obj instanceof Buffer
    ? String(obj)
    : obj;
  const text = YAML.stringify(plain);
  return text;
}

yaml.usage = `yaml(obj)\tRender the object as text in YAML format`;

import concat from "../src/builtins/concat.js";
import MapExtensionGraph from "../src/common/MapExtensionsGraph.js";

export default async function (src) {
  const mapped = new MapExtensionGraph(src, (value, key) => `${key}\n`, {
    deep: true,
    innerExtension: ".js",
  });
  const text = await concat(mapped);
  return text;
}

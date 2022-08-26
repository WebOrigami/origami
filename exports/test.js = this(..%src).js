import ExplorableGraph from "../src/core/ExplorableGraph.js";

export default async function (src) {
  const keys = await ExplorableGraph.keys(src);
  return keys;
}

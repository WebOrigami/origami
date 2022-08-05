// Demonstrate retrieval of URL search params.

import ExplorableGraph from "../../src/core/ExplorableGraph.js";

export default async function () {
  const params = await this.get("@params");
  // TODO: Shouldn't need to convert this to a plain object.
  const plain = await ExplorableGraph.plain(params);
  return plain;
}

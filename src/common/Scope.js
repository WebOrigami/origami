import Compose from "./Compose.js";

export default class Scope extends Compose {
  constructor(...graphs) {
    const filtered = graphs.filter((graph) => graph !== undefined);
    const flattened = filtered.flatMap((graph) =>
      graph instanceof Compose ? graph.graphs : graph
    );
    // const scopes = flattened.map((graph) => graph.scope ?? graph);
    const scopes = flattened;
    super(...scopes);
  }
}

import { results } from "../core/measure.js";

export default function perf() {
  return results();
}

perf.usage = `perf <value>\tCount of Origami operations to compute value`;
perf.documentation = "https://graphorigami.org/cli/builtins.html#perf";

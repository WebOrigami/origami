import builtins from "../../../src/cli/builtins.js";
import MergeGraph from "../../../src/common/MergeGraph.js";

export default new MergeGraph(
  {
    fn() {
      return "Hello, world.";
    },
  },
  builtins
);

import builtins from "../../../src/builtins/@builtins.js";
import MergeGraph from "../../../src/common/MergeGraph.js";

export default new MergeGraph(
  {
    fn() {
      return "Hello, world.";
    },
    message: "Hello",
  },
  builtins
);

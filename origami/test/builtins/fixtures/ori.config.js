import builtins from "../../../src/builtins/@builtins.js";
import MergeTree from "../../../src/common/MergeTree.js";

export default new MergeTree(
  {
    fn() {
      return "Hello, world.";
    },
    message: "Hello",
  },
  builtins
);

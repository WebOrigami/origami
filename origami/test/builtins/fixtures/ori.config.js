import { merge } from "@graphorigami/async-tree";
import builtins from "../../../src/builtins/@builtins.js";

export default merge(
  {
    fn() {
      return "Hello, world.";
    },
    message: "Hello",
  },
  builtins
);

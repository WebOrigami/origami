import { Compose } from "@explorablegraph/core";
import { builtins } from "@explorablegraph/eg";
import dot from "./src/dot.js";

export default new Compose(
  {
    dot,
  },
  builtins
);

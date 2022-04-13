import builtins from "../../../src/cli/builtins.js";
import Compose from "../../../src/common/Compose.js";

export default new Compose(
  {
    fn() {
      return "Hello, world.";
    },
  },
  builtins
);

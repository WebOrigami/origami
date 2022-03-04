import builtins from "../../../src/cli/builtins.js";
import Compose from "../../../src/common/Compose.js";

export default new Compose(builtins, {
  fn() {
    return "Hello, world.";
  },
});

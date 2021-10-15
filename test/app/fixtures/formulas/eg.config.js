import Compose from "../../../../src/common/Compose.js";
import builtins from "../../../../src/eg/builtins.js";

export default new Compose(builtins, {
  fn() {
    return "Hello, world.";
  },
});

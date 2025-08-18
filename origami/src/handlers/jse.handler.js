import builtinsJse from "../builtinsJse.js";
import getParent from "./getParent.js";
import { oriHandler } from "./handlers.js";

export default {
  ...oriHandler,

  async unpack(packed, options = {}) {
    const parent = getParent(packed, options);
    return oriHandler.unpack(packed, {
      ...options,
      globals: builtinsJse(),
      parent,
    });
  },
};

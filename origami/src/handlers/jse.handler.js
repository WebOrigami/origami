import { builtinsNew, oriHandler } from "../internal.js";
import getParent from "./getParent.js";

export default {
  ...oriHandler,

  async unpack(packed, options = {}) {
    const parent = getParent(packed, options);
    return oriHandler.unpack(packed, {
      ...options,
      globals: builtinsNew,
      mode: "jse",
      parent,
    });
  },
};

import { oriHandler } from "../internal.js";
import getParent from "./getParent.js";
import jseModeParent from "./jseModeParent.js";

export default {
  ...oriHandler,

  async unpack(packed, options = {}) {
    const parent = getParent(packed, options);
    return oriHandler.unpack(packed, {
      ...options,
      mode: "jse",
      parent: await jseModeParent(parent),
    });
  },
};

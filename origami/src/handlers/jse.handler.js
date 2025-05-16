import { oriHandler } from "../internal.js";
import getParent from "./getParent.js";

let builtins;

export default {
  ...oriHandler,

  async unpack(packed, options = {}) {
    const parent = getParent(packed, options);
    builtins ??= (await import("../builtinsNew.js")).default;
    return oriHandler.unpack(packed, {
      ...options,
      globals: builtins,
      mode: "jse",
      parent,
    });
  },
};

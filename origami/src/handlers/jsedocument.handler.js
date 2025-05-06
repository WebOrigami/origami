import { oridocumentHandler } from "../internal.js";
import getParent from "./getParent.js";
import jseModeParent from "./jseModeParent.js";

export default {
  ...oridocumentHandler,

  async unpack(packed, options = {}) {
    const parent = getParent(packed, options);
    return oridocumentHandler.unpack(packed, {
      ...options,
      mode: "jse",
      parent: await jseModeParent(parent),
    });
  },
};

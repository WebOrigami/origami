import getParent from "./getParent.js";
import jseModeParent from "./jseModeParent.js";
import oriDocumentHandler from "./oridocument.handler.js";

export default {
  ...oriDocumentHandler,

  async unpack(packed, options = {}) {
    const parent = getParent(packed, options);
    return oriDocumentHandler.unpack(packed, {
      ...options,
      mode: "jse",
      parent: await jseModeParent(parent),
    });
  },
};

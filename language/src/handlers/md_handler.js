// .md files use the .txt loader
import txt_handler from "./txt_handler.js";

export default {
  ...txt_handler,
  mediaType: "text/markdown",
};

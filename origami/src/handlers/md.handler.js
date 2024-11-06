// .md files use the .txt loader
import fileTypeText from "./txt.handler.js";

export default {
  ...fileTypeText,
  mediaType: "text/markdown",
};

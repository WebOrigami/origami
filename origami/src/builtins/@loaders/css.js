// .css files use the .txt loader
import fileTypeText from "./txt.js";

export default {
  ...fileTypeText,
  mediaType: "text/css",
};

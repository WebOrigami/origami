// .css files use the .txt loader
import fileTypeText from "./txt_handler.js";

export default {
  ...fileTypeText,
  mediaType: "text/css",
};

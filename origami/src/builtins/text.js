import * as deprecate from "../common/deprecate.js";
import document from "./@document.js";
import indent from "./@indent.js";
import inline from "./@inline.js";
import mdHtml from "./@mdHtml.js";

export default deprecate.commands("text:", {
  document,
  indent,
  inline,
  mdHtml,
});

import indent from "./@indent.js";
import mdHtml from "./@mdHtml.js";

const entries = {
  fromMd: mdHtml,
  indent,
};

export default function html(key) {
  return entries[key];
}

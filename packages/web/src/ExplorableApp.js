import { DefaultValues, WildcardKeysMixin } from "../../core/exports.js";
import {
  Files,
  VirtualKeysMixin,
  VirtualValuesMixin,
} from "../../node/exports.js";
import defaultIndexHtml from "./defaultIndexHtml.js";

class AppGraph extends WildcardKeysMixin(
  VirtualKeysMixin(VirtualValuesMixin(Files))
) {}

export default class ExplorableApp extends DefaultValues {
  constructor(dirname) {
    const main = new AppGraph(dirname);
    const defaults = {
      "index.html": defaultIndexHtml,
    };
    super(main, defaults);
  }
}

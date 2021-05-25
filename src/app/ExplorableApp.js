import DefaultValues from "../../src/common/DefaultValues.js";
import CommonFileTypesMixin from "../../src/node/CommonFileTypesMixin.js";
import ExplorableFiles from "../../src/node/ExplorableFiles.js";
import defaultIndexHtml from "./defaultIndexHtml.js";
import VirtualKeysMixin from "./VirtualKeysMixin.js";
import VirtualValuesMixin from "./VirtualValuesMixin.js";
import WildcardKeysMixin from "./WildcardKeysMixin.js";

class AppGraph extends CommonFileTypesMixin(
  WildcardKeysMixin(VirtualKeysMixin(VirtualValuesMixin(ExplorableFiles)))
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

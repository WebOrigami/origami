import FileLoadersTransform from "../common/FileLoadersTransform.js";
import * as ops from "../language/ops.js";
import { objectDefinitions } from "../language/parse.js";
import InheritScopeTransform from "./InheritScopeTransform.js";
import PathTransform from "./PathTransform.js";

class OrigamiGraphBase {
  constructor(text) {
    // Parse the text.
    const parsed = objectDefinitions(text);
    const code = parsed?.value;
    if (!parsed || parsed.rest !== "" || code?.[0] !== ops.object) {
      console.error(`could not parse as an Origami graph: ${text}`);
      return;
    }

    // Separate the parsed simple properties from the formulas.
    this.properties = {};
    this.formulas = {};
    for (const [key, value] of Object.entries(code[1])) {
      if (value instanceof Array) {
        this.formulas[key] = value;
      } else {
        this.properties[key] = value;
      }
    }
  }
}

const OrigamiGraph = PathTransform(
  InheritScopeTransform(FileLoadersTransform(OrigamiGraphBase))
);

export default OrigamiGraph;

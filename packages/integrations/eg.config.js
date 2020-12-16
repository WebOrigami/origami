import { Compose } from "@explorablegraph/core";
import { builtins } from "@explorablegraph/eg";
import markdownOutline from "./src/markdownOutline.js";

markdownOutline.usage = `markdownOutline(markdown)\tTransforms markdown to an outline`;

export default new Compose({ markdownOutline }, builtins);

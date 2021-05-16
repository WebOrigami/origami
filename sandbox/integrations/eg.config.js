import { Compose } from "../../core/exports.js";
import { builtins } from "../../eg/exports.js";
import markdownOutline from "./src/markdownOutline.js";

markdownOutline.usage = `markdownOutline(markdown)\tTransforms markdown to an outline`;

export default new Compose({ markdownOutline }, builtins);

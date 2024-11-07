import helpRegistry from "../common/helpRegistry.js";

export { default as document } from "./document.js";
export { default as indent } from "./indent.js";
export { default as inline } from "./inline.js";
export { default as mdHtml } from "./mdHtml.js";

helpRegistry.set("text:", "Manipulate text");

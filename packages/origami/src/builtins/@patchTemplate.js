import extendTemplateFn from "../framework/extendTemplateFn.js";

// HACK: Expose extendTemplateFn as a builtin until we can fold it into the parser.
export default extendTemplateFn;

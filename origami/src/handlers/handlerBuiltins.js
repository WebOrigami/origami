import * as handlers from "./handlers.js";

export default function handlerBuiltins() {
  return {
    "css.handler": handlers.cssHandler,
    "csv.handler": handlers.csvHandler,
    "htm.handler": handlers.htmHandler,
    "html.handler": handlers.htmlHandler,
    "jpeg.handler": handlers.jpegHandler,
    "jpg.handler": handlers.jpgHandler,
    "js.handler": handlers.jsHandler,
    // TODO: Remove deprecated JSE extensions
    "jse.handler": handlers.oriHandler,
    "jsedocument.handler": handlers.oridocumentHandler,
    "json.handler": handlers.jsonHandler,
    "md.handler": handlers.mdHandler,
    "mjs.handler": handlers.mjsHandler,
    "ori.handler": handlers.oriHandler,
    "oridocument.handler": handlers.oridocumentHandler,
    "ts.handler": handlers.tsHandler,
    "txt.handler": handlers.txtHandler,
    "wasm.handler": handlers.wasmHandler,
    "xhtml.handler": handlers.xhtmlHandler,
    "yaml.handler": handlers.yamlHandler,
    "yml.handler": handlers.ymlHandler,
  };
}

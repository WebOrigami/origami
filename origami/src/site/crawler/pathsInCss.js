import { parse, walk } from "css-tree";
import { addHref } from "./utilities.js";

const imageFunctions = ["cross-fade", "image", "image-set"];

export default function pathsInCss(css, context = "stylesheet") {
  const paths = {
    crawlablePaths: [],
    resourcePaths: [],
  };

  let ast;
  try {
    parse(css, { context });
  } catch (e) {
    // If the CSS is invalid, we can't parse it, so we can't extract paths. For
    // now we just return no paths.
    return paths;
  }

  if (!ast) {
    // Unclear why parser sometimes returns an undefined AST
    return paths;
  }

  walk(
    ast,
    /** @this {any} */
    function (node) {
      const { type, value } = node;
      if (
        this.atrule?.name === "import" &&
        (type === "String" || type === "Url")
      ) {
        // A plain string or url() in an @import
        addHref(paths, value, true);
      } else if (
        type === "String" &&
        imageFunctions.includes(this.function?.name)
      ) {
        // A plain string in an cross-fade(), image(), or image-set()
        addHref(paths, value, false);
      } else if (type === "Url") {
        // A url() anywhere else
        addHref(paths, value, false);
      }
    }
  );

  return paths;
}

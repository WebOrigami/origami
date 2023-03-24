import project from "../../src/builtins/@project.js";
import ExplorableGraph from "../../src/core/ExplorableGraph.js";
import ObjectGraph from "../../src/core/ObjectGraph.js";
import assert from "../assert.js";

describe.only("@project", () => {
  it("finds the closest ori.config.js in the ancestor tree", async () => {
    const subsubfolder = {
      /* Empty */
    };
    const subfolder = {
      subsubfolder,
    };
    const folder = {
      subfolder,
      "ori.config.js": "should find this one",
    };
    const root = {
      folder,
      "ori.config.js": "shouldn't find this one",
    };

    // Wire up the parent references.
    subsubfolder[".."] = subfolder;
    subfolder[".."] = folder;
    folder[".."] = root;
    root[".."] = root; /* circular -- macOS, at least, does this */

    const graph = new ObjectGraph(root);
    let cwd = await ExplorableGraph.traverse(
      graph,
      "folder",
      "subfolder",
      "subsubfolder"
    );
    const result = await project.call(null, cwd);
    assert.equal(result?.object, folder);
  });
});

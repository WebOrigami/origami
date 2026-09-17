import FileMap from "../src/drivers/FileMap.js";
import apply from "../src/operations/apply.js";
import syncFiles from "./syncFiles.js";

const builtFilesUrl = new URL("../src/sync", import.meta.url);
const builtFiles = new FileMap(builtFilesUrl);
builtFiles.clear();
await apply(syncFiles, builtFiles);

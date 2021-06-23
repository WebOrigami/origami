import ExplorableFiles from "../../node/ExplorableFiles.js";

export default async function files(filesPath) {
  return new ExplorableFiles(filesPath);
}

files.usage = `files(path)\tThe explorable files at path`;

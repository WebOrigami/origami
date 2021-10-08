import ExplorableFiles from "../../node/ExplorableFiles.js";

export default async function files(...keys) {
  let result = new ExplorableFiles(process.cwd());
  if (keys.length > 0) {
    result = await result.get(...keys);
  }
  return result;
}

files.usage = `files()\tThe explorable files in the current directory`;

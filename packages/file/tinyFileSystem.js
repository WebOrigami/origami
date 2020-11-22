import ObjectGraph from "./ObjectGraph.js";

const tinyFileSystem = new ObjectGraph({
  file1: "This is the first file",
  file2: "This is the second file",
});

for await (const name of tinyFileSystem) {
  console.log(name);
  console.log(await tinyFileSystem.get(name));
}

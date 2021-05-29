import path from "path";
import process from "process";
import ExplorableApp from "../../app/ExplorableApp.js";

export default function app(relativePath) {
  const resolvedPath = path.resolve(process.cwd(), relativePath);
  return new ExplorableApp(resolvedPath);
}

app.usage = `app(path)\tCreates a basic server app for the files at path`;

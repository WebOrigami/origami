import path from "path";
import process from "process";
import ExplorableApp from "../../app/ExplorableApp.js";
import WatchFilesMixin from "../../app/WatchFilesMixin.js";
import config from "./config.js";

// Start an ExplorableApp with file watching
export default async function app(relativePath = "") {
  const resolvedPath = path.resolve(process.cwd(), relativePath);
  const app = new (WatchFilesMixin(ExplorableApp))(resolvedPath);
  app.scope = await config(resolvedPath);
  return app;
}

app.usage = `app(path)\tCreates a basic server app for the files at path`;

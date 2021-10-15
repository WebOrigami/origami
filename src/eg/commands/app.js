import path from "path";
import process from "process";
import ExplorableApp from "../../app/ExplorableApp.js";
import config from "./config.js";

// Start an ExplorableApp
export default async function app(...keys) {
  const appPath = path.resolve(process.cwd(), ...keys);
  let graph = new ExplorableApp(appPath);
  graph.scope = await config(appPath);
  return graph;
}

app.usage = `app()\tAn explorable application graph for the current directory`;

import process from "process";
import ExplorableApp from "../../app/ExplorableApp.js";
import config from "./config.js";

// Start an ExplorableApp
export default async function app(...keys) {
  const appPath = process.cwd();
  let result = new ExplorableApp(appPath);
  result.scope = await config(appPath);
  if (keys.length > 0) {
    result = await result.get(...keys);
  }
  return result;
}

app.usage = `app()\tAn explorable application graph for the current directory`;

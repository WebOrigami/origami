// import projectRoot from "./projectRoot.js";

const mapPathToConfig = new Map();

export default async function config(dir = process.cwd()) {
  const cached = mapPathToConfig.get(dir);
  if (cached) {
    return cached;
  }

  // TODO
  // const root = await projectRoot(dir);
  // const configBuffer = await root.get("config.ori");
  // let configObject;
  // if (configBuffer) {
  // } else {
  //   configObject = {};
  // }
  const configObject = {};

  mapPathToConfig.set(dir, configObject);
  return configObject;
}

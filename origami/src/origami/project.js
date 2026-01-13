import { projectRoot } from "@weborigami/language";

export default async function project() {
  console.warn("Origami.project has been renamed to Origami.projectRoot");
  return projectRoot();
}

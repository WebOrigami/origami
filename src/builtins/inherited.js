import Scope from "../common/Scope.js";

export default async function inherited(key) {
  const newScope = new Scope(...this.graphs.slice(1));
  return newScope.get(key);
}

import { Treelike } from "../index";

declare const keysJson: {
  parse(json: string): any,
  stringify(treelike: Treelike): Promise<string>
};

export default keysJson;
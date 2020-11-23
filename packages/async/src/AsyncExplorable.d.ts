export default class AsyncExplorable {
  static get: string;
  static isExplorable(obj: any): boolean;
  static keys(obj: any): any[];
  static traverse(exfn: any, path: any[]): any;
}
export default class AsyncMap {
  static [Symbol.hasInstance](object) {
    if (object instanceof Map) {
      return true;
    }
    let classFn = object.constructor;
    while (classFn !== Object) {
      if (classFn === AsyncMap) {
        return true;
      }
      classFn = classFn.prototype.constructor;
    }
    return false;
  }
}

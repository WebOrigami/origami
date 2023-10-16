export default class TreeEvent extends Event {
  constructor(type, options = {}) {
    super(type, options);
    this.options = options;
  }
}

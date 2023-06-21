export default class GraphEvent extends Event {
  constructor(type, options = {}) {
    super(type, options);
    this.options = options;
  }
}

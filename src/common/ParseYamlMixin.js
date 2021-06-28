function ParseYamlMixin(Base) {
  return class ParseYaml extends Base {
    async get(...keys) {
      const value = super.get(...keys);
    }
  };
}

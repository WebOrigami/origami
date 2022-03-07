export default function InheritValuesTransform(Base) {
  return class InheritValues extends Base {
    async localFormulas() {
      const base = (await super.localFormulas?.()) ?? [];
      if (this.scope) {
        const parentFormulas = await this.scope.formulas();
        const inherited = parentFormulas.filter(
          (formula) => formula.inheritable
        );
        // Inherited formulas are lower priority, so come last.
        return [...base, ...inherited];
      }
      return base;
    }
  };
}

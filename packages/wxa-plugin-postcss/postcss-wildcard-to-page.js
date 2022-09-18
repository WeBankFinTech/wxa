module.exports = (options) => ({
  postcssPlugin: 'postcss-tailwind-mp-compat',
  Rule(rule) {
    if (
      rule.selector.includes(':focus') || 
            rule.selector.includes(':hover') ||
            rule.selector.includes('\\/') ||
            rule.selector.includes('\\32') ||
            rule.selector.includes(':not([hidden]) ~ :not([hidden])')
    ) {
      return rule.remove();
    }
    rule.selector = rule.selector.replace(/\*,/g, 'page,');
    rule.selector = rule.selector.replace(/\\\./g, '');
  },
  AtRule(rule) {
    if (rule.name === 'media' && !rule.nodes.length) {
      rule.remove();
    }
  },
});

module.exports.postcss = true;

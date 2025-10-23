module.exports = {
  extends: [
    'stylelint-config-standard',
    'stylelint-config-rational-order',
    'stylelint-config-recommended-vue',
    'stylelint-prettier/recommended',
  ],
  overrides: [{
    files: ['**/*.less'],
    customSyntax: 'postcss-less',
  }],
  rules: {
  },
}

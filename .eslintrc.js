module.exports = {
  env: {
    commonjs: true,
    es2021: true,
    node: true,
  },
  extends: 'airbnb-base',
  rules: {
    'arrow-parens': 0,
    'no-param-reassign': 0,
    'no-extend-native': 0,
  },
  ignore: ['node_modules', 'dist'],
};

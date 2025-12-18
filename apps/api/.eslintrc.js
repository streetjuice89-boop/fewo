module.exports = {
  extends: ['@voyagenest/config/eslint/nestjs'],
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  root: true,
};


module.exports = {
  extends: ['@voyagenest/config/eslint/nextjs'],
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  root: true,
};


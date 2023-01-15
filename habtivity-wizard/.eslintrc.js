module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    "plugin:vue/essential",
    "plugin:prettier-vue/recommended",
    "@vue/typescript/recommended",
  ],
  parserOptions: {
    ecmaVersion: 2020,
  },
  rules: {
    "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off",
    "no-multiple-empty-lines": "off",
    "no-trailing-spaces": "off",
    "space-before-function-paren": "off",
    "padded-blocks": "off",
    quotes: "off",
    semi: "off",
  },
};

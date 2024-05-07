// @ts-check

import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import prettierConfig from "eslint-config-prettier";

const ignoreConfig = {
  ignores: ["node_modules/", "dist/", ".locorc.js"],
};

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ignoreConfig,
  prettierConfig,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
);

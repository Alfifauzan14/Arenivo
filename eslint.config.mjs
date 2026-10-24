import js from "@eslint/js";
import tsPlugin from "typescript-eslint";
import prettierConfig from "eslint-config-prettier";
import globals from "globals";

export default tsPlugin.config(
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/.next/**",
      "**/coverage/**",
      "**/supabase/migrations/**",
      "**/*.d.ts",
    ],
  },
  js.configs.recommended,
  ...tsPlugin.configs.recommended,
  prettierConfig,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      "no-console": "off",
    },
  }
);

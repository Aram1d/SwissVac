import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import pluginReactHooks from "eslint-plugin-react-hooks";
import pluginSortImports from "eslint-plugin-custom-sort-imports";
import pluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import configPrettier from "eslint-config-prettier";
import { fixupPluginRules } from "@eslint/compat";

export default [
  {
    ignores: [
      "**/*.d.ts",
      "**/*.d.mts",
      "**/*.generated.ts",
      "dist",
      "public",
      ".prettierrc.cjs",
    ],
  },
  pluginPrettierRecommended,
  ...tseslint.configs.recommended,
  {
    ...pluginJs.configs.recommended,
    ...pluginReact.configs.flat.recommended,
    files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
    languageOptions: { globals: globals.browser },
    plugins: {
      "react-hooks": fixupPluginRules(pluginReactHooks),
      "eslint-plugin-custom-sort-imports": pluginSortImports,
    },
    rules: {
      "no-console": "error",
      "no-debugger": "error",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "error",
      "eslint-plugin-custom-sort-imports/sort-imports": [
        "error",
        {
          patterns: [
            "^vitest$",
            "^@testing-library/.*",
            "^@tests",
            "^react$",
            "^react-.*",
            "^@auth0/.*",
            "^@tanstack/.*",
            "^@mantine/.*(?!.css$)$",
            "^@mantine/.*(?<!.css$)$",
            "^mantine-.*",
            "@tabler/icons-react",
            ".*",
            "^@api$",
            "^@components$",
            "^@lib$",
            "^@hooks$",
            "^[.]{1,2}/.*.css$",
            "^./.*$",
          ],
        },
      ],
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-expressions": "off",
      "@typescript-eslint/no-namespace": [2, { allowDeclarations: true }],
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          args: "all",
          argsIgnorePattern: "^_",
          caughtErrors: "all",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
    },
  },
  configPrettier,
];

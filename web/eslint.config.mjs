// The one lint rule that matters most here: React hooks must be called in the same order every render
// (a hook placed after an early return crashes the page, and the type checker can't see it).
import tseslint from "typescript-eslint";
import hooks from "eslint-plugin-react-hooks";

// The site's code has "eslint-disable" comments for Next.js and React rules we don't run; these empty stand-ins keep those comments valid.
const standIn = (rule) => ({ rules: { [rule]: { meta: { schema: [] }, create: () => ({}) } } });

export default [
  { linterOptions: { reportUnusedDisableDirectives: "off" } },
  { ignores: [".next/**", "node_modules/**", "next-env.d.ts", "public/**"] },
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: { parser: tseslint.parser, parserOptions: { ecmaFeatures: { jsx: true } } },
    plugins: { "react-hooks": hooks, "@next/next": standIn("no-img-element"), react: standIn("no-danger") },
    rules: { "react-hooks/rules-of-hooks": "error", "react-hooks/exhaustive-deps": "warn" },
  },
];

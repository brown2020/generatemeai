import { fixupConfigRules } from "@eslint/compat";
import coreWebVitals from "eslint-config-next/core-web-vitals";
import typescript from "eslint-config-next/typescript";

const config = [
  ...fixupConfigRules([...coreWebVitals, ...typescript]),
  {
    rules: {
      "@next/next/no-img-element": "off",
    },
  },
];

export default config;

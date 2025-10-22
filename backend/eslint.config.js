import js from "@eslint/js";
import globals from "globals";

export default [
  js.configs.recommended,
  {
    languageOptions: {
      globals: globals.node,
      ecmaVersion: 2022,
      sourceType: "module",
    },
    rules: {
      "no-unused-vars": "off", // desativa avisos de variáveis não usadas
      "no-console": "off", // permite console.log()
      "quotes": ["error", "double"], // força aspas duplas (pode mudar pra 'single')
      "semi": ["error", "always"], // exige ponto e vírgula
      "indent": ["error", 2], // identação de 2 espaços
    },
  },
];

// No existía NINGÚN archivo de configuración de ESLint en este proyecto —
// `npm run lint` fallaba directamente ("ESLint couldn't find a
// configuration file"), así que nunca corrió ni localmente ni en CI. Los
// imports sin usar (WifiOff en Sidebar, TrendingUp/Clock en Dashboard) que
// vivían en el código sin que nadie los detectara son consecuencia directa
// de esto.
module.exports = {
  root: true,
  ignorePatterns: ['dist', 'node_modules'],
  env: { browser: true, es2021: true, node: true },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
  settings: { react: { version: 'detect' } },
  plugins: ['react-refresh'],
  rules: {
    'react/react-in-jsx-scope': 'off', // Vite + React 17+ JSX runtime
    'react/prop-types': 'off',
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
  },
};

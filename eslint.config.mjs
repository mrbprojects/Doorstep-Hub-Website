import nextConfig from 'eslint-config-next';

const eslintConfig = [
  {
    ignores: [
      '.next/**',
      '.next-dev/**',
      'out/**',
      'build/**',
      'next-env.d.ts',
      'scratch/**',
      'scripts/**',
      'tests/**',
      'replace-anim.js',
      'server.js'
    ]
  },
  ...nextConfig,
  {
    files: ['**/*.{js,jsx,mjs,ts,tsx,mts,cts}'],
    rules: {
      "no-undef": "error",
      "react/no-unescaped-entities": "warn",
      "no-unused-vars": "warn",
      "@next/next/no-img-element": "warn",
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/purity": "warn",
      "react-hooks/immutability": "warn",
      "react-hooks/refs": "warn",
      "react-hooks/preserve-manual-memoization": "warn",
      "react-hooks/static-components": "warn"
    }
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      "@typescript-eslint/no-unused-vars": "warn"
    }
  }
];

export default eslintConfig;

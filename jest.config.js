module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^/opt/(.*)$': '<rootDir>/src/layers/nodeLibs/$1',
  },
  moduleDirectories: [
    'node_modules',
    'src/layers/nodeLibs/nodejs/node_modules',
  ],
  globals: {
    'ts-jest': {
      diagnostics: false,
      tsconfig: {
        target: 'ES2018',
        module: 'commonjs',
        lib: ['es2018'],
        declaration: true,
        strict: true,
        noImplicitAny: true,
        strictNullChecks: true,
        noImplicitThis: true,
        alwaysStrict: true,
        noUnusedLocals: false,
        noUnusedParameters: false,
        noImplicitReturns: true,
        noFallthroughCasesInSwitch: false,
        inlineSourceMap: true,
        inlineSources: true,
        experimentalDecorators: true,
        strictPropertyInitialization: false,
        isolatedModules: false,
        baseUrl: '.',
        outDir: './dist',
        paths: {
          '/opt/*': ['src/layers/nodeLibs/*'],
        },
      },
    },
  },
};

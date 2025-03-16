import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.js'],
    globals: true,
    testNamePattern: process.env.TEST_TYPE ? `.*${process.env.TEST_TYPE}.*` : undefined,
    include: [
      './tests/unit/**/*.test.js',
      './tests/integration/**/*.test.js',
      './tests/ui/**/*.test.js'
    ],
    coverage: {
      reporter: ['text', 'json', 'html'],
      include: ['./popup/**/*.js'],
    },
  },
}); 
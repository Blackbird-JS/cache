import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Enable global expect/describe/test keywords automatically
    globals: true,
    // Force a browser environment mapping for IndexedDB shims
    environment: 'happy-dom'
  }
});

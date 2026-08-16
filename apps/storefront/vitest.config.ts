import { defineConfig } from "vitest/config"
import tsconfigPaths from "vite-tsconfig-paths"

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    // lib/api/cart.ts reads/writes a bare global `localStorage` (not
    // `window.localStorage`). jsdom 30 no longer ships its own storage
    // implementation, so vitest.setup.ts polyfills it for the "node"-less
    // jsdom environment.
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["src/lib/**/*.ts"],
    },
  },
})

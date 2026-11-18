import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["test/**/*.test.ts"],
    // One temporary folder per run, removed at its end (test/temp-root.ts).
    globalSetup: ["test/temp-root.ts"],
  },
});

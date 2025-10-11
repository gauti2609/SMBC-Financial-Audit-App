import { config as dotenvConfig } from "dotenv";

// Load environment variables from .env file
dotenvConfig();

import { createApp } from "vinxi";
import reactRefresh from "@vitejs/plugin-react";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { config } from "vinxi/plugins/config";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import { consoleForwardPlugin } from "./vite-console-forward-plugin";

// Helper function to define Prisma externals
const prismaExternals = [
  "@prisma/client",
  ".prisma/client",
  "@prisma/engines",
  "@prisma/engines-version",
  /^\.prisma\//,
  /^@prisma\//,
];

export default createApp({
  server: {
    preset: "node-server",
    experimental: {
      asyncContext: true,
    },
    nitro: {
      experimental: {
        wasm: true,
      },
      // Centralized externals configuration for Nitro
      externals: {
        // Trace and bundle these dependencies
        inline: [],
        // Exclude these from the bundle
        external: prismaExternals,
        trace: false,
      },
      // Alias to fix Prisma's internal module resolution
      alias: {
        ".prisma/client": "./node_modules/.prisma/client",
      },
      // Ensure esbuild also respects the externals
      esbuild: {
        options: {
          external: prismaExternals,
        },
      },
      // Rollup config for fine-tuning
      rollupConfig: {
        external: prismaExternals,
        resolve: {
          preferBuiltins: true,
        },
        output: {
          manualChunks: undefined,
        },
      },
    },
  },
  routers: [
    {
      type: "static",
      name: "public",
      dir: "./public",
    },
    {
      type: "http",
      name: "trpc",
      base: "/trpc",
      handler: "./src/server/trpc/handler.ts",
      target: "server",
      plugins: () => [
        tsConfigPaths({
          projects: ["./tsconfig.json"],
        }),
      ],
    },
    {
      type: "http",
      name: "debug",
      base: "/api/debug/client-logs",
      handler: "./src/server/debug/client-logs-handler.ts",
      target: "server",
      plugins: () => [
        tsConfigPaths({
          projects: ["./tsconfig.json"],
        }),
      ],
    },
    {
      type: "spa",
      name: "client",
      handler: "./index.html",
      target: "browser",
      plugins: () => [
        tsConfigPaths({
          projects: ["./tsconfig.json"],
        }),
        TanStackRouterVite({
          target: "react",
          autoCodeSplitting: true,
          routesDirectory: "./src/routes",
          generatedRouteTree: "./src/generated/routeTree.gen.ts",
        }),
        reactRefresh(),
        nodePolyfills(),
        consoleForwardPlugin({
          enabled: true,
          endpoint: "/api/debug/client-logs",
          levels: ["log", "warn", "error", "info", "debug"],
        }),
      ],
    },
  ],
});

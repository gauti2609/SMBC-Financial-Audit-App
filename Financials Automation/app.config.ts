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

export default createApp({
  server: {
    preset: "node-server", // change to 'netlify' or 'bun' or anyof the supported presets for nitro (nitro.unjs.io)
    experimental: {
      asyncContext: true,
    },
    nitro: {
      experimental: {
        wasm: true,
      },
      rollupConfig: {
        external: [
          "@prisma/client", 
          ".prisma/client", 
          "@prisma/engines",
          "@prisma/engines-version",
          // Add specific patterns to handle .prisma module resolution
          /^\.prisma\/.*/,
          ".prisma/client/default",
          ".prisma/client/index",
        ],
        resolve: {
          preferBuiltins: true,
        },
        output: {
          manualChunks: undefined,
        },
      },
      moduleSideEffects: false,
      esbuild: {
        options: {
          external: [
            "@prisma/client",
            ".prisma/client", 
            "@prisma/engines",
          ],
        },
      },
      // Add module resolution rules for Nitro
      alias: {
        '.prisma/client': './node_modules/.prisma/client',
      },
      // Explicitly tell Nitro not to bundle these modules (merged externals)
      externals: {
        inline: [],
        traceInclude: [],
        trace: false,
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
        config("allowedHosts", {
          // @ts-ignore
          server: {
            allowedHosts: process.env.BASE_URL
              ? [process.env.BASE_URL.split("://")[1]]
              : undefined,
          },
        }),
        config("rollupOptions", {
          build: {
            rollupOptions: {
              external: [
                "@prisma/client", 
                ".prisma/client", 
                "@prisma/engines",
                "@prisma/engines-version",
                /^\.prisma\//,
                /^@prisma\//,
              ],
            },
          },
          ssr: {
            external: [
              "@prisma/client", 
              ".prisma/client", 
              "@prisma/engines",
              "@prisma/engines-version",
            ],
            noExternal: [],
          },
          optimizeDeps: {
            exclude: [
              "@prisma/client",
              ".prisma/client",
              "@prisma/engines",
            ],
          },
          define: {
            global: "globalThis",
          },
        }),
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
        config("allowedHosts", {
          // @ts-ignore
          server: {
            allowedHosts: process.env.BASE_URL
              ? [process.env.BASE_URL.split("://")[1]]
              : undefined,
          },
        }),
        config("rollupOptions", {
          build: {
            rollupOptions: {
              external: [
                "@prisma/client", 
                ".prisma/client", 
                "@prisma/engines",
                "@prisma/engines-version",
                /^\.prisma\//,
                /^@prisma\//,
              ],
            },
          },
          ssr: {
            external: [
              "@prisma/client", 
              ".prisma/client", 
              "@prisma/engines",
              "@prisma/engines-version",
            ],
            noExternal: [],
          },
          optimizeDeps: {
            exclude: [
              "@prisma/client",
              ".prisma/client",
              "@prisma/engines",
            ],
          },
          define: {
            global: "globalThis",
          },
        }),
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
        config("allowedHosts", {
          // @ts-ignore
          server: {
            allowedHosts: process.env.BASE_URL
              ? [process.env.BASE_URL.split("://")[1]]
              : undefined,
          },
        }),
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

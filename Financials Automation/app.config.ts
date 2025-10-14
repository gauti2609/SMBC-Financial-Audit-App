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
          ".prisma",
          "@prisma/engines",
          "@prisma/engines-version",
          "~/generated/prisma",
          "./src/generated/prisma",
          "../src/generated/prisma",
          /^\.\.\/generated\/prisma/,
          /^\.\/generated\/prisma/,
        ],
        resolve: {
          preferBuiltins: true,
        },
        output: {
          manualChunks: undefined,
        },
      },
      externals: {
        inline: [
          // Force inline for non-Prisma modules that might conflict
        ],
      },
      moduleSideEffects: false,
      esbuild: {
        options: {
          external: [
            "@prisma/client",
            ".prisma/client", 
            ".prisma",
            "@prisma/engines",
            "~/generated/prisma",
            "./src/generated/prisma",
            "../src/generated/prisma",
          ],
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
                ".prisma",
                "@prisma/engines",
                "@prisma/engines-version",
                /^\.prisma\//,
                /^@prisma\//,
                "~/generated/prisma",
                "./src/generated/prisma",
                "../src/generated/prisma",
                /^\.\.\/generated\/prisma/,
                /^\.\/generated\/prisma/,
              ],
            },
          },
          ssr: {
            external: [
              "@prisma/client", 
              ".prisma/client", 
              ".prisma",
              "@prisma/engines",
              "@prisma/engines-version",
              "~/generated/prisma",
              "./src/generated/prisma",
              "../src/generated/prisma",
              /^\.\.\/generated\/prisma/,
              /^\.\/generated\/prisma/,
            ],
            noExternal: [],
          },
          optimizeDeps: {
            exclude: [
              "@prisma/client",
              ".prisma/client",
              ".prisma",
              "@prisma/engines",
              "~/generated/prisma",
              "./src/generated/prisma",
              "../src/generated/prisma",
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
                ".prisma",
                "@prisma/engines",
                "@prisma/engines-version",
                /^\.prisma\//,
                /^@prisma\//,
                "~/generated/prisma",
                "./src/generated/prisma",
                "../src/generated/prisma",
                /^\.\.\/generated\/prisma/,
                /^\.\/generated\/prisma/,
              ],
            },
          },
          ssr: {
            external: [
              "@prisma/client", 
              ".prisma/client", 
              ".prisma",
              "@prisma/engines",
              "@prisma/engines-version",
              "~/generated/prisma",
              "./src/generated/prisma",
              "../src/generated/prisma",
              /^\.\.\/generated\/prisma/,
              /^\.\/generated\/prisma/,
            ],
            noExternal: [],
          },
          optimizeDeps: {
            exclude: [
              "@prisma/client",
              ".prisma/client",
              ".prisma",
              "@prisma/engines",
              "~/generated/prisma",
              "./src/generated/prisma",
              "../src/generated/prisma",
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

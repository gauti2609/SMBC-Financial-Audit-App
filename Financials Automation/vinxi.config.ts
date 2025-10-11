import { defineConfig } from 'vinxi/config';

export default defineConfig({
  build: {
    rollupOptions: {
      external: [
        // Prisma externalization - comprehensive patterns
        '@prisma/client',
        '.prisma/client',
        '@prisma/engines',
        '@prisma/engines-version',
        /^\.prisma\//,
        /^@prisma\//,
        /^\.prisma\/.*/,
        '.prisma/client/default',
        '.prisma/client/index',
        // Database drivers
        'pg',
        'pg-native',
        'mysql',
        'mysql2',
        'sqlite3',
        'better-sqlite3',
        // Other server-only dependencies
        'bcryptjs',
        'jsonwebtoken',
        'minio',
      ],
      output: {
        // Ensure Prisma modules are not inlined
        manualChunks: undefined,
      },
    },
  },
  ssr: {
    external: [
      '@prisma/client',
      '.prisma/client',
      '@prisma/engines',
      '@prisma/engines-version',
      'pg',
      'pg-native',
      'mysql',
      'mysql2',
      'sqlite3',
      'better-sqlite3',
      'bcryptjs',
      'jsonwebtoken',
      'minio',
    ],
    noExternal: [
      // Explicitly include client-side dependencies that should be bundled
      'superjson',
      'zod',
    ],
  },
  optimizeDeps: {
    exclude: [
      '@prisma/client',
      '.prisma/client',
      '@prisma/engines',
      'pg',
      'mysql2',
      'sqlite3',
      'better-sqlite3',
    ],
  },
});

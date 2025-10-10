import { defineConfig } from 'vinxi/config';

export default defineConfig({
  build: {
    rollupOptions: {
      external: [
        // Prisma externalization
        '@prisma/client',
        '.prisma/client',
        '.prisma',
        '@prisma/engines',
        '@prisma/engines-version',
        /^\.prisma\//,
        /^@prisma\//,
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
    },
  },
  ssr: {
    external: [
      '@prisma/client',
      '.prisma/client',
      '.prisma',
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
      '.prisma',
      '@prisma/engines',
      'pg',
      'mysql2',
      'sqlite3',
      'better-sqlite3',
    ],
  },
});

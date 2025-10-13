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
        '~/generated/prisma',
        './src/generated/prisma',
        '../src/generated/prisma',
        /^\.\.\/generated\/prisma/,
        /^\.\/generated\/prisma/,
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
      '~/generated/prisma',
      './src/generated/prisma',
      '../src/generated/prisma',
      /^\.\.\/generated\/prisma/,
      /^\.\/generated\/prisma/,
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
      '~/generated/prisma',
      './src/generated/prisma',
      '../src/generated/prisma',
      'pg',
      'mysql2',
      'sqlite3',
      'better-sqlite3',
    ],
  },
});

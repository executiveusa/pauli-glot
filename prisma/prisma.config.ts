import { defineConfig } from '@prisma/internals';
import path from 'path';

const dbPath = path.join(__dirname, 'dev.db');

export default defineConfig({
  datasources: {
    db: {
      url: `file:${dbPath}`,
    },
  },
});

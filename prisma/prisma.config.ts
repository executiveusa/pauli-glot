import { defineConfig } from '@prisma/internals';
import path from 'path';

export default defineConfig({
  datasources: {
    db: {
      url: `file:${path.join(__dirname, 'dev.db')}`,
    },
  },
});

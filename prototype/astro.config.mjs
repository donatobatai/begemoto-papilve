import { defineConfig } from 'astro/config';

export default defineConfig({
  devToolbar: { enabled: false },
  publicDir: '../media',
  outDir: './dist',
  server: {
    host: true,
    port: 4321,
  },
});

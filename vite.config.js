import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ command, isPreview }) => ({
  // GitHub Pages serves the site from https://<user>.github.io/poc-task-type-form/
  base: command === 'build' || isPreview ? '/poc-task-type-form/' : '/',
  plugins: [react(), tailwindcss()],
}))
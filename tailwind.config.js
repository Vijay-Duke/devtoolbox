/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./js/**/*.js",
    "./tools/**/*.html",
    "./tools/**/*.js"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif'
        ],
        mono: [
          'SFMono-Regular',
          'Monaco',
          'Inconsolata',
          'Liberation Mono',
          'Consolas',
          'Courier New',
          'monospace'
        ]
      }
    }
  },
  plugins: []
}
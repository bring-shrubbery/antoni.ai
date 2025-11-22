/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './cms/client/**/*.{ts,tsx}',
    './cms/components/**/*.{ts,tsx}',
  ],
  prefix: 'cms',
  important: '#cms-root',
  theme: {
    extend: {},
  },
}

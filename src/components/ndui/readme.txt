
این فایل پکیج جیسون مربوط به کتابخانه ان دی یو آی هست.

{
  "name": "ndui-ahrom",
  "version": "0.1.49",
  "description": "A UI library for Next.js using DaisyUI",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "prepublishOnly": "npm run build"
  },
  "dependencies": {
    "@floating-ui/react": "^0.25.4",
    "@hookform/resolvers": "^3.3.2",
    "@tiptap/react": "^2.1.12",
    "@tiptap/starter-kit": "^2.1.12",
    "ag-grid-community": "^31.0.1",
    "ag-grid-react": "^31.3.4",
    "daisyui": "^3.0.0",
    "date-fns": "^2.30.0",
    "focus-trap-react": "^10.2.3",
    "framer-motion": "^10.16.5",
    "i18next": "^23.7.6",
    "react": ">=16.8.0",
    "react-datepicker": "^4.21.0",
    "react-dom": ">=16.8.0",
    "react-dropzone": "^14.2.3",
    "react-hook-form": "^7.48.2",
    "react-i18next": "^13.5.0",
    "react-intersection-observer": "^9.5.3",
    "react-select": "^5.8.0",
    "react-window": "^1.8.9",
    "recharts": "^2.9.3",
    "swiper": "^11.0.5",
    "tailwindcss": "^3.0.0",
    "tiptap": "^1.32.2",
    "zod": "^3.22.4",
    "zustand": "^4.4.7"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "@types/react": "^18.0.0",
    "@types/react-datepicker": "^4.19.3",
    "@types/react-dom": "^18.0.0",
    "@types/react-window": "^1.8.8",
    "typescript": "^4.9.0",
    "next": "15.2.1"
  },
  "peerDependencies": {
    "react": ">=16.8.0",
    "react-dom": ">=16.8.0"
  },
  "files": [
    "dist",
    "src"
  ],
  "repository": {
    "type": "git",
    "url": "https://github.com/ndui-core/ndui-ahrom.git"
  },
  "keywords": [
    "nextjs",
    "daisyui",
    "tailwindcss",
    "ui-library"
  ],
  "author": "Milad Khaleghi",
  "license": "MIT"
}

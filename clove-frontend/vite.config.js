import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Allows access via local network
    port: 5173       // Optional: default is 5173, change if needed
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      'assets': path.resolve(__dirname, 'src/assets'),
      'components': path.resolve(__dirname, 'src/components'),
      'contexts': path.resolve(__dirname, 'src/contexts'),
      'features': path.resolve(__dirname, 'src/features'),
      'lib': path.resolve(__dirname, 'src/lib'),
    }
  },
  define: {
    'import.meta.env.VITE_API_BASE_URL': JSON.stringify(
      process.env.NODE_ENV === 'production' 
        ? 'https://clove-backend.onrender.com'
        : 'http://localhost:8000'
    )
  }
});
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from 'path';
import { fileURLToPath } from 'url';
import { visualizer } from 'rollup-plugin-visualizer';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    visualizer({
      filename: 'dist/stats.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
    })
  ],
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
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Core vendor libraries
          'vendor-react': ['react', 'react-dom'],
          'vendor-router': ['react-router-dom'],
          'vendor-bootstrap': ['react-bootstrap', 'bootstrap'],
          
          // Feature-based chunks
          'feature-auth': [
            'src/features/auth/pages/AuthFormPage.jsx',
            'src/features/auth/pages/EmailVerificationPage.jsx',
            'src/features/auth/pages/ForgotPasswordPage.jsx',
            'src/features/auth/pages/PasswordResetPage.jsx'
          ],
          'feature-challenges': [
            'src/features/challenges/pages/ChallengesPage.jsx',
            'src/features/challenges/pages/ChallengeInstructionsPage.jsx',
            'src/features/challenges/pages/ResultsPage.jsx',
            'src/features/challenges/modes/CodeCompletion.jsx',
            'src/features/challenges/modes/CodeFixer.jsx',
            'src/features/challenges/modes/OutputTracing.jsx'
          ],
          'feature-lessons': [
            'src/features/lessons/pages/LessonsPage.jsx',
            'src/features/lessons/pages/PracticePage.jsx'
          ],
          'feature-mydeck': [
            'src/features/mydeck/pages/IntroductionPage.jsx',
            'src/features/mydeck/pages/SubtopicPage.jsx',
            'src/features/mydeck/pages/TopicPage.jsx'
          ],
          'feature-dashboard': [
            'src/features/dashboard/pages/DashboardPage.jsx'
          ],
          'feature-profile': [
            'src/features/profile/pages/ProfilePage.jsx'
          ],
          'feature-progress': [
            'src/features/progress/pages/ProgressPage.jsx'
          ],
          'feature-landing': [
            'src/features/landing/pages/LandingPage.jsx'
          ],
          'feature-assessments': [
            'src/components/assessments/Assessment.jsx',
            'src/components/assessments/AssessmentResult.jsx',
            'src/components/assessments/AssessmentInstructions.jsx'
          ],
          
          // Heavy libraries
          'vendor-monaco': ['@monaco-editor/react'],
          'vendor-animations': ['framer-motion', 'motion-dom'],
          'vendor-icons': ['@fortawesome/react-fontawesome', '@fortawesome/free-solid-svg-icons', '@fortawesome/free-brands-svg-icons']
        }
      }
    }
  }
});
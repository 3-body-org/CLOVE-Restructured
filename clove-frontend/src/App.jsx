//router
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";

//bootstrap
import "bootstrap/dist/css/bootstrap.min.css";
import { Container } from "react-bootstrap";

// Theme styles - imported through themes/index.js
import "features/mydeck/styles";

// Core components (loaded immediately)
import ProtectedTopicRoute from "components/error_fallback/ProtectedTopicRoute";

// Lazy-loaded feature components
// Auth Feature
const Authform = lazy(() => import("features/auth/pages/AuthFormPage"));
const EmailVerificationPage = lazy(() => import("features/auth/pages/EmailVerificationPage"));
const ForgotPasswordPage = lazy(() => import("features/auth/pages/ForgotPasswordPage"));
const PasswordResetPage = lazy(() => import("features/auth/pages/PasswordResetPage"));

// Challenges Feature
const ChallengesPage = lazy(() => import("features/challenges/pages/ChallengesPage"));
const ChallengeInstructionsPage = lazy(() => import("features/challenges/pages/ChallengeInstructionsPage"));
const ResultsPage = lazy(() => import("features/challenges/pages/ResultsPage"));

// Dashboard Feature
const DashboardPage = lazy(() => import("features/dashboard/pages/DashboardPage"));

// Landing Feature
const LandingPage = lazy(() => import("features/landing/pages/LandingPage"));

// Lessons Feature
const LessonsPage = lazy(() => import("features/lessons/pages/LessonsPage"));
const PracticePage = lazy(() => import("features/lessons/pages/PracticePage"));

// MyDeck Feature
const IntroductionPage = lazy(() => import("features/mydeck/pages/IntroductionPage"));
const SubtopicPage = lazy(() => import("features/mydeck/pages/SubtopicPage"));
const MyDeckPage = lazy(() => import("features/mydeck/pages/TopicPage"));

// Progress Feature
const ProgressPage = lazy(() => import("features/progress/pages/ProgressPage"));

// Profile Feature
const ProfilePage = lazy(() => import("features/profile/pages/ProfilePage"));

// Assessment Components
const AssessmentPage = lazy(() => import("components/assessments/Assessment"));
const AssessmentResultPage = lazy(() => import("components/assessments/AssessmentResult"));
const AssessmentInstructions = lazy(() => import("components/assessments/AssessmentInstructions"));

//components
import Layout from "components/layout/Sidebar/Layout";

//context
import { MyDeckProvider } from "contexts/MyDeckContext";
import ThemeProvider from "features/mydeck/providers/ThemeProvider";
import { AuthProvider, useAuth } from "contexts/AuthContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ErrorBoundary from "components/error_fallback/ErrorBoundary";
import NotFoundPage from "components/error_fallback/NotFoundPage";
import { ServerStatusProvider, useServerStatus } from "contexts/ServerStatusContext";
import ServerDownPage from "components/error_fallback/ServerDownPage";

// Loading component with consistent styling
const LoadingSpinner = ({ message = "Loading..." }) => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100vh',
    color: 'white',
    fontSize: '18px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  }}>
    <div style={{ textAlign: 'center' }}>
      <div style={{ marginBottom: '20px' }}>
        <div style={{ 
          width: '40px', 
          height: '40px', 
          border: '4px solid rgba(255,255,255,0.3)', 
          borderTop: '4px solid white', 
          borderRadius: '50%', 
          animation: 'spin 1s linear infinite',
          margin: '0 auto'
        }}></div>
      </div>
      <div>{message}</div>
    </div>
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

// Protected Route component that checks authentication
function ProtectedRoute({ children }) {
  const { user, loading, token } = useAuth();
  
  if (loading) {
    return <LoadingSpinner message="Loading your profile..." />;
  }
  
  // If no token exists, redirect to landing page
  if (!token) {
    return <Navigate to="/" replace />;
  }
  
  // If token exists but no user data (might be loading or error), show loading
  if (token && !user) {
    return <LoadingSpinner message="Verifying your session..." />;
  }
  
  // User is authenticated, render the protected content with layout
  return <Layout>{children}</Layout>;
}

// Public Route component that redirects authenticated users away from public pages
function PublicRoute({ children }) {
  const { user, loading, token } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  // If user is logged in, redirect to dashboard
  if (user || token) {
    return <Navigate to="/dashboard" replace />;
  }
  
  // User is not authenticated, render the public content
  return children;
}

// Route configuration for better maintainability
const protectedRoutes = [
  { path: "/dashboard", element: <DashboardPage /> },
  { path: "/progress", element: <ProgressPage /> },
  { path: "/profile", element: <ProfilePage /> },
  { path: "/my-deck", element: <MyDeckPage /> },
  { path: "/my-deck/:topicId/assessment/:assessmentType", element: <ProtectedTopicRoute><AssessmentPage /></ProtectedTopicRoute> },
  { path: "/my-deck/:topicId/assessment/:assessmentType/result", element: <ProtectedTopicRoute><AssessmentResultPage /></ProtectedTopicRoute> },
  { path: "/my-deck/:topicId/retention-test/instructions", element: <ProtectedTopicRoute><AssessmentInstructions assessmentType="retention-test" /></ProtectedTopicRoute> },
  { path: "/my-deck/:topicId/retention-test", element: <ProtectedTopicRoute><AssessmentPage /></ProtectedTopicRoute> },
  { path: "/my-deck/:topicId/retention-test/result", element: <ProtectedTopicRoute><AssessmentResultPage /></ProtectedTopicRoute> },
  { path: "/my-deck/:topicId", element: <ProtectedTopicRoute><SubtopicPage /></ProtectedTopicRoute> },
  { path: "/my-deck/:topicId/introduction", element: <ProtectedTopicRoute><IntroductionPage /></ProtectedTopicRoute> },
  { path: "/lesson/:topicId/:subtopicId", element: <ProtectedTopicRoute><LessonsPage /></ProtectedTopicRoute> },
  { path: "/lesson/:topicId/:subtopicId/practice", element: <ProtectedTopicRoute><PracticePage /></ProtectedTopicRoute> },
  { path: "/lesson/:topicId/:subtopicId/challenge-instructions", element: <ProtectedTopicRoute><ChallengeInstructionsPage /></ProtectedTopicRoute> },
  { path: "/lesson/:topicId/:subtopicId/challenges", element: <ProtectedTopicRoute><ChallengesPage /></ProtectedTopicRoute> },
  { path: "/lesson/:topicId/:subtopicId/challenges/results", element: <ProtectedTopicRoute><ResultsPage /></ProtectedTopicRoute> },
];

const publicRoutes = [
  { path: "/", element: <LandingPage /> },
  { path: "/login-signup", element: <Authform /> },
  { path: "/verify-email", element: <EmailVerificationPage /> },
  { path: "/forgot-password", element: <ForgotPasswordPage /> },
  { path: "/reset-password", element: <PasswordResetPage /> },
];

function AppContent() {
  const { serverDown } = useServerStatus();
  
  if (serverDown) {
    return <ServerDownPage />; 
  }
  
  return (
    <>
      <ToastContainer 
        position="bottom-right" 
        autoClose={2500} 
        hideProgressBar 
        newestOnTop 
        closeOnClick 
        pauseOnFocusLoss={false} 
        pauseOnHover={false} 
      />
        <Router>
          <AuthProvider>
          <MyDeckProvider>
            <ThemeProvider>
              <Container fluid className="app-container p-0 m-0">
                <Suspense fallback={<LoadingSpinner message="Loading page..." />}>
                  <Routes>
                    {/* Public Pages (No Sidebar) */}
                    {publicRoutes.map(({ path, element }) => (
                      <Route 
                        key={path}
                        path={path} 
                        element={
                          path === "/" ? element : (
                            <PublicRoute>{element}</PublicRoute>
                          )
                        } 
                      />
                    ))}
                    
                    {/* Protected Pages (With Sidebar) */}
                    {protectedRoutes.map(({ path, element }) => (
                      <Route
                        key={path}
                        path={path}
                        element={
                          <ProtectedRoute>
                            {element}
                          </ProtectedRoute>
                        }
                      />
                    ))}
                    
                    {/* Catch-all route for unmatched URLs */}
                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>
                </Suspense>
              </Container>
            </ThemeProvider>
          </MyDeckProvider>
          </AuthProvider>
        </Router>
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ServerStatusProvider>
        <AppContent />
      </ServerStatusProvider>
    </ErrorBoundary>
  );
}

export default App;

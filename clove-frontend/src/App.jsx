//router
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
//fontawesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

//bootstrap
import "bootstrap/dist/css/bootstrap.min.css";
import { Container } from "react-bootstrap";

// Theme styles - imported through themes/index.js
import "features/mydeck/styles";

//src/features/auth/...
import Authform from "features/auth/pages/AuthFormPage";

//src/features/challenges/...
import ChallengesPage from "features/challenges/pages/ChallengesPage";
import ResultsPage from "features/challenges/pages/ResultsPage";

//src/features/dashboard/...
import DashboardPage from "features/dashboard/pages/DashboardPage";

//src/features/landing/...
import LandingPage from "features/landing/pages/LandingPage";

//src/features/lessons/...
import LessonsPage from "features/lessons/pages/LessonsPage";
import PracticePage from "features/lessons/pages/PracticePage";

//src/features/mydeck/...
import IntroductionPage from "features/mydeck/pages/IntroductionPage";
import SubtopicPage from "features/mydeck/pages/SubtopicPage";
import MyDeckPage from "features/mydeck/pages/TopicPage";

//src/features/progress/...
import ProgressPage from "features/progress/pages/ProgressPage";

//src/features/profile/...
import ProfilePage from "features/profile/pages/ProfilePage";

//src/components/assessments/...
import AssessmentPage from "components/assessments/Assessment";
import AssessmentResultPage from "components/assessments/AssessmentResult";

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
  { path: "/my-deck/:topicId/assessment/:assessmentType", element: <AssessmentPage /> },
  { path: "/my-deck/:topicId/assessment/:assessmentType/result", element: <AssessmentResultPage /> },
  { path: "/my-deck/:topicId", element: <SubtopicPage /> },
  { path: "/my-deck/:topicId/introduction", element: <IntroductionPage /> },
  { path: "/lesson/:topicId/:subtopicId", element: <LessonsPage /> },
  { path: "/lesson/:topicId/:subtopicId/practice", element: <PracticePage /> },
  { path: "/lesson/:topicId/:subtopicId/challenges", element: <ChallengesPage /> },
  { path: "/lesson/:topicId/:subtopicId/challenges/results", element: <ResultsPage /> },
];

const publicRoutes = [
  { path: "/", element: <LandingPage /> },
  { path: "/login-signup", element: <Authform /> },
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

//router
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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
// import ResultsPage from "features/challenges/pages/ResultsPage";

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

//src/components/assessments/...
import AssessmentPage from "components/assessments/Assessment";
import AssessmentResultPage from "components/assessments/AssessmentResult";

//components
import Layout from "components/layout/Sidebar/Layout";

//context
import { MyDeckProvider } from "contexts/MyDeckContext";
import ThemeProvider from "features/mydeck/providers/ThemeProvider";

// Wrapper for pages that require a sidebar
function ProtectedRoutes({ children }) {
  return <Layout>{children}</Layout>;
}

function App() {
  return (
    <MyDeckProvider>
      <Router>
        <ThemeProvider>
          <Container fluid className="app-container p-0 m-0">
            <Routes>
              {/* Public Pages (No Sidebar) */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login-signup" element={<Authform />} />
              {/* Protected Pages (With Sidebar) */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoutes>
                    <DashboardPage />
                  </ProtectedRoutes>
                }
              />
              <Route
                path="/progress"
                element={
                  <ProtectedRoutes>
                    <ProgressPage />
                  </ProtectedRoutes>
                }
              />
              <Route
                path="/my-deck"
                element={
                  <ProtectedRoutes>
                    <MyDeckPage />
                  </ProtectedRoutes>
                }
              />
              <Route
                path="/my-deck/:topicId/assessment"
                element={
                  <ProtectedRoutes>
                    <AssessmentPage />
                  </ProtectedRoutes>
                }
              />
              <Route
                path="/my-deck/:topicId/assessment/result"
                element={
                  <ProtectedRoutes>
                    <AssessmentResultPage />
                  </ProtectedRoutes>
                }
              />
              <Route
                path="/my-deck/:topicId"
                element={
                  <ProtectedRoutes>
                    <SubtopicPage />
                  </ProtectedRoutes>
                }
              />
              <Route
                path="/my-deck/:topicId/introduction"
                element={
                  <ProtectedRoutes>
                    <IntroductionPage />
                  </ProtectedRoutes>
                }
              />
              <Route
                path="/lesson/:topicId/:subtopicId"
                element={
                  <ProtectedRoutes>
                    <LessonsPage />
                  </ProtectedRoutes>
                }
              />
              <Route
                path="/lesson/:topicId/:subtopicId/practice"
                element={
                  <ProtectedRoutes>
                    <PracticePage />
                  </ProtectedRoutes>
                }
              />
              <Route
                path="/lesson/:topicId/:subtopicId/challenges"
                element={
                  <ProtectedRoutes>
                    <ChallengesPage />
                  </ProtectedRoutes>
                }
              />
              {/* <Route
              path="/my-deck/:topicId/:subtopicId/results"
              element={
                <ProtectedRoutes>
                  <ResultsPage />
                </ProtectedRoutes>
              }
            /> */}
            </Routes>
          </Container>
        </ThemeProvider>
      </Router>
    </MyDeckProvider>
  );
}

export default App;

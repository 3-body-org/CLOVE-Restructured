//router
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
//pages
import LandingPage from "./pages/landing page/LandingPage";
import LoginSignupPage from "./pages/authentication page/Forms";
import DashboardPage from "./pages/main page/dashboard page/DashboardPage";
import ProgressPage from "./pages/main page/progress page/ProgressPage";
import MyDeckPage from "./pages/main page/mydeck page/TopicPage";
import PreAssessmentPage from "./components/assessments/PreAssessment";
import AssessmentResultPage from "./components/assessments/AssessmentResult";
import SubtopicPage from "./pages/main page/mydeck page/SubtopicPage";
import LessonsPage from "./pages/lessons page/LessonsPage";
import ExercisePage from "./pages/lessons page/ExercisePage";
import ChallengesPage from "./pages/challenges page/ChallengesPage";
// import ResultsPage from "./pages/Lesson and Challenges Page/ResultsPage";

//fontawesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

//bootstrap
import "bootstrap/dist/css/bootstrap.min.css";
import { Container } from "react-bootstrap";

//components
import Layout from "./components/sidebar/Layout";
//context
import { MyDeckProvider } from "./context/ContextPage";

// Wrapper for pages that require a sidebar
function ProtectedRoutes({ children }) {
  return <Layout>{children}</Layout>;
}

function App() {
  return (
    <MyDeckProvider>
      <Router>
        <Container fluid className="app-container p-0 m-0">
          <Routes>
            {/* Public Pages (No Sidebar) */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login-signup" element={<LoginSignupPage />} />
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
              path="/my-deck/:topicId/pre-assessment"
              element={
                <ProtectedRoutes>
                  <PreAssessmentPage />
                </ProtectedRoutes>
              }
            />
            <Route
              path="/my-deck/:topicId/pre-assessment/result"
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
                  <SubtopicPage />
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
            path="/lesson/:topicId/:subtopicId/exercise"
            element={
              <ProtectedRoutes>
                <ExercisePage />
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
      </Router>
    </MyDeckProvider>
  );
}

export default App;

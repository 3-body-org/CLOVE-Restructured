# CLOVE Revision Registry

Professional revision tracking system using **Semantic Versioning (SemVer) + Build Numbers** for enterprise-grade change management.

## Version Format: `MAJOR.MINOR.PATCH+BUILD`

```
1.0.0+2024.01.001.003
│ │ │  └─────────────── Build: Year.Module.File.Revision
│ │ └─────────────────── PATCH: Bug fixes (0)
│ └───────────────────── MINOR: New features (0)
└─────────────────────── MAJOR: Breaking changes (1)
```

## Module Numbering System

```
FRONTEND:
01 = Authentication
02 = Dashboard  
03 = Lessons
04 = Challenges
05 = MyDeck
06 = Progress
07 = Assessments
08 = Layout & Navigation
09 = Landing
10 = Core
18 = Profile

BACKEND:
11 = API Endpoints
12 = Database Models
13 = CRUD Operations
14 = Schemas
15 = Services
16 = Core Logic
17 = Database
```

## Frontend Modules

### Authentication (01)
#### 01-001: AuthFormPage
- **File**: `src/features/auth/pages/AuthFormPage.jsx`
- **Current Version**: 1.0.0+2024.01.001.001
- **Purpose**: User login/register form
- **Revision History**:
  - 1.0.0+2024.01.001.001 - Initial implementation (2024-01-15)

#### 01-002: EmailVerificationPage
- **File**: `src/features/auth/pages/EmailVerificationPage.jsx`
- **Current Version**: 1.0.0+2024.01.002.001
- **Purpose**: Email verification interface

#### 01-003: ForgotPasswordPage
- **File**: `src/features/auth/pages/ForgotPasswordPage.jsx`
- **Current Version**: 1.0.0+2024.01.003.001
- **Purpose**: Password recovery form

#### 01-004: PasswordResetPage
- **File**: `src/features/auth/pages/PasswordResetPage.jsx`
- **Current Version**: 1.0.0+2024.01.004.001
- **Purpose**: Password reset interface

#### 01-005: TermsAndConditions
- **File**: `src/features/auth/components/TermsAndConditions.jsx`
- **Current Version**: 1.0.0+2024.01.005.001
- **Purpose**: Terms and conditions display

### Dashboard (02)
#### 02-001: DashboardPage
- **File**: `src/features/dashboard/pages/DashboardPage.jsx`
- **Current Version**: 1.0.0+2024.02.001.001
- **Purpose**: Main dashboard interface

#### 02-002: DashboardAnalytics
- **File**: `src/features/dashboard/components/DashboardAnalytics.jsx`
- **Current Version**: 1.0.0+2024.02.002.001
- **Purpose**: Dashboard analytics and metrics

### Lessons (03)
#### 03-001: LessonsPage
- **File**: `src/features/lessons/pages/LessonsPage.jsx`
- **Current Version**: 1.0.0+2024.03.001.001
- **Purpose**: Main lessons listing page

#### 03-002: PracticePage
- **File**: `src/features/lessons/pages/PracticePage.jsx`
- **Current Version**: 1.0.0+2024.03.002.001
- **Purpose**: Interactive practice interface

#### 03-003: LessonMonacoEditor
- **File**: `src/features/lessons/components/LessonMonacoEditor.jsx`
- **Current Version**: 1.0.0+2024.03.003.001
- **Purpose**: Code editor for lessons

#### 03-004: LessonThemeProvider
- **File**: `src/features/lessons/components/LessonThemeProvider.jsx`
- **Current Version**: 1.0.0+2024.03.004.001
- **Purpose**: Theme management for lessons

#### 03-005: UseChallengeData
- **File**: `src/features/lessons/hooks/useChallengeData.js`
- **Current Version**: 1.0.0+2024.03.005.001
- **Purpose**: Challenge data hook for lessons

#### 03-006: UseLessonData
- **File**: `src/features/lessons/hooks/useLessonData.js`
- **Current Version**: 1.0.0+2024.03.006.001
- **Purpose**: Lesson data hook

#### 03-007: ChallengeService
- **File**: `src/features/lessons/services/challengeService.js`
- **Current Version**: 1.0.0+2024.03.007.001
- **Purpose**: Challenge service for lessons

#### 03-008: LessonService
- **File**: `src/features/lessons/services/lessonService.js`
- **Current Version**: 1.0.0+2024.03.008.001
- **Purpose**: Lesson service

### Challenges (04)
#### 04-001: ChallengesPage
- **File**: `src/features/challenges/pages/ChallengesPage.jsx`
- **Current Version**: 1.0.0+2024.04.001.001
- **Purpose**: Main challenges listing page

#### 04-002: ChallengeInstructionsPage
- **File**: `src/features/challenges/pages/ChallengeInstructionsPage.jsx`
- **Current Version**: 1.0.0+2024.04.002.001
- **Purpose**: Challenge instructions display

#### 04-003: ResultsPage
- **File**: `src/features/challenges/pages/ResultsPage.jsx`
- **Current Version**: 1.0.0+2024.04.003.001
- **Purpose**: Challenge results display

#### 04-004: ChallengeFeedback
- **File**: `src/features/challenges/components/ChallengeFeedback.jsx`
- **Current Version**: 1.0.0+2024.04.004.001
- **Purpose**: Challenge feedback display

#### 04-005: ChallengeHints
- **File**: `src/features/challenges/components/ChallengeHints.jsx`
- **Current Version**: 1.0.0+2024.04.005.001
- **Purpose**: Display challenge hints to users

#### 04-006: ChallengeSidebar
- **File**: `src/features/challenges/components/ChallengeSidebar.jsx`
- **Current Version**: 1.0.0+2024.04.006.001
- **Purpose**: Challenge navigation sidebar

#### 04-007: ChallengeTimer
- **File**: `src/features/challenges/components/ChallengeTimer.jsx`
- **Current Version**: 1.0.0+2024.04.007.001
- **Purpose**: Challenge countdown timer

#### 04-008: ChoicesBar
- **File**: `src/features/challenges/components/ChoicesBar.jsx`
- **Current Version**: 1.0.0+2024.04.008.001
- **Purpose**: Multiple choice answer selection

#### 04-009: CodeCompletion
- **File**: `src/features/challenges/modes/CodeCompletion.jsx`
- **Current Version**: 1.0.0+2024.04.009.001
- **Purpose**: Code completion challenge mode

#### 04-010: CodeFixer
- **File**: `src/features/challenges/modes/CodeFixer.jsx`
- **Current Version**: 1.0.0+2024.04.010.001
- **Purpose**: Code debugging challenge mode

#### 04-011: OutputTracing
- **File**: `src/features/challenges/modes/OutputTracing.jsx`
- **Current Version**: 1.0.0+2024.04.011.001
- **Purpose**: Code output prediction mode

#### 04-012: CustomExitWarningModal
- **File**: `src/features/challenges/components/CustomExitWarningModal.jsx`
- **Current Version**: 1.0.0+2024.04.012.001
- **Purpose**: Custom exit warning modal

#### 04-013: ChallengeThemeProvider
- **File**: `src/features/challenges/components/ChallengeThemeProvider.jsx`
- **Current Version**: 1.0.0+2024.04.013.001
- **Purpose**: Challenge theme management

#### 04-014: ChallengeService
- **File**: `src/features/challenges/services/challengeService.js`
- **Current Version**: 1.0.0+2024.04.014.001
- **Purpose**: Challenge business logic

#### 04-015: ChallengeValidation
- **File**: `src/features/challenges/services/challengeValidation.js`
- **Current Version**: 1.0.0+2024.04.015.001
- **Purpose**: Challenge validation logic

#### 04-016: UseAdaptiveFeatures
- **File**: `src/features/challenges/hooks/useAdaptiveFeatures.js`
- **Current Version**: 1.0.0+2024.04.016.001
- **Purpose**: Adaptive features hook

#### 04-017: UseChallengeService
- **File**: `src/features/challenges/hooks/useChallengeService.js`
- **Current Version**: 1.0.0+2024.04.017.001
- **Purpose**: Challenge service hook

#### 04-018: UseChallengeTheme
- **File**: `src/features/challenges/hooks/useChallengeTheme.js`
- **Current Version**: 1.0.0+2024.04.018.001
- **Purpose**: Challenge theme hook

#### 04-019: MonacoCodeBlock
- **File**: `src/features/challenges/components/MonacoCodeBlock.jsx`
- **Current Version**: 1.0.0+2024.04.019.001
- **Purpose**: Read-only Monaco code viewer for challenges

#### 04-020: OtherSessionWarningModal
- **File**: `src/features/challenges/components/OtherSessionWarningModal.jsx`
- **Current Version**: 1.0.0+2024.04.020.001
- **Purpose**: Warns when user has another active session

#### 04-021: ProgressIndicator
- **File**: `src/features/challenges/components/ProgressIndicator.jsx`
- **Current Version**: 1.0.0+2024.04.021.001
- **Purpose**: Visual progress indicator within challenges

#### 04-022: Challenge Utils - Error Handling
- **File**: `src/features/challenges/utils/errorHandling.js`
- **Current Version**: 1.0.0+2024.04.022.001
- **Purpose**: Centralized error handling helpers for challenge flows

#### 04-023: Challenge Utils - Monaco Themes
- **File**: `src/features/challenges/utils/monacoThemes.js`
- **Current Version**: 1.0.0+2024.04.023.001
- **Purpose**: Monaco editor theme definitions for challenge modes

### MyDeck (05)
#### 05-001: TopicPage
- **File**: `src/features/mydeck/pages/TopicPage.jsx`
- **Current Version**: 1.0.0+2024.05.001.001
- **Purpose**: Topic overview and navigation

#### 05-002: SubtopicPage
- **File**: `src/features/mydeck/pages/SubtopicPage.jsx`
- **Current Version**: 1.0.0+2024.05.002.001
- **Purpose**: Subtopic content display

#### 05-003: IntroductionPage
- **File**: `src/features/mydeck/pages/IntroductionPage.jsx`
- **Current Version**: 1.0.0+2024.05.003.001
- **Purpose**: Introduction and onboarding

#### 05-004: DetectiveBackground
- **File**: `src/features/mydeck/components/DetectiveBackground.jsx`
- **Current Version**: 1.0.0+2024.05.004.001
- **Purpose**: Detective theme background

#### 05-005: DetectiveThreadPath
- **File**: `src/features/mydeck/components/DetectiveThreadPath.jsx`
- **Current Version**: 1.0.0+2024.05.005.001
- **Purpose**: Detective theme navigation path

#### 05-006: FlashlightOverlay
- **File**: `src/features/mydeck/components/FlashlightOverlay.jsx`
- **Current Version**: 1.0.0+2024.05.006.001
- **Purpose**: Interactive flashlight effect

#### 05-007: Profile
- **File**: `src/features/mydeck/components/Profile.jsx`
- **Current Version**: 1.0.0+2024.05.007.001
- **Purpose**: User profile component

#### 05-008: ProfilePage
- **File**: `src/features/profile/pages/ProfilePage.jsx`
- **Current Version**: 1.0.0+2024.05.008.001
- **Purpose**: Profile page component

### Profile (18)
#### 18-001: ProfilePage
- **File**: `src/features/profile/pages/ProfilePage.jsx`
- **Current Version**: 1.0.0+2024.18.001.001
- **Purpose**: Profile page component

#### 18-002: ProfilePage Styles
- **File**: `src/features/profile/styles/ProfilePage.module.scss`
- **Current Version**: 1.0.0+2024.18.002.001
- **Purpose**: Profile page styling

### MyDeck (05) - Continued
#### 05-009: ContentMerger
- **File**: `src/features/mydeck/services/contentMerger.js`
- **Current Version**: 1.0.0+2024.05.009.001
- **Purpose**: Content merging service

#### 05-010: UseMydeckService
- **File**: `src/features/mydeck/hooks/useMydeckService.js`
- **Current Version**: 1.0.0+2024.05.010.001
- **Purpose**: MyDeck service hook

#### 05-011: UseParticles
- **File**: `src/features/mydeck/hooks/useParticles.js`
- **Current Version**: 1.0.0+2024.05.011.001
- **Purpose**: Particles effect hook

#### 05-012: UseTheme
- **File**: `src/features/mydeck/hooks/useTheme.js`
- **Current Version**: 1.0.0+2024.05.012.001
- **Purpose**: Theme hook for MyDeck

#### 05-013: FloatingRocks
- **File**: `src/features/mydeck/components/FloatingRocks.jsx`
- **Current Version**: 1.0.0+2024.05.013.001
- **Purpose**: Floating rocks background effect (wizard theme)

#### 05-014: LightningEffect
- **File**: `src/features/mydeck/components/LightningEffect.jsx`
- **Current Version**: 1.0.0+2024.05.014.001
- **Purpose**: Lightning visual effect overlay

#### 05-015: RainfallBackground
- **File**: `src/features/mydeck/components/RainfallBackground.jsx`
- **Current Version**: 1.0.0+2024.05.015.001
- **Purpose**: Rainfall background (detective theme)

#### 05-016: RuneBackground
- **File**: `src/features/mydeck/components/RuneBackground.jsx`
- **Current Version**: 1.0.0+2024.05.016.001
- **Purpose**: Animated runes background (wizard theme)

#### 05-017: SpaceBackground
- **File**: `src/features/mydeck/components/SpaceBackground.jsx`
- **Current Version**: 1.0.0+2024.05.017.001
- **Purpose**: Parallax space background (space theme)

#### 05-018: ImageThemeBackground
- **File**: `src/features/mydeck/components/ImageThemeBackground.jsx`
- **Current Version**: 1.0.0+2024.05.018.001
- **Purpose**: Image-based theme background wrapper

#### 05-019: SubtopicLayout
- **File**: `src/features/mydeck/components/SubtopicLayout.jsx`
- **Current Version**: 1.0.0+2024.05.019.001
- **Purpose**: Layout wrapper for subtopic detail pages

#### 05-020: SubtopicNode
- **File**: `src/features/mydeck/components/SubtopicNode.jsx`
- **Current Version**: 1.0.0+2024.05.020.001
- **Purpose**: Node component representing a subtopic

#### 05-021: TopicCard
- **File**: `src/features/mydeck/components/TopicCard.jsx`
- **Current Version**: 1.0.0+2024.05.021.001
- **Purpose**: Topic card UI component

#### 05-022: TypeCard
- **File**: `src/features/mydeck/components/TypeCard.jsx`
- **Current Version**: 1.0.0+2024.05.022.001
- **Purpose**: Content type card UI component

#### 05-023: WizardBackground
- **File**: `src/features/mydeck/components/WizardBackground.jsx`
- **Current Version**: 1.0.0+2024.05.023.001
- **Purpose**: Wizard theme background component

#### 05-024: WizardThreadPath
- **File**: `src/features/mydeck/components/WizardThreadPath.jsx`
- **Current Version**: 1.0.0+2024.05.024.001
- **Purpose**: Wizard theme thread navigation path

#### 05-025: Space Theme Provider
- **File**: `src/features/mydeck/providers/ThemeProvider.jsx`
- **Current Version**: 1.0.0+2024.05.025.001
- **Purpose**: Theme provider for MyDeck pages

### Progress (06)
#### 06-001: ProgressPage
- **File**: `src/features/progress/pages/ProgressPage.jsx`
- **Current Version**: 1.0.0+2024.06.001.001
- **Purpose**: User progress tracking

#### 06-002: ProgressAnalytics
- **File**: `src/features/progress/components/ProgressAnalytics.jsx`
- **Current Version**: 1.0.0+2024.06.002.001
- **Purpose**: Progress analytics and charts

### Assessments (07)
#### 07-001: Assessment
- **File**: `src/components/assessments/Assessment.jsx`
- **Current Version**: 1.0.0+2024.07.001.001
- **Purpose**: Main assessment component

#### 07-002: AssessmentInstructions
- **File**: `src/components/assessments/AssessmentInstructions.jsx`
- **Current Version**: 1.0.0+2024.07.002.001
- **Purpose**: Assessment instructions display

#### 07-003: AssessmentResult
- **File**: `src/components/assessments/AssessmentResult.jsx`
- **Current Version**: 1.0.0+2024.07.003.001
- **Purpose**: Assessment results display

#### 07-004: RetentionTest
- **File**: `src/components/assessments/RetentionTest.jsx`
- **Current Version**: 1.0.0+2024.07.004.001
- **Purpose**: Retention testing interface

#### 07-005: RetentionTestInstructions
- **File**: `src/components/assessments/RetentionTestInstructions.jsx`
- **Current Version**: 1.0.0+2024.07.005.001
- **Purpose**: Retention test instructions

#### 07-006: RetentionTestResult
- **File**: `src/components/assessments/RetentionTestResult.jsx`
- **Current Version**: 1.0.0+2024.07.006.001
- **Purpose**: Retention test results

### Layout & Navigation (08)
#### 08-001: Layout
- **File**: `src/components/layout/Sidebar/Layout.jsx`
- **Current Version**: 1.0.0+2024.08.001.001
- **Purpose**: Main layout wrapper

#### 08-002: Sidebar
- **File**: `src/components/layout/Sidebar/Sidebar.jsx`
- **Current Version**: 1.0.0+2024.08.002.001
- **Purpose**: Navigation sidebar

#### 08-003: TitleAndProfile
- **File**: `src/components/layout/Navbar/TitleAndProfile.jsx`
- **Current Version**: 1.0.0+2024.08.003.001
- **Purpose**: Title and profile display

#### 08-004: LoadingScreen
- **File**: `src/components/layout/StatusScreen/LoadingScreen.jsx`
- **Current Version**: 1.0.0+2024.08.004.001
- **Purpose**: Loading state display

#### 08-005: ErrorScreen
- **File**: `src/components/layout/StatusScreen/ErrorScreen.jsx`
- **Current Version**: 1.0.0+2024.08.005.001
- **Purpose**: Error state display

### Landing (09)
#### 09-001: LandingPage
- **File**: `src/features/landing/pages/LandingPage.jsx`
- **Current Version**: 1.0.0+2024.09.001.001
- **Purpose**: Main landing page

#### 09-002: HeaderNavbar
- **File**: `src/features/landing/components/HeaderNavbar.jsx`
- **Current Version**: 1.0.0+2024.09.002.001
- **Purpose**: Landing page navigation

#### 09-003: Features
- **File**: `src/features/landing/components/Features.jsx`
- **Current Version**: 1.0.0+2024.09.003.001
- **Purpose**: Features showcase

#### 09-004: Footer
- **File**: `src/features/landing/components/Footer.jsx`
- **Current Version**: 1.0.0+2024.09.004.001
- **Purpose**: Landing page footer

#### 09-005: Heading
- **File**: `src/features/landing/components/Heading.jsx`
- **Current Version**: 1.0.0+2024.09.005.001
- **Purpose**: Hero heading component

#### 09-006: ImageCarousel
- **File**: `src/features/landing/components/ImageCarousel.jsx`
- **Current Version**: 1.0.0+2024.09.006.001
- **Purpose**: Landing page image carousel

#### 09-007: ScrollIndicator
- **File**: `src/features/landing/components/ScrollIndicator.jsx`
- **Current Version**: 1.0.0+2024.09.007.001
- **Purpose**: Scroll hint/indicator

#### 09-008: Team
- **File**: `src/features/landing/components/Team.jsx`
- **Current Version**: 1.0.0+2024.09.008.001
- **Purpose**: Team members showcase

### Core (10)
#### 10-001: App
- **File**: `src/App.jsx`
- **Current Version**: 1.0.0+2024.10.001.001
- **Purpose**: Main application component

#### 10-002: AuthContext
- **File**: `src/contexts/AuthContext.jsx`
- **Current Version**: 1.0.0+2024.10.002.001
- **Purpose**: Authentication state management

#### 10-003: MyDeckContext
- **File**: `src/contexts/MyDeckContext.jsx`
- **Current Version**: 1.0.0+2024.10.003.001
- **Purpose**: MyDeck state management

#### 10-004: ServerStatusContext
- **File**: `src/contexts/ServerStatusContext.jsx`
- **Current Version**: 1.0.0+2024.10.004.001
- **Purpose**: Server status monitoring

#### 10-005: ThemeContext
- **File**: `src/contexts/ThemeContext.jsx`
- **Current Version**: 1.0.0+2024.10.005.001
- **Purpose**: Theme state management

#### 10-006: ErrorBoundary
- **File**: `src/components/error_fallback/ErrorBoundary.jsx`
- **Current Version**: 1.0.0+2024.10.006.001
- **Purpose**: Error boundary component

#### 10-007: NotFoundPage
- **File**: `src/components/error_fallback/NotFoundPage.jsx`
- **Current Version**: 1.0.0+2024.10.007.001
- **Purpose**: 404 not found page

#### 10-008: ServerDownPage
- **File**: `src/components/error_fallback/ServerDownPage.jsx`
- **Current Version**: 1.0.0+2024.10.008.001
- **Purpose**: Server down error page

#### 10-009: ProtectedTopicRoute
- **File**: `src/components/error_fallback/ProtectedTopicRoute.jsx`
- **Current Version**: 1.0.0+2024.10.009.001
- **Purpose**: Protected route wrapper

## Backend Modules

### API Endpoints (11)
#### 11-001: Users API
- **File**: `app/api/users.py`
- **Current Version**: 1.0.0+2024.11.001.001
- **Purpose**: User management endpoints

#### 11-002: Topics API
- **File**: `app/api/topics.py`
- **Current Version**: 1.0.0+2024.11.002.001
- **Purpose**: Topic management endpoints

#### 11-003: Subtopics API
- **File**: `app/api/subtopics.py`
- **Current Version**: 1.0.0+2024.11.003.001
- **Purpose**: Subtopic CRUD operations

#### 11-004: Lessons API
- **File**: `app/api/lessons.py`
- **Current Version**: 1.0.0+2024.11.004.001
- **Purpose**: Lesson management endpoints

#### 11-005: Challenges API
- **File**: `app/api/challenges.py`
- **Current Version**: 1.0.0+2024.11.005.001
- **Purpose**: Challenge management endpoints

#### 11-006: Challenge Attempts API
- **File**: `app/api/challenge_attempts.py`
- **Current Version**: 1.0.0+2024.11.006.001
- **Purpose**: Challenge attempt tracking

#### 11-007: User Topics API
- **File**: `app/api/user_topics.py`
- **Current Version**: 1.0.0+2024.11.007.001
- **Purpose**: User topic progress management

#### 11-008: User Subtopics API
- **File**: `app/api/user_subtopics.py`
- **Current Version**: 1.0.0+2024.11.008.001
- **Purpose**: User subtopic progress management

#### 11-009: User Challenges API
- **File**: `app/api/user_challenges.py`
- **Current Version**: 1.0.0+2024.11.009.001
- **Purpose**: User challenge progress management

#### 11-010: Pre Assessments API
- **File**: `app/api/pre_assessments.py`
- **Current Version**: 1.0.0+2024.11.010.001
- **Purpose**: Pre-assessment management

#### 11-011: Post Assessments API
- **File**: `app/api/post_assessments.py`
- **Current Version**: 1.0.0+2024.11.011.001
- **Purpose**: Post-assessment management

#### 11-012: Assessment Questions API
- **File**: `app/api/assessment_questions.py`
- **Current Version**: 1.0.0+2024.11.012.001
- **Purpose**: Assessment question management

#### 11-013: Q Values API
- **File**: `app/api/q_values.py`
- **Current Version**: 1.0.0+2024.11.013.001
- **Purpose**: Q-value management for BKT

#### 11-014: Statistics API
- **File**: `app/api/statistics.py`
- **Current Version**: 1.0.0+2024.11.014.001
- **Purpose**: Statistics and analytics

#### 11-015: Authentication API
- **File**: `app/api/auth.py`
- **Current Version**: 1.0.0+2024.11.015.001
- **Purpose**: Authentication endpoints

### Database Models (12)
#### 12-001: User Model
- **File**: `app/db/models/users.py`
- **Current Version**: 1.0.0+2024.12.001.001
- **Purpose**: User data structure

#### 12-002: Topic Model
- **File**: `app/db/models/topics.py`
- **Current Version**: 1.0.0+2024.12.002.001
- **Purpose**: Topic data structure

#### 12-003: Subtopic Model
- **File**: `app/db/models/subtopics.py`
- **Current Version**: 1.0.0+2024.12.003.001
- **Purpose**: Subtopic data structure

#### 12-004: Lesson Model
- **File**: `app/db/models/lessons.py`
- **Current Version**: 1.0.0+2024.12.004.001
- **Purpose**: Lesson data structure

#### 12-005: Challenge Model
- **File**: `app/db/models/challenges.py`
- **Current Version**: 1.0.0+2024.12.005.001
- **Purpose**: Challenge data structure

#### 12-006: Challenge Attempt Model
- **File**: `app/db/models/challenge_attempts.py`
- **Current Version**: 1.0.0+2024.12.006.001
- **Purpose**: Challenge attempt data structure

#### 12-007: User Topic Model
- **File**: `app/db/models/user_topics.py`
- **Current Version**: 1.0.0+2024.12.007.001
- **Purpose**: User topic progress data

#### 12-008: User Subtopic Model
- **File**: `app/db/models/user_subtopics.py`
- **Current Version**: 1.0.0+2024.12.008.001
- **Purpose**: User subtopic progress data

#### 12-009: User Challenge Model
- **File**: `app/db/models/user_challenges.py`
- **Current Version**: 1.0.0+2024.12.009.001
- **Purpose**: User challenge progress data

#### 12-010: Pre Assessment Model
- **File**: `app/db/models/pre_assessments.py`
- **Current Version**: 1.0.0+2024.12.010.001
- **Purpose**: Pre-assessment data structure

#### 12-011: Post Assessment Model
- **File**: `app/db/models/post_assessments.py`
- **Current Version**: 1.0.0+2024.12.011.001
- **Purpose**: Post-assessment data structure

#### 12-012: Assessment Question Model
- **File**: `app/db/models/assessment_questions.py`
- **Current Version**: 1.0.0+2024.12.012.001
- **Purpose**: Assessment question data structure

#### 12-013: Q Value Model
- **File**: `app/db/models/q_values.py`
- **Current Version**: 1.0.0+2024.12.013.001
- **Purpose**: Q-value data structure

#### 12-014: Statistic Model
- **File**: `app/db/models/statistics.py`
- **Current Version**: 1.0.0+2024.12.014.001
- **Purpose**: Statistics data structure

#### 12-015: Retention Test Model
- **File**: `app/db/models/retention_tests.py`
- **Current Version**: 1.0.0+2024.12.015.001
- **Purpose**: Retention test data structure

### CRUD Operations (13)
#### 13-001: User CRUD
- **File**: `app/crud/user.py`
- **Current Version**: 1.0.0+2024.13.001.001
- **Purpose**: User database operations

#### 13-002: Topic CRUD
- **File**: `app/crud/topic.py`
- **Current Version**: 1.0.0+2024.13.002.001
- **Purpose**: Topic database operations

#### 13-003: Subtopic CRUD
- **File**: `app/crud/subtopic.py`
- **Current Version**: 1.0.0+2024.13.003.001
- **Purpose**: Subtopic database operations

#### 13-004: Lesson CRUD
- **File**: `app/crud/lesson.py`
- **Current Version**: 1.0.0+2024.13.004.001
- **Purpose**: Lesson database operations

#### 13-005: Challenge CRUD
- **File**: `app/crud/challenge.py`
- **Current Version**: 1.0.0+2024.13.005.001
- **Purpose**: Challenge database operations

#### 13-006: Challenge Attempt CRUD
- **File**: `app/crud/challenge_attempt.py`
- **Current Version**: 1.0.0+2024.13.006.001
- **Purpose**: Challenge attempt database operations

#### 13-007: User Topic CRUD
- **File**: `app/crud/user_topic.py`
- **Current Version**: 1.0.0+2024.13.007.001
- **Purpose**: User topic progress operations

#### 13-008: User Subtopic CRUD
- **File**: `app/crud/user_subtopic.py`
- **Current Version**: 1.0.0+2024.13.008.001
- **Purpose**: User subtopic progress operations

#### 13-009: User Challenge CRUD
- **File**: `app/crud/user_challenge.py`
- **Current Version**: 1.0.0+2024.13.009.001
- **Purpose**: User challenge progress operations

#### 13-010: Pre Assessment CRUD
- **File**: `app/crud/pre_assessment.py`
- **Current Version**: 1.0.0+2024.13.010.001
- **Purpose**: Pre-assessment database operations

#### 13-011: Post Assessment CRUD
- **File**: `app/crud/post_assessment.py`
- **Current Version**: 1.0.0+2024.13.011.001
- **Purpose**: Post-assessment database operations

#### 13-012: Assessment Question CRUD
- **File**: `app/crud/assessment_question.py`
- **Current Version**: 1.0.0+2024.13.012.001
- **Purpose**: Assessment question database operations

#### 13-013: Q Value CRUD
- **File**: `app/crud/q_value.py`
- **Current Version**: 1.0.0+2024.13.013.001
- **Purpose**: Q-value database operations

#### 13-014: Statistic CRUD
- **File**: `app/crud/statistic.py`
- **Current Version**: 1.0.0+2024.13.014.001
- **Purpose**: Statistics database operations

### Schemas (14)
#### 14-001: User Schema
- **File**: `app/schemas/user.py`
- **Current Version**: 1.0.0+2024.14.001.001
- **Purpose**: User data validation

#### 14-002: Topic Schema
- **File**: `app/schemas/topic.py`
- **Current Version**: 1.0.0+2024.14.002.001
- **Purpose**: Topic data validation

#### 14-003: Subtopic Schema
- **File**: `app/schemas/subtopic.py`
- **Current Version**: 1.0.0+2024.14.003.001
- **Purpose**: Subtopic data validation

#### 14-004: Lesson Schema
- **File**: `app/schemas/lesson.py`
- **Current Version**: 1.0.0+2024.14.004.001
- **Purpose**: Lesson data validation

#### 14-005: Challenge Schema
- **File**: `app/schemas/challenge.py`
- **Current Version**: 1.0.0+2024.14.005.001
- **Purpose**: Challenge data validation

#### 14-006: Challenge Attempt Schema
- **File**: `app/schemas/challenge_attempt.py`
- **Current Version**: 1.0.0+2024.14.006.001
- **Purpose**: Challenge attempt data validation

#### 14-007: User Topic Schema
- **File**: `app/schemas/user_topic.py`
- **Current Version**: 1.0.0+2024.14.007.001
- **Purpose**: User topic progress validation

#### 14-008: User Subtopic Schema
- **File**: `app/schemas/user_subtopic.py`
- **Current Version**: 1.0.0+2024.14.008.001
- **Purpose**: User subtopic progress validation

#### 14-009: User Challenge Schema
- **File**: `app/schemas/user_challenge.py`
- **Current Version**: 1.0.0+2024.14.009.001
- **Purpose**: User challenge progress validation

#### 14-010: Pre Assessment Schema
- **File**: `app/schemas/pre_assessment.py`
- **Current Version**: 1.0.0+2024.14.010.001
- **Purpose**: Pre-assessment data validation

#### 14-011: Post Assessment Schema
- **File**: `app/schemas/post_assessment.py`
- **Current Version**: 1.0.0+2024.14.011.001
- **Purpose**: Post-assessment data validation

#### 14-012: Assessment Question Schema
- **File**: `app/schemas/assessment_question.py`
- **Current Version**: 1.0.0+2024.14.012.001
- **Purpose**: Assessment question validation

#### 14-013: Q Value Schema
- **File**: `app/schemas/q_value.py`
- **Current Version**: 1.0.0+2024.14.013.001
- **Purpose**: Q-value data validation

#### 14-014: Statistic Schema
- **File**: `app/schemas/statistic.py`
- **Current Version**: 1.0.0+2024.14.014.001
- **Purpose**: Statistics data validation

#### 14-015: Retention Test Schema
- **File**: `app/schemas/retention_test.py`
- **Current Version**: 1.0.0+2024.14.015.001
- **Purpose**: Retention test data validation

### Services (15)
#### 15-001: Email Service
- **File**: `app/services/email.py`
- **Current Version**: 1.0.0+2024.15.001.001
- **Purpose**: Email functionality

#### 15-002: Engine Service
- **File**: `app/services/engine.py`
- **Current Version**: 1.0.0+2024.15.002.001
- **Purpose**: Core engine logic

#### 15-003: Selection Service
- **File**: `app/services/selection.py`
- **Current Version**: 1.0.0+2024.15.003.001
- **Purpose**: Content selection logic

#### 15-004: Security Utils
- **File**: `app/utils/security.py`
- **Current Version**: 1.0.0+2024.15.004.001
- **Purpose**: Security utilities

#### 15-009: Cache Utils
- **File**: `app/utils/cache.py`
- **Current Version**: 1.0.0+2024.15.009.001
- **Purpose**: Simple caching and memoization utilities

#### 15-005: Main App
- **File**: `app/main.py`
- **Current Version**: 1.0.0+2024.15.005.001
- **Purpose**: Main FastAPI application

#### 15-006: UseApi Hook
- **File**: `src/hooks/useApi.js`
- **Current Version**: 1.0.0+2024.15.006.001
- **Purpose**: API hook utility

#### 15-007: Notifications
- **File**: `src/utils/notifications.js`
- **Current Version**: 1.0.0+2024.15.007.001
- **Purpose**: Notification utilities

#### 15-008: Validation
- **File**: `src/utils/validation.js`
- **Current Version**: 1.0.0+2024.15.008.001
- **Purpose**: Validation utilities

### Core Logic (16)
#### 16-001: BKT Algorithm
- **File**: `app/core/bkt.py`
- **Current Version**: 1.0.0+2024.16.001.001
- **Purpose**: Bayesian Knowledge Tracing algorithm

#### 16-002: Reinforcement Learning
- **File**: `app/core/rl.py`
- **Current Version**: 1.0.0+2024.16.002.001
- **Purpose**: RL-based content selection

#### 16-003: Configuration
- **File**: `app/core/config.py`
- **Current Version**: 1.0.0+2024.16.003.001
- **Purpose**: Application configuration

#### 16-004: Middleware
- **File**: `app/core/middleware.py`
- **Current Version**: 1.0.0+2024.16.004.001
- **Purpose**: Request/response middleware

#### 16-005: Utilities
- **File**: `app/core/utils.py`
- **Current Version**: 1.0.0+2024.16.005.001
- **Purpose**: Common utility functions

### Database (17)
#### 17-001: Database Session
- **File**: `app/db/session.py`
- **Current Version**: 1.0.0+2024.17.001.001
- **Purpose**: Database connection management

#### 17-002: Base Models
- **File**: `app/db/base.py`
- **Current Version**: 1.0.0+2024.17.002.001
- **Purpose**: Base model definitions

#### 17-003: Database Seeder
- **File**: `app/db/seeder.py`
- **Current Version**: 1.0.0+2024.17.003.001
- **Purpose**: Database seeding functionality

## Usage Guidelines

### Version Increment Rules

#### MAJOR Version (Breaking Changes)
- ❌ Removed features users depend on
- ❌ Changed API endpoints
- ❌ Renamed functions/classes
- ❌ Database schema changes

#### MINOR Version (New Features)
- ✅ Added new functionality
- ✅ Enhanced existing features
- ✅ New API endpoints
- ✅ New UI components

#### PATCH Version (Bug Fixes)
- 🐛 Fixed bugs
- 🔧 Performance improvements
- 🛡️ Security fixes
- 📝 Documentation updates

### Build Number Format
```
2024.01.001.003
│    │   │   └───── Revision (003)
│    │   └───────── File (001)
│    └───────────── Module (01)
└─────────────────── Year (2024)
```

### Commit Message Examples
```
"Updated 01-001 to 1.1.0+2024.01.001.002 - Added social login (minor)"
"Fixed 04-005 to 1.0.1+2024.04.005.002 - Timer bug fix (patch)"
"Breaking change in 11-003 to 2.0.0+2024.11.003.001 - API redesign (major)"
```

### Bug Report Format
```
"Bug in 04-005 at 1.0.0+2024.04.005.001 - Challenge timer not working"
"Issue with 01-001 at 1.0.0+2024.01.001.001 - Form validation failing"
```

## Adding New Modules

1. **Assign next available module number**
2. **Start with version 1.0.0+[YEAR].[MODULE].[FILE].001**
3. **Update this registry document**
4. **Include version in commit messages**

## Benefits

✅ **Industry Standard** - SemVer used by React, Node.js, etc.  
✅ **Professional** - Enterprise-grade versioning  
✅ **Clear Communication** - Shows change type and scope  
✅ **GitHub Integration** - Automatic release notes  
✅ **Tool Compatibility** - Works with all modern development tools  
✅ **Scalable** - Handles thousands of revisions  

---

**Last Updated**: 2025-09-11  
**Registry Version**: 1.0.0+2024.00.000.001

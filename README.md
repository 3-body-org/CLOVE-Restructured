# CLOVE - Adaptive Java Learning Platform

## 🎯 System Overview

**CLOVE** (Code Learning with Optimized Virtual Education) is an intelligent, adaptive learning platform designed to teach Java programming through immersive, game-inspired challenges. The system combines advanced educational algorithms with engaging thematic environments to create a personalized learning experience that adapts to each student's performance and learning patterns.

### Purpose

CLOVE addresses the challenge of making programming education more engaging and effective by:

- **Personalizing Learning**: Adapts challenge difficulty, timing, and hints based on individual performance
- **Gamifying Education**: Uses immersive themes (Wizard Academy, Space Mission, Noir Detective) to make learning engaging
- **Optimizing Learning Paths**: Employs AI algorithms to select the most effective challenges for each student
- **Tracking Progress**: Provides detailed analytics and progress visualization
- **Ensuring Mastery**: Uses assessment systems to verify knowledge retention

## 🧠 Core Algorithms

### 1. Bayesian Knowledge Tracing (BKT)
- **Purpose**: Models student knowledge state and predicts learning outcomes
- **File Location**: `clove-backend/app/core/bkt.py`
- **Parameters**:
  - `p_T = 0.1` (Transition probability - likelihood of learning)
  - `p_G = 0.2` (Guess probability - chance of correct answer without knowledge)
  - `p_S = 0.1` (Slip probability - chance of incorrect answer despite knowledge)
- **Implementation**: Updates knowledge probability after each challenge attempt
- **Key Method**: `update_knowledge(knowledge_prob, is_correct)`

### 2. Q-Learning (Reinforcement Learning)
- **Purpose**: Optimizes challenge selection strategy based on student performance
- **File Location**: `clove-backend/app/core/rl.py`
- **Parameters**:
  - `α = 0.1` (Learning rate)
  - `γ = 0.9` (Discount factor)
  - `ε = 0.8` (Initial exploration rate, decays to 0.1)
- **State Space**: (Mastery Level, Timer Active, Hint Active)
- **Actions**: Challenge types (code_fixer, code_completion, output_tracing)
- **Rewards**: Based on correctness, hints used, timing, and streak performance
- **Key Methods**: `select_action(state)`, `update_q_value(current_state, action, reward, next_state)`

### 3. Adaptive Challenge Selection
- **Purpose**: Intelligently selects the most appropriate challenge for each student
- **File Location**: `clove-backend/app/services/selection.py`
- **Mastery Classification**: 
  - Beginner (0-33% knowledge)
  - Intermediate (34-66% knowledge) 
  - Advanced (67-100% knowledge)
- **Difficulty Mapping**: Automatically adjusts challenge difficulty based on mastery level
- **Streak Analysis**: Tracks correct/incorrect streaks to activate timers and hints
- **Key Functions**: `_select_adaptive_challenge()`, `_select_non_adaptive_challenge()`

### 4. Learning Engine
- **Purpose**: Orchestrates the learning process and updates student knowledge
- **File Location**: `clove-backend/app/services/engine.py`
- **Functions**: 
  - Manages adaptive and non-adaptive learning updates
  - Integrates BKT and Q-Learning algorithms
  - Handles reward calculation and state transitions
- **Key Functions**: `_run_adaptive_update()`, `_run_non_adaptive_update()`

### 5. Algorithm Utilities
- **Purpose**: Common utilities and configuration for all algorithms
- **File Location**: `clove-backend/app/core/utils.py`
- **Contains**:
  - Algorithm parameters and constants
  - Mastery classification functions
  - Q-table value rounding utilities
  - Challenge type and difficulty mappings

## 🏗️ System Architecture

### Frontend (React + Vite)
- **Framework**: React 19 with Vite for fast development
- **Styling**: SCSS with Bootstrap 5 and custom theme system
- **State Management**: React Context API for authentication and app state
- **Routing**: React Router DOM for navigation
- **UI Components**: Custom components with Framer Motion animations
- **Code Editor**: Monaco Editor for syntax highlighting and code completion
- **Charts**: Recharts for progress visualization

### Backend (FastAPI + PostgreSQL)
- **Framework**: FastAPI with async/await support
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Authentication**: JWT tokens with refresh token mechanism
- **API Design**: RESTful API with automatic OpenAPI documentation
- **Email Service**: Brevo integration for user notifications
- **Deployment**: Render.com with PostgreSQL database

### Database Schema
Core entities include:
- **Users**: Student profiles and authentication
- **Topics/Subtopics**: Learning content hierarchy
- **Challenges**: Interactive coding exercises with multiple types
- **Lessons**: Educational content and tutorials
- **Assessments**: Pre/post assessments for knowledge evaluation
- **Q-Values**: Reinforcement learning state-action values
- **Statistics**: Performance tracking and analytics

## 🎮 Learning Features

### Challenge Types
1. **Code Fixer**: Identify and correct bugs in provided code
2. **Code Completion**: Complete missing code segments
3. **Output Tracing**: Predict program output and trace execution

### Thematic Environments
- **Wizard Academy**: Fantasy-themed learning with magical elements
- **Space Mission**: Sci-fi themed challenges aboard a starship
- **Noir Detective**: Mystery-themed problem-solving scenarios

### Adaptive Features
- **Dynamic Difficulty**: Automatically adjusts based on performance
- **Smart Hints**: Contextual help that activates during struggle
- **Timer Management**: Adaptive time limits based on performance streaks
- **Progress Tracking**: Real-time analytics and mastery visualization

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Python 3.11+
- PostgreSQL database
- Git

### Frontend Setup

1. **Navigate to frontend directory**:
```bash
cd clove-frontend
```

2. **Install dependencies**:
```bash
npm install
```

3. **Start development server**:
```bash
npm run dev
```

### Backend Setup

1. **Navigate to backend directory**:
```bash
cd clove-backend
```

2. **Create virtual environment**:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**:
```bash
pip install -r requirements.txt
```

4. **Set up environment variables**:
```bash
cp .env.template .env
# Edit .env with your database and API keys
```

5. **Generate JWT Secret Key**:
```bash
python -m scripts.generate_key (creation of key)
# Edit .env and add the generated key under JWT Secret Key
```
    5.1 **Populate the Database by Seeding**:
    ```bash
    •python -m app.db.seeder 
    # If the Database has not been seeded yet
    ```

6. **Run database migrations**:
```bash
alembic upgrade head
```

7. **Start the server**:
```bash
uvicorn app.main:app --reload
```

### Database Access

To access the Render PostgreSQL database:

1. **Via Render Dashboard**:
   - Go to your Render dashboard
   - Navigate to your PostgreSQL service
   - Use the built-in database browser or connection details

2. **Via psql (if you have connection details)**:
```bash
psql -h YOUR_RENDER_DB_HOST -U YOUR_USERNAME -d YOUR_DB_NAME
```

3. **Via Database URL**:
   - Use the DATABASE_URL from your Render environment variables
   - Connect using your preferred PostgreSQL client

## 📊 Usage

### For Students
1. **Register/Login**: Create an account or sign in
2. **Choose Theme**: Select your preferred learning environment
3. **Take Pre-Assessment**: Complete initial knowledge evaluation
4. **Learn Through Challenges**: Engage with adaptive coding challenges
5. **Track Progress**: Monitor your learning journey and mastery levels
6. **Complete Post-Assessment**: Verify knowledge retention

### For Educators
1. **Monitor Student Progress**: View detailed analytics and performance metrics
2. **Customize Content**: Modify challenges and learning materials
3. **Analyze Learning Patterns**: Use data insights to improve curriculum

## 🔧 Development

### Project Structure
```
CLOVE-Restructured/
├── clove-frontend/          # React frontend application
│   ├── src/
│   │   ├── features/        # Feature-based modules
│   │   ├── components/      # Reusable UI components
│   │   ├── contexts/        # React context providers
│   │   └── styles/          # SCSS styling system
├── clove-backend/           # FastAPI backend application
│   ├── app/
│   │   ├── api/            # API endpoints
│   │   ├── core/           # Core algorithms (BKT, RL)
│   │   ├── crud/           # Database operations
│   │   ├── db/             # Database models and session
│   │   ├── schemas/        # Pydantic schemas
│   │   └── services/       # Business logic services
└── scripts/                # Utility scripts
```

### Key Technologies
- **Frontend**: React, Vite, SCSS, Bootstrap, Framer Motion
- **Backend**: FastAPI, SQLAlchemy, PostgreSQL, Alembic
- **AI/ML**: NumPy, Custom BKT and Q-Learning implementations
- **Deployment**: Netlify (Frontend), Render.com (Backend + Database)
- **Development**: Black, isort, ESLint

## 📈 Performance & Analytics

The system tracks comprehensive learning metrics:
- Knowledge mastery progression
- Challenge completion rates
- Time-to-mastery analytics
- Learning efficiency measurements
- Adaptive algorithm performance

## 🔒 Security

- JWT-based authentication with refresh tokens
- Password hashing with bcrypt
- CORS protection and rate limiting
- Input validation and sanitization
- Secure database connections

## 🌐 Deployment

### Production URLs
- **Frontend**: Deployed on [Netlify](https://netlify.com)
- **Backend API**: Deployed on [Render.com](https://render.com)
- **Database**: PostgreSQL hosted on Render.com

### Deployment Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Netlify       │    │   Render.com    │    │   Render.com    │
│   (Frontend)    │◄──►│   (Backend)     │◄──►│   (Database)    │
│   React App     │    │   FastAPI       │    │   PostgreSQL    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Environment Configuration
- **Frontend**: Environment variables configured in Netlify dashboard
- **Backend**: Environment variables configured in Render dashboard
- **Database**: Connection string managed by Render's PostgreSQL service

## 📝 License

This project is developed for educational purposes. Please refer to the license file for usage terms.



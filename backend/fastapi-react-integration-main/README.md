
# FastAPI and React Integration

This project demonstrates integration between a FastAPI backend and React frontend with JWT authentication. It features user registration, login, and profile management functionality.

## Project Structure

```
fastapi-react-integration/
├── backend/
│   ├── auth/
│   │   └── auth_handler.py  # JWT authentication logic
│   ├── routers/
│   │   ├── auth.py          # Authentication routes
│   │   └── user.py          # User profile routes
│   ├── database.py          # Database connection
│   ├── models.py            # SQLAlchemy models
│   └── schemas.py           # Pydantic schemas
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   └── UserProfile.jsx
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx  # Authentication state management
│   │   ├── api.js           # API integration functions
│   │   └── App.jsx          # Main application component
│   └── package.json
├── main.py                  # FastAPI application entry point
└── .env                     # Environment variables
```

## API Endpoints

| Endpoint | Method | Description | Request Body | Response |
|----------|--------|-------------|-------------|----------|
| `/` | GET | Health check | None | `{"message": "API is working!"}` |
| `/auth/register` | POST | Register new user | `{"username": "string", "email": "string", "password": "string"}` | User object |
| `/auth/token` | POST | Login and get token | Form data with username/password | `{"access_token": "string", "token_type": "bearer"}` |
| `/users/me/` | GET | Get current user | None (requires auth token) | User object |

## Setup Instructions

### Backend Setup

1. Create a virtual environment and activate it:
   ```bash
   python -m venv venv
   # Windows
   venv\Scripts\activate
   # macOS/Linux
   source venv/bin/activate
   ```

2. Install backend dependencies:
   ```bash
   pip install -r backend/requirements.txt
   ```

3. Copy the example file to create your .env file:
```bash
# Windows
copy example.env .env

# macOS/Linux
cp example.env .env
   ```

4. Run the FastAPI server:
   ```bash
   uvicorn main:app --reload
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Ensure React Router is properly installed
    ```bash
    npm install react-router-dom
    ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Access the application at http://localhost:5173

## Features

- **User Authentication:** JWT-based authentication system
- **User Registration:** Create new user accounts
- **User Profile:** View and manage user information
- **Protected Routes:** Restrict access to authenticated users

## Technologies Used

- **Backend:**
  - FastAPI: Modern, fast web framework for building APIs
  - SQLAlchemy: SQL toolkit and ORM
  - PyJWT: JSON Web Token implementation
  - Python-decouple: Environment variable management

- **Frontend:**
  - React: JavaScript library for building user interfaces
  - Axios: Promise-based HTTP client
  - React Router: Navigation and routing

## Screenshots

![Register User](/frontend/src/assets/image-7.png)
![Login Registered User](/frontend/src/assets/image-8.png)
![User Profile](/frontend/src/assets/image-9.png)
![FastAPI docs](/frontend/src/assets/image-4.png)

## Development

To access the API documentation locally, visit: http://localhost:8000/docs

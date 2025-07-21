#!/usr/bin/env node

// CLOVE Learning Platform Root Setup Script
// Refactored for clarity, maintainability, and cross-platform compatibility

const { execSync, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const crypto = require('crypto');

// Console color helpers
const colors = {
  reset: '\x1b[0m', bright: '\x1b[1m', red: '\x1b[31m', green: '\x1b[32m', yellow: '\x1b[33m', blue: '\x1b[34m', magenta: '\x1b[35m', cyan: '\x1b[36m'
};
function log(msg, color = 'reset') { console.log(`${colors[color]}${msg}${colors.reset}`); }

// User input helpers
function createInterface() { return readline.createInterface({ input: process.stdin, output: process.stdout }); }
function question(rl, query) { return new Promise(resolve => rl.question(query, resolve)); }

// Frontend dependencies from package.json
const frontendDependencies = {
  dependencies: [
    "@codemirror/lang-java",
    "@fortawesome/fontawesome-svg-core",
    "@fortawesome/free-brands-svg-icons",
    "@fortawesome/free-solid-svg-icons",
    "@fortawesome/react-fontawesome",
    "@monaco-editor/react",
    "@uiw/codemirror-theme-okaidia",
    "@uiw/react-codemirror",
    "axios",
    "bootstrap",
    "canvas-confetti",
    "framer-motion",
    "prism-react-renderer",
    "prismjs",
    "react",
    "react-bootstrap",
    "react-confetti",
    "react-dom",
    "react-router-dom",
    "react-simple-code-editor",
    "recharts",
    "sass"
  ],
  devDependencies: [
    "@eslint/js",
    "@types/react",
    "@types/react-dom",
    "@vitejs/plugin-react-swc",
    "eslint",
    "eslint-plugin-react-hooks",
    "eslint-plugin-react-refresh",
    "globals",
    "vite"
  ]
};

// Backend dependencies from requirements.txt
const backendDependencies = {
  webFramework: [
    "fastapi>=0.104.0",
    "uvicorn[standard]>=0.24.0",
    "starlette>=0.27.0",
    "python-multipart>=0.0.6"
  ],
  database: [
    "SQLAlchemy>=2.0.0",
    "asyncpg>=0.29.0",
    "alembic>=1.12.0",
    "psycopg2-binary>=2.9.0"
  ],
  authSecurity: [
    "passlib[bcrypt]>=1.7.4",
    "bcrypt>=4.0.0",
    "python-jose[cryptography]>=3.3.0",
    "python-dotenv>=1.0.0",
    "backoff>=2.2.0"
  ],
  dataValidation: [
    "pydantic>=2.0.0",
    "pydantic[email]>=2.0.0",
    "pydantic-settings>=2.0.0"
  ],
  development: [
    "black>=23.0.0",
    "isort>=5.12.0"
  ],
  scientific: [
    "numpy>=1.24.0"
  ]
};

function displayDependencies() {
  log('\n' + '='.repeat(60), 'cyan');
  log('CLOVE LEARNING PLATFORM - DEPENDENCIES OVERVIEW', 'bright');
  log('='.repeat(60), 'cyan');
  
  log('\n📦 FRONTEND DEPENDENCIES (React/Vite)', 'yellow');
  log('-'.repeat(40), 'yellow');
  log('📄 Using clove-frontend/package.json for dependency checking', 'cyan');
  
  log('\n🔧 Production Dependencies:', 'green');
  frontendDependencies.dependencies.forEach(dep => {
    log(`  • ${dep}`, 'reset');
  });
  
  log('\n🛠️  Development Dependencies:', 'green');
  frontendDependencies.devDependencies.forEach(dep => {
    log(`  • ${dep}`, 'reset');
  });
  
  log('\n🐍 BACKEND DEPENDENCIES (Python/FastAPI)', 'yellow');
  log('-'.repeat(40), 'yellow');
  
  log('\n🌐 Web Framework:', 'green');
  backendDependencies.webFramework.forEach(dep => {
    log(`  • ${dep}`, 'reset');
  });
  
  log('\n🗄️  Database:', 'green');
  backendDependencies.database.forEach(dep => {
    log(`  • ${dep}`, 'reset');
  });
  
  log('\n🔐 Authentication & Security:', 'green');
  backendDependencies.authSecurity.forEach(dep => {
    log(`  • ${dep}`, 'reset');
  });
  
  log('\n✅ Data Validation:', 'green');
  backendDependencies.dataValidation.forEach(dep => {
    log(`  • ${dep}`, 'reset');
  });
  
  log('\n🛠️  Development Tools:', 'green');
  backendDependencies.development.forEach(dep => {
    log(`  • ${dep}`, 'reset');
  });
  
  log('\n🧮 Scientific Computing:', 'green');
  backendDependencies.scientific.forEach(dep => {
    log(`  • ${dep}`, 'reset');
  });
}

function checkPythonInstallation() {
  try {
    execSync('python3 --version', { stdio: 'pipe' });
    return 'python3';
  } catch (error) {
    try {
      execSync('python --version', { stdio: 'pipe' });
      return 'python';
    } catch (error) {
      return null;
    }
  }
}

function checkPipInstallation(pythonCmd) {
  try {
    execSync(`${pythonCmd} -m pip --version`, { stdio: 'pipe' });
    return true;
  } catch (error) {
    return false;
  }
}

function detectOS() {
  const platform = process.platform;
  if (platform === 'linux') {
    // Check for specific Linux distributions
    try {
      if (fs.existsSync('/etc/arch-release')) {
        return 'arch';
      } else if (fs.existsSync('/etc/debian_version')) {
        return 'debian';
      } else if (fs.existsSync('/etc/redhat-release')) {
        return 'redhat';
      }
    } catch (error) {
      // Continue with generic linux
    }
    return 'linux';
  } else if (platform === 'darwin') {
    return 'macos';
  } else if (platform === 'win32') {
    return 'windows';
  }
  return 'unknown';
}

async function installPython(rl) {
  const os = detectOS();
  
  log('\n🐍 Python not found. Attempting automatic installation...', 'yellow');
  
  if (os === 'linux') {
    try {
      log('Installing Python via package manager...', 'cyan');
      execSync('sudo apt-get update && sudo apt-get install -y python3 python3-pip', { stdio: 'inherit' });
      log('Python and pip installed successfully!', 'green');
          return true;
        } catch (error) {
      try {
        log('Trying alternative package manager...', 'cyan');
        execSync('sudo yum install -y python3 python3-pip', { stdio: 'inherit' });
        log('Python and pip installed successfully!', 'green');
        return true;
      } catch (error2) {
        log('Failed to install Python automatically. Please install manually.', 'red');
        return false;
      }
    }
  } else if (os === 'macos') {
    try {
      log('Installing Python via Homebrew...', 'cyan');
      execSync('brew install python', { stdio: 'inherit' });
      log('Python installed successfully!', 'green');
      return true;
    } catch (error) {
      log('Failed to install Python automatically. Please install manually.', 'red');
          return false;
        }
      } else {
    log('Unsupported operating system for automatic Python installation.', 'red');
        return false;
  }
}

async function installPip(pythonCmd, rl) {
  const os = detectOS();
  
  log('\n📦 pip not found. Attempting automatic installation...', 'yellow');
  
  if (os === 'linux') {
    try {
      execSync('sudo apt-get update && sudo apt-get install -y python3-pip', { stdio: 'inherit' });
      log('pip installed successfully!', 'green');
          return true;
        } catch (error) {
      log('Failed to install pip automatically. Please install manually.', 'red');
      return false;
    }
  } else if (os === 'macos') {
    try {
      execSync('brew install python', { stdio: 'inherit' });
      log('pip installed successfully!', 'green');
      return true;
    } catch (error) {
      log('Failed to install pip automatically. Please install manually.', 'red');
          return false;
        }
      } else {
    log('Unsupported operating system for automatic pip installation.', 'red');
        return false;
  }
}

function checkNodeInstallation() {
  try {
    execSync('node --version', { stdio: 'pipe' });
    return true;
  } catch (error) {
    return false;
  }
}

function checkNpmInstallation() {
  try {
    execSync('npm --version', { stdio: 'pipe' });
    return true;
          } catch (error) {
    return false;
  }
}

function generateSecretKey() {
  return crypto.randomBytes(32).toString('hex');
}

function createFrontendEnv() {
  const frontendPath = getFrontendPath();
  const envPath = path.join(frontendPath, '.env');
  
  if (fs.existsSync(envPath)) {
    return true; // Already exists
  }
  
  const envContent = `# Frontend Environment Variables
VITE_API_BASE_URL=http://localhost:8000
VITE_APP_NAME=CLOVE Learning Platform
`;

  try {
    fs.writeFileSync(envPath, envContent);
          return true;
        } catch (error) {
          return false;
        }
}

async function checkPostgreSQLInstallation() {
  try {
    execSync('psql --version', { stdio: 'pipe' });
    return true;
  } catch (error) {
        return false;
  }
}

async function installPostgreSQL(rl) {
  log('\n🐘 Installing PostgreSQL...', 'cyan');
  
  const os = detectOS();
  let installCommand = '';
  
  try {
    switch (os) {
      case 'ubuntu':
      case 'debian':
        log('📦 Installing PostgreSQL on Ubuntu/Debian...', 'yellow');
        execSync('sudo apt-get update', { stdio: 'inherit' });
        execSync('sudo apt-get install -y postgresql postgresql-contrib', { stdio: 'inherit' });
        break;
        
      case 'centos':
      case 'rhel':
      case 'fedora':
        log('📦 Installing PostgreSQL on CentOS/RHEL/Fedora...', 'yellow');
        if (os === 'fedora') {
          execSync('sudo dnf install -y postgresql postgresql-server', { stdio: 'inherit' });
      } else {
          execSync('sudo yum install -y postgresql postgresql-server', { stdio: 'inherit' });
        }
        break;
        
      case 'macos':
        log('📦 Installing PostgreSQL on macOS...', 'yellow');
        execSync('brew install postgresql', { stdio: 'inherit' });
        break;
        
      case 'windows':
        log('❌ Automatic PostgreSQL installation not supported on Windows', 'red');
        log('Please install PostgreSQL manually from: https://www.postgresql.org/download/windows/', 'yellow');
        return false;
      
    default:
        log('❌ Unsupported operating system for automatic PostgreSQL installation', 'red');
      return false;
    }
    
    log('✅ PostgreSQL installed successfully', 'green');
    return true;
  } catch (error) {
    log('❌ Failed to install PostgreSQL automatically', 'red');
    log('Please install PostgreSQL manually:', 'yellow');
    log('• Ubuntu/Debian: sudo apt-get install postgresql postgresql-contrib', 'yellow');
    log('• CentOS/RHEL: sudo yum install postgresql postgresql-server', 'yellow');
    log('• macOS: brew install postgresql', 'yellow');
    log('• Windows: Download from https://www.postgresql.org/download/windows/', 'yellow');
    return false;
  }
}

async function setupPostgreSQLService() {
  log('\n🔧 Setting up PostgreSQL service...', 'cyan');
  
  const os = detectOS();
  
  try {
    switch (os) {
      case 'ubuntu':
      case 'debian':
        // Initialize database cluster
        execSync('sudo -u postgres /usr/lib/postgresql/*/bin/initdb -D /var/lib/postgresql/*/main', { stdio: 'pipe' });
        // Start and enable service
        execSync('sudo systemctl start postgresql', { stdio: 'inherit' });
        execSync('sudo systemctl enable postgresql', { stdio: 'inherit' });
        break;
        
      case 'centos':
      case 'rhel':
      case 'fedora':
        // Initialize database cluster
        execSync('sudo postgresql-setup initdb', { stdio: 'inherit' });
        // Start and enable service
        execSync('sudo systemctl start postgresql', { stdio: 'inherit' });
        execSync('sudo systemctl enable postgresql', { stdio: 'inherit' });
        break;
        
      case 'macos':
        // Start PostgreSQL service
        execSync('brew services start postgresql', { stdio: 'inherit' });
        break;
        
      case 'windows':
        log('⚠️  Please start PostgreSQL service manually on Windows', 'yellow');
        return true;
        
      default:
        log('⚠️  Please start PostgreSQL service manually', 'yellow');
        return true;
    }
    
    log('✅ PostgreSQL service started successfully', 'green');
    return true;
  } catch (error) {
    log('⚠️  Could not start PostgreSQL service automatically', 'yellow');
    log('Please start it manually:', 'yellow');
    log('• Linux: sudo systemctl start postgresql', 'yellow');
    log('• macOS: brew services start postgresql', 'yellow');
    log('• Windows: Start from Services or pgAdmin', 'yellow');
    return false;
  }
}

function launchPgAdmin4() {
  try {
    log('🚀 Launching pgAdmin4...', 'cyan');
    // Launch pgAdmin4 in the background (Linux/Mac)
    execSync('pgadmin4 &', { stdio: 'ignore', detached: true });
    log('✅ pgAdmin4 launched (check your browser or system tray)', 'green');
    return true;
  } catch (error) {
    log('⚠️  Could not launch pgAdmin4 automatically. You may need to start it manually.', 'yellow');
    return false;
  }
}

let POSTGRES_PASSWORD = null;
async function promptPostgresPassword(rl) {
  if (POSTGRES_PASSWORD !== null) return POSTGRES_PASSWORD;
  POSTGRES_PASSWORD = await question(rl, 'Password for user postgres: ');
  return POSTGRES_PASSWORD;
}

async function setupDatabase(rl, dbName, dbUser, dbPassword) {
  // Prompt user to manually start PostgreSQL if not running
  try {
    execSync('pg_isready -h localhost -p 5432', { stdio: 'pipe' });
    log('✅ PostgreSQL service is running', 'green');
  } catch (error) {
    log('⚠️  PostgreSQL service is not running.', 'yellow');
    log('Please start PostgreSQL manually, then press Enter to continue.', 'yellow');
    await question(rl, 'Press Enter when PostgreSQL is running...');
    // Re-check
    try {
      execSync('pg_isready -h localhost -p 5432', { stdio: 'pipe' });
      log('✅ PostgreSQL service is now running', 'green');
    } catch (error) {
      log('❌ PostgreSQL service is still not running. Please start it and try again.', 'red');
      return false;
    }
  }

  // Print reminder to manually create pgAdmin4 server entry
  log('\n📝 REMINDER:', 'yellow');
  log('Before proceeding, make sure you have manually created a server in pgAdmin4:', 'yellow');
  log('  • Name: PostgreSQL 17', 'yellow');
  log('  • Host: localhost', 'yellow');
  log('  • Port: 5432', 'yellow');
  log('  • Username: postgres', 'yellow');
  log('  • Maintenance DB: postgres', 'yellow');
  log('You can do this in the pgAdmin4 UI under Servers > Create > Server.', 'yellow');
  log('Press Enter to continue after you have created the server in pgAdmin4.', 'yellow');
  await question(rl, 'Press Enter to continue...');

  // Prompt for postgres password ONCE
  const postgresPassword = await promptPostgresPassword(rl);

  // Now create clove_user role, then clove_db database, then grant privileges
  log('\n🗄️  Setting up PostgreSQL user and database...', 'cyan');
  try {
    // Create clove_user role
    try {
      execSync(`psql -U postgres -c "CREATE ROLE ${dbUser} WITH LOGIN PASSWORD '${dbPassword}';"`, { env: { ...process.env, PGPASSWORD: postgresPassword }, stdio: 'pipe' });
      log('✅ Database role clove_user created', 'green');
    } catch (error) {
      log('ℹ️  Database role clove_user may already exist', 'yellow');
    }
    // Create clove_db database owned by clove_user
    try {
      execSync(`psql -U postgres -c "CREATE DATABASE ${dbName} OWNER ${dbUser};"`, { env: { ...process.env, PGPASSWORD: postgresPassword }, stdio: 'pipe' });
      log('✅ Database clove_db created', 'green');
    } catch (error) {
      log('ℹ️  Database clove_db may already exist', 'yellow');
    }
    // Grant privileges
    try {
      execSync(`psql -U postgres -d ${dbName} -c "GRANT ALL PRIVILEGES ON DATABASE ${dbName} TO ${dbUser};"`, { env: { ...process.env, PGPASSWORD: postgresPassword }, stdio: 'pipe' });
      execSync(`psql -U postgres -d ${dbName} -c "GRANT ALL PRIVILEGES ON SCHEMA public TO ${dbUser};"`, { env: { ...process.env, PGPASSWORD: postgresPassword }, stdio: 'pipe' });
      execSync(`psql -U postgres -d ${dbName} -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO ${dbUser};"`, { env: { ...process.env, PGPASSWORD: postgresPassword }, stdio: 'pipe' });
      execSync(`psql -U postgres -d ${dbName} -c "GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO ${dbUser};"`, { env: { ...process.env, PGPASSWORD: postgresPassword }, stdio: 'pipe' });
      execSync(`psql -U postgres -d ${dbName} -c "GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO ${dbUser};"`, { env: { ...process.env, PGPASSWORD: postgresPassword }, stdio: 'pipe' });
      execSync(`psql -U postgres -d ${dbName} -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO ${dbUser};"`, { env: { ...process.env, PGPASSWORD: postgresPassword }, stdio: 'pipe' });
      execSync(`psql -U postgres -d ${dbName} -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO ${dbUser};"`, { env: { ...process.env, PGPASSWORD: postgresPassword }, stdio: 'pipe' });
      log('✅ Privileges granted to clove_user', 'green');
    } catch (error) {
      log('⚠️  Could not grant all privileges (this might be okay)', 'yellow');
    }
    return true;
  } catch (error) {
    log('❌ Failed to setup database', 'red');
    logErrorDetails(error);
    return false;
  }
}

function ensureBackendVenv() {
  const backendPath = path.join(__dirname, 'clove-backend');
  const venvPath = path.join(backendPath, 'venv');
  const unixActivate = path.join(venvPath, 'bin', 'activate');
  const winActivate = path.join(venvPath, 'Scripts', 'activate');
  const venvExists = fs.existsSync(unixActivate) || fs.existsSync(winActivate);
  const isWindows = process.platform === 'win32';

  // If venv folder exists but is broken, remove it
  if (fs.existsSync(venvPath) && !venvExists) {
    log('⚠️  Existing venv folder is incomplete or broken. Removing...', 'yellow');
    try {
      fs.rmSync(venvPath, { recursive: true, force: true });
    } catch (err) {
      log('❌ Failed to remove broken venv folder. Please delete it manually.', 'red');
      return false;
    }
  }

  // If venv does not exist, create it
  if (!venvExists) {
    log('🐍 Creating Python virtual environment for backend...', 'cyan');
    // Pre-check for venv module
    try {
      if (isWindows) {
        execSync('python -m venv --help', { stdio: 'ignore' });
      } else {
        execSync('python3 -m venv --help', { stdio: 'ignore' });
      }
    } catch (err) {
      log('❌ Python venv module is missing.', 'red');
      if (isWindows) {
        log('Please download Python 3 from https://www.python.org/downloads/', 'yellow');
        log('Make sure to check "Add Python to PATH" during installation.', 'yellow');
      } else {
        log('Please install it with:', 'yellow');
        log('    sudo apt install python3-venv', 'yellow');
      }
      return false;
    }
    try {
      if (isWindows) {
        execSync('python -m venv venv', { cwd: backendPath, stdio: 'inherit' });
      } else {
        execSync('python3 -m venv venv', { cwd: backendPath, stdio: 'inherit' });
      }
      log('✅ Virtual environment created successfully', 'green');
    } catch (error) {
      try {
        if (isWindows) {
          execSync('py -m venv venv', { cwd: backendPath, stdio: 'inherit' });
        } else {
          execSync('python -m venv venv', { cwd: backendPath, stdio: 'inherit' });
        }
        log('✅ Virtual environment created successfully', 'green');
      } catch (error2) {
        log('❌ Failed to create virtual environment', 'red');
        if (isWindows) {
          log('Please download Python 3 from https://www.python.org/downloads/', 'yellow');
          log('Make sure to check "Add Python to PATH" during installation.', 'yellow');
        } else {
          log('Please ensure Python 3 and the python3-venv module are installed:', 'yellow');
          log('    sudo apt install python3-venv', 'yellow');
        }
        return false;
      }
    }
  } else {
    log('✅ Backend virtual environment already exists', 'green');
  }
  return true;
}

async function runDatabaseMigrations(backendPath) {
  if (!ensureBackendVenv()) {
    log('❌ Virtual environment not found and could not be created. Please run backend setup first.', 'red');
    return false;
  }
  log('\n🔄 Running database migrations...', 'cyan');
  
  try {
    const isWindows = process.platform === 'win32';
    const venvPath = getVenvPath();
    
    if (!fs.existsSync(venvPath)) {
      log('❌ Virtual environment not found. Please run backend setup first.', 'red');
      return false;
    }
    
    // Activate virtual environment and run migrations
    if (isWindows) {
      execWithCwd('cmd /c "venv\\Scripts\\activate && set PYTHONPATH=. && alembic upgrade head"', backendPath);
    } else {
      execWithCwd('bash -c "source venv/bin/activate && PYTHONPATH=. alembic upgrade head"', backendPath);
    }
    
    log('✅ Database migrations completed', 'green');
    return true;
  } catch (error) {
    log('❌ Failed to run database migrations', 'red');
    logErrorDetails(error);
    return false;
  }
}

const encodePassword = (password) => encodeURIComponent(password);

async function createBackendEnv(rl) {
  const backendPath = getBackendPath();
  const envPath = path.join(backendPath, '.env');

  let dbName = 'clove_db';
  let dbUser = 'clove_user';
  let dbPassword = '';

  // If .env exists, try to parse DB credentials from it
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const dbUrlMatch = envContent.match(/^DATABASE_URL=postgresql\+asyncpg:\/\/(.*?):(.*?)@.*?\/(.*?)$/m);
    if (dbUrlMatch) {
      dbUser = dbUrlMatch[1];
      dbPassword = dbUrlMatch[2];
      dbName = dbUrlMatch[3];
    }
  } else {
    // Prompt for DB credentials if .env does not exist
    dbName = await question(rl, 'Database name (default: clove_db): ') || 'clove_db';
    dbUser = await question(rl, 'Database user (default: clove_user): ') || 'clove_user';
    dbPassword = await question(rl, 'Database password: ');
    if (!dbPassword) {
      log('Database password is required.', 'red');
      return false;
    }
  }

  // Always run DB setup
  const dbSetupSuccess = await setupDatabase(rl, dbName, dbUser, dbPassword);
  if (!dbSetupSuccess) {
    log('⚠️  Database setup failed, but continuing with environment file creation', 'yellow');
  }

  // Only create .env if it doesn't exist
  if (!fs.existsSync(envPath)) {
    const encodedPassword = encodePassword(dbPassword);
    const envContent = `# CLOVE Backend Environment Configuration

# Database Configuration
DATABASE_URL=postgresql+asyncpg://${dbUser}:${encodedPassword}@localhost:5432/${dbName}

# JWT Configuration
JWT_SECRET_KEY=${generateSecretKey()}
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080
REFRESH_TOKEN_EXPIRE_DAYS=30

# CORS Configuration (for frontend)
CORS_ORIGINS=["http://localhost:5173", "http://127.0.0.1:5173"]

# Allowed Hosts
ALLOWED_HOSTS=["localhost", "127.0.0.1"]

# Environment
ENV=development
DEBUG=true

# Database Pool Settings
DB_POOL_SIZE=20
DB_MAX_OVERFLOW=10
DB_POOL_TIMEOUT=30
DB_POOL_RECYCLE=1800

# Rate Limiting
RATE_LIMIT_PER_MINUTE=60

# Logging
LOG_LEVEL=INFO
`;
    try {
      fs.writeFileSync(envPath, envContent);
      log('✅ Backend environment file created', 'green');
    } catch (error) {
      log('❌ Failed to create environment file', 'red');
      return false;
    }
  }

  // Always run migrations and seeding
  if (dbSetupSuccess) {
    await runDatabaseMigrations(backendPath);
    // Seed the database after migrations
    try {
      log('\n🌱 Seeding database with initial data...', 'cyan');
      const isWindows = process.platform === 'win32';
      if (isWindows) {
        execWithCwd('cmd /c "venv\\Scripts\\activate && set PYTHONPATH=. && python -m app.db.seeder"', backendPath);
      } else {
        execWithCwd('bash -c "source venv/bin/activate && PYTHONPATH=. python -m app.db.seeder"', backendPath);
      }
      log('✅ Database seeded successfully', 'green');
    } catch (error) {
      log('❌ Failed to seed database', 'red');
      logErrorDetails(error);
    }
  }

  return true;
}

function installFrontendDependencies() {
  const frontendPath = getFrontendPath();
  
  if (!fs.existsSync(frontendPath)) {
    return false;
  }
  
  const packageJsonPath = path.join(frontendPath, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    return false;
  }
  
  log('\n📦 Installing frontend dependencies...', 'green');
  
  try {
    // Check for missing dependencies first
    const missingDeps = checkMissingFrontendDependencies(frontendPath);
    if (missingDeps.length > 0) {
      log(`Installing missing dependencies: ${missingDeps.join(', ')}`, 'yellow');
    } else {
      log('All dependencies are already installed.', 'green');
    return true;
  }
  
    // Install dependencies
    execSync('npm install', { 
      stdio: 'inherit',
      cwd: frontendPath 
    });
    
    return true;
  } catch (error) {
    return false;
  }
}

function checkMissingDependencies(frontendPath) {
  // Frontend now uses package.json only (no requirements.txt)
  return checkMissingFrontendDependencies(frontendPath);
}

function checkMissingFrontendDependencies(frontendPath) {
  const missingDeps = [];
  
  try {
  const packageJsonPath = path.join(frontendPath, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Check production dependencies
    if (packageJson.dependencies) {
      for (const [depName, version] of Object.entries(packageJson.dependencies)) {
        const frontendDepPath = path.join(frontendPath, 'node_modules', depName);
        const rootDepPath = path.join(__dirname, 'node_modules', depName);
        
        if (!fs.existsSync(frontendDepPath) && !fs.existsSync(rootDepPath)) {
          missingDeps.push(depName);
        }
      }
    }
    
    // Check dev dependencies
    if (packageJson.devDependencies) {
      for (const [depName, version] of Object.entries(packageJson.devDependencies)) {
        const frontendDepPath = path.join(frontendPath, 'node_modules', depName);
        const rootDepPath = path.join(__dirname, 'node_modules', depName);
        
        if (!fs.existsSync(frontendDepPath) && !fs.existsSync(rootDepPath)) {
        missingDeps.push(depName);
        }
      }
    }
  } catch (error) {
    // Silent fail - return empty array
  }
  
  return missingDeps;
}

function checkMissingBackendDependencies(backendPath) {
  const missingDeps = [];
  
  // Read requirements.txt to get actual dependencies
  const requirementsPath = path.join(backendPath, 'requirements.txt');
  if (!fs.existsSync(requirementsPath)) {
    return missingDeps;
  }
  
  try {
    const requirementsContent = fs.readFileSync(requirementsPath, 'utf8');
    const lines = requirementsContent.split('\n');
    
    // Parse requirements and extract package names
    const packages = [];
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        // Extract package name (remove version specifiers)
        const packageName = trimmedLine.split(/[<>=!]/)[0].trim();
        if (packageName) {
          packages.push(packageName);
        }
      }
    }
    
    // Check if Python is available
    const pythonCmd = checkPythonInstallation();
    if (!pythonCmd) {
      return packages; // Return all as missing if Python not available
    }
    
    // Get list of installed packages using pip
    let installedPackages = [];
    try {
      // Check if virtual environment exists and use it
      const venvPath = getVenvPath();
      let pipCommand = `${pythonCmd} -m pip list`;
      
      if (fs.existsSync(venvPath)) {
        const isWindows = process.platform === 'win32';
        const pipPath = isWindows ? path.join(venvPath, 'Scripts', 'pip.exe') : path.join(venvPath, 'bin', 'pip');
        pipCommand = `"${pipPath}" list`;
      }
      
      const pipListOutput = execSync(pipCommand, { 
        stdio: 'pipe',
        cwd: backendPath 
      }).toString().toLowerCase();
      
      // Parse pip list output to get package names
      const lines = pipListOutput.split('\n');
      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        if (parts.length >= 1) {
          installedPackages.push(parts[0].toLowerCase());
        }
      }
    } catch (error) {
      // Fallback to import method
      for (const packageName of packages) {
        try {
          // Handle packages with special characters in import names
          let importName = packageName;
          
          // Handle packages with extras like uvicorn[standard] -> uvicorn
          if (importName.includes('[')) {
            importName = importName.split('[')[0];
          }
          
          // Handle packages with special names
          const importMap = {
            'psycopg2-binary': 'psycopg2',
            'python-jose[cryptography]': 'jose',
            'passlib[bcrypt]': 'passlib',
            'pydantic[email]': 'pydantic'
          };
          
          if (importMap[packageName]) {
            importName = importMap[packageName];
          }
          
          // Try to import the package using the correct Python environment
          let pythonCommand = `${pythonCmd} -c "import ${importName}"`;
          
          if (fs.existsSync(venvPath)) {
            const isWindows = process.platform === 'win32';
            const pythonPath = isWindows ? path.join(venvPath, 'Scripts', 'python.exe') : path.join(venvPath, 'bin', 'python');
            pythonCommand = `"${pythonPath}" -c "import ${importName}"`;
          }
          
          execSync(pythonCommand, { 
            stdio: 'pipe',
            cwd: backendPath 
          });
          // Package is installed
    } catch (error) {
          // Package is not installed
          missingDeps.push(packageName);
        }
      }
      return missingDeps;
    }
    
    // Check if each package is installed using pip list
    for (const packageName of packages) {
      // Normalize package name for comparison
      let normalizedName = packageName.toLowerCase();
      
      // Handle packages with extras like uvicorn[standard] -> uvicorn
      if (normalizedName.includes('[')) {
        normalizedName = normalizedName.split('[')[0];
      }
      
      // Handle packages with special names for pip list comparison
      const pipNameMap = {
        'psycopg2-binary': 'psycopg2-binary',  // Keep as is for pip list
        'python-jose[cryptography]': 'python-jose',  // Remove extras for pip list
        'passlib[bcrypt]': 'passlib',  // Remove extras for pip list
        'pydantic[email]': 'pydantic'  // Remove extras for pip list
      };
      
      if (pipNameMap[packageName]) {
        normalizedName = pipNameMap[packageName].toLowerCase();
      }
      
      if (!installedPackages.includes(normalizedName)) {
        missingDeps.push(packageName);
      }
    }
  } catch (error) {
    // Silent fail - return empty array
  }
  
  return missingDeps;
}

async function installBackendDependencies(rl) {
  const pythonCmd = checkPythonInstallation();
  if (!pythonCmd) {
    log('\n❌ Python is not installed or not found in PATH', 'red');
    log('Please install Python 3.8+ and try again.', 'yellow');
    await promptContinueOnError('Python is not installed or not found in PATH');
    return false;
  }
  if (!checkPipInstallation(pythonCmd)) {
    log('\n❌ pip is not installed or not found', 'red');
    log('Please install pip and try again.', 'yellow');
    await promptContinueOnError('pip is not installed or not found');
    return false;
  }
  const backendPath = getBackendPath();
  if (!fs.existsSync(backendPath)) {
    log('\n❌ Backend directory not found', 'red');
    await promptContinueOnError('Backend directory not found');
    return false;
  }
  const requirementsPath = path.join(backendPath, 'requirements.txt');
  if (!fs.existsSync(requirementsPath)) {
    log('\n❌ requirements.txt not found in backend directory', 'red');
    await promptContinueOnError('requirements.txt not found in backend directory');
    return false;
  }
  log('\n🐍 Installing backend dependencies...', 'green');
  // Check for missing dependencies first
  const missingDeps = checkMissingBackendDependencies(backendPath);
  if (missingDeps.length > 0) {
    log(`Installing missing dependencies: ${missingDeps.join(', ')}`, 'yellow');
  } else {
    log('All dependencies are already installed.', 'green');
    return true;
  }
  try {
    // Check if virtual environment exists, create if not
    const venvPath = getVenvPath();
    if (!fs.existsSync(venvPath)) {
      log('🐍 Creating virtual environment...', 'cyan');
      try {
        execWithCwd(`${pythonCmd} -m venv venv`, backendPath);
        log('✅ Virtual environment created successfully', 'green');
      } catch (error) {
        log('❌ Failed to create virtual environment', 'red');
        log('Please ensure Python and venv module are installed', 'yellow');
        await promptContinueOnError('Failed to create virtual environment');
        return false;
      }
    } else {
      log('✅ Virtual environment already exists', 'green');
    }
    // Install dependencies in virtual environment
    const isWindows = process.platform === 'win32';
    const pipPath = isWindows ? path.join(venvPath, 'Scripts', 'pip.exe') : path.join(venvPath, 'bin', 'pip');
    log('🐍 Installing dependencies in virtual environment...', 'cyan');
    try {
      execWithCwd(`"${pipPath}" install -r requirements.txt`, backendPath);
    } catch (error) {
      log('❌ Failed to install backend dependencies', 'red');
      logErrorDetails(error);
      await promptContinueOnError('Failed to install backend dependencies');
      return false;
    }
    return true;
  } catch (error) {
    log('❌ Failed to install backend dependencies', 'red');
    logErrorDetails(error);
    await promptContinueOnError('Failed to install backend dependencies');
    return false;
  }
}

async function startApplication(rl, frontendSuccess, backendSuccess) {
  log('\n🚀 Starting CLOVE Learning Platform...', 'cyan');
  
  if (frontendSuccess && backendSuccess) {
    log('\n🎉  CLOVE Learning Platform - Installation Complete!');
    log('============================================================', 'cyan');
    log('\n🚀  Next Step', 'cyan');
    log('    👉 npm run dev    Start both frontend and backend (recommended)', 'cyan');
    log('    Optional:', 'yellow');
    log('      • cd clove-backend && python -m uvicorn app.main:app --reload', 'reset');
    log('      • cd clove-frontend && npm run dev', 'reset');
    log('\n📚  Documentation', 'cyan');
    log('    • README.md         Main project documentation', 'reset');
    log('    • SETUP_GUIDE.md    Detailed setup instructions', 'reset');
    log('    • QUICK_START.md    Quick start guide', 'reset');
    log('\n✅  Ready to Go!', 'green');
    log('    All dependencies are installed. You can start development.', 'reset');
    log('\n💡  Tip: Run "npm run setup" for a guided setup experience', 'yellow');
    log('============================================================', 'cyan');
          } else {
    log('\n🎉  CLOVE Learning Platform - Installation Complete!');
    log('============================================================', 'cyan');
    
    log('\n📦  Dependency Status', 'yellow');
    log(`    • Frontend: ${frontendSuccess ? '✅ Installed' : '❌ Not installed'}`, frontendSuccess ? 'green' : 'red');
    log(`    • Backend:  ${backendSuccess ? '✅ Installed' : '❌ Not installed'}`, backendSuccess ? 'green' : 'red');
    
    log('\n🚀  Next Step', 'cyan');
    log('    👉 npm run dev    Start both frontend and backend (recommended)', 'cyan');
    log('    Optional:', 'yellow');
    log('      • cd clove-backend && python -m uvicorn app.main:app --reload', 'reset');
    log('      • cd clove-frontend && npm run dev', 'reset');
    
    log('\n📚  Documentation', 'cyan');
    log('    • README.md         Main project documentation', 'reset');
    log('    • SETUP_GUIDE.md    Detailed setup instructions', 'reset');
    log('    • QUICK_START.md    Quick start guide', 'reset');
    
    if (!frontendSuccess || !backendSuccess) {
      log('\n⚠️  Setup completed with some issues.', 'yellow');
      if (!frontendSuccess) log('    • Frontend setup had issues - check clove-frontend/ directory', 'yellow');
      if (!backendSuccess) log('    • Backend setup had issues - check clove-backend/ directory', 'yellow');
          } else {
      log('\n✅  Ready to Go!', 'green');
      log('    All dependencies are installed. You can start development.', 'reset');
    }
    
    log('\n💡  Tip: Run "npm run setup" for a guided setup experience', 'yellow');
    log('============================================================', 'cyan');
  }
}

async function main() {
  log('\n🎯 CLOVE Learning Platform Setup', 'bright');
  log('='.repeat(50), 'cyan');
  
  // Check prerequisites
  const nodeInstalled = checkNodeInstallation();
  const npmInstalled = checkNpmInstallation();
  let pythonCmd = checkPythonInstallation();
  let pipInstalled = pythonCmd ? checkPipInstallation(pythonCmd) : false;
  
  if (!nodeInstalled) {
    log('❌ Node.js is not installed', 'red');
    log('Please install Node.js 18+ and try again.', 'yellow');
    return;
  }
  
  if (!npmInstalled) {
    log('❌ npm is not installed', 'red');
    log('Please install npm and try again.', 'yellow');
    return;
  }
  
  // Install Python if needed
  if (!pythonCmd) {
  const rl = createInterface();
    const pythonInstalled = await installPython(rl);
    rl.close();
    
    if (pythonInstalled) {
      pythonCmd = checkPythonInstallation();
      pipInstalled = pythonCmd ? checkPipInstallation(pythonCmd) : false;
    } else {
      log('Please install Python 3.8+ manually and try again.', 'yellow');
      return;
    }
  }
  
  // Install pip if needed
      if (!pipInstalled) {
    const rl = createInterface();
        const pipInstalledSuccess = await installPip(pythonCmd, rl);
    rl.close();
    
        if (!pipInstalledSuccess) {
      log('Please install pip manually and try again.', 'yellow');
      return;
      }
    }
    
    log('✅ Prerequisites check completed', 'green');
    
  // Display dependencies
    displayDependencies();
    
  const rl = createInterface();
  
  try {
    // Check frontend dependencies
    const frontendPath = getFrontendPath();
    const missingFrontendDeps = checkMissingFrontendDependencies(frontendPath);
    
    if (missingFrontendDeps.length === 0) {
      log('✅ All frontend dependencies are installed', 'green');
    } else {
      log(`⚠️  Missing frontend dependencies: ${missingFrontendDeps.join(', ')}`, 'yellow');
    }
    
    // Check backend dependencies
    const backendPath = getBackendPath();
    const missingBackendDeps = checkMissingBackendDependencies(backendPath);
    
    if (missingBackendDeps.length === 0) {
      log('✅ All backend dependencies are installed', 'green');
        } else {
      log(`⚠️  Missing backend dependencies: ${missingBackendDeps.join(', ')}`, 'yellow');
    }
    
    // Ask user what to install
    let answer;
    const validOptions = ['frontend', 'backend', 'both', 'skip'];
    do {
      answer = (await question(rl, '\n🤔 What would you like to install? (frontend/backend/both/skip): ')).toLowerCase().trim();
      if (!validOptions.includes(answer)) {
        log('❌ Invalid option! Please enter one of: frontend, backend, both, skip.', 'red');
      }
    } while (!validOptions.includes(answer));
    
    let frontendSuccess = true;
    let backendSuccess = true;

    if (answer === 'frontend' || answer === 'both') {
        frontendSuccess = installFrontendDependencies();
    }

    if (answer === 'backend' || answer === 'both') {
      if (!pythonCmd) {
          log('\n❌ Cannot install backend dependencies - Python not found', 'red');
        backendSuccess = false;
      } else {
          backendSuccess = await installBackendDependencies(rl);
      }
      // Always run backend environment and database setup after backend deps are checked/installed
      const backendEnvCreated = await createBackendEnv(rl);
    }

    if (answer === 'skip') {
      log('\n⏭️  Skipping dependency installation.', 'yellow');
    }

    // Always create frontend env (if missing)
    const frontendEnvCreated = createFrontendEnv();

    // Start application
        await startApplication(rl, frontendSuccess, backendSuccess);
    
    } finally {
    rl.close();
  }
}

// Helper: Prompt user to continue on error
async function promptContinueOnError(errorMessage) {
  console.error(`${colors.red}❌ ${errorMessage}${colors.reset}`);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return new Promise((resolve) => {
    rl.question('An error was detected. Would you like to continue anyway? (y/n): ', (answer) => {
      rl.close();
      if (answer.trim().toLowerCase() === 'y') {
        resolve(true);
      } else {
        console.log('Exiting setup due to error.');
        process.exit(1);
      }
    });
  });
}

// --- Helper Functions ---
function getBackendPath() {
  return path.join(__dirname, 'clove-backend');
}
function getFrontendPath() {
  return path.join(__dirname, 'clove-frontend');
}
function getVenvPath() {
  return path.join(getBackendPath(), 'venv');
}
function execWithCwd(command, cwd, options = {}) {
  // Ensure cwd is always a string, not an object
  if (cwd && typeof cwd === 'object' && cwd.cwd) {
    cwd = cwd.cwd;
  }
  return execSync(command, { stdio: 'inherit', cwd, ...options });
}
function logErrorDetails(error) {
  log('Error details:', 'yellow');
  if (error && error.message) console.error(error.message);
  else if (error) console.error(error);
}
// --- End Helper Functions ---

// Run the script
main().catch(error => {
  log('\n❌ An error occurred: ' + error.message, 'red');
  process.exit(1);
}); 
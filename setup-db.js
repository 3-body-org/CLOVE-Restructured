#!/usr/bin/env node

/**
 * CLOVE Backend Database Setup Script
 * Helps set up PostgreSQL and environment configuration
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function logHeader(message) {
  log(`\n${colors.bright}${colors.cyan}${message}${colors.reset}\n`);
}

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

// Add at the top, after readline and before any DB logic
let POSTGRES_PASSWORD = null;

async function promptPostgresPassword() {
  if (POSTGRES_PASSWORD !== null) return POSTGRES_PASSWORD;
  POSTGRES_PASSWORD = await question('Password for user postgres: ');
  return POSTGRES_PASSWORD;
}

// Check if PostgreSQL is installed
function checkPostgreSQL() {
  try {
    const version = execSync('psql --version', { encoding: 'utf8' }).trim();
    logSuccess(`PostgreSQL ${version} detected`);
    return true;
  } catch (error) {
    logError('PostgreSQL is not installed or not accessible');
    logInfo('Please install PostgreSQL:');
    log('  Ubuntu/Debian: sudo apt-get install postgresql postgresql-contrib', 'cyan');
    log('  macOS: brew install postgresql', 'cyan');
    log('  Windows: Download from https://www.postgresql.org/download/windows/', 'cyan');
    return false;
  }
}

// Check if PostgreSQL service is running
function checkPostgreSQLService() {
  try {
    execSync('pg_isready', { stdio: 'ignore' });
    logSuccess('PostgreSQL service is running');
    return true;
  } catch (error) {
    logWarning('PostgreSQL service is not running');
    logInfo('Start PostgreSQL service:');
    log('  Ubuntu/Debian: sudo systemctl start postgresql', 'cyan');
    log('  macOS: brew services start postgresql', 'cyan');
    log('  Windows: Start PostgreSQL service from Services', 'cyan');
    return false;
  }
}

// Check if pgAdmin is installed
function checkPgAdmin() {
  try {
    execSync('pgadmin4 --version', { stdio: 'ignore' });
    logSuccess('pgAdmin4 detected');
    return true;
  } catch (error) {
    try {
      execSync('pgadmin3 --version', { stdio: 'ignore' });
      logSuccess('pgAdmin3 detected');
      return true;
    } catch (error2) {
      logWarning('pgAdmin is not installed');
      logInfo('You can install pgAdmin for database management:');
      log('  Ubuntu/Debian: sudo apt-get install pgadmin4', 'cyan');
      log('  macOS: brew install --cask pgadmin4', 'cyan');
      log('  Windows: Download from https://www.pgadmin.org/download/', 'cyan');
      return false;
    }
  }
}

// Create database and user
async function setupDatabase() {
  logHeader('\ud83d\uddc4\ufe0f  Setting up PostgreSQL Database');
  
  const dbName = await question('Database name (default: clove_db): ') || 'clove_db';
  const dbUser = await question('Database user (default: clove_user): ') || 'clove_user';
  const dbPassword = await question('Database password: ');
  
  if (!dbPassword) {
    logError('Database password is required');
    return false;
  }
  
  const postgresPassword = await promptPostgresPassword();
  try {
    logInfo('Creating database user...');
    execSync(`psql -U postgres -h localhost -c "CREATE USER ${dbUser} WITH PASSWORD '${dbPassword}';"`, { env: { ...process.env, PGPASSWORD: postgresPassword }, stdio: 'inherit' });
    logSuccess('Database user created');
    
    logInfo('Creating database...');
    execSync(`psql -U postgres -h localhost -c "CREATE DATABASE ${dbName} OWNER ${dbUser};"`, { env: { ...process.env, PGPASSWORD: postgresPassword }, stdio: 'inherit' });
    logSuccess('Database created');
    
    logInfo('Granting privileges...');
    execSync(`psql -U postgres -h localhost -c "GRANT ALL PRIVILEGES ON DATABASE ${dbName} TO ${dbUser};"`, { env: { ...process.env, PGPASSWORD: postgresPassword }, stdio: 'inherit' });
    logSuccess('Privileges granted');
    
    return { dbName, dbUser, dbPassword };
  } catch (error) {
    logError('Failed to create database. You may need to run this script with sufficient privileges or manually create the database.');
    logInfo('Manual database setup:');
    log('  1. psql -U postgres -h localhost', 'cyan');
    log(`  2. CREATE USER ${dbUser} WITH PASSWORD '${dbPassword}';`, 'cyan');
    log(`  3. CREATE DATABASE ${dbName} OWNER ${dbUser};`, 'cyan');
    log(`  4. GRANT ALL PRIVILEGES ON DATABASE ${dbName} TO ${dbUser};`, 'cyan');
    log('  5. \\q', 'cyan');
    return false;
  }
}

// Create .env file
async function createEnvFile(dbConfig) {
  logHeader('⚙️  Creating Environment Configuration');
  
  // URL-encode the password to handle special characters
  const encodedPassword = encodeURIComponent(dbConfig.dbPassword);

  const envContent = `# CLOVE Backend Environment Configuration

# Database Configuration
DATABASE_URL=postgresql+asyncpg://${dbConfig.dbUser}:${encodedPassword}@localhost:5432/${dbConfig.dbName}

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

  const envPath = path.join(__dirname, '.env');
  
  if (fs.existsSync(envPath)) {
    const overwrite = await question('.env file already exists. Overwrite? (y/N): ');
    if (overwrite.toLowerCase() !== 'y') {
      logWarning('Skipping .env file creation');
      return true;
    }
  }
  
  try {
    fs.writeFileSync(envPath, envContent);
    logSuccess('.env file created successfully');
    return true;
  } catch (error) {
    logError('Failed to create .env file');
    return false;
  }
}

// Generate a random secret key
function generateSecretKey() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Check and create virtual environment
function setupVirtualEnvironment() {
  logHeader('🐍 Setting up Python Virtual Environment');
  
  const venvPath = path.join(__dirname, 'venv');
  const venvBinPath = path.join(venvPath, 'bin');
  const venvScriptsPath = path.join(venvPath, 'Scripts');
  
  if (!fs.existsSync(venvPath)) {
    logInfo('Creating virtual environment...');
    try {
      execSync('python3 -m venv venv', { stdio: 'inherit', cwd: __dirname });
      logSuccess('Virtual environment created');
    } catch (error) {
      try {
        execSync('python -m venv venv', { stdio: 'inherit', cwd: __dirname });
        logSuccess('Virtual environment created');
      } catch (error2) {
        logError('Failed to create virtual environment');
        return false;
      }
    }
  } else {
    logSuccess('Virtual environment already exists');
  }
  
  return true;
}

// Activate virtual environment and install dependencies
function installDependencies() {
  logHeader('📦 Installing Python Dependencies');
  
  const isWindows = process.platform === 'win32';
  const activateScript = isWindows ? 'venv\\Scripts\\activate' : 'source venv/bin/activate';
  
  try {
    logInfo('Installing dependencies...');
    
    if (isWindows) {
      // Windows: Use the virtual environment's pip directly
      const pipPath = path.join(__dirname, 'venv', 'Scripts', 'pip.exe');
      execSync(`"${pipPath}" install -r requirements.txt`, { 
        stdio: 'inherit',
        cwd: __dirname 
      });
    } else {
      // Linux/macOS: Use source to activate and then install
      execSync(`${activateScript} && pip install -r requirements.txt`, { 
        stdio: 'inherit',
        cwd: __dirname,
        shell: '/bin/bash'
      });
    }
    
    logSuccess('Dependencies installed successfully');
    return true;
  } catch (error) {
    logError('Failed to install dependencies');
    return false;
  }
}

// Check if database needs seeding and run seeder
function runSeeder() {
  logHeader('🌱 Checking Database Seeding');
  
  const isWindows = process.platform === 'win32';
  const pythonCmd = isWindows ? 'python' : 'python3';
  
  try {
    logInfo('Running database seeder...');
    execSync(`${pythonCmd} -m app.db.seeder`, { 
      stdio: 'inherit',
      cwd: __dirname 
    });
    logSuccess('Database seeding completed');
    return true;
  } catch (error) {
    logWarning('Database seeding failed or not needed');
    return false;
  }
}

// Display final instructions
function displayInstructions() {
  logHeader('🚀 CLOVE Backend Setup Complete!');
  
  const currentDir = process.cwd();
  const isWindows = process.platform === 'win32';
  const activateCmd = isWindows ? 'venv\\Scripts\\activate' : 'source venv/bin/activate';
  
  logInfo('To start the backend:');
  log(`  cd "${currentDir}"`, 'cyan');
  log(`  ${activateCmd}`, 'cyan');
  log('  uvicorn app.main:app --reload --host 0.0.0.0 --port 8000', 'cyan');
  
  logInfo('To create a superuser:');
  log(`  cd "${currentDir}"`, 'cyan');
  log(`  ${activateCmd}`, 'cyan');
  log('  python scripts/create_superuser.py', 'cyan');
  
  log('\n🌐 Access your API:', 'bright');
  log('  API: http://localhost:8000', 'green');
  log('  Documentation: http://localhost:8000/docs', 'green');
  
  log('\n📚 Next Steps:', 'bright');
  log('  1. Start the backend server', 'cyan');
  log('  2. Create a superuser account', 'cyan');
  log('  3. Start the frontend (npm run dev:full)', 'cyan');
}

// Start backend server function
async function startBackendServer() {
  logHeader('🚀 Starting Backend Server');
  
  const isWindows = process.platform === 'win32';
  const activateCmd = isWindows ? 'venv\\Scripts\\activate' : 'source venv/bin/activate';
  
  try {
    logInfo('Starting backend server...');
    
    if (isWindows) {
      // Windows: Use the virtual environment's uvicorn directly
      const uvicornPath = path.join(__dirname, 'venv', 'Scripts', 'uvicorn.exe');
      execSync(`"${uvicornPath}" app.main:app --reload --host 0.0.0.0 --port 8000`, { 
        stdio: 'inherit',
        cwd: __dirname 
      });
    } else {
      // Linux/macOS: Use source to activate and then start
      execSync(`${activateCmd} && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000`, { 
        stdio: 'inherit',
        cwd: __dirname,
        shell: '/bin/bash'
      });
    }
    
  } catch (error) {
    logError('Failed to start backend server');
    logInfo('You can start it manually with:');
    log(`  cd "${process.cwd()}"`, 'cyan');
    log(`  ${activateCmd}`, 'cyan');
    log('  uvicorn app.main:app --reload --host 0.0.0.0 --port 8000', 'cyan');
  }
}

// Main setup function
async function setup() {
  logHeader('🎯 CLOVE Backend Database Setup');
  
  // Check PostgreSQL installation
  if (!checkPostgreSQL()) {
    rl.close();
    return;
  }
  
  // Check PostgreSQL service
  if (!checkPostgreSQLService()) {
    const continueSetup = await question('Continue with setup? (y/N): ');
    if (continueSetup.toLowerCase() !== 'y') {
      rl.close();
      return;
    }
  }
  
  // Check pgAdmin installation
  checkPgAdmin();
  
  // Setup database
  const dbConfig = await setupDatabase();
  if (!dbConfig) {
    rl.close();
    return;
  }
  
  // Create .env file
  if (!createEnvFile(dbConfig)) {
    rl.close();
    return;
  }
  
  // Setup virtual environment
  if (!setupVirtualEnvironment()) {
    rl.close();
    return;
  }
  
  // Install dependencies
  if (!installDependencies()) {
    logWarning('Setup completed with dependency installation errors. Please check your configuration.');
    rl.close();
    return;
  }
  
  // Run seeder (which includes alembic migrations)
  runSeeder();
  
  // Display instructions
  displayInstructions();
  
  // Ask if user wants to start the backend
  const startBackend = await question('\n🚀 Would you like to start the backend server now? (y/N): ');
  if (startBackend.toLowerCase() === 'y' || startBackend.toLowerCase() === 'yes') {
    await startBackendServer();
  }
  
  rl.close();
}

// Run setup if this script is executed directly
if (require.main === module) {
  setup().catch(error => {
    logError('Setup failed: ' + error.message);
    rl.close();
    process.exit(1);
  });
}

module.exports = { setup, checkPostgreSQL, checkPostgreSQLService }; 
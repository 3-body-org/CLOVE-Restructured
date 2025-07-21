#!/usr/bin/env node

/**
 * CLOVE Backend Database Setup Script
 * Helps set up PostgreSQL and environment configuration
 * Refactored for clarity and maintainability.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Console color helpers
const colors = {
  reset: '\x1b[0m', bright: '\x1b[1m', red: '\x1b[31m', green: '\x1b[32m', yellow: '\x1b[33m', blue: '\x1b[34m', magenta: '\x1b[35m', cyan: '\x1b[36m'
};
function log(msg, color = 'reset') { console.log(`${colors[color]}${msg}${colors.reset}`); }
function logSuccess(msg) { log(`✅ ${msg}`, 'green'); }
function logWarning(msg) { log(`⚠️  ${msg}`, 'yellow'); }
function logError(msg) { log(`❌ ${msg}`, 'red'); }
function logInfo(msg) { log(`ℹ️  ${msg}`, 'blue'); }
function logHeader(msg) { log(`\n${colors.bright}${colors.cyan}${msg}${colors.reset}\n`); }

// User input helpers
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
function question(prompt) { return new Promise(resolve => rl.question(prompt, resolve)); }
let POSTGRES_PASSWORD = null;
async function promptPostgresPassword() { if (POSTGRES_PASSWORD !== null) return POSTGRES_PASSWORD; POSTGRES_PASSWORD = await question('Password for user postgres: '); return POSTGRES_PASSWORD; }

// PostgreSQL checks
function checkPostgreSQL() {
  try { logSuccess(`PostgreSQL ${execSync('psql --version', { encoding: 'utf8' }).trim()} detected`); return true; }
  catch { logError('PostgreSQL is not installed or not accessible'); logInfo('Please install PostgreSQL:'); log('  Ubuntu/Debian: sudo apt-get install postgresql postgresql-contrib', 'cyan'); log('  macOS: brew install postgresql', 'cyan'); log('  Windows: Download from https://www.postgresql.org/download/windows/', 'cyan'); return false; }
}
function checkPostgreSQLService() {
  try { execSync('pg_isready', { stdio: 'ignore' }); logSuccess('PostgreSQL service is running'); return true; }
  catch { logWarning('PostgreSQL service is not running'); logInfo('Start PostgreSQL service:'); log('  Ubuntu/Debian: sudo systemctl start postgresql', 'cyan'); log('  macOS: brew services start postgresql', 'cyan'); log('  Windows: Start PostgreSQL service from Services', 'cyan'); return false; }
}
function checkPgAdmin() {
  try { execSync('pgadmin4 --version', { stdio: 'ignore' }); logSuccess('pgAdmin4 detected'); return true; }
  catch { try { execSync('pgadmin3 --version', { stdio: 'ignore' }); logSuccess('pgAdmin3 detected'); return true; } catch { logWarning('pgAdmin is not installed'); logInfo('You can install pgAdmin for database management:'); log('  Ubuntu/Debian: sudo apt-get install pgadmin4', 'cyan'); log('  macOS: brew install --cask pgadmin4', 'cyan'); log('  Windows: Download from https://www.pgadmin.org/download/', 'cyan'); return false; } }
}

// Database setup
async function setupDatabase() {
  logHeader('🗄️  Setting up PostgreSQL Database');
  const dbName = await question('Database name (default: clove_db): ') || 'clove_db';
  const dbUser = await question('Database user (default: clove_user): ') || 'clove_user';
  const dbPassword = await question('Database password: ');
  if (!dbPassword) { logError('Database password is required'); return false; }
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
    log(`  1. psql -U postgres -h localhost`, 'cyan');
    log(`  2. CREATE USER ${dbUser} WITH PASSWORD '${dbPassword}';`, 'cyan');
    log(`  3. CREATE DATABASE ${dbName} OWNER ${dbUser};`, 'cyan');
    log(`  4. GRANT ALL PRIVILEGES ON DATABASE ${dbName} TO ${dbUser};`, 'cyan');
    log('  5. \q', 'cyan');
    return false;
  }
}

// .env file creation
async function createEnvFile(dbConfig) {
  logHeader('⚙️  Creating Environment Configuration');
  const encodedPassword = encodeURIComponent(dbConfig.dbPassword);
  const envContent = `# CLOVE Backend Environment Configuration
DATABASE_URL=postgresql+asyncpg://${dbConfig.dbUser}:${encodedPassword}@localhost:5432/${dbConfig.dbName}
JWT_SECRET_KEY=${generateSecretKey()}
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080
REFRESH_TOKEN_EXPIRE_DAYS=30
CORS_ORIGINS=["http://localhost:5173", "http://127.0.0.1:5173"]
ALLOWED_HOSTS=["localhost", "127.0.0.1"]
ENV=development
DEBUG=true
DB_POOL_SIZE=20
DB_MAX_OVERFLOW=10
DB_POOL_TIMEOUT=30
DB_POOL_RECYCLE=1800
RATE_LIMIT_PER_MINUTE=60
LOG_LEVEL=INFO
`;
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const overwrite = await question('.env file already exists. Overwrite? (y/N): ');
    if (overwrite.toLowerCase() !== 'y') { logWarning('Skipping .env file creation'); return true; }
  }
  try { fs.writeFileSync(envPath, envContent); logSuccess('.env file created successfully'); return true; }
  catch { logError('Failed to create .env file'); return false; }
}
function generateSecretKey() { const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'; let result = ''; for (let i = 0; i < 32; i++) { result += chars.charAt(Math.floor(Math.random() * chars.length)); } return result; }

// Virtual environment setup
function setupVirtualEnvironment() {
  logHeader('🐍 Setting up Python Virtual Environment');
  const venvPath = path.join(__dirname, 'venv');
  if (!fs.existsSync(venvPath)) {
    logInfo('Creating virtual environment...');
    try { execSync('python3 -m venv venv', { stdio: 'inherit', cwd: __dirname }); logSuccess('Virtual environment created'); }
    catch { try { execSync('python -m venv venv', { stdio: 'inherit', cwd: __dirname }); logSuccess('Virtual environment created'); } catch { logError('Failed to create virtual environment'); return false; } }
  } else { logSuccess('Virtual environment already exists'); }
  return true;
}
function installDependencies() {
  logHeader('📦 Installing Python Dependencies');
  const isWindows = process.platform === 'win32';
  const activateScript = isWindows ? 'venv\\Scripts\\activate' : 'source venv/bin/activate';
  try {
    logInfo('Installing dependencies...');
    if (isWindows) {
      const pipPath = path.join(__dirname, 'venv', 'Scripts', 'pip.exe');
      execSync(`"${pipPath}" install -r requirements.txt`, { stdio: 'inherit', cwd: __dirname });
    } else {
      execSync(`${activateScript} && pip install -r requirements.txt`, { stdio: 'inherit', cwd: __dirname, shell: '/bin/bash' });
    }
    logSuccess('Dependencies installed successfully');
    return true;
  } catch { logError('Failed to install dependencies'); return false; }
}
function runSeeder() {
  logHeader('🌱 Checking Database Seeding');
  const isWindows = process.platform === 'win32';
  const pythonCmd = isWindows ? 'python' : 'python3';
  try { logInfo('Running database seeder...'); execSync(`${pythonCmd} -m app.db.seeder`, { stdio: 'inherit', cwd: __dirname }); logSuccess('Database seeding completed'); return true; }
  catch { logWarning('Database seeding failed or not needed'); return false; }
}
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
async function startBackendServer() {
  logHeader('🚀 Starting Backend Server');
  const isWindows = process.platform === 'win32';
  const activateCmd = isWindows ? 'venv\\Scripts\\activate' : 'source venv/bin/activate';
  try {
    logInfo('Starting backend server...');
    if (isWindows) {
      const uvicornPath = path.join(__dirname, 'venv', 'Scripts', 'uvicorn.exe');
      execSync(`"${uvicornPath}" app.main:app --reload --host 0.0.0.0 --port 8000`, { stdio: 'inherit', cwd: __dirname });
    } else {
      execSync(`${activateCmd} && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000`, { stdio: 'inherit', cwd: __dirname, shell: '/bin/bash' });
    }
  } catch { logError('Failed to start backend server'); logInfo('You can start it manually with:'); log(`  cd "${process.cwd()}"`, 'cyan'); log(`  ${activateCmd}`, 'cyan'); log('  uvicorn app.main:app --reload --host 0.0.0.0 --port 8000', 'cyan'); }
}

// Main setup function
async function setup() {
  logHeader('🎯 CLOVE Backend Database Setup');
  if (!checkPostgreSQL()) { rl.close(); return; }
  if (!checkPostgreSQLService()) {
    const continueSetup = await question('Continue with setup? (y/N): ');
    if (continueSetup.toLowerCase() !== 'y') { rl.close(); return; }
  }
  checkPgAdmin();
  const dbConfig = await setupDatabase();
  if (!dbConfig) { rl.close(); return; }
  if (!createEnvFile(dbConfig)) { rl.close(); return; }
  if (!setupVirtualEnvironment()) { rl.close(); return; }
  if (!installDependencies()) { logWarning('Setup completed with dependency installation errors. Please check your configuration.'); rl.close(); return; }
  runSeeder();
  displayInstructions();
  const startBackend = await question('\n🚀 Would you like to start the backend server now? (y/N): ');
  if (startBackend.toLowerCase() === 'y' || startBackend.toLowerCase() === 'yes') { await startBackendServer(); }
  rl.close();
}

if (require.main === module) {
  setup().catch(error => { logError('Setup failed: ' + error.message); rl.close(); process.exit(1); });
}

module.exports = { setup, checkPostgreSQL, checkPostgreSQLService }; 
const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');
const readline = require('readline');

// Import database setup function
const { setupDatabase } = require('./setup-db');

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

function checkPrerequisites() {
  log('\n🎯 CLOVE Learning Platform Setup', 'bright');
  log('==================================================', 'bright');
  
  // Check if Node.js is installed
  try {
    const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
    log(`✅ Node.js version: ${nodeVersion}`, 'green');
  } catch (error) {
    log('❌ Node.js is not installed. Please install Node.js first.', 'red');
    process.exit(1);
  }

  // Check if npm is installed
  try {
    const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
    log(`✅ npm version: ${npmVersion}`, 'green');
  } catch (error) {
    log('❌ npm is not installed. Please install npm first.', 'red');
    process.exit(1);
  }

  // Check if Python is installed
  try {
    const pythonVersion = execSync('python3 --version', { encoding: 'utf8' }).trim();
    log(`✅ Python version: ${pythonVersion}`, 'green');
  } catch (error) {
    try {
      const pythonVersion = execSync('python --version', { encoding: 'utf8' }).trim();
      log(`✅ Python version: ${pythonVersion}`, 'green');
    } catch (error) {
      log('❌ Python is not installed. Please install Python first.', 'red');
      process.exit(1);
    }
  }

  log('✅ Prerequisites check completed', 'green');
}

function checkBackendVenv() {
  const backendPath = path.join(__dirname, '..', 'clove-backend');
  const venvPath = path.join(backendPath, 'venv');
  
  if (!fs.existsSync(venvPath)) {
    log('\n🐍 Creating virtual environment for backend...', 'cyan');
    try {
      // Try python3 first, fallback to python
      let pythonCmd = 'python3';
      try {
        execSync('python3 --version', { stdio: 'ignore' });
      } catch {
        pythonCmd = 'python';
      }
      
      execSync(`${pythonCmd} -m venv venv`, { 
        cwd: backendPath, 
        stdio: 'inherit' 
      });
      log('✅ Virtual environment created successfully', 'green');
    } catch (error) {
      log('❌ Failed to create virtual environment', 'red');
      log('Please ensure Python and venv module are installed', 'yellow');
      return false;
    }
  } else {
    log('✅ Virtual environment already exists', 'green');
  }
  return true;
}

function activateVenvAndInstall(backendPath) {
  const isWindows = process.platform === 'win32';
  const activateScript = isWindows ? 'venv\\Scripts\\activate' : 'source venv/bin/activate';
  
  log('\n🐍 Activating virtual environment and installing dependencies...', 'cyan');
  
  try {
    if (isWindows) {
      // Windows: Use cmd with activate script
      execSync(`cmd /c "${activateScript} && pip install -r requirements.txt"`, {
        cwd: backendPath,
        stdio: 'inherit'
      });
    } else {
      // Linux/Mac: Use bash with source
      execSync(`bash -c "${activateScript} && pip install -r requirements.txt"`, {
        cwd: backendPath,
        stdio: 'inherit'
      });
    }
    log('✅ Backend dependencies installed successfully', 'green');
    return true;
  } catch (error) {
    log('❌ Failed to install backend dependencies', 'red');
    log('Error details:', 'yellow');
    console.error(error.message);
    return false;
  }
}

function installBackendDependencies() {
  const backendPath = path.join(__dirname, '..', 'clove-backend');
  
  if (!fs.existsSync(backendPath)) {
    log('❌ Backend directory not found', 'red');
    return false;
  }

  // Check and create virtual environment
  if (!checkBackendVenv()) {
    return false;
  }

  // Activate venv and install dependencies
  return activateVenvAndInstall(backendPath);
}

function installFrontendDependencies() {
  log('\n📦 Installing frontend dependencies...', 'cyan');
  try {
    execSync('npm install', { stdio: 'inherit' });
    log('✅ Frontend dependencies installed successfully', 'green');
    return true;
  } catch (error) {
    log('❌ Failed to install frontend dependencies', 'red');
    return false;
  }
}

function seedDatabase() {
  log('\n🌱 Seeding database with initial data...', 'cyan');
  const backendPath = path.join(__dirname, '..', 'clove-backend');
  
  if (!fs.existsSync(backendPath)) {
    log('❌ Backend directory not found', 'red');
    return false;
  }

  try {
    const isWindows = process.platform === 'win32';
    
    if (isWindows) {
      // Windows: Use cmd with activate script and PYTHONPATH
      execSync(`cmd /c "venv\\Scripts\\activate && set PYTHONPATH=. && python -m app.db.seeder"`, {
        cwd: backendPath,
        stdio: 'inherit'
      });
    } else {
      // Linux/Mac: Use bash with source and PYTHONPATH
      execSync(`bash -c "source venv/bin/activate && PYTHONPATH=. python -m app.db.seeder"`, {
        cwd: backendPath,
        stdio: 'inherit'
      });
    }
    
    log('✅ Database seeded successfully', 'green');
    return true;
  } catch (error) {
    log('❌ Failed to seed database', 'red');
    log('Error details:', 'yellow');
    console.error(error.message);
    return false;
  }
}

function startApplication() {
  log('\n🚀 Starting CLOVE Learning Platform...', 'bright');
  
  const issues = [];
  
  // Start backend
  const backendPath = path.join(__dirname, '..', 'clove-backend');
  if (fs.existsSync(backendPath)) {
    log('\n🐍 Starting backend server...', 'cyan');
    try {
      const isWindows = process.platform === 'win32';
      const activateScript = isWindows ? 'venv\\Scripts\\activate' : 'source venv/bin/activate';
      
      if (isWindows) {
        spawn('cmd', ['/c', `${activateScript} && python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000`], {
          cwd: backendPath,
          stdio: 'inherit',
          shell: true
        });
      } else {
        spawn('bash', ['-c', `${activateScript} && python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000`], {
          cwd: backendPath,
          stdio: 'inherit',
          shell: true
        });
      }
    } catch (error) {
      log('❌ Failed to start backend server', 'red');
      issues.push('Backend server failed to start');
    }
  } else {
    issues.push('Backend directory not found');
  }

  // Start frontend
  log('\n⚛️  Starting frontend development server...', 'cyan');
  try {
    setTimeout(() => {
      spawn('npm', ['run', 'dev'], {
        stdio: 'inherit',
        shell: true
      });
    }, 2000); // Give backend a moment to start
  } catch (error) {
    log('❌ Failed to start frontend server', 'red');
    issues.push('Frontend server failed to start');
  }

  if (issues.length > 0) {
    log('\n⚠️  Setup completed with some issues.', 'yellow');
    issues.forEach(issue => log(`• ${issue}`, 'yellow'));
  } else {
    log('\n✅ Setup completed successfully!', 'green');
  }
}

function main() {
  checkPrerequisites();

  log('\n============================================================', 'bright');
  log('CLOVE LEARNING PLATFORM - DEPENDENCIES OVERVIEW', 'bright');
  log('============================================================', 'bright');

  // Check frontend dependencies
  log('\n📦 FRONTEND DEPENDENCIES (React/Vite)', 'cyan');
  log('----------------------------------------', 'cyan');
  const packageJsonPath = path.join(__dirname, 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    log('📄 Using clove-frontend/package.json for dependency checking', 'yellow');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    log('\n🔧 Production Dependencies:', 'bright');
    Object.keys(packageJson.dependencies || {}).forEach(dep => {
      log(`  • ${dep}`, 'reset');
    });

    log('\n🛠️  Development Dependencies:', 'bright');
    Object.keys(packageJson.devDependencies || {}).forEach(dep => {
      log(`  • ${dep}`, 'reset');
    });
  }

  // Check backend dependencies
  log('\n🐍 BACKEND DEPENDENCIES (Python/FastAPI)', 'cyan');
  log('----------------------------------------', 'cyan');
  const requirementsPath = path.join(__dirname, '..', 'clove-backend', 'requirements.txt');
  if (fs.existsSync(requirementsPath)) {
    log('📄 Using clove-backend/requirements.txt for dependency checking', 'yellow');
    const requirements = fs.readFileSync(requirementsPath, 'utf8').split('\n').filter(line => line.trim());
    
    log('\n🌐 Web Framework:', 'bright');
    requirements.filter(req => req.includes('fastapi') || req.includes('uvicorn') || req.includes('starlette')).forEach(req => {
      log(`  • ${req}`, 'reset');
    });

    log('\n🗄️  Database:', 'bright');
    requirements.filter(req => req.includes('sqlalchemy') || req.includes('asyncpg') || req.includes('alembic') || req.includes('psycopg2')).forEach(req => {
      log(`  • ${req}`, 'reset');
    });

    log('\n🔐 Authentication & Security:', 'bright');
    requirements.filter(req => req.includes('passlib') || req.includes('bcrypt') || req.includes('jose') || req.includes('dotenv')).forEach(req => {
      log(`  • ${req}`, 'reset');
    });

    log('\n✅ Data Validation:', 'bright');
    requirements.filter(req => req.includes('pydantic')).forEach(req => {
      log(`  • ${req}`, 'reset');
    });

    log('\n🛠️  Development Tools:', 'bright');
    requirements.filter(req => req.includes('black') || req.includes('isort')).forEach(req => {
      log(`  • ${req}`, 'reset');
    });

    log('\n🧮 Scientific Computing:', 'bright');
    requirements.filter(req => req.includes('numpy')).forEach(req => {
      log(`  • ${req}`, 'reset');
    });
  }

  // Check if dependencies are installed
  const nodeModulesExists = fs.existsSync(path.join(__dirname, 'node_modules'));
  if (nodeModulesExists) {
    log('\n✅ All frontend dependencies are installed', 'green');
  } else {
    log('\n⚠️  Missing frontend dependencies', 'yellow');
  }

  const backendVenvExists = fs.existsSync(path.join(__dirname, '..', 'clove-backend', 'venv'));
  if (backendVenvExists) {
    log('✅ Backend virtual environment exists', 'green');
  } else {
    log('⚠️  Missing backend virtual environment', 'yellow');
  }

  // Ask user what to install
  log('\n🤔 What would you like to install? (frontend/backend/both/skip): ', 'cyan');
  
  // For now, let's install both by default
  log('Installing both frontend and backend dependencies...', 'yellow');
  
  const frontendSuccess = installFrontendDependencies();
  const backendSuccess = installBackendDependencies();

  if (frontendSuccess && backendSuccess) {
    // Setup database (PostgreSQL, .env file, migrations)
    log('\n🗄️  Setting up database...', 'cyan');
    const dbSuccess = setupDatabase();
    
    if (dbSuccess) {
      // Seed the database after successful database setup
      const seedingSuccess = seedDatabase();
      
      if (seedingSuccess) {
        startApplication();
      } else {
        log('\n⚠️  Setup completed with some issues.', 'yellow');
        log('• Database seeding failed - backend may not work properly', 'yellow');
        log('• You can try running the seeding manually:', 'yellow');
        log('  cd clove-backend', 'cyan');
        log('  source venv/bin/activate', 'cyan');
        log('  PYTHONPATH=. python -m app.db.seeder', 'cyan');
      }
    } else {
      log('\n⚠️  Setup completed with some issues.', 'yellow');
      log('• Database setup failed - backend will not work', 'yellow');
      log('• You can try running database setup manually:', 'yellow');
      log('  npm run setup-db', 'cyan');
    }
  } else {
    log('\n⚠️  Setup completed with some issues.', 'yellow');
    if (!frontendSuccess) log('• Frontend setup had issues', 'yellow');
    if (!backendSuccess) log('• Backend setup had issues - check clove-backend/ directory', 'yellow');
  }
}

if (require.main === module) {
  main();
}

module.exports = { main, checkPrerequisites, installFrontendDependencies, installBackendDependencies, seedDatabase }; 
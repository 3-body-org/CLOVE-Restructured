const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function seedDatabase() {
  log('\n🌱 CLOVE Database Seeding Tool', 'bright');
  log('================================', 'bright');
  
  const backendPath = path.join(__dirname, '..', 'clove-backend');
  
  // Check if backend directory exists
  if (!fs.existsSync(backendPath)) {
    log('❌ Backend directory not found at:', 'red');
    log(`   ${backendPath}`, 'yellow');
    log('   Please ensure you are running this from the clove-frontend directory', 'yellow');
    return false;
  }
  
  // Check if virtual environment exists
  const venvPath = path.join(backendPath, 'venv');
  if (!fs.existsSync(venvPath)) {
    log('❌ Virtual environment not found', 'red');
    log('   Please run the setup script first: npm run setup', 'yellow');
    return false;
  }
  
  log('\n📋 Seeding Steps:', 'cyan');
  log('1. ✅ Backend directory found', 'green');
  log('2. ✅ Virtual environment found', 'green');
  log('3. 🔄 Activating virtual environment...', 'yellow');
  
  try {
    const isWindows = process.platform === 'win32';
    
    if (isWindows) {
      log('4. 🔄 Running seeder (Windows)...', 'yellow');
      execSync(`cmd /c "venv\\Scripts\\activate && set PYTHONPATH=. && python -m app.db.seeder"`, {
        cwd: backendPath,
        stdio: 'inherit'
      });
    } else {
      log('4. 🔄 Running seeder (Linux/Mac)...', 'yellow');
      execSync(`bash -c "source venv/bin/activate && PYTHONPATH=. python -m app.db.seeder"`, {
        cwd: backendPath,
        stdio: 'inherit'
      });
    }
    
    log('\n✅ Database seeded successfully!', 'green');
    log('\n🎉 You can now start the backend server:', 'cyan');
    log('   npm run dev:backend', 'yellow');
    return true;
    
  } catch (error) {
    log('\n❌ Database seeding failed', 'red');
    log('Error details:', 'yellow');
    console.error(error.message);
    
    log('\n🔧 Troubleshooting tips:', 'cyan');
    log('• Make sure PostgreSQL is running', 'yellow');
    log('• Check that the database exists and is accessible', 'yellow');
    log('• Verify that all backend dependencies are installed', 'yellow');
    log('• Try running the setup script again: npm run setup', 'yellow');
    
    return false;
  }
}

if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase }; 
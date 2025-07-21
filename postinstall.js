#!/usr/bin/env node

/**
 * CLOVE Learning Platform - Postinstall Script
 * 
 * This script runs automatically after npm install in the root directory.
 * It provides a quick overview and next steps for the project.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

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

function checkDependencies() {
  const frontendPath = path.join(__dirname, 'clove-frontend');
  const backendPath = path.join(__dirname, 'clove-backend');
  
  // Check frontend dependencies
  const frontendNodeModules = path.join(frontendPath, 'node_modules');
  const rootNodeModules = path.join(__dirname, 'node_modules');
  
  let frontendStatus = '❌ Not installed';
  if (fs.existsSync(frontendNodeModules) || fs.existsSync(rootNodeModules)) {
    frontendStatus = '✅ Installed';
  }
  
  // Check backend dependencies
  let backendStatus = '❌ Not installed';
  const venvPath = path.join(backendPath, 'venv');
  const venvPath2 = path.join(backendPath, '.venv');
  
  if (fs.existsSync(venvPath) || fs.existsSync(venvPath2)) {
    backendStatus = '✅ Installed';
  }
  
  return { frontendStatus, backendStatus };
}

function main() {
  log('\n🎉  CLOVE Learning Platform - Installation Complete!');
  log('============================================================', 'cyan');
  
  // Check dependency status
  const { frontendStatus, backendStatus } = checkDependencies();
  
  log('\n📦  Dependency Status', 'yellow');
  log(`    • Frontend: ${frontendStatus}`, frontendStatus.includes('✅') ? 'green' : 'red');
  log(`    • Backend:  ${backendStatus}`, backendStatus.includes('✅') ? 'green' : 'red');
  
  log('\n🚀  Quick Start Commands', 'cyan');
  log('    • npm run setup         Run full setup wizard', 'reset');
  log('    • npm run dev           Start both frontend and backend', 'reset');
  log('    • npm run dev:frontend  Start frontend only', 'reset');
  log('    • npm run dev:backend   Start backend only', 'reset');
  
  log('\n🌐  Access Points', 'cyan');
  log('    • Frontend:   http://localhost:5173', 'green');
  log('    • Backend:    http://localhost:8000', 'green');
  log('    • API Docs:   http://localhost:8000/docs', 'green');
  
  log('\n📚  Documentation', 'cyan');
  log('    • README.md         Main project documentation', 'reset');
  log('    • SETUP_GUIDE.md    Detailed setup instructions', 'reset');
  log('    • QUICK_START.md    Quick start guide', 'reset');
  
  if (!frontendStatus.includes('✅') || !backendStatus.includes('✅')) {
    log('\n⚠️  Next Steps:', 'yellow');
    log('    Some dependencies may not be installed. Run the setup wizard:', 'reset');
    log('    npm run setup', 'cyan');
  } else {
    log('\n✅  Ready to Go!', 'green');
    log('    All dependencies are installed. You can start development:', 'reset');
    log('    • npm run dev', 'cyan');
  }
  
  log('\n💡  Tip: Run "npm run setup" for a guided setup experience', 'yellow');
  log('============================================================', 'cyan');
}

// Run the script
main(); 
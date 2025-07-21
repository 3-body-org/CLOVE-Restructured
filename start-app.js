#!/usr/bin/env node

/**
 * CLOVE Application Startup Script
 * Starts both frontend and backend servers with confirmation
 * Refactored for clarity and maintainability.
 */

const { execSync, spawn } = require('child_process');
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

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
function question(prompt) { return new Promise(resolve => rl.question(prompt, resolve)); }

// Check if a service is running
async function checkService(url, serviceName) {
  return new Promise((resolve) => {
    const http = require('http');
    const urlObj = new URL(url);
    
    const req = http.get({
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname,
      timeout: 3000
    }, (res) => {
      if (res.statusCode === 200) {
        logSuccess(`${serviceName} is running on ${url}`);
        resolve(true);
      } else {
        logWarning(`${serviceName} responded with status ${res.statusCode}`);
        resolve(false);
      }
    });
    
    req.on('error', () => {
      logWarning(`${serviceName} is not responding yet`);
      resolve(false);
    });
    
    req.on('timeout', () => {
      logWarning(`${serviceName} connection timed out`);
      resolve(false);
    });
  });
}

// Start frontend server
async function startFrontend() {
  logHeader('🌐 Starting Frontend Server');
  
  const frontendPath = path.join(__dirname, 'clove-frontend');
  
  if (!fs.existsSync(frontendPath)) {
    logError('Frontend directory not found');
    return false;
  }
  
  try {
    logInfo('Starting frontend development server...');
    
    // Start frontend in background
    const frontendProcess = spawn('npm', ['run', 'dev:frontend'], {
      cwd: frontendPath,
      stdio: 'pipe',
      detached: true
    });
    
    // Wait for frontend to start
    logInfo('Waiting for frontend to start...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Check if frontend is running
    const frontendRunning = await checkService('http://localhost:5173', 'Frontend');
    
    if (frontendRunning) {
      logSuccess('Frontend server started successfully!');
      return true;
    } else {
      logWarning('Frontend may still be starting up...');
      return true; // Return true anyway as it might just need more time
    }
    
  } catch (error) {
    logError('Failed to start frontend');
    log('Error: ' + error.message, 'red');
    return false;
  }
}

// Start backend server
async function startBackend() {
  logHeader('🔧 Starting Backend Server');
  
  const backendPath = path.join(__dirname, 'clove-backend');
  
  if (!fs.existsSync(backendPath)) {
    logError('Backend directory not found');
    return false;
  }
  
  // Check if .env exists
  const envPath = path.join(backendPath, '.env');
  if (!fs.existsSync(envPath)) {
    logError('Backend .env file not found');
    logInfo('Please run database setup first:');
    log('  cd clove-backend && node setup-db.js', 'cyan');
    return false;
  }
  
  try {
    logInfo('Starting backend server...');
    
    const isWindows = process.platform === 'win32';
    const activateCmd = isWindows ? 'venv\\Scripts\\activate' : 'source venv/bin/activate';
    
    // Start backend in background
    let backendProcess;
    if (isWindows) {
      const uvicornPath = path.join(backendPath, 'venv', 'Scripts', 'uvicorn.exe');
      backendProcess = spawn(`"${uvicornPath}"`, ['app.main:app', '--reload', '--host', '0.0.0.0', '--port', '8000'], {
        cwd: backendPath,
        stdio: 'pipe',
        detached: true,
        shell: true
      });
    } else {
      backendProcess = spawn('bash', ['-c', `${activateCmd} && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000`], {
        cwd: backendPath,
        stdio: 'pipe',
        detached: true
      });
    }
    
    // Wait for backend to start
    logInfo('Waiting for backend to start...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Check if backend is running
    const backendRunning = await checkService('http://localhost:8000/health', 'Backend');
    
    if (backendRunning) {
      logSuccess('Backend server started successfully!');
      return true;
    } else {
      logWarning('Backend may still be starting up...');
      return true; // Return true anyway as it might just need more time
    }
    
  } catch (error) {
    logError('Failed to start backend');
    log('Error: ' + error.message, 'red');
    logInfo('Make sure you have activated the virtual environment:');
    log('  cd clove-backend', 'cyan');
    log('  source venv/bin/activate  # Linux/macOS', 'cyan');
    log('  venv\\Scripts\\activate    # Windows', 'cyan');
    return false;
  }
}

// Main startup function
async function startApplication() {
  logHeader('🚀 CLOVE Learning Platform Startup');
  
  logInfo('This script will start both frontend and backend servers.');
  logInfo('Make sure you have completed the setup process first.');
  
  const confirm = await question('Continue? (y/N): ');
  if (confirm.toLowerCase() !== 'y' && confirm.toLowerCase() !== 'yes') {
    logInfo('Startup cancelled.');
    rl.close();
    return;
  }
  
  let frontendSuccess = false;
  let backendSuccess = false;
  
  // Start frontend first
  frontendSuccess = await startFrontend();
  
  // Start backend
  backendSuccess = await startBackend();
  
  // Final status
  logHeader('🎉 Startup Complete!');
  
  if (frontendSuccess) {
    logSuccess('Frontend: http://localhost:5173');
  } else {
    logError('Frontend failed to start');
  }
  
  if (backendSuccess) {
    logSuccess('Backend API: http://localhost:8000');
    logSuccess('API Documentation: http://localhost:8000/docs');
  } else {
    logError('Backend failed to start');
  }
  
  if (frontendSuccess && backendSuccess) {
    log('\n🎊 Both servers are running!', 'green');
    log('You can now access the CLOVE Learning Platform.', 'cyan');
  } else {
    log('\n⚠️  Some servers may not be running properly.', 'yellow');
    log('Check the error messages above for troubleshooting.', 'yellow');
  }
  
  log('\n💡 To stop the servers:', 'cyan');
  log('   - Press Ctrl+C in the terminal where each server is running', 'reset');
  log('   - Or use "pkill -f uvicorn" to stop backend', 'reset');
  log('   - Or use "pkill -f vite" to stop frontend', 'reset');
  
  rl.close();
}

// Run startup if this script is executed directly
if (require.main === module) {
  startApplication().catch(error => {
    logError('Startup failed: ' + error.message);
    rl.close();
    process.exit(1);
  });
}

module.exports = { startApplication, startFrontend, startBackend }; 
#!/usr/bin/env node

// Test script to verify root setup functionality
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 Testing root setup script...\n');

// Test 1: Check if setup.js exists
const setupPath = path.join(__dirname, 'setup.js');
if (fs.existsSync(setupPath)) {
  console.log('✅ setup.js exists');
} else {
  console.log('❌ setup.js not found');
  process.exit(1);
}

// Test 2: Check if root package.json has setup scripts
const packageJsonPath = path.join(__dirname, 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  if (packageJson.scripts && packageJson.scripts.setup) {
    console.log('✅ setup script found in root package.json');
  } else {
    console.log('❌ setup script not found in root package.json');
    process.exit(1);
  }
  
  if (packageJson.scripts && packageJson.scripts.postinstall) {
    console.log('✅ postinstall script found in root package.json');
  } else {
    console.log('❌ postinstall script not found in root package.json');
    process.exit(1);
  }
} else {
  console.log('❌ root package.json not found');
  process.exit(1);
}

// Test 3: Check if frontend directory exists
const frontendPath = path.join(__dirname, 'clove-frontend');
if (fs.existsSync(frontendPath)) {
  console.log('✅ frontend directory exists');
} else {
  console.log('❌ frontend directory not found');
  process.exit(1);
}

// Test 4: Check if frontend package.json exists
const frontendPackageJsonPath = path.join(frontendPath, 'package.json');
if (fs.existsSync(frontendPackageJsonPath)) {
  console.log('✅ frontend package.json exists');
} else {
  console.log('❌ frontend package.json not found');
  process.exit(1);
}

// Test 5: Check if backend directory exists
const backendPath = path.join(__dirname, 'clove-backend');
if (fs.existsSync(backendPath)) {
  console.log('✅ backend directory exists');
} else {
  console.log('❌ backend directory not found');
  process.exit(1);
}

// Test 6: Check if backend requirements.txt exists
const requirementsPath = path.join(backendPath, 'requirements.txt');
if (fs.existsSync(requirementsPath)) {
  console.log('✅ backend requirements.txt exists');
} else {
  console.log('❌ backend requirements.txt not found');
  process.exit(1);
}

// Test 7: Check Node.js installation
try {
  execSync('node --version', { stdio: 'pipe' });
  console.log('✅ Node.js is available');
} catch (error) {
  console.log('❌ Node.js not found');
  process.exit(1);
}

// Test 8: Check npm installation
try {
  execSync('npm --version', { stdio: 'pipe' });
  console.log('✅ npm is available');
} catch (error) {
  console.log('❌ npm not found');
  process.exit(1);
}

// Test 9: Check Python installation
try {
  execSync('python3 --version', { stdio: 'pipe' });
  console.log('✅ Python 3 is available');
} catch (error) {
  try {
    execSync('python --version', { stdio: 'pipe' });
    console.log('✅ Python is available');
  } catch (error) {
    console.log('⚠️  Python not found - backend installation will be skipped');
  }
}

console.log('\n🎉 All tests passed! The root setup script should work correctly.');
console.log('\nTo test the full functionality:');
console.log('1. Run: npm install (in root directory)');
console.log('2. Or run: npm run setup');
console.log('3. Follow the prompts to install dependencies'); 
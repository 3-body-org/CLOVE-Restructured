#!/usr/bin/env node

// CLOVE Backend Startup Script
// Refactored for clarity and maintainability.

const { spawn } = require('child_process');
const path = require('path');
const os = require('os');
const fs = require('fs');

const backendDir = path.join(__dirname, 'clove-backend');
const isWin = os.platform() === 'win32';
const unixUvicorn = path.join(backendDir, 'venv', 'bin', 'uvicorn');
const winUvicorn = path.join(backendDir, 'venv', 'Scripts', 'uvicorn.exe');

let uvicornPath;
if (fs.existsSync(winUvicorn)) {
  uvicornPath = winUvicorn;
} else if (fs.existsSync(unixUvicorn)) {
  uvicornPath = unixUvicorn;
} else {
  console.error('Could not find uvicorn in venv. Make sure the virtual environment is set up.');
  process.exit(1);
}

const args = [
  'app.main:app',
  '--reload',
  '--host',
  '0.0.0.0',
  '--port',
  '8000'
];

const proc = spawn(uvicornPath, args, {
  cwd: backendDir,
  stdio: 'inherit',
  shell: false
});

proc.on('exit', code => process.exit(code)); 
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
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function setupPgAdminServer() {
  log('\n🖥️  CLOVE pgAdmin Server Setup', 'bright');
  log('==============================', 'bright');
  
  const dbName = 'postgres';
  const dbUser = 'postgres';
  
  try {
    // Check if pgAdmin4 is installed
    try {
      execSync('pgadmin4 --version', { stdio: 'pipe' });
      log('✅ pgAdmin4 is installed', 'green');
    } catch (error) {
      log('❌ pgAdmin4 is not installed', 'red');
      log('Please install pgAdmin4 first:', 'yellow');
      log('  sudo pacman -S pgadmin4  # Arch Linux', 'cyan');
      log('  sudo apt-get install pgadmin4  # Ubuntu/Debian', 'cyan');
      log('  brew install pgadmin4  # macOS', 'cyan');
      return false;
    }
    
    // Create pgAdmin server configuration directory
    const homeDir = process.env.HOME || process.env.USERPROFILE;
    const pgAdminConfigDir = path.join(homeDir, '.pgadmin');
    const serversDir = path.join(pgAdminConfigDir, 'servers');
    
    if (!fs.existsSync(pgAdminConfigDir)) {
      fs.mkdirSync(pgAdminConfigDir, { recursive: true });
      log('✅ Created pgAdmin config directory', 'green');
    }
    if (!fs.existsSync(serversDir)) {
      fs.mkdirSync(serversDir, { recursive: true });
      log('✅ Created servers directory', 'green');
    }
    
    // Create server configuration file
    const serverConfig = {
      "Servers": {
        "1": {
          "Name": "PostgreSQL 17",
          "Group": "Servers",
          "Host": "localhost",
          "Port": 5432,
          "MaintenanceDB": dbName,
          "Username": dbUser,
          "SSLMode": "prefer",
          "SSLCert": "<STORAGE_DIR>/.postgresql/postgresql.crt",
          "SSLKey": "<STORAGE_DIR>/.postgresql/postgresql.key",
          "SSLCompression": 0,
          "Timeout": 10,
          "UseSSHTunnel": 0,
          "TunnelHost": "",
          "TunnelPort": "22",
          "TunnelUsername": "",
          "TunnelAuthentication": 0
        }
      }
    };
    
    const serverConfigPath = path.join(serversDir, '1', 'servers.json');
    fs.mkdirSync(path.dirname(serverConfigPath), { recursive: true });
    fs.writeFileSync(serverConfigPath, JSON.stringify(serverConfig, null, 2));
    
    log('✅ pgAdmin server configuration created successfully!', 'green');
    log('\n📋 Server Details:', 'cyan');
    log(`• Server Name: PostgreSQL 17`, 'reset');
    log(`• Host: localhost:5432`, 'reset');
    log(`• MaintenanceDB: ${dbName}`, 'reset');
    log(`• Username: ${dbUser}`, 'reset');
    log(`• Config File: ${serverConfigPath}`, 'reset');
    
    log('\n🎉 Next steps:', 'cyan');
    log('1. Start pgAdmin4:', 'yellow');
    log('   pgadmin4', 'cyan');
    log('2. Open browser to: http://localhost:5050', 'yellow');
    log('3. The "PostgreSQL 17" server should appear in the left panel', 'yellow');
    log('4. Click on it and enter the password when prompted', 'yellow');
    
    return true;
  } catch (error) {
    log('❌ Failed to setup pgAdmin server configuration', 'red');
    log('Error details:', 'yellow');
    console.error(error.message);
    return false;
  }
}

if (require.main === module) {
  setupPgAdminServer();
}

module.exports = { setupPgAdminServer }; 
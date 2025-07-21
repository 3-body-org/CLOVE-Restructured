const { execSync } = require('child_process');
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
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function question(rl, query) {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

async function setupPgAdminServer() {
  log('\n🖥️  CLOVE pgAdmin Server Setup', 'bright');
  log('==============================', 'bright');

  const serverName = 'PostgreSQL 17';
  const serverGroup = 'Servers';
  const host = 'localhost';
  const port = 5432;
  const maintenanceDB = 'postgres';
  const adminUser = 'postgres';

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
          "Name": serverName,
          "Group": serverGroup,
          "Host": host,
          "Port": port,
          "MaintenanceDB": maintenanceDB,
          "Username": adminUser,
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
    log(`• Server Name: ${serverName}`, 'reset');
    log(`• Host: ${host}:${port}`, 'reset');
    log(`• MaintenanceDB: ${maintenanceDB}`, 'reset');
    log(`• Username: ${adminUser}`, 'reset');
    log(`• Config File: ${serverConfigPath}`, 'reset');

    // Prompt user for next action
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    let choice;
    const validChoices = ['1', '2', '3'];
    log('\nWhat would you like to do next?', 'yellow');
    log('  1. Only create the pgAdmin server entry (recommended for manual DB/user setup)', 'cyan');
    log('  2. Also create clove_user role and clove_db database with privileges (scripted)', 'cyan');
    log('  3. Skip scripted DB/user creation and show manual instructions', 'cyan');
    do {
      choice = (await question(rl, 'Enter your choice (1/2/3): ')).trim();
      if (!validChoices.includes(choice)) {
        log('❌ Invalid option! Please enter 1, 2, or 3.', 'red');
      }
    } while (!validChoices.includes(choice));

    if (choice === '2') {
      // Scripted DB/user creation
      const dbUser = 'clove_user';
      const dbPassword = 'clove_password_2024'; // You may prompt for this or randomize
      const dbName = 'clove_db';
      try {
        // Create clove_user role
        log('\n🔑 Creating clove_user role...', 'yellow');
        execSync(`psql -U postgres -c "DO $$ BEGIN IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = '${dbUser}') THEN CREATE ROLE ${dbUser} LOGIN PASSWORD '${dbPassword}'; END IF; END $$;"`, { stdio: 'inherit' });
        // Grant privileges (customize as needed)
        execSync(`psql -U postgres -c "ALTER ROLE ${dbUser} CREATEDB;"`, { stdio: 'inherit' });
        log('✅ clove_user role created and granted CREATEDB', 'green');
        // Create clove_db database owned by clove_user
        log('🗄️  Creating clove_db database...', 'yellow');
        execSync(`psql -U postgres -c "DO $$ BEGIN IF NOT EXISTS (SELECT FROM pg_database WHERE datname = '${dbName}') THEN CREATE DATABASE ${dbName} OWNER ${dbUser}; END IF; END $$;"`, { stdio: 'inherit' });
        log('✅ clove_db database created and owned by clove_user', 'green');
        // Grant all privileges
        execSync(`psql -U postgres -d ${dbName} -c "GRANT ALL PRIVILEGES ON DATABASE ${dbName} TO ${dbUser};"`, { stdio: 'inherit' });
        execSync(`psql -U postgres -d ${dbName} -c "GRANT ALL PRIVILEGES ON SCHEMA public TO ${dbUser};"`, { stdio: 'inherit' });
        log('✅ All privileges granted to clove_user on clove_db', 'green');
        log('\n🎉 Scripted DB/user setup complete!', 'green');
        log(`• Username: ${dbUser}`, 'reset');
        log(`• Password: ${dbPassword}`, 'reset');
        log(`• Database: ${dbName}`, 'reset');
      } catch (err) {
        log('❌ Error during scripted DB/user creation', 'red');
        log('Error details:', 'yellow');
        console.error(err.message);
      }
    } else if (choice === '3') {
      // Manual instructions
      log('\n📝 Manual Setup Instructions:', 'cyan');
      log('1. Open pgAdmin4 and connect to the "PostgreSQL 17" server as user "postgres".', 'yellow');
      log('2. In the left panel, right-click Login/Group Roles > Create > Login/Group Role...', 'yellow');
      log('   - Name: clove_user', 'reset');
      log('   - Set password and assign privileges as needed (see documentation/screenshots).', 'reset');
      log('3. Right-click Databases > Create > Database...', 'yellow');
      log('   - Name: clove_db', 'reset');
      log('   - Owner: clove_user', 'reset');
      log('4. Grant all privileges on clove_db to clove_user as needed.', 'yellow');
      log('5. Continue with migrations and seeding as usual.', 'yellow');
      log('\nFor more details, see SETUP_GUIDE.md or the project documentation.', 'cyan');
    } else {
      log('\n✅ Only the pgAdmin server entry was created. You can now use pgAdmin4 to manage roles and databases.', 'green');
    }
    rl.close();
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
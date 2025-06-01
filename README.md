## Installation Steps

Create the project using Vite:

```bash
npm create vite@latest clove
```

Navigate into the project directory:

```bash
cd clove
```

Install dependencies:
```bash
npm install
```

Install required packages:
```bash
npm install bootstrap react-bootstrap
sass react-dom react-router-dom recharts
framer-motion canvas-confetti
@fortawesome/fontawesome-svg-core
@fortawesome/free-solid-svg-icons
@fortawesome/react-fontawesome
```

## Running the Project

To start the development server, use:
```bash
npm run dev
```

The project should now be running successfully. Access it via the provided local development URL.

## Accessing AWS RDS Database

To access the Database without pgAdmin, use the AWS CloudShell:


![image](https://github.com/user-attachments/assets/01ad7223-0729-4cc0-b227-399bf42060b3)


Install postgresql
```bash
sudo dnf install postgresql17 -y
```

Then connect to RDS:
```bash
psql -h YOUR_RDS_ENDPOINT.rds.amazonaws.com -U YOUR_USERNAME -d YOUR_DB_NAME
```


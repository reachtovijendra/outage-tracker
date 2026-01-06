const fs = require('fs');
const path = require('path');

// Environment configuration for Vercel deployment
// Uses environment variables if available, otherwise uses defaults
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || 'AIzaSyCPCTaT3Q7NIob4BLYGto6oVQp1TeGHec8',
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || 'outage-tracker-ec98a.firebaseapp.com',
  projectId: process.env.FIREBASE_PROJECT_ID || 'outage-tracker-ec98a',
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'outage-tracker-ec98a.firebasestorage.app',
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '1000052466768',
  appId: process.env.FIREBASE_APP_ID || '1:1000052466768:web:0bc57e32eef4ab83ebdd55',
  measurementId: process.env.FIREBASE_MEASUREMENT_ID || 'G-ZLLSHKSQNT'
};

const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';

const envContent = `export const environment = {
  production: ${isProduction},
  firebase: {
    apiKey: '${firebaseConfig.apiKey}',
    authDomain: '${firebaseConfig.authDomain}',
    projectId: '${firebaseConfig.projectId}',
    storageBucket: '${firebaseConfig.storageBucket}',
    messagingSenderId: '${firebaseConfig.messagingSenderId}',
    appId: '${firebaseConfig.appId}',
    measurementId: '${firebaseConfig.measurementId}'
  }
};
`;

const envDir = path.join(__dirname, '..', 'src', 'environments');

// Create environments directory if it doesn't exist
if (!fs.existsSync(envDir)) {
  fs.mkdirSync(envDir, { recursive: true });
}

// Write environment.ts
fs.writeFileSync(path.join(envDir, 'environment.ts'), envContent);
console.log('Created environment.ts');

// Write environment.prod.ts
const prodContent = envContent.replace('production: false', 'production: true');
fs.writeFileSync(path.join(envDir, 'environment.prod.ts'), envContent.replace(`production: ${isProduction}`, 'production: true'));
console.log('Created environment.prod.ts');

console.log('Environment files created successfully!');


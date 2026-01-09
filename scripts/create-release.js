/**
 * Script to automatically create a release entry with a Playwright screenshot
 * 
 * Usage: node scripts/create-release.js "Change summary" "path/to/screenshot.png"
 * 
 * This script:
 * 1. Copies the screenshot to public/screenshots/ folder (served by Vercel)
 * 2. Creates a release entry in Firestore with the screenshot URL
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, Timestamp } = require('firebase/firestore');
const fs = require('fs');
const path = require('path');

// Firebase configuration - same as in environment.ts
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "AIzaSyCPCTaT3Q7NIob4BLYGto6oVQp1TeGHec8",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "outage-tracker-ec98a.firebaseapp.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "outage-tracker-ec98a",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "outage-tracker-ec98a.firebasestorage.app",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "1000052466768",
  appId: process.env.FIREBASE_APP_ID || "1:1000052466768:web:0bc57e32eef4ab83ebdd55"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Screenshots directory (in src/assets for Angular - served at /assets/)
const SCREENSHOTS_DIR = path.join(__dirname, '..', 'src', 'assets', 'screenshots');

async function createRelease(changeSummary, screenshotPath) {
  try {
    console.log('📸 Creating release entry...');
    console.log(`   Summary: ${changeSummary}`);
    console.log(`   Screenshot: ${screenshotPath || 'none'}`);

    let screenshotUrl = null;

    // Copy screenshot to public folder if provided
    if (screenshotPath && fs.existsSync(screenshotPath)) {
      console.log('📁 Copying screenshot to src/assets/screenshots/...');
      
      // Ensure screenshots directory exists
      if (!fs.existsSync(SCREENSHOTS_DIR)) {
        fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
      }
      
      const fileName = path.basename(screenshotPath);
      const timestamp = Date.now();
      const newFileName = `${timestamp}_${fileName}`;
      const destPath = path.join(SCREENSHOTS_DIR, newFileName);
      
      fs.copyFileSync(screenshotPath, destPath);
      
      // URL will be relative - served from /assets/screenshots/
      screenshotUrl = `/assets/screenshots/${newFileName}`;
      console.log('✅ Screenshot copied successfully');
      console.log(`   Local path: ${destPath}`);
    } else if (screenshotPath) {
      console.warn(`⚠️  Screenshot file not found: ${screenshotPath}`);
    }

    // Create release entry in Firestore
    console.log('📝 Creating release entry in Firestore...');
    
    const releasesRef = collection(db, 'releases');
    const docRef = await addDoc(releasesRef, {
      changeSummary: changeSummary,
      deploymentTime: Timestamp.now(),
      screenshotUrl: screenshotUrl,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });

    console.log('✅ Release created successfully!');
    console.log(`   Document ID: ${docRef.id}`);
    if (screenshotUrl) {
      console.log(`   Screenshot URL: ${screenshotUrl}`);
      console.log('');
      console.log('📌 Remember to commit the screenshot:');
      console.log(`   git add src/assets/screenshots/`);
    }

    return { id: docRef.id, screenshotUrl };
  } catch (error) {
    console.error('❌ Error creating release:', error);
    throw error;
  }
}

// CLI entry point
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 1) {
    console.log('Usage: node scripts/create-release.js "Change summary" [screenshot-path]');
    console.log('');
    console.log('Examples:');
    console.log('  node scripts/create-release.js "Added new feature"');
    console.log('  node scripts/create-release.js "Fixed bug" ".playwright-mcp/screenshot.png"');
    process.exit(1);
  }

  const changeSummary = args[0];
  const screenshotPath = args[1] || null;

  try {
    await createRelease(changeSummary, screenshotPath);
    process.exit(0);
  } catch (error) {
    process.exit(1);
  }
}

main();

// Export for use as module
module.exports = { createRelease };


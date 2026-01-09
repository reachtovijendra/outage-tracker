const { chromium } = require('C:\\Users\\vijendra.tadavarthy\\AppData\\Roaming\\npm\\node_modules\\@executeautomation\\playwright-mcp-server\\node_modules\\playwright');
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, Timestamp } = require('firebase/firestore');
const path = require('path');
const fs = require('fs');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAi-rGsMPu7-rBMPNHnLMr8l6zw4q8x-1o",
  authDomain: "outage-tracker-5c5bf.firebaseapp.com",
  projectId: "outage-tracker-5c5bf",
  storageBucket: "outage-tracker-5c5bf.firebasestorage.app",
  messagingSenderId: "619028991187",
  appId: "1:619028991187:web:0d8e0c21f7b3636e9e9f17"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function createAutomatedRelease(changeSummary, url = 'http://localhost:4200') {
  console.log('Starting automated release process...');
  console.log(`Change: ${changeSummary}`);
  console.log(`URL: ${url}`);

  let browser;
  try {
    // Launch browser
    console.log('Launching browser...');
    browser = await chromium.launch({ 
      headless: false,
      channel: 'chrome'
    });
    
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 }
    });
    
    const page = await context.newPage();
    
    // Navigate to the app
    console.log('Navigating to app...');
    await page.goto(url, { 
      waitUntil: 'domcontentloaded',
      timeout: 60000 
    });
    await page.waitForTimeout(3000); // Wait for any animations/transitions
    
    // Take screenshot
    console.log('Taking screenshot...');
    const timestamp = Date.now();
    const screenshotFilename = `${timestamp}_${changeSummary.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}.png`;
    const screenshotDir = path.join(__dirname, '..', 'src', 'assets', 'screenshots');
    
    // Ensure screenshots directory exists
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }
    
    const screenshotPath = path.join(screenshotDir, screenshotFilename);
    await page.screenshot({ 
      path: screenshotPath,
      fullPage: true 
    });
    
    console.log(`Screenshot saved: ${screenshotPath}`);
    
    // Close browser
    await browser.close();
    
    // Create release entry in Firestore
    console.log('Creating release entry in Firestore...');
    const screenshotUrl = `/assets/screenshots/${screenshotFilename}`;
    
    const now = Timestamp.now();
    const releaseData = {
      changeSummary: changeSummary,
      deploymentTime: now,
      screenshotUrl: screenshotUrl,
      createdAt: now,
      updatedAt: now
    };
    
    const docRef = await addDoc(collection(db, 'releases'), releaseData);
    console.log(`Release created with ID: ${docRef.id}`);
    
    console.log('\n✅ Automated release process completed successfully!');
    console.log(`   Screenshot: ${screenshotUrl}`);
    console.log(`   Release ID: ${docRef.id}`);
    console.log(`   View at: ${url}/releases`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error during automated release:', error);
    if (browser) {
      await browser.close();
    }
    process.exit(1);
  }
}

// Get arguments from command line
const changeSummary = process.argv[2];
const url = process.argv[3] || 'http://localhost:4200';

if (!changeSummary) {
  console.error('Usage: node automated-release.js "Change summary" [url]');
  console.error('Example: node automated-release.js "Rollback title color" "http://localhost:4200"');
  process.exit(1);
}

createAutomatedRelease(changeSummary, url);

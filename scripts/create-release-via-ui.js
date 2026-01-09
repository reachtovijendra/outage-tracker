const { chromium } = require('C:\\Users\\vijendra.tadavarthy\\AppData\\Roaming\\npm\\node_modules\\@executeautomation\\playwright-mcp-server\\node_modules\\playwright');
const path = require('path');
const fs = require('fs');

async function createReleaseViaUI(changeSummary, url = 'http://localhost:4200') {
  console.log('Starting release creation via UI...');
  console.log(`Change: ${changeSummary}`);

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
    await page.waitForTimeout(3000);
    
    // Take screenshot
    console.log('Taking screenshot...');
    const timestamp = Date.now();
    const screenshotFilename = `${timestamp}_${changeSummary.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}.png`;
    const screenshotDir = path.join(__dirname, '..', 'src', 'assets', 'screenshots');
    
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }
    
    const screenshotPath = path.join(screenshotDir, screenshotFilename);
    await page.screenshot({ 
      path: screenshotPath,
      fullPage: true 
    });
    
    console.log(`Screenshot saved: ${screenshotPath}`);
    
    // Navigate to releases page
    console.log('Navigating to releases page...');
    await page.goto(`${url}/releases`, { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    await page.waitForTimeout(2000);
    
    // Click "Add Release" button
    console.log('Clicking Add Release button...');
    await page.click('button:has-text("Add Release")');
    await page.waitForTimeout(1000);
    
    // Fill in the form
    console.log('Filling in the form...');
    
    // Fill change summary
    await page.fill('#changeSummary', changeSummary);
    await page.waitForTimeout(500);
    
    // Upload screenshot
    console.log('Uploading screenshot...');
    const fileInput = await page.locator('#screenshot');
    await fileInput.setInputFiles(screenshotPath);
    await page.waitForTimeout(1000);
    
    // Click Add button
    console.log('Submitting the release...');
    await page.getByRole('button', { name: 'Add', exact: true }).click();
    await page.waitForTimeout(2000);
    
    console.log('\n✅ Release created via UI successfully!');
    console.log(`   Screenshot: /assets/screenshots/${screenshotFilename}`);
    console.log(`   View at: ${url}/releases`);
    
    // Keep browser open for 5 seconds to see the result
    await page.waitForTimeout(5000);
    
    await browser.close();
    process.exit(0);
  } catch (error) {
    console.error('Error during release creation:', error);
    if (browser) {
      await browser.close();
    }
    process.exit(1);
  }
}

const changeSummary = process.argv[2];
const url = process.argv[3] || 'http://localhost:4200';

if (!changeSummary) {
  console.error('Usage: node create-release-via-ui.js "Change summary" [url]');
  process.exit(1);
}

createReleaseViaUI(changeSummary, url);


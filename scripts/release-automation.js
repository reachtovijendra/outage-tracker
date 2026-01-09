const { chromium } = require('C:\\Users\\vijendra.tadavarthy\\AppData\\Roaming\\npm\\node_modules\\@executeautomation\\playwright-mcp-server\\node_modules\\playwright');
const path = require('path');
const fs = require('fs');

async function automateRelease(changeSummary, url = 'http://localhost:4200') {
  console.log('🚀 Starting release automation...');
  console.log(`📝 Change: ${changeSummary}`);

  let browser;
  try {
    // Launch browser
    browser = await chromium.launch({ 
      headless: false,
      channel: 'chrome'
    });
    
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 }
    });
    
    const page = await context.newPage();
    
    // Step 1: Navigate and wait for Angular to reload with changes
    console.log('📸 Taking screenshot...');
    await page.goto(url, { 
      waitUntil: 'domcontentloaded',
      timeout: 60000 
    });
    // Wait longer for Angular dev server to recompile and hot-reload
    console.log('⏳ Waiting for Angular to reload with changes...');
    await page.waitForTimeout(8000);
    
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
    
    console.log(`✅ Screenshot saved: ${screenshotFilename}`);
    
    // Step 2: Navigate to releases page
    console.log('🔄 Navigating to releases page...');
    await page.goto(`${url}/releases`, { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    await page.waitForTimeout(2000);
    
    // Step 3: Click Add Release
    console.log('➕ Opening Add Release dialog...');
    await page.click('button:has-text("Add Release")');
    await page.waitForTimeout(1000);
    
    // Step 4: Fill form
    console.log('✍️  Filling form...');
    await page.fill('#changeSummary', changeSummary);
    await page.waitForTimeout(500);
    
    // Step 5: Upload screenshot
    console.log('📤 Uploading screenshot...');
    await page.locator('#screenshot').setInputFiles(screenshotPath);
    await page.waitForTimeout(1000);
    
    // Step 6: Submit
    console.log('💾 Submitting release...');
    await page.getByRole('button', { name: 'Add', exact: true }).click();
    await page.waitForTimeout(3000);
    
    console.log('\n🎉 Release automation complete!');
    console.log(`   📊 View at: ${url}/releases`);
    
    await browser.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (browser) {
      await browser.close();
    }
    process.exit(1);
  }
}

const changeSummary = process.argv[2];
const url = process.argv[3] || 'http://localhost:4200';

if (!changeSummary) {
  console.error('Usage: node release-automation.js "Change summary" [url]');
  console.error('Example: node release-automation.js "Fixed bug in login"');
  process.exit(1);
}

automateRelease(changeSummary, url);


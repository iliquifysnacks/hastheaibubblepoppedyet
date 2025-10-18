// Simple script to generate OG image using Puppeteer
// Run: npm install puppeteer && node generate-og-image.js

const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Set viewport to OG image dimensions
  await page.setViewport({
    width: 1200,
    height: 630,
    deviceScaleFactor: 2 // For retina displays
  });

  // Load the og-image.html file
  await page.goto(`file://${path.join(__dirname, 'og-image.html')}`, {
    waitUntil: 'networkidle0'
  });

  // Take screenshot
  await page.screenshot({
    path: 'og-image.png',
    type: 'png'
  });

  console.log('✅ OG image generated: og-image.png');

  await browser.close();
})();

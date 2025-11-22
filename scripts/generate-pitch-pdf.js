#!/usr/bin/env node

/**
 * Convert pitch-deck.html to PDF
 * Usage: node scripts/generate-pitch-pdf.js
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function generatePDF() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  const htmlPath = path.join(__dirname, '../pitch-deck.html');
  const pdfPath = path.join(__dirname, '../CSVToChain-Pitch-Deck.pdf');
  
  // Read HTML file
  const html = fs.readFileSync(htmlPath, 'utf-8');
  
  // Set content
  await page.setContent(html, { waitUntil: 'networkidle0' });
  
  // Generate PDF
  await page.pdf({
    path: pdfPath,
    format: 'A4',
    margin: {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0
    },
    printBackground: true,
  });
  
  await browser.close();
  
  console.log(`✅ PDF generated: ${pdfPath}`);
  console.log(`📊 File size: ${(fs.statSync(pdfPath).size / 1024 / 1024).toFixed(2)} MB`);
}

generatePDF().catch(console.error);

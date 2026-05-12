const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const ROUTES = [
  { path: '/', name: 'Home' },
  { path: '/login', name: 'Login' },
  { path: '/register', name: 'Register' },
  { path: '/dashboard', name: 'Dashboard' },
  { path: '/conferences', name: 'Conferences' },
  { path: '/submissions', name: 'Submissions' },
  { path: '/submissions/new', name: 'New Submission' },
  { path: '/reviews', name: 'Reviews' }
];

const BASE_URL = 'http://localhost:3000';
const DOCS_DIR = path.join(__dirname, 'docs');
const IMAGES_DIR = path.join(DOCS_DIR, 'images');

async function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function takeScreenshots() {
  console.log('Starting documentation generation...');
  ensureDir(IMAGES_DIR);

  let markdownContent = '# Application Documentation\n\n';
  markdownContent += 'This document contains screenshots of all sections and pages in the application.\n\n';

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Set viewport for consistent screenshots
  await page.setViewport({ width: 1280, height: 800 });

  for (const route of ROUTES) {
    console.log(`Processing ${route.name}...`);
    try {
      await page.goto(`${BASE_URL}${route.path}`, { waitUntil: 'networkidle0', timeout: 10000 });
      
      const fileName = `${route.name.toLowerCase().replace(/\s+/g, '-')}.png`;
      const filePath = path.join(IMAGES_DIR, fileName);
      
      await page.screenshot({ path: filePath, fullPage: true });
      
      markdownContent += `## ${route.name}\n\n`;
      markdownContent += `Path: \`${route.path}\`\n\n`;
      markdownContent += `![${route.name}](./images/${fileName})\n\n`;
      
      console.log(`✓ Saved screenshot for ${route.name}`);
    } catch (error) {
      console.error(`✗ Failed to process ${route.name}:`, error.message);
    }
  }

  await browser.close();

  const mdFilePath = path.join(DOCS_DIR, 'documentation.md');
  fs.writeFileSync(mdFilePath, markdownContent);
  console.log(`\nDocumentation successfully generated at: ${mdFilePath}`);
}

takeScreenshots().catch(console.error);

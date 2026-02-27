#!/usr/bin/env node
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SITE_URL = 'https://yonkoo11.github.io/last-rally/';
const OUTPUT_DIR = path.join(__dirname, 'real-captures');

// Mock Solana wallet for devtools
const WALLET_MOCK = `
window.solana = {
  isPhantom: true,
  publicKey: {
    toString: () => 'DevnetWalletMock1111111111111111111111111111',
    toBase58: () => 'DevnetWalletMock1111111111111111111111111111'
  },
  connect: async () => ({ publicKey: window.solana.publicKey }),
  disconnect: async () => {},
  signTransaction: async (tx) => tx,
  signAllTransactions: async (txs) => txs,
  on: () => {},
  removeListener: () => {},
  isConnected: true
};

window.dispatchEvent(new Event('solana#initialized'));
console.log('✅ Wallet mock injected');
`;

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function captureRealSite() {
  console.log('🎬 Last Rally - Real Site Capture\n');
  console.log('🌐 Launching browser...');

  const browser = await puppeteer.launch({
    headless: false, // Show browser so we can see what's happening
    defaultViewport: { width: 1920, height: 1080 },
    args: ['--window-size=1920,1080']
  });

  const page = await browser.newPage();

  // Create output directory
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  try {
    console.log('🔧 Navigating to site...');
    await page.goto(SITE_URL, { waitUntil: 'networkidle0' });
    await sleep(1000);

    // Inject wallet mock
    console.log('💉 Injecting wallet mock...');
    await page.evaluate(WALLET_MOCK);
    await sleep(500);

    // CAPTURE 1: Landing page
    console.log('\n📸 [1/8] Landing page...');
    await sleep(1000);
    await page.screenshot({
      path: path.join(OUTPUT_DIR, '01-landing.png'),
      type: 'png'
    });

    // Click PLAY button
    console.log('🎮 Clicking PLAY...');
    await page.click('button');
    await sleep(1500);

    // CAPTURE 2: Welcome/Mode Select screen
    console.log('📸 [2/8] Mode select screen...');
    await page.screenshot({
      path: path.join(OUTPUT_DIR, '02-mode-select.png'),
      type: 'png'
    });

    // Click "START PLAYING" to get to mode select
    console.log('🎮 Clicking START PLAYING...');
    const buttons = await page.$$('button');
    if (buttons.length > 0) {
      await buttons[0].click();
      await sleep(1500);
    }

    // CAPTURE 3: Mode selection (showing Wager Match option)
    console.log('📸 [3/8] Mode selection with Wager Match...');
    await page.screenshot({
      path: path.join(OUTPUT_DIR, '03-wager-mode.png'),
      type: 'png'
    });

    // Try to click Wager Match (may require wallet)
    console.log('🎮 Attempting to access Wager Match...');
    const wagerButtons = await page.$$('button');
    for (const btn of wagerButtons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text && text.includes('Wager')) {
        await btn.click();
        await sleep(2000);
        break;
      }
    }

    // CAPTURE 4: Wager UI (if accessible)
    console.log('📸 [4/8] Wager interface...');
    await page.screenshot({
      path: path.join(OUTPUT_DIR, '04-wager-ui.png'),
      type: 'png'
    });

    // Try to access Solo Play for gameplay capture
    console.log('🎮 Navigating to Solo Play for gameplay...');
    await page.goto(SITE_URL, { waitUntil: 'networkidle0' });
    await sleep(1000);
    await page.click('button'); // PLAY
    await sleep(1500);

    const playButtons = await page.$$('button');
    if (playButtons.length > 0) {
      await playButtons[0].click(); // START PLAYING
      await sleep(1500);
    }

    // Look for Solo Play option
    const soloButton = await page.$$('button');
    for (const btn of soloButton) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text && text.includes('Solo')) {
        await btn.click();
        await sleep(2000);
        break;
      }
    }

    // CAPTURE 5: Gameplay - Initial state
    console.log('📸 [5/8] Gameplay - Start...');
    await page.screenshot({
      path: path.join(OUTPUT_DIR, '05-gameplay-start.png'),
      type: 'png'
    });

    // Simulate gameplay by pressing keys
    console.log('🎮 Simulating gameplay (5 seconds)...');

    // Start the game if needed (press Enter)
    await page.keyboard.press('Enter');
    await sleep(500);

    // Simulate realistic gameplay
    for (let i = 0; i < 10; i++) {
      // Random paddle movements
      if (Math.random() > 0.5) {
        await page.keyboard.down('w');
        await sleep(200);
        await page.keyboard.up('w');
      } else {
        await page.keyboard.down('s');
        await sleep(200);
        await page.keyboard.up('s');
      }

      if (Math.random() > 0.5) {
        await page.keyboard.down('ArrowUp');
        await sleep(200);
        await page.keyboard.up('ArrowUp');
      } else {
        await page.keyboard.down('ArrowDown');
        await sleep(200);
        await page.keyboard.up('ArrowDown');
      }

      await sleep(300);
    }

    // CAPTURE 6: Gameplay - Mid-game
    console.log('📸 [6/8] Gameplay - In progress...');
    await page.screenshot({
      path: path.join(OUTPUT_DIR, '06-gameplay-action.png'),
      type: 'png'
    });

    // Continue gameplay
    await sleep(2000);

    // CAPTURE 7: Gameplay - Late game
    console.log('📸 [7/8] Gameplay - Late game...');
    await page.screenshot({
      path: path.join(OUTPUT_DIR, '07-gameplay-late.png'),
      type: 'png'
    });

    // CAPTURE 8: Check if there's a settings/about screen showing program ID
    console.log('📸 [8/8] Looking for program ID/settings...');
    await page.keyboard.press('Escape'); // Try to exit game
    await sleep(1000);
    await page.screenshot({
      path: path.join(OUTPUT_DIR, '08-program-info.png'),
      type: 'png'
    });

    console.log('\n✅ All captures complete!');
    console.log(`📁 Saved to: ${OUTPUT_DIR}`);
    console.log('\n📋 Captured screens:');
    const files = fs.readdirSync(OUTPUT_DIR).filter(f => f.endsWith('.png'));
    files.forEach((f, i) => console.log(`  ${i + 1}. ${f}`));

  } catch (error) {
    console.error('❌ Error during capture:', error);
  } finally {
    console.log('\n🔍 Review captures before closing browser...');
    console.log('Press Ctrl+C when done reviewing');

    // Keep browser open for review
    await sleep(30000); // 30 seconds to review
    await browser.close();
  }
}

captureRealSite().catch(console.error);

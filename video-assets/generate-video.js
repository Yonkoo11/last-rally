#!/usr/bin/env node
import fs from 'fs';
import { exec } from 'child_process';
import util from 'util';
import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const execPromise = util.promisify(exec);

const slides = [
    { file: 'slide-01-landing.html', duration: 10.0, name: '01-landing' },
    { file: 'slide-02-problem.html', duration: 15.0, name: '02-problem' },
    { file: 'slide-03-solution.html', duration: 10.0, name: '03-solution' },
    { file: 'slide-bonk-selector.html', duration: 5.0, name: '04-bonk-selector' },
    { file: 'slide-bonk-cosmetics.html', duration: 5.0, name: '05-bonk-cosmetics' },
    { file: 'slide-architecture.html', duration: 10.0, name: '06-architecture' },
    { file: 'slide-title-card.html', duration: 5.0, name: '07-title-card' },
];

async function captureSlides() {
    console.log('🎬 Last Rally - Video Generation\n');

    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    if (!fs.existsSync('frames')) {
        fs.mkdirSync('frames');
    }

    for (const slide of slides) {
        console.log(`📸 Capturing: ${slide.name}...`);
        const filePath = `file://${__dirname}/${slide.file}`;
        await page.goto(filePath, { waitUntil: 'networkidle0' });
        await page.screenshot({
            path: `frames/frame-${slide.name}.png`,
            type: 'png'
        });
    }

    await browser.close();
    console.log('\n✅ All slides captured!\n');
}

async function compileVideo() {
    console.log('🎞️  Compiling video with ffmpeg...\n');

    // Create concat file for ffmpeg
    let concatContent = '';
    for (const slide of slides) {
        concatContent += `file 'frames/frame-${slide.name}.png'\n`;
        concatContent += `duration ${slide.duration}\n`;
    }
    // Add last frame again for proper duration
    concatContent += `file 'frames/frame-07-title-card.png'\n`;

    fs.writeFileSync('frames/concat.txt', concatContent);

    // Compile video
    const ffmpegCmd = `ffmpeg -y \
        -f concat -safe 0 -i frames/concat.txt \
        -i narration.m4a \
        -c:v libx264 \
        -preset slow \
        -crf 18 \
        -pix_fmt yuv420p \
        -r 30 \
        -s 1920x1080 \
        -c:a aac \
        -b:a 192k \
        -shortest \
        -movflags +faststart \
        last-rally-demo-60sec.mp4`;

    try {
        const { stdout, stderr } = await execPromise(ffmpegCmd);
        console.log('✅ Video compiled successfully!\n');

        // Get video info
        const { stdout: probeOut } = await execPromise('ffprobe -v quiet -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 last-rally-demo-60sec.mp4');
        const duration = parseFloat(probeOut).toFixed(2);

        const stats = fs.statSync('last-rally-demo-60sec.mp4');
        const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);

        console.log('==========================================');
        console.log('📹 LAST RALLY DEMO VIDEO');
        console.log('==========================================');
        console.log(`File: last-rally-demo-60sec.mp4`);
        console.log(`Duration: ${duration}s`);
        console.log(`Size: ${fileSizeMB} MB`);
        console.log(`Resolution: 1920x1080 @ 30fps`);
        console.log('==========================================');
        console.log('\n✨ Ready for Graveyard Hackathon submission!');

    } catch (error) {
        console.error('Error during video compilation:', error);
        throw error;
    }
}

async function main() {
    try {
        await captureSlides();
        await compileVideo();
    } catch (error) {
        console.error('Fatal error:', error);
        process.exit(1);
    }
}

main();

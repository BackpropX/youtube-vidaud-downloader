import pkg from 'yt-dlp-exec';
import { existsSync, mkdirSync } from 'fs';
import path from 'path';
import ffmpegPath from 'ffmpeg-static';

const { exec } = pkg;

const audioUrl = process.argv[2];
if (!audioUrl) {
  console.error("ERROR: Please provide a YouTube URL.");
  console.log("Usage: node audiodownload.js <YOUTUBE_URL>");
  process.exit(1);
}

downloadAudio(audioUrl);

async function downloadAudio(url) {
  try {
    const downloadsFolder = 'downloads';
    if (!existsSync(downloadsFolder)) mkdirSync(downloadsFolder);

    console.log("Checking yt-dlp and ffmpeg installations...");
    if (!ffmpegPath) throw new Error("FFmpeg not found. Please install ffmpeg-static.");
    
    const outputTemplate = path.join(downloadsFolder, '%(title)s.%(ext)s');

    console.log("Downloading audio...");

    await exec(url, {
      extractAudio: true,
      audioFormat: 'mp3',
      audioQuality: '0',
      ffmpegLocation: ffmpegPath,
      output: outputTemplate,
      progress: true,
    });

    console.log(`\n Download complete in: ${downloadsFolder}`);
  } catch (error) {
    console.error("\n An error occurred:", error.message);
  }
}
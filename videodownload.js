import pkg from 'yt-dlp-exec';
const { exec: ytdlp } = pkg;
import { existsSync, mkdirSync } from 'fs';
import path from 'path';
import readline from 'readline';
import ffmpegPath from 'ffmpeg-static';

const videoUrl = process.argv[2];
if (!videoUrl) {
    console.error("ERROR: Please provide a YouTube URL.");
    console.log("Usage: node videodownload.js <YOUTUBE_URL>");
    process.exit(1);
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
const askQuestion = (q) => new Promise((resolve) => rl.question(q, resolve));

async function downloadVideo(url) {
    try {
        const downloadsFolder = 'downloads';
        if (!existsSync(downloadsFolder)) mkdirSync(downloadsFolder);

        console.log("Checking yt-dlp and ffmpeg installations...");
        if (!ffmpegPath) throw new Error("FFmpeg not found. Please install ffmpeg-static.");

        console.log("Fetching available formats...");
        const result = await ytdlp(url, {
            dumpSingleJson: true,
            skipDownload: true,
            noWarnings: true,
            ffmpegLocation: ffmpegPath,
        });

        const info = JSON.parse(result.stdout);
        const formats = info?.formats || [];

        if (!Array.isArray(formats) || formats.length === 0) {
            console.log(" No format list available. Downloading best available MP4 automatically...");
            const outputTemplate = path.join(downloadsFolder, '%(title)s.%(ext)s');

            await ytdlp(url, {
                format: 'bestvideo+bestaudio/best',
                mergeOutputFormat: 'mp4',
                ffmpegLocation: ffmpegPath,
                output: outputTemplate,
                postprocessorArgs: ['-c:v copy -c:a aac -b:a 192k'],
            });

            console.log(`\n Download complete in: ${downloadsFolder}`);
            return;
        }

        console.log(`\nAvailable video formats:\n`);
        
        const videoFormats = formats.filter(f => f.vcodec !== 'none' && f.height);
        const resolutionMap = new Map();
        
        videoFormats.forEach(f => {
            const res = f.height;
            if (!resolutionMap.has(res) || (f.tbr > resolutionMap.get(res).tbr)) {
                resolutionMap.set(res, {
                    id: f.format_id,
                    resolution: `${f.height}p`,
                    ext: f.ext,
                    tbr: f.tbr || 0
                });
            }
        });
        
        const filteredFormats = Array.from(resolutionMap.values())
            .sort((a, b) => parseInt(a.resolution) - parseInt(b.resolution));

        filteredFormats.forEach((f, i) =>
            console.log(`${i + 1}. ${f.resolution} (${f.ext})`)
        );

        const choice = await askQuestion('\nEnter the number of the desired resolution: ');
        rl.close();

        const selected = filteredFormats[parseInt(choice) - 1];
        if (!selected) {
            console.error("Invalid selection. Exiting...");
            process.exit(1);
        }

        const outputTemplate = path.join(downloadsFolder, '%(title)s.%(ext)s');
        console.log(`\nDownloading ${selected.resolution} video...`);

        await ytdlp(url, {
            format: `${selected.id}+bestaudio/best`,
            mergeOutputFormat: 'mp4',
            ffmpegLocation: ffmpegPath,
            output: outputTemplate,
            postprocessorArgs: ['-c:v copy -c:a aac -b:a 192k'],
        });

        console.log(`\n Download complete in: ${downloadsFolder}`);
    } catch (error) {
        console.error("\n An error occurred:", error.message);
    }
}

downloadVideo(videoUrl);
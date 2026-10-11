# YouTube Command-Line Downloader

A simple tool to download video or audio from YouTube directly from your terminal with quality selection.

## Features

- Download videos with quality selection (144p to 1080p+)
- Download audio in MP3 format
- Files are saved with the original YouTube video title
- Automatic format merging for best quality

## Prerequisites

- [Node.js](https://nodejs.org/) (version 14 or higher)
- [yt-dlp](https://github.com/yt-dlp/yt-dlp) (automatically used via yt-dlp-exec)

## Installation

1. **Clone the repository:**
    ```bash
    git clone https://github.com/BackpropX/youtube-video-downloader.git
    ```

2. **Install Dependencies:**
    ```bash
    cd youtube-video-downloader
    npm install
    ```

    > `npm install` will also automatically download the latest `yt-dlp` binary for your platform to keep it compatible with YouTube.

## Usage

### Download Video
To download a video with quality selection:
```bash
node videodownload.js <YouTube URL>
```
You'll be prompted to choose from available resolutions (144p, 240p, 360p, 480p, 720p, 1080p, etc.)

### Download Audio Only
To download just the audio (MP3 format):
```bash
node audiodownload.js <YouTube URL>
```

### Example Commands
```bash
# Download a video with quality selection
node videodownload.js https://www.youtube.com/watch?v=example123

# Download audio only
node audiodownload.js https://www.youtube.com/watch?v=example123
```

## Output
- Downloaded files are saved in the `downloads` folder
- Video files are in MP4 format
- Audio files are in MP3 format
- Files are named with the original YouTube video title

## Dependencies

This project uses only two packages:
- `yt-dlp-exec` - YouTube downloader wrapper
- `ffmpeg-static` - FFmpeg binary for audio/video processing
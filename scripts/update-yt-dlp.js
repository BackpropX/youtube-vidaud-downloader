import { createWriteStream, existsSync, chmodSync } from 'fs';
import { get } from 'https';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const platform = process.platform;

function getBinaryInfo() {
  switch (platform) {
    case 'win32':
      return { filename: 'yt-dlp.exe', url: 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe' };
    case 'darwin':
      return { filename: 'yt-dlp_macos', url: 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_macos' };
    default:
      return { filename: 'yt-dlp', url: 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp' };
  }
}

// Follows redirects recursively and resolves with the final response
function fetchWithRedirects(url, maxRedirects = 10) {
  return new Promise((resolve, reject) => {
    if (maxRedirects === 0) return reject(new Error('Too many redirects'));

    get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 307 || res.statusCode === 308) {
        const location = res.headers.location;
        res.resume(); // drain and discard
        fetchWithRedirects(location, maxRedirects - 1).then(resolve).catch(reject);
      } else {
        resolve(res);
      }
    }).on('error', reject);
  });
}

function downloadFile(url, destPath) {
  return new Promise(async (resolve, reject) => {
    try {
      const res = await fetchWithRedirects(url);

      if (res.statusCode !== 200) {
        return reject(new Error(`Failed to download: HTTP ${res.statusCode}`));
      }

      const file = createWriteStream(destPath);
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
      file.on('error', reject);
    } catch (err) {
      reject(err);
    }
  });
}

async function updateYtDlp() {
  const { filename, url } = getBinaryInfo();
  const binDir = join(__dirname, '..', 'node_modules', 'yt-dlp-exec', 'bin');
  const destPath = join(binDir, filename);

  if (!existsSync(binDir)) {
    console.log('yt-dlp-exec bin directory not found, skipping update.');
    return;
  }

  console.log(`Updating yt-dlp binary for ${platform}...`);

  try {
    await downloadFile(url, destPath);

    if (platform !== 'win32') {
      chmodSync(destPath, 0o755);
    }

    console.log(`yt-dlp updated successfully -> ${destPath}`);
  } catch (err) {
    console.warn(`Warning: Could not update yt-dlp binary: ${err.message}`);
    console.warn('The bundled version will be used instead.');
  }
}

updateYtDlp();

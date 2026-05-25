const https = require('https');
const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, 'assets', 'fonts');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const files = [
  {
    url: 'https://raw.githubusercontent.com/antijingoist/open-dyslexic/master/ttf/OpenDyslexic-Regular.ttf',
    name: 'OpenDyslexic-Regular.ttf'
  },
  {
    url: 'https://raw.githubusercontent.com/antijingoist/open-dyslexic/master/ttf/OpenDyslexic-Bold.ttf',
    name: 'OpenDyslexic-Bold.ttf'
  },
  {
    url: 'https://raw.githubusercontent.com/antijingoist/open-dyslexic/master/ttf/OpenDyslexic-Italic.ttf',
    name: 'OpenDyslexic-Italic.ttf'
  },
  {
    url: 'https://raw.githubusercontent.com/antijingoist/open-dyslexic/master/ttf/OpenDyslexic-BoldItalic.ttf',
    name: 'OpenDyslexic-BoldItalic.ttf'
  }
];

function download(file) {
  return new Promise((resolve) => {
    const dest = path.join(outDir, file.name);
    const req = https.get(file.url, (res) => {
      if (res.statusCode !== 200) {
        console.error(`Failed to download ${file.url} - status ${res.statusCode}`);
        res.resume();
        return resolve(false);
      }
      const fileStream = fs.createWriteStream(dest);
      res.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close();
        console.log(`Saved ${file.name}`);
        resolve(true);
      });
    });

    req.on('error', (err) => {
      console.error(`Request error for ${file.url}:`, err.message);
      resolve(false);
    });
  });
}

(async () => {
  let any = false;
  for (const f of files) {
    try {
      const ok = await download(f);
      any = any || ok;
    } catch (e) {
      console.error('Download exception', e.message);
    }
  }

  if (!any) {
    console.error('No fonts downloaded. Check your internet connection or the source URLs.\nYou can manually download from https://opendyslexic.org or the project repository.');
    process.exit(1);
  }
  console.log('Done.');
})();

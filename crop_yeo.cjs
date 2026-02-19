const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const brainDir = '/Users/Shinj/.gemini/antigravity/brain/7eec0a20-b8c0-4d78-8529-42b7787b9ea6';
const destDir = path.join(process.cwd(), 'public', 'images', 'avatars');

const srcName = 'yeo_gyeongrae_1771541018229.png';
const destName = 'yeo_gyeongrae.png';

(async () => {
    const srcPath = path.join(brainDir, srcName);
    const destPath = path.join(destDir, destName);
    const tempPath = path.join(destDir, `temp_${destName}`);

    try {
        fs.copyFileSync(srcPath, destPath);
        const imageBuffer = fs.readFileSync(destPath);

        // Use a wide crop starting from top 0 to preserve the tall hat
        await sharp(imageBuffer)
            .resize(1024, 1024)
            .toBuffer()
            .then(data => sharp(data)
                .extract({ width: 920, height: 1000, left: 52, top: 0 })
                .resize(1024, 1024)
                .toFile(tempPath)
            );

        fs.renameSync(tempPath, destPath);
        console.log(`✅ Restored and cropped ${destName}`);
    } catch (e) {
        console.error(`❌ Error on ${destName}:`, e.message);
    }
})();
